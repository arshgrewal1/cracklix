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
 * @fileOverview Final "Same to Same" Master Hero v60.0.
 * MATCHED: Exact alignment, typography (Title Case), and colors from the user reference.
 * FEATURES: Punjab map watermark, Blue cinematic shading, Integrated glassy cards.
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
    <section className="relative w-full bg-[#050B19] overflow-hidden h-[700px] md:h-[850px] flex flex-col justify-center">
      
      {/* 1. BACKGROUND LAYER STACK */}
      <div className="absolute inset-0 z-0">
        <motion.img 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          src="https://i.ibb.co/fYJttX5d/Gemini-Generated-Image-n1so6on1so6on1so.png" 
          alt="Golden Temple" 
          className="w-full h-full object-cover object-[center_35%]"
          referrerPolicy="no-referrer"
        />
        
        {/* LARGE PUNJAB MAP WATERMARK (MATCHED POSITION) */}
        <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.12]">
           <div className="absolute top-[45%] left-[25%] -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[800px] md:h-[800px] bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ea/Outline_Map_of_Punjab_India.svg')] bg-contain bg-no-repeat grayscale invert" />
        </div>

        {/* BLUE CINEMATIC SHADING OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050B19] via-[#050B19]/85 to-transparent z-[15]" />
        
        {/* Bottom blending for cards */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#050B19]/50 to-transparent z-[15]" />
      </div>

      {/* 2. PRIMARY CONTENT HUB */}
      <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-20 pt-10 md:pt-0">
         <div className="max-w-full md:max-w-4xl space-y-6 md:space-y-10 text-left">
            
            {/* PIXEL-PERFECT HEADINGS - Title Case as requested */}
            <motion.div
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               className="space-y-0"
            >
               <h1 className="text-5xl sm:text-6xl md:text-[100px] font-black text-white leading-[0.95] tracking-tighter antialiased">
                  Prepare<br/>
                  Smarter.<br/>
                  <span className="text-[#F97316]">Score Higher.</span>
               </h1>
            </motion.div>

            <motion.p 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="text-[15px] md:text-2xl text-slate-100 font-medium max-w-2xl leading-relaxed opacity-95"
            >
               Punjab Government Exams di Complete Preparation ik hi Platform te.
            </motion.p>

            {/* TACTICAL BUTTONS */}
            <motion.div
               initial={{ opacity: 0, y: 15 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="flex flex-row flex-wrap gap-4 md:gap-8 pt-4"
            >
               <Button asChild className="h-12 md:h-16 px-8 md:px-14 bg-[#F97316] hover:bg-orange-600 text-white font-black uppercase text-[10px] md:text-[14px] tracking-[0.2em] rounded-xl md:rounded-2xl shadow-3xl gap-3 transition-all active:scale-95 border-none">
                  <Link href="/mocks" className="flex items-center">
                     START FREE MOCK <ArrowRight className="h-4 w-4 md:h-5 md:w-5 ml-1" />
                  </Link>
               </Button>
               <Button asChild variant="outline" className="h-12 md:h-16 px-8 md:px-14 border-white/30 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] md:text-[14px] tracking-[0.2em] rounded-xl md:rounded-2xl transition-all backdrop-blur-xl border-[2px]">
                  <Link href="/exams">
                     EXPLORE EXAMS
                  </Link>
               </Button>
            </motion.div>
         </div>
      </div>

      {/* 3. INTEGRATED BOTTOM STATS HUB (OVERLAY MATCH) */}
      <div className="absolute bottom-10 md:bottom-12 left-0 right-0 z-30">
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
                 label="Analytics Hub" 
               />
            </div>
         </div>
      </div>
    </section>
  );
}

function HeroStatCard({ icon, val, label }: { icon: React.ReactNode, val: string, label: string }) {
  return (
    <Card className="bg-black/30 backdrop-blur-3xl border border-white/10 p-5 md:p-10 rounded-[2rem] md:rounded-[3rem] text-left flex items-center gap-4 md:gap-8 group hover:bg-black/50 transition-all duration-500 shadow-5xl">
       <div className="shrink-0 transition-transform group-hover:scale-110">
          {icon}
       </div>
       <div className="min-w-0 flex flex-col justify-center">
          <p className="text-2xl md:text-[48px] font-black text-white leading-none tracking-tight tabular-nums">{val}</p>
          <p className="text-[7px] md:text-[11px] font-black text-slate-500 tracking-[0.1em] mt-2 md:mt-4 truncate uppercase leading-none">{label}</p>
       </div>
    </Card>
  )
}
