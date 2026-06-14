'use client';

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, BookOpen, ClipboardList, ShieldCheck, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Refined Scaling Hero Node v26.0.
 * MATCHED: Background is fully visible (aspect-ratio driven), scales with window size.
 * SHADING: Sky-blue shading and map locked to the left side under a compact text box.
 */

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const goldenTempleImg = "https://i.ibb.co/LXgcLVVq/Gemini-Generated-Image-n1so6on1so6on1so.png";
  const punjabMap = "https://www.mapsofindia.com/maps/punjab/punjab-map.jpg";

  if (!mounted) {
    return <section className="w-full aspect-video bg-[#020817]" />;
  }

  return (
    <section className="relative w-full overflow-hidden flex flex-col bg-[#020817]">
      
      {/* 1. RESPONSIVE BACKGROUND HUB - PROPORTIONAL SCALING */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[25/9] overflow-hidden">
         {/* BASE LAYER: GOLDEN TEMPLE (FULL VISIBILITY) */}
         <img 
            src={goldenTempleImg} 
            alt="Golden Temple" 
            className="w-full h-full object-cover object-top"
            referrerPolicy="no-referrer"
         />

         {/* SHADING LAYER: SKY BLUE MIX (LOCKED LEFT) */}
         <div className="absolute left-0 top-0 h-full w-full md:w-[60%] bg-gradient-to-r from-sky-200/95 via-sky-100/70 to-transparent z-10" />

         {/* TEXTURE LAYER: PUNJAB MAP (LOCKED LEFT) */}
         <div className="absolute left-0 top-0 h-full w-full md:w-[35%] z-20 pointer-events-none opacity-[0.08] mix-blend-multiply">
            <img 
               src={punjabMap} 
               className="w-full h-full object-contain object-left" 
               alt="Punjab Map watermark"
            />
         </div>

         {/* 2. CONTENT HUB - COMPACT POSITIONING TOP-LEFT */}
         <div className="absolute inset-0 z-30 container mx-auto px-4 md:px-12 lg:px-16 max-w-7xl flex flex-col justify-start">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="pt-6 md:pt-12 lg:pt-20 max-w-[260px] sm:max-w-xs md:max-w-sm text-left space-y-4 md:space-y-6"
            >
               {/* BRAND BADGE */}
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 backdrop-blur-md border border-white/20 shadow-sm w-fit">
                  <Star className="h-2.5 md:h-3 w-2.5 md:w-3 text-[#F97316] fill-current" />
                  <span className="text-[7px] md:text-[9px] font-black text-[#0F172A] uppercase tracking-widest whitespace-nowrap">#1 Punjab Exam Platform</span>
               </div>

               {/* HEADLINES (Scaling Text) */}
               <div className="space-y-0.5 md:space-y-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-headline font-black text-[#0F172A] leading-none tracking-tighter uppercase">
                     PREPARE SMARTER.
                  </h1>
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-headline font-black text-[#F97316] leading-none tracking-tighter uppercase">
                     SCORE HIGHER.
                  </h1>
               </div>

               <p className="text-[#0F172A] font-bold uppercase text-[7px] md:text-[10px] tracking-[0.15em] max-w-[200px] leading-relaxed antialiased opacity-90">
                  Official CBT engine verified by <br className="hidden md:block" />
                  Arsh Grewal Management.
               </p>

               {/* ACTION BUTTONS (Compact Scaling) */}
               <div className="flex flex-wrap gap-2 md:gap-3 pt-1">
                  <Button asChild className="h-8 md:h-11 px-4 md:px-6 bg-[#F97316] hover:bg-orange-600 text-white font-black uppercase text-[8px] md:text-[9px] tracking-widest rounded-lg md:rounded-xl shadow-xl border-none transition-all active:scale-95">
                     <Link href="/mocks">Start Free Mock <ArrowRight className="h-3 w-3 ml-1" /></Link>
                  </Button>
                  <Button asChild variant="outline" className="h-8 md:h-11 px-4 md:px-6 border-[#0F172A]/20 bg-white/30 backdrop-blur-md text-[#0F172A] hover:bg-white/50 font-black uppercase text-[8px] md:text-[9px] tracking-widest rounded-lg md:rounded-xl shadow-lg transition-all active:scale-95">
                     <Link href="/exams">Explore Hub</Link>
                  </Button>
               </div>
            </motion.div>
         </div>
      </div>

      {/* 3. BOTTOM STATS HUB - FLOATING DIRECTLY OVER BACKGROUND */}
      <div className="container mx-auto px-4 md:px-12 lg:px-16 max-w-7xl -mt-8 md:-mt-12 relative z-40 pb-12">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            <StatCard icon={<BookOpen />} label="QUESTIONS" val="50k+" color="text-blue-600" />
            <StatCard icon={<ClipboardList />} label="MOCK TESTS" val="500+" color="text-[#F97316]" />
            <StatCard icon={<ShieldCheck />} label="ASPIRANTS" val="15k+" color="text-emerald-600" />
            <StatCard icon={<BarChart3 />} label="ACCURACY" val="94%" color="text-indigo-600" />
         </div>
      </div>
    </section>
  );
}

function StatCard({ icon, label, val, color }: any) {
   return (
      <div className="p-3 md:p-6 bg-white/90 backdrop-blur-md shadow-2xl border border-white/20 rounded-[1rem] md:rounded-[2rem] space-y-1.5 md:space-y-2 group hover:bg-white transition-all text-left">
         <div className={cn("h-6 w-6 md:h-10 md:w-10 rounded-lg bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner", color)}>
            {React.cloneElement(icon, { className: "h-3 w-3 md:h-5 md:w-5" })}
         </div>
         <div className="space-y-0.5">
            <p className="text-base md:text-2xl lg:text-3xl font-headline font-black text-[#0F172A] leading-none tracking-tighter">{val}</p>
            <p className="text-[6px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
         </div>
      </div>
   )
}