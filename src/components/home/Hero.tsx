'use client';

import React, { useState, useEffect, useMemo } from "react";
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
  Search,
  Newspaper
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";

/**
 * @fileOverview Final High-Fidelity "Command Center" Hero v45.0.
 * DESIGN: Clean visual design with zero text overlays on the image area. 
 * STYLE: Advanced 3D-effect designed image wrapper with cinematic frame.
 * STABILITY: Resolved ReferenceErrors and Hydration mismatches.
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
    const qCount = stats?.totalQuestions || 50000;
    const mCount = stats?.totalMocks || 500;
    const uCount = stats?.totalUsers || 15000;
    const accuracy = stats?.averageAccuracy || 94;

    const format = (n: number) => n >= 1000 ? `${(n/1000).toFixed(0)}k+` : n.toString();

    return [
      { label: "Practice Questions", val: format(qCount), icon: <Zap className="h-5 w-5 text-primary" /> },
      { label: "Mock Tests", val: format(mCount), icon: <ClipboardList className="h-5 w-5 text-blue-400" /> },
      { label: "Active Aspirants", val: format(uCount), icon: <Users className="h-5 w-5 text-emerald-400" /> },
      { label: "Success Rate", val: `${accuracy}%`, icon: <Target className="h-5 w-5 text-rose-400" /> }
    ];
  }, [stats]);

  if (!mounted) {
    return (
      <section className="relative min-h-[90vh] bg-[#070D19] flex flex-col justify-center items-center w-full">
         <Zap className="h-10 w-10 text-primary animate-pulse" />
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex flex-col justify-center bg-[#070D19] overflow-hidden text-left pt-24 pb-16">
      {/* Background Atmosphere */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-b from-primary/10 to-transparent blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* 1. LEFT CONTENT HUB */}
          <div className="lg:col-span-7 space-y-8 md:space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-inner"
            >
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.15em] text-slate-300">
                Official Punjab Recruitment Registry
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter uppercase">
                CRACK PUNJAB <br />
                <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent italic">GOVT EXAMS</span>
              </h1>
              <p className="text-base md:text-xl text-slate-400 font-medium max-w-xl leading-relaxed antialiased">
                Prepare for PSSSB, Punjab Police, PPSC and other major state recruitments with pattern-based mocks and official PYQs.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-5"
            >
              <Button asChild className="h-16 px-10 bg-primary hover:bg-orange-600 text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-[1.2rem] shadow-4xl shadow-primary/20 transition-all active:scale-95 border-none gap-3">
                <Link href="/mocks">
                  Start Free Mock <Zap className="h-5 w-5 fill-current" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 px-10 border-white/10 bg-white/[0.02] hover:bg-white/[0.08] text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-[1.2rem] transition-all active:scale-95 gap-3">
                <Link href="/exams">
                  Explore Hubs <ChevronRight className="h-5 w-5" />
                </Link>
              </Button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-3 pt-4"
            >
              {["PSSSB", "POLICE", "PPSC", "PSPCL", "PSTET"].map((chip) => (
                <Badge key={chip} variant="outline" className="px-5 py-2 border-white/5 bg-white/[0.03] text-slate-500 font-black uppercase text-[9px] tracking-[0.2em] rounded-lg hover:border-primary/40 hover:text-white transition-all cursor-default shadow-sm">
                  {chip}
                </Badge>
              ))}
            </motion.div>
          </div>

          {/* 2. RIGHT VISUAL HUB (CLEAN DESIGNED IMAGE - ZERO TEXT) */}
          <div className="lg:col-span-5 relative justify-self-center w-full max-w-[480px]">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.8, ease: "easeOut" }}
               className="relative w-full"
             >
                {/* Visual Decoration Nodes */}
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

                {/* Primary Designed Image Wrapper */}
                <div className="relative group transition-all duration-700">
                   <div className="absolute -inset-1 bg-gradient-to-tr from-primary/30 to-blue-500/20 rounded-[3rem] blur-sm opacity-50 group-hover:opacity-100 transition-opacity" />
                   
                   <div className="relative aspect-[4/5] rounded-[2.5rem] md:rounded-[3rem] bg-[#0F172A] border-[8px] border-white/5 overflow-hidden shadow-5xl ring-1 ring-white/10">
                      <img 
                        src="https://i.ibb.co/gZCGMQNJ/IMG-20260612-WA0010.jpg" 
                        alt="Punjab Exam Readiness Hub"
                        className="w-full h-full object-cover opacity-90 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-100"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Artistic Overlays (Zero Text) */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#070D19] via-transparent to-transparent opacity-60" />
                      <div className="absolute inset-0 border-[2px] border-white/10 rounded-[2.5rem] m-2" />
                      
                      {/* Bottom Visual Integrated Plate */}
                      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center">
                         <div className="flex gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                         </div>
                      </div>
                   </div>
                </div>

                {/* Subtle Visual Corner Elements */}
                <div className="absolute top-10 left-10 h-12 w-12 border-t-2 border-l-2 border-primary/40 rounded-tl-xl pointer-events-none" />
                <div className="absolute bottom-10 right-10 h-12 w-12 border-b-2 border-r-2 border-primary/40 rounded-br-xl pointer-events-none" />
             </motion.div>
          </div>
        </div>

        {/* 3. INTEGRATED STATS HUB */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-24 lg:mt-32 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 border-t border-white/5 pt-12"
        >
          {displayStats.map((s, i) => (
            <Card key={i} className="border-none bg-white/[0.02] backdrop-blur-md rounded-2xl p-6 md:p-8 flex flex-col items-center md:items-start text-center md:text-left gap-4 group hover:bg-white/[0.04] transition-all duration-300 shadow-inner">
              <div className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:border-primary/30 transition-all">
                {s.icon}
              </div>
              <div className="space-y-1">
                <p className="text-3xl md:text-4xl font-headline font-black text-white tracking-tighter leading-none">{s.val}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{s.label}</p>
              </div>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
