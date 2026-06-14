'use client';

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, BookOpen, ClipboardList, ShieldCheck, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Hardened Unified Hero v8.0.
 * DESIGN: Shading and Map node anchored to the left.
 * VISIBILITY: Golden Temple clearly visible on the right (no shading).
 * SIZING: 200px mobile height for the image hub.
 */

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const goldenTempleImg = "https://i.ibb.co/LXgcLVVq/Gemini-Generated-Image-n1so6on1so6on1so.png";
  const punjabMap = "https://www.mapsofindia.com/maps/punjab/punjab-map.jpg";

  if (!mounted) {
    return <section className="w-full bg-[#050B19] h-[400px]" />;
  }

  return (
    <section className="relative w-full bg-[#050B19] overflow-hidden flex flex-col text-left">
      
      {/* 1. TOP IMAGE HUB - 200PX HEIGHT ON MOBILE */}
      <div className="relative w-full h-[200px] md:h-[450px] overflow-hidden">
         <div className="absolute inset-0 z-0">
            <img 
              src={goldenTempleImg} 
              alt="Golden Temple" 
              className="w-full h-full object-cover object-top"
              referrerPolicy="no-referrer"
            />
            {/* LEFT SHADING: Fades from solid dark on left to transparent on right */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#050B19] via-[#050B19]/80 to-transparent z-10" />
         </div>

         {/* LEFT-SIDE GEOGRAPHICAL NODE (Map inside the shaded area) */}
         <div className="absolute inset-y-0 left-0 w-full md:w-1/2 z-20 pointer-events-none overflow-hidden opacity-[0.05] mix-blend-overlay">
            <img 
              src={punjabMap} 
              className="h-full w-auto object-cover grayscale invert" 
              alt="Punjab Map Node"
            />
         </div>

         {/* TOP BADGE */}
         <div className="absolute bottom-6 left-4 md:left-16 z-30">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
               <Star className="h-3 w-3 text-primary fill-current" />
               <span className="text-[8px] md:text-xs font-black text-white uppercase tracking-widest">#1 Punjab Exam Prep Node</span>
            </div>
         </div>
      </div>

      {/* 2. CONTENT HUB - SOLID DARK BACK */}
      <div className="bg-[#050B19] relative z-30 pb-16 md:pb-32">
         <div className="container mx-auto px-4 md:px-16 max-w-7xl">
            <div className="pt-6 md:pt-12 space-y-2 md:space-y-4">
               <motion.h1 
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[28px] sm:text-5xl md:text-7xl lg:text-[80px] font-headline font-black text-white leading-none tracking-tighter uppercase"
               >
                  PREPARE SMARTER.
               </motion.h1>
               <motion.h1 
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-[28px] sm:text-5xl md:text-7xl lg:text-[80px] font-headline font-black text-primary leading-none tracking-tighter uppercase"
               >
                  SCORE HIGHER.
               </motion.h1>
            </div>

            <motion.p 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="text-slate-400 font-bold uppercase text-[9px] md:text-lg tracking-[0.2em] mt-8 md:mt-10 max-w-xl leading-relaxed"
            >
               Punjab&apos;s most advanced CBT engine. <br className="hidden md:block" />
               Verified by Arsh Grewal Management.
            </motion.p>

            <div className="mt-10 md:mt-16 flex flex-wrap gap-4">
               <Button asChild className="h-14 md:h-18 px-10 md:px-14 bg-primary hover:bg-orange-600 text-white font-black uppercase text-[10px] md:text-sm tracking-widest rounded-xl md:rounded-2xl shadow-3xl gap-3 border-none transition-all active:scale-95">
                  <Link href="/mocks">Start Free Mock <ArrowRight className="h-5 w-5" /></Link>
               </Button>
               <Button asChild variant="outline" className="h-14 md:h-18 px-10 md:px-14 border-white/10 bg-white/5 text-white hover:bg-white/10 font-black uppercase text-[10px] md:text-sm tracking-widest rounded-xl md:rounded-2xl shadow-xl transition-all active:scale-95">
                  <Link href="/exams">Explore Exams</Link>
               </Button>
            </div>

            {/* INSTITUTIONAL STATS - HIGH DENSITY */}
            <div className="mt-20 md:mt-32 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
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
      <div className="p-5 md:p-8 bg-white/[0.03] border border-white/5 rounded-[1.5rem] md:rounded-[2.5rem] space-y-3 shadow-inner group hover:bg-white/[0.05] transition-all">
         <div className={cn("h-8 w-8 md:h-12 md:w-12 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform", color)}>
            {React.cloneElement(icon, { className: "h-4 w-4 md:h-6 md:w-6" })}
         </div>
         <div className="space-y-0.5">
            <p className="text-xl md:text-4xl font-headline font-black text-white leading-none tracking-tighter">{val}</p>
            <p className="text-[7px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
         </div>
      </div>
   )
}
