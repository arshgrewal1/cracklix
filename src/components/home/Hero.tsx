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
 * @fileOverview Majestic Hero Hub v24.0.
 * Reconstructed to 1:1 visual parity with institutional design spec.
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
        sub: "High quality practice questions" 
      },
      { 
        id: "m", 
        icon: <ClipboardCheck className="h-6 w-6 text-blue-700" />, 
        circleBg: "bg-blue-50",
        valColor: "text-blue-700",
        val: formatNumber(stats?.totalMocks, "500+"), 
        label: "Mock Tests", 
        sub: "Topic wise & full length mocks" 
      },
      { 
        id: "e", 
        icon: <ShieldCheck className="h-6 w-6 text-blue-600" />, 
        circleBg: "bg-blue-50",
        valColor: "text-blue-600",
        val: formatNumber(stats?.totalBoards, "50+"), 
        label: "Exams", 
        sub: "All major Punjab exams" 
      },
      { 
        id: "u", 
        icon: <Users className="h-6 w-6 text-blue-500" />, 
        circleBg: "bg-blue-50",
        valColor: "text-blue-500",
        val: formatNumber(stats?.totalUsers, "15K+"), 
        label: "Aspirants", 
        sub: "Trust Cracklix for preparation" 
      }
    ];
  }, [stats]);

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] pb-12 md:pb-24 border-b border-slate-100 text-left">
      {/* Decorative Blur Nodes */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-50/50 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-4 pt-10 md:pt-16 space-y-12">
         
         <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* LEFT CONTENT HUB */}
            <div className="space-y-10">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
                  <div className="bg-blue-600 rounded-full p-0.5"><Star className="h-3 w-3 text-white fill-current" /></div>
                  <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">10,000+ Aspirants Trust Us</span>
               </div>
               
               <div className="space-y-4">
                  <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] uppercase">
                    Crack Punjab <br />
                    <span className="text-blue-600">Government Exams</span> <br />
                    With Confidence
                  </h1>
                  <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
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
            </div>

            {/* RIGHT ILLUSTRATION HUB */}
            <div className="relative flex justify-center lg:pl-12">
               {/* Floating Visual Nodes */}
               <FloatingNode icon={<ClipboardCheck className="text-blue-600 h-5 w-5" />} label="MOCK TESTS" className="top-0 left-0" />
               <FloatingNode icon={<FileStack className="text-emerald-500 h-5 w-5" />} label="PREVIOUS PAPERS" className="top-0 right-0" />
               <FloatingNode icon={<Target className="text-blue-500 h-5 w-5" />} label="DAILY PRACTICE" className="bottom-[20%] left-[-20px]" />
               <FloatingNode icon={<Trophy className="text-orange-500 h-5 w-5" />} label="PUNJAB EXAMS" className="bottom-[20%] right-[-10px]" />

               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-blue-100/40 rounded-full blur-3xl -z-10" />
               
               <motion.img 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1 }}
                  src="/images/hero-student.png" 
                  className="w-full max-w-md h-auto object-contain relative z-10"
                  alt="Cracklix Student"
               />
               
               {/* Subject Stack - Visual Simulation */}
               <div className="absolute bottom-4 left-1/2 -translate-x-[110%] z-20 flex flex-col items-center gap-1.5 hidden md:flex">
                  <SubjectBook color="bg-blue-600" label="MATHS" />
                  <SubjectBook color="bg-orange-500" label="REASONING" />
                  <SubjectBook color="bg-emerald-500" label="PUNJABI" />
                  <SubjectBook color="bg-indigo-700" label="GK / GS" />
               </div>
            </div>
         </div>

         {/* FEATURE CARDS STRIP */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
            <FeatureCard icon={<ClipboardCheck className="text-blue-600" />} title="Mock Tests" sub="Exam-focused mock tests" />
            <FeatureCard icon={<FileStack className="text-emerald-500" />} title="Previous Papers" sub="Previous year question papers" />
            <FeatureCard icon={<Target className="text-blue-500" />} title="Daily Practice" sub="Practice daily & stay ahead" />
            <FeatureCard icon={<Landmark className="text-orange-500" />} title="Punjab Exams" sub="All major Punjab exams at one place" />
         </div>

         {/* ACTION HUB */}
         <div className="flex flex-wrap gap-4 pt-6">
            <Button asChild className="h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm tracking-widest rounded-2xl shadow-xl shadow-blue-600/20 gap-3 border-none transition-all active:scale-95">
               <Link href="/mocks" className="flex items-center gap-2">Start Free Mock Test <ArrowRight className="h-5 w-5" /></Link>
            </Button>
            <Button asChild variant="outline" className="h-16 px-10 border-2 border-blue-600 bg-white text-blue-600 font-black text-sm tracking-widest rounded-2xl hover:bg-blue-50 transition-all gap-3">
               <Link href="/exams" className="flex items-center gap-2">Browse Exams <ArrowRight className="h-5 w-5" /></Link>
            </Button>
         </div>

         {/* FINAL STATS REGISTRY */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-24">
            {liveStats.map((stat) => (
               <Card key={stat.id} className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl flex items-center gap-6 group hover:shadow-2xl hover:translate-y-[-4px] transition-all text-left">
                  <div className={cn("h-14 w-14 rounded-full flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform", stat.circleBg)}>
                     {stat.icon}
                  </div>
                  <div className="text-left space-y-0.5">
                     <p className={cn("text-3xl font-black leading-none tracking-tighter", stat.valColor)}>{stat.val}</p>
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
      whileHover={{ scale: 1.05 }}
      className={cn(
        "absolute z-20 bg-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-2xl border border-slate-100 flex flex-col items-center gap-2 cursor-pointer transition-all hover:border-blue-200",
        className
      )}
    >
       <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 shadow-inner">
          {icon}
       </div>
       <span className="text-[9px] font-black text-[#0F172A] tracking-tighter uppercase whitespace-nowrap">{label}</span>
    </motion.div>
  );
}

function FeatureCard({ icon, title, sub }: { icon: React.ReactNode, title: string, sub: string }) {
   return (
      <Card className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-lg transition-all group cursor-pointer text-left">
         <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform text-2xl">
            {React.cloneElement(icon as React.ReactElement, { className: "h-6 w-6" })}
         </div>
         <div>
            <h4 className="font-black text-[#0F172A] uppercase text-sm tracking-tight">{title}</h4>
            <p className="text-[10px] font-medium text-slate-400 leading-tight">{sub}</p>
         </div>
      </Card>
   )
}

function SubjectBook({ color, label }: { color: string, label: string }) {
   return (
      <div className={cn("w-32 py-1.5 px-4 text-center rounded shadow-2xl border-l-4 border-black/10", color)}>
         <span className="text-[10px] font-black text-white tracking-widest">{label}</span>
      </div>
   )
}
