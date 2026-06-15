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
  FileText,
  Star,
  Target,
  FileStack,
  ArrowRight,
  Trophy,
  CheckCircle2,
  Landmark,
  Play,
  MonitorPlay
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import Logo from "@/components/brand/Logo";

/**
 * @fileOverview Majestic Hero Hub v18.0 (Safety Calibration).
 * FIXED: Shifted floating cards inwards to prevent edge clipping (Daily Practice).
 * FIXED: Reduced node sizing on mobile to prevent overlapping with central student.
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
        sub: "Practice daily & stay ahead" 
      },
      { 
        id: "m", 
        icon: <ClipboardCheck className="h-6 w-6 text-white" />, 
        circleBg: "bg-indigo-600",
        valColor: "text-indigo-600",
        val: formatNumber(stats?.totalMocks, "500+"), 
        label: "Mock Tests", 
        sub: "Latest official patterns" 
      },
      { 
        id: "e", 
        icon: <ShieldCheck className="h-6 w-6 text-white" />, 
        circleBg: "bg-emerald-600",
        valColor: "text-emerald-600",
        val: formatNumber(stats?.totalBoards, "50+"), 
        label: "Exams", 
        sub: "Verified board verticals" 
      },
      { 
        id: "u", 
        icon: <Users className="h-6 w-6 text-white" />, 
        circleBg: "bg-blue-500",
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
         
         {/* MOBILE HEADER */}
         <div className="flex items-center justify-between lg:hidden mb-2">
            <Logo imgClassName="h-8" />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-100 shadow-sm">
               <Star className="h-3 w-3 text-blue-600 fill-current" />
               <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">10,000+ Trust Us</span>
            </div>
         </div>

         {/* MOBILE HEADING */}
         <div className="lg:hidden text-center space-y-4">
            <h1 className="text-[28px] sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Your Journey to <br />
              <span className="text-blue-600">Government Job</span> <br />
              Starts Here!
            </h1>
         </div>

         {/* EXAM CHIPS */}
         <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/50 backdrop-blur-sm p-3 rounded-2xl border border-slate-100 w-full lg:hidden">
            <span>PSSSB</span> <span className="text-blue-200 opacity-50">•</span>
            <span>PCS</span> <span className="text-blue-200 opacity-50">•</span>
            <span>PSPCL</span> <span className="text-blue-200 opacity-50">•</span>
            <span>CTET</span> <span className="text-blue-200 opacity-50">•</span>
            <span>PSTET</span>
         </div>

         {/* DESKTOP LAYOUT */}
         <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-10">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
                  <div className="bg-blue-600 rounded-full p-0.5"><Star className="h-3 w-3 text-white fill-current" /></div>
                  <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">10,000+ Aspirants Trust Cracklix</span>
               </div>
               
               <div className="space-y-4">
                  <h1 className="text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                    Crack Punjab <br />
                    <span className="text-blue-600">Government Exams</span> <br />
                    With Confidence
                  </h1>
                  <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
                    Practice with bilingual mock tests, previous papers and exam-focused preparation for PSSSB, Police, and more.
                  </p>
               </div>

               <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-black text-slate-400 uppercase tracking-widest bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-100">
                  <span>PSSSB</span> <span className="text-blue-200 opacity-50">•</span>
                  <span>PCS</span> <span className="text-blue-200 opacity-50">•</span>
                  <span>PSPCL</span> <span className="text-blue-200 opacity-50">•</span>
                  <span>CTET</span> <span className="text-blue-200 opacity-50">•</span>
                  <span>PSTET</span>
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
               <FloatingNode icon={<Zap className="text-blue-600 h-5 w-5" />} label="Mock Tests" className="top-[5%] left-[8%]" link="/mocks" />
               <FloatingNode icon={<BookOpen className="text-indigo-600 h-5 w-5" />} label="Punjab Exams" className="top-[15%] right-[12%]" link="/exams" />
               <FloatingNode icon={<FileStack className="text-emerald-600 h-5 w-5" />} label="Previous Papers" className="bottom-[35%] left-[5%]" link="/pyqs" />
               <FloatingNode icon={<Target className="text-rose-500 h-5 w-5" />} label="Daily Practice" className="bottom-[25%] right-[12%]" link="/current-affairs" />
            </div>
         </div>

         {/* MOBILE ILLUSTRATION & ACTIONS */}
         <div className="lg:hidden relative flex flex-col items-center w-full px-0">
            <div className="relative w-full max-w-[360px] aspect-square flex items-center justify-center">
               <div className="absolute inset-0 bg-blue-100/30 rounded-full blur-2xl -z-10" />
               <img src="/images/hero-student.png" className="w-full h-full object-contain relative z-10" alt="Student" />
               <FloatingNode icon={<Zap className="text-blue-600 h-3 w-3" />} label="Mocks" className="top-[12%] left-[10%]" link="/mocks" />
               <FloatingNode icon={<BookOpen className="text-indigo-600 h-3 w-3" />} label="Exams" className="top-[18%] right-[15%]" link="/exams" />
               <FloatingNode icon={<FileStack className="text-emerald-600 h-3 w-3" />} label="Papers" className="bottom-[42%] left-[8%]" link="/pyqs" />
               <FloatingNode icon={<Target className="text-rose-500 h-3 w-3" />} label="Practice" className="bottom-[32%] right-[15%]" link="/current-affairs" />
            </div>

            <div className="w-full px-4 flex flex-col gap-3 mt-4">
               <Button asChild className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm tracking-widest rounded-full shadow-xl shadow-blue-600/20 border-none transition-all active:scale-95">
                  <Link href="/exams" className="flex items-center justify-between w-full px-6">
                     <div className="flex items-center gap-3"><BookOpen className="h-5 w-5 fill-current" /> <span>Start Learning</span></div>
                     <ChevronRight className="h-5 w-5" />
                  </Link>
               </Button>
               <Button asChild variant="outline" className="w-full h-14 border-2 border-blue-600 bg-white text-blue-600 font-black text-sm tracking-widest rounded-full transition-all active:scale-95">
                  <Link href="/mocks" className="flex items-center justify-between w-full px-6">
                     <div className="flex items-center gap-3"><ClipboardCheck className="h-5 w-5" /> <span>Take Free Mock Test</span></div>
                     <ChevronRight className="h-5 w-5" />
                  </Link>
               </Button>
            </div>
         </div>

         {/* STATS GRID */}
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

         {/* SUCCESS RIBBON */}
         <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2rem] md:rounded-full p-4 md:p-2 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 shadow-2xl relative overflow-hidden">
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
               <Link href="/success-stories">View Merit List <Trophy className="h-4 w-4 text-amber-400" /></Link>
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
        "absolute z-20 bg-white p-1.5 md:p-4 rounded-lg md:rounded-2xl shadow-2xl border border-slate-100 flex flex-col items-center gap-1 md:gap-2 cursor-pointer transition-all hover:border-blue-200",
        className
      )}
    >
       <Link href={link} className="flex flex-col items-center gap-1 md:gap-2 w-full h-full">
          <div className="h-5 w-5 md:h-11 md:w-11 rounded-md md:rounded-xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner">
             {icon}
          </div>
          <span className="text-[6px] md:text-[10px] font-black text-[#0F172A] tracking-tighter uppercase whitespace-nowrap text-center">{label}</span>
       </Link>
    </motion.div>
  );
}
