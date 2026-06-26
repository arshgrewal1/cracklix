'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Star,
  ArrowRight,
  ChevronRight,
  ClipboardList,
  BookOpen,
  FileStack,
  Newspaper
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { AuthorityLogo } from "@/lib/exam-icons";
import Image from "next/image"

/**
 * @fileOverview Universal Responsive Hero Hub v15.0.
 * SCALING: Fluid Stacking (Mobile) -> Fluid Side-by-Side (Desktop).
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
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-blue-50 pt-6 pb-12 md:pt-24 md:pb-32">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 md:gap-20 lg:gap-24 items-center">

          {/* 1. TEXT CONTENT HUB */}
          <div className="text-center lg:text-left space-y-6 md:space-y-12 order-1">
            <motion.div 
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               className="inline-flex items-center gap-2 md:gap-3 px-4 py-1.5 rounded-full bg-white border border-slate-100 shadow-sm group hover:border-primary/30 transition-all cursor-default"
            >
              <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-500 fill-yellow-500 animate-pulse" />
              <span className="text-[10px] md:text-sm font-black text-slate-600 uppercase tracking-widest">
                Punjab's smartest prep node
              </span>
            </motion.div>

            <div className="space-y-4 md:space-y-8">
              <h1 className="text-[clamp(26px,6vw,32px)] lg:text-[clamp(28px,6vw,84px)] font-[900] tracking-tighter text-[#0F172A] leading-[1] md:leading-[0.95] uppercase antialiased">
                Crack Punjab <br className="hidden md:block"/>
                <span className="text-primary italic">Recruitments</span>
              </h1>

              <p className="text-[clamp(13px,1.8vw,16px)] lg:text-2xl text-slate-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium tracking-tight">
                Practice tests and study nodes verified by official commission patterns.
              </p>
            </div>

            {/* DESKTOP CTAs */}
            <div className="hidden lg:flex flex-col sm:flex-row gap-6 pt-6 max-w-xl">
               <Button asChild className="flex-1 h-18 md:h-24 px-12 rounded-[2rem] font-black uppercase text-base md:text-lg tracking-widest shadow-4xl active:scale-95 transition-all border-none">
                  <Link href="/mocks" className="flex items-center justify-center gap-3">
                    Start Learning <ArrowRight className="h-6 w-6" />
                  </Link>
               </Button>
               <Button asChild variant="outline" className="flex-1 h-18 md:h-24 px-12 rounded-[2rem] font-black uppercase text-base md:text-lg tracking-widest shadow-sm border-[3px] active:scale-95 transition-all">
                  <Link href="/exams">Explore Hub</Link>
               </Button>
            </div>
          </div>

          {/* 2. VISUAL ANCHOR */}
          <div className="flex flex-col items-center order-2 w-full max-w-[280px] md:max-w-none mx-auto lg:mx-0">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }} 
              className="relative w-full aspect-[4/3] lg:aspect-square overflow-visible"
            >
              <Image 
                src="/images/hero-student.png" 
                alt="Cracklix Preparation" 
                fill
                className="object-contain drop-shadow-[0_35px_80px_rgba(22,119,255,0.2)]" 
                priority
              />
            </motion.div>
          </div>
        </div>

        {/* 3. QUICK ACTION CLUSTER */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 mt-12 md:mt-32">
          <QuickActionCard boardId="mock-test" label="Practice Tests" href="/mocks" />
          <QuickActionCard boardId="study-material" label="Study Material" href="/study-material" />
          <QuickActionCard boardId="pyq" label="Previous Papers" href="/pyqs" />
          <QuickActionCard boardId="current-affairs" label="Current Affairs" href="/current-affairs" />
        </div>

        {/* 4. MOBILE CTAs - MOVED BELOW QUICK ACTIONS */}
        <div className="flex flex-col gap-3 pt-10 lg:hidden px-1">
           <Button asChild className="w-full h-12 md:h-14 rounded-full font-black uppercase text-[15px] tracking-[0.2em] shadow-xl active:scale-95 transition-all border-none">
              <Link href="/mocks" className="flex items-center justify-center gap-2">
                Start Learning <ArrowRight className="h-4 w-4" />
              </Link>
           </Button>
           <Button asChild variant="outline" className="w-full h-12 md:h-14 rounded-full font-black uppercase text-[15px] tracking-[0.2em] shadow-sm border-2 active:scale-95 transition-all">
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
      <Card className="bg-white rounded-2xl md:rounded-[3rem] p-4 md:p-12 flex flex-col md:flex-row items-center gap-3 md:gap-8 shadow-sm hover:shadow-3xl hover:-translate-y-1.5 transition-all duration-500 cursor-pointer border border-slate-100 active:scale-[0.98] h-full text-center md:text-left">
        <div className="h-10 w-10 md:h-20 md:w-20 rounded-xl md:rounded-[2rem] bg-slate-50 shadow-inner flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
          <AuthorityLogo boardId={boardId} size="sm" className="bg-transparent shadow-none p-0 h-6 w-6 md:h-12 md:w-12" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="text-[12px] md:text-2xl font-black text-[#0F172A] leading-tight group-hover:text-primary transition-colors tracking-tight uppercase">
            {label}
          </h3>
          <p className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Hub</p>
        </div>
      </Card>
    </Link>
  )
}
