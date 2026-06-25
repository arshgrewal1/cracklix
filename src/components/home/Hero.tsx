'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Star,
  ArrowRight,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { AuthorityLogo } from "@/lib/exam-icons";
import Image from "next/image"

/**
 * @fileOverview Hero Hub v4.1 - Standardized Case.
 */
export default function Hero() {
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

          <div className="text-left space-y-4 md:space-y-8">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-100 shadow-sm group hover:border-primary/30 transition-all cursor-default"
            >
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 animate-pulse" />
              <span className="text-[10px] md:text-[12px] font-bold text-slate-700 tracking-tight">
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

          <div className="hidden lg:flex flex-col items-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="relative">
              <Image 
                src="/images/hero-student.png" 
                alt="Cracklix Student Preparation" 
                width={600}
                height={600}
                className="w-full max-w-xl drop-shadow-2xl h-auto object-contain" 
                priority
              />
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:hidden flex justify-center mt-4">
            <Image 
              src="/images/hero-student.png" 
              alt="Cracklix Student Hub" 
              width={300}
              height={300}
              className="h-[140px] w-auto drop-shadow-xl" 
            />
          </motion.div>
        </div>

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
            label="Old Papers" 
            href="/pyqs" 
          />
          <QuickActionCard 
            boardId="current-affairs"
            label="Daily News" 
            href="/current-affairs" 
          />
        </div>

        <div className="flex flex-row gap-3 md:gap-5 mt-8 md:mt-12 justify-center lg:justify-start">
          <Button asChild className="flex-1 md:flex-none h-14 md:h-18 rounded-full font-black text-xs md:text-sm tracking-widest px-6 md:px-14 shadow-xl active:scale-95 transition-all border-none">
            <Link href="/mocks" className="flex items-center gap-2">Start free mock <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 md:flex-none h-14 md:h-18 rounded-full font-black text-xs md:text-sm tracking-widest px-6 md:px-14 shadow-sm border-2 active:scale-95 transition-all">
            <Link href="/exams">View Tests</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function QuickActionCard({ boardId, label, href }: { boardId: string, label: string, href: string }) {
  return (
    <Link href={href} className="block group h-full">
      <div className="bg-white rounded-[2rem] p-4 md:p-6 flex items-center gap-3 md:gap-4 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer border border-slate-100 active:scale-[0.98] h-full">
        <div className="h-10 w-10 md:h-16 md:w-16 rounded-2xl md:rounded-[2.5rem] bg-slate-50 shadow-inner flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 overflow-hidden">
          <AuthorityLogo boardId={boardId} size="md" className="bg-transparent shadow-none p-0" />
        </div>
        <div className="text-left flex-1 min-w-0">
          <h3 className="text-xs md:text-lg font-black text-[#0F172A] leading-tight group-hover:text-primary transition-colors tracking-tight">
            {label}
          </h3>
          <p className="text-[7px] md:text-[9px] font-bold text-slate-400 tracking-tight mt-1">Official Hub</p>
        </div>
        <div className="h-6 w-6 h-6 w-6 md:h-8 md:w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 group-hover:bg-primary/5 group-hover:text-primary transition-all shrink-0">
           <ChevronRight className="h-3 w-3 md:h-4 md:w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}
