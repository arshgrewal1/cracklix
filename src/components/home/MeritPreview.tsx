
'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore, useDoc } from '@/firebase';
import { collection, query, limit, doc, orderBy } from 'firebase/firestore';
import { Trophy, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import StudentAvatar from '@/components/brand/StudentAvatar';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

/**
 * @fileOverview Top Rankers Preview Hub v20.3 [Fidelity Sync].
 * FIXED: Preserving decimal scores for institutional accuracy.
 */
export default function MeritPreview() {
  const db = useFirestore();
  
  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats } = useDoc<any>(statsRef);

  const resultsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "results"), orderBy("score", "desc"), limit(40));
  }, [db]);

  const { data: results, loading: resultsLoading } = useCollection<any>(resultsQuery);

  const topRankers = useMemo(() => {
    if (!results) return [];
    const uniqueMap = new Map();
    results.forEach(res => {
      if (!uniqueMap.has(res.userId) || uniqueMap.get(res.userId).score < res.score) {
        uniqueMap.set(res.userId, res);
      }
    });
    return Array.from(uniqueMap.values()).sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 10);
  }, [results]);

  return (
    <section className="py-8 md:py-24 bg-slate-50/50 border-t border-slate-100 overflow-hidden">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-8 md:space-y-16">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 text-left px-1">
           <div className="space-y-2">
              <div className="flex items-center gap-3 md:gap-4">
                 <Trophy className="h-8 w-8 md:h-12 md:w-12 text-primary shrink-0" />
                 <h2 className="text-2xl md:text-4xl font-black tracking-tight text-[#0F172A]">Top Rankers</h2>
              </div>
              <p className="text-[14px] md:text-[clamp(13px,1.5vw,18px)] font-medium text-slate-500 italic">See the top students preparing across Punjab.</p>
           </div>
           <Button asChild variant="ghost" className="text-primary font-bold text-[13px] md:text-base tracking-tight gap-2 group shrink-0 p-0 h-auto">
              <Link href="/leaderboard" className="flex items-center gap-2">View All <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
           </Button>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-4 px-4 gap-3 md:grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 md:gap-8 lg:gap-10">
           {resultsLoading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="flex-shrink-0 w-[45%] h-48 md:h-72 md:w-full rounded-2xl md:rounded-[4rem] bg-white" />)
           ) : topRankers.map((res, i) => {
              const name = (res.userName && res.userName !== 'Aspirant' && !res.userName.includes('@')) ? res.userName : (res.userEmail || "Student");
              const cleanName = name.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

              return (
                 <div key={res.id} className="flex-shrink-0 w-[45%] md:w-full snap-start h-full">
                    <Card className="border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden bg-white p-4 md:p-10 flex flex-col justify-center rounded-2xl md:rounded-[4rem] h-full min-h-[160px] md:min-h-[340px]">
                       <div className="flex flex-col items-center text-center space-y-3 md:space-y-6">
                          <div className="relative shrink-0">
                             <StudentAvatar profile={{ name: cleanName, gender: res.gender }} className="h-12 w-12 md:h-24 md:w-24 rounded-xl md:rounded-[2rem] border border-slate-50 shadow-inner group-hover:scale-105 transition-transform" />
                             <div className={cn(
                                "absolute -bottom-1.5 -right-1.5 h-5 w-5 md:h-10 md:w-10 rounded-lg md:rounded-xl flex items-center justify-center text-white text-[9px] md:text-sm font-bold shadow-xl border-2 border-white transition-all",
                                i === 0 ? "bg-amber-400" : i === 1 ? "bg-slate-300" : "bg-orange-400"
                             )}>
                                {i + 1}
                             </div>
                          </div>
                          <div className="min-w-0 w-full space-y-1 md:space-y-2">
                             <p className="font-bold text-[13px] md:text-xl text-[#0F172A] leading-tight tracking-tight break-words">{cleanName}</p>
                             <div className="flex flex-col items-center">
                                <p className="text-[10px] md:text-sm font-bold text-slate-400 tracking-tight tabular-nums">Score: {(Number(res.score) || 0).toFixed(1)}</p>
                             </div>
                          </div>
                       </div>
                    </Card>
                 </div>
              )
           })}
        </div>
      </div>
    </section>
  );
}
