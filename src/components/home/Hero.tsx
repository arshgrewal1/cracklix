'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight,
  Star,
  Zap,
  LayoutGrid,
  ShieldCheck,
  Users,
  Landmark,
  BookOpen,
  Layers
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
 * @fileOverview Native-Scaled Elite Hero Hub v63.0.
 * REQUIREMENTS: 
 * - Mobile radius 32px, padding 24px.
 * - Title clamp(42px, 12vw, 64px).
 * - Image max-w 300px on mobile.
 */

export default function Hero() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats, loading: statsLoading } = useDoc<any>(statsRef);

  const heroImage = "/logo/hero-student.png";

  const liveStats = useMemo(() => {
    const format = (n: number, fallback: string) => {
      if (!n) return fallback;
      return n >= 1000 ? `${(n/1000).toFixed(0)}K+` : n.toString() + "+";
    };
    return [
      { 
        label: "QUESTIONS", 
        sub: "VERIFIED MCQS", 
        val: format(stats?.totalQuestions, "15,000+"), 
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        icon: <Zap className="h-6 w-6 fill-current" /> 
      },
      { 
        label: "MOCK TESTS", 
        sub: "TOPIC WISE TESTS", 
        val: format(stats?.totalMocks, "500+"), 
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
        icon: <LayoutGrid className="h-6 w-6 fill-current" /> 
      },
      { 
        label: "EXAMS", 
        sub: "ALL STATE BOARDS", 
        val: format(stats?.totalBoards, "92+"), 
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        icon: <ShieldCheck className="h-6 w-6 fill-current" /> 
      },
      { 
        label: "ASPIRANTS", 
        sub: "PREPARING NOW", 
        val: format(stats?.totalUsers, "10,000+"), 
        color: "text-orange-500",
        bgColor: "bg-orange-50",
        icon: <Users className="h-6 w-6 fill-current" /> 
      }
    ];
  }, [stats]);

  const prepFeatures = [
    { label: "MOCK TESTS", sub: "Exam-focused mocks", href: "/mocks", icon: <Zap className="h-5 w-5 text-blue-600" /> },
    { label: "PUNJAB EXAMS", sub: "All major boards", href: "/exams", icon: <Landmark className="h-5 w-5 text-blue-600" />, isBlue: true },
    { label: "FREE PRACTICE", sub: "Daily study hub", href: "/practice", icon: <BookOpen className="h-5 w-5 text-indigo-600" /> },
    { label: "PREVIOUS PAPERS", sub: "Official archives", href: "/pyqs", icon: <Layers className="h-5 w-5 text-emerald-600" /> },
  ];

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-white pt-6 pb-12 md:pt-20 md:pb-32 text-left w-full border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          
          {/* HEADER CONTENT */}
          <div className="order-1 space-y-6 md:space-y-8 text-center lg:text-left">
            <div className="space-y-4 md:space-y-6">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white border border-slate-100 shadow-sm mx-auto lg:mx-0"
              >
                <Star className="h-3.5 w-3.5 text-amber-500 fill-current" />
                <span className="text-[10px] md:text-xs font-black text-[#334155] tracking-widest uppercase">
                  {statsLoading ? "..." : (stats?.totalUsers ? stats.totalUsers.toLocaleString() + "+" : "10,000+")} ASPIRANTS TRUST CRACKLIX
                </span>
              </motion.div>

              <h1 className="text-[42px] leading-[0.95] tracking-tighter font-black text-slate-900 md:text-5xl lg:text-7xl antialiased" style={{ fontSize: 'clamp(42px, 12vw, 64px)' }}>
                Crack Punjab <br />
                <span className="text-blue-600">Govt Exams</span> <br />
                With Confidence
              </h1>
              
              <p className="text-[16px] md:text-lg text-slate-500 font-medium max-w-xl leading-relaxed mx-auto lg:mx-0 px-2 md:px-0">
                Practice bilingual mock tests and prepare for Punjab Government Exams with verified patterns.
              </p>
            </div>
          </div>

          {/* HERO IMAGE NODE */}
          <div className="order-2 relative flex items-center justify-center lg:justify-end w-full">
             <div className="relative w-full max-w-[300px] md:max-w-[500px] lg:max-w-[770px] flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="relative z-10 w-full"
                >
                   <img 
                     src={heroImage}
                     alt="Cracklix" 
                     className="w-full h-auto object-contain drop-shadow-3xl"
                     onError={(e) => { (e.target as HTMLImageElement).src = 'https://i.ibb.co/fYJttX5d/Gemini-Generated-Image-n1so6on1so6on1so.png' }}
                   />
                </motion.div>
             </div>
          </div>

          {/* FEATURE TILES & CTAs */}
          <div className="order-3 lg:col-span-2 w-full space-y-8 md:space-y-12">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {prepFeatures.map((feat) => (
                  <Link key={feat.label} href={feat.href}>
                    <Card className="border border-slate-100 bg-white p-5 md:p-8 rounded-[32px] md:rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer h-full">
                       <div className="flex items-center gap-4 mb-2">
                          <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                             {React.cloneElement(feat.icon as React.ReactElement, { className: "h-5 w-5" })}
                          </div>
                          <h4 className={cn(
                            "font-black text-sm md:text-base uppercase tracking-tight leading-none transition-colors",
                            feat.isBlue ? "text-blue-600" : "text-[#0F172A] group-hover:text-blue-600"
                          )}>
                            {feat.label}
                          </h4>
                       </div>
                       <p className="text-[11px] font-bold text-slate-400 leading-tight ml-14 uppercase tracking-widest">{feat.sub}</p>
                    </Card>
                  </Link>
                ))}
             </div>

             <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 max-w-[400px] lg:max-w-none mx-auto px-4 md:px-0">
                <Button asChild className="h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm tracking-widest rounded-2xl md:rounded-full shadow-3xl shadow-blue-600/30 gap-3 border-none transition-all active:scale-95 flex-1">
                  <Link href="/mocks">Start Free Mock Test <ArrowRight className="h-5 w-5" /></Link>
                </Button>
                <Button asChild variant="outline" className="h-16 px-10 border-2 border-blue-600 bg-white text-blue-600 font-black text-sm tracking-widest rounded-2xl md:rounded-full shadow-sm transition-all active:scale-95 hover:bg-blue-50 flex-1">
                  <Link href="/exams">Browse Exam List</Link>
                </Button>
             </div>
          </div>
        </div>

        {/* BOTTOM STATS HUB - EQUAL SIZED CARDS */}
        <div className="mt-12 md:mt-24 order-4">
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 items-stretch">
              {liveStats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="flex h-full"
                >
                  <Card className="border-none shadow-xl rounded-[32px] md:rounded-[2.5rem] p-6 md:p-10 bg-white hover:translate-y-[-4px] transition-all border border-slate-100 group text-left flex items-center gap-4 md:gap-6 w-full h-full">
                    <div className={cn("h-12 w-12 md:h-16 md:w-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500", stat.bgColor, stat.color)}>
                       {stat.icon}
                    </div>
                    <div className="min-w-0 space-y-1">
                      {statsLoading ? (
                        <Skeleton className="h-8 w-20 bg-slate-100" />
                      ) : (
                        <p className="text-xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter leading-none tabular-nums">{stat.val}</p>
                      )}
                      <p className="text-[10px] md:text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none">{stat.label}</p>
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
