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
import PWAInstallButton from "@/components/PWAInstallButton";

/**
 * @fileOverview Final Restoration Hero v309.0.
 * FIXED: Background image alignment and PWA Install integration.
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
    <section className="relative w-full bg-[#050B19] overflow-hidden min-h-[500px] md:min-h-[600px] lg:h-[750px] flex flex-col justify-start text-left border-b border-white/5 pb-12 mt-[-100px] pt-[100px]">
      
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#050B19]">
        <motion.img 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          src="https://images.unsplash.com/photo-1594913366159-1832ffef8171?q=80&w=1920&auto=format&fit=crop" 
          alt="Golden Temple" 
          className="w-full h-full object-cover object-[center_35%] scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050B19] via-[#050B19]/50 to-transparent z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050B19]/30 via-transparent to-transparent z-[1]" />
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl relative z-[30] pt-12 md:pt-24">
         <div className="max-w-3xl space-y-6 md:space-y-8">
            
            <motion.div
               initial={{ opacity: 0, y: 5 }}
               animate={{ opacity: 1, y: 0 }}
               className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-1"
            >
               <Star className="h-3.5 w-3.5 text-[#F97316] fill-current" />
               <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">#1 PUNJAB PREP PLATFORM</span>
            </motion.div>

            <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="space-y-1"
            >
               <h1 className="text-4xl md:text-6xl lg:text-[80px] font-headline font-black text-white leading-[1] tracking-tighter uppercase drop-shadow-2xl">
                  PREPARE SMARTER.
               </h1>
               <h1 className="text-4xl md:text-6xl lg:text-[80px] font-headline font-black text-[#F97316] leading-[1] tracking-tighter uppercase drop-shadow-2xl">
                  SCORE HIGHER.
               </h1>
            </motion.div>

            <motion.p
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="text-base md:text-xl lg:text-2xl text-slate-100 font-bold max-w-2xl leading-relaxed antialiased drop-shadow-lg"
            >
               Punjab Government Exams di Complete Preparation ik hi Center te, Latest Official Patterns de Naal.
            </motion.p>

            <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="flex flex-wrap items-center gap-4 pt-4 md:pt-8"
            >
               <Button asChild className="h-14 md:h-16 px-10 md:px-14 bg-[#F97316] hover:bg-orange-600 text-white font-black text-xs md:text-sm tracking-[0.1em] rounded-2xl shadow-3xl transition-all border-none uppercase active:scale-95">
                  <Link href="/mocks" className="flex items-center gap-3">
                     Free Mock <ArrowRight className="h-5 w-5" />
                  </Link>
               </Button>
               
               <PWAInstallButton 
                 className="h-14 md:h-16 px-10 md:px-14 bg-white text-[#0B1528] hover:bg-slate-100 font-black text-xs md:text-sm tracking-[0.1em] rounded-2xl shadow-3xl transition-all border-none uppercase active:scale-95" 
                 variant="secondary"
               />

               <Button asChild variant="outline" className="h-14 md:h-16 px-10 md:px-14 border-white text-white font-black text-xs md:text-sm tracking-[0.1em] rounded-2xl transition-all backdrop-blur-md hover:bg-white/10 uppercase border-2 shadow-2xl">
                  <Link href="/exams">Exams</Link>
               </Button>
            </motion.div>
         </div>
      </div>

      <div className="mt-auto md:mt-24 z-[40]">
         <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
               {liveStats.map((stat, idx) => (
                  <motion.div key={stat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + (idx * 0.1) }}>
                     <Card className="bg-[#0B1528]/80 backdrop-blur-3xl border border-white/20 p-5 md:p-8 rounded-[2rem] text-left flex items-center gap-4 md:gap-6 group transition-all duration-300 shadow-2xl overflow-hidden h-24 md:h-32">
                        <div className="shrink-0 h-10 w-10 md:h-14 md:w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner">
                           {stat.icon}
                        </div>
                        <div className="min-w-0 flex flex-col justify-center leading-tight">
                           <p className="text-2xl md:text-4xl font-headline font-black text-white tabular-nums leading-none mb-1">{stat.val}</p>
                           <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] truncate">{stat.label}</p>
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
