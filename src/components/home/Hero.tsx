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
import { useDoc, useFirestore, useCollection } from "@/firebase";
import { doc, collection, query, orderBy } from "firebase/firestore";
import { AuthorityLogo } from "@/lib/exam-icons";
import Image from "next/image";

/**
 * @fileOverview Refined Hero Hub v87.0.
 * Layout: Text -> Image -> Action Cards -> Buttons -> Punjab Specific Boards.
 */
export default function Hero() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats } = useDoc<any>(statsRef);

  const boardsQuery = useMemo(() => (db ? query(collection(db, "boards"), orderBy("displayOrder", "asc")) : null), [db]);
  const { data: boards } = useCollection<any>(boardsQuery);

  const punjabBoards = useMemo(() => {
    if (!boards) return [];
    return boards.filter((b: any) => 
      ['PPSC', 'PSSSB', 'Punjab Police'].includes(b.abbreviation)
    );
  }, [boards]);

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-white pt-4 pb-12 md:pt-20 md:pb-32 border-b border-slate-50">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 md:gap-20 lg:gap-24 items-center">

          {/* 1. Text Content Hub */}
          <div className="text-center lg:text-left space-y-4 md:space-y-10 order-1">
            <motion.div 
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/50 border border-blue-100/50"
            >
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 animate-pulse" />
              <span className="text-[11px] md:text-sm font-bold text-slate-600 tracking-tight">
                Punjab's smartest study platform
              </span>
            </motion.div>

            <div className="space-y-3 md:space-y-6">
              <h1 className="text-[clamp(26px,6vw,34px)] lg:text-[clamp(26px,6vw,84px)] font-black tracking-tighter text-[#0F172A] leading-[1.1] md:leading-[0.95] antialiased">
                Crack Punjab Govt Exams <br className="hidden md:block"/>
                <span className="text-primary italic">with Confidence</span>
              </h1>

              <p className="text-[clamp(13px,3vw,16px)] lg:text-xl text-slate-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium tracking-tight">
                Mock tests and notes checked by official patterns.
              </p>
            </div>

            {/* MOBILE ONLY: HERO IMAGE PLACEMENT (Center fold) */}
            <div className="flex lg:hidden flex-col items-center w-full max-w-[240px] mx-auto py-2">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }} 
                 animate={{ opacity: 1, scale: 1 }} 
                 className="relative w-full aspect-[4/3] overflow-visible"
               >
                 <Image 
                   src="/images/hero-student.png" 
                   alt="Cracklix Study" 
                   fill
                   className="object-contain drop-shadow-[0_20px_50px_rgba(22,119,255,0.15)]" 
                   priority
                 />
               </motion.div>
            </div>

            {/* QUICK ACTION CLUSTER */}
            <div className="grid grid-cols-2 gap-3 mt-4 md:mt-12">
              <QuickActionCard boardId="mock-test" label="Mock Tests" href="/mocks" />
              <QuickActionCard boardId="study-material" label="Study Notes" href="/notes" />
              <QuickActionCard boardId="pyq" label="PYQ Papers" href="/pyqs" />
              <QuickActionCard boardId="current-affairs" label="Current Affairs" href="/current-affairs" />
            </div>

            {/* PREMIUM CTA BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 md:pt-8 w-full max-w-xl mx-auto lg:mx-0">
               <Button asChild className="w-full sm:flex-1 h-12 md:h-20 px-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-[15px] md:text-lg shadow-xl shadow-blue-500/20 rounded-full active:scale-95 transition-all border-none">
                  <Link href="/mocks" className="flex items-center justify-center gap-2">
                    <Play className="h-4 w-4 md:h-5 md:w-5 fill-current" /> Start Prep
                  </Link>
               </Button>
               <Button asChild variant="outline" className="w-full sm:flex-1 h-12 md:h-20 px-10 rounded-full font-bold text-[15px] md:text-lg border-2 border-slate-200 hover:border-primary/30 hover:bg-slate-50 transition-all active:scale-95">
                  <Link href="/exams" className="flex items-center justify-center gap-2">
                    <LayoutGrid className="h-4 w-4 md:h-5 md:w-5" /> View Exams
                  </Link>
               </Button>
            </div>

            {/* PUNJAB SPECIFIC BOARDS */}
            <div className="pt-8 md:pt-12 space-y-4">
              <p className="text-[10px] md:text-[11px] font-black uppercase text-slate-400 tracking-widest text-center lg:text-left">Official Punjab Boards</p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 md:gap-3">
                {punjabBoards.map((board: any) => (
                  <Link 
                    key={board.id} 
                    href={`/exams/hub/${board.id}`}
                    className="px-4 py-2 md:px-6 md:py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] md:text-[13px] font-bold text-slate-600 hover:text-primary hover:border-primary hover:bg-white hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
                  >
                    {board.abbreviation}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* DESKTOP ONLY: HERO IMAGE */}
          <div className="hidden lg:flex flex-col items-center w-full max-w-none mx-auto lg:mx-0 order-2">
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
                className="object-contain drop-shadow-[0_35px_80px_rgba(22,119,255,0.2)]" 
                priority
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickActionCard({ boardId, label, href }: { boardId: string, label: string, href: string }) {
  return (
    <Link href={href} className="block group h-full">
      <Card className="bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 rounded-2xl md:rounded-[2.5rem] p-4 md:p-10 flex flex-col md:flex-row items-center gap-2 md:gap-6 cursor-pointer active:scale-[0.98] h-full text-center md:text-left">
        <div className="h-10 w-10 md:h-16 md:w-16 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
          <AuthorityLogo boardId={boardId} size="lg" className="bg-transparent shadow-none border-none p-0 w-full h-full" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[13px] md:text-lg font-bold text-[#0F172A] group-hover:text-primary transition-colors leading-tight">
            {label}
          </h3>
        </div>
      </Card>
    </Link>
  )
}
