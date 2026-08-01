'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, limit, orderBy } from 'firebase/firestore';
import { Trophy, ChevronRight, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import StudentAvatar from '@/components/brand/StudentAvatar';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

/**
 * @fileOverview Super-Compact Real-Time Merit Preview v7.0.
 * FIXED: Uses live onSnapshot to ensure ranks refresh immediately after submission.
 */

export default function MeritPreview() {
  const db = useFirestore();
  
  // Real-time listener for the global leaderboard
  const meritQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, "leaderboard"), 
      orderBy("highestScore", "desc"), 
      orderBy("updatedAt", "desc"), // Tie-break: Newest achiever first
      limit(2)
    );
  }, [db]);

  const { data: rawList, loading } = useCollection<any>(meritQuery);

  const meritList = useMemo(() => {
    if (!rawList) return [];
    return rawList;
  }, [rawList]);

  return (
    <section className="py-8 md:py-12 bg-background border-t border-border overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-6">
        
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
             <div className="h-7 w-7 md:h-9 md:h-9 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-500 shadow-inner shrink-0">
               <Trophy className="h-3.5 w-3.5 md:h-4 md:w-4 fill-current" />
             </div>
             <div className="text-left">
                <h2 className="text-base md:text-xl font-black text-foreground tracking-tight">Top rankers</h2>
                <p className="text-[8px] md:text-[10px] font-medium text-muted-foreground">Live merit list</p>
             </div>
          </div>
          <Link href="/leaderboard" className="text-primary font-bold text-[9px] md:text-xs flex items-center gap-1 hover:underline group">
            View all <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
           {loading ? (
              Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl bg-muted border border-border" />)
           ) : meritList && meritList.length > 0 ? meritList.map((res, i) => (
              <motion.div 
                key={res.uid || res.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full"
              >
                 <Link href="/leaderboard" className="block h-full">
                    <Card className="border border-border shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden bg-card p-3 md:p-4 flex items-center rounded-xl md:rounded-2xl h-full text-left relative">
                       <div className="flex items-center gap-3 md:gap-4 w-full">
                          <div className="relative shrink-0">
                             <StudentAvatar profile={{ name: res.displayName, photoURL: res.photoURL, gender: res.gender }} className="h-10 w-10 md:h-12 md:w-12 rounded-lg border border-border shadow-inner group-hover:scale-105 transition-transform" />
                             <div className={cn(
                                "absolute -bottom-1 -right-1 h-4 w-4 rounded-md flex items-center justify-center text-white text-[7px] font-black shadow-lg border border-background",
                                i === 0 ? "bg-amber-400" : "bg-slate-300"
                             )}>
                                #{i + 1}
                             </div>
                          </div>
                          <div className="min-w-0 flex-1 space-y-0.5">
                             <p className="font-bold text-[13px] md:text-base text-foreground truncate tracking-tight">{res.displayName}</p>
                             <p className="text-[9px] md:text-[11px] font-black text-primary tabular-nums tracking-tight">Peak score: {(Number(res.highestScore) || 0).toFixed(1)}</p>
                          </div>
                          <div className="shrink-0">
                             <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                                <ArrowRight className="h-3.5 w-3.5" />
                             </div>
                          </div>
                       </div>
                    </Card>
                 </Link>
              </motion.div>
           )) : (
              <div className="col-span-full py-12 text-center opacity-30 italic font-bold text-[9px] border-2 border-dashed border-border rounded-2xl">
                 Awaiting merit sync
              </div>
           )}
        </div>
      </div>
    </section>
  );
}
