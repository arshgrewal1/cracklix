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

/**
 * @fileOverview Official High-Density Hero Hub v25.0.
 */

const formatCompact = (num: number) => {
  if (num === undefined || num === null) return "...";
  if (num === 0) return "0";
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
    { id: "q", icon: <Zap className="h-4 w-4 text-blue-600" />, val: statsLoading ? "..." : `${formatCompact(stats?.totalQuestions)}+`, label: "QUESTIONS" },
    { id: "m", icon: <ClipboardList className="h-4 w-4 text-indigo-600" />, val: statsLoading ? "..." : `${formatCompact(stats?.totalMocks)}+`, label: "MOCK TESTS" },
    { id: "e", icon: <ShieldCheck className="h-4 w-4 text-emerald-600" />, val: statsLoading ? "..." : `${formatCompact(stats?.totalCategories)}+`, label: "CATEGORIES" },
    { id: "u", icon: <Users className="h-4 w-4 text-orange-500" />, val: statsLoading ? "..." : `${formatCompact(stats?.totalUsers)}+`, label: "ASPIRANTS" }
  ], [stats, statsLoading]);

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-blue-50 py-4 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-4 md:gap-8 items-center">

          <div className="text-left space-y-2 md:space-y-6">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-slate-100 shadow-sm group hover:border-primary/30 transition-all cursor-default"
            >
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 animate-pulse" />
              <span className="text-[8px] md:text-[12px] font-black text-slate-700 tracking-tight uppercase">
                {statsLoading ? "..." : (stats?.totalUsers || 0).toLocaleString()} Students Preparing
              </span>
            </motion.div>

            <div className="space-y-1.5 md:space-y-4">
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.05]">
                Crack Punjab <br/>
                <span className="block text-blue-600">Government Exams</span>
                With Confidence
              </h1>

              <p className="text-[10px] sm:text-base text-slate-600 max-w-lg leading-relaxed font-medium">
                Practice with bilingual mock tests, previous papers and exam-focused preparation.
              </p>

              <div className="flex flex-wrap gap-1 md:gap-1.5 pt-1">
                {["PSSSB", "Punjab Police", "PSTET"].map((item) => (
                  <span key={item} className="px-2 py-0.5 rounded-full bg-white border text-[8px] md:text-[10px] font-bold text-slate-400 tracking-tight">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative flex justify-center mb-2 md:mb-6">
              <img src="/images/hero-student.png" alt="Cracklix Student" className="w-full max-w-[140px] md:max-w-md drop-shadow-2xl" />
            </motion.div>

            <div className="grid grid-cols-2 gap-1.5 md:gap-3 w-full max-w-sm md:max-w-none">
              <FeatureCard icon={ClipboardList} label="Mock Tests" sub="Premium" color="text-blue-600" href="/mocks" />
              <FeatureCard icon={BookOpen} label="Study Material" sub="Verified" color="text-indigo-600" href="/notes" />
              <FeatureCard icon={FileText} label="PYQ Papers" sub="Solved" color="text-emerald-600" href="/pyqs" />
              <FeatureCard icon={BarChart3} label="Analytics" sub="Merit" color="text-orange-500" href="/dashboard" />
            </div>

            <div className="flex flex-wrap gap-2 mt-4 md:mt-8 w-full justify-center">
              <Button asChild className="h-10 md:h-12 px-4 md:px-6 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg text-white font-bold text-[10px] md:text-xs tracking-tight gap-2">
                <Link href="/mocks">Start Free Mock <ChevronRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" className="h-10 md:h-12 px-4 md:px-6 rounded-xl border-slate-200 bg-white font-bold text-slate-700 text-[10px] md:text-xs tracking-tight gap-2">
                <Link href="/pass"><Gem className="h-4 w-4 text-primary" /> {profile?.passStatus === 'active' ? 'Manage' : 'Get Pass'}</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 md:mt-10">
          {liveStats.map((stat) => (
            <Card key={stat.id} className="p-2 md:p-4 rounded-xl md:rounded-2xl bg-white border border-slate-100 shadow-md group hover:shadow-xl transition-all">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="h-7 w-7 md:h-9 md:w-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-left">
                  <p className="text-sm md:text-xl font-black text-slate-900 leading-none tabular-nums">{stat.val}</p>
                  <p className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5 md:mt-1">{stat.label}</p>
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
      <Card className="p-2 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 bg-white hover:shadow-lg transition-all duration-300 h-full group">
        <div className={cn("h-6 w-6 md:h-8 md:w-8 rounded-lg flex items-center justify-center mb-1.5 md:mb-3 shadow-inner bg-slate-50 group-hover:scale-110 transition-transform")}>
          <Icon className={cn("h-3 w-3 md:h-4 md:w-4", color)} />
        </div>
        <p className="font-bold text-slate-900 text-[9px] md:text-xs leading-tight text-left">{label}</p>
        <p className="text-[6px] md:text-[8px] text-slate-400 mt-0.5 uppercase font-bold tracking-widest text-left">{sub}</p>
      </Card>
    </Link>
  )
}