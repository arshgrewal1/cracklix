'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  BookOpen,
  FileText,
  BarChart3,
  Star,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useDoc, useFirestore, useUser } from "@/firebase";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { AuthorityLogo } from "@/lib/exam-icons";

/**
 * @fileOverview Official High-Density PWA Hero v38.0.
 * UPDATED: Integrated branded Current Affairs logo.
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
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-blue-50 py-10 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">

          {/* 1. CONTENT BLOCK */}
          <div className="text-left space-y-4 md:space-y-8">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-100 shadow-sm group hover:border-primary/30 transition-all cursor-default"
            >
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 animate-pulse" />
              <span className="text-[10px] md:text-[12px] font-black text-slate-700 tracking-tight">
                Punjab's Smart Exam Platform
              </span>
            </motion.div>

            <div className="space-y-3 md:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                Crack Punjab Govt Exam <br/>
                <span className="block text-primary">with Confidence</span>
              </h1>

              <p className="text-[13px] sm:text-lg text-slate-500 max-w-lg leading-relaxed font-medium">
                Mock Tests, PYQs, and Study Material verified by official patterns.
              </p>
            </div>
          </div>

          {/* 2. ILLUSTRATION */}
          <div className="hidden lg:flex flex-col items-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="relative">
              <img 
                src="/images/hero-student.png" 
                alt="Cracklix Student" 
                className="w-full max-w-xl drop-shadow-2xl h-auto object-contain" 
              />
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:hidden flex justify-center mt-4">
            <img 
              src="/images/hero-student.png" 
              alt="Cracklix Student" 
              className="h-[140px] w-auto drop-shadow-xl" 
            />
          </motion.div>
        </div>

        {/* QUICK ACTIONS: 2x2 GRID FOR MOBILE */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mt-10 md:mt-20">
          <QuickAction icon={Zap} label="Mock Tests" href="/mocks" color="bg-blue-600" />
          <QuickAction icon={BookOpen} label="Study Material" href="/notes" color="bg-indigo-600" />
          <QuickAction icon={FileText} label="PYQ Papers" href="/pyqs" color="bg-emerald-600" />
          <QuickAction 
            customIcon={<AuthorityLogo boardId="current-affairs" size="sm" className="bg-transparent shadow-none p-0" />} 
            label="Current Affairs" 
            href="/current-affairs" 
            color="bg-white" 
          />
        </div>

        {/* CTAs */}
        <div className="flex flex-row gap-3 md:gap-5 mt-8 md:mt-12 justify-center lg:justify-start">
          <Button asChild className="flex-1 md:flex-none h-14 md:h-18 rounded-full font-black text-xs md:text-sm tracking-widest px-6 md:px-14 shadow-xl active:scale-95 transition-all border-none">
            <Link href="/mocks" className="flex items-center gap-2">Start Free Mock <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 md:flex-none h-14 md:h-18 rounded-full font-black text-xs md:text-sm tracking-widest px-6 md:px-14 shadow-sm border-2 active:scale-95 transition-all">
            <Link href="/exams">Explore Exams</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function QuickAction({ icon: Icon, customIcon, label, href, color }: any) {
  return (
    <Link href={href} className="block group h-full">
      <Card className="p-4 md:p-8 rounded-2xl border border-slate-100 bg-white hover:shadow-xl transition-all duration-300 h-full group flex flex-col md:flex-row items-center gap-3 md:gap-5 text-center md:text-left">
        <div className={cn("h-10 w-10 md:h-14 md:w-14 rounded-xl flex items-center justify-center shrink-0 shadow-lg text-white group-hover:scale-110 transition-transform", color)}>
          {customIcon ? customIcon : Icon && <Icon className="h-5 w-5 md:h-7 md:w-7" />}
        </div>
        <span className="text-[11px] md:text-sm font-bold text-slate-800 leading-tight tracking-tight">{label}</span>
      </Card>
    </Link>
  )
}
