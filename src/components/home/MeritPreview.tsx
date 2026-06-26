'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore, useDoc } from '@/firebase';
import { collection, query, limit, doc, orderBy } from 'firebase/firestore';
import { Trophy, ChevronRight, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import StudentAvatar from '@/components/brand/StudentAvatar';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * @fileOverview Institutional Merit Hub v18.0 - High Density Grid.
 * UPDATED: Converted carousel to 2-column grid on mobile and reduced scales.
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
    return Array.from(uniqueMap.values()).sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 4);
  }, [results]);

  return (
    <section className="py-8 md:py-24 bg-slate-50/50 border-t border-slate-100 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-6 md:space-y-16">
        
        {/* Header Hub */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2 px-1">
           <div className="space-y-1">
              <div className="flex items-center gap-2">
                 <Trophy className="h-5 w-5 md:h-8 md:w-8 text-primary shrink-0" />
                 <h2 className="text-[24px] md:text-5xl font-black text-[#0F172A] tracking-tight leading-none">Hall of Rankers</h2>
              </div>
              <p className="text-[13px] md:text-xl font-medium text-slate-500">Real-time merit hub for every Punjab aspirant.</p>
           </div>
           <Button asChild variant="ghost" className="text-primary font-bold text-[12px] md:text-base tracking-tight gap-2 group shrink-0">
              <Link href="/leaderboard" className="flex items-center gap-2">View Full List <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></Link>
           </Button>
        </div>

        {/* Merit Grid - High Density 2-column on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 lg:gap-10">
           {resultsLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl bg-white border border-slate-100" />)
           ) : topRankers.map((res, i) => {
              const name = (res.userName && res.userName !== 'Aspirant' && !res.userName.includes('@')) ? res.userName : (res.userEmail?.split('@')[0] || "Aspirant");
              
              // Standardized Title Case
              const cleanName = name.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

              return (
                 <motion-div-wrapper key={res.id}>
                    <Card className="border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden bg-white p-3 md:p-8 h-full flex flex-col justify-center rounded-2xl md:rounded-[3rem]">
                       <div className="flex flex-col items-center text-center space-y-2 md:space-y-4">
                          <div className="relative shrink-0">
                             <StudentAvatar profile={{ name: cleanName, gender: res.gender }} className="h-10 w-10 md:h-20 md:w-20 rounded-xl md:rounded-3xl border-2 border-slate-50 shadow-inner group-hover:scale-110 transition-transform" />
                             <div className={cn(
                                "absolute -bottom-1 -right-1 h-5 w-5 md:h-8 md:w-8 rounded-lg flex items-center justify-center text-white text-[9px] md:text-xs font-black shadow-lg border-2 border-white transition-all",
                                i === 0 ? "bg-amber-400" : i === 1 ? "bg-slate-300" : "bg-orange-400"
                             )}>
                                {i + 1}
                             </div>
                          </div>
                          <div className="min-w-0 w-full">
                             <p className="font-black text-[13px] md:text-2xl text-[#0F172A] truncate uppercase leading-tight">{cleanName}</p>
                             <div className="flex flex-col items-center gap-0.5 mt-1">
                                <p className="text-[9px] md:text-sm font-bold text-slate-400 uppercase tracking-tight">Score: {res.score}</p>
                                <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] md:text-[10px] font-black mt-1 px-2 py-0 rounded-md">Rank {i + 1}</Badge>
                             </div>
                          </div>
                       </div>
                    </Card>
                 </motion-div-wrapper>
              )
           })}
        </div>
      </div>
    </section>
  );
}
