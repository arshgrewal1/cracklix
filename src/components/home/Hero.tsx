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
  Users,
  FileStack,
  ChevronRight,
  Loader2,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';

/**
 * @fileOverview Official Cracklix High-Fidelity Hero v50.0.
 * MOBILE ORDER: Trust -> Text -> Image -> FEATURES (Restored) -> BUTTONS -> Stats.
 * RESTORED: Horizontal 4-card feature row exactly above CTA buttons.
 */

export default function Hero() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats, loading: statsLoading } = useDoc<any>(statsRef);

  const heroImage = "/images/hero-student.png";

  const liveStats = useMemo(() => {
    const format = (n: number, fallback: string) => {
      if (!n) return fallback;
      return n >= 1000 ? `${(n/1000).toFixed(0)}K+` : n.toString() + "+";
    };
    return [
      { label: "Questions", sub: "Verified MCQs", val: format(stats?.totalQuestions, "50K+"), icon: <Zap className="text-white fill-current" />, color: "bg-blue-600" },
      { label: "Mock Tests", sub: "Topic wise tests", val: format(stats?.totalMocks, "500+"), icon: <LayoutGrid className="text-white" />, color: "bg-indigo-600" },
      { label: "Exams", sub: "All state boards", val: format(stats?.totalBoards, "50+"), icon: <ShieldCheck className="text-white" />, color: "bg-emerald-600" },
      { label: "Aspirants", sub: "Preparing currently", val: format(stats?.totalUsers, "15K+"), icon: <Users className="text-white" />, color: "bg-orange-500" }
    ];
  }, [stats]);

  const prepFeatures = [
    { label: "Mock Tests", sub: "Exam-focused mock tests", icon: <Zap />, color: "bg-blue-600", href: "/mocks" },
    { label: "Previous Papers", sub: "Previous year question papers", icon: <FileText />, color: "bg-emerald-600", href: "/pyqs" },
    { label: "Daily Practice", sub: "Practice daily & stay ahead", icon: <Target />, color: "bg-indigo-600", href: "/practice" },
    { label: "Punjab Exams", sub: "All major Punjab exams at one place", icon: <Landmark />, color: "bg-orange-500", href: "/exams" },
  ];

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] pt-10 pb-16 md:pt-20 md:pb-32 text-left w-full border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* 1. CONTENT HUB (Order 1 on Mobile) */}
          <div className="order-1 space-y-8 text-center lg:text-left">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mx-auto lg:mx-0"
              >
                <Star className="h-3.5 w-3.5 text-amber-500 fill-current" />
                <span className="text-[10px] md:text-xs font-bold text-slate-600 tracking-widest uppercase">10,000+ Aspirants Trust Cracklix</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.05] antialiased">
                Crack Punjab <br />
                <span className="text-blue-600">Government Exams</span> <br />
                With Confidence
              </h1>
              
              <p className="text-base md:text-lg text-slate-500 font-medium max-w-xl leading-relaxed mx-auto lg:mx-0">
                Practice bilingual mock tests and prepare for Punjab Government Exams with confidence. 
                Access exam-focused practice, previous papers and performance tracking in one place.
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-2.5 pt-2">
                {["PSSSB", "Punjab Police", "PSTET", "PSPCL", "PPSC"].map((pill) => (
                  <div key={pill} className="bg-white border border-slate-200 text-slate-600 px-4 py-1.5 rounded-full font-bold text-[10px] md:text-xs tracking-wide shadow-sm hover:border-blue-600 hover:text-blue-600 transition-all cursor-default">
                    {pill}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. ILLUSTRATION HUB (Order 2 on Mobile) */}
          <div className="order-2 relative flex items-center justify-center lg:justify-end w-full">
             <div className="relative w-full max-w-[400px] md:max-w-[650px] lg:max-w-[770px] xl:max-w-[850px] flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="relative z-10 w-full h-auto"
                >
                   <Image 
                     src={heroImage}
                     alt="Cracklix Student" 
                     width={770}
                     height={517}
                     className="w-full h-auto drop-shadow-3xl object-contain"
                     priority
                   />
                </motion.div>

                <div className="absolute inset-0 pointer-events-none hidden lg:block">
                  <FloatingNode position="top-[5%] left-[-8%]" icon={<Zap className="h-4 w-4 text-blue-600 fill-current" />} title="MOCK TESTS" delay={0.3} href="/mocks" />
                  <FloatingNode position="top-[5%] right-[-8%]" icon={<Landmark className="h-4 w-4 text-orange-500" />} title="PUNJAB EXAMS" delay={0.6} href="/exams" />
                  <FloatingNode position="bottom-[15%] left-[-12%]" icon={<Target className="h-4 w-4 text-purple-600" />} title="FREE PRACTICE" delay={0.5} href="/practice" />
                  <FloatingNode position="bottom-[15%] right-[-12%]" icon={<FileStack className="h-4 w-4 text-emerald-600" />} title="PREVIOUS PAPERS" delay={0.4} href="/pyqs" />
                </div>
             </div>
          </div>

          {/* 3. FEATURE HUB & CTA (Order 3 on Mobile) */}
          <div className="order-3 lg:col-span-2 w-full space-y-10">
             {/* Preparation Feature Hub (The 4 restored cards) */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {prepFeatures.map((feat, idx) => (
                  <Link key={feat.label} href={feat.href}>
                    <Card className="border border-slate-100 bg-white p-5 rounded-2xl md:rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 flex items-center gap-4 group cursor-pointer h-full">
                       <div className={cn("h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform", feat.color)}>
                          {React.cloneElement(feat.icon as React.ReactElement, { className: "h-5 w-5 fill-current" })}
                       </div>
                       <div className="min-w-0 text-left">
                          <h4 className="font-black text-sm md:text-base text-[#0F172A] uppercase tracking-tight leading-none mb-1.5">{feat.label}</h4>
                          <p className="text-[9px] md:text-[10px] font-medium text-slate-400 leading-tight line-clamp-1">{feat.sub}</p>
                       </div>
                    </Card>
                  </Link>
                ))}
             </div>

             {/* CTA Hub */}
             <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 max-w-[400px] lg:max-w-none mx-auto">
                <Button asChild className="h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm tracking-widest rounded-full shadow-2xl shadow-blue-600/30 gap-3 border-none transition-all active:scale-95 flex-1">
                  <Link href="/mocks">Start Free Mock Test <ArrowRight className="h-5 w-5" /></Link>
                </Button>
                <Button asChild variant="outline" className="h-16 px-10 border-2 border-blue-600 bg-white text-blue-600 font-black text-sm tracking-widest rounded-full shadow-sm transition-all active:scale-95 hover:bg-blue-50 flex-1">
                  <Link href="/exams">Browse Exams</Link>
                </Button>
             </div>
          </div>
        </div>

        {/* 4. STATS HUB (Order 4 on Mobile) */}
        <div className="mt-16 md:mt-24">
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {liveStats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="border-none shadow-xl rounded-3xl p-5 md:p-10 bg-white flex flex-col md:flex-row items-center gap-4 md:gap-8 hover:translate-y-[-4px] transition-all border border-slate-100 group text-center md:text-left">
                    <div className={cn("h-12 w-12 md:h-16 md:w-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform", stat.color)}>
                      {stat.icon}
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      {statsLoading ? (
                        <Skeleton className="h-8 w-24 bg-slate-100" />
                      ) : (
                        <p className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter leading-none tabular-nums truncate">{stat.val}</p>
                      )}
                      <p className="text-[10px] md:text-sm font-black text-slate-900 uppercase tracking-widest leading-none">{stat.label}</p>
                      <p className="text-[8px] md:text-[10px] font-medium text-slate-400 leading-tight hidden md:block uppercase tracking-wider">{stat.sub}</p>
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

function FloatingNode({ position, icon, title, delay, href }: { position: string, icon: React.ReactNode, title: string, delay: number, href: string }) {
   return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.8 }}
        className={cn("absolute z-20 w-[180px] xl:w-[220px]", position)}
      >
         <Link href={href}>
            <Card className="p-5 rounded-2xl md:rounded-3xl bg-white/95 backdrop-blur-xl border-none shadow-2xl flex items-center gap-4 group hover:shadow-primary/10 hover:translate-y-[-4px] transition-all cursor-pointer pointer-events-auto">
               <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-blue-50 transition-colors">
                  {icon}
               </div>
               <p className="text-[11px] font-black text-slate-900 tracking-widest truncate leading-none uppercase">{title}</p>
            </Card>
         </Link>
      </motion.div>
   )
}
