'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Calendar, ChevronRight, Landmark, Zap, ArrowRight, ShieldCheck, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AuthorityLogo } from '@/lib/exam-icons';
import { motion } from 'framer-motion';

/**
 * @fileOverview Institutional Vacancy Node v2.7.
 * UPDATED: Removed uppercase from recruitment titles and labels.
 */
export default function LatestVacancy() {
  const db = useFirestore();

  const vacanciesQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, "vacancies"),
      where("status", "==", "PUBLISHED"),
      limit(20)
    );
  }, [db]);

  const { data: rawVacancies, loading } = useCollection<any>(vacanciesQuery);

  const vacancies = useMemo(() => {
    if (!rawVacancies) return [];
    return rawVacancies
      .filter(v => v.showOnHomepage === true)
      .sort((a, b) => {
         const tA = a.publishedAt?.seconds || 0;
         const tB = b.publishedAt?.seconds || 0;
         return tB - tA;
      })
      .slice(0, 4);
  }, [rawVacancies]);

  return (
    <section className="py-12 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-1">
           <div className="space-y-3 text-left">
              <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] md:text-xs font-semibold text-emerald-600 tracking-tight uppercase">Registry live sync</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black tracking-tighter text-[#0F172A] antialiased">
                Latest vacancies
              </h2>
              <p className="text-slate-500 font-medium text-sm md:text-xl max-w-xl leading-snug">
                Official notifications and direct apply nodes for state recruitments.
              </p>
           </div>
           <Button asChild variant="ghost" className="text-primary font-bold text-xs md:text-sm tracking-tight hover:underline flex items-center gap-2 group shrink-0">
              <Link href="/vacancies">Open registry <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
           </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
           {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-[2.5rem] bg-slate-50" />)
           ) : vacancies && vacancies.length > 0 ? (
              vacancies.map((v, idx) => (
                <motion.div key={v.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}>
                  <Link href={`/vacancies/${v.id}`}>
                    <Card className="border border-slate-100 shadow-xl hover:shadow-5xl transition-all duration-500 rounded-[2.5rem] bg-white group overflow-hidden flex flex-col text-left p-6 md:p-12 relative">
                       <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000"><Landmark className="h-44 w-44" /></div>
                       
                       <div className="flex justify-between items-start mb-8 w-full relative z-10">
                          <AuthorityLogo boardId={v.board} size="md" className="h-16 w-16 md:h-24 md:w-24 shadow-2xl border-4 border-white bg-slate-50" />
                          <div className="flex flex-col items-end gap-2">
                             {v.isBreaking && <Badge className="bg-rose-500 text-white border-none px-3 py-1 font-semibold text-[9px] uppercase animate-pulse">Breaking</Badge>}
                             <span className="text-[10px] md:text-[11px] font-semibold text-slate-300 tabular-nums">Last: {new Date(v.lastDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                          </div>
                       </div>

                       <div className="space-y-4 flex-1 relative z-10">
                          <h3 className="text-xl md:text-3xl font-bold text-[#0F172A] group-hover:text-primary transition-colors tracking-tight leading-tight line-clamp-2">{v.title}</h3>
                          <p className="text-[9px] md:text-[11px] font-semibold text-slate-400 tracking-tight">{v.department}</p>
                          
                          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-50">
                             <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 tracking-tight">
                                <Zap className="h-4 w-4 text-primary" /> {v.totalPosts} Posts
                             </div>
                             <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 tracking-tight">
                                <Target className="h-4 w-4 text-emerald-500" /> {v.education?.split(' ')[0]}
                             </div>
                          </div>
                       </div>
                    </Card>
                  </Link>
                </motion.div>
              ))
           ) : (
              <div className="col-span-full py-20 text-center opacity-30 italic font-semibold text-xl md:text-3xl tracking-tighter flex flex-col items-center gap-6">
                 <ShieldCheck className="h-16 w-16 text-slate-200" />
                 Registry normalized
              </div>
           )}
        </div>
      </div>
    </section>
  );
}
