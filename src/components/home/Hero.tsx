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
  Landmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import Logo from "@/components/brand/Logo";

/**
 * @fileOverview Final High-Fidelity Hero Hub v12.0.
 * UPDATED: Reconstructed the Statistics Bar to perfectly match the user's screenshot.
 * ICONS: Switched to solid colored circles with white icons.
 * TYPOGRAPHY: Set colored values and bold black labels with sub-text.
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
    <section className="relative overflow-hidden bg-[#F8FAFC] pt-8 md:pt-16 pb-24 border-b border-slate-100 text-left">
      {/* Background Decorative Patterns */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-50/50 blur-[120px] rounded-full -z-10" />
      <div className="absolute top-1/4 left-1/4 opacity-[0.03] -z-10">
         <div className="grid grid-cols-6 gap-4">
            {Array.from({length: 36}).map((_, i) => <div key={i} className="h-1.5 w-1.5 rounded-full bg-slate-900" />)}
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Badge Top */}
        <div className="mb-8">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
              <div className="bg-blue-600 rounded-full p-0.5"><Star className="h-3 w-3 text-white fill-current" /></div>
              <span className="text-[10px] md:text-sm font-bold text-slate-600">10,000+ Aspirants Trust Cracklix</span>
           </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* CONTENT LEFT */}
          <div className="space-y-8 md:space-y-10">
            <div className="space-y-4">
               <Logo imgClassName="h-10 md:h-14 mb-2" />
               <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.05]">
                 Crack Punjab <br />
                 <span className="text-blue-600">Government Exams</span> <br />
                 With Confidence
               </h1>
               <p className="text-base md:text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
                 Practice with high-quality mock tests, previous papers and exam-focused preparation for top Punjab exams.
               </p>
            </div>

            {/* CATEGORY PILLS */}
            <div className="flex flex-wrap gap-3">
               {["PSSSB", "Punjab Police", "PSTET", "PSPCL", "PPSC"].map((pill) => (
                  <Button key={pill} variant="outline" className="h-10 px-6 rounded-full border-blue-200 text-blue-600 font-black text-[10px] tracking-widest hover:bg-blue-50 transition-all">
                     {pill}
                  </Button>
               ))}
            </div>

            {/* MINI FEATURE CARDS - SCREENSHOT MATCHED */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
               <MiniFeatureCard 
                  icon={<ClipboardCheck className="text-blue-600" />} 
                  title="Mock Tests" 
                  sub="Exam-focused mock tests" 
                  bgColor="bg-blue-50"
               />
               <MiniFeatureCard 
                  icon={<FileText className="text-emerald-600" />} 
                  title="Previous Papers" 
                  sub="Previous year question papers" 
                  bgColor="bg-emerald-50"
               />
               <MiniFeatureCard 
                  icon={<Target className="text-purple-600" />} 
                  title="Daily Practice" 
                  sub="Practice daily & stay ahead" 
                  bgColor="bg-purple-50"
               />
               <MiniFeatureCard 
                  icon={<Landmark className="text-orange-500" />} 
                  title="Punjab Exams" 
                  sub="All major Punjab exams at one place" 
                  bgColor="bg-orange-50"
               />
            </div>

            {/* CTA REGISTRY */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
               <Button asChild className="h-14 md:h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs md:text-sm tracking-widest rounded-2xl shadow-xl shadow-blue-600/20 gap-3 group transition-all active:scale-95 border-none">
                  <Link href="/mocks">
                     Start Free Mock Test <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
               </Button>
               <Button asChild variant="outline" className="h-14 md:h-16 px-10 border-2 border-blue-600 bg-white text-blue-600 font-black text-xs md:text-sm tracking-widest rounded-2xl hover:bg-blue-50 transition-all gap-3">
                  <Link href="/exams">
                     Browse Exams <ArrowRight className="h-5 w-5" />
                  </Link>
               </Button>
            </div>
          </div>

          {/* ILLUSTRATION HUB RIGHT */}
          <div className="relative flex justify-center py-12 lg:py-0 w-full group">
            <div className="relative w-full max-w-[320px] sm:max-w-[420px] lg:max-w-[560px] xl:max-w-[620px]">
               {/* Background Circle */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-blue-100/40 rounded-full -z-10" />

               <motion.img
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 0.8 }}
                 src="/images/hero-student.png"
                 alt="Cracklix Student"
                 className="w-full h-auto object-contain relative z-10"
               />

               {/* FLOATING CARDS - DESKTOP ONLY POSITIONS */}
               <FloatingNode 
                  icon={<ClipboardCheck className="text-blue-600 h-4 w-4 md:h-5 md:w-5" />} 
                  label="Mock tests" 
                  className="top-[5%] left-[10%]" 
                  link="/mocks"
               />
               <FloatingNode 
                  icon={<FileStack className="text-emerald-600 h-4 w-4 md:h-5 md:w-5" />} 
                  label="Previous papers" 
                  className="top-[10%] right-[5%]" 
                  link="/pyqs"
               />
               <FloatingNode 
                  icon={<Target className="text-purple-600 h-4 w-4 md:h-5 md:w-5" />} 
                  label="Daily practice" 
                  className="bottom-[45%] left-[-5%]" 
                  link="/current-affairs"
               />
               <FloatingNode 
                  icon={<Landmark className="text-orange-500 h-4 w-4 md:h-5 md:w-5" />} 
                  label="Punjab exams" 
                  className="bottom-[35%] right-[-5%]" 
                  link="/exams"
               />
            </div>
          </div>
        </div>

        {/* BOTTOM STATS REGISTRY - SCREENSHOT MATCHED */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-20 md:mt-32">
          {liveStats.map((stat) => (
            <Card key={stat.id} className="p-6 md:p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl flex items-center gap-5 md:gap-6 group hover:shadow-2xl hover:translate-y-[-4px] transition-all">
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

function MiniFeatureCard({ icon, title, sub, bgColor }: { icon: React.ReactNode, title: string, sub: string, bgColor: string }) {
   return (
      <div className="bg-white p-3 md:p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1.5 hover:shadow-md transition-all group">
         <div className={cn("h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform", bgColor)}>
            {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 md:h-6 md:w-6" })}
         </div>
         <div className="text-left">
            <p className="text-[10px] md:text-xs font-black text-[#0F172A] leading-tight">{title}</p>
            <p className="text-[8px] md:text-[9px] font-medium text-slate-400 leading-tight">{sub}</p>
         </div>
      </div>
   )
}

function FloatingNode({ icon, label, className, link }: { icon: React.ReactNode, label: string, className: string, link: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "absolute z-20 bg-white p-2 md:p-4 rounded-xl md:rounded-2xl shadow-2xl border border-slate-100 flex flex-col items-center gap-1 md:gap-2 cursor-pointer transition-all hover:border-blue-200 hidden sm:flex",
        className
      )}
    >
       <Link href={link} className="flex flex-col items-center gap-1 md:gap-2">
          <div className="h-8 w-8 md:h-11 md:w-11 rounded-lg md:rounded-xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner">
             {icon}
          </div>
          <span className="text-[8px] md:text-[10px] font-black text-[#0F172A] tracking-tighter uppercase whitespace-nowrap">{label}</span>
       </Link>
    </motion.div>
  );
}
