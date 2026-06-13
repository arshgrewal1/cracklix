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
 * @fileOverview Final Screenshot-Matched Hero v6.0.
 * UPDATED: Live Data Integration & High-Visibility Icons with optimized backgrounds.
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
      questions: formatNumber(stats?.totalQuestions, "10k+"),
      mocks: formatNumber(stats?.totalMocks, "500+"),
      exams: formatNumber(stats?.totalBoards, "50+"),
      analytics: "Detailed"
    };
  }, [stats]);

  if (!mounted) return null;

  return (
    <section className="relative w-full bg-[#020817] overflow-hidden flex flex-col items-center">
      {/* 1. FULL ASPECT BACKGROUND LAYER */}
      <div className="w-full relative aspect-[1024/576] min-h-[400px] md:min-h-0">
        <img 
          src="https://i.ibb.co/LXgcLVVq/Gemini-Generated-Image-n1so6on1so6on1so.png" 
          alt="Golden Temple Night" 
          className="absolute inset-0 w-full h-full object-cover md:object-fill"
          referrerPolicy="no-referrer"
        />
        
        {/* PAIRED OVERLAYS */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#020817] via-[#020817]/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020817] via-transparent to-transparent z-10" />
        
        {/* TEXT CONTENT HUB */}
        <div className="absolute inset-0 z-20 flex items-center">
           <div className="container mx-auto px-4 md:px-12 max-w-7xl">
              <div className="max-w-3xl space-y-6 md:space-y-8 text-left">
                 
                 <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl"
                 >
                    <Star className="h-3.5 w-3.5 text-orange-500 fill-current" />
                    <span className="text-[9px] md:text-xs font-black text-white uppercase tracking-widest">
                       #1 Punjab Exam Preparation Platform
                    </span>
                 </motion.div>

                 <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4 md:space-y-6"
                 >
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-[1] tracking-tighter uppercase pr-10">
                       Prepare Smarter.<br/>
                       <span className="text-primary italic pr-10">Score Higher.</span>
                    </h1>
                    <p className="text-sm md:text-xl text-slate-200 font-medium max-w-xl leading-relaxed pr-6 drop-shadow-lg">
                       Punjab Government Exams di Complete Preparation ik hi Platform te.
                    </p>
                 </motion.div>

                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col sm:flex-row gap-4 pt-6"
                 >
                    <Button asChild className="h-14 md:h-16 px-10 bg-primary hover:bg-orange-600 text-white font-black uppercase text-xs md:text-sm tracking-[0.1em] rounded-xl md:rounded-2xl shadow-4xl gap-3 border-none transition-all active:scale-95">
                       <Link href="/mocks">
                          Start Free Mock <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                       </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-14 md:h-16 px-10 border-white/40 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-xs md:text-sm tracking-[0.1em] rounded-xl md:rounded-2xl transition-all backdrop-blur-md">
                       <Link href="/exams">
                          Explore Exams
                       </Link>
                    </Button>
                 </motion.div>
              </div>
           </div>
        </div>
      </div>

      {/* 3. BOTTOM STATS BAR HUB (High-Visibility Icons) */}
      <div className="w-full bg-[#020817] pt-0 pb-12 md:pb-16 -mt-10 md:-mt-24 relative z-30">
         <div className="container mx-auto px-4 md:px-12 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
               <HeroStatCard 
                 icon={<BookOpen className="text-blue-400 h-5 w-5 md:h-7 md:w-7" />} 
                 iconBg="bg-blue-400/10 border border-blue-400/20"
                 val={liveStats.questions} 
                 label="Practice Questions" 
               />
               <HeroStatCard 
                 icon={<ClipboardList className="text-orange-400 h-5 w-5 md:h-7 md:w-7" />} 
                 iconBg="bg-orange-400/10 border border-orange-400/20"
                 val={liveStats.mocks} 
                 label="Mock Tests" 
               />
               <HeroStatCard 
                 icon={<ShieldCheck className="text-blue-400 h-5 w-5 md:h-7 md:w-7" />} 
                 iconBg="bg-blue-400/10 border border-blue-400/20"
                 val={liveStats.exams} 
                 label="Exams Covered" 
               />
               <HeroStatCard 
                 icon={<BarChart3 className="text-emerald-400 h-5 w-5 md:h-7 md:w-7" />} 
                 iconBg="bg-emerald-400/10 border border-emerald-400/20"
                 val={liveStats.analytics} 
                 label="Analytics" 
               />
            </div>
         </div>
      </div>
    </section>
  );
}

function HeroStatCard({ icon, val, label, iconBg }: { icon: React.ReactNode, val: string, label: string, iconBg: string }) {
  return (
    <Card className="bg-[#0B1528]/80 backdrop-blur-2xl border border-white/10 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] text-left flex items-center gap-4 md:gap-6 group hover:bg-[#0B1528] transition-all duration-500 shadow-2xl">
       <div className={cn("h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform", iconBg)}>
          {icon}
       </div>
       <div className="min-w-0">
          <p className="text-lg md:text-3xl font-black text-white leading-none mb-1 md:mb-2">{val}</p>
          <p className="text-[7px] md:text-[10px] font-black uppercase text-slate-500 tracking-widest truncate">{label}</p>
       </div>
    </Card>
  )
}
