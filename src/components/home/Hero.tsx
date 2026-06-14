'use client';

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, BookOpen, ClipboardList, ShieldCheck, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * @fileOverview High-Fidelity Hero Node v20.0.
 * MATCHED: Full Golden Temple background with left-side shading and map overlay.
 * POSITIONING: Content anchored to Top-Left.
 * SIZING: Focused 200px height for mobile background assets.
 */

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const goldenTempleImg = "https://i.ibb.co/LXgcLVVq/Gemini-Generated-Image-n1so6on1so6on1so.png";
  const punjabMap = "https://www.mapsofindia.com/maps/punjab/punjab-map.jpg";

  if (!mounted) {
    return <section className="w-full h-[400px] bg-white" />;
  }

  return (
    <section className="relative w-full overflow-hidden flex flex-col bg-white">
      
      {/* 1. BACKGROUND HUB - LAYERED ASSETS */}
      <div className="relative w-full h-[200px] md:h-[450px] overflow-hidden">
         {/* LAYER 1: FULL GOLDEN TEMPLE BACKGROUND */}
         <img 
            src={goldenTempleImg} 
            alt="Golden Temple" 
            className="absolute inset-0 w-full h-full object-cover object-top"
            referrerPolicy="no-referrer"
         />

         {/* LAYER 2: LEFT-SIDE SKY BLUE SHADING */}
         <div className="absolute left-0 top-0 h-full w-full md:w-[60%] bg-gradient-to-r from-sky-100/90 via-sky-50/40 to-transparent z-10" />

         {/* LAYER 3: LEFT-SIDE PUNJAB MAP WATERMARK */}
         <div className="absolute left-0 top-0 h-full w-full md:w-[40%] z-20 pointer-events-none opacity-[0.15] mix-blend-multiply">
            <img 
               src={punjabMap} 
               className="w-full h-full object-contain object-left" 
               alt="Punjab Map overlay"
            />
         </div>
      </div>

      {/* 2. CONTENT HUB - TOP-LEFT ALIGNMENT */}
      <div className="container mx-auto px-4 md:px-16 max-w-7xl relative z-30">
         {/* NEGATIVE MARGIN TO PUSH TEXT UP OVER THE ASSETS */}
         <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-xl text-left space-y-4 md:space-y-6 -mt-[180px] md:-mt-[400px] pb-12"
         >
            {/* BRAND BADGE */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 backdrop-blur-md border border-white/20 shadow-sm">
               <Star className="h-3 w-3 text-primary fill-current" />
               <span className="text-[8px] md:text-[10px] font-black text-[#0F172A] uppercase tracking-widest">#1 Punjab Exam Prep</span>
            </div>

            {/* HEADLINES - COMPACT SCALE */}
            <div className="space-y-1 md:space-y-2">
               <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-headline font-black text-[#0F172A] leading-none tracking-tighter uppercase">
                  PREPARE SMARTER.
               </h1>
               <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-headline font-black text-primary leading-none tracking-tighter uppercase">
                  SCORE HIGHER.
               </h1>
            </div>

            <p className="text-[#0F172A] font-bold uppercase text-[9px] md:text-sm tracking-[0.2em] max-w-md leading-relaxed antialiased opacity-80">
               Official CBT engine verified by <br className="hidden md:block" />
               Arsh Grewal Management.
            </p>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap gap-3 pt-2">
               <Button asChild className="h-10 md:h-14 px-6 md:px-10 bg-primary hover:bg-orange-600 text-white font-black uppercase text-[9px] md:text-xs tracking-widest rounded-xl md:rounded-2xl shadow-3xl border-none transition-all active:scale-95">
                  <Link href="/mocks">Start Free Mock <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
               </Button>
               <Button asChild variant="outline" className="h-10 md:h-14 px-6 md:px-10 border-[#0F172A]/20 bg-white/20 backdrop-blur-md text-[#0F172A] hover:bg-white/40 font-black uppercase text-[9px] md:text-xs tracking-widest rounded-xl md:rounded-2xl shadow-xl transition-all active:scale-95">
                  <Link href="/exams">Explore Exams</Link>
               </Button>
            </div>
         </motion.div>
      </div>

      {/* 3. INSTITUTIONAL STATS HUB - BOTTOM ANCHORED */}
      <div className="w-full bg-white py-12 md:py-20 border-t border-slate-50 mt-4">
         <div className="container mx-auto px-4 md:px-16 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
               <StatCard icon={<BookOpen />} label="QUESTIONS" val="50k+" color="text-blue-500" />
               <StatCard icon={<ClipboardList />} label="MOCK TESTS" val="500+" color="text-orange-500" />
               <StatCard icon={<ShieldCheck />} label="ASPIRANTS" val="15k+" color="text-emerald-500" />
               <StatCard icon={<BarChart3 />} label="ACCURACY" val="94%" color="text-indigo-500" />
            </div>
         </div>
      </div>
    </section>
  );
}

function StatCard({ icon, label, val, color }: any) {
   return (
      <div className="p-4 md:p-8 bg-slate-50 border border-slate-100 rounded-[1.5rem] md:rounded-[2.5rem] space-y-3 shadow-inner group hover:bg-white hover:shadow-xl transition-all text-left">
         <div className={cn("h-8 w-8 md:h-12 md:w-12 rounded-xl bg-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm", color)}>
            {React.cloneElement(icon, { className: "h-4 w-4 md:h-6 md:w-6" })}
         </div>
         <div className="space-y-0.5">
            <p className="text-xl md:text-4xl font-headline font-black text-[#0F172A] leading-none tracking-tighter">{val}</p>
            <p className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
         </div>
      </div>
   )
}
