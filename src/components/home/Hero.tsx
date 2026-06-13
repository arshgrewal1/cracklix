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
import Link from "next/link";
import { useDoc, useFirestore } from '@/firebase';
import { doc } from "firebase/firestore";

/**
 * @fileOverview Final Calibrated Hero v251.0.
 * RESTORED: Golden Temple background image with optimized positioning.
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
      { id: 'q', icon: <BookOpen className="text-blue-400 h-4 w-4 md:h-5 md:w-5" />, val: formatNumber(stats?.totalQuestions, "439+"), label: "QUESTIONS" },
      { id: 'm', icon: <ClipboardList className="text-orange-400 h-4 w-4 md:h-5 md:w-5" />, val: formatNumber(stats?.totalMocks, "8+"), label: "MOCKS" },
      { id: 'e', icon: <ShieldCheck className="text-blue-500 h-4 w-4 md:h-5 md:w-5" />, val: formatNumber(stats?.totalBoards, "92+"), label: "EXAMS" },
      { id: 'u', icon: <Users className="text-emerald-400 h-4 w-4 md:h-5 md:w-5" />, val: formatNumber(stats?.totalUsers, "5+"), label: "ASPIRANTS" }
    ];
  }, [stats]);

  if (!mounted) return null;

  return (
    <section className="relative w-full bg-[#050B19] overflow-hidden min-h-[500px] md:min-h-[550px] lg:h-[650px] flex flex-col justify-start text-left border-b border-white/5 pb-8 md:pb-12">
      
      {/* RESTORED GOLDEN TEMPLE BACKGROUND */}
      <div className="absolute top-[-40px] left-0 right-0 h-[calc(100%+40px)] z-0 overflow-hidden bg-[#050B19]">
        <motion.img 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          src="https://images.unsplash.com/photo-1594913366159-1832ffef8171?auto=format&fit=crop&q=80&w=1920" 
          alt="Golden Temple Punjab" 
          className="w-full h-full object-cover object-[center_30%] opacity-40 scale-105"
          referrerPolicy="no-referrer"
          data-ai-hint="golden temple"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050B19]/40 via-[#050B19]/80 to-[#050B19] z-[10]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050B19] via-transparent to-transparent z-[10] hidden md:block" />
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl relative z-[30] pt-12 md:pt-20">
         <div className="max-w-3xl space-y-4 md:space-y-6">
            
            <motion.div
               initial={{ opacity: 0, y: 5 }}
               animate={{ opacity: 1, y: 0 }}
               className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-1"
            >
               <Star className="h-3 w-3 md:h-3.5 md:w-3.5 text-[#F97316] fill-current animate-pulse" />
               <span className="text-[9px] md:text-[10px] font-black text-white tracking-[0.2em] uppercase">#1 PUNJAB PREP PLATFORM</span>
            </motion.div>

            <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="space-y-1"
            >
               <h1 className="text-[28px] xs:text-[36px] sm:text-4xl md:text-6xl font-headline font-black text-white leading-[1.05] tracking-tighter uppercase">
                  Prepare smarter.
               </h1>
               <h1 className="text-[28px] xs:text-[36px] sm:text-4xl md:text-6xl font-headline font-black text-[#F97316] leading-[1.05] tracking-tighter uppercase">
                  Score higher.
               </h1>
            </motion.div>

            <motion.p
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="text-sm md:text-base lg:text-xl text-slate-300 font-medium max-w-2xl leading-relaxed antialiased"
            >
               Punjab Government Exams di Complete Preparation <br className="hidden sm:block" />
               ik hi Center te, Latest Official Patterns de Naal.
            </motion.p>

            <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="flex flex-wrap gap-4 pt-6"
            >
               <Button asChild className="h-12 md:h-16 px-8 md:px-12 bg-[#F97316] hover:bg-orange-600 text-white font-black text-xs md:text-sm tracking-[0.1em] rounded-xl md:rounded-2xl shadow-3xl transition-all border-none uppercase active:scale-95">
                  <Link href="/mocks" className="flex items-center gap-2">
                     Free Mock <ArrowRight className="h-5 w-5" />
                  </Link>
               </Button>
               
               <Button asChild variant="outline" className="h-12 md:h-16 px-8 md:px-12 border-white/20 bg-white/5 text-white font-black text-xs md:text-sm tracking-[0.1em] rounded-xl md:rounded-2xl transition-all backdrop-blur-md hover:bg-white/10 uppercase active:scale-95">
                  <Link href="/exams">
                     Exams
                  </Link>
               </Button>
            </motion.div>
         </div>
      </div>

      <div className="mt-12 md:mt-16 z-[40]">
         <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 lg:gap-8">
               {liveStats.map((stat, idx) => (
                  <motion.div
                     key={stat.id}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.4 + (idx * 0.1) }}
                  >
                     <Card className="bg-[#0B1528]/80 backdrop-blur-3xl border border-white/10 p-3 md:p-5 rounded-[1.5rem] md:rounded-[2rem] text-left flex items-center gap-3 md:gap-4 group hover:bg-[#0B1528] transition-all duration-300 shadow-2xl overflow-hidden h-20 md:h-28 lg:h-32 w-full">
                        <div className="shrink-0 h-10 w-10 md:h-14 md:w-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner">
                           {stat.icon}
                        </div>
                        <div className="min-w-0 flex flex-col justify-center leading-tight">
                           <p className="text-xl md:text-3xl lg:text-4xl font-headline font-black text-white tabular-nums leading-none mb-0.5 md:mb-1">{stat.val}</p>
                           <p className="text-[7px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] truncate">
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