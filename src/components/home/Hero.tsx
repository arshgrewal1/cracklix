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
 * @fileOverview Majestic Hero Hub v15.1 (Bug Fix).
 * FIXED: Resolved "React.Children.only" error by wrapping Button asChild content in a single Link node.
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
        sub: "High quality practice" 
      },
      { 
        id: "m", 
        icon: <ClipboardCheck className="h-6 w-6 text-white" />, 
        circleBg: "bg-indigo-600",
        valColor: "text-indigo-600",
        val: formatNumber(stats?.totalMocks, "500+"), 
        label: "Mock Tests", 
        sub: "Topic & full length" 
      },
      { 
        id: "e", 
        icon: <ShieldCheck className="h-6 w-6 text-white" />, 
        circleBg: "bg-emerald-600",
        valColor: "text-emerald-600",
        val: formatNumber(stats?.totalBoards, "50+"), 
        label: "Exams", 
        sub: "All major Punjab boards" 
      },
      { 
        id: "u", 
        icon: <Users className="h-6 w-6 text-white" />, 
        circleBg: "bg-orange-500",
        valColor: "text-orange-500",
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

      {/* MOBILE HEADER (Logo + Trust) */}
      <div className="max-w-7xl mx-auto px-4 pt-4 md:pt-8 flex items-center justify-between lg:hidden mb-4">
         <Logo imgClassName="h-8" />
         <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-100 shadow-sm">
            <Star className="h-3 w-3 text-blue-600 fill-current" />
            <span className="text-[10px] font-bold text-slate-600">10,000+ Trust Us</span>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* DESKTOP HEADER (Trust Badge Only) */}
        <div className="hidden lg:block mb-8 md:mt-8">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
              <div className="bg-blue-600 rounded-full p-0.5"><Star className="h-3 w-3 text-white fill-current" /></div>
              <span className="text-sm font-bold text-slate-600">10,000+ Aspirants Trust Cracklix</span>
           </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          
          {/* CONTENT LEFT */}
          <div className="space-y-6 md:space-y-10 lg:pr-12">
            <div className="space-y-3 md:space-y-4">
               <h1 className="text-[28px] sm:text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                 Your Journey to <br />
                 <span className="text-blue-600">Government Job</span> <br />
                 Starts Here!
               </h1>
               <p className="text-sm md:text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
                 Practice bilingual mock tests and prepare for Punjab Government Exams with confidence.
               </p>
            </div>

            {/* EXAM LIST */}
            <div className="flex flex-wrap items-center gap-x-2 md:gap-x-4 gap-y-2 text-[10px] md:text-sm font-black text-slate-400 uppercase tracking-widest bg-white/50 backdrop-blur-sm p-3 rounded-2xl border border-slate-100 w-fit lg:w-full lg:justify-start justify-center mx-auto lg:mx-0">
               <span>PSSSB</span> <span className="text-blue-200 opacity-50">•</span>
               <span>PCS</span> <span className="text-blue-200 opacity-50">•</span>
               <span>PSPCL</span> <span className="text-blue-200 opacity-50">•</span>
               <span>CTET</span> <span className="text-blue-200 opacity-50">•</span>
               <span>PSTET</span>
            </div>

            {/* DESKTOP CTA (Hidden on Mobile) */}
            <div className="hidden lg:flex flex-col sm:flex-row gap-4 pt-4">
               <Button asChild className="h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm tracking-widest rounded-2xl shadow-xl shadow-blue-600/20 gap-3 group transition-all active:scale-95 border-none">
                  <Link href="/exams" className="flex items-center gap-2">
                     Start Learning <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
               </Button>
               <Button asChild variant="outline" className="h-16 px-10 border-2 border-blue-600 bg-white text-blue-600 font-black text-sm tracking-widest rounded-2xl hover:bg-blue-50 transition-all gap-3">
                  <Link href="/mocks" className="flex items-center gap-2">
                     Take Free Mock Test <ArrowRight className="h-5 w-5" />
                  </Link>
               </Button>
            </div>
          </div>

          {/* ILLUSTRATION HUB RIGHT (Edge-to-Edge Mobile) */}
          <div className="relative flex justify-center w-full px-0 -mx-4 sm:mx-0 md:px-0 lg:pl-8 overflow-visible mt-4 md:mt-0">
            <div className="relative w-full max-w-none md:max-w-[500px] lg:max-w-[620px] xl:max-w-[680px]">
               {/* Background Circle */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] bg-blue-100/40 rounded-full -z-10 blur-2xl" />

               <motion.img
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 0.8 }}
                 src="/images/hero-student.png"
                 alt="Cracklix Student"
                 className="w-full h-auto object-contain relative z-10"
               />

               {/* FLOATING CARDS */}
               <FloatingNode 
                  icon={<MonitorPlay className="text-blue-600 h-4 w-4 md:h-5 md:w-5" />} 
                  label="Live Classes" 
                  className="top-[5%] left-[5%] md:left-[10%]" 
                  link="/mocks"
               />
               <FloatingNode 
                  icon={<FileText className="text-purple-600 h-4 w-4 md:h-5 md:w-5" />} 
                  label="Study Material" 
                  className="top-[10%] right-[5%] md:right-[5%]" 
                  link="/notes"
               />
               <FloatingNode 
                  icon={<ClipboardCheck className="text-emerald-600 h-4 w-4 md:h-5 md:w-5" />} 
                  label="Mock Tests" 
                  className="bottom-[45%] left-[-2%] md:left-[-5%]" 
                  link="/mocks"
               />
               <FloatingNode 
                  icon={<FileStack className="text-orange-500 h-4 w-4 md:h-5 md:w-5" />} 
                  label="Previous Papers" 
                  className="bottom-[35%] right-[-2%] md:right-[-5%]" 
                  link="/pyqs"
               />
            </div>
          </div>
        </div>

        {/* MOBILE CTA BUTTONS (Matching Screenshot) */}
        <div className="lg:hidden flex flex-col gap-3 mt-8">
           <Button asChild className="w-full h-14 md:h-16 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm tracking-widest rounded-full shadow-xl shadow-blue-600/20 flex items-center justify-between px-6 border-none group transition-all active:scale-95">
              <Link href="/exams">
                 <div className="flex items-center gap-3">
                   <BookOpen className="h-5 w-5 fill-current" />
                   <span>Start Learning</span>
                 </div>
                 <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                    <ChevronRight className="h-5 w-5" />
                 </div>
              </Link>
           </Button>
           
           <Button asChild variant="outline" className="w-full h-14 md:h-16 border-2 border-blue-600 bg-white text-blue-600 font-black text-sm tracking-widest rounded-full flex items-center justify-between px-6 group transition-all active:scale-95">
              <Link href="/mocks">
                 <div className="flex items-center gap-3">
                   <ClipboardCheck className="h-5 w-5" />
                   <span>Take Free Mock Test</span>
                 </div>
                 <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <ChevronRight className="h-5 w-5" />
                 </div>
              </Link>
           </Button>
        </div>

        {/* BOTTOM STATS REGISTRY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 md:mt-24">
          {liveStats.map((stat) => (
            <Card key={stat.id} className="p-6 md:p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl flex items-center gap-5 md:gap-6 group hover:shadow-2xl hover:translate-y-[-4px] transition-all text-left">
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
          <div className="h-6 w-6 md:h-11 md:w-11 rounded-md md:rounded-xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner mx-auto">
             {icon}
          </div>
          <span className="text-[7px] md:text-[10px] font-black text-[#0F172A] tracking-tighter uppercase whitespace-nowrap text-center">{label}</span>
       </Link>
    </motion.div>
  );
}