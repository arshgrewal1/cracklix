'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  Target, 
  Trophy,
  ChevronRight, 
  ClipboardList,
  Users,
  Sparkles,
  Layers,
  BookOpen,
  BarChart3,
  CheckCircle2,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";

/**
 * @fileOverview High-Fidelity Screenshot Matched Hero v72.0.
 * FIXED: Added pr-10 padding guards to prevent character clipping (like the 'S' in EXAMS).
 * MATCHED: Night Temple Background and glassmorphism stat nodes.
 */

export default function Hero() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats } = useDoc<any>(statsRef);

  const displayStats = useMemo(() => {
    const qCount = stats?.totalQuestions || 10000;
    const mCount = stats?.totalMocks || 500;
    const eCount = stats?.totalExams || 50;
    const format = (n: number) => n >= 1000 ? `${(n/1000).toFixed(0)},000+` : `${n}+`;

    return [
      { label: "Practice Questions", val: format(qCount), icon: <BookOpen className="h-6 w-6 text-blue-400" /> },
      { label: "Mock Tests", val: format(mCount), icon: <ClipboardList className="h-6 w-6 text-orange-400" /> },
      { label: "Exams Covered", val: format(eCount), icon: <ShieldCheck className="h-6 w-6 text-blue-400" /> },
      { label: "Detailed Analytics", val: "Detailed", icon: <BarChart3 className="h-6 w-6 text-blue-400" />, sub: "Analytics" }
    ];
  }, [stats]);

  if (!mounted) return null;

  return (
    <section className="relative min-h-[650px] md:min-h-[90vh] flex flex-col justify-center overflow-hidden text-left pt-20 pb-16">
      {/* 1. BACKGROUND ENGINE */}
      <div className="absolute inset-0 z-0">
         <img 
           src="https://i.ibb.co/LXgcLVVq/Gemini-Generated-Image-n1so6on1so6on1so.png" 
           alt="Night Temple Background" 
           className="w-full h-full object-cover"
         />
         <div className="absolute inset-0 bg-gradient-to-r from-[#020817] via-[#020817]/95 to-transparent" />
         <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl space-y-10 md:space-y-12">
          
          {/* HEADER BADGE */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl"
          >
            <StarIcon className="h-4 w-4 text-orange-500 fill-current" />
            <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest">
              Punjab's #1 Exam Preparation Hub
            </span>
          </motion.div>

          {/* MAIN HEADLINE WITH CLIPPING GUARD */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter uppercase pr-10">
              Prepare Smarter. <br />
              <span className="text-primary italic">Score Higher.</span>
            </h1>
            <p className="text-base md:text-2xl text-slate-300 font-medium max-w-2xl leading-relaxed pr-10">
              Punjab Government Exams di Complete Preparation ik hi Hub te. Official Pattern Mocks and Verified Solutions.
            </p>
          </motion.div>

          {/* CTA BUTTONS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 pt-6"
          >
            <Button asChild className="h-16 md:h-20 px-10 md:px-14 bg-primary hover:bg-orange-600 text-white font-black uppercase text-xs md:text-sm tracking-[0.2em] rounded-2xl shadow-4xl gap-4 border-none transition-all active:scale-95">
              <Link href="/mocks">
                Start Free Mock <Zap className="h-5 w-5 md:h-6 md:w-6 fill-current" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 md:h-20 px-10 md:px-14 border-white/20 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-xs md:text-sm tracking-[0.2em] rounded-2xl transition-all backdrop-blur-md">
              <Link href="/exams">
                Explore Hubs
              </Link>
            </Button>
          </motion.div>

          {/* SCREENSHOT STATS HUB */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {displayStats.map((s, i) => (
              <Card key={i} className="border-none bg-white/[0.03] backdrop-blur-2xl rounded-[1.5rem] p-6 md:p-8 flex items-center gap-6 border border-white/10 shadow-4xl group hover:bg-white/[0.06] transition-all">
                <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  {s.icon}
                </div>
                <div className="text-left space-y-0.5 min-w-0">
                  <p className="text-2xl md:text-3xl font-black text-white leading-none tracking-tighter truncate">{s.val}</p>
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest truncate">{s.label}</p>
                </div>
              </Card>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StarIcon({ className }: any) {
   return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
         <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
   )
}
