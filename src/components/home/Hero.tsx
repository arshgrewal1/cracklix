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
  Star,
  LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Official Fluid Hero Hub v15.1.
 * UPDATED: Removed redundant feature cards from the hero body for a cleaner visual profile.
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
        icon: Zap,
        iconColor: "text-blue-600",
        val: formatNumber(stats?.totalQuestions, "50k+"),
        label: "Questions"
      },
      {
        id: "m",
        icon: ClipboardList,
        iconColor: "text-indigo-600",
        val: formatNumber(stats?.totalMocks, "500+"),
        label: "Mock Tests"
      },
      {
        id: "e",
        icon: ShieldCheck,
        iconColor: "text-emerald-600",
        val: formatNumber(stats?.totalBoards, "50+"),
        label: "Exams"
      },
      {
        id: "u",
        icon: Users,
        iconColor: "text-orange-500",
        val: formatNumber(stats?.totalUsers, "15k+"),
        label: "Aspirants"
      }
    ];
  }, [stats, statsLoading]);

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-blue-50 py-12 md:py-20 lg:py-28 text-left">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* COLUMN 1: TEXT CONTENT */}
          <div className="space-y-6 md:space-y-8 max-w-2xl order-2 lg:order-1">
            <div className="space-y-4 md:space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-100 shadow-sm mb-2">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-700 tracking-tight">
                  {liveAspirantCount} Aspirants Trust Cracklix
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.05] break-words antialiased">
                Crack Punjab <br/>
                <span className="text-blue-600">Government Exams</span> <br/>
                With Confidence
              </h1>

              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 font-medium leading-relaxed">
                Practice with bilingual mock tests, previous papers and
                exam-focused preparation for PSSSB, Punjab Police,
                PSTET, PSPCL and more.
              </p>

              <div className="flex flex-wrap gap-2 md:gap-3">
                {["PSSSB", "Punjab Police", "PSTET", "PSPCL", "PPSC"].map((item) => (
                  <Badge
                    key={item}
                    variant="outline"
                    className="px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white border-slate-200 text-[9px] md:text-xs font-bold text-slate-700 shadow-sm"
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </div>

            {/* CTAS */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                asChild
                className="w-full sm:w-auto h-14 md:h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] md:text-[11px] tracking-widest rounded-2xl shadow-xl border-none transition-all gap-2"
              >
                <Link href="/mocks">
                  Start Practice Now
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto h-14 md:h-16 px-10 border-2 border-slate-200 bg-white rounded-2xl font-black uppercase text-[10px] md:text-[11px] tracking-widest transition-all text-slate-600"
              >
                <Link href="/exams">
                  Browse Exams
                </Link>
              </Button>
            </div>
          </div>
          
          {/* COLUMN 2: VISUAL HUB */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="order-1 lg:order-2 flex justify-center lg:justify-end relative"
          >
            <div className="absolute inset-0 bg-blue-600/5 blur-[100px] rounded-full lg:scale-150" />
            <img
              src="/images/hero-student.png"
              alt="Cracklix Student"
              className="relative w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-w-[280px] xs:max-w-sm md:max-w-md lg:max-w-[560px] transform hover:scale-[1.02] transition-transform duration-700"
            />
          </motion.div>
        </div>

        {/* BOTTOM STATS HUB - FULL WIDTH */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-16 md:mt-24 lg:mt-32">
          {liveStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.id}
                className="p-5 md:p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl group hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-500"
              >
                <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-5 text-center sm:text-left">
                  <div className="shrink-0 p-3 rounded-xl bg-slate-50 group-hover:bg-blue-50 transition-colors shadow-inner">
                    <Icon className={cn("h-5 w-5", stat.iconColor)} />
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
            )
          })}
        </div>
      </div>
    </section>
  );
}