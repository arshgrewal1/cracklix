'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardCheck,
  ShieldCheck,
  Users,
  Zap,
  Star,
  Target,
  FileStack,
  ArrowRight,
  Trophy,
  Landmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Official Cracklix Majestic Hero v8.0.
 * UPDATED: Expanded vertical span of floating nodes for a more cinematic framing.
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
      if (num >= 1000) return (num / 1000).toFixed(0) + 'K+';
      return num + "+";
    };

    return [
      { 
        id: "q", 
        icon: <Zap className="h-6 w-6 text-white fill-current" />, 
        circleBg: "bg-blue-600",
        valColor: "text-blue-600",
        val: formatNumber(stats?.totalQuestions, "50K+"), 
        label: "Questions", 
        sub: "High quality practice questions" 
      },
      { 
        id: "m", 
        icon: <ClipboardCheck className="h-6 w-6 text-white" />, 
        circleBg: "bg-indigo-600",
        valColor: "text-indigo-600",
        val: formatNumber(stats?.totalMocks, "500+"), 
        label: "Mock Tests", 
        sub: "Topic wise & full length mocks" 
      },
      { 
        id: "e", 
        icon: <ShieldCheck className="h-6 w-6 text-white" />, 
        circleBg: "bg-emerald-600",
        valColor: "text-emerald-600",
        val: formatNumber(stats?.totalBoards, "50+"), 
        label: "Exams", 
        sub: "All major Punjab exams" 
      },
      { 
        id: "u", 
        icon: <Users className="h-6 w-6 text-white" />, 
        circleBg: "bg-orange-500",
        valColor: "text-orange-500",
        val: formatNumber(stats?.totalUsers, "15K+"), 
        label: "Aspirants", 
        sub: "Trust Cracklix for preparation" 
      }
    ];
  }, [stats]);

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] py-12 md:py-24 border-b border-slate-100 text-left">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-50/50 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-4 space-y-16">
        
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-0 items-center">
          
          {/* LEFT: CONTENT HUB */}
          <div className="space-y-8 md:space-y-10 z-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
              <Star className="h-4 w-4 text-blue-600 fill-current" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">10,000+ Aspirants Trust Cracklix</span>
            </div>

            <div className="space-y-6">
               <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.05]">
                  Crack Punjab <br />
                  <span className="text-blue-600">Government Exams</span> <br />
                  With Confidence
               </h1>
               <p className="text-base md:text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
                  Practice with high-quality mock tests, previous papers and exam-focused preparation for top Punjab exams.
               </p>
            </div>

            <div className="flex flex-wrap gap-3">
               {["PSSSB", "Punjab Police", "PSTET", "PSPCL", "PPSC"].map((item) => (
                  <Badge key={item} variant="outline" className="px-5 py-2 rounded-full bg-white border-slate-200 text-blue-600 font-bold text-xs shadow-sm uppercase tracking-widest">
                    {item}
                  </Badge>
               ))}
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button asChild className="h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm tracking-widest rounded-2xl shadow-xl shadow-blue-600/20 gap-3 border-none transition-all active:scale-95">
                <Link href="/mocks">Start Free Mock Test <ArrowRight className="h-5 w-5" /></Link>
              </Button>
              <Button asChild variant="outline" className="h-16 px-10 border-2 border-blue-600 bg-white text-blue-600 font-black text-sm tracking-widest rounded-2xl hover:bg-blue-50 transition-all gap-3">
                <Link href="/exams">Browse Exams <ArrowRight className="h-5 w-5" /></Link>
              </Button>
            </div>
          </div>

          {/* RIGHT: ILLUSTRATION HUB - CENTERED & PROPORTIONAL */}
          <div className="relative flex justify-center items-center h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] w-full overflow-visible">
            
            {/* CENTRAL ILLUSTRATION WRAPPER */}
            <div className="relative w-full max-w-[320px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[650px] xl:max-w-[750px] aspect-square flex items-center justify-center">
                
                {/* FLOATING NODES - EXPANDED VERTICAL MAPPING */}
                {/* TOP LEFT: MOCK TESTS */}
                <FloatingNode 
                   icon={<Zap className="text-blue-600 h-5 w-5" />} 
                   label="Mock Tests" 
                   className="top-[-8%] left-[-10%] sm:left-[-5%] lg:left-[5%] xl:left-[10%]" 
                />

                {/* BOTTOM LEFT: DAILY PRACTICE */}
                <FloatingNode 
                   icon={<Target className="text-purple-600 h-5 w-5" />} 
                   label="Daily Practice" 
                   className="bottom-[-18%] left-[-10%] sm:left-[-5%] lg:left-[5%] xl:left-[10%]" 
                />

                {/* TOP RIGHT: PUNJAB EXAMS */}
                <FloatingNode 
                   icon={<Trophy className="text-orange-500 h-5 w-5" />} 
                   label="Punjab Exams" 
                   className="top-[-8%] right-[-10%] sm:right-[-5%] lg:right-[5%] xl:right-[10%]" 
                />

                {/* BOTTOM RIGHT: PREVIOUS PAPERS */}
                <FloatingNode 
                   icon={<FileStack className="text-emerald-500 h-5 w-5" />} 
                   label="Previous Papers" 
                   className="bottom-[-18%] right-[-10%] sm:right-[-5%] lg:right-[5%] xl:right-[10%]" 
                />

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-100/30 rounded-full blur-3xl -z-10" />
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="relative z-10 w-full"
                >
                  <img 
                    src="/images/hero-student.png" 
                    className="w-full h-auto drop-shadow-2xl" 
                    alt="Cracklix Student" 
                  />
                </motion.div>
            </div>
          </div>
        </div>

        {/* BOTTOM: STATS REGISTRY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-10 border-t border-slate-100">
           {liveStats.map((stat) => (
             <Card key={stat.id} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl flex items-center gap-6 group hover:shadow-2xl hover:translate-y-[-4px] transition-all text-left">
                <div className={cn("h-16 w-16 rounded-full flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform", stat.circleBg)}>
                  {stat.icon}
                </div>
                <div className="space-y-0.5 min-w-0">
                   <p className={cn("text-4xl font-black leading-none tracking-tighter", stat.valColor)}>{stat.val}</p>
                   <p className="text-base font-bold text-slate-900 tracking-tight">{stat.label}</p>
                   <p className="text-[10px] font-medium text-slate-400 leading-tight uppercase tracking-widest">{stat.sub}</p>
                </div>
             </Card>
           ))}
        </div>

      </div>
    </section>
  );
}

function FloatingNode({ icon, label, className }: { icon: React.ReactNode, label: string, className: string }) {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className={cn(
        "absolute z-20 bg-white p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col items-center gap-3 cursor-pointer transition-all hover:scale-105 active:scale-95 min-w-[110px] sm:min-w-[130px] md:min-w-[150px] lg:min-w-[180px]",
        className
      )}
    >
       <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-slate-50 flex items-center justify-center shrink-0 shadow-inner">
          {icon}
       </div>
       <span className="text-[9px] md:text-[11px] font-black text-[#0F172A] tracking-widest uppercase text-center leading-tight">
          {label}
       </span>
    </motion.div>
  );
}
