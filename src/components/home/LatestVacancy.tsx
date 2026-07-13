'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Calendar, ChevronRight, Bell, Landmark } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

/**
 * @fileOverview Institutional Vacancy Node v1.0.
 * Fetches latest recruitment dates from the exam calendar registry.
 */
export default function LatestVacancy() {
  const db = useFirestore();

  // Fetch latest 4 published vacancies from the calendar
  const vacanciesQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, "exam_calendar"),
      where("published", "==", true),
      limit(4)
    );
  }, [db]);

  const { data: rawVacancies, loading } = useCollection<any>(vacanciesQuery);

  // Client-side sort to ensure stability without composite index
  const vacancies = useMemo(() => {
    if (!rawVacancies) return [];
    return [...rawVacancies].sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  }, [rawVacancies]);

  return (
    <section className="py-10 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden border border-slate-100">
           <CardHeader className="p-6 md:p-10 border-b border-slate-50 bg-slate-50/30 flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-primary shadow-inner">
                    <Bell className="h-5 w-5" />
                 </div>
                 <div className="text-left">
                    <CardTitle className="text-xl md:text-2xl font-black text-[#0F172A]">Latest Vacancies</CardTitle>
                    <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Punjab Government Job Alerts</p>
                 </div>
              </div>
              <Link href="/exam-calendar" className="text-[10px] font-black uppercase text-primary hover:underline">View All</Link>
           </CardHeader>
           <CardContent className="p-4 md:p-6 space-y-4">
              {loading ? (
                 Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl bg-slate-50" />)
              ) : vacancies && vacancies.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {vacancies.map((v) => (
                      <Link key={v.id} href="/exam-calendar">
                         <div className="p-5 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all group flex items-center justify-between">
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                               <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner", v.color || "bg-primary")}>
                                  <Landmark className="h-6 w-6 text-white" />
                               </div>
                               <div className="min-w-0 text-left">
                                  <h4 className="font-bold text-[#0F172A] truncate text-sm md:text-base">{v.post}</h4>
                                  <div className="flex flex-wrap items-center gap-3 mt-1">
                                     <Badge variant="outline" className="bg-white border-slate-200 text-[8px] font-bold text-slate-400 px-2 rounded-lg">{v.board}</Badge>
                                     <span className="text-[10px] font-bold text-primary flex items-center gap-1"><Calendar className="h-3 w-3" /> {v.date}</span>
                                  </div>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-200 group-hover:text-primary transition-all" />
                         </div>
                      </Link>
                   ))}
                 </div>
              ) : (
                 <div className="py-10 text-center opacity-30 italic font-medium">No active vacancies in registry.</div>
              )}
           </CardContent>
        </Card>
      </div>
    </section>
  );
}
