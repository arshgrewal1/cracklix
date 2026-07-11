
'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Star,
  ArrowRight,
  Play,
  ChevronRight,
  Smartphone,
  ShieldCheck,
  Layers,
  Target,
  FileText,
  BookOpen,
  FileStack
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { AuthorityLogo } from "@/lib/exam-icons";
import Image from "next/image";
import { cn } from "@/lib/utils";
import PWAInstallButton from "@/components/PWAInstallButton";
import { usePWAInstall } from "@/hooks/use-pwa-install";

/**
 * @fileOverview Institutional Hero Hub v118.0.
 * FIXED: Removed forced uppercase from action card labels and subtitles.
 */
export default function Hero() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  const { isInstalled } = usePWAInstall();

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats } = useDoc<any>(statsRef);

  const boardHubs = [
    { label: "PPSC", href: "/exams/hub/ppsc" },
    { label: "PSSSB", href: "/exams/hub/psssb" },
    { label: "Punjab Police", href: "/exams/hub/punjab-police" },
    { label: "PSPCL", href: "/exams/hub/pspcl" },
    { label: "PSTET", href: "/exams/hub/pstet" },
    { label: "And Others", href: "/exams" }
  ];

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-white pt-6 pb-10 md:pt-16 md:pb-24 border-b border-slate-50">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto">
        
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center px-4 sm:px-6 lg:px-8">

          {/* 1. Text Content Hub */}
          <div className="text-center lg:text-left space-y-4 md:space-y-8 flex flex-col order-1">
            
            <motion.div 
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/50 border border-blue-100/50 w-fit mx-auto lg:mx-0"
            >
              <Star className="h-3.5 w-3.5 text-primary fill-primary animate-pulse" />
              <span className="text-[11px] md:text-sm font-bold uppercase tracking-widest text-slate-600">
                Punjab's Smartest Platform
              </span>
            </motion.div>

            <div className="space-y-4 md:space-y-6">
              <h1 className="text-[32px] md:text-6xl lg:text-7xl font-[900] tracking-tighter text-[#0F172A] leading-[1.05] md:leading-[0.95] antialiased">
                Crack Punjab Exams <br className="hidden md:block"/>
                <span className="text-primary italic">with Confidence</span>
              </h1>

              <p className="text-[15px] md:text-xl text-slate-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium tracking-tight">
                Practice with high-fidelity mock tests and official notes curated by Punjab's leading prep experts.
              </p>
                
              <div className="flex flex-wrap justify-center lg:justify-start gap-1.5 md:gap-2 max-w-xl mx-auto lg:mx-0">
                {boardHubs.map((board, i) => (
                  <Link 
                    key={i} 
                    href={board.href}
                    className="px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-400 whitespace-nowrap shadow-sm hover:border-primary/30 hover:text-primary transition-all active:scale-95 uppercase tracking-wider"
                  >
                    {board.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 w-full max-w-lg mx-auto lg:mx-0">
               <Button asChild className="sm:flex-[1.2] h-14 md:h-18 px-10 bg-primary hover:bg-blue-700 text-white font-bold text-sm md:text-lg rounded-2xl md:rounded-[1.5rem] shadow-4xl active:scale-95 transition-all border-none">
                  <Link href="/mocks" className="flex items-center justify-center gap-3">
                    <Play className="h-4 w-4 md:h-6 md:w-6 fill-current" /> Start Preparation
                  </Link>
               </Button>
               
               {!isInstalled ? (
                  <PWAInstallButton className="sm:flex-1 h-14 md:h-18" variant="outline" />
               ) : (
                  <Button asChild variant="outline" className="sm:flex-1 h-14 md:h-18 rounded-2xl md:rounded-[1.5rem] border-2 border-slate-200 bg-white text-[#0F172A] font-bold text-sm md:text-lg shadow-sm transition-all active:scale-95">
                     <Link href="/exams" className="flex items-center justify-center gap-3">
                        <Target className="h-4 w-4 md:h-6 md:w-6 text-primary" /> Browse Exams
                     </Link>
                  </Button>
               )}
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-slate-400 font-bold text-[9px] md:text-[11px] tracking-widest uppercase">
               <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Official Patterns</span>
               <span className="flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> Instant Registry</span>
            </div>
          </div>

          {/* 2. Hero Image */}
          <div className="flex flex-col items-center w-full max-w-[320px] lg:max-w-none mx-auto lg:mx-0 order-2 relative">
            <div className="absolute inset-0 bg-primary/10 blur-[140px] rounded-full" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }} 
              className="relative w-full aspect-square overflow-visible z-10"
            >
              <Image 
                src="/images/hero-student.png" 
                alt="Cracklix Study Hub" 
                fill
                className="object-contain drop-shadow-[0_20px_50px_rgba(22,119,255,0.2)]" 
                priority
              />
            </motion.div>
          </div>
        </div>

        {/* 3. Action Grid - LIVE REGISTRY SYNC */}
        <div className="mt-12 md:mt-24 px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 max-w-7xl mx-auto">
              <QuickActionCard 
                boardId="mock-test" 
                label="Mock Tests" 
                sub={`${stats?.totalMocks || 450}+ Series`} 
                href="/mocks" 
              />
              <QuickActionCard 
                boardId="study-material" 
                label="Study Notes" 
                sub={`${stats?.totalNotes || 120}+ Verified PDFs`} 
                href="/notes" 
              />
              <QuickActionCard 
                boardId="pyq" 
                label="PYQ Papers" 
                sub={`${stats?.totalPYQs || 50}+ Archives`} 
                href="/pyqs" 
              />
              <QuickActionCard 
                boardId="current-affairs" 
                label="Current Affairs" 
                sub="Daily Hub" 
                href="/current-affairs" 
              />
           </div>
        </div>

      </div>
    </section>
  );
}

function QuickActionCard({ boardId, label, sub, href }: { boardId: string, label: string, sub: string, href: string }) {
  return (
    <Link href={href} className="block group h-full">
      <Card className="w-full mx-auto border border-slate-100 shadow-xl hover:shadow-4xl transition-all duration-700 rounded-[2rem] md:rounded-[3rem] bg-white group overflow-hidden flex flex-col p-6 md:p-10 text-left items-start justify-center relative h-full min-h-[160px] md:min-h-[220px]">
        <div className="flex justify-center mb-6 md:mb-12 shrink-0">
          <div className="h-12 w-12 md:h-20 md:w-20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-700">
             <AuthorityLogo boardId={boardId} size="md" className="border-none shadow-none w-full h-full bg-slate-50" />
          </div>
        </div>
        <div className="min-w-0 space-y-1">
           <h3 className="text-[14px] md:text-2xl font-bold tracking-tight text-[#0F172A] group-hover:text-primary transition-colors leading-none">
              {label}
           </h3>
           <p className="text-[8px] md:text-[11px] font-bold text-slate-400 tracking-tight">{sub}</p>
        </div>
        <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
           <ChevronRight className="h-5 w-5 text-primary" />
        </div>
      </Card>
    </Link>
  )
}
