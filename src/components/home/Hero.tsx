'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardCheck,
  ShieldCheck,
  Users,
  Zap,
  ChevronRight,
  BookOpen,
  Star,
  Target,
  FileStack,
  ArrowRight,
  Trophy,
  CheckCircle2,
  Landmark,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Majestic Hero Hub v24.0 (Uniform Node Calibration).
 * UPDATED: Standardized icon node sizes and shifted vertical positions downwards.
 * UPDATED: Bottom nodes positioned at the base (2%) and top nodes lowered to 18%.
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
        icon: <Zap className="h-6 w-6 text-blue-600 fill-current" />, 
        circleBg: "bg-blue-50",
        valColor: "text-blue-600",
        val: formatNumber(stats?.totalQuestions, "50K+"), 
        label: "Questions", 
        sub: "Practice daily" 
      },
      { 
        id: "m", 
        icon: <ClipboardCheck className="h-6 w-6 text-blue-700" />, 
        circleBg: "bg-blue-50",
        valColor: "text-blue-700",
        val: formatNumber(stats?.totalMocks, "500+"), 
        label: "Mock Tests", 
        sub: "Latest patterns" 
      },
      { 
        id: "e", 
        icon: <ShieldCheck className="h-6 w-6 text-blue-600" />, 
        circleBg: "bg-blue-50",
        valColor: "text-blue-600",
        val: formatNumber(stats?.totalBoards, "50+"), 
        label: "Exams", 
        sub: "Verified boards" 
      },
      { 
        id: "u", 
        icon: <Users className="h-6 w-6 text-blue-500" />, 
        circleBg: "bg-blue-50",
        valColor: "text-blue-500",
        val: formatNumber(stats?.totalUsers, "15K+"), 
        label: "Aspirants", 
        sub: "Trust Cracklix" 
      }
    ];
  }, [stats]);

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] pb-12 md:pb-24 border-b border-slate-100 text-left">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-50/50 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-4 pt-4 md:pt-8 space-y-8">
         
         <div className="flex items-center justify-center lg:hidden mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-100 shadow-sm">
               <Star className="h-3 w-3 text-blue-600 fill-current" />
               <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">10,000+ Trust Us</span>
            </div>
         </div>

         <div className="lg:hidden text-center space-y-3">
            <h1 className="text-[28px] sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-[1.1] uppercase">
              Prepare smarter.
            </h1>
            <h1 className="text-[28px] sm:text-4xl font-extrabold tracking-tight text-blue-600 leading-[1.1] uppercase">
              Score higher.
            </h1>
            <p className="text-xs text-slate-500 font-medium px-4">
              Punjab Govt Exams di Complete Preparation <br /> ik hi Hub te, Latest Pattern de Naal.
            </p>
         </div>

         <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/50 backdrop-blur-sm p-3 rounded-2xl border border-slate-100 w-full">
            <span>PSSSB</span> <span className="text-blue-200 opacity-50">•</span>
            <span>PCS</span> <span className="text-blue-200 opacity-50">•</span>
            <span>PSPCL</span> <span className="text-blue-200 opacity-50">•</span>
            <span>CTET</span> <span className="text-blue-200 opacity-50">•</span>
            <span>PSTET</span>
         </div>

         <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-10">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
                  <div className="bg-blue-600 rounded-full p-0.5"><Star className="h-3 w-3 text-white fill-current" /></div>
                  <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">10,000+ Aspirants Trust Us</span>
               </div>
               
               <div className="space-y-4">
                  <h1 className="text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] uppercase">
                    Prepare smarter. <br />
                    <span className="text-blue-600">Score higher.</span>
                  </h1>
                  <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
                    Practice with bilingual mock tests, previous papers and exam-focused preparation for PSSSB, Police, and more.
                  </p>
               </div>

               <div className="flex gap-4">
                  <Button asChild className="h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm tracking-widest rounded-2xl shadow-xl shadow-blue-600/20 gap-3 border-none transition-all active:scale-95">
                     <Link href="/exams" className="flex items-center gap-2">Start Learning <ChevronRight className="h-5 w-5" /></Link>
                  </Button>
                  <Button asChild variant="outline" className="h-16 px-10 border-2 border-blue-600 bg-white text-blue-600 font-black text-sm tracking-widest rounded-2xl hover:bg-blue-50 transition-all gap-3">
                     <Link href="/mocks" className="flex items-center gap-2">Take Free Mock Test <ArrowRight className="h-5 w-5" /></Link>
                  </Button>
               </div>
            </div>

            <div className="relative flex justify-center lg:pl-8">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-blue-100/40 rounded-full blur-3xl -z-10" />
               <motion.img 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src="/images/hero-student.png" 
                  className="w-full max-w-[620px] h-auto object-contain relative z-10"
                  alt="Cracklix Student"
               />
               
               {/* DESKTOP FLOATING NODES - SHIFTED DOWN */}
               <FloatingNode icon={<Zap className="text-blue-600 h-6 w-6 fill-current" />} label="MOCK TESTS" className="lg:top-[18%] lg:left-[5%]" link="/mocks" />
               <FloatingNode icon={<Landmark className="text-blue-600 h-6 w-6" />} label="PUNJAB EXAMS" className="lg:top-[18%] lg:right-[5%]" link="/exams" />
               
               <FloatingNode icon={<FileStack className="text-blue-600 h-6 w-6" />} label="PREVIOUS PAPERS" className="lg:bottom-[2%] lg:left-[2%]" link="/pyqs" />
               <FloatingNode icon={<Target className="text-blue-600 h-6 w-6" />} label="DAILY PRACTICE" className="lg:bottom-[2%] lg:right-[2%]" link="/current-affairs" />
            </div>
         </div>

         <div className="lg:hidden relative flex flex-col items-center w-full px-0">
            <div className="relative w-full max-w-[480px] aspect-square flex items-center justify-center overflow-visible">
               <div className="absolute inset-0 bg-blue-100/30 rounded-full blur-2xl -z-10" />
               <img src="/images/hero-student.png" className="w-full h-full object-contain relative z-10" alt="Student" />
               
               {/* MOBILE FLOATING NODES - SHIFTED DOWN */}
               <FloatingNode icon={<Zap className="text-blue-600 h-5 w-5 fill-current" />} label="MOCK TESTS" className="top-[12%] left-[2%]" link="/mocks" />
               <FloatingNode icon={<Landmark className="text-blue-600 h-5 w-5" />} label="PUNJAB EXAMS" className="top-[12%] right-[2%]" link="/exams" />

               <FloatingNode icon={<FileStack className="text-blue-600 h-5 w-5" />} label="PREVIOUS PAPERS" className="bottom-[2%] left-[0%]" link="/pyqs" />
               <FloatingNode icon={<Target className="text-blue-600 h-5 w-5" />} label="DAILY PRACTICE" className="bottom-[2%] right-[0%]" link="/current-affairs" />
            </div>

            <div className="w-full px-4 flex flex-col gap-3 mt-8">
               <Button asChild className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm tracking-widest rounded-full shadow-xl shadow-blue-600/20 border-none transition-all active:scale-95">
                  <Link href="/exams" className="flex items-center justify-between w-full px-6">
                     <div className="flex items-center gap-3"><BookOpen className="h-5 w-5 fill-current" /> <span>Start Learning</span></div>
                     <ChevronRight className="h-5 w-5" />
                  </Link>
               </Button>
               <Button asChild variant="outline" className="w-full h-14 border-2 border-blue-600 bg-white text-blue-600 font-black tracking-widest rounded-full transition-all active:scale-95">
                  <Link href="/mocks" className="flex items-center justify-between w-full px-6">
                     <div className="flex items-center gap-3"><ClipboardCheck className="h-5 w-5" /> <span className="text-[13px] whitespace-nowrap uppercase">Take Free Mock Test</span></div>
                     <ChevronRight className="h-5 w-5" />
                  </Link>
               </Button>
            </div>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 md:mt-24">
            {liveStats.map((stat) => (
               <Card key={stat.id} className="p-6 md:p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl flex items-center gap-5 group hover:shadow-2xl hover:translate-y-[-4px] transition-all text-left">
                  <div className={cn("h-12 w-12 md:h-16 md:w-16 rounded-full flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform", stat.circleBg)}>
                     {stat.icon}
                  </div>
                  <div className="text-left space-y-0.5">
                     <p className={cn("text-2xl md:text-3xl font-black leading-none tracking-tighter", stat.valColor)}>{stat.val}</p>
                     <p className="text-sm md:text-base font-bold text-slate-900 tracking-tight">{stat.label}</p>
                     <p className="text-[9px] md:text-[10px] font-medium text-slate-400 leading-tight line-clamp-1">{stat.sub}</p>
                  </div>
               </Card>
            ))}
         </div>

         <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-[2rem] md:rounded-full p-4 md:p-2 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-white/5 opacity-50 animate-pulse pointer-events-none" />
            <div className="flex items-center gap-4 relative z-10 pl-6">
               <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                     <div key={i} className="h-8 w-8 md:h-10 md:w-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                        <img src={`https://picsum.photos/seed/${i+40}/100/100`} alt="Avatar" />
                     </div>
                  ))}
               </div>
               <p className="text-[10px] md:text-sm font-black text-white uppercase tracking-tight">Join 10,000+ Successful Aspirants Today!</p>
            </div>
            <Button asChild variant="ghost" className="text-white hover:bg-white/10 font-black uppercase text-[9px] md:text-[11px] tracking-widest gap-2 mr-6">
               <Link href="/success-stories" className="flex items-center gap-2">View Merit List <Trophy className="h-4 w-4 text-amber-400" /></Link>
            </Button>
         </div>

      </div>
    </section>
  );
}

function FloatingNode({ icon, label, className, link }: { icon: React.ReactNode, label: string, className: string, link: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "absolute z-20 bg-white p-3 md:p-5 rounded-xl md:rounded-[1.5rem] shadow-2xl border border-slate-100 flex flex-col items-center gap-2 md:gap-4 cursor-pointer transition-all hover:border-blue-200 min-w-[80px] md:min-w-[120px]",
        className
      )}
    >
       <Link href={link} className="flex flex-col items-center gap-2 md:gap-3 w-full h-full">
          <div className="h-10 w-10 md:h-14 md:w-14 rounded-full bg-slate-50 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
             {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 md:h-7 md:w-7" })}
          </div>
          <span className="text-[8px] md:text-[11px] font-black text-[#0F172A] tracking-tighter uppercase whitespace-nowrap text-center leading-none">{label}</span>
       </Link>
    </motion.div>
  );
}
