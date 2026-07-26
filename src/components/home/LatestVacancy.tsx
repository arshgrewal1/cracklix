'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { ChevronRight, Zap, Target, ShieldCheck, Landmark } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { AuthorityLogo } from '@/lib/exam-icons';
import { motion } from 'framer-motion';

/**
 * @fileOverview Institutional Vacancy Registry v3.0.
 * STANDARDIZED: Heading and Icon sizes matched to Home Page global registry.
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
    <section className="py-12 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-10">
        
        {/* Standardized Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner shrink-0">
               <Landmark className="h-5 w-5 md:h-6 md:w-6" />
             </div>
             <div className="text-left">
                <h2 className="text-xl md:text-3xl font-black text-[#0F172A] tracking-tight">Latest vacancies</h2>
                <p className="text-[11px] md:text-sm font-medium text-slate-500">Official notifications and direct apply portals.</p>
             </div>
          </div>
          <Link href="/vacancies" className="text-primary font-bold text-xs md:text-sm flex items-center gap-1 hover:underline group">
            View all <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
           {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-[2.5rem] bg-slate-50" />)
           ) : vacancies && vacancies.length > 0 ? (
              vacancies.map((v, idx) => (
                <motion.div key={v.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}>
                  <Link href={`/vacancies/${v.id}`}>
                    <Card className="border border-slate-100 shadow-xl hover:shadow-5xl transition-all duration-500 rounded-[2.5rem] bg-white group overflow-hidden flex flex-col text-left p-6 md:p-10 relative">
                       <div className="flex justify-between items-start mb-8 w-full relative z-10">
                          <AuthorityLogo boardId={v.board} size="md" className="h-16 w-16 md:h-20 md:w-20 shadow-2xl border-4 border-white bg-slate-50" />
                          <div className="flex flex-col items-end gap-2">
                             {v.isBreaking && <Badge className="bg-rose-500 text-white border-none px-3 py-1 font-semibold text-[9px] uppercase animate-pulse">Breaking</Badge>}
                             <span className="text-[10px] md:text-[11px] font-semibold text-slate-300 tabular-nums uppercase">Last: {new Date(v.lastDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                          </div>
                       </div>

                       <div className="space-y-4 flex-1 relative z-10">
                          <h3 className="text-xl md:text-2xl font-bold text-[#0F172A] group-hover:text-primary transition-colors tracking-tight leading-tight line-clamp-2 uppercase">{v.title}</h3>
                          <p className="text-[9px] md:text-[11px] font-semibold text-slate-400 tracking-tight uppercase">{v.department}</p>
                          
                          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-50">
                             <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 tracking-tight uppercase">
                                <Zap className="h-4 w-4 text-primary" /> {v.totalPosts} Posts
                             </div>
                             <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 tracking-tight uppercase">
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
                 Registry synchronized
              </div>
           )}
        </div>
      </div>
    </section>
  );
}
