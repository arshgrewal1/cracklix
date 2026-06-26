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
 * @fileOverview Hero Hub v4.6 - Mobile Size Optimized.
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
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-blue-50 pt-4 pb-10 md:py-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-12 items-center">

          {/* LEFT: TEXT CONTENT */}
          <div className="text-left space-y-4 md:space-y-10 order-2 lg:order-1">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="hidden lg:inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-100 shadow-sm group hover:border-primary/30 transition-all cursor-default"
            >
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 animate-pulse" />
              <span className="text-[13px] font-bold text-slate-700 tracking-tight">
                Punjab's smartest exam platform
              </span>
            </motion.div>

            <div className="space-y-3 md:space-y-6">
              <h1 className="text-[22px] md:text-5xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1] md:leading-[1.05]">
                Crack Punjab Govt Exams <br className="hidden md:block"/>
                <span className="block text-primary">With Confidence</span>
              </h1>

              <p className="text-sm md:text-xl text-slate-500 max-w-xl leading-relaxed font-medium">
                Practice tests, previous papers, and study material verified by official board patterns.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
               <Button asChild size="lg" className="w-full sm:w-auto h-12 md:h-16 px-8 md:px-20 rounded-full font-bold text-sm md:text-base tracking-tight shadow-xl active:scale-95 transition-all border-none">
                  <Link href="/mocks" className="flex items-center gap-2">Start Learning <ArrowRight className="h-4 w-4 md:h-5 md:w-5" /></Link>
               </Button>
               <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-12 md:h-16 px-8 md:px-20 rounded-full font-bold text-sm md:text-base tracking-tight shadow-sm border-2 active:scale-95 transition-all">
                  <Link href="/exams">Explore Exams</Link>
               </Button>
            </div>
          </div>

          {/* RIGHT: HERO IMAGE - COMPACT BANNER ON MOBILE */}
          <div className="flex flex-col items-center order-1 lg:order-2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.6, ease: "easeOut" }} 
              className="relative w-full h-[180px] sm:h-[220px] md:h-auto md:max-w-xl rounded-[20px] md:rounded-[40px] overflow-hidden shadow-xl md:shadow-none"
            >
              <Image 
                src="/images/hero-student.png" 
                alt="Cracklix Student Preparation" 
                width={600}
                height={600}
                className="w-full h-full object-cover md:object-contain drop-shadow-2xl" 
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:hidden pointer-events-none" />
            </motion.div>
          </div>
        </div>

        {/* QUICK ACTIONS - SMALLER ON MOBILE */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 mt-8 md:mt-24">
          <QuickActionCard 
            boardId="mock-test"
            label="Practice Tests" 
            href="/mocks" 
          />
          <QuickActionCard 
            boardId="study-material"
            label="Study Material" 
            href="/study-material" 
          />
          <QuickActionCard 
            boardId="pyq"
            label="Previous Papers" 
            href="/pyqs" 
          />
          <QuickActionCard 
            boardId="current-affairs"
            label="Current Affairs" 
            href="/current-affairs" 
          />
        </div>
      </div>
    </section>
  );
}

function QuickActionCard({ boardId, label, href }: { boardId: string, label: string, href: string }) {
  return (
    <Link href={href} className="block group h-full">
      <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 flex items-center gap-3 md:gap-6 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer border border-slate-100 active:scale-[0.98] h-full">
        <div className="h-10 w-10 md:h-16 md:w-16 rounded-xl bg-slate-50 shadow-inner flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 overflow-hidden">
          <AuthorityLogo boardId={boardId} size="sm" className="bg-transparent shadow-none p-0 h-6 w-6 md:h-10 md:w-10" />
        </div>
        <div className="text-left flex-1 min-w-0">
          <h3 className="text-xs md:text-xl font-black text-[#0F172A] leading-tight group-hover:text-primary transition-colors tracking-tight truncate">
            {label}
          </h3>
          <p className="text-[9px] md:text-sm font-bold text-slate-400 mt-0.5 md:mt-1">Verified Hub</p>
        </div>
        <div className="hidden sm:flex h-8 w-8 rounded-full bg-slate-50 items-center justify-center text-slate-200 group-hover:bg-primary/5 group-hover:text-primary transition-all shrink-0">
           <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}