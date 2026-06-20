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
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Official Restored Hero Hub v5.0 (Live Admin Control).
 * Optimized: Fetches live trust data and statistics from the global registry.
 */

export default function Hero() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const settingsRef = useMemo(() => (db ? doc(db, "settings", "global") : null), [db]);

  const { data: stats } = useDoc<any>(statsRef);
  const { data: settings } = useDoc<any>(settingsRef);

  const trustBadgeContent = useMemo(() => {
    if (!settings) return "10,000+ Aspirants Trust Cracklix";
    const count = settings.trustBadgeCount || 10000;
    const text = settings.trustBadgeText || "Aspirants Trust Cracklix";
    return `${count.toLocaleString()}+ ${text}`;
  }, [settings]);

  const liveStats = useMemo(() => {
    const formatNumber = (num: number, fallback: string) => {
      if (!num) return fallback;
      if (num >= 1000) return (num / 1000).toFixed(1) + "k+";
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
  }, [stats]);

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-blue-50 py-12 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* LEFT: Text & Identity Hub */}
          <div className="text-left space-y-8">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border shadow-sm group hover:border-primary/30 transition-all cursor-default"
            >
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 animate-pulse" />
              <span className="text-sm font-semibold text-slate-700">
                {trustBadgeContent}
              </span>
            </motion.div>

            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-tight">
                Crack Punjab
                <span className="block text-blue-600">
                  Government Exams
                </span>
                With Confidence
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl">
                Practice with bilingual mock tests, previous papers and
                exam-focused preparation for PSSSB, Punjab Police,
                PSTET, PSPCL and more.
              </p>

              <div className="flex flex-wrap gap-3">
                {["PSSSB", "Punjab Police", "PSTET", "PSPCL", "PPSC"].map(
                  (item) => (
                    <span
                      key={item}
                      className="px-4 py-2 rounded-full bg-white border text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Visual & Features Hub */}
          <div className="flex flex-col items-center">
            {/* Hero Image positioned above feature matrix */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="relative flex justify-center mb-10"
            >
              <img
                src="/images/hero-student.png"
                alt="Cracklix Student"
                className="w-full max-w-md drop-shadow-2xl"
              />
            </motion.div>

            {/* Feature Matrix Cards */}
            <div className="grid grid-cols-2 gap-4 w-full">
              <FeatureCard icon={ClipboardList} label="Mock Tests" sub="500+ Series" color="text-blue-600" href="/mocks" />
              <FeatureCard icon={BookOpen} label="Study Material" sub="Verified Notes" color="text-indigo-600" href="/notes" />
              <FeatureCard icon={FileText} label="Previous Papers" sub="Official PYQs" color="text-emerald-600" href="/pyqs" />
              <FeatureCard icon={BarChart3} label="Analytics" sub="State Merit" color="text-orange-500" href="/dashboard" />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mt-10 w-full justify-center">
              <Button
                asChild
                className="h-12 md:h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 border-none text-white font-bold"
              >
                <Link href="/mocks">
                  Start Free Mock Test
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-12 md:h-14 px-8 rounded-2xl border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50"
              >
                <Link href="/exams">
                  Browse Exams
                </Link>
              </Button>
            </div>
          </div>

        </div>

        {/* STATS: Bottom Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 text-left">
          {liveStats.map((stat) => (
            <Card
              key={stat.id}
              className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm group hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 leading-none tabular-nums">
                    {stat.val}
                  </p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
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

function FeatureCard({ icon: Icon, label, sub, color, href }: any) {
  return (
    <Link href={href}>
      <Card className="p-5 rounded-3xl border border-slate-100 bg-white hover:shadow-md hover:border-primary/20 transition-all duration-300 h-full">
        <Icon className={cn("h-6 w-6 mb-3", color)} />
        <p className="font-bold text-slate-900 text-sm uppercase">{label}</p>
        <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">{sub}</p>
      </Card>
    </Link>
  )
}
