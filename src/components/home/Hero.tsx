'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  Target, 
  ChevronRight, 
  ClipboardList,
  ShieldCheck,
  Star,
  Activity,
  BarChart3,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useDoc, useFirestore } from '@/firebase';
import { doc } from "firebase/firestore";

/**
 * @fileOverview Final High-Fidelity Hero v18.0 (Vibrant & Permanent).
 * FIXED: Permanently set background to user-provided high-vibrancy asset.
 * FIXED: Reduced gradient opacity to 20% to prevent "black" look.
 * SCALE: Strictly 200px height on mobile for a slim website interface.
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
      if (num >= 1000) return (num / 1000).toFixed(1) + 'k+';
      return num.toString() + '+';
    };

    return {
      questions: formatNumber(stats?.totalQuestions, "439+"),
      mocks: formatNumber(stats?.totalMocks, "8+"),
      exams: formatNumber(stats?.totalBoards, "31+"),
      analytics: "Detailed"
    };
  }, [stats]);

  if (!mounted) return null;

  return (
    <section className="relative w-full bg-slate-900 overflow-hidden flex flex-col items-center">
      {/* 1. BACKGROUND LAYER - Strict 200px Mobile Fit */}
      <div className="w-full relative h-[200px] md:h-auto md:aspect-[21/9] bg-slate-900">
        <motion.img 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          src="https://i.ibb.co/fYJttX5d/Gemini-Generated-Image-n1so6on1so6on1so.png" 
          alt="Punjab Prep Background" 
          className="absolute inset-0 w-full h-full object-cover object-[center_35%]"
          referrerPolicy="no-referrer"
        />
        
        {/* ULTRA-LIGHT OVERLAYS - Bare minimum for readability, prevents "black" look */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10" />
        
        {/* TEXT CONTENT HUB */}
        <div className="absolute inset-0 z-20 flex items-center">
           <div className="container mx-auto px-4 md:px-12 max-w-7xl">
              <div className="max-w-[90vw] md:max-w-2xl space-y-1.5 md:space-y-6 text-left">
                 
                 <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-1 md:gap-3 py-0.5 rounded-full bg-black/20 border border-white/10 backdrop-blur-md px-2 md:px-3"
                 >
                    <Star className="h-1.5 w-1.5 md:h-3 md:w-3 text-orange-500 fill-current" />
                    <span className="text-[6px] md:text-xs font-black text-white uppercase tracking-widest">
                       #1 Punjab Prep
                    </span>
                 </motion.div>

                 <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-0.5 md:space-y-4"
                 >
                    <h1 className="text-[14px] sm:text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tighter uppercase break-words drop-shadow-2xl">
                       Prepare Smarter.<br/>
                       <span className="text-primary italic">Score Higher.</span>
                    </h1>
                    <p className="text-[7px] md:text-lg text-slate-100 font-bold max-w-xs md:max-w-lg leading-tight drop-shadow-lg opacity-100 truncate-mobile">
                       Official Recruitment Exam Preparation.
                    </p>
                 </motion.div>

                 <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-row gap-1.5 md:gap-4 pt-1"
                 >
                    <Button asChild className="h-7 md:h-16 px-3 md:px-10 bg-primary hover:bg-orange-600 text-white font-black uppercase text-[6px] md:text-xs tracking-[0.1em] rounded-sm md:rounded-2xl shadow-4xl gap-1 md:gap-2 transition-all active:scale-95 border-none">
                       <Link href="/mocks">
                          Free Mock <ArrowRight className="h-1.5 w-1.5 md:h-4 md:w-4" />
                       </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-7 md:h-16 px-3 md:px-10 border-white/20 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[6px] md:text-xs tracking-[0.1em] rounded-sm md:rounded-2xl transition-all backdrop-blur-md">
                       <Link href="/exams">
                          Exam Hub
                       </Link>
                    </Button>
                 </motion.div>
              </div>
           </div>
        </div>
      </div>

      {/* 2. BOTTOM STATS BAR HUB */}
      <div className="w-full bg-[#020817] pt-0 pb-8 md:pb-16 -mt-1 md:-mt-20 relative z-30">
         <div className="container mx-auto px-4 md:px-12 max-w-7xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 md:gap-6">
               <HeroStatCard 
                 icon={<BookOpen className="text-blue-500 h-3 w-3 md:h-5 md:w-5" />} 
                 iconBg="bg-blue-500/10 border border-blue-500/20"
                 val={liveStats.questions} 
                 label="QUESTIONS" 
               />
               <HeroStatCard 
                 icon={<ClipboardList className="text-[#F97316] h-3 w-3 md:h-5 md:w-5" />} 
                 iconBg="bg-[#F97316]/10 border border-[#F97316]/20"
                 val={liveStats.mocks} 
                 label="MOCK TESTS" 
               />
               <HeroStatCard 
                 icon={<ShieldCheck className="text-blue-400 h-3 w-3 md:h-5 md:w-5" />} 
                 iconBg="bg-blue-400/10 border border-blue-400/20"
                 val={liveStats.exams} 
                 label="EXAMS LIVE" 
               />
               <HeroStatCard 
                 icon={<BarChart3 className="text-emerald-400 h-3 w-3 md:h-5 md:w-5" />} 
                 iconBg="bg-emerald-400/10 border border-emerald-400/20"
                 val={liveStats.analytics} 
                 label="REPORT HUB" 
               />
            </div>
         </div>
      </div>
    </section>
  );
}

function HeroStatCard({ icon, val, label, iconBg }: { icon: React.ReactNode, val: string, label: string, iconBg: string }) {
  return (
    <Card className="bg-[#0B1528]/60 backdrop-blur-2xl border border-white/5 p-3 md:p-8 rounded-lg md:rounded-[2rem] text-left flex items-center gap-2.5 md:gap-6 group hover:bg-[#0B1528]/80 transition-all duration-500 shadow-2xl">
       <div className={cn("h-7 w-7 md:h-14 md:w-14 rounded-md md:rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform", iconBg)}>
          {icon}
       </div>
       <div className="min-w-0 space-y-0">
          <p className="text-sm md:text-4xl font-black text-white leading-none tracking-tight tabular-nums">{val}</p>
          <p className="text-[5px] md:text-9px font-black uppercase text-slate-500 tracking-[0.1em] truncate mt-0.5">{label}</p>
       </div>
    </Card>
  )
}
