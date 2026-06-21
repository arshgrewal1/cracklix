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
  Gem
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useDoc, useFirestore, useUser } from "@/firebase";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * @fileOverview Official Live Hero Hub v19.0.
 * UPDATED: Stats grid UI matched to high-fidelity screenshot (Pill-shaped nodes).
 */

const formatCompact = (num: number) => {
  if (num === undefined || num === null) return "...";
  if (num === 0) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

export default function Hero() {
  const { profile } = useUser();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats, loading: statsLoading } = useDoc<any>(statsRef);

  const liveStats = useMemo(() => [
    {
      id: "q",
      icon: <Zap className="h-4 w-4 md:h-5 md:w-5 text-blue-600 fill-current" />,
      val: statsLoading ? "..." : `${formatCompact(stats?.totalQuestions)}+`,
      label: "QUESTIONS",
      bgColor: "bg-blue-50"
    },
    {
      id: "m",
      icon: <ClipboardList className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />,
      val: statsLoading ? "..." : `${formatCompact(stats?.totalMocks)}+`,
      label: "MOCK TESTS",
      bgColor: "bg-indigo-50"
    },
    {
      id: "e",
      icon: <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-emerald-600" />,
      val: statsLoading ? "..." : `${formatCompact(stats?.totalCategories)}+`,
      label: "CATEGORIES",
      bgColor: "bg-emerald-50"
    },
    {
      id: "u",
      icon: <Users className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />,
      val: statsLoading ? "..." : `${formatCompact(stats?.totalUsers)}+`,
      label: "ASPIRANTS",
      bgColor: "bg-orange-50"
    }
  ], [stats, statsLoading]);

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-blue-50 py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">

          {/* LEFT: Text & Identity Hub */}
          <div className="text-left space-y-6">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-100 shadow-sm group hover:border-primary/30 transition-all cursor-default"
            >
              <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 animate-pulse" />
              <span className="text-[12px] font-black text-slate-700 tracking-tight uppercase">
                {statsLoading ? "..." : (stats?.totalUsers || 0).toLocaleString()} ASPIRANTS TRUSTING CRACKLIX
              </span>
            </motion.div>

            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.05]">
                Crack Punjab <br/>
                <span className="block text-blue-600">
                  Government Exams
                </span>
                With Confidence
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-lg leading-relaxed font-medium">
                Practice with bilingual mock tests, previous papers and exam-focused preparation for PSSSB, Punjab Police, PSTET, PSPCL and more.
              </p>

              <div className="flex flex-wrap gap-2">
                {["PSSSB", "Punjab Police", "PSTET", "PSPCL", "PPSC"].map(
                  (item) => (
                    <span
                      key={item}
                      className="px-3 py-1 rounded-full bg-white border text-[11px] font-bold text-slate-500 hover:bg-slate-50 transition-colors tracking-tight"
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
            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative flex justify-center mb-6"
            >
              <img
                src="/images/hero-student.png"
                alt="Cracklix Student"
                className="w-full max-w-[320px] md:max-w-md drop-shadow-2xl"
              />
            </motion.div>

            {/* Feature Matrix Cards */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <FeatureCard 
                icon={ClipboardList} 
                label="Mock Tests" 
                sub={statsLoading ? "..." : `${formatCompact(stats?.totalMocks)}+ SERIES`} 
                color="text-blue-600" 
                href="/mocks" 
              />
              <FeatureCard 
                icon={BookOpen} 
                label="Study Material" 
                sub={statsLoading ? "..." : `${formatCompact(stats?.totalNotes)}+ NOTES`} 
                color="text-indigo-600" 
                href="/notes" 
              />
              <FeatureCard 
                icon={FileText} 
                label="Previous Papers" 
                sub={statsLoading ? "..." : `${formatCompact(stats?.totalPYQs)}+ SOLVED`} 
                color="text-emerald-600" 
                href="/pyqs" 
              />
              <FeatureCard 
                icon={BarChart3} 
                label="Analytics" 
                sub="STATE MERIT" 
                color="text-orange-500" 
                href="/dashboard" 
              />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 mt-8 w-full justify-center">
              <Button asChild className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg text-white font-bold text-xs tracking-tight gap-2">
                <Link href="/mocks">Start Free Mock Test <ChevronRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" className="h-12 px-6 rounded-xl border-slate-200 bg-white font-bold text-slate-700 text-xs tracking-tight gap-2">
                <Link href="/pass"><Gem className="h-4 w-4 text-primary" /> {profile?.passStatus === 'active' ? 'Manage Pass' : 'Get Elite Pass'}</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* STATS GRID: Matched to User Screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 md:mt-16">
          {liveStats.map((stat) => (
            <Card 
              key={stat.id} 
              className="p-4 md:p-6 rounded-[2rem] md:rounded-[3rem] bg-white border border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-xl transition-all duration-500 cursor-default"
            >
              <div className={cn(
                "h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-inner",
                stat.bgColor
              )}>
                {stat.icon}
              </div>
              <div className="text-left">
                <p className="text-xl md:text-2xl font-black text-[#0F172A] leading-none tabular-nums tracking-tight">
                  {stat.val}
                </p>
                <p className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5 leading-none">
                  {stat.label}
                </p>
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
      <Card className="p-4 rounded-2xl border border-slate-100 bg-white hover:shadow-lg transition-all duration-300 h-full group">
        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center mb-3 shadow-inner bg-slate-50 group-hover:scale-110 transition-transform")}>
          <Icon className={cn("h-4 w-4", color)} />
        </div>
        <p className="font-bold text-slate-900 text-xs leading-tight">{label}</p>
        <p className="text-[8px] text-slate-400 mt-0.5 uppercase font-bold tracking-widest">{sub}</p>
      </Card>
    </Link>
  )
}
