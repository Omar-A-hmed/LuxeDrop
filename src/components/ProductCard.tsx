import { ShoppingCart, Heart, Loader2 } from "lucide-react";
import { useCart } from "./CartContext";
import { useState } from "react";

export default function ProductCard({ id, name, price, numericPrice, baseCost, category, images, video, onClick }: {
  id: string | number;
  key?: number | string;
  name: string;
  price: string;
  numericPrice: number;
  baseCost?: number;
  category: string;
  images: string[];
  video?: string;
  onClick?: () => void;
}) {
  const { addToCart } = useCart();
  const [isLoaded, setIsLoaded] = useState(false);
  const mainImage = images && images.length > 0 ? images[0] : '';

  return (
    <div 
      className="group relative cursor-pointer"
      onClick={onClick}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-zinc-900 border border-white/5">
        {/* Loading State */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
            <Loader2 className="w-6 h-6 text-zinc-700 animate-spin" />
          </div>
        )}

        {/* Main Image */}
        <img 
          src={mainImage} 
          alt={name}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          referrerPolicy="no-referrer"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
           <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-gold mb-2">View Details</span>
           <div className="h-px w-12 bg-brand-gold transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 delay-100"></div>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              addToCart({ id, name, price, numericPrice, baseCost, image: mainImage });
            }}
            className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:bg-brand-gold transition-colors shadow-xl"
            title="Add to Cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => e.stopPropagation()}
            className="w-10 h-10 bg-black/50 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-brand-gold font-bold mb-1">{category}</p>
            <h3 className="text-lg font-serif italic text-zinc-100 group-hover:text-brand-gold transition-colors line-clamp-1">{name}</h3>
          </div>
          <p className="text-lg font-light text-zinc-300">{price}</p>
        </div>
      </div>
    </div>
  );
}
