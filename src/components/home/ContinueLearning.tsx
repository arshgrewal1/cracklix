'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, History, Trophy, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * @fileOverview High-Fidelity "Continue Learning" Hub v7.3.
 * UPDATED: Added standalone container and section spacing for independent reordering.
 */

export default function ContinueLearning() {
  const { user } = useUser();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resultsQuery = useMemo(() => {
    if (!db || !user || !mounted) return null;
    return query(collection(db, "results"), where("userId", "==", user.uid), limit(2));
  }, [db, user, mounted]);

  const { data: recentAttempts, loading } = useCollection<any>(resultsQuery);

  if (!mounted || !user) {
    return <section className="hidden" />;
  }

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl space-y-6 md:space-y-10">
          <div className="h-10 w-48 bg-slate-100 animate-pulse rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <Skeleton className="h-48 w-full rounded-[2rem] bg-slate-100" />
            <Skeleton className="h-48 w-full rounded-[2rem] bg-slate-100" />
          </div>
        </div>
      </section>
    );
  }

  if (!recentAttempts || recentAttempts.length === 0) {
    return <section className="hidden" />;
  }

  return (
    <section className="py-12 md:py-16 bg-white animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="container mx-auto px-4 max-w-7xl space-y-6 md:space-y-10">
        <div className="flex items-center gap-3 px-1">
           <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-orange-50 flex items-center justify-center text-primary shadow-sm shrink-0">
              <History className="h-4 w-4 md:h-5 md:w-5" />
           </div>
           <h2 className="text-xl md:text-3xl font-headline font-black text-[#0F172A] uppercase tracking-tight">CONTINUE LEARNING</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
           {recentAttempts.map((res: any) => (
              <Card key={res.id} className="border-none shadow-2xl rounded-[2rem] md:rounded-[3rem] bg-[#0B1528] text-white p-6 md:p-10 lg:p-12 overflow-hidden relative group text-left">
                 <div className="absolute bottom-0 right-0 p-8 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform duration-1000">
                    <Trophy className="h-48 w-48" />
                 </div>
                 <div className="relative z-10 flex flex-row items-start md:items-center gap-5 md:gap-10">
                    <div className="h-14 w-14 md:h-20 md:w-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
                       <Zap className="h-7 w-7 md:h-10 md:w-10 text-primary fill-current" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-4 md:space-y-6">
                       <div className="space-y-1">
                          <p className="text-primary font-black text-[9px] md:text-[11px] uppercase tracking-[0.4em] leading-none">RESUME PREP</p>
                          <h3 className="text-lg md:text-2xl lg:text-3xl font-black uppercase text-white tracking-tight leading-tight line-clamp-2">
                             {res.mockTitle || 'OFFICIAL MOCK'}
                          </h3>
                       </div>
                       <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-10">
                          <Button asChild className="h-11 md:h-14 px-6 md:px-8 bg-primary hover:bg-orange-600 text-white font-black uppercase text-[8px] md:text-[10px] tracking-[0.2em] rounded-xl md:rounded-2xl shadow-xl transition-all active:scale-95 border-none cursor-pointer">
                             <Link href={`/results/${res.id || res.mockId}`}>REVIEW RESULT <ArrowRight className="ml-2 h-3 w-3" /></Link>
                          </Button>
                          <div className="flex items-center gap-3 shrink-0">
                             <div className="flex flex-col">
                                <span className="text-[6px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">MASTERY</span>
                                <span className="text-[6px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1 leading-none">INDEX</span>
                             </div>
                             <span className="text-xl md:text-3xl font-black text-primary tabular-nums">{res.accuracy || 0}%</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </Card>
           ))}
        </div>
      </div>
    </section>
  );
}
