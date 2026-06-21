'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  BookOpen,
  FileText,
  BarChart3,
  Star,
  ArrowRight,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useDoc, useFirestore, useUser } from "@/firebase";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { AuthorityLogo } from "@/lib/exam-icons";

/**
 * @fileOverview Official High-Density PWA Hero v48.0.
 * UPDATED: Fully clickable Quick Action cards with branded hub logos.
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

        {/* QUICK ACTIONS: CLICKABLE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mt-10 md:mt-20">
          <QuickActionCard 
            boardId="mock-test"
            label="Mock Tests" 
            href="/mocks" 
          />
          <QuickActionCard 
            boardId="study-material"
            label="Study Material" 
            href="/study-material" 
          />
          <QuickActionCard 
            boardId="pyq"
            label="PYQ Papers" 
            href="/pyqs" 
          />
          <QuickActionCard 
            boardId="current-affairs"
            label="Current Affairs" 
            href="/current-affairs" 
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

function QuickActionCard({ boardId, label, href }: { boardId: string, label: string, href: string }) {
  return (
    <Link href={href} className="block group h-full">
      <div className="
        bg-white
        rounded-[2rem]
        p-5 md:p-8
        flex
        items-center
        gap-4 md:gap-6
        shadow-md
        hover:shadow-xl
        hover:-translate-y-1
        transition-all
        duration-500
        cursor-pointer
        border
        border-slate-100
        active:scale-[0.98]
        h-full
      ">
        <div className="
          h-12 w-12 md:h-20 md:w-20
          rounded-2xl md:rounded-[2.5rem]
          bg-slate-50
          shadow-inner
          flex
          items-center
          justify-center
          shrink-0
          group-hover:scale-110
          transition-transform
          duration-500
          overflow-hidden
        ">
          <AuthorityLogo boardId={boardId} size="md" className="bg-transparent shadow-none p-0" />
        </div>

        <div className="text-left flex-1 min-w-0">
          <h3 className="text-sm md:text-xl font-black text-[#0F172A] leading-tight group-hover:text-primary transition-colors uppercase">
            {label}
          </h3>
          <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Institutional Hub</p>
        </div>
        
        <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 group-hover:bg-primary/5 group-hover:text-primary transition-all">
           <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}
