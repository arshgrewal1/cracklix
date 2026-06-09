
'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, limit, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, GraduationCap, ChevronRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

/**
 * @fileOverview Dynamic Trending Grid.
 * Displays exams that are currently "Hot" in the preparation cycle.
 */

export default function TrendingExams() {
  const db = useFirestore();
  const examsQuery = useMemo(() => (db ? query(collection(db, "exams"), limit(4)) : null), [db]);
  const { data: exams, loading } = useCollection<any>(examsQuery);

  if (loading || !exams) return null;

  return (
    <section className="space-y-10">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-rose-500" />
            <h2 className="text-xl font-headline font-black text-[#0F172A] uppercase tracking-widest">TRENDING HUBS</h2>
         </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
         {exams.map((exam) => (
            <Link key={exam.id} href={`/exams/${exam.id}`}>
               <div className="bg-slate-50/50 hover:bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-100 p-6 md:p-10 text-left transition-all hover:shadow-4xl group">
                  <div className="flex flex-col items-center gap-6 text-center">
                     <div className="h-14 w-14 md:h-20 md:w-20 rounded-[1.5rem] md:rounded-[2rem] bg-white border border-slate-100 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform overflow-hidden">
                        {exam.iconUrl ? (
                          <img src={exam.iconUrl} className="h-full w-full object-contain p-2 md:p-3" alt="Logo" referrerPolicy="no-referrer" />
                        ) : (
                          <GraduationCap className="h-8 md:h-10 text-slate-300" />
                        )}
                     </div>
                     <div className="space-y-2">
                        <Badge className="bg-rose-50 text-rose-500 border-none text-[7px] md:text-[8px] font-black uppercase px-2 py-0.5 animate-pulse">TRENDING</Badge>
                        <h3 className="text-[13px] md:text-xl font-black text-[#0F172A] uppercase leading-tight line-clamp-2">{exam.name}</h3>
                     </div>
                     <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-black uppercase text-primary tracking-widest">
                        <Zap className="h-3 w-3 fill-current" /> GO TO HUB
                     </div>
                  </div>
               </div>
            </Link>
         ))}
      </div>
    </section>
  );
}
