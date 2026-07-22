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
 * @fileOverview Institutional Merit Preview v3.0.
 * FIXED: Mobile layout synchronized to grid (no scroll) for correct rank visibility.
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
    return Array.from(uniqueMap.values()).sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 8);
  }, [results]);

  return (
    <section className="py-12 md:py-24 bg-slate-50/50 border-t border-slate-100 overflow-hidden">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-8 md:space-y-16">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 text-left px-1">
           <div className="space-y-2">
              <div className="flex items-center gap-3 md:gap-4">
                 <div className="h-10 w-10 md:h-12 md:w-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shadow-inner shrink-0">
                    <Trophy className="h-6 w-6 md:h-7 md:w-7 fill-current" />
                 </div>
                 <h2 className="text-2xl md:text-4xl font-black tracking-tight text-[#0F172A]">Top Rankers</h2>
              </div>
              <p className="text-[14px] md:text-xl font-medium text-slate-500">Live merit list of highest performing aspirants.</p>
           </div>
           <Button asChild variant="ghost" className="text-primary font-bold text-xs md:text-sm tracking-tight gap-2 group p-0">
              <Link href="/leaderboard">View complete list <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
           </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-10">
           {resultsLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 md:h-80 w-full rounded-[2rem] bg-white border border-slate-100" />)
           ) : topRankers.map((res, i) => {
              const name = (res.userName && res.userName !== 'Aspirant' && !res.userName.includes('@')) ? res.userName : (res.userEmail || "Student");
              const cleanName = name.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

              return (
                 <motion.div 
                   key={res.id}
                   initial={{ opacity: 0, y: 15 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.4, delay: i * 0.05 }}
                   className="flex flex-col h-full"
                 >
                    <Card className="border border-slate-100 shadow-sm hover:shadow-4xl transition-all duration-500 group overflow-hidden bg-white p-5 md:p-10 flex flex-col justify-center rounded-[2rem] md:rounded-[3rem] h-full text-center">
                       <div className="flex flex-col items-center space-y-4 md:space-y-6">
                          <div className="relative shrink-0">
                             <StudentAvatar profile={{ name: cleanName, gender: res.gender }} className="h-16 w-16 md:h-28 md:w-28 rounded-2xl md:rounded-[2rem] border border-slate-50 shadow-inner group-hover:scale-105 transition-transform" />
                             <div className={cn(
                                "absolute -bottom-2 -right-2 h-7 w-7 md:h-11 md:w-11 rounded-xl flex items-center justify-center text-white text-[11px] md:text-base font-black shadow-xl border-4 border-white transition-all",
                                i === 0 ? "bg-amber-400" : i === 1 ? "bg-slate-300" : "bg-orange-400"
                             )}>
                                #{i + 1}
                             </div>
                          </div>
                          <div className="min-w-0 w-full space-y-1">
                             <p className="font-bold text-sm md:text-xl text-[#0F172A] leading-tight tracking-tight truncate px-2">{cleanName}</p>
                             <p className="text-[10px] md:text-sm font-bold text-primary tabular-nums tracking-tighter">Score: {(Number(res.score) || 0).toFixed(1)}</p>
                          </div>
                       </div>
                    </Card>
                 </motion.div>
              )
           })}
        </div>
      </div>
    </section>
  );
}
