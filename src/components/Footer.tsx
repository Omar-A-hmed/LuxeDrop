import { Instagram, Twitter, Facebook, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-brand-dark border-t border-white/5 pt-24 pb-12 px-6 md:px-12 relative overflow-hidden">
      {/* Footer Ticker */}
      <div className="absolute top-0 left-0 w-full bg-white/5 py-2 overflow-hidden border-b border-white/5">
        <motion.div 
          className="flex whitespace-nowrap"
          animate={{ x: [0, "-50%"] }}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        >
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-[8px] uppercase tracking-[0.6em] text-brand-gold/30 px-12">
              LuxeDrop — India — Dubai — London — New York — Paris — Tokyo — 
            </span>
          ))}
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-24 relative z-10 pt-8">
        <div className="lg:col-span-2">
          <div className="text-3xl font-serif italic mb-8">LuxeDrop</div>
          <p className="text-zinc-500 max-w-md font-light leading-relaxed mb-8">
            Redefining the digital shopping experience through curated excellence and immersive design. Join our community of discerning individuals.
          </p>
          <div className="flex gap-6">
            <Instagram className="w-5 h-5 cursor-pointer hover:text-brand-gold transition-colors" />
            <Twitter className="w-5 h-5 cursor-pointer hover:text-brand-gold transition-colors" />
            <Facebook className="w-5 h-5 cursor-pointer hover:text-brand-gold transition-colors" />
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] font-bold mb-8 text-zinc-400">Shop</h4>
          <ul className="flex flex-col gap-4 text-sm font-light">
            <li><a href="#" className="hover:text-brand-gold transition-colors">New Arrivals</a></li>
            <li><a href="#" className="hover:text-brand-gold transition-colors">Best Sellers</a></li>
            <li><a href="#" className="hover:text-brand-gold transition-colors">Collections</a></li>
            <li><a href="#" className="hover:text-brand-gold transition-colors">Sale</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] font-bold mb-8 text-zinc-400">Support</h4>
          <ul className="flex flex-col gap-4 text-sm font-light">
            <li><a href="/shipping-returns" className="hover:text-brand-gold transition-colors">Shipping & Returns</a></li>
            <li><a href="#" className="hover:text-brand-gold transition-colors">Contact Us</a></li>
            <li><a href="#" className="hover:text-brand-gold transition-colors">FAQ</a></li>
            <li><a href="/track" className="hover:text-brand-gold transition-colors flex items-center gap-1">Track Order <ArrowUpRight className="w-3 h-3" /></a></li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-6">
        <p className="text-[10px] uppercase tracking-widest text-zinc-600">© 2026 LuxeDrop. All Rights Reserved.</p>
        <div className="flex gap-8 text-[10px] uppercase tracking-widest text-zinc-600">
          <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
