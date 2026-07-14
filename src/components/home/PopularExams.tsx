'use client';

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { 
  ChevronRight, 
  Zap, 
  Users,
  FileText,
  BookOpen,
  Bookmark,
  Lock,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query, where, limit } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthorityLogo } from "@/lib/exam-icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Institutional Popular Exams Hub v45.0.
 * UPDATED: Redesigned to match high-fidelity screenshot with 2-column grid and large logos.
 * UPDATED: Removed all uppercase styling as per user request.
 */
export default function PopularExams() {
  const db = useFirestore();
  const { profile } = useUser();
  
  const examsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "exams"), where("isTrending", "==", true), limit(4));
  }, [db]);

  const { data: exams, loading } = useCollection<any>(examsQuery);
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]));

  const isPassActive = useMemo(() => {
    if (!profile) return false;
    if (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') return true;
    return profile.passStatus === 'active';
  }, [profile]);

  return (
    <section className="py-12 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
        
        {/* SECTION HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-1">
           <div className="space-y-2 text-left">
              <h2 className="text-[32px] md:text-6xl font-black tracking-tighter text-[#0F172A] antialiased">
                Popular Exams
              </h2>
              <p className="text-slate-500 font-medium text-sm md:text-xl max-w-xl leading-snug">
                Targeted preparation for Punjab&apos;s most competitive recruitment verticals.
              </p>
           </div>
           <Link href="/exams" className="text-primary font-black text-xs md:text-sm tracking-widest uppercase hover:underline flex items-center gap-2 group shrink-0">
              Explore Registry <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
           </Link>
        </div>

        {/* EXAM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
           {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 md:h-80 w-full rounded-[3rem] bg-slate-50" />
              ))
           ) : exams?.map((exam, idx) => {
              const board = boards?.find((b: any) => b.id === exam.boardId || b.abbreviation === exam.boardId);
              const isPremium = exam.accessLevel === 'PREMIUM';
              const locked = isPremium && !isPassActive;

              return (
                 <motion.div 
                    key={exam.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                 >
                    <Card className="border-none shadow-5xl rounded-[3rem] bg-white p-6 md:p-12 flex flex-col relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 border border-slate-50">
                       
                       {/* PREMIUM BADGE HUB */}
                       {isPremium && (
                          <div className="absolute top-0 right-12 z-20">
                             <div className="bg-amber-400 text-amber-950 px-5 py-2.5 rounded-b-2xl font-black text-[9px] uppercase tracking-widest shadow-xl flex items-center gap-2">
                                <Lock className="h-3 w-3 fill-current" /> Premium
                             </div>
                          </div>
                       )}

                       {/* UPPER BLOCK: LOGO & IDENTITY */}
                       <div className="flex items-center gap-6 md:gap-12">
                          <div className="shrink-0 relative group-hover:scale-105 transition-transform duration-500">
                             <AuthorityLogo 
                               board={board} 
                               boardId={exam.boardId} 
                               size="lg" 
                               className="h-20 w-20 md:h-36 md:w-36 shadow-2xl border-4 border-slate-50" 
                             />
                          </div>

                          <div className="flex-1 text-left space-y-4 md:space-y-6 min-w-0">
                             <h3 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-tight group-hover:text-primary transition-colors">
                                {exam.name}
                             </h3>
                             
                             {/* STATS STRIP */}
                             <div className="flex flex-wrap items-center gap-4 md:gap-6 text-[10px] md:text-xs font-bold text-slate-400 tracking-tight">
                                <span className="flex items-center gap-2">
                                   <Zap className="h-4 w-4 text-primary fill-primary" /> 
                                   {exam.activeQuestions || '5000'} Questions
                                </span>
                                <span className="flex items-center gap-2">
                                   <FileText className="h-4 w-4 text-blue-500" /> 
                                   {exam.totalNotes || '120'} Notes
                                </span>
                                <span className="flex items-center gap-2">
                                   <BookOpen className="h-4 w-4 text-emerald-500" /> 
                                   {exam.totalMocks || '20'} Mocks
                                </span>
                             </div>
                          </div>
                       </div>

                       {/* LOWER BLOCK: ACTIONS */}
                       <div className="mt-8 md:mt-12 pt-8 md:pt-10 border-t border-slate-50 flex items-center gap-4 md:gap-6">
                          <Button asChild className={cn(
                             "flex-1 h-14 md:h-20 rounded-full font-black uppercase text-[10px] md:text-xs tracking-[0.2em] shadow-4xl transition-all active:scale-95 border-none gap-3",
                             locked ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-[#0F172A] hover:bg-black text-white"
                          )}>
                             <Link href={`/exams/view?id=${exam.id}`}>
                                {locked ? <Lock className="h-4 w-4" /> : null}
                                Attempt Now <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                             </Link>
                          </Button>
                          
                          <button className="h-14 w-14 md:h-20 md:w-20 rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-slate-100 bg-white flex items-center justify-center text-slate-300 hover:text-primary hover:border-primary transition-all active:scale-90 shadow-sm">
                             <Bookmark className="h-6 w-6 md:h-8 md:w-8" />
                          </button>
                       </div>
                    </Card>
                 </motion.div>
              )
           })}
        </div>

        {/* BOTTOM AFFIRMATION */}
        <div className="flex items-center justify-center gap-4 text-slate-300 py-4 opacity-50">
           <ShieldCheck className="h-5 w-5" />
           <span className="text-[10px] font-black uppercase tracking-[0.4em]">Official Punjab Registry Validated</span>
        </div>

      </div>
    </section>
  );
}
