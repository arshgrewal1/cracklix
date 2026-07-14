
'use client';

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { 
  ChevronRight, 
  Target, 
  Zap, 
  Users
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, where, limit } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * @fileOverview Premium Popular Exams Slider v42.0 (Institutional Match).
 * RESTORED: High-fidelity "Old Style" layout from user screenshot.
 */

export default function PopularExams() {
  const db = useFirestore();
  
  const examsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "exams"), where("isTrending", "==", true), limit(6));
  }, [db]);

  const { data: exams, loading } = useCollection<any>(examsQuery);
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]));

  return (
    <section className="py-10 md:py-24 bg-white overflow-hidden">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 md:space-y-16">
         
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 text-left px-1">
            <div className="space-y-1">
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-blue-50 flex items-center justify-center text-primary shadow-inner shrink-0">
                    <Target className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <h2 className="text-[22px] md:text-[clamp(24px,4vw,36px)] font-black tracking-tight text-[#0F172A]">Popular Exams</h2>
               </div>
               <p className="max-w-2xl text-[14px] md:text-[clamp(13px,1.5vw,18px)] font-medium text-slate-500">Official preparation hubs for the most competitive recruitments.</p>
            </div>
            <Link href="/exams" className="text-primary font-bold text-[13px] md:text-[15px] tracking-tight hover:underline flex items-center gap-2 group shrink-0">
              View all <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
         </div>

         <div className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar pb-8 -mx-4 px-4 md:mx-0 md:px-0">
            {loading ? (
               Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[400px] w-[300px] md:w-[380px] rounded-[2.5rem] bg-slate-50 shrink-0" />)
            ) : exams?.map((exam, idx) => {
               const board = boards?.find((b: any) => b.id === exam.boardId || b.abbreviation === exam.boardId);
               
               return (
                  <motion.div 
                    key={exam.id} 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    whileInView={{ opacity: 1, scale: 1 }} 
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="shrink-0 w-[280px] md:w-[420px]"
                  >
                     <Card className="border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] md:rounded-[3.5rem] bg-white p-8 md:p-14 flex flex-col group h-full relative overflow-hidden text-left">
                        {/* THEMATIC LOGO STYLE (CIRCULAR PATTERN) */}
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000 pointer-events-none">
                           <Target className="h-32 w-32 md:h-48 md:w-48" />
                        </div>

                        <div className="space-y-8 md:space-y-12 flex-1 relative z-10">
                           {/* HEADER: NAME (BOLD UPPERCASE) */}
                           <h3 className="text-[22px] md:text-[36px] font-[900] text-[#0F172A] leading-[1.05] tracking-tight uppercase antialiased h-[2.1em] md:h-[2.2em] line-clamp-2">
                              {exam.name}
                           </h3>

                           <div className="space-y-6 md:space-y-10">
                              {/* BOARD TAG */}
                              <div className="text-[10px] md:text-xs font-black text-slate-300 uppercase tracking-[0.2em]">
                                 Board: <span className="text-slate-400 font-black">{board?.abbreviation || exam.boardId}</span>
                              </div>

                              {/* METRICS HUB */}
                              <div className="flex items-center gap-6 md:gap-10 border-t border-slate-50 pt-8">
                                 <div className="flex items-center gap-3 text-slate-300">
                                    <Zap className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                                    <span className="text-[11px] md:text-base font-bold tracking-tight text-slate-400">
                                       {exam.totalMocks || "40+"} Mocks
                                    </span>
                                 </div>
                                 <div className="flex items-center gap-3 text-slate-300">
                                    <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                                    <span className="text-[11px] md:text-base font-bold tracking-tight text-slate-400">
                                       {exam.studentCount || "12K+"} Students
                                    </span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* CTA ACTION (DARK PREMIUM PILL) */}
                        <div className="mt-12 md:mt-16 relative z-10">
                           <Button asChild className="w-full h-14 md:h-[72px] rounded-[20px] md:rounded-[26px] bg-[#0F172A] hover:bg-black text-white font-[900] text-[11px] md:text-sm tracking-[0.1em] uppercase shadow-2xl transition-all active:scale-95 group/btn border-none">
                              <Link href={`/exams/view?id=${exam.id}`} className="flex items-center justify-center gap-4">
                                 Start Preparation
                                 <ChevronRight className="h-4 w-4 md:h-5 md:w-5 ml-auto opacity-30 transition-transform group-hover/btn:translate-x-1" />
                              </Link>
                           </Button>
                        </div>
                     </Card>
                  </motion.div>
               )
            })}
         </div>
      </div>
    </section>
  );
}
