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
 * @fileOverview Refined Centered Hero Hub v31.0.
 * UPDATED: Moved student illustration above the features grid.
 * DESIGN: Centered stack for maximized institutional authority.
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
    if (num >= 1000) return Math.floor(num / 1000) + "k+";
    return num + "+";
  };

  const liveStats = useMemo(() => {
    return [
      {
        id: "q",
        icon: <Zap className="h-5 w-5 text-blue-600 fill-current" />,
        val: formatNumber(stats?.totalQuestions, "50k+"),
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
        val: formatNumber(stats?.totalUsers, "15k+"),
        label: "Aspirants"
      }
    ];
  }, [stats]);

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] py-12 md:py-24">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* CENTERED CONTENT STACK */}
          <div className="flex flex-col items-center text-center space-y-8 md:space-y-12">
            
            {/* TRUST BADGE */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-slate-100 shadow-sm"
            >
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-[10px] md:text-[13px] font-black text-[#0F172A] uppercase tracking-wider">
                10,000+ Aspirants Trust Cracklix
              </span>
            </motion.div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-7xl font-black text-[#0F172A] leading-tight tracking-tight uppercase">
                Crack Punjab <br/>
                <span className="text-[#2563EB]">Government Exams</span> <br/>
                With Confidence
              </h1>

              <p className="text-base md:text-xl text-[#64748B] max-w-2xl mx-auto font-medium leading-relaxed">
                Practice bilingual mock tests and prepare for Punjab Government Exams with confidence. 
                Access exam-focused practice, previous papers and performance tracking in one place.
              </p>
            </div>

            {/* EXAM CATEGORY PILLS */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {["PSSSB", "Punjab Police", "PSTET", "PSPCL", "PPSC"].map((item) => (
                <span key={item} className="px-4 py-2 rounded-full bg-white border border-slate-100 text-[10px] md:text-xs font-bold text-slate-600 shadow-sm uppercase tracking-tight">
                   {item}
                </span>
              ))}
            </div>

            {/* MOVED: HERO STUDENT IMAGE (Now above features) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-full flex justify-center py-4"
            >
              <div className="absolute inset-0 bg-blue-600/5 blur-[80px] rounded-full scale-110 pointer-events-none" />
              <img
                src="/images/hero-student.png"
                alt="Cracklix Student"
                data-ai-hint="student studying"
                className="w-full h-auto object-contain drop-shadow-2xl max-w-[300px] md:max-w-[480px] lg:max-w-[580px]"
              />
            </motion.div>

            {/* INTEGRATED FEATURE GRID */}
            <div className="grid grid-cols-2 gap-3 md:gap-6 w-full max-w-2xl">
               <FeatureCard icon={<Zap />} label="MOCK TESTS" href="/mocks" />
               <FeatureCard icon={<Landmark />} label="PUNJAB EXAMS" href="/exams" />
               <FeatureCard icon={<FileText />} label="PREVIOUS PAPERS" href="/pyqs" />
               <FeatureCard icon={<ShieldCheck />} label="FREE PRACTICE" href="/mocks" />
            </div>

            {/* CTA BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4 justify-center">
              <Button
                asChild
                className="h-14 md:h-20 px-12 bg-[#2563EB] hover:bg-blue-700 text-white font-black uppercase text-[11px] md:text-sm tracking-[0.2em] rounded-full shadow-xl transition-all active:scale-95 border-none group/btn"
              >
                <Link href="/mocks" className="flex items-center justify-center gap-3">
                  <span>START FREE MOCK TEST</span>
                  <ChevronRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-14 md:h-20 px-12 border-2 border-slate-200 bg-white text-[#0F172A] font-black uppercase text-[11px] md:text-sm tracking-[0.2em] rounded-full shadow-sm hover:bg-slate-50 transition-all active:scale-95 group/btn2"
              >
                <Link href="/exams" className="flex items-center justify-center gap-3">
                  <span>BROWSE EXAMS</span>
                  <ChevronRight className="h-5 w-5 transition-transform group-hover/btn2:translate-x-1" />
                </Link>
              </Button>
            </div>
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
              <Card className="p-6 md:p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl group hover:translate-y-[-4px] transition-all duration-300 text-left">
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
    <Link href={href} className="block group">
      <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-lg border border-slate-50 flex items-center gap-4 transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px] active:scale-95 cursor-pointer h-full">
        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-primary transition-colors duration-300">
           {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 md:h-6 md:w-6 text-primary group-hover:text-white transition-colors" })}
        </div>
        <span className="font-black text-[10px] md:text-xs text-[#0F172A] tracking-tight uppercase group-hover:text-primary transition-colors text-left leading-tight">
          {label}
        </span>
      </div>
    </Link>
  );
}
