import Hero3D from "./Hero3D";
import HeroBackground from "./HeroBackground";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative h-[100dvh] w-full overflow-hidden bg-brand-dark">
      {/* Background Layers */}
      <HeroBackground />
      
      <Hero3D />
      
      {/* Vertical Ticker */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 h-[60vh] overflow-hidden pointer-events-none z-20 hidden md:block">
        <motion.div 
          className="flex flex-col whitespace-nowrap"
          animate={{ y: [0, "-50%"] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
        >
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-[10px] uppercase tracking-[0.8em] text-brand-gold/15 py-12 [writing-mode:vertical-rl] rotate-180">
              LUXEDROP — THE ART OF LIVING — CURATED EXCELLENCE — 
            </span>
          ))}
        </motion.div>
      </div>
      
      {/* Overlay Shop Button */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 md:left-auto md:right-12 md:bottom-12 md:translate-x-0 z-30 pointer-events-none w-[90%] md:w-auto flex justify-center md:justify-end">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 3, duration: 0.8 }}
          className="pointer-events-auto"
        >
          <button 
            onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-10 py-4 bg-brand-gold text-brand-dark font-bold rounded-full hover:bg-white transition-all duration-300 flex items-center gap-3 group shadow-[0_0_40px_rgba(212,168,86,0.15)] text-[10px] uppercase tracking-[0.3em] whitespace-nowrap"
          >
            Explore Collection
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
