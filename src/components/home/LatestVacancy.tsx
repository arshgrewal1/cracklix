'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { ChevronRight, Zap, Target, ShieldCheck, Landmark, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { AuthorityLogo } from '@/lib/exam-icons';
import { motion } from 'framer-motion';

/**
 * @fileOverview Compact Vacancy Hub v3.2.
 * COMPACT: Limited to 2 items on Home Page. Reduced radii and padding.
 */
export default function LatestVacancy() {
  const db = useFirestore();

  const vacanciesQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, "vacancies"),
      where("status", "==", "PUBLISHED"),
      limit(2)
    );
  }, [db]);

  const { data: rawVacancies, loading } = useCollection<any>(vacanciesQuery);

  const vacancies = useMemo(() => {
    if (!rawVacancies) return [];
    return [...rawVacancies]
      .filter(v => v.showOnHomepage !== false)
      .sort((a, b) => (b.publishedAt?.seconds || 0) - (a.publishedAt?.seconds || 0));
  }, [rawVacancies]);

  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 space-y-8">
        
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 shadow-inner shrink-0">
               <Landmark className="h-4 w-4 md:h-5 md:w-5" />
             </div>
             <div className="text-left">
                <h2 className="text-lg md:text-2xl font-black text-foreground tracking-tight">Latest vacancies</h2>
                <p className="text-[10px] md:text-xs font-medium text-muted-foreground">Official notifications hub</p>
             </div>
          </div>
          <Link href="/vacancies" className="text-primary font-bold text-[10px] md:text-xs flex items-center gap-1 hover:underline group">
            View all <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
           {loading ? (
              Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-44 w-full rounded-2xl bg-muted" />)
           ) : vacancies && vacancies.length > 0 ? (
              vacancies.map((v, idx) => (
                <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}>
                  <Link href={`/vacancies/${v.id}`}>
                    <Card className="border border-border shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl bg-card p-4 md:p-6 flex flex-col text-left group overflow-hidden h-full">
                       <div className="flex justify-between items-start mb-6">
                          <AuthorityLogo boardId={v.board} size="sm" className="h-10 w-10 md:h-12 md:w-12 shadow-lg border-2 border-background bg-muted" />
                          <div className="text-right">
                             {v.isBreaking && <Badge className="bg-rose-500 text-white border-none px-2 py-0.5 font-bold text-[7px] uppercase tracking-widest shadow-lg animate-pulse">Breaking</Badge>}
                          </div>
                       </div>

                       <div className="space-y-1.5 flex-1 min-w-0">
                          <h3 className="text-sm md:text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-1 truncate">{v.title}</h3>
                          <p className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate opacity-60">{v.department}</p>
                          
                          <div className="flex items-center gap-3 pt-3 mt-3 border-t border-border">
                             <div className="flex items-center gap-1.5 text-[8px] md:text-[10px] font-bold text-slate-400">
                                <Zap className="h-3 w-3 text-primary" /> {v.totalPosts} Posts
                             </div>
                             <div className="flex items-center gap-1.5 text-[8px] md:text-[10px] font-bold text-slate-400">
                                <Target className="h-3 w-3 text-emerald-500" /> {v.education?.split(' ')[0]}
                             </div>
                          </div>
                       </div>

                       <div className="mt-6 pt-2">
                          <Button className="w-full h-10 md:h-11 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[9px] tracking-widest rounded-xl transition-all active:scale-95 border-none shadow-md">
                             Open Portal <ArrowRight className="ml-2 h-3.5 w-3.5" />
                          </Button>
                       </div>
                    </Card>
                  </Link>
                </motion.div>
              ))
           ) : (
              <div className="col-span-full py-12 text-center opacity-30 italic font-bold text-sm border-2 border-dashed border-border rounded-2xl">
                 Registry synchronized
              </div>
           )}
        </div>
      </div>
    </section>
  );
}