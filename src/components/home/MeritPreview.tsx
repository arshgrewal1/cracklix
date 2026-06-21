'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore, useDoc } from '@/firebase';
import { collection, query, limit, doc, orderBy } from 'firebase/firestore';
import { Trophy, Medal, Activity, ChevronRight, Users, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import StudentAvatar from '@/components/brand/StudentAvatar';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * @fileOverview High-Density Punjab Merit Preview v6.0.
 * TYPOGRAPHY: Title Case applied.
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
    return Array.from(uniqueMap.values()).sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 5);
  }, [results]);

  const liveAspirantCount = useMemo(() => {
    if (statsLoading || !stats) return "---";
    const count = stats.totalUsers || 0;
    return count >= 1000 ? `${(count / 1000).toFixed(1)}K+` : `${count}+`;
  }, [stats, statsLoading]);

  return (
    <section className="py-8 md:py-24 bg-white overflow-hidden border-t border-slate-50">
      <div className="container mx-auto px-4 max-w-7xl text-left">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 md:gap-20 items-center">
           
           <div className="space-y-6 md:space-y-12">
              <div className="space-y-3 md:space-y-6 max-w-xl">
                 <div className="flex items-center gap-3">
                    <Trophy className="h-4 w-4 text-blue-600" />
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-400 tracking-tight uppercase">Punjab Merit Index</span>
                 </div>
                 <h2 className="text-2xl md:text-6xl font-extrabold text-[#0F172A] leading-tight tracking-tight">Hall of <span className="text-blue-600">Rankers</span></h2>
                 <p className="text-[12px] md:text-lg text-slate-500 font-medium leading-relaxed">
                    Compare performance with {liveAspirantCount} aspirants across 23 districts. Secure your spot in the official merit list.
                 </p>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-6">
                 <div className="p-4 md:p-8 bg-slate-50 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-inner">
                    <div className="h-8 w-8 md:h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center mb-2 text-blue-600">
                       <Users className="h-4 w-4" />
                    </div>
                    <p className="text-2xl md:text-4xl font-extrabold text-[#0F172A] tabular-nums">{liveAspirantCount}</p>
                    <p className="text-[8px] md:text-[10px] font-bold text-slate-400 tracking-tight uppercase mt-1">Aspirant Nodes</p>
                 </div>
                 <div className="p-4 md:p-8 bg-blue-50/50 rounded-[1.5rem] md:rounded-[2rem] border border-blue-100 shadow-inner">
                    <div className="h-8 w-8 md:h-10 rounded-lg bg-white border border-blue-100 flex items-center justify-center mb-2 text-blue-600">
                       <MapPin className="h-4 w-4" />
                    </div>
                    <p className="text-2xl md:text-4xl font-extrabold text-blue-600 tabular-nums">23</p>
                    <p className="text-[8px] md:text-[10px] font-bold text-slate-400 tracking-tight uppercase mt-1">Districts</p>
                 </div>
              </div>

              <Button asChild className="h-12 md:h-16 px-8 bg-[#0F172A] hover:bg-black text-white font-bold text-[10px] md:text-sm rounded-xl md:rounded-2xl shadow-xl gap-3 transition-all active:scale-95 border-none">
                 <Link href="/leaderboard">Full Merit List <ChevronRight className="h-4 w-4 text-blue-600" /></Link>
              </Button>
           </div>

           <div className="relative w-full">
              <Card className="border-none shadow-3xl rounded-[2rem] md:rounded-[3rem] bg-white overflow-hidden relative z-10 border border-slate-100 w-full">
                 <div className="bg-[#0B1528] p-4 md:p-8 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                       <Medal className="h-4 w-4 text-blue-600" />
                       <h3 className="font-bold text-xs md:text-sm tracking-tight uppercase">Live Topper Hub</h3>
                    </div>
                    <Badge className="bg-white/10 text-blue-600 border-none text-[8px] font-bold px-2 uppercase">Real-time</Badge>
                 </div>
                 <CardContent className="p-0">
                    <div className="divide-y divide-slate-50">
                       {resultsLoading ? (
                          Array.from({ length: 3 }).map((_, i) => <div key={i} className="p-4"><Skeleton className="h-8 w-full rounded-lg" /></div>)
                       ) : topRankers.length > 0 ? topRankers.map((res: any, idx: number) => {
                          const name = (res.userName && res.userName !== 'Aspirant' && res.userName !== 'Student' && !res.userName.includes('@')) ? res.userName : (res.userEmail?.split('@')[0] || "Aspirant");
                          return (
                            <div key={res.id} className="p-4 md:p-8 flex items-center justify-between group hover:bg-slate-50/50 transition-colors">
                               <div className="flex items-center gap-3 md:gap-6 min-w-0">
                                  <span className={cn("font-black text-xs md:text-xl w-4 md:w-6", idx === 0 ? "text-amber-400" : "text-slate-200")}>#{idx + 1}</span>
                                  <StudentAvatar profile={{ name, gender: res.gender }} className="h-8 w-8 md:h-12 md:w-12 rounded-lg md:rounded-xl shadow-sm" />
                                  <div className="min-w-0">
                                     <p className="font-bold text-[11px] md:text-lg text-[#0F172A] truncate leading-none">{name}</p>
                                     <p className="text-[7px] md:text-[9px] font-bold text-slate-300 truncate max-w-[120px] uppercase mt-1">{res.mockTitle}</p>
                                  </div>
                               </div>
                               <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px] md:text-[11px] px-2 md:px-3 py-0.5 rounded tabular-nums">{res.accuracy}%</Badge>
                            </div>
                          )
                       }) : (
                          <div className="py-12 text-center opacity-20 italic font-bold text-[10px] flex flex-col items-center gap-2">
                             <Activity className="h-6 w-6 text-slate-300" />
                             Awaiting Audit
                          </div>
                       )}
                    </div>
                 </CardContent>
              </Card>
           </div>

        </div>
      </div>
    </section>
  );
}
