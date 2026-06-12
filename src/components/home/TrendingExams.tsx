'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, limit, where } from 'firebase/firestore';
import { TrendingUp, Zap, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

/**
 * @fileOverview High-Fidelity Trending Badges v8.0.
 */
export default function TrendingExams() {
  const db = useFirestore();
  
  const examsQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, "exams"), 
      where("isTrending", "==", true), 
      limit(6)
    );
  }, [db]);

  const { data: exams, loading } = useCollection<any>(examsQuery);

  if (!loading && (!exams || exams.length === 0)) return null;

  return (
    <section className="py-8 bg-slate-50 border-y border-slate-100">
      <div className="container mx-auto px-4 max-w-7xl">
         <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex items-center gap-3 shrink-0">
               <div className="h-8 w-8 bg-rose-50 rounded-lg flex items-center justify-center text-rose-500">
                  <TrendingUp className="h-4 w-4" />
               </div>
               <h2 className="text-[11px] md:text-sm font-black text-[#0F172A] uppercase tracking-[0.2em]">Trending Exams</h2>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 flex-1">
               {loading ? (
                  Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 w-32 bg-white animate-pulse rounded-xl border border-slate-100" />)
               ) : exams?.map((exam: any) => (
                  <Link key={exam.id} href={`/exams/${exam.id}`}>
                     <Badge className="bg-white border-slate-200 text-[#0F172A] hover:border-primary hover:text-primary transition-all px-4 py-3 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest shadow-sm cursor-pointer active:scale-95 gap-2">
                        <Sparkles className="h-3 w-3 text-primary" /> {exam.name}
                     </Badge>
                  </Link>
               ))}
            </div>
         </div>
      </div>
    </section>
  );
}
