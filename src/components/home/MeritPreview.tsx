'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore, useDoc } from '@/firebase';
import { collection, query, limit, doc, orderBy } from 'firebase/firestore';
import { Trophy, Medal, Activity, ChevronRight, Users, MapPin, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import StudentAvatar from '@/components/brand/StudentAvatar';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * @fileOverview High-Density Merit Hub v8.1.
 * ALIGNMENT: Standardized side margins to match Hero section.
 */
export default function MeritPreview() {
  const db = useFirestore();
  
  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats, loading: statsLoading } = useDoc<any>(statsRef);

  const resultsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "results"), orderBy("score", "desc"), limit(50));
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="flex items-center justify-between mb-6 md:mb-14 px-1">
           <div className="space-y-1">
              <div className="flex items-center gap-3">
                 <Trophy className="h-5 w-5 text-primary" />
                 <h2 className="text-xl md:text-4xl font-black text-[#0F172A] tracking-tight leading-none">Hall of Rankers</h2>
              </div>
              <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest">Real-time Merit Hub</p>
           </div>
           <Button asChild variant="ghost" className="text-primary font-black uppercase text-[9px] tracking-widest gap-2">
              <Link href="/leaderboard">View All <ChevronRight className="h-4 w-4" /></Link>
           </Button>
        </div>

        <div className="flex overflow-x-auto no-scrollbar -mx-4 px-4 gap-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:mx-0 md:px-0 scroll-smooth snap-x pb-4">
           {resultsLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="min-w-[260px] h-32 rounded-[2rem] bg-white" />)
           ) : topRankers.map((res, i) => {
              const name = (res.userName && res.userName !== 'Aspirant' && !res.userName.includes('@')) ? res.userName : (res.userEmail?.split('@')[0] || "Aspirant");
              return (
                 <Card key={res.id} className="min-w-[260px] md:min-w-0 snap-center border border-slate-100 shadow-xl rounded-[2rem] bg-white p-6 hover:shadow-2xl transition-all group overflow-hidden">
                    <div className="flex items-center gap-4 relative z-10">
                       <div className="relative">
                          <StudentAvatar profile={{ name, gender: res.gender }} className="h-14 w-14 rounded-2xl border-2 border-slate-50 shadow-md" />
                          <div className={cn("absolute -bottom-1 -right-1 h-6 w-6 rounded-lg flex items-center justify-center text-white text-[8px] font-black shadow-lg border-2 border-white", i === 0 ? "bg-amber-400" : i === 1 ? "bg-slate-300" : "bg-orange-400")}>
                             {i + 1}
                          </div>
                       </div>
                       <div className="min-w-0">
                          <p className="font-black text-sm text-[#0F172A] uppercase truncate">{name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase truncate mt-1">Score: {res.score}</p>
                          <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black mt-2">AIR {i + 1}</Badge>
                       </div>
                    </div>
                 </Card>
              )
           })}
        </div>
      </div>
    </section>
  );
}