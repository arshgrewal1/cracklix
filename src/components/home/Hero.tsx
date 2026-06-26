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
 * @fileOverview Hero Hub v4.4 - Strategic CTA placement below resource cards.
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
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">

          {/* LEFT: TEXT CONTENT */}
          <div className="text-left space-y-6 md:space-y-10 order-1">
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

            <div className="space-y-4 md:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.05]">
                Crack Punjab Govt Exam <br/>
                <span className="block text-primary">with Confidence</span>
              </h1>

              <p className="text-[13px] sm:text-lg text-slate-500 max-w-xl leading-relaxed font-medium">
                Practice Tests, Old Papers, and Notes verified by official board patterns. Join thousands of successful aspirants today.
              </p>
            </div>
          </div>

          {/* RIGHT: HERO IMAGE - RESTORED FOR MOBILE */}
          <div className="flex flex-col items-center order-2 mt-8 lg:mt-0">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.6, ease: "easeOut" }} 
              className="relative w-full max-w-[320px] sm:max-w-[400px] lg:max-w-xl"
            >
              <Image 
                src="/images/hero-student.png" 
                alt="Cracklix Student Preparation" 
                width={600}
                height={600}
                className="w-full drop-shadow-2xl h-auto object-contain" 
                priority
              />
            </motion.div>
          </div>
        </div>

        {/* QUICK ACTIONS - POSITIONED BELOW HERO IMAGE ON MOBILE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mt-12 md:mt-24">
          <QuickActionCard 
            boardId="mock-test"
            label="Practice Tests" 
            href="/mocks" 
          />
          <QuickActionCard 
            boardId="study-material"
            label="Notes & PDFs" 
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

        {/* PRIMARY CALL TO ACTION - NOW BELOW ALL RESOURCE CARDS */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
           className="mt-10 md:mt-16 flex flex-col sm:flex-row justify-center items-center gap-3 md:gap-5"
        >
           <Button asChild className="w-full sm:w-auto h-12 md:h-16 rounded-full font-black text-[10px] md:text-xs tracking-widest px-12 md:px-16 shadow-xl active:scale-95 transition-all border-none">
              <Link href="/mocks" className="flex items-center gap-2">Start Free Test <ArrowRight className="h-4 w-4" /></Link>
           </Button>
           <Button asChild variant="outline" className="w-full sm:w-auto h-12 md:h-16 rounded-full font-black text-[10px] md:text-xs tracking-widest px-12 md:px-16 shadow-sm border-2 active:scale-95 transition-all">
              <Link href="/exams">Browse All Exams</Link>
           </Button>
        </motion.div>
      </div>
    </section>
  );
}

function QuickActionCard({ boardId, label, href }: { boardId: string, label: string, href: string }) {
  return (
    <Link href={href} className="block group h-full">
      <div className="bg-white rounded-[2rem] p-5 md:p-6 flex items-center gap-4 md:gap-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer border border-slate-100 active:scale-[0.98] h-full">
        <div className="h-11 w-11 md:h-16 md:w-16 rounded-2xl md:rounded-[2.5rem] bg-slate-50 shadow-inner flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 overflow-hidden">
          <AuthorityLogo boardId={boardId} size="md" className="bg-transparent shadow-none p-0" />
        </div>
        <div className="text-left flex-1 min-w-0">
          <h3 className="text-sm md:text-lg font-black text-[#0F172A] leading-tight group-hover:text-primary transition-colors tracking-tight">
            {label}
          </h3>
          <p className="text-[8px] md:text-[9px] font-bold text-slate-400 tracking-tight mt-1 uppercase">Verified Hub</p>
        </div>
        <div className="h-7 w-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 group-hover:bg-primary/5 group-hover:text-primary transition-all shrink-0">
           <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}
