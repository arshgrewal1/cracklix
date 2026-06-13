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
  ArrowRight,
  Map as MapIcon,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useDoc, useFirestore } from '@/firebase';
import { doc } from "firebase/firestore";

/**
 * @fileOverview Final High-Fidelity "Master Interface" Hero v25.0.
 * MATCHED: Screenshot hierarchy (Pill, Header, Map Outline, Buttons, Glassy Cards).
 * DATA: Integrated Real-Time Firestore metrics.
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
      questions: formatNumber(stats?.totalQuestions, "10,000+"),
      mocks: formatNumber(stats?.totalMocks, "500+"),
      exams: formatNumber(stats?.totalBoards, "50+"),
      analytics: "Detailed"
    };
  }, [stats]);

  if (!mounted) return null;

  return (
    <section className="relative w-full bg-[#020817] overflow-hidden flex flex-col items-center">
      
      {/* 1. CINEMATIC BACKGROUND LAYER */}
      <div className="w-full relative h-[250px] md:h-auto md:aspect-[21/9] bg-slate-900">
        <motion.img 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          src="https://i.ibb.co/fYJttX5d/Gemini-Generated-Image-n1so6on1so6on1so.png" 
          alt="Punjab Prep Background" 
          className="absolute inset-0 w-full h-full object-cover object-[center_35%]"
          referrerPolicy="no-referrer"
        />
        
        {/* SUBTLE MAP OVERLAY (MATCHED TO SCREENSHOT) */}
        <div className="absolute inset-0 z-10 pointer-events-none opacity-20">
           <div className="absolute top-1/2 left-[20%] -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ea/Outline_Map_of_Punjab_India.svg')] bg-contain bg-no-repeat grayscale invert" />
        </div>

        {/* SEMI-TRANSPARENT BLEND OVERLAYS */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent z-15" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020817] via-transparent to-transparent z-15 h-full opacity-80" />
        
        {/* TEXT CONTENT HUB */}
        <div className="absolute inset-0 z-20 flex items-center">
           <div className="container mx-auto px-4 md:px-12 max-w-7xl">
              <div className="max-w-[95vw] md:max-w-3xl space-y-2 md:space-y-6 text-left">
                 
                 <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-1.5 md:gap-3 py-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-md px-3 md:px-4"
                 >
                    <Star className="h-2 w-2 md:h-3.5 md:w-3.5 text-orange-500 fill-current" />
                    <span className="text-[7px] md:text-[10px] font-black text-white uppercase tracking-[0.2em]">
                       #1 Punjab Exam Preparation Platform
                    </span>
                 </motion.div>

                 <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-0.5 md:space-y-3"
                 >
                    <h1 className="text-2xl sm:text-4xl md:text-8xl font-black text-white leading-[1.1] tracking-tighter uppercase drop-shadow-2xl">
                       Prepare Smarter.<br/>
                       <span className="text-[#F97316]">Score Higher.</span>
                    </h1>
                    <p className="text-[10px] md:text-xl text-slate-100 font-medium max-w-xs md:max-w-2xl leading-tight opacity-90">
                       Punjab Government Exams di Complete Preparation ik hi Platform te.
                    </p>
                 </motion.div>

                 <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-row gap-3 md:gap-6 pt-3 md:pt-6"
                 >
                    <Button asChild className="h-10 md:h-16 px-6 md:px-12 bg-[#F97316] hover:bg-orange-600 text-white font-black uppercase text-[8px] md:text-[13px] tracking-[0.15em] rounded-lg md:rounded-2xl shadow-3xl gap-2 md:gap-3 transition-all active:scale-95 border-none">
                       <Link href="/mocks" className="flex items-center">
                          Start Free Mock <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-1" />
                       </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-10 md:h-16 px-6 md:px-12 border-white/20 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[8px] md:text-[13px] tracking-[0.15em] rounded-lg md:rounded-2xl transition-all backdrop-blur-xl">
                       <Link href="/exams">
                          Explore Exams
                       </Link>
                    </Button>
                 </motion.div>
              </div>
           </div>
        </div>
      </div>

      {/* 2. INTEGRATED GLASSY STATS HUB (MATCHED TO SCREENSHOT) */}
      <div className="w-full bg-[#020817] pt-2 pb-12 md:pt-0 md:pb-24 relative z-30">
         <div className="container mx-auto px-4 md:px-12 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-8">
               <HeroStatCard 
                 icon={<BookOpen className="text-blue-400 h-4 w-4 md:h-6 md:w-6" />} 
                 val={liveStats.questions} 
                 label="Practice Questions" 
               />
               <HeroStatCard 
                 icon={<ClipboardList className="text-[#F97316] h-4 w-4 md:h-6 md:w-6" />} 
                 val={liveStats.mocks} 
                 label="Mock Tests" 
               />
               <HeroStatCard 
                 icon={<ShieldCheck className="text-blue-500 h-4 w-4 md:h-6 md:w-6" />} 
                 val={liveStats.exams} 
                 label="Exams Covered" 
               />
               <HeroStatCard 
                 icon={<BarChart3 className="text-emerald-400 h-4 w-4 md:h-6 md:w-6" />} 
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
    <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 p-4 md:p-10 rounded-2xl md:rounded-[2.5rem] text-left flex items-center gap-4 md:gap-8 group hover:bg-white/10 transition-all duration-500 shadow-2xl">
       <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl flex items-center justify-center shrink-0 bg-white/[0.03] shadow-inner group-hover:scale-105 transition-transform">
          {icon}
       </div>
       <div className="min-w-0 space-y-0.5">
          <p className="text-base md:text-4xl font-black text-white leading-none tracking-tight tabular-nums">{val}</p>
          <p className="text-[7px] md:text-[10px] font-black uppercase text-slate-500 tracking-[0.1em] truncate">{label}</p>
       </div>
    </Card>
  )
}
