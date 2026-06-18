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
  BookOpen,
  Landmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * @fileOverview Premium Redesigned Hero Hub v26.0.
 * UPDATED: Integrated functional "Screenshot Matched" feature cards.
 * ROUTING: Mocks, Exams, PYQs, and Practice nodes fully connected.
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
      <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start md:items-center">

          {/* LEFT: CONTENT HUB */}
          <div className="flex flex-col items-start text-left space-y-8 md:space-y-10">
            
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

            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-black text-[#0F172A] leading-tight tracking-tight">
                Crack Punjab <br/>
                <span className="text-[#2563EB]">Government Exams</span> <br/>
                With Confidence
              </h1>

              <p className="text-base md:text-lg text-[#64748B] max-w-xl font-medium leading-relaxed">
                Practice bilingual mock tests and prepare for Punjab Government Exams with confidence. 
                Access exam-focused practice, previous papers and performance tracking.
              </p>
            </div>

            {/* INTEGRATED FUNCTIONAL CARDS (SCREENSHOT MATCHED) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <FeatureCard icon={<Zap className="h-5 w-5" />} label="MOCK TESTS" href="/mocks" />
              <FeatureCard icon={<BookOpen className="h-5 w-5" />} label="PUNJAB EXAMS" href="/exams" />
              <FeatureCard icon={<FileText className="h-5 w-5" />} label="PREVIOUS PAPERS" href="/pyqs" />
              <FeatureCard icon={<ShieldCheck className="h-5 w-5" />} label="FREE PRACTICE" href="/mocks" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button
                asChild
                className="h-14 md:h-16 px-10 bg-[#2563EB] hover:bg-blue-700 text-white font-black uppercase text-[11px] md:text-xs tracking-[0.1em] rounded-full shadow-xl transition-all active:scale-95 border-none group/btn"
              >
                <Link href="/mocks" className="flex items-center justify-between w-full">
                  <span>Start Free Mock Test</span>
                  <ChevronRight className="ml-4 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-14 md:h-16 px-10 border-2 border-slate-200 bg-white text-[#0F172A] font-black uppercase text-[11px] md:text-xs tracking-[0.1em] rounded-full shadow-sm hover:bg-slate-50 transition-all active:scale-95"
              >
                <Link href="/exams">
                  Browse Exams
                </Link>
              </Button>
            </div>
          </div>

          {/* RIGHT: VISUAL HUB */}
          <div className="relative flex justify-center items-center">
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
          </div>
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
              <Card className="p-6 md:p-8 rounded-3xl bg-white border border-slate-100 shadow-xl group hover:translate-y-[-4px] transition-all duration-300 text-left">
                <div className="flex flex-col items-start gap-4">
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

function FeatureCard({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) {
  return (
    <Link href={href}>
      <motion.div 
        whileHover={{ scale: 1.02, translateY: -2 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white p-4 md:p-6 rounded-full shadow-lg border border-slate-100 flex items-center gap-4 group transition-all cursor-pointer"
      >
        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-primary transition-colors duration-300">
           {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 text-primary group-hover:text-white transition-colors" })}
        </div>
        <span className="font-black text-xs md:text-sm text-[#0F172A] tracking-tight uppercase group-hover:text-primary transition-colors truncate">
          {label}
        </span>
      </motion.div>
    </Link>
  );
}
