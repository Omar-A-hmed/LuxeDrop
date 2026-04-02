import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, Search, User, X, ArrowRight, Camera, Loader2 } from "lucide-react";
import { useCart } from "./CartContext";
import { GoogleGenAI } from "@google/genai";

export default function Navbar() {
  const { items, setIsCartOpen, searchQuery, setSearchQuery } = useCart();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsDetecting(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64String = (reader.result as string).split(',')[1];
        
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY });
        
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite-preview",
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: file.type,
                  data: base64String
                }
              },
              {
                text: "Identify the main object in this image. Respond with ONLY the name of the object in 1-3 words, suitable for a product search query. Do not include any punctuation or extra text."
              }
            ]
          }
        });

        const detectedItem = response.text?.trim() || "";
        if (detectedItem) {
          setSearchQuery(detectedItem);
          // Scroll to products
          document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
          setIsSearchOpen(false);
        }
      };
    } catch (error) {
      console.error("Error detecting item:", error);
      alert("Failed to detect item. Please try again.");
    } finally {
      setIsDetecting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const closeSearchAndScroll = () => {
    setIsSearchOpen(false);
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 glass"
      >
        <div className="flex items-center gap-8">
          <button onClick={() => setIsMenuOpen(true)} className="p-2 -m-2">
            <Menu className="w-5 h-5 cursor-pointer hover:text-brand-gold transition-colors" />
          </button>
          <div className="hidden md:flex gap-6 text-sm font-medium tracking-widest uppercase">
            <a href="#" className="hover:text-brand-gold transition-colors">Collections</a>
            <a href="#" className="hover:text-brand-gold transition-colors">Journal</a>
            <a href="#" className="hover:text-brand-gold transition-colors">About</a>
          </div>
        </div>

        <div className="text-2xl font-serif italic tracking-tighter shrink-0">LuxeDrop</div>

        <div className="flex items-center gap-6">
          <button onClick={() => setIsSearchOpen(true)} className="p-2 -m-2">
            <Search className="w-5 h-5 cursor-pointer hover:text-brand-gold transition-colors" />
          </button>
          <a href="/admin" title="Admin Dashboard" className="hover:text-brand-gold transition-colors p-2 -m-2">
            <User className="w-5 h-5 cursor-pointer" />
          </a>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative cursor-pointer group p-2 -m-2"
          >
          <ShoppingBag className="w-5 h-5 group-hover:text-brand-gold transition-colors" />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 bg-brand-gold text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </motion.nav>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <button 
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-8 right-8 p-2 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="w-full max-w-3xl">
              <div className="relative flex items-center">
                <Search className="absolute left-6 w-8 h-8 text-white/50" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={handleSearch}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      closeSearchAndScroll();
                    }
                  }}
                  placeholder="Search for objects, collections, or materials..." 
                  autoFocus
                  className="w-full bg-transparent border-b-2 border-white/20 text-2xl md:text-4xl py-6 pl-12 pr-16 md:pl-20 md:pr-24 focus:outline-none focus:border-brand-gold transition-colors font-serif italic placeholder:text-white/20 placeholder:not-italic placeholder:font-sans"
                />
                <div className="absolute right-6 flex items-center gap-4">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isDetecting}
                    className="p-2 text-white/50 hover:text-brand-gold transition-colors disabled:opacity-50"
                    title="Search by Image"
                  >
                    {isDetecting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                  </button>
                  <button 
                    onClick={closeSearchAndScroll}
                    className="p-2 text-brand-gold hover:text-brand-gold/80 transition-colors"
                  >
                    <ArrowRight className="w-8 h-8" />
                  </button>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
              </div>
              <div className="mt-12 flex gap-4 text-sm font-medium tracking-widest uppercase text-white/40">
                <span>Popular:</span>
                <button onClick={() => { setSearchQuery("Titanium"); closeSearchAndScroll(); }} className="hover:text-brand-gold transition-colors">Titanium</button>
                <button onClick={() => { setSearchQuery("Chronograph"); closeSearchAndScroll(); }} className="hover:text-brand-gold transition-colors">Chronograph</button>
                <button onClick={() => { setSearchQuery("Desk Objects"); closeSearchAndScroll(); }} className="hover:text-brand-gold transition-colors">Desk Objects</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-zinc-950 flex flex-col p-8 md:hidden"
          >
            <div className="flex justify-between items-center mb-16">
              <div className="text-2xl font-serif italic tracking-tighter shrink-0">LuxeDrop</div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 -m-2 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex flex-col gap-8 text-3xl font-serif italic">
              <a href="#" className="hover:text-brand-gold transition-colors">Collections</a>
              <a href="#" className="hover:text-brand-gold transition-colors">Journal</a>
              <a href="#" className="hover:text-brand-gold transition-colors">About</a>
              <a href="/admin" className="hover:text-brand-gold transition-colors">Admin Dashboard</a>
            </div>

            <div className="mt-auto pt-8 border-t border-white/10 flex flex-col gap-4 text-xs font-medium tracking-widest uppercase text-white/50">
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">Contact Us</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
