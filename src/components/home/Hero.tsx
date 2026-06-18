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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Official Hero Section v77.0 (Overlap Hardened).
 * FIXED: Replaced horizontal flex with vertical stack for small screens to prevent stat card overlap.
 * FIXED: Replaced standard <p> wrappers with <div> to prevent hydration violations.
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

  const { data: stats, loading } = useDoc<any>(statsRef);

  const liveStats = useMemo(() => {
    const formatNumber = (num: number) => {
      if (!num) return "0";
      if (num >= 1000) return (num / 1000).toFixed(1) + "k+";
      return num.toString() + "+";
    };

    return [
      {
        id: "q",
        icon: <Zap className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />,
        val: stats ? formatNumber(stats.totalQuestions) : null,
        label: "Questions"
      },
      {
        id: "m",
        icon: <ClipboardList className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />,
        val: stats ? formatNumber(stats.totalMocks) : null,
        label: "Mock Tests"
      },
      {
        id: "e",
        icon: <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-emerald-600" />,
        val: stats ? formatNumber(stats.totalBoards) : null,
        label: "Exams"
      },
      {
        id: "u",
        icon: <Users className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />,
        val: stats ? formatNumber(stats.totalUsers) : null,
        label: "Aspirants"
      }
    ];
  }, [stats]);

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-blue-50 py-10 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-left">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border shadow-sm mb-6 md:mb-8">
            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
            <div className="text-[10px] sm:text-sm font-semibold text-slate-700">
              {loading ? <Skeleton className="h-4 w-20" /> : <span>{stats?.totalUsers?.toLocaleString() || "0"} Aspirants Preparing</span>}
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-900 leading-tight tracking-tight">
            Crack Punjab
            <span className="block text-blue-600">
              Government Exams
            </span>
            With Confidence
          </h1>

          <p className="mt-6 text-sm sm:text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed">
            Practice with bilingual mock tests, previous papers and
            exam-focused preparation for PSSSB, Punjab Police,
            PSTET, PSPCL and more.
          </p>

          <div className="flex flex-wrap gap-4 mt-10 md:mt-14">
            <Button
              asChild
              className="h-14 md:h-20 px-8 md:px-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] md:text-[11px] shadow-3xl shadow-blue-600/20 transition-all active:scale-95 border-none"
            >
              <Link href="/mocks">
                Start Free Mock Test
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-14 md:h-20 px-8 md:px-14 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 font-black uppercase tracking-widest text-[10px] md:text-[11px] transition-all active:scale-95 hover:bg-slate-50"
            >
              <Link href="/exams">
                Browse Exams
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-12 md:mt-32">
          {liveStats.map((stat) => (
            <Card
              key={stat.id}
              className="p-4 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 text-left group hover:translate-y-[-4px] transition-all overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 md:gap-5 min-w-0">
                <div className="h-10 w-10 md:h-16 md:w-16 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-center sm:text-left min-w-0 flex-1">
                  <div className="text-lg md:text-4xl font-black text-slate-900 tabular-nums leading-none tracking-tighter truncate">
                    {loading ? <Skeleton className="h-6 w-12 md:h-10 md:w-20" /> : stat.val || "0"}
                  </div>
                  <div className="text-[7px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 md:mt-2 truncate">
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
