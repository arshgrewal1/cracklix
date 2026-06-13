'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  ArrowRight,
  ClipboardList,
  ShieldCheck,
  Star,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useDoc, useFirestore } from '@/firebase';
import { doc } from "firebase/firestore";

/**
 * @fileOverview Final Calibrated Mobile-First Hero v226.0.
 * UPDATED: Responsive headings and fluid layout for 320px screens.
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

    return [
      { id: 'q', icon: <BookOpen className="text-blue-400 h-4 w-4 md:h-6 md:w-6" />, val: formatNumber(stats?.totalQuestions, "439+"), label: "Questions" },
      { id: 'm', icon: <ClipboardList className="text-orange-400 h-4 w-4 md:h-6 md:w-6" />, val: formatNumber(stats?.totalMocks, "8+"), label: "Mocks" },
      { id: 'e', icon: <ShieldCheck className="text-blue-500 h-4 w-4 md:h-6 md:w-6" />, val: formatNumber(stats?.totalBoards, "92+"), label: "Exams" },
      { id: 'u', icon: <Users className="text-emerald-400 h-4 w-4 md:h-6 md:w-6" />, val: formatNumber(stats?.totalUsers, "5+"), label: "Aspirants" }
    ];
  }, [stats]);

  if (!mounted) return null;

  return (
    <section className="relative w-full bg-[#050B19] overflow-hidden min-h-[450px] md:h-[650px] lg:h-[750px] flex flex-col justify-start text-left border-b border-white/5 pb-16 md:pb-24">
      
      {/* 1. BACKGROUND ENGINE */}
      <div className="absolute inset-0 z-0">
        <motion.img 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          src="https://i.ibb.co/fYJttX5d/Gemini-Generated-Image-n1so6on1so6on1so.png" 
          alt="Official Punjab Prep Hub" 
          className="w-full h-full object-cover object-right md:object-center"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050B19] via-[#050B19]/80 to-transparent z-[10]" />
        <div className="absolute top-[15%] left-[35%] w-[150px] h-[150px] bg-[#050B19] blur-[100px] z-[11] opacity-90 rounded-full pointer-events-none" />
      </div>

      {/* 2. CONTENT HUB */}
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl relative z-[30] pt-10 md:pt-20 lg:pt-32">
         <div className="max-w-3xl space-y-4 md:space-y-6">
            
            <motion.div
               initial={{ opacity: 0, y: 5 }}
               animate={{ opacity: 1, y: 0 }}
               className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-2"
            >
               <Star className="h-4 w-4 text-[#F97316] fill-current animate-pulse" />
               <span className="text-[10px] md:text-xs font-black text-white tracking-[0.2em] uppercase">#1 PUNJAB PREP PLATFORM</span>
            </motion.div>

            <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="space-y-1 md:space-y-2"
            >
               <h1 className="text-[28px] xs:text-[36px] sm:text-5xl md:text-7xl lg:text-8xl font-headline font-black text-white leading-[1.05] tracking-tight uppercase">
                  Prepare smarter.
               </h1>
               <h1 className="text-[28px] xs:text-[36px] sm:text-5xl md:text-7xl lg:text-8xl font-headline font-black text-[#F97316] leading-[1.05] tracking-tight uppercase">
                  Score higher.
               </h1>
            </motion.div>

            <motion.p
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="text-sm md:text-xl lg:text-2xl text-slate-300 font-medium max-w-2xl leading-relaxed antialiased"
            >
               Punjab Government Exams di Complete Preparation <br className="hidden sm:block" />
               ik hi Hub te, Latest Official Patterns de Naal.
            </motion.p>

            <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="flex flex-col sm:flex-row gap-4 pt-6 md:pt-12"
            >
               <Button asChild className="h-14 md:h-18 px-10 md:px-16 bg-[#F97316] hover:bg-orange-600 text-white font-black text-[12px] md:sm lg:text-lg tracking-[0.1em] rounded-2xl md:rounded-[2.5rem] shadow-3xl transition-all border-none uppercase active:scale-95">
                  <Link href="/mocks" className="flex items-center gap-3">
                     Free Mock <ArrowRight className="h-5 w-5" />
                  </Link>
               </Button>
               <Button asChild variant="outline" className="h-14 md:h-18 px-10 md:px-16 border-white/20 bg-white/5 text-white font-black text-[12px] md:sm lg:text-lg tracking-[0.1em] rounded-2xl md:rounded-[2.5rem] transition-all backdrop-blur-md hover:bg-white/10 uppercase active:scale-95">
                  <Link href="/exams">
                     Explore Exams
                  </Link>
               </Button>
            </motion.div>
         </div>
      </div>

      {/* 3. INTEGRATED BOTTOM DATA BAR */}
      <div className="mt-12 md:absolute md:bottom-12 md:left-0 md:right-0 z-[40]">
         <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl">
            <div className="flex flex-row md:grid md:grid-cols-4 gap-3 md:gap-6 overflow-x-auto no-scrollbar pb-6 md:pb-0 snap-x">
               {liveStats.map((stat, idx) => (
                  <motion.div
                     key={stat.id}
                     initial={{ opacity: 0, y: 5 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.4 + (idx * 0.1) }}
                     className="shrink-0 flex-1 md:flex-none min-w-[150px] md:min-w-0 snap-center"
                  >
                     <Card className="bg-[#0B1528]/70 backdrop-blur-3xl border border-white/10 p-4 md:p-6 lg:p-8 rounded-[2rem] md:rounded-[3rem] text-left flex items-center gap-4 md:gap-6 group hover:bg-[#0B1528] transition-all duration-300 shadow-2xl overflow-hidden h-20 md:h-28 lg:h-36 w-full">
                        <div className="shrink-0 h-11 w-11 md:h-16 md:w-16 lg:h-20 lg:w-20 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner">
                           {stat.icon}
                        </div>
                        <div className="min-w-0 flex flex-col justify-center leading-tight">
                           <p className="text-xl md:text-4xl lg:text-5xl font-headline font-black text-white tabular-nums leading-none mb-1">{stat.val}</p>
                           <p className="text-[9px] md:text-[11px] lg:text-[13px] font-black text-slate-500 uppercase tracking-widest truncate">
                              {stat.label}
                           </p>
                        </div>
                     </Card>
                  </motion.div>
               ))}
            </div>
         </div>
      </div>
    </section>
  );
}
