'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight,
  BookOpen,
  ClipboardList,
  ShieldCheck,
  BarChart3,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useDoc, useFirestore } from '@/firebase';
import { doc } from "firebase/firestore";

/**
 * @fileOverview High-Fidelity Hero Reconstruction v501.0.
 * FIXED: Cleaned template literal logic to prevent SyntaxError.
 * RESTORED: Stylized Golden Temple background and Punjab branding.
 */

export default function Hero() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats } = useDoc<any>(statsRef);

  const statsItems = useMemo(() => [
    { 
      icon: <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-blue-400" />, 
      val: stats?.totalQuestions ? (stats.totalQuestions >= 1000 ? `${(stats.totalQuestions/1000).toFixed(0)}k+` : `${stats.totalQuestions}+`) : "10,000+", 
      label: "Questions" 
    },
    { 
      icon: <ClipboardList className="h-5 w-5 md:h-6 md:w-6 text-orange-400" />, 
      val: stats?.totalMocks ? `${stats.totalMocks}+` : "500+", 
      label: "Mock Tests" 
    },
    { 
      icon: <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />, 
      val: stats?.totalBoards ? `${stats.totalBoards}+` : "50+", 
      label: "Exams Covered" 
    },
    { 
      icon: <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-emerald-400" />, 
      val: "Detailed", 
      label: "Analytics" 
    }
  ], [stats]);

  if (!mounted) return null;

  return (
    <section className="relative w-full bg-[#050B19] overflow-hidden min-h-[700px] lg:h-[800px] flex flex-col justify-center text-left pt-20">
      
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.img 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 1 }}
          src="https://i.ibb.co/LXgcLVVq/Gemini-Generated-Image-n1so6on1so6on1so.png" 
          alt="Golden Temple Hub" 
          className="absolute right-0 top-0 w-full h-full object-cover object-[center_35%] lg:object-[right_35%] lg:w-3/4"
          referrerPolicy="no-referrer"
        />
        
        <div className="absolute inset-y-0 left-0 w-full lg:w-1/2 z-10 pointer-events-none opacity-[0.04]">
           <svg viewBox="0 0 100 100" className="w-full h-full fill-white scale-150 -translate-x-1/4">
              <path d="M45,10 Q50,5 60,10 T75,20 T80,40 T70,60 T50,80 T30,70 T20,40 T30,20 Z" />
           </svg>
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-[#050B19] via-[#050B19] to-transparent lg:via-[#050B19]/80 z-[5]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050B19] via-transparent to-transparent z-[5]" />
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-16 max-w-[1440px] relative z-[20]">
        <div className="max-w-4xl space-y-8 md:space-y-10">
           
           <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
           >
              <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                <Star className="h-3 w-3 text-primary fill-current" />
              </div>
              <span className="text-[10px] md:text-xs font-black text-white/90 tracking-widest uppercase">#1 Punjab Exam Preparation Platform</span>
           </motion.div>

           <div className="space-y-2 md:space-y-4">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl lg:text-[88px] font-headline font-black text-white leading-[0.95] tracking-tight uppercase"
              >
                 Prepare Smarter.
              </motion.h1>
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl md:text-7xl lg:text-[88px] font-headline font-black text-primary leading-[0.95] tracking-tight uppercase"
              >
                 Score Higher.
              </motion.h1>
           </div>

           <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-2xl text-slate-300 font-medium max-w-2xl leading-relaxed antialiased"
           >
              Punjab Government Exams di Complete <br className="hidden md:block" />
              Preparation ik hi Platform te.
           </motion.p>

           <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-4 pt-4"
           >
              <Button asChild className="h-14 md:h-16 px-10 md:px-14 bg-primary hover:bg-orange-600 text-white font-black text-xs md:text-sm tracking-[0.1em] rounded-2xl shadow-3xl shadow-primary/20 transition-all border-none uppercase active:scale-95">
                 <Link href="/mocks" className="flex items-center gap-3">
                    Start Free Mock <ArrowRight className="h-5 w-5" />
                 </Link>
              </Button>
              <Button asChild variant="outline" className="h-14 md:h-16 px-10 md:px-14 bg-white/5 border-white/20 text-white hover:bg-white/10 font-black text-xs md:text-sm tracking-[0.1em] rounded-2xl transition-all backdrop-blur-md uppercase border-[1.5px] shadow-2xl">
                 <Link href="/exams">Explore Exams</Link>
              </Button>
           </motion.div>

           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pt-12 md:pt-20">
              {statsItems.map((item, idx) => (
                 <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + (idx * 0.1) }}
                    className="group"
                 >
                    <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-5 md:p-8 rounded-[2rem] text-left space-y-4 hover:bg-white/[0.06] transition-all duration-300 shadow-2xl min-h-[120px] flex flex-col justify-center">
                       <div className="flex items-center gap-5">
                          <div className="shrink-0 h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                             {item.icon}
                          </div>
                          <div className="min-w-0">
                             <p className="text-2xl md:text-3xl font-headline font-black text-white tabular-nums leading-none mb-1">{item.val}</p>
                             <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] truncate">{item.label}</p>
                          </div>
                       </div>
                    </div>
                 </motion.div>
              ))}
           </div>

        </div>
      </div>
    </section>
  );
}
