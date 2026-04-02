import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Heart, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useCart } from "./CartContext";

export default function ProductModal({ product, onClose }: { product: any, onClose: () => void }) {
  const { addToCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const images = product?.images || [];
  const mainImage = images[currentImageIndex] || '';

  // Preload images for smoother transitions
  useEffect(() => {
    if (images.length > 0) {
      images.forEach((src: string) => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [images]);

  useEffect(() => {
    setIsImageLoading(true);
  }, [currentImageIndex]);

  if (!product) return null;

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-12 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-brand-dark border border-white/10 rounded-[2rem] overflow-hidden w-full max-w-5xl max-h-[95vh] flex flex-col md:flex-row shadow-2xl relative"
        >
          {/* Close Button Mobile */}
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 z-50 w-10 h-10 bg-black/50 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors md:hidden"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Image Gallery Section */}
          <div className="w-full md:w-1/2 bg-zinc-900 relative flex flex-col h-[40vh] md:h-auto">
            <div className="relative flex-1 overflow-hidden group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  {isImageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                      <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
                    </div>
                  )}
                  <img 
                    src={mainImage} 
                    alt={product.name}
                    onLoad={() => setIsImageLoading(false)}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              </AnimatePresence>
              
              {images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto bg-zinc-950/50 border-t border-white/5 scrollbar-hide">
                {images.map((img: string, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${idx === currentImageIndex ? 'border-brand-gold scale-95' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col overflow-y-auto bg-brand-dark">
            <div className="flex justify-between items-start mb-6">
              <div className="pr-8">
                <span className="text-brand-gold text-[10px] uppercase tracking-[0.2em] font-bold mb-2 block">
                  {product.category}
                </span>
                <h2 className="text-2xl md:text-4xl font-serif italic mb-2 leading-tight">{product.name}</h2>
              </div>
              <button 
                onClick={onClose}
                className="hidden md:flex w-10 h-10 bg-white/5 rounded-full items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-2xl md:text-3xl font-light mb-8 text-zinc-100">{product.price}</p>

            <div className="prose prose-invert mb-10">
              <p className="text-zinc-400 font-light leading-relaxed text-sm md:text-base">
                Experience the perfect blend of utility and aesthetics. This {product.name.toLowerCase()} has been carefully curated to elevate your daily routine. Designed with premium materials to ensure longevity and exceptional performance.
              </p>
              <div className="mt-8 grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-brand-gold shadow-[0_0_10px_rgba(212,168,86,0.5)]"></div>
                  <span className="text-xs md:text-sm text-zinc-300">Premium build quality & materials</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-brand-gold shadow-[0_0_10px_rgba(212,168,86,0.5)]"></div>
                  <span className="text-xs md:text-sm text-zinc-300">Minimalist aesthetic for modern living</span>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => {
                  addToCart({ 
                    id: product.id, 
                    name: product.name, 
                    price: product.price, 
                    numericPrice: product.numericPrice, 
                    baseCost: product.baseCost,
                    image: mainImage 
                  });
                  onClose();
                }}
                className="flex-1 bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-gold transition-all active:scale-95"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button className="h-14 w-full sm:w-14 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-white/10 transition-colors active:scale-95">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
