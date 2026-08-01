'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore, useDoc } from '@/firebase';
import { collection, query, limit, doc, orderBy } from 'firebase/firestore';
import { Trophy, ChevronRight, ArrowRight, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import StudentAvatar from '@/components/brand/StudentAvatar';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

/**
 * @fileOverview High-Density Merit Preview v5.0.
 * COMPACT: Limited to 2 items on Home Page. Drastically reduced radii and padding.
 */

export default function MeritPreview() {
  const db = useFirestore();
  
  const meritQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, "leaderboard"), 
      orderBy("highestScore", "desc"), 
      limit(2)
    );
  }, [db]);

  const { data: rawList, loading } = useCollection<any>(meritQuery);

  const meritList = useMemo(() => {
    if (!rawList) return [];
    return [...rawList].sort((a, b) => (b.highestScore || 0) - (a.highestScore || 0)).slice(0, 2);
  }, [rawList]);

  return (
    <section className="py-12 md:py-20 bg-background border-t border-border overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-8">
        
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-500 shadow-inner shrink-0">
               <Trophy className="h-4 w-4 md:h-5 md:w-5 fill-current" />
             </div>
             <div className="text-left">
                <h2 className="text-lg md:text-2xl font-black text-foreground tracking-tight">Top rankers</h2>
                <p className="text-[10px] md:text-xs font-medium text-muted-foreground">Live state merit list</p>
             </div>
          </div>
          <Link href="/leaderboard" className="text-primary font-bold text-[10px] md:text-xs flex items-center gap-1 hover:underline group">
            View all <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
           {loading ? (
              Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-2xl bg-muted border border-border" />)
           ) : meritList && meritList.length > 0 ? meritList.map((res, i) => (
              <motion.div 
                key={res.uid}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="h-full"
              >
                 <Link href="/leaderboard" className="block h-full">
                    <Card className="border border-border shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden bg-card p-4 md:p-6 flex flex-col justify-center rounded-2xl h-full text-center relative">
                       <div className="flex items-center gap-4 text-left">
                          <div className="relative shrink-0">
                             <StudentAvatar profile={{ name: res.displayName, photoURL: res.photoURL, gender: res.gender }} className="h-12 w-12 md:h-14 md:w-14 rounded-xl border border-border shadow-inner group-hover:scale-105 transition-transform" />
                             <div className={cn(
                                "absolute -bottom-1 -right-1 h-5 w-5 rounded-lg flex items-center justify-center text-white text-[9px] font-black shadow-lg border-2 border-background",
                                i === 0 ? "bg-amber-400" : "bg-slate-300"
                             )}>
                                #{i + 1}
                             </div>
                          </div>
                          <div className="min-w-0 flex-1 space-y-0.5">
                             <p className="font-bold text-sm md:text-base text-foreground truncate uppercase tracking-tight">{res.displayName}</p>
                             <p className="text-[10px] font-black text-primary tabular-nums tracking-tighter">Score: {(Number(res.highestScore) || 0).toFixed(1)}</p>
                          </div>
                          <div className="shrink-0 hidden md:block">
                             <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                                <ArrowRight className="h-4 w-4" />
                             </div>
                          </div>
                       </div>
                    </Card>
                 </Link>
              </motion.div>
           )) : (
              <div className="col-span-full py-12 text-center opacity-30 italic font-black uppercase text-[10px] border-2 border-dashed border-border rounded-2xl">
                 Awaiting merit sync
              </div>
           )}
        </div>
      </div>
    </section>
  );
}