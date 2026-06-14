'use client';

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Zap, GraduationCap, Landmark, ShieldCheck, Star, ChevronRight, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";

/**
 * @fileOverview Refined Official Hero Hub v125.0.
 * MATCHED: Header style to user reference image (Icon + Spaced Label + Split Heading).
 */

export default function Hero() {
  const db = useFirestore();
  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats } = useDoc<any>(statsRef);

  // REGISTRY LIVE AUDIT
  const liveStats = useMemo(() => {
    const qCount = stats?.totalQuestions || 10000;
    const boardCount = stats?.totalBoards || 50;
    const format = (n: number) => n >= 1000 ? `${(n/1000).toFixed(0)}K+` : n.toString();

    return {
      portals: format(boardCount),
      questions: format(qCount),
      verified: "100%",
      reports: "Live"
    };
  }, [stats]);

  return (
    <section className="relative w-full bg-[#0A0E1A] bg-radial-at-t from-gray-900 via-[#0A0E1A] to-[#0A0E1A] font-body text-left overflow-hidden min-h-[700px] lg:min-h-[850px] flex flex-col justify-center border-b border-white/5">
      
      {/* 1. MAIN CONTENT HUB */}
      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-20 pt-16 lg:pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* LEFT: REFERENCE MATCHED HEADLINES */}
          <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center lg:justify-start gap-4"
            >
              <div className="h-10 w-10 md:h-12 md:w-12 bg-orange-50 rounded-2xl flex items-center justify-center text-primary shadow-inner shrink-0">
                <Landmark className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-slate-400">
                OFFICIAL EXAM PORTAL
              </span>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-1"
            >
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.95] uppercase">
                PREPARE <span className="text-white opacity-90">SMARTER.</span><br />
                <span className="text-primary">ACHIEVE HIGHER.</span>
              </h1>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-sm sm:text-lg lg:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
            >
              Punjab Government Exams di complete preparation ik hi center te. <span className="text-white font-bold">Latest PSSSB & PPSC patterns</span> de naal design kite mock tests.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4"
            >
              <Button asChild className="w-full sm:w-auto h-14 md:h-16 px-10 bg-primary hover:bg-orange-600 text-white font-black uppercase text-[10px] md:text-xs tracking-widest rounded-2xl shadow-3xl shadow-primary/20 transition-all border-none group">
                <Link href="/exams" className="flex items-center gap-2">Choose Your Portal <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></Link>
              </Button>
              <Button asChild className="w-full sm:w-auto h-14 md:h-16 px-10 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-black uppercase text-[10px] md:text-xs rounded-2xl shadow-xl transition-all border-none">
                <Link href="/mocks">Free Mock Tests</Link>
              </Button>
            </motion.div>
          </div>

          {/* RIGHT: POLISHED EXAM PORTALS */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
             <div className="absolute -inset-4 bg-orange-500/5 blur-3xl rounded-full pointer-events-none"></div>

             <ExamPortalCard 
               logoUrl="https://sssb.punjab.gov.in/wp-content/themes/ssbtheme/images/punjab-gov.svg"
               tag="PSSSB" 
               title="Patwari & Clerk" 
               desc="Full syllabus mocks & GK trackers."
               color="orange"
               href="/exams/category/punjab-govt"
             />
             <ExamPortalCard 
               logoUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR8W5eTBPdzztA7cziqnMmtWk9InL1yflUD_xb4vAsLw&s=10"
               tag="PPSC" 
               title="PCS & Analysts" 
               desc="Higher Class B pattern series."
               color="blue"
               href="/exams/category/punjab-govt"
             />
             <ExamPortalCard 
               logoUrl="https://www.pspcl.in/images/logo.png"
               tag="PSPCL" 
               title="JE & ALM Hub" 
               desc="Technical banks & Power papers."
               color="emerald"
               href="/exams/category/punjab-technical"
             />
             <ExamPortalCard 
               logoUrl="https://static.pseb.ac.in/newweb/images/pseb-logo.png"
               tag="TEACHING" 
               title="PSTET & Cadres" 
               desc="Pedagogy & subject master series."
               color="purple"
               href="/exams/category/punjab-teaching"
             />
          </div>
        </div>

        {/* 2. TRUST REGISTRY STRIP */}
        <section className="mt-16 md:mt-28 w-full">
           <div className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center shadow-4xl backdrop-blur-md">
              <TrustNode val={liveStats.portals} label="Specialized Portals" />
              <TrustNode val={liveStats.questions} label="State Questions" />
              <TrustNode val={liveStats.verified} label="Verified Solutions" />
              <TrustNode val={liveStats.reports} label="Live Ranking" />
           </div>
        </section>
      </div>
    </section>
  );
}

function ExamPortalCard({ logoUrl, tag, title, desc, color, href }: any) {
  const colorStyles: any = {
    orange: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-6 rounded-[2rem] bg-[#111827]/60 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all shadow-5xl flex flex-col justify-between group h-full text-left"
    >
       <div className="space-y-5">
          <div className="flex items-center justify-between">
             <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center p-2 shadow-inner overflow-hidden">
                <img src={logoUrl} alt={tag} className="w-full h-full object-contain" />
             </div>
             <Badge className={cn("border-none text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded shadow-sm", colorStyles[color])}>
                {tag}
             </Badge>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight leading-none group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-1">{desc}</p>
          </div>
       </div>
       <Button asChild className="mt-8 w-full h-11 bg-white/5 border border-white/5 group-hover:bg-primary text-slate-400 group-hover:text-white font-black uppercase text-[9px] tracking-widest rounded-xl transition-all shadow-sm border-none active:scale-95">
          <Link href={href}>Start Practice</Link>
       </Button>
    </motion.div>
  );
}

function TrustNode({ val, label }: any) {
  return (
    <div className="space-y-1">
       <h4 className="text-3xl sm:text-5xl font-black text-white tracking-tighter tabular-nums">{val}</h4>
       <p className="text-[9px] md:text-[11px] text-slate-500 uppercase font-black tracking-widest">{label}</p>
    </div>
  )
}
