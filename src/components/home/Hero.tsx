'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  ShieldCheck,
  Users,
  Zap,
  ChevronRight,
  FileText,
  FileStack,
  Target,
  Landmark,
  ArrowRight,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * @fileOverview High-Fidelity Hero Hub v50.0.
 * REPLICATED: Strictly matched to user screenshot with Quick Features, CTAs, and Stats.
 */

export default function Hero() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats, loading: statsLoading } = useDoc<any>(statsRef);

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] pt-10 pb-20 md:pt-16 md:pb-32">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full bg-blue-600/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 md:px-12 relative z-10 space-y-10 md:space-y-16">
        
        {/* 1. TOP ROW: QUICK FEATURES */}
        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 lg:grid lg:grid-cols-4 lg:gap-6">
          <QuickFeatureCard 
            icon={<FileText className="text-blue-600" />} 
            title="Mock Tests" 
            sub="Exam-focused mock tests" 
          />
          <QuickFeatureCard 
            icon={<FileStack className="text-emerald-600" />} 
            title="Previous Papers" 
            sub="Previous year question papers" 
          />
          <QuickFeatureCard 
            icon={<Target className="text-purple-600" />} 
            title="Daily Practice" 
            sub="Practice daily & stay ahead" 
          />
          <QuickFeatureCard 
            icon={<Landmark className="text-amber-600" />} 
            title="Punjab Exams" 
            sub="All major Punjab exams at one place" 
          />
        </div>

        {/* 2. MIDDLE ROW: HEADLINE & CTAs */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 md:space-y-12 max-w-4xl">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-extrabold tracking-tight text-[#0F172A] leading-[1.05] break-words">
              Crack Punjab <br/>
              <span className="text-[#2563EB]">Government Exams</span> <br/>
              With Confidence
            </h1>
            <p className="text-base md:text-xl text-[#64748B] font-medium leading-relaxed max-w-2xl">
              Prepare for PSSSB, PPSC, and Punjab Police with high-fidelity bilingual mock tests and verified patterns.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Button
              asChild
              className="w-full sm:w-auto h-14 md:h-16 px-10 bg-[#2563EB] hover:bg-blue-700 text-white font-black uppercase text-[10px] md:text-[11px] tracking-widest rounded-xl shadow-xl border-none transition-all active:scale-95 group/btn"
            >
              <Link href="/mocks" className="flex items-center justify-center gap-4">
                Start Free Mock Test <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto h-14 md:h-16 px-10 border-2 border-slate-200 bg-white text-[#2563EB] font-black uppercase text-[10px] md:text-[11px] tracking-widest rounded-xl shadow-sm hover:bg-slate-50 transition-all active:scale-95 group/btn"
            >
              <Link href="/exams" className="flex items-center justify-center gap-4">
                Browse Exams <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>

        {/* 3. BOTTOM ROW: TRUST STATS */}
        <div className="flex overflow-x-auto no-scrollbar gap-4 md:gap-6 pb-4 -mx-4 px-4 md:mx-0 md:px-0 lg:grid lg:grid-cols-4">
          <StatCard 
            icon={<Zap className="h-6 w-6 text-white" />} 
            val={statsLoading ? "50K+" : (Math.floor((stats?.totalQuestions || 50000) / 1000) + "K+")} 
            label="Questions" 
            sub="High quality practice questions" 
            color="bg-[#2563EB]"
          />
          <StatCard 
            icon={<ClipboardList className="h-6 w-6 text-white" />} 
            val={statsLoading ? "500+" : (stats?.totalMocks || 500) + "+"} 
            label="Mock Tests" 
            sub="Topic wise & full length mocks" 
            color="bg-[#8B5CF6]"
          />
          <StatCard 
            icon={<ShieldCheck className="h-6 w-6 text-white" />} 
            val={statsLoading ? "50+" : (stats?.totalBoards || 50) + "+"} 
            label="Exams" 
            sub="All major Punjab exams" 
            color="bg-[#10B981]"
          />
          <StatCard 
            icon={<Users className="h-6 w-6 text-white" />} 
            val={statsLoading ? "15K+" : (Math.floor((stats?.totalUsers || 15000) / 1000) + "K+")} 
            label="Aspirants" 
            sub="Trust Cracklix for preparation" 
            color="bg-[#F59E0B]"
          />
        </div>

      </div>
    </section>
  );
}

function QuickFeatureCard({ icon, title, sub }: { icon: React.ReactNode, title: string, sub: string }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 min-w-[240px] lg:min-w-0 group hover:shadow-md transition-all">
      <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <div className="min-w-0 text-left">
        <h4 className="font-bold text-[#0F172A] text-sm md:text-base leading-none mb-1 uppercase tracking-tight">{title}</h4>
        <p className="text-[10px] md:text-xs text-slate-400 font-medium leading-tight truncate">{sub}</p>
      </div>
    </div>
  );
}

function StatCard({ icon, val, label, sub, color }: { icon: React.ReactNode, val: string, label: string, sub: string, color: string }) {
  return (
    <Card className="border-none shadow-lg rounded-[2rem] p-6 md:p-8 bg-white flex items-center gap-6 min-w-[280px] lg:min-w-0 group hover:translate-y-[-4px] transition-all duration-300">
      <div className={cn("h-14 w-14 md:h-20 md:w-20 rounded-[1.2rem] md:rounded-[1.8rem] flex items-center justify-center shrink-0 shadow-2xl transition-transform group-hover:scale-110", color)}>
        {icon}
      </div>
      <div className="text-left space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl md:text-4xl font-black text-[#0F172A] tabular-nums tracking-tighter">{val}</span>
          <span className="text-xs md:text-sm font-black text-[#0F172A] uppercase tracking-tight">{label}</span>
        </div>
        <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-tight leading-none pt-1">{sub}</p>
      </div>
    </Card>
  );
}
