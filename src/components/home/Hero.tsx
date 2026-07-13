'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Play, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";

/**
 * @fileOverview High-Mass Institutional Hero v43.1.
 * UPDATED: Replaced "Registry" with "Selection" in secondary CTA.
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
              Master official patterns with verified Mock Tests, Notes, and Daily Portal Updates.
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-[18px] w-full max-w-xl px-5 mx-auto items-center justify-center"
          >
             <Button 
               asChild 
               className="relative overflow-hidden w-full h-[58px] bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#60A5FA] hover:brightness-110 rounded-full shadow-[0_12px_35px_rgba(37,99,235,0.30)] hover:shadow-[0_15px_45px_rgba(37,99,235,0.40)] transition-all duration-300 active:scale-[0.98] border-none group cursor-pointer"
               aria-label="Start Preparation"
             >
                <Link href="/mocks" className="flex items-center justify-center w-full px-1">
                  <motion.div 
                    animate={{ x: ['-100%', '250%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] pointer-events-none"
                  />
                  
                  <div className="flex items-center justify-start w-full relative z-10">
                    <div className="w-[42px] h-[42px] rounded-full bg-white/18 backdrop-blur-[12px] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.2)] border border-white/10 group-hover:scale-105 transition-transform duration-300">
                      <Play className="h-5 w-5 fill-white text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                    </div>
                    <span className="flex-1 text-center font-bold text-[18px] text-white tracking-[0.3px] pr-[42px]">
                      Start Preparation
                    </span>
                  </div>
                </Link>
             </Button>
             
             <Button 
               asChild 
               variant="outline" 
               className="w-full h-[56px] rounded-full bg-white border-2 border-[#DCE8FF] hover:border-[#60A5FA] hover:bg-[#F8FBFF] text-[#1E3A8A] font-semibold text-[17px] shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 active:scale-[0.98] hover:-translate-y-[2px] group"
               aria-label="Browse Selection"
             >
                <Link href="/exams" className="flex items-center justify-center w-full px-1">
                   <span className="flex-1 text-center pl-[34px]">Browse Selection</span> 
                   <div className="w-[34px] h-[34px] rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0 group-hover:bg-[#E0F2FE] transition-colors">
                      <ChevronRight className="h-4 w-4 text-[#1E3A8A] group-hover:translate-x-0.5 transition-transform" />
                   </div>
                </Link>
             </Button>
          </motion.div>
          
          <div className="flex items-center gap-8 pt-4 md:pt-8 opacity-40 grayscale group hover:grayscale-0 transition-all duration-700">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Official Portal Verified</p>
          </div>
        </div>
      </div>
    </section>
  );
}
