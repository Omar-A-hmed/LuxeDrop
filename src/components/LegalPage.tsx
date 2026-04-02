import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { motion } from "framer-motion";

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  content: React.ReactNode;
}

export default function LegalPage({ title, lastUpdated, content }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-serif italic">{title}</h1>
            <p className="text-zinc-500 text-sm uppercase tracking-widest">Last Updated: {lastUpdated}</p>
          </div>
          
          <div className="prose prose-invert prose-zinc max-w-none">
            {content}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
