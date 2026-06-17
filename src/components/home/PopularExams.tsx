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
import Image from "next/image";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * @fileOverview High-Fidelity Popular Exams v58.0 (Un-truncated High Density).
 * UPDATED: Removed truncation, reduced text sizes, and optimized logo padding.
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
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
         
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-16 gap-4 text-left">
            <div className="space-y-1">
               <h2 className="text-3xl md:text-5xl font-extrabold text-[#04102B] tracking-tight leading-none">Popular Punjab Exams</h2>
               <p className="text-[#94A3B8] font-bold text-[10px] md:text-xs tracking-tight uppercase">Most Targeted Recruitment Exams</p>
            </div>
            <Link href="/exams" className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline tracking-tight group">
               View All Exams <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {loading ? (
               Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[200px] w-full rounded-[2rem]" />)
            ) : filteredBoards.map((board) => {
               const examCount = allExams?.filter(e => e.boardId === board.id || e.boardId === board.abbreviation).length || 0;
               const mockCount = mocks?.filter(m => (m.boardIds && m.boardIds.includes(board.id)) || m.boardId === board.id).length || 0;
               const logoUrl = board.iconUrl;

               return (
                  <Link key={board.id} href={`/exams/hub/${board.id}`}>
                     <Card className="border border-[#E5E7EB] shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:translate-y-[-4px] transition-all duration-500 rounded-[2rem] bg-white group p-6 md:p-8 text-left h-full min-h-[220px] md:min-h-[280px] flex flex-col relative overflow-hidden">
                        <div className="flex items-start gap-4 mb-6">
                           <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-[#F8FAFC] flex items-center justify-center p-1.5 shrink-0 shadow-inner group-hover:scale-105 transition-transform overflow-hidden border border-slate-100 relative">
                              {logoUrl && !failedImages[board.id] ? (
                                <Image 
                                  src={logoUrl} 
                                  alt={board.abbreviation} 
                                  fill
                                  className="object-contain p-2"
                                  referrerPolicy="no-referrer"
                                  onError={() => setFailedImages(prev => ({ ...prev, [board.id]: true }))} 
                                />
                              ) : (
                                <div className="p-1 w-full h-full opacity-40">{getBoardFallbackIcon(board.id, board.abbreviation)}</div>
                              )}
                           </div>
                           <div className="min-w-0 flex-1 space-y-1">
                              <h3 className="text-base md:text-lg font-bold text-[#04102B] tracking-tight group-hover:text-blue-600 transition-colors leading-tight">
                                 {board.abbreviation} Exams
                              </h3>
                              <p className="text-[10px] md:text-[11px] font-semibold text-[#94A3B8] leading-snug">
                                 {board.name}
                              </p>
                           </div>
                        </div>

                        <div className="flex items-center gap-6 mt-auto">
                           <div className="flex items-center gap-2">
                              <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                              <span className="text-[11px] font-bold text-[#64748B]">{examCount} Exams</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <Zap className="h-3.5 w-3.5 text-blue-600" />
                              <span className="text-[11px] font-bold text-[#64748B]">{mockCount} Mocks</span>
                           </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-50">
                           <span className="text-blue-600 font-bold text-[13px] tracking-tight flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                              Explore Exams <ArrowRight className="h-3.5 w-3.5" />
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
