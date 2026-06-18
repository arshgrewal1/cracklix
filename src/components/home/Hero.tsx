'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
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
 * @fileOverview Official Fluid Hero Hub v17.0.
 * UPDATED: Image positioned above cards on mobile; buttons moved below cards.
 */

const CORE_FEATURES = [
  { icon: ClipboardList, label: "Mock Tests", href: "/mocks", color: "text-blue-600", bgColor: "bg-blue-50" },
  { icon: BookOpen, label: "Study Material", href: "/study-material", color: "text-indigo-600", bgColor: "bg-indigo-50" },
  { icon: FileText, label: "Previous Papers", href: "/previous-papers", color: "text-emerald-600", bgColor: "bg-emerald-50" },
  { icon: BarChart3, label: "Performance Analytics", href: "/analytics", color: "text-orange-500", bgColor: "bg-orange-50" },
];

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

  const HeroImage = ({ className }: { className?: string }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.8 }}
      className={cn("relative flex justify-center", className)}
    >
      <div className="absolute inset-0 bg-blue-600/5 blur-[100px] rounded-full scale-150" />
      <img
        src="/images/hero-student.png"
        alt="Cracklix Student"
        className="relative w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-w-[280px] xs:max-w-sm md:max-w-md lg:max-w-[560px] transform hover:scale-[1.02] transition-transform duration-700"
      />
    </motion.div>
  );

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-blue-50 py-12 md:py-20 lg:py-28 text-left">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* COLUMN 1: CONTENT HUB */}
          <div className="space-y-8 md:space-y-12 max-w-2xl">
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

              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 font-medium leading-relaxed max-w-xl">
                Practice with bilingual mock tests, previous papers and
                exam-focused preparation for PSSSB, Punjab Police, and more.
              </p>
            </div>

            {/* MOBILE ONLY: Student Image positioned exactly above Feature Cards */}
            <HeroImage className="lg:hidden py-4" />

            {/* FEATURE CARDS GRID */}
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {CORE_FEATURES.map((feature, idx) => (
                <Link key={idx} href={feature.href}>
                  <Card className="p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] bg-white border-none shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col items-start gap-4 group cursor-pointer active:scale-95">
                    <div className={cn("h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform", feature.bgColor, feature.color)}>
                      <feature.icon className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#0F172A] leading-tight">
                      {feature.label}
                    </h3>
                  </Card>
                </Link>
              ))}
            </div>

            {/* CTAS (Positioned below cards) */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                asChild
                className="w-full sm:w-auto h-14 md:h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] md:text-[11px] tracking-widest rounded-full shadow-xl border-none transition-all gap-2"
              >
                <Link href="/mocks">
                  Start Practice Now
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto h-14 md:h-16 px-10 border-none bg-white rounded-full font-black uppercase text-[10px] md:text-[11px] tracking-widest transition-all text-slate-600 shadow-xl hover:bg-slate-50"
              >
                <Link href="/exams">
                  Browse Exams
                </Link>
              </Button>
            </div>
          </div>
          
          {/* COLUMN 2: DESKTOP VISUAL HUB */}
          <div className="hidden lg:flex justify-end">
            <HeroImage />
          </div>
        </div>
      </div>
    </section>
  );
}
