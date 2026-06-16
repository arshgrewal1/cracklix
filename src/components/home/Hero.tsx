'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight,
  Star,
  Zap,
  LayoutGrid,
  ShieldCheck,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';

/**
 * @fileOverview Official Cracklix High-Fidelity Hero v56.0.
 * UPDATED: Stat cards reconstructed with icons and equal sizing as per user screenshot.
 * FIXED: Mobile hierarchy with illustration above action grid.
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
      { 
        label: "QUESTIONS", 
        sub: "VERIFIED MCQS", 
        val: format(stats?.totalQuestions, "439+"), 
        bgColor: "bg-blue-600", 
        icon: <Zap className="h-5 w-5 md:h-7 md:w-7 fill-current" /> 
      },
      { 
        label: "MOCK TESTS", 
        sub: "TOPIC WISE TESTS", 
        val: format(stats?.totalMocks, "8+"), 
        bgColor: "bg-indigo-600", 
        icon: <LayoutGrid className="h-5 w-5 md:h-7 md:w-7 fill-current" /> 
      },
      { 
        label: "EXAMS", 
        sub: "ALL STATE BOARDS", 
        val: format(stats?.totalBoards, "92+"), 
        bgColor: "bg-emerald-600", 
        icon: <ShieldCheck className="h-5 w-5 md:h-7 md:w-7 fill-current" /> 
      },
      { 
        label: "ASPIRANTS", 
        sub: "PREPARING CURRENTLY", 
        val: format(stats?.totalUsers, "5+"), 
        bgColor: "bg-orange-500", 
        icon: <Users className="h-5 w-5 md:h-7 md:w-7 fill-current" /> 
      }
    ];
  }, [stats]);

  const prepFeatures = [
    { label: "MOCK TESTS", sub: "Exam-focused mock tests", href: "/mocks" },
    { label: "PUNJAB EXAMS", sub: "All major Punjab exams", href: "/exams" },
    { label: "FREE PRACTICE", sub: "Daily study practice", href: "/practice" },
    { label: "PREVIOUS PAPERS", sub: "Official year papers", href: "/pyqs" },
  ];

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] pt-10 pb-16 md:pt-20 md:pb-32 text-left w-full border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* 1. HEADER TEXT */}
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

          {/* 2. ILLUSTRATION HUB */}
          <div className="order-2 relative flex items-center justify-center lg:justify-end w-full">
             <div className="relative w-full max-w-[400px] md:max-w-[770px] lg:max-w-[850px] flex items-center justify-center">
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

                {/* Floating Navigation Nodes */}
                <div className="absolute inset-0 pointer-events-none hidden lg:block">
                  <FloatingNode position="top-[2%] left-[-4%]" title="MOCK TESTS" delay={0.3} href="/mocks" />
                  <FloatingNode position="top-[2%] right-[-4%]" title="PUNJAB EXAMS" delay={0.6} href="/exams" />
                  <FloatingNode position="bottom-[8%] left-[-6%]" title="FREE PRACTICE" delay={0.5} href="/practice" />
                  <FloatingNode position="bottom-[8%] right-[-6%]" title="PREVIOUS PAPERS" delay={0.4} href="/pyqs" />
                </div>
             </div>
          </div>

          {/* 3. PREPARATION GRID & CTA HUB */}
          <div className="order-3 lg:col-span-2 w-full space-y-10">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {prepFeatures.map((feat) => (
                  <Link key={feat.label} href={feat.href}>
                    <Card className="border border-slate-100 bg-white p-6 rounded-2xl md:rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer h-full">
                       <div className="min-w-0 text-left">
                          <h4 className="font-black text-sm md:text-base text-[#0F172A] uppercase tracking-tight leading-none mb-2 group-hover:text-blue-600 transition-colors">{feat.label}</h4>
                          <p className="text-[10px] md:text-[11px] font-medium text-slate-400 leading-tight line-clamp-1">{feat.sub}</p>
                       </div>
                    </Card>
                  </Link>
                ))}
             </div>

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

        {/* 4. STATS REGISTRY - EQUAL SIZE CARDS WITH ICONS */}
        <div className="mt-16 md:mt-24">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 items-stretch">
              {liveStats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="flex"
                >
                  <Card className="border-none shadow-xl rounded-[2rem] p-5 md:p-8 bg-white hover:translate-y-[-4px] transition-all border border-slate-100 group text-left flex items-center gap-4 md:gap-6 w-full">
                    <div className={cn("h-12 w-12 md:h-16 md:w-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg text-white", stat.bgColor)}>
                       {stat.icon}
                    </div>
                    <div className="min-w-0 space-y-1">
                      {statsLoading ? (
                        <Skeleton className="h-8 w-20 bg-slate-100" />
                      ) : (
                        <p className="text-xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter leading-none tabular-nums">{stat.val}</p>
                      )}
                      <p className="text-[9px] md:text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none">{stat.label}</p>
                      <p className="text-[7px] md:text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-tight">{stat.sub}</p>
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

function FloatingNode({ position, title, delay, href }: { position: string, title: string, delay: number, href: string }) {
   return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.8 }}
        className={cn("absolute z-20 w-[210px] xl:w-[250px]", position)}
      >
         <Link href={href}>
            <Card className="p-5 md:p-6 rounded-2xl md:rounded-3xl bg-white/95 backdrop-blur-xl border-none shadow-2xl flex items-center justify-center group hover:shadow-primary/10 hover:translate-y-[-4px] transition-all cursor-pointer pointer-events-auto">
               <p className="text-[11px] md:text-[12px] font-black text-slate-900 tracking-widest truncate leading-none uppercase text-center">{title}</p>
            </Card>
         </Link>
      </motion.div>
   )
}
