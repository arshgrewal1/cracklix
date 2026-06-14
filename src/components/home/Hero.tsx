'use client';

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, BookOpen, ClipboardList, ShieldCheck, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Refined Unified Hero Node v24.0.
 * MATCHED: Text moved down, compact box size, and full sky-blue shading mix.
 */

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const goldenTempleImg = "https://i.ibb.co/LXgcLVVq/Gemini-Generated-Image-n1so6on1so6on1so.png";
  const punjabMap = "https://www.mapsofindia.com/maps/punjab/punjab-map.jpg";

  if (!mounted) {
    return <section className="w-full h-[500px] bg-[#020817]" />;
  }

  return (
    <section className="relative w-full overflow-hidden flex flex-col bg-[#020817] min-h-[600px] md:min-h-[800px]">
      
      {/* 1. UNIFIED BACKGROUND STACK */}
      <div className="absolute inset-0 z-0">
         {/* BASE LAYER: GOLDEN TEMPLE */}
         <img 
            src={goldenTempleImg} 
            alt="Golden Temple" 
            className="w-full h-full object-cover object-top"
            referrerPolicy="no-referrer"
         />

         {/* SHADING LAYER: FULL SKY BLUE MIX (LEFT) */}
         <div className="absolute left-0 top-0 h-full w-full md:w-[75%] bg-gradient-to-r from-sky-200/95 via-sky-100/80 to-transparent z-10" />

         {/* TEXTURE LAYER: PUNJAB MAP (MIXED IN SHADING) */}
         <div className="absolute left-0 top-0 h-full w-full md:w-[45%] z-20 pointer-events-none opacity-[0.1] mix-blend-multiply">
            <img 
               src={punjabMap} 
               className="w-full h-full object-contain object-left" 
               alt="Punjab Map watermark"
            />
         </div>
      </div>

      {/* 2. CONTENT HUB - COMPACT & POSITIONED */}
      <div className="container mx-auto px-4 md:px-12 lg:px-16 max-w-7xl relative z-30 flex flex-col justify-between flex-1">
         
         {/* TOP-LEFT COMPACT BOX (Moved Down slightly) */}
         <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="pt-20 md:pt-32 max-w-lg text-left space-y-6 md:space-y-8"
         >
            {/* BRAND BADGE */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/40 backdrop-blur-md border border-white/20 shadow-sm w-fit">
               <Star className="h-3 w-3 text-[#F97316] fill-current" />
               <span className="text-[8px] md:text-[10px] font-black text-[#0F172A] uppercase tracking-widest">#1 Punjab Exam Preparation</span>
            </div>

            {/* HEADLINES (Reduced Size) */}
            <div className="space-y-1 md:space-y-2">
               <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-headline font-black text-[#0F172A] leading-none tracking-tighter uppercase">
                  PREPARE SMARTER.
               </h1>
               <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-headline font-black text-[#F97316] leading-none tracking-tighter uppercase">
                  SCORE HIGHER.
               </h1>
            </div>

            <p className="text-[#0F172A] font-bold uppercase text-[9px] md:text-xs tracking-[0.2em] max-w-xs leading-relaxed antialiased opacity-90">
               Official CBT engine verified by <br className="hidden md:block" />
               Arsh Grewal Management.
            </p>

            {/* ACTION BUTTONS (Compact) */}
            <div className="flex flex-wrap gap-3 md:gap-4 pt-2">
               <Button asChild className="h-10 md:h-14 px-6 md:px-10 bg-[#F97316] hover:bg-orange-600 text-white font-black uppercase text-[9px] md:text-[10px] tracking-widest rounded-xl shadow-xl border-none transition-all active:scale-95">
                  <Link href="/mocks">Start Free Mock <ArrowRight className="h-4 w-4 ml-1" /></Link>
               </Button>
               <Button asChild variant="outline" className="h-10 md:h-14 px-6 md:px-10 border-[#0F172A]/20 bg-white/30 backdrop-blur-md text-[#0F172A] hover:bg-white/50 font-black uppercase text-[9px] md:text-[10px] tracking-widest rounded-xl shadow-lg transition-all active:scale-95">
                  <Link href="/exams">Explore Hub</Link>
               </Button>
            </div>
         </motion.div>

         {/* BOTTOM STATS HUB (Floating Over Mixed Background) */}
         <div className="pb-12 md:pb-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
               <StatCard icon={<BookOpen />} label="QUESTIONS" val="50k+" color="text-blue-600" />
               <StatCard icon={<ClipboardList />} label="MOCK TESTS" val="500+" color="text-[#F97316]" />
               <StatCard icon={<ShieldCheck />} label="ASPIRANTS" val="15k+" color="text-emerald-600" />
               <StatCard icon={<BarChart3 />} label="ACCURACY" val="94%" color="text-indigo-600" />
            </div>
         </div>
      </div>
    </section>
  );
}

function StatCard({ icon, label, val, color }: any) {
   return (
      <div className="p-4 md:p-6 bg-white/20 backdrop-blur-sm border border-white/20 rounded-[1.2rem] md:rounded-[2rem] space-y-2 shadow-inner group hover:bg-white/40 transition-all text-left">
         <div className={cn("h-7 w-7 md:h-10 md:w-10 rounded-lg bg-white/80 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm", color)}>
            {React.cloneElement(icon, { className: "h-3.5 w-3.5 md:h-5 md:w-5" })}
         </div>
         <div className="space-y-0.5">
            <p className="text-lg md:text-3xl font-headline font-black text-[#0F172A] leading-none tracking-tighter">{val}</p>
            <p className="text-[6.5px] md:text-[9px] font-black text-[#0F172A]/60 uppercase tracking-widest">{label}</p>
         </div>
      </div>
   )
}
