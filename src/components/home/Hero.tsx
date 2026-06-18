'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  ShieldCheck,
  Users,
  Zap,
  ChevronRight,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * @fileOverview Refined Hero Hub v22.0.
 * UPDATED: Removed core feature cards as requested.
 * OPTIMIZED: Mobile ordering - Image is now positioned above the CTA buttons.
 * THEME: Institutional high-fidelity aesthetics.
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
        icon: <Zap className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />,
        val: formatNumber(stats?.totalQuestions, "50k+"),
        label: "QUESTIONS"
      },
      {
        id: "m",
        icon: <ClipboardList className="h-5 w-5 md:h-6 md:w-6 text-indigo-600" />,
        val: formatNumber(stats?.totalMocks, "500+"),
        label: "MOCK TESTS"
      },
      {
        id: "e",
        icon: <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-emerald-600" />,
        val: formatNumber(stats?.totalBoards, "50+"),
        label: "EXAMS"
      },
      {
        id: "u",
        icon: <Users className="h-5 w-5 md:h-6 md:w-6 text-orange-500" />,
        val: formatNumber(stats?.totalUsers, "15k+"),
        label: "ASPIRANTS"
      }
    ];
  }, [stats]);

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-white py-12 md:py-20 lg:py-24 text-left">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* COLUMN 1: CORE CONTENT */}
          <div className="space-y-10 md:space-y-12">
            
            {/* HEADLINE BLOCK */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-2">
                <Star className="h-4 w-4 text-primary fill-primary" />
                <span className="text-[10px] sm:text-xs font-bold text-slate-700 tracking-tight uppercase">
                  Institutional Preparation Hub
                </span>
              </div>

              <h1 className="text-4xl md:text-7xl font-extrabold tracking-tighter text-slate-900 leading-[0.95] break-words antialiased">
                CRACK PUNJAB <br/>
                <span className="text-blue-600">GOVT EXAMS</span>
              </h1>

              <p className="text-base md:text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
                Punjab's smartest mock test platform. Built with official patterns, 
                bilingual support, and AI-driven insights for serious aspirants.
              </p>
            </div>

            {/* MOBILE ONLY VISUAL: Positioned between Description and Buttons */}
            <div className="lg:hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative flex justify-center py-4"
              >
                <div className="absolute inset-0 bg-blue-600/5 blur-[60px] rounded-full scale-110" />
                <img
                  src="/images/hero-student.png"
                  alt="Aspirant"
                  className="relative w-full h-auto object-contain drop-shadow-2xl max-w-sm"
                />
              </motion.div>
            </div>

            {/* TAGS */}
            <div className="flex flex-wrap gap-2.5">
              {["PSSSB", "Punjab Police", "PSTET", "PSPCL", "PPSC"].map((item) => (
                <span
                  key={item}
                  className="px-4 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[9px] font-black uppercase text-slate-400 tracking-widest"
                >
                  {item}
                </span>
              ))}
            </div>

            {/* CTA BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                asChild
                className="w-full sm:w-auto h-14 md:h-16 px-10 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl border-none transition-all active:scale-95 gap-2"
              >
                <Link href="/mocks">
                  Start Practice Now
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto h-14 md:h-16 px-10 border-2 border-slate-100 bg-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all text-slate-600 hover:bg-slate-50 shadow-sm"
              >
                <Link href="/exams">
                  Browse Exams
                </Link>
              </Button>
            </div>
          </div>

          {/* COLUMN 2: DESKTOP VISUAL */}
          <div className="hidden lg:flex justify-end relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="relative w-full max-w-[560px]"
            >
              <div className="absolute inset-0 bg-blue-600/5 blur-[100px] rounded-full scale-150" />
              <img
                src="/images/hero-student.png"
                alt="Cracklix Aspirant"
                className="relative w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] transform hover:scale-[1.02] transition-transform duration-700"
              />
            </motion.div>
          </div>

        </div>

        {/* BOTTOM STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-16 md:mt-24 lg:mt-32">
          {liveStats.map((stat) => (
            <Card
              key={stat.id}
              className="p-6 md:p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl group hover:translate-y-[-6px] transition-all duration-500"
            >
              <div className="flex flex-col items-center text-center gap-5">
                <div className="h-12 w-12 md:h-16 md:w-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center shadow-inner group-hover:bg-primary/5 transition-colors duration-500">
                  {stat.icon}
                </div>
                <div className="space-y-1">
                  {statsLoading ? (
                    <Skeleton className="h-8 w-20 mx-auto" />
                  ) : (
                    <p className="text-2xl md:text-5xl font-headline font-black text-slate-900 tracking-tighter leading-none tabular-nums">
                      {stat.val}
                    </p>
                  )}
                  <p className="text-[8px] md:text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] pt-1">
                    {stat.label}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}
