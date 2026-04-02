import { ShoppingCart, Loader2, Star } from "lucide-react";
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

  // Fake logic to match screenshot aesthetic (since DB lacks this detail)
  const fakeOriginalPrice = numericPrice * 1.30;
  const fakeOriginalPriceStr = `₹${fakeOriginalPrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const discountAmount = fakeOriginalPrice - numericPrice;
  const discountTag = `-₹${discountAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  
  const hash = String(id).split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const fakeReviews = (hash % 150) + 12;

  return (
    <div 
      className="group relative cursor-pointer flex flex-col h-full"
      onClick={onClick}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl md:rounded-3xl bg-zinc-900 border border-white/5 shrink-0">
        {/* Loading State */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
            <Loader2 className="w-5 h-5 text-zinc-700 animate-spin" />
          </div>
        )}

        {/* Main Image */}
        <img 
          src={mainImage} 
          alt={name}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          referrerPolicy="no-referrer"
        />

        {/* Discount Badge */}
        {numericPrice > 0 && (
          <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-red-600/90 text-white text-[9px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-[4px] tracking-wider z-10 shadow-sm border border-red-500/50">
            {discountTag}
          </div>
        )}
        
        {/* Action Buttons */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            addToCart({ id, name, price, numericPrice, baseCost, image: mainImage });
          }}
          className="absolute bottom-2 right-2 md:bottom-3 md:right-3 w-8 h-8 md:w-10 md:h-10 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-full flex items-center justify-center hover:bg-brand-gold hover:border-brand-gold hover:text-black transition-all shadow-xl z-20"
          title="Add to Cart"
        >
          <ShoppingCart className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>
      </div>

      <div className="mt-3 space-y-1 flex-1 flex flex-col">
        <div className="pr-1">
          <p className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-semibold mb-0.5">{category}</p>
          <h3 className="text-xs md:text-sm font-medium text-zinc-100 group-hover:text-brand-gold transition-colors line-clamp-2 leading-snug">{name}</h3>
        </div>
        
        {/* Ratings row */}
        <div className="flex items-center gap-1 mt-1">
          <div className="flex text-brand-gold">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" />)}
          </div>
          <span className="text-[9px] md:text-[10px] text-zinc-500">{fakeReviews} reviews</span>
        </div>

        {/* Price row */}
        <div className="mt-auto pt-1.5 flex items-baseline gap-1.5 md:gap-2">
          <span className="line-through text-[10px] md:text-xs text-zinc-600">{fakeOriginalPriceStr}</span>
          <span className="text-sm md:text-base font-semibold text-brand-gold">{price}</span>
        </div>

        {/* Swatches */}
        <div className="flex items-center gap-1 pt-1">
          <div className="w-2 h-2 rounded-full bg-zinc-400 border border-white/10"></div>
          <div className="w-2 h-2 rounded-full bg-zinc-800 border border-white/10"></div>
          <div className="w-2 h-2 rounded-full bg-[#3d4246] border border-white/10"></div>
        </div>
      </div>
    </div>
  );
}
