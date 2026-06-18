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
import Link from "next/link";
import Image from "next/image";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * @fileOverview Institutional Hero Hub v111.0 (Responsive Hardened).
 * FIXED: Scaled down heading for 320px screens and optimized padding.
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
            <span className="text-[11px] sm:text-sm font-semibold text-slate-700">
              {loading ? <Skeleton className="h-4 w-20 inline-block" /> : (stats?.totalUsers?.toLocaleString() || "0")} Aspirants Preparing
            </span>
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

          <div className="flex flex-wrap gap-2 md:gap-3 mt-6">
            {["PSSSB", "Punjab Police", "PSTET", "PSPCL", "PPSC"].map(
              (item) => (
                <span
                  key={item}
                  className="px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white border text-[10px] md:text-sm font-medium text-slate-700 shadow-sm"
                >
                  {item}
                </span>
              )
            )}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative w-full max-w-2xl h-[260px] xs:h-[300px] md:h-[450px] mt-10 mb-6"
          >
            <Image 
              src="/images/hero-student.png"
              alt="Cracklix Student"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-contain object-left"
            />
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Card className="p-4 md:p-6 rounded-3xl border bg-white group hover:shadow-lg transition-all border-slate-100">
              <ClipboardList className="h-6 w-6 md:h-8 md:w-8 text-blue-600 mb-3 transform group-hover:scale-110 transition-transform" />
              <p className="font-bold text-[12px] md:text-base uppercase tracking-tight">Mock Tests</p>
            </Card>

            <Card className="p-4 md:p-6 rounded-3xl border bg-white group hover:shadow-lg transition-all border-slate-100">
              <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-indigo-600 mb-3 transform group-hover:scale-110 transition-transform" />
              <p className="font-bold text-[12px] md:text-base uppercase tracking-tight">Study Material</p>
            </Card>

            <Card className="p-4 md:p-6 rounded-3xl border bg-white group hover:shadow-lg transition-all border-slate-100">
              <FileText className="h-6 w-6 md:h-8 md:w-8 text-emerald-600 mb-3 transform group-hover:scale-110 transition-transform" />
              <p className="font-bold text-[12px] md:text-base uppercase tracking-tight">Previous Papers</p>
            </Card>

            <Card className="p-4 md:p-6 rounded-3xl border bg-white group hover:shadow-lg transition-all border-slate-100">
              <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-orange-500 mb-3 transform group-hover:scale-110 transition-transform" />
              <p className="font-bold text-[12px] md:text-base uppercase tracking-tight">Analytics</p>
            </Card>
          </div>

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 md:mt-32">
          {liveStats.map((stat) => (
            <Card
              key={stat.id}
              className="p-5 md:p-10 rounded-[2rem] md:rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 text-left group hover:translate-y-[-4px] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 md:h-16 md:w-16 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xl md:text-4xl font-black text-slate-900 tabular-nums leading-none tracking-tight">
                    {loading ? <Skeleton className="h-8 w-16" /> : (stat.val || "0")}
                  </p>
                  <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">
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