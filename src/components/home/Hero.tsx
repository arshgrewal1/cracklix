'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  Target, 
  Star, 
  BarChart3, 
  BookOpen, 
  ArrowRight,
  ClipboardList,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useDoc, useFirestore } from '@/firebase';
import { doc } from "firebase/firestore";

/**
 * @fileOverview Final High-Fidelity "Master Interface" Hero v40.0.
 * MATCHED: Exact pixel-perfect alignment with reference screenshot.
 * FEATURES: Integrated stats hub, Blue shading overlay, Punjab map silhouette.
 * DATA: Dynamic registry counts (10,000+, 500+, 50+).
 */

export default function Hero() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats } = useDoc<any>(statsRef);

  const liveStats = useMemo(() => {
    const formatNumber = (num: number, fallback: string) => {
      if (!num) return fallback;
      if (num >= 1000) return (num / 1000).toFixed(0) + ',000+';
      return num.toString() + '+';
    };

    return {
      questions: formatNumber(stats?.totalQuestions, "10,000+"),
      mocks: formatNumber(stats?.totalMocks, "500+"),
      exams: formatNumber(stats?.totalBoards, "50+"),
      analytics: "Detailed"
    };
  }, [stats]);

  if (!mounted) return null;

  return (
    <section className="relative w-full bg-[#050B19] overflow-hidden min-h-[600px] md:h-[800px] flex flex-col justify-center">
      
      {/* 1. BACKGROUND LAYER STACK */}
      <div className="absolute inset-0 z-0">
        {/* Main Cinematic Image (Golden Temple) */}
        <motion.img 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          src="https://i.ibb.co/fYJttX5d/Gemini-Generated-Image-n1so6on1so6on1so.png" 
          alt="Golden Temple" 
          className="w-full h-full object-cover object-[center_35%]"
          referrerPolicy="no-referrer"
        />
        
        {/* Punjab Map Silhouette (Watermark) */}
        <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.08]">
           <div className="absolute top-[45%] left-[22%] -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[680px] md:h-[680px] bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ea/Outline_Map_of_Punjab_India.svg')] bg-contain bg-no-repeat grayscale invert" />
        </div>

        {/* BLUE CINEMATIC SHADING (MATCHED TO SCREENSHOT) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050B19] via-[#050B19]/70 to-transparent z-[15]" />
        
        {/* Bottom Fade to blend with next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050B19] to-transparent z-[15]" />
      </div>

      {/* 2. PRIMARY CONTENT HUB */}
      <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-20 pt-20 pb-40">
         <div className="max-w-full md:max-w-3xl space-y-6 md:space-y-8 text-left">
            
            {/* #1 Pill Badge */}
            <motion.div
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="inline-flex items-center gap-2 md:gap-3 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md px-4"
            >
               <Star className="h-3 w-3 md:h-4 md:w-4 text-orange-500 fill-current" />
               <span className="text-[8px] md:text-[11px] font-black text-white uppercase tracking-[0.25em]">
                  #1 Punjab Exam Preparation Platform
               </span>
            </motion.div>

            {/* Main Dual-Tone Heading */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="space-y-1 md:space-y-2"
            >
               <h1 className="text-4xl sm:text-5xl md:text-[85px] font-black text-white leading-[1.05] tracking-tight uppercase antialiased">
                  Prepare Smarter.<br/>
                  <span className="text-[#F97316]">Score Higher.</span>
               </h1>
               <p className="text-[14px] md:text-2xl text-slate-100 font-medium max-w-xs md:max-w-2xl leading-relaxed opacity-90 pt-2">
                  Punjab Government Exams di Complete Preparation ik hi Platform te.
               </p>
            </motion.div>

            {/* Tactical Buttons */}
            <motion.div
               initial={{ opacity: 0, y: 15 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="flex flex-row flex-wrap gap-3 md:gap-8 pt-4 md:pt-6"
            >
               <Button asChild className="h-12 md:h-16 px-8 md:px-14 bg-[#F97316] hover:bg-orange-600 text-white font-black uppercase text-[10px] md:text-[14px] tracking-[0.2em] rounded-xl md:rounded-2xl shadow-3xl gap-3 transition-all active:scale-95 border-none">
                  <Link href="/mocks" className="flex items-center">
                     Start Free Mock <ArrowRight className="h-4 w-4 md:h-5 md:w-5 ml-1" />
                  </Link>
               </Button>
               <Button asChild variant="outline" className="h-12 md:h-16 px-8 md:px-14 border-white/40 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] md:text-[14px] tracking-[0.2em] rounded-xl md:rounded-2xl transition-all backdrop-blur-xl border-[2px]">
                  <Link href="/exams">
                     Explore Exams
                  </Link>
               </Button>
            </motion.div>
         </div>
      </div>

      {/* 3. INTEGRATED BOTTOM STATS HUB (OVERLAY) */}
      <div className="absolute bottom-10 md:bottom-16 left-0 right-0 z-30">
         <div className="container mx-auto px-4 md:px-12 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
               <HeroStatCard 
                 icon={<BookOpen className="text-blue-400 h-5 w-5 md:h-8 md:w-8" />} 
                 val={liveStats.questions} 
                 label="Practice Questions" 
               />
               <HeroStatCard 
                 icon={<ClipboardList className="text-orange-400 h-5 w-5 md:h-8 md:w-8" />} 
                 val={liveStats.mocks} 
                 label="Mock Tests" 
               />
               <HeroStatCard 
                 icon={<ShieldCheck className="text-blue-500 h-5 w-5 md:h-8 md:w-8" />} 
                 val={liveStats.exams} 
                 label="Exams Covered" 
               />
               <HeroStatCard 
                 icon={<BarChart3 className="text-emerald-400 h-5 w-5 md:h-8 md:w-8" />} 
                 val={liveStats.analytics} 
                 label="Analytics" 
               />
            </div>
         </div>
      </div>
    </section>
  );
}

function HeroStatCard({ icon, val, label }: { icon: React.ReactNode, val: string, label: string }) {
  return (
    <Card className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-4 md:p-8 rounded-xl md:rounded-[2rem] text-left flex items-center gap-4 md:gap-6 group hover:bg-white/[0.06] transition-all duration-500 shadow-5xl">
       <div className="shrink-0 transition-transform group-hover:scale-110">
          {icon}
       </div>
       <div className="min-w-0 flex flex-col justify-center">
          <p className="text-xl md:text-[34px] font-black text-white leading-none tracking-tight tabular-nums">{val}</p>
          <p className="text-[7px] md:text-[12px] font-bold text-slate-500 tracking-widest mt-1 md:mt-2 truncate group-hover:text-slate-400 transition-colors uppercase">{label}</p>
       </div>
    </Card>
  )
}
