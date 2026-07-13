
'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Play, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";

/**
 * @fileOverview Compact Institutional Hero v41.0.
 * UPDATED: Refined premium button styling with high-fidelity geometry and typography.
 */
export default function Hero() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-white pt-10 pb-12 md:pt-16 md:pb-20 border-b border-slate-50">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-8 md:space-y-12">
          
          <motion.div 
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-blue-50 border border-blue-100/50 shadow-sm"
          >
            <Star className="h-4 w-4 text-primary fill-primary animate-pulse" />
            <span className="text-[11px] md:text-xs font-black tracking-widest text-primary uppercase antialiased">
              Punjab's Smartest Platform
            </span>
          </motion.div>

          <div className="space-y-6 max-w-4xl">
            <h1 className="text-[38px] md:text-7xl lg:text-[88px] font-black tracking-tighter text-[#0F172A] leading-[1] antialiased">
              Crack Punjab Exams <br/>
              <span className="text-primary italic">With Confidence</span>
            </h1>

            <p className="text-[15px] md:text-2xl text-slate-500 font-medium leading-relaxed tracking-tight px-4 max-w-3xl mx-auto">
              Master the official patterns with our verified Mock Tests, Notes, and Daily Registry Updates.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl px-4">
             <Button asChild className="flex-[1.2] h-16 md:h-20 bg-primary hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[11px] md:text-sm rounded-[24px] shadow-2xl shadow-primary/20 transition-all active:scale-95 border-none group">
                <Link href="/mocks" className="flex items-center justify-center gap-4">
                  <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <Play className="h-4 w-4 fill-white" />
                  </div>
                  <span>Start Preparation</span>
                </Link>
             </Button>
             <Button asChild variant="outline" className="flex-1 h-16 md:h-20 rounded-[24px] border-2 border-slate-100 bg-white text-[#0F172A] font-black uppercase tracking-widest text-[11px] md:text-sm shadow-sm transition-all active:scale-95 hover:bg-slate-50">
                <Link href="/exams" className="flex items-center justify-center gap-3">
                   <span>Browse Registry</span> 
                   <ChevronRight className="h-5 w-5 text-slate-300" />
                </Link>
             </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
