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
  Gem,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useDoc, useFirestore, useUser } from "@/firebase";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Official Compact Hero Hub v29.0.
 * UPDATED: Tagline refactored to "Crack Punjab Govt Exam with Confidence".
 */

export default function Hero() {
  const { profile } = useUser();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats } = useDoc<any>(statsRef);

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-blue-50 py-4 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-4 md:gap-8 items-center">

          {/* 1. CONTENT BLOCK - COMPACT MOBILE */}
          <div className="text-left space-y-3 md:space-y-6">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-slate-100 shadow-sm group hover:border-primary/30 transition-all cursor-default"
            >
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 animate-pulse" />
              <span className="text-[8px] md:text-[12px] font-black text-slate-700 tracking-tight">
                ✨ Punjab's Smart Exam Platform
              </span>
            </motion.div>

            <div className="space-y-1.5 md:space-y-4">
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.05] uppercase">
                Crack Punjab Govt Exam <br/>
                <span className="block text-primary">with Confidence</span>
              </h1>

              <p className="text-[11px] sm:text-lg text-slate-500 max-w-lg leading-relaxed font-medium">
                Mock Tests, PYQs, Current Affairs and Study Material in one place.
              </p>
            </div>

            <div className="flex gap-2 md:gap-4 pt-1 md:pt-4">
              <Button asChild className="flex-1 md:flex-none h-11 md:h-14">
                <Link href="/mocks">Start Free Mock <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 md:flex-none h-11 md:h-14">
                <Link href="/exams">Explore Exams</Link>
              </Button>
            </div>
          </div>

          {/* 2. ILLUSTRATION - SHRUNK FOR PWA */}
          <div className="hidden lg:flex flex-col items-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="relative">
              <img 
                src="/images/hero-student.png" 
                alt="Cracklix Student" 
                className="w-full max-w-md drop-shadow-2xl h-auto object-contain" 
              />
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:hidden flex justify-center mt-2">
            <img 
              src="/images/hero-student.png" 
              alt="Cracklix Student" 
              className="h-[90px] w-auto drop-shadow-xl" 
            />
          </motion.div>
        </div>

        {/* QUICK ACTIONS: 2x2 GRID FOR MOBILE */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mt-6 md:mt-16">
          <QuickAction icon={Zap} label="Mock Tests" href="/mocks" color="bg-blue-600" />
          <QuickAction icon={BookOpen} label="Study Material" href="/notes" color="bg-indigo-600" />
          <QuickAction icon={FileText} label="PYQ Papers" href="/pyqs" color="bg-emerald-600" />
          <QuickAction icon={BarChart3} label="Current Affairs" href="/current-affairs" color="bg-orange-500" />
        </div>
      </div>
    </section>
  );
}

function QuickAction({ icon: Icon, label, href, color }: any) {
  return (
    <Link href={href} className="block group h-full">
      <Card className="p-3 md:p-6 rounded-xl border border-slate-100 bg-white hover:shadow-lg transition-all duration-300 h-full group flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left">
        <div className={cn("h-8 w-8 md:h-12 md:w-12 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 shadow-lg text-white group-hover:scale-110 transition-transform", color)}>
          <Icon className="h-4 w-4 md:h-6 md:w-6" />
        </div>
        <span className="text-[10px] md:text-sm font-bold text-slate-800 leading-tight uppercase tracking-tight">{label}</span>
      </Card>
    </Link>
  )
}