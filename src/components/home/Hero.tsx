'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  ShieldCheck,
  Users,
  Zap,
  ChevronRight,
  BookOpen,
  FileText,
  BarChart3,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Official Fluid Hero Hub v11.0 (Build Fixed).
 * FIXED: Added missing Badge and cn imports to resolve compilation errors.
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

  const liveAspirantCount = useMemo(() => {
    if (statsLoading || !stats?.totalUsers) return "15,000+";
    const num = stats.totalUsers;
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + "k+";
    return num + "+";
  }, [stats, statsLoading]);

  const liveStats = useMemo(() => {
    const formatNumber = (num: number, fallback: string) => {
      if (statsLoading) return null;
      if (!num) return fallback;
      if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + "k+";
      return num + "+";
    };

    return [
      {
        id: "q",
        icon: <Zap className="h-5 w-5 text-blue-600" />,
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
        icon: <ShieldCheck className="h-5 w-5 text-emerald-600" />,
        val: formatNumber(stats?.totalBoards, "50+"),
        label: "Exams"
      },
      {
        id: "u",
        icon: <Users className="h-5 w-5 text-orange-500" />,
        val: formatNumber(stats?.totalUsers, "15k+"),
        label: "Aspirants"
      }
    ];
  }, [stats, statsLoading]);

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-blue-50 py-12 md:py-24 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* LEFT COLUMN */}
          <div className="space-y-6 md:space-y-10 max-w-full">
            
            <div className="space-y-4 md:space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-100 shadow-sm mb-2">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-700 tracking-tight">
                  {liveAspirantCount} Aspirants Trust Cracklix
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.05] break-words antialiased">
                <span className="text-[clamp(2rem,6vw,4.5rem)]">
                  Crack Punjab <br/>
                  <span className="text-blue-600">Government Exams</span> <br/>
                  With Confidence
                </span>
              </h1>

              <p className="mt-4 md:mt-6 text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 max-w-2xl font-medium leading-relaxed">
                Practice with bilingual mock tests, previous papers and
                exam-focused preparation for PSSSB, Punjab Police,
                PSTET, PSPCL and more.
              </p>

              <div className="flex flex-wrap gap-2 md:gap-3 mt-4">
                {["PSSSB", "Punjab Police", "PSTET", "PSPCL", "PPSC"].map(
                  (item) => (
                    <Badge
                      key={item}
                      variant="outline"
                      className="px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white border-slate-200 text-[9px] md:text-xs font-bold text-slate-700 shadow-sm"
                    >
                      {item}
                    </Badge>
                  )
                )}
              </div>
            </div>

            {/* VISUAL BLOCK - Student Above Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative flex justify-center md:justify-start py-4"
            >
              <img
                src="/images/hero-student.png"
                alt="Cracklix Student"
                className="w-full h-auto object-contain drop-shadow-2xl max-w-[280px] xs:max-w-sm md:max-w-md lg:max-w-lg"
              />
            </motion.div>

            {/* QUICK FEATURE GRID */}
            <div className="grid grid-cols-2 gap-4 md:gap-6 mt-4">
              <HeroFeatureCard icon={<ClipboardList />} label="Mock Tests" color="text-blue-600" />
              <HeroFeatureCard icon={<BookOpen />} label="Study Material" color="text-indigo-600" />
              <HeroFeatureCard icon={<FileText />} label="Previous Papers" color="text-emerald-600" />
              <HeroFeatureCard icon={<BarChart3 />} label="Performance Analytics" color="text-orange-500" />
            </div>

            {/* CTAS */}
            <div className="flex flex-col sm:flex-row gap-4 md:gap-5 mt-8 md:mt-12">
              <Button
                asChild
                className="w-full sm:w-auto h-12 md:h-16 px-8 md:px-10 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] md:text-[11px] tracking-widest rounded-2xl shadow-xl border-none transition-all gap-2"
              >
                <Link href="/mocks">
                  Start Practice Now
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto h-12 md:h-16 px-8 md:px-10 border-2 border-slate-200 bg-white rounded-2xl font-black uppercase text-[10px] md:text-[11px] tracking-widest transition-all text-slate-600"
              >
                <Link href="/exams">
                  Browse Exams
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="hidden lg:block"></div>
        </div>

        {/* BOTTOM LIVE STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-16 md:mt-24 lg:mt-32">
          {liveStats.map((stat) => (
            <Card
              key={stat.id}
              className="p-5 md:p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl group hover:shadow-2xl transition-all duration-500"
            >
              <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-5 text-center sm:text-left">
                <div className="shrink-0 p-3 rounded-xl bg-slate-50 group-hover:bg-blue-50 transition-colors shadow-inner">
                  {stat.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tabular-nums leading-none tracking-tighter mb-1.5">
                    {statsLoading ? (
                       <div className="h-8 w-12 bg-slate-100 animate-pulse rounded" />
                    ) : (
                       stat.val
                    )}
                  </div>
                  <div className="text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none">
                    {stat.label}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroFeatureCard({ icon, label, color }: { icon: React.ReactNode, label: string, color: string }) {
  return (
    <Card className="p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 bg-white shadow-sm group hover:border-blue-600/30 hover:shadow-2xl transition-all text-left">
      <div className={cn("h-8 w-8 md:h-12 md:w-12 rounded-xl flex items-center justify-center mb-4 shadow-inner bg-slate-50 transition-transform group-hover:scale-110", color)}>
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 md:h-6 md:w-6" }) : icon}
      </div>
      <p className="font-black text-[#0F172A] text-[10px] md:text-[13px] uppercase tracking-widest">{label}</p>
    </Card>
  );
}
