'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Star,
  ArrowRight,
  ClipboardList,
  BookOpen,
  FileStack,
  Newspaper,
  Play,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { AuthorityLogo } from "@/lib/exam-icons";
import Image from "next/image";

/**
 * @fileOverview Refined Hero Hub v91.0.
 * OPTIMIZED: Side-by-side desktop layout while preserving PWA specific stacking.
 */
export default function Hero() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats } = useDoc<any>(statsRef);

  const boardHubs = [
    { label: "PSSSB", href: "/exams/hub/psssb" },
    { label: "PPSC", href: "/exams/hub/ppsc" },
    { label: "Punjab Police", href: "/exams/hub/punjab-police" },
    { label: "PSPCL", href: "/exams/hub/pspcl" },
    { label: "PSTET", href: "/exams/hub/pstet" },
    { label: "CTET", href: "/exams/hub/ctet" },
    { label: "ETT Cader", href: "/exams/hub/teaching-hub" },
    { label: "Lecturer Cader", href: "/exams/hub/teaching-hub" },
    { label: "Master Cader", href: "/exams/hub/teaching-hub" },
    { label: "BFUHS Exam", href: "/exams/hub/bfuhs" },
    { label: "And Others", href: "/exams" }
  ];

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-white pt-6 pb-12 md:pt-16 md:pb-28 border-b border-slate-50">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Responsive Flex/Grid Container */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 md:gap-20 lg:gap-24 items-center">

          {/* 1. Text Content Hub - Primary Left on Desktop */}
          <div className="text-center lg:text-left space-y-6 md:space-y-8 flex flex-col order-1">
            
            <motion.div 
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/50 border border-blue-100/50 w-fit mx-auto lg:mx-0"
            >
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 animate-pulse" />
              <span className="text-[11px] md:text-sm font-bold text-slate-600 tracking-tight">
                Punjab's smartest study platform
              </span>
            </motion.div>

            <div className="space-y-4 md:space-y-6">
              <h1 className="text-[clamp(26px,6vw,44px)] lg:text-[clamp(32px,4vw,64px)] xl:text-[72px] font-[900] tracking-tighter text-[#0F172A] leading-[1.1] md:leading-[0.95] antialiased">
                Crack Punjab Govt Exams <br className="hidden md:block"/>
                <span className="text-primary italic">With Confidence</span>
              </h1>

              <div className="space-y-4 md:space-y-6">
                <p className="text-[clamp(14px,3vw,18px)] lg:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-bold tracking-tight">
                  Mock tests and notes checked by official patterns.
                </p>
                
                {/* Board Hub - Wraps under Description on both Mobile & Desktop */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-1.5 md:gap-2 max-w-xl mx-auto lg:mx-0">
                  {boardHubs.map((board, i) => (
                    <Link 
                      key={i} 
                      href={board.href}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px] md:text-[11px] font-black text-slate-400 whitespace-nowrap shadow-sm hover:border-primary/30 hover:text-primary transition-all active:scale-95"
                    >
                      {board.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Buttons - Positioned for accessibility on Desktop */}
            <div className="hidden lg:flex flex-col sm:flex-row gap-4 pt-4 w-full max-w-xl">
               <Button asChild className="sm:flex-1 h-16 px-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg shadow-xl shadow-blue-500/20 rounded-full active:scale-95 transition-all border-none">
                  <Link href="/mocks" className="flex items-center justify-center gap-2">
                    <Play className="h-5 w-5 fill-current" /> Start Study
                  </Link>
               </Button>
               <Button asChild variant="outline" className="sm:flex-1 h-16 px-10 rounded-full font-bold text-lg border-2 border-slate-200 hover:border-primary/30 hover:bg-slate-50 transition-all active:scale-95">
                  <Link href="/exams" className="flex items-center justify-center gap-2">
                    <LayoutGrid className="h-5 w-5" /> View Exams
                  </Link>
               </Button>
            </div>
          </div>

          {/* 2. Hero Image - Dynamic Positioning */}
          <div className="flex flex-col items-center w-full max-w-[280px] lg:max-w-none mx-auto lg:mx-0 order-2 lg:order-2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }} 
              className="relative w-full aspect-square overflow-visible"
            >
              <Image 
                src="/images/hero-student.png" 
                alt="Cracklix Study" 
                fill
                className="object-contain drop-shadow-[0_20px_50px_rgba(22,119,255,0.15)] lg:drop-shadow-[0_35px_80px_rgba(22,119,255,0.2)]" 
                priority
              />
            </motion.div>
          </div>

          {/* 3. Action Grid & Mobile CTAs - Lower priority group on Desktop */}
          <div className="col-span-1 lg:col-span-2 space-y-6 md:space-y-12 order-3">
             {/* Action Grid - Spans wide on Desktop */}
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <QuickActionCard boardId="mock-test" label="Mock Tests" href="/mocks" />
                <QuickActionCard boardId="study-material" label="Notes" href="/notes" />
                <QuickActionCard boardId="pyq" label="PYQ Papers" href="/pyqs" />
                <QuickActionCard boardId="current-affairs" label="Current Affairs" href="/current-affairs" />
             </div>

             {/* MOBILE ONLY CTA BUTTONS - Preserving PWA order */}
             <div className="flex flex-col sm:flex-row gap-4 pt-2 w-full max-w-xl mx-auto lg:hidden">
                <Button asChild className="w-full sm:flex-1 h-12 px-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-[15px] shadow-xl shadow-blue-500/20 rounded-full active:scale-95 transition-all border-none">
                    <Link href="/mocks" className="flex items-center justify-center gap-2">
                      <Play className="h-4 w-4 fill-current" /> Start Study
                    </Link>
                </Button>
                <Button asChild variant="outline" className="w-full sm:flex-1 h-12 px-10 rounded-full font-bold text-[15px] border-2 border-slate-200 hover:border-primary/30 hover:bg-slate-50 transition-all active:scale-95">
                    <Link href="/exams" className="flex items-center justify-center gap-2">
                      <LayoutGrid className="h-4 w-4" /> View Exams
                    </Link>
                </Button>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function QuickActionCard({ boardId, label, href }: { boardId: string, label: string, href: string }) {
  return (
    <Link href={href} className="block group h-full">
      <Card className="bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 rounded-2xl md:rounded-[2.5rem] p-3.5 md:p-12 flex flex-col md:flex-row items-center gap-2 md:gap-8 cursor-pointer active:scale-[0.98] h-full text-center md:text-left">
        <div className="h-10 w-10 md:h-20 md:w-20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
          <AuthorityLogo boardId={boardId} size="lg" className="bg-transparent shadow-none border-none p-0 w-full h-full" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[13px] md:text-xl font-bold text-[#0F172A] group-hover:text-primary transition-colors leading-tight">
            {label}
          </h3>
        </div>
      </Card>
    </Link>
  )
}
