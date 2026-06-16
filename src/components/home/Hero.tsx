'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  Target, 
  Landmark, 
  ArrowRight,
  Star,
  ShieldCheck,
  LayoutGrid,
  FileText,
  Users,
  ClipboardCheck,
  CheckCircle2,
  FileStack
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';

/**
 * @fileOverview Official Cracklix High-Fidelity Hero v41.0.
 * UPDATED: Positioned student illustration above cards/CTAs in mobile stack.
 * UPDATED: Card titles set to uppercase to match provided reference screenshot.
 */

export default function Hero() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats, loading: statsLoading } = useDoc<any>(statsRef);

  const heroImage = "https://i.ibb.co/fYJttX5d/Gemini-Generated-Image-n1so6on1so6on1so.png";

  const liveStats = useMemo(() => {
    const format = (n: number, fallback: string) => {
      if (!n) return fallback;
      return n >= 1000 ? `${(n/1000).toFixed(0)}K+` : n.toString() + "+";
    };
    return [
      { label: "Questions", sub: "High quality practice questions", val: format(stats?.totalQuestions, "50K+"), icon: <Zap className="text-white fill-current" />, color: "bg-blue-600" },
      { label: "Mock Tests", sub: "Topic wise & full length mocks", val: format(stats?.totalMocks, "500+"), icon: <LayoutGrid className="text-white" />, color: "bg-indigo-600" },
      { label: "Exams", sub: "All major Punjab exams", val: format(stats?.totalBoards, "50+"), icon: <ShieldCheck className="text-white" />, color: "bg-emerald-600" },
      { label: "Aspirants", sub: "Trust Cracklix for preparation", val: format(stats?.totalUsers, "15K+"), icon: <Users className="text-white" />, color: "bg-orange-500" }
    ];
  }, [stats]);

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] pt-8 pb-16 md:pt-12 md:pb-24 text-left w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          
          {/* 1. HEADER TEXT BLOCK */}
          <div className="space-y-10 text-center lg:text-left order-1">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mx-auto lg:mx-0"
              >
                <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center">
                   <Star className="h-3 w-3 text-white fill-current" />
                </div>
                <span className="text-[10px] md:text-xs font-bold text-slate-600 tracking-widest">10,000+ Aspirants Trust Cracklix</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.05] antialiased">
                Crack Punjab <br />
                <span className="text-blue-600">Government Exams</span> <br />
                With Confidence
              </h1>
              
              <p className="text-base md:text-lg text-slate-500 font-medium max-w-xl leading-relaxed mx-auto lg:mx-0">
                Practice with high-quality mock tests, previous papers and exam-focused preparation for top Punjab exams.
              </p>

              {/* Recruitment Board Pills */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
                {["PSSSB", "Punjab Police", "PSTET", "PSPCL", "PPSC"].map((pill) => (
                  <div key={pill} className="bg-white border border-blue-600 text-blue-600 px-5 py-2 rounded-full font-black text-[10px] md:text-xs tracking-widest shadow-sm hover:bg-blue-50 transition-all cursor-default">
                    {pill}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. ILLUSTRATION HUB - sandwiching between text and cards on mobile */}
          <div className="relative flex items-center justify-center lg:justify-end w-full min-h-[350px] md:min-h-[500px] order-2 lg:row-span-2">
             <div className="relative w-full max-w-[280px] sm:max-w-[420px] md:max-w-[520px] lg:max-w-[620px] aspect-square flex items-center justify-center">
                
                {/* Center Image */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1 }}
                  className="relative z-10 w-full h-full flex items-center justify-center"
                >
                   <img 
                     src={heroImage}
                     className="w-full h-auto drop-shadow-3xl object-contain" 
                     alt="Cracklix Student" 
                     referrerPolicy="no-referrer"
                   />
                </motion.div>

                {/* Corner Floating Cards (Desktop/Tablet) */}
                <div className="absolute inset-0 pointer-events-none hidden md:block">
                  <FloatingNode 
                     position="top-[2%] left-[0%] lg:left-[-10%]"
                     icon={<Zap className="h-4 w-4 text-blue-600 fill-current" />}
                     title="Mock Tests"
                     delay={0.3}
                  />
                  <FloatingNode 
                     position="top-[2%] right-[0%] lg:right-[-10%]"
                     icon={<Landmark className="h-4 w-4 text-orange-500" />}
                     title="Punjab Exams"
                     delay={0.6}
                  />
                  <FloatingNode 
                     position="bottom-[5%] left-[0%] lg:left-[-15%]"
                     icon={<Target className="h-4 w-4 text-purple-600" />}
                     title="Daily Practice"
                     delay={0.5}
                  />
                  <FloatingNode 
                     position="bottom-[5%] right-[0%] lg:right-[-15%]"
                     icon={<FileStack className="h-4 w-4 text-emerald-600" />}
                     title="Previous Papers"
                     delay={0.4}
                  />
                </div>
             </div>
          </div>

          {/* 3. FEATURE CARDS & CTA HUB */}
          <div className="space-y-10 order-3">
             {/* Middle Feature Row - Labels set to UPPERCASE per request */}
             <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
                <FeatureCard icon={<ClipboardCheck className="text-blue-600" />} title="MOCK TESTS" sub="Exam-focused tests" />
                <FeatureCard icon={<FileText className="text-emerald-500" />} title="PREVIOUS PAPERS" sub="Verified paper bank" />
                <FeatureCard icon={<Target className="text-purple-600" />} title="DAILY PRACTICE" sub="Learn daily sessions" />
                <FeatureCard icon={<Landmark className="text-orange-500" />} title="PUNJAB EXAMS" sub="All state boards" />
             </div>

             {/* CTA HUB */}
             <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
               <Button asChild className="h-14 md:h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm tracking-widest rounded-2xl shadow-xl shadow-blue-600/20 gap-4 border-none transition-all active:scale-95">
                 <Link href="/mocks">Start Free Mock Test <ArrowRight className="h-5 w-5" /></Link>
               </Button>
               <Button asChild variant="outline" className="h-14 md:h-16 px-10 border-2 border-blue-600 bg-white text-blue-600 font-black text-sm tracking-widest rounded-2xl shadow-sm transition-all active:scale-95 hover:bg-blue-50">
                 <Link href="/exams">Browse Exams <ArrowRight className="h-5 w-5 ml-2" /></Link>
               </Button>
             </div>
          </div>
        </div>

        {/* BOTTOM STATS HUB */}
        <div className="mt-20 md:mt-32">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {liveStats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + (idx * 0.1) }}
                >
                  <Card className="border-none shadow-2xl rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 bg-white flex items-center gap-6 hover:translate-y-[-6px] transition-all border border-slate-100 group">
                    <div className={cn("h-14 w-14 md:h-16 md:w-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform", stat.color)}>
                      {stat.icon}
                    </div>
                    <div className="text-left space-y-1">
                      {statsLoading ? (
                        <Skeleton className="h-8 w-20 bg-slate-100" />
                      ) : (
                        <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none tabular-nums">{stat.val}</p>
                      )}
                      <p className="text-sm font-black text-slate-900 leading-none">{stat.label}</p>
                      <p className="text-[10px] font-medium text-slate-400 leading-tight">{stat.sub}</p>
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

function FeatureCard({ icon, title, sub }: { icon: React.ReactNode, title: string, sub: string }) {
   return (
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center lg:items-start text-center lg:text-left gap-2 group hover:shadow-md transition-all">
         <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
            {icon}
         </div>
         <div className="min-w-0">
            <h4 className="text-[11px] font-black text-slate-900 leading-tight truncate">{title}</h4>
            <p className="text-[9px] text-slate-400 font-medium leading-tight mt-0.5">{sub}</p>
         </div>
      </div>
   )
}

function FloatingNode({ position, icon, title, delay }: { position: string, icon: React.ReactNode, title: string, delay: number }) {
   return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.8 }}
        className={cn("absolute z-20 w-[140px] md:w-[180px] lg:w-[210px] hidden md:block", position)}
      >
         <Card className="p-3 md:p-5 rounded-xl md:rounded-2xl bg-white/95 backdrop-blur-xl border-none shadow-xl flex items-center gap-3 md:gap-4 group hover:shadow-2xl transition-all cursor-pointer pointer-events-auto">
            <div className="h-8 w-8 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-blue-50 transition-colors">
               {icon}
            </div>
            <p className="text-[9px] md:text-xs font-black text-slate-900 tracking-tight truncate leading-none">{title}</p>
         </Card>
      </motion.div>
   )
}
