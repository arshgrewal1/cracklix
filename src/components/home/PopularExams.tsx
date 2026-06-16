'use client';

import React, { useMemo, useState, useEffect } from "react"
import { 
  ChevronRight, 
  Landmark, 
  BookOpen, 
  Zap, 
  ShieldCheck, 
  GraduationCap, 
  Activity,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * @fileOverview High-Fidelity Popular Hubs v53.0 (Cracklix Style).
 * UPDATED: Replaced HUB with Exams and implemented the 32px/15px typography structure.
 */

function getBoardFallbackIcon(id: string, abbrev: string) {
  const key = (abbrev || id || "").toLowerCase();
  if (key.includes('psssb')) return <Landmark className="h-full w-full text-amber-600" />;
  if (key.includes('police')) return <ShieldCheck className="h-full w-full text-blue-800" />;
  if (key.includes('ppsc')) return <Landmark className="h-full w-full text-emerald-700" />;
  if (key.includes('teaching')) return <GraduationCap className="h-full w-full text-orange-500" />;
  if (key.includes('pspcl')) return <Zap className="h-full w-full text-blue-500" />;
  return <Activity className="h-full w-full text-slate-300" />;
}

export default function PopularExams() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const boardsQuery = useMemo(() => (db ? query(collection(db, "boards"), orderBy("displayOrder", "asc")) : null), [db]);
  const { data: boards, loading } = useCollection<any>(boardsQuery);
  const { data: allExams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]));
  const { data: mocks } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]));

  const filteredBoards = useMemo(() => {
    if (!boards || !mounted) return [];
    return boards.slice(0, 8);
  }, [boards, mounted]);

  if (!mounted) return null;

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-7xl">
         
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6 text-left">
            <div className="space-y-2">
               <h2 className="text-3xl md:text-5xl font-headline font-black text-[#04102B] uppercase tracking-tight leading-none">Popular Punjab Exams</h2>
               <p className="text-[#94A3B8] font-bold uppercase tracking-widest text-[10px] md:text-xs">Most Targeted Recruitment Exams</p>
            </div>
            <Link href="/exams" className="flex items-center gap-2 text-[#2F6BFF] font-black uppercase text-[10px] md:text-sm hover:underline tracking-widest group">
               View All Exams <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {loading ? (
               Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[300px] w-full rounded-[32px]" />)
            ) : filteredBoards.map((board) => {
               const examCount = allExams?.filter(e => e.boardId === board.id || e.boardId === board.abbreviation).length || 0;
               const mockCount = mocks?.filter(m => (m.boardIds && m.boardIds.includes(board.id)) || m.boardId === board.id).length || 0;
               
               const logoUrl = board.iconUrl;
               const hasImage = logoUrl && !failedImages[board.id];

               return (
                  <Link key={board.id} href={`/exams/hub/${board.id}`}>
                     <Card className="border border-[#E5E7EB] shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:translate-y-[-6px] transition-all duration-500 rounded-[32px] bg-white group p-8 text-left h-full min-h-[300px] flex flex-col relative overflow-hidden">
                        <div className="flex flex-col space-y-4 flex-1">
                           <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-[#F8FAFC] flex items-center justify-center p-3.5 shrink-0 shadow-inner group-hover:scale-105 transition-transform overflow-hidden relative border border-slate-100 mb-2">
                              {hasImage ? (
                                <img 
                                  src={logoUrl} 
                                  className="h-full w-full object-contain" 
                                  alt={board.abbreviation}
                                  referrerPolicy="no-referrer"
                                  onError={() => setFailedImages(prev => ({ ...prev, [board.id]: true }))}
                                />
                              ) : (
                                <div className="p-2 w-full h-full opacity-40">
                                  {getBoardFallbackIcon(board.id, board.abbreviation)}
                                </div>
                              )}
                           </div>
                           
                           <div className="min-w-0">
                              <h3 className="text-[28px] md:text-[32px] font-black text-[#04102B] uppercase leading-[1.1] tracking-tight group-hover:text-[#2F6BFF] transition-colors">{board.abbreviation} Exams</h3>
                              <p className="text-[15px] font-semibold text-[#94A3B8] leading-tight mt-1 line-clamp-1">
                                {board.name}
                              </p>
                           </div>
                        </div>

                        <div className="mt-8 space-y-3">
                           <div className="flex items-center gap-3">
                              <BookOpen className="h-4 w-4 text-[#2F6BFF]" />
                              <span className="text-[14px] font-bold text-[#64748B] uppercase tracking-tight">{examCount} Active Exams</span>
                           </div>
                           <div className="flex items-center gap-3">
                              <Zap className="h-4 w-4 text-[#F97316]" />
                              <span className="text-[14px] font-bold text-[#64748B] uppercase tracking-tight">{mockCount} Mock Tests</span>
                           </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                           <span className="text-[#2F6BFF] font-black uppercase text-[12px] tracking-widest flex items-center gap-2">
                              Explore Exams <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                           </span>
                        </div>
                     </Card>
                  </Link>
               )
            })}
         </div>
      </div>
    </section>
  );
}
