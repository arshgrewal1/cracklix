'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  ShieldCheck,
  Users,
  Zap,
  ChevronRight,
  Star,
  FileText,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * @fileOverview Premium Redesigned Hero Hub v24.0.
 * THEME: Modern SaaS-style Blue (#2563EB) & Indigo (#4F46E5).
 * LAYOUT: 2-Column Desktop, Vertical Optimized Stack Mobile.
 */

export default function Hero() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsRef = useMemo(
    () => (db ? doc(db, "settings", "stats") : null),
    [db]
  );

  const { data: stats, loading: statsLoading } = useDoc<any>(statsRef);

  const formatNumber = (num: number, fallback: string) => {
    if (!num) return fallback;
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + "k+";
    return num + "+";
  };

  const liveStats = useMemo(() => {
    return [
      {
        id: "q",
        icon: <Zap className="h-5 w-5 text-blue-600 fill-current" />,
        val: formatNumber(stats?.totalQuestions, "10k+"),
        label: "Questions"
      },
      {
        id: "m",
        icon: <ClipboardList className="h-5 w-5 text-indigo-600" />,
        val: formatNumber(stats?.totalMocks, "500+"),
        label: "Mock Tests"
      },
      {
        id: "e",
        icon: <ShieldCheck className="h-5 w-5 text-blue-500" />,
        val: formatNumber(stats?.totalBoards, "50+"),
        label: "Exams"
      },
      {
        id: "u",
        icon: <Users className="h-5 w-5 text-indigo-500" />,
        val: formatNumber(stats?.totalUsers, "10k+"),
        label: "Aspirants"
      }
    ];
  }, [stats]);

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] py-12 md:py-24">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* COLUMN 1: CONTENT HUB */}
          <div className="flex flex-col items-start text-left space-y-8 md:space-y-10">
            
            {/* 1. Trust Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm"
            >
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-[11px] md:text-sm font-bold text-slate-700 uppercase tracking-tight">
                10,000+ Aspirants Trust Cracklix
              </span>
            </motion.div>

            {/* 2. Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-black text-[#0F172A] leading-tight tracking-tight">
                Crack Punjab <br/>
                <span className="text-[#2563EB]">Government Exams</span> <br/>
                With Confidence
              </h1>

              {/* 3. Description */}
              <p className="text-base md:text-lg text-[#64748B] max-w-xl font-medium leading-relaxed">
                Practice bilingual mock tests and prepare for Punjab Government Exams with confidence. 
                Access exam-focused practice, previous papers and performance tracking in one place.
              </p>
            </div>

            {/* 4. Exam Pills */}
            <div className="flex flex-wrap gap-2.5">
              {["PSSSB", "Punjab Police", "PSTET", "PSPCL", "PPSC"].map((exam) => (
                <span 
                  key={exam}
                  className="px-4 py-2 rounded-full bg-white border border-slate-200 text-[10px] md:text-xs font-bold text-[#0F172A] shadow-sm uppercase tracking-wide"
                >
                  {exam}
                </span>
              ))}
            </div>

            {/* 5. CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button
                asChild
                className="h-12 md:h-14 px-8 bg-[#2563EB] hover:bg-blue-700 text-white font-black uppercase text-[11px] md:text-xs tracking-[0.1em] rounded-2xl shadow-xl transition-all active:scale-95 border-none"
              >
                <Link href="/mocks">
                  Start Free Mock Test
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-12 md:h-14 px-8 border-2 border-white bg-white/50 backdrop-blur-sm text-[#0F172A] font-black uppercase text-[11px] md:text-xs tracking-[0.1em] rounded-2xl shadow-sm hover:bg-white transition-all active:scale-95"
              >
                <Link href="/exams">
                  Browse Exams
                </Link>
              </Button>
            </div>
          </div>

          {/* COLUMN 2: VISUAL HUB */}
          <div className="relative flex justify-center items-center">
            {/* Main Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative z-10 w-full flex justify-center"
            >
              <div className="absolute inset-0 bg-blue-600/5 blur-[100px] rounded-full scale-110 pointer-events-none" />
              <img
                src="/images/hero-student.png"
                alt="Cracklix Student"
                className="w-full h-auto object-contain drop-shadow-2xl max-w-[320px] md:max-w-[420px] lg:max-w-[520px] xl:max-w-[620px]"
              />
            </motion.div>

            {/* FLOATING FEATURE CARDS (Desktop Only) */}
            <div className="hidden lg:block">
               <FloatingCard 
                 icon={<Zap className="h-5 w-5 text-blue-600" />}
                 label="Mock Tests"
                 href="/mocks"
                 className="top-[10%] -left-10"
                 delay={0.2}
               />
               <FloatingCard 
                 icon={<BookOpen className="h-5 w-5 text-indigo-600" />}
                 label="Punjab Exams"
                 href="/exams"
                 className="top-[40%] -right-10"
                 delay={0.4}
               />
               <FloatingCard 
                 icon={<FileText className="h-5 w-5 text-blue-500" />}
                 label="Previous Papers"
                 href="/previous-papers"
                 className="bottom-[20%] -left-12"
                 delay={0.6}
               />
               <FloatingCard 
                 icon={<ShieldCheck className="h-5 w-5 text-indigo-500" />}
                 label="Free Practice"
                 href="/practice"
                 className="bottom-[5%] right-0"
                 delay={0.8}
               />
            </div>
          </div>
        </div>

        {/* MOBILE FEATURE GRID (Below image) */}
        <div className="lg:hidden grid grid-cols-2 gap-4 mt-12">
            <MobileFeatureCard icon={<Zap className="h-5 w-5 text-blue-600" />} label="Mock Tests" href="/mocks" />
            <MobileFeatureCard icon={<BookOpen className="h-5 w-5 text-indigo-600" />} label="Punjab Exams" href="/exams" />
            <MobileFeatureCard icon={<FileText className="h-5 w-5 text-blue-500" />} label="Previous Papers" href="/previous-papers" />
            <MobileFeatureCard icon={<ShieldCheck className="h-5 w-5 text-indigo-500" />} label="Free Practice" href="/practice" />
        </div>

        {/* STATS SECTION */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-16 md:mt-24">
          {liveStats.map((stat, i) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6 md:p-8 rounded-3xl bg-white border border-slate-100 shadow-xl group hover:translate-y-[-4px] transition-all duration-300">
                <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-slate-50 flex items-center justify-center shadow-inner group-hover:bg-blue-50 transition-colors">
                    {stat.icon}
                  </div>
                  <div className="space-y-1">
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-2xl md:text-4xl font-black text-[#0F172A] tracking-tighter tabular-nums leading-none">
                        {stat.val}
                      </p>
                    )}
                    <p className="text-[10px] md:text-xs font-bold text-[#64748B] uppercase tracking-widest pt-1">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

function FloatingCard({ icon, label, href, className, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className={cn("absolute z-20", className)}
    >
      <Link href={href}>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: delay * 2 }}
          className="bg-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-100 flex items-center gap-4 hover:border-blue-600/30 hover:scale-105 transition-all group cursor-pointer"
        >
          <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-blue-50 transition-colors">
            {icon}
          </div>
          <span className="font-bold text-sm text-[#0F172A] whitespace-nowrap uppercase tracking-tight">{label}</span>
        </motion.div>
      </Link>
    </motion.div>
  );
}

function MobileFeatureCard({ icon, label, href }: any) {
  return (
    <Link href={href}>
      <Card className="p-4 rounded-2xl bg-white border border-slate-100 shadow-lg flex items-center gap-3 active:scale-95 transition-all">
        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner">
          {icon}
        </div>
        <span className="font-bold text-[11px] text-[#0F172A] uppercase tracking-tight truncate">{label}</span>
      </Card>
    </Link>
  );
}
