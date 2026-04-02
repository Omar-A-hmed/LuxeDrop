import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";
import { db } from "../firebase";
import { collection, onSnapshot, query, limit } from "firebase/firestore";
import { forbiddenKeywords, forbiddenNames, imageKeywords, livingBeingKeywords, religiousKeywords, statueKeywords } from "../constants/forbidden";
import { useCart } from "./CartContext";
import { GoogleGenAI, Type } from "@google/genai";
import { Loader2 } from "lucide-react";

const MARKUP_MULTIPLIER = 1.60; // 60% markup for profit margin

const imageRegex = new RegExp(`\\b(${imageKeywords.join('|')})\\b`, 'i');
const statueRegex = new RegExp(`\\b(${statueKeywords.join('|')})\\b`, 'i');
const livingBeingRegex = new RegExp(`\\b(${livingBeingKeywords.join('|')})\\b`, 'i');
const religiousRegex = new RegExp(`\\b(${religiousKeywords.join('|')})\\b`, 'i');

export default function ProductGrid() {
  const { searchQuery, setSearchQuery } = useCart();
  const [filter, setFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);
  const loaderRef = useRef<HTMLDivElement>(null);

  const [aiFilteredIds, setAiFilteredIds] = useState<string[] | null>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const searchCache = useRef<Record<string, string[]>>({});

  useEffect(() => {
    const queryStr = searchQuery.trim().toLowerCase();
    if (!queryStr) {
      setAiFilteredIds(null);
      return;
    }

    if (searchCache.current[queryStr]) {
      setAiFilteredIds(searchCache.current[queryStr]);
      return;
    }

    let isMounted = true;
    const performAiSearch = async () => {
      if (products.length === 0) return;
      
      setIsAiSearching(true);
      try {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY });
        
        const catalog = products.map(p => ({ id: p.id, name: p.name, category: p.category }));
        
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite-preview",
          contents: `You are an AI search assistant for an e-commerce store.
The user searched for: "${searchQuery}"

Here is the product catalog:
${JSON.stringify(catalog)}

Return a JSON array of product IDs that semantically match the search query. If the query is a category, return items in that category. If it's an object, return similar objects.
Only return the JSON array of strings.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        });

        if (isMounted) {
          try {
            const ids = JSON.parse(response.text || "[]");
            searchCache.current[queryStr] = ids;
            setAiFilteredIds(ids);
          } catch (e) {
            console.error("Failed to parse AI response", e);
            setAiFilteredIds(null);
          }
        }
      } catch (error) {
        console.error("AI Search failed", error);
        if (isMounted) setAiFilteredIds(null);
      } finally {
        if (isMounted) setIsAiSearching(false);
      }
    };

    const timeoutId = setTimeout(() => {
      performAiSearch();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [searchQuery, products]);

  useEffect(() => {
    const q = query(collection(db, 'products'), limit(4050));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const fetchedProducts = snapshot.docs.map((doc, index) => {
          const data = doc.data();
          let finalPrice = (data.baseCost || 0) * MARKUP_MULTIPLIER;
          
          // TEST OVERRIDE: Make the first product ₹1
          if (index === 0) {
            finalPrice = 1;
          }

          return {
            id: doc.id,
            ...data,
            numericPrice: finalPrice,
            price: `₹${finalPrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
          };
        });
        setProducts(fetchedProducts);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const name = (p.name || '').toLowerCase();
      const category = (p.category || '').toLowerCase();
      
      // Client-side filtering for forbidden items
      const isForbiddenName = forbiddenNames.some(fn => name.includes(fn.toLowerCase()));
      
      const isImage = imageRegex.test(name) || imageRegex.test(category);
      const isStatue = statueRegex.test(name) || statueRegex.test(category);
      const hasLivingBeing = livingBeingRegex.test(name) || livingBeingRegex.test(category);
      const isReligious = religiousRegex.test(name) || religiousRegex.test(category);

      if ((isImage && hasLivingBeing) || (isStatue && hasLivingBeing) || isReligious || isForbiddenName) {
        return false;
      }

      let matchesStatus = true;
      if (filter === "New") matchesStatus = p.isNew;
      if (filter === "Limited") matchesStatus = p.isLimited;
      
      let matchesCategory = true;
      if (categoryFilter !== "All") matchesCategory = p.category === categoryFilter;
      
      let matchesSearch = true;
      if (searchQuery) {
        if (aiFilteredIds !== null) {
          matchesSearch = aiFilteredIds.includes(p.id);
        } else {
          const query = searchQuery.toLowerCase();
          matchesSearch = name.includes(query) || category.includes(query);
        }
      }

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [products, filter, categoryFilter, searchQuery, aiFilteredIds]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(products.map(p => p.category))).filter(Boolean)];
  }, [products]);

  const loadMore = useCallback(() => {
    if (visibleCount < filteredProducts.length) {
      setVisibleCount(prev => prev + 12);
    }
  }, [visibleCount, filteredProducts.length]);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <section id="collection" className="py-24 px-6 md:px-12 bg-brand-dark relative overflow-hidden">
      {/* Background Ticker */}
      <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 pointer-events-none opacity-[0.03] z-0">
        <motion.div 
          className="flex whitespace-nowrap"
          animate={{ x: [0, "-50%"] }}
          transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
        >
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-[15vw] font-serif italic uppercase tracking-tighter px-12">
              LuxeDrop Collection — Limited Edition — 
            </span>
          ))}
        </motion.div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 relative z-10">
        <div className="max-w-xl">
          <h2 className="text-4xl md:text-5xl font-serif italic mb-6">
            The Curated Selection
          </h2>
          <p className="text-zinc-500 font-light leading-relaxed">
            Explore our latest arrivals, handpicked for their exceptional craftsmanship and timeless design. Each piece tells a story of dedication to quality.
          </p>
          {searchQuery && (
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm text-zinc-400">Showing results for: <strong className="text-white">"{searchQuery}"</strong></span>
              {isAiSearching && (
                <span className="text-xs text-brand-gold flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> AI is refining results...
                </span>
              )}
              <button 
                onClick={() => setSearchQuery("")}
                className="text-xs text-brand-gold hover:text-brand-gold/80 underline ml-2"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4 items-start md:items-end w-full md:w-auto">
          <div className="flex gap-4 flex-wrap">
            <button 
              onClick={() => { setFilter("All"); setVisibleCount(12); }}
              className={`px-6 py-2 border border-white/10 rounded-full text-xs uppercase tracking-widest transition-all ${filter === "All" ? "bg-white text-black" : "hover:bg-white hover:text-black"}`}
            >
              All
            </button>
            <button 
              onClick={() => { setFilter("New"); setVisibleCount(12); }}
              className={`px-6 py-2 border border-white/10 rounded-full text-xs uppercase tracking-widest transition-all ${filter === "New" ? "bg-white text-black" : "hover:bg-white hover:text-black"}`}
            >
              New
            </button>
            <button 
              onClick={() => { setFilter("Limited"); setVisibleCount(12); }}
              className={`px-6 py-2 border border-white/10 rounded-full text-xs uppercase tracking-widest transition-all ${filter === "Limited" ? "bg-white text-black" : "hover:bg-white hover:text-black"}`}
            >
              Limited
            </button>
          </div>
          
          <div className="flex gap-2 flex-wrap justify-start md:justify-end">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => { setCategoryFilter(category); setVisibleCount(12); }}
                className={`px-4 py-1.5 border border-white/5 rounded-full text-[10px] uppercase tracking-wider transition-all ${categoryFilter === category ? "bg-zinc-800 text-white border-zinc-700" : "text-zinc-400 hover:text-white hover:border-white/20"}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 border-4 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin"></div>
          <div className="text-zinc-500 font-serif italic">Loading collection...</div>
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="text-center py-24 text-zinc-500">
          <p className="text-xl font-serif italic mb-4">No products found in this category.</p>
          <p className="text-sm font-light">Try selecting a different filter or check back later.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-10 md:gap-x-8 md:gap-y-16">
            {displayedProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                id={product.id}
                name={product.name}
                price={product.price}
                numericPrice={product.numericPrice}
                baseCost={product.baseCost}
                category={product.category}
                images={product.images || []}
                video={product.video}
                onClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>

          {/* Sentinel for Infinite Scroll */}
          <div ref={loaderRef} className="h-24 flex items-center justify-center mt-12">
            {visibleCount < filteredProducts.length && (
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin"></div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Discovering more...</span>
              </div>
            )}
          </div>
        </>
      )}

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </section>
  );
}
