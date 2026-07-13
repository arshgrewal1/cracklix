
'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Play, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";

/**
 * @fileOverview High-Mass Institutional Hero v42.0.
 * UPDATED: Redesigned buttons for maximum stylistic impact and vertical density.
 */
export default function Hero() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-white pt-12 pb-16 md:pt-20 md:pb-28 border-b border-slate-50">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-10 md:space-y-16">
          
          <motion.div 
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-blue-50 border border-blue-100/50 shadow-sm"
          >
            <Star className="h-4 w-4 text-primary fill-primary animate-pulse" />
            <span className="text-[11px] md:text-xs font-black tracking-widest text-primary uppercase antialiased">
              Punjab's Smartest Platform
            </span>
          </motion.div>

          <div className="space-y-6 max-w-4xl">
            <h1 className="text-[42px] md:text-8xl lg:text-[100px] font-black tracking-tighter text-[#0F172A] leading-[0.95] antialiased">
              Crack Punjab Exams <br/>
              <span className="text-primary italic">With Confidence</span>
            </h1>

            <p className="text-[16px] md:text-2xl text-slate-500 font-medium leading-relaxed tracking-tight px-4 max-w-2xl mx-auto">
              Master official patterns with verified Mock Tests, Notes, and Daily Registry Updates.
            </p>
          </div>

          {/* STYLISH HIGH-MASS BUTTON HUB */}
          <div className="flex flex-col sm:flex-row gap-5 w-full max-w-xl px-4">
             <Button asChild className="flex-1 h-20 bg-primary hover:bg-blue-700 text-white font-[800] text-lg rounded-[24px] shadow-2xl shadow-primary/30 transition-all active:scale-95 border-none group relative overflow-hidden">
                <Link href="/mocks" className="flex items-center justify-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner group-hover:scale-110 transition-transform">
                    <Play className="h-5 w-5 fill-white" />
                  </div>
                  <span>Start Preparation</span>
                </Link>
             </Button>
             
             <Button asChild variant="outline" className="flex-1 h-20 rounded-[24px] border-2 border-slate-200 bg-white text-[#0F172A] font-[800] text-lg shadow-sm transition-all active:scale-95 hover:bg-slate-50 hover:border-slate-300">
                <Link href="/exams" className="flex items-center justify-center gap-3">
                   <span>Browse Registry</span> 
                   <ChevronRight className="h-5 w-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                </Link>
             </Button>
          </div>
          
          <div className="flex items-center gap-8 pt-4 md:pt-8 opacity-40 grayscale group hover:grayscale-0 transition-all duration-700">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Institutional Registry Verified</p>
          </div>
        </div>
      </div>
    </section>
  );
}
