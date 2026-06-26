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
  LayoutGrid,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { AuthorityLogo } from "@/lib/exam-icons";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * @fileOverview High-Fidelity Hero Hub v102.2.
 * UPDATED: Reduced Quick Action card sizing for a more compact layout on mobile.
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
    <section className="relative overflow-hidden bg-white pt-6 pb-12 md:pt-10 md:pb-16 border-b border-slate-50">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto">
        
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center px-4 sm:px-6 lg:px-8">

          {/* 1. Text Content Hub */}
          <div className="text-center lg:text-left space-y-4 md:space-y-8 flex flex-col order-1">
            
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

            <div className="space-y-3 md:space-y-6">
              <h1 className="text-[26px] md:text-5xl lg:text-6xl xl:text-7xl font-[900] tracking-tighter text-[#0F172A] leading-[1.05] md:leading-[0.95] antialiased">
                Crack Punjab Govt Exams <br className="hidden md:block"/>
                <span className="text-primary italic">With Confidence</span>
              </h1>

              <div className="space-y-4 md:space-y-6">
                <p className="text-[14px] md:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-bold tracking-tight">
                  Mock tests and notes checked by official patterns.
                </p>
                
                <div className="flex flex-wrap justify-center lg:justify-start gap-1.5 md:gap-2 max-w-xl mx-auto lg:mx-0">
                  {boardHubs.map((board, i) => (
                    <Link 
                      key={i} 
                      href={board.href}
                      className="px-2.5 py-0.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] md:text-[11px] font-bold text-slate-400 whitespace-nowrap shadow-sm hover:border-primary/30 hover:text-primary transition-all active:scale-95"
                    >
                      {board.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden lg:flex flex-col sm:flex-row gap-4 pt-4 w-full max-w-lg">
               <Button asChild className="sm:flex-1 h-12 md:h-16 px-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-[13px] md:text-lg tracking-tight rounded-full active:scale-95 transition-all border-none">
                  <Link href="/mocks" className="flex items-center justify-center gap-3">
                    <Play className="h-4 w-4 md:h-6 md:w-6 fill-current" /> Start Prep
                  </Link>
               </Button>
               <Button asChild variant="outline" className="sm:flex-1 h-12 md:h-16 px-10 rounded-full font-bold text-[13px] md:text-lg tracking-tight border-2 border-slate-200 hover:border-primary/30 hover:bg-slate-50 transition-all active:scale-95 text-[#0F172A]">
                  <Link href="/exams" className="flex items-center justify-center gap-3">
                    <LayoutGrid className="h-4 w-4 md:h-6 md:w-6" /> View Exams
                  </Link>
               </Button>
            </div>
          </div>

          {/* 2. Hero Image */}
          <div className="flex flex-col items-center w-full max-w-[280px] lg:max-w-none mx-auto lg:mx-0 order-2">
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
                className="object-contain drop-shadow-[0_20px_50px_rgba(22,119,255,0.15)] lg:drop-shadow-[0_25px_60px_rgba(22,119,255,0.15)]" 
                priority
              />
            </motion.div>
          </div>
        </div>

        {/* 3. Action Grid & Mobile CTAs - Edge to Edge on mobile */}
        <div className="mt-8 md:mt-16 space-y-8 md:space-y-12 px-0 sm:px-6 lg:px-8">
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 max-w-5xl mx-auto">
              <QuickActionCard boardId="mock-test" label="Mock Tests" href="/mocks" />
              <QuickActionCard boardId="study-material" label="Notes" href="/notes" />
              <QuickActionCard boardId="pyq" label="PYQ Papers" href="/pyqs" />
              <QuickActionCard boardId="current-affairs" label="Current Affairs" href="/current-affairs" />
           </div>

           <div className="flex flex-col sm:flex-row gap-3 pt-4 w-full max-w-xl mx-auto px-4 lg:hidden">
              <Button asChild className="w-full sm:flex-1 h-12 px-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-[13px] tracking-tight shadow-xl shadow-blue-500/20 rounded-full active:scale-95 transition-all border-none">
                  <Link href="/mocks" className="flex items-center justify-center gap-2.5">
                    <Play className="h-4 w-4 fill-current" /> Start Prep
                  </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:flex-1 h-12 px-10 rounded-full font-bold text-[13px] tracking-tight border-2 border-slate-200 hover:border-primary/30 hover:bg-slate-50 transition-all active:scale-95 text-[#0F172A]">
                  <Link href="/exams" className="flex items-center justify-center gap-2.5">
                    <LayoutGrid className="h-4 w-4" /> View Exams
                  </Link>
              </Button>
           </div>
        </div>

      </div>
    </section>
  );
}

function QuickActionCard({ boardId, label, href }: { boardId: string, label: string, href: string }) {
  return (
    <Link href={href} className="block group h-full">
      <Card className="w-full md:max-w-[240px] mx-auto border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 rounded-[1rem] md:rounded-[2rem] bg-white group overflow-hidden flex flex-col p-2 pt-4 pb-2 md:p-6 text-center">
        <div className="flex justify-center mb-2 md:mb-6 shrink-0">
          <div className="h-10 w-10 md:h-16 md:w-16 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
             <AuthorityLogo boardId={boardId} size="md" className="border-none shadow-none h-10 w-10 md:h-16 md:w-16" />
          </div>
        </div>
        <div className="min-w-0">
           <h3 className="text-[11px] md:text-lg font-bold tracking-tight text-[#0F172A] group-hover:text-primary transition-colors line-clamp-1">
              {label}
           </h3>
        </div>
      </Card>
    </Link>
  )
}
