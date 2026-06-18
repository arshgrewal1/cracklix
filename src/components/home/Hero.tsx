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
 * @fileOverview Official Hero Section v76.0 (Overlap Hardened).
 * FIXED: Replaced horizontal flex with vertical-on-mobile stack for stats cards.
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
        icon: <Zap className="h-5 w-5 text-blue-600" />,
        val: stats ? formatNumber(stats.totalQuestions) : null,
        label: "Questions"
      },
      {
        id: "m",
        icon: <ClipboardList className="h-5 w-5 text-indigo-600" />,
        val: stats ? formatNumber(stats.totalMocks) : null,
        label: "Mock Tests"
      },
      {
        id: "e",
        icon: <ShieldCheck className="h-5 w-5 text-emerald-600" />,
        val: stats ? formatNumber(stats.totalBoards) : null,
        label: "Exams"
      },
      {
        id: "u",
        icon: <Users className="h-5 w-5 text-orange-500" />,
        val: stats ? formatNumber(stats.totalUsers) : null,
        label: "Aspirants"
      }
    ];
  }, [stats]);

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-blue-50 py-12 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-left">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border shadow-sm mb-6">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <div className="text-[11px] sm:text-sm font-semibold text-slate-700 flex items-center gap-2">
              {loading ? <Skeleton className="h-4 w-20" /> : <div className="min-w-0">{stats?.totalUsers?.toLocaleString() || "0"} Aspirants Preparing</div>}
            </div>
          </div>

          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 leading-tight">
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

          <div className="flex flex-wrap gap-4 mt-12">
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 md:mt-32">
          {liveStats.map((stat) => (
            <Card
              key={stat.id}
              className="p-4 sm:p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 text-left group hover:translate-y-[-4px] transition-all overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 md:gap-5">
                <div className="h-10 w-10 md:h-16 md:w-16 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-center sm:text-left min-w-0">
                  <div className="text-xl md:text-4xl font-black text-slate-900 tabular-nums leading-none tracking-tight truncate">
                    {loading ? <Skeleton className="h-8 w-16" /> : <div className="min-w-0">{stat.val || "0"}</div>}
                  </div>
                  <div className="text-[7px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2 truncate">
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
