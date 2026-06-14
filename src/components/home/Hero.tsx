'use client';

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, BookOpen, ClipboardList, ShieldCheck, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Final Hardened Scaling Hero Node v30.0.
 * UPDATED: Ultra-compact text container and high-lifted stats grid for full background integration.
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
      <div className="relative w-full aspect-[14/9] md:aspect-[21/9] lg:aspect-[28/9] overflow-hidden">
         {/* BASE LAYER: GOLDEN TEMPLE (FULL VISIBILITY) */}
         <img 
            src={goldenTempleImg} 
            alt="Golden Temple" 
            className="w-full h-full object-cover object-top"
            referrerPolicy="no-referrer"
         />

         {/* SHADING LAYER: SKY BLUE MIX (LOCKED LEFT) */}
         <div className="absolute left-0 top-0 h-full w-full md:w-[50%] bg-gradient-to-r from-sky-100/90 via-sky-50/60 to-transparent z-10" />

         {/* TEXTURE LAYER: PUNJAB MAP (LOCKED LEFT) */}
         <div className="absolute left-0 top-0 h-full w-full md:w-[30%] z-20 pointer-events-none opacity-[0.06] mix-blend-multiply">
            <img 
               src={punjabMap} 
               className="w-full h-full object-contain object-left" 
               alt="Punjab Map watermark"
            />
         </div>

         {/* 2. CONTENT HUB - ULTRA COMPACT POSITIONING TOP-LEFT */}
         <div className="absolute inset-0 z-30 container mx-auto px-4 md:px-12 lg:px-16 max-w-7xl flex flex-col justify-start">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="pt-4 md:pt-10 lg:pt-16 max-w-[180px] sm:max-w-xs md:max-w-sm text-left space-y-3 md:space-y-5"
            >
               {/* BRAND BADGE */}
               <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/40 backdrop-blur-md border border-white/20 shadow-sm w-fit">
                  <Star className="h-2 md:h-2.5 w-2 md:w-2.5 text-[#F97316] fill-current" />
                  <span className="text-[6px] md:text-[8px] font-black text-[#0F172A] uppercase tracking-widest whitespace-nowrap">#1 Punjab Exam Hub</span>
               </div>

               {/* HEADLINES (Tightened Scaling) */}
               <div className="space-y-0 md:space-y-0.5">
                  <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-headline font-black text-[#0F172A] leading-tight tracking-tighter uppercase">
                     PREPARE SMARTER.
                  </h1>
                  <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-headline font-black text-[#F97316] leading-tight tracking-tighter uppercase">
                     SCORE HIGHER.
                  </h1>
               </div>

               <p className="text-[#0F172A] font-black uppercase text-[6px] md:text-[9px] tracking-[0.1em] max-w-[150px] leading-tight antialiased opacity-90">
                  Official CBT engine verified by <br/>
                  Arsh Grewal Management.
               </p>

               {/* ACTION BUTTONS (Compact Styling) */}
               <div className="flex flex-wrap gap-1.5 md:gap-3 pt-1">
                  <Button asChild className="h-7 md:h-10 px-3 md:px-5 bg-[#F97316] hover:bg-orange-600 text-white font-black uppercase text-[7px] md:text-[8px] tracking-widest rounded-md md:rounded-xl shadow-lg border-none transition-all active:scale-95">
                     <Link href="/mocks">Start Mock <ArrowRight className="h-2.5 w-2.5 ml-1" /></Link>
                  </Button>
                  <Button asChild variant="outline" className="h-7 md:h-10 px-3 md:px-5 border-[#0F172A]/10 bg-white/20 backdrop-blur-sm text-[#0F172A] hover:bg-white/40 font-black uppercase text-[7px] md:text-[8px] tracking-widest rounded-md md:rounded-xl shadow-md transition-all active:scale-95">
                     <Link href="/exams">Explore Hub</Link>
                  </Button>
               </div>
            </motion.div>
         </div>
      </div>

      {/* 3. BOTTOM STATS HUB - HIGH-LIFT OVER BACKGROUND */}
      <div className="container mx-auto px-4 md:px-12 lg:px-16 max-w-7xl -mt-20 md:-mt-32 lg:-mt-40 relative z-40 pb-10">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-5">
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
      <div className="p-2 md:p-3.5 bg-white/80 backdrop-blur-lg shadow-xl border border-white/30 rounded-[0.6rem] md:rounded-[1.2rem] space-y-0.5 group hover:bg-white transition-all text-left">
         <div className={cn("h-5 w-5 md:h-8 md:w-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner mb-1.5", color)}>
            {React.cloneElement(icon, { className: "h-2.5 w-2.5 md:h-4 md:w-4" })}
         </div>
         <div className="space-y-0">
            <p className="text-xs md:text-xl lg:text-2xl font-headline font-black text-[#0F172A] leading-none tracking-tighter">{val}</p>
            <p className="text-[5px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
         </div>
      </div>
   )
}
