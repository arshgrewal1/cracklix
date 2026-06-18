'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Zap,
  ChevronRight,
  ShieldCheck,
  Users,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * @fileOverview Official Home Hero Hub v20.0.
 * UPDATED: Removed feature cards from hero content to match latest request.
 * Features: 2x2 stats grid, responsive ordering.
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

  const formatNumber = (num: number) => {
    if (!num) return "0";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + "k+";
    return num + "+";
  };

  return (
    <section className="relative overflow-hidden bg-white py-12 md:py-20 lg:py-24 text-left">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* COLUMN 1: CONTENT & FEATURES */}
          <div className="space-y-10 md:space-y-12">
            
            {/* HERO TEXT */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/5 border border-blue-600/10 mb-2">
                <Star className="h-4 w-4 text-primary fill-primary" />
                <span className="text-[10px] sm:text-xs font-bold text-slate-700 tracking-tight uppercase">
                  Institutional Preparation Hub
                </span>
              </div>

              <h1 className="text-4xl md:text-7xl font-extrabold tracking-tighter text-slate-900 leading-[0.95] break-words antialiased">
                CRACK PUNJAB <br/>
                <span className="text-blue-600">GOVT EXAMS</span>
              </h1>

              <p className="text-base md:text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
                Punjab's smartest mock test platform. Built with institutional patterns and bilingual support.
              </p>
            </div>

            {/* MOBILE ONLY: Student Image positioned above features */}
            <div className="lg:hidden py-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative flex justify-center"
              >
                <div className="absolute inset-0 bg-blue-600/5 blur-[60px] rounded-full scale-110" />
                <img
                  src="/images/hero-student.png"
                  alt="Student"
                  className="relative w-full h-auto object-contain drop-shadow-2xl max-w-xs md:max-w-md"
                />
              </motion.div>
            </div>

            {/* FEATURE SECTION */}
            <div className="space-y-8">
               {/* 2X2 STATS GRID */}
               <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <StatCard 
                    icon={<Zap className="h-5 w-5 text-primary" />} 
                    val={formatNumber(stats?.totalQuestions || 439)} 
                    label="QUESTIONS" 
                    loading={statsLoading} 
                  />
                  <StatCard 
                    icon={<ClipboardList className="h-5 w-5 text-indigo-500" />} 
                    val={formatNumber(stats?.totalMocks || 8)} 
                    label="MOCK TESTS" 
                    loading={statsLoading} 
                  />
                  <StatCard 
                    icon={<ShieldCheck className="h-5 w-5 text-emerald-500" />} 
                    val={formatNumber(stats?.totalBoards || 92)} 
                    label="EXAMS" 
                    loading={statsLoading} 
                  />
                  <StatCard 
                    icon={<Users className="h-5 w-5 text-orange-500" />} 
                    val={formatNumber(stats?.totalUsers || 5)} 
                    label="ASPIRANTS" 
                    loading={statsLoading} 
                  />
               </div>
            </div>

            {/* CTA BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                asChild
                className="w-full sm:w-auto h-14 md:h-16 px-10 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl border-none transition-all gap-2"
              >
                <Link href="/mocks">
                  Start Practice Now
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto h-14 md:h-16 px-10 border-2 border-slate-100 bg-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all text-slate-600 hover:bg-slate-50 shadow-sm"
              >
                <Link href="/exams">
                  Browse Exams
                </Link>
              </Button>
            </div>

          </div>

          {/* COLUMN 2: DESKTOP VISUAL HUB */}
          <div className="hidden lg:flex justify-end relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="relative w-full max-w-[560px]"
            >
              <div className="absolute inset-0 bg-blue-600/5 blur-[100px] rounded-full scale-150" />
              <img
                src="/images/hero-student.png"
                alt="Cracklix Aspirant"
                className="relative w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] transform hover:scale-[1.02] transition-transform duration-700"
              />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, val, label, loading }: any) {
  return (
    <Card className="p-6 md:p-10 rounded-[2.5rem] bg-white border-none shadow-xl flex flex-col items-center justify-center text-center gap-4 transition-all duration-300 border border-slate-50">
       <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-slate-50 flex items-center justify-center shadow-inner mb-2">
          {icon}
       </div>
       <div className="space-y-1">
          {loading ? (
             <Skeleton className="h-8 w-16 mx-auto bg-slate-100" />
          ) : (
             <p className="text-2xl md:text-4xl font-headline font-black text-[#0F172A] tracking-tighter leading-none">{val}</p>
          )}
          <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
       </div>
    </Card>
  );
}
