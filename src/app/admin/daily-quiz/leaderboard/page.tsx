"use client"

import React, { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trophy, ShieldCheck, Activity, Target, Zap, Medal, Users } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, orderBy, limit, where } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AdminPageHeader, AdminTableSkeleton } from "@/components/admin"
import StudentAvatar from "@/components/brand/StudentAvatar"

/**
 * @fileOverview Daily Challenge Merit Registry v1.1.
 * UPDATED: Integrated Users collection for verified student names.
 */

export default function DailyQuizLeaderboard() {
  const db = useFirestore()

  const resultsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "results"), limit(1000));
  }, [db]);

  const usersQuery = useMemo(() => (db ? collection(db, "users") : null), [db]);

  const { data: rawResults, loading: resultsLoading } = useCollection<any>(resultsQuery);
  const { data: users, loading: usersLoading } = useCollection<any>(usersQuery);

  const meritList = useMemo(() => {
    if (!rawResults || !users) return [];
    
    const uniqueRankers = new Map<string, any>();
    
    [...rawResults].forEach((r: any) => {
      // Filter for Daily Challenge results specifically
      const isDaily = r.mockType === 'DAILY_CHALLENGE' || r.mockId?.startsWith('quiz-');
      if (!isDaily) return;

      const existing = uniqueRankers.get(r.userId);
      if (!existing || existing.score < r.score) {
        const userProfile = users.find((u: any) => u.id === r.userId);
        const displayName = userProfile?.name || r.userName || r.userEmail?.split('@')[0] || "Aspirant";
        
        uniqueRankers.set(r.userId, {
          ...r,
          displayName,
          userProfile,
          score: r.score || 0,
          accuracy: r.accuracy || 0,
          timestamp: r.timestamp || new Date().toISOString()
        });
      }
    });

    return Array.from(uniqueRankers.values()).sort((a, b) => b.score - a.score);
  }, [rawResults, users]);

  const loading = resultsLoading || usersLoading;

  return (
    <div className="space-y-10 md:space-y-16 text-left pb-32 animate-in fade-in duration-700 pt-2 px-1">
      
      <AdminPageHeader
        icon={Trophy}
        label="Merit Governance"
        title="Daily Leaderboard"
        subtitle="Ranked performance of aspirants in the official daily challenge nodes."
      />

      {/* TOP 3 PODIUM */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
         {meritList.slice(0, 3).map((hero, idx) => (
            <Card key={hero.id} className={cn(
              "border-none shadow-xl rounded-[2.5rem] p-8 md:p-10 text-center relative overflow-hidden group",
              idx === 0 ? "bg-[#0F172A] text-white ring-4 ring-primary/20 scale-105 z-10" : "bg-white text-[#0F172A]"
            )}>
               <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 group-hover:scale-110 transition-transform">
                  <Medal className="h-24 w-24" />
               </div>
               <div className="space-y-6 relative z-10">
                  <div className="relative inline-block">
                     <StudentAvatar profile={hero.userProfile || hero} className="h-20 w-20 md:h-32 md:w-32 mx-auto rounded-[2rem] border-4 border-white shadow-2xl" />
                     <div className={cn("absolute -bottom-2 -right-2 h-8 w-8 md:h-12 md:w-12 rounded-xl flex items-center justify-center text-white font-black text-xs md:text-lg shadow-xl", idx === 0 ? "bg-amber-400" : idx === 1 ? "bg-slate-300" : "bg-orange-400")}>
                        #{idx + 1}
                     </div>
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black truncate px-4">{hero.displayName}</h3>
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Score: {hero.score.toFixed(1)}</p>
                  </div>
                  <Badge className={cn("border-none px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest shadow-lg", idx === 0 ? "bg-primary text-white" : "bg-emerald-50 text-emerald-600")}>
                     {hero.accuracy}% Accuracy
                  </Badge>
               </div>
            </Card>
         ))}
      </div>

      {/* FULL RANKING TABLE */}
      <Card className="border-none shadow-3xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader className="bg-slate-50/50">
                <TableRow className="h-16 md:h-24 border-slate-100">
                  <TableHead className="px-8 md:px-12 text-[10px] font-black uppercase tracking-widest text-slate-400">Rank & Aspirant</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recent Node</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Accuracy</TableHead>
                  <TableHead className="text-right px-8 md:px-12 text-[10px] font-black uppercase tracking-widest text-slate-400">Total Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <AdminTableSkeleton rows={6} columns={4} />
                ) : meritList.length > 0 ? meritList.slice(3).map((r, i) => (
                  <TableRow key={r.id} className="hover:bg-slate-50 border-slate-50 transition-all group">
                    <TableCell className="px-8 md:px-12 py-6 md:py-10">
                       <div className="flex items-center gap-6">
                          <span className="font-black text-slate-200 text-xl md:text-3xl tabular-nums group-hover:text-primary transition-colors">#{i + 4}</span>
                          <div className="flex items-center gap-4">
                             <StudentAvatar profile={r.userProfile || r} className="h-10 w-10 md:h-14 md:w-14 rounded-xl shadow-inner bg-slate-50" />
                             <div>
                                <p className="font-black text-[#0F172A] text-sm md:text-lg leading-none">{r.displayName}</p>
                                <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{r.userEmail}</p>
                             </div>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="space-y-1">
                          <p className="font-bold text-[#0F172A] text-xs md:text-base line-clamp-1">{r.mockTitle}</p>
                          <p className="text-[8px] md:text-[9px] font-bold text-slate-300 uppercase tracking-widest">Completed: {new Date(r.timestamp).toLocaleDateString('en-GB')}</p>
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1 font-black text-[9px] md:text-[10px] rounded-lg shadow-sm">
                          {r.accuracy}%
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right px-8 md:px-12">
                       <span className="font-black text-lg md:text-3xl text-[#0F172A] tabular-nums tracking-tighter">{(r.score || 0).toFixed(1)}</span>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                     <TableCell colSpan={4} className="h-80 md:h-[500px] text-center">
                        <div className="flex flex-col items-center justify-center opacity-10 space-y-6">
                           <Activity className="h-20 w-20 md:h-32 md:w-32 text-slate-400" />
                           <p className="font-black text-xl md:text-3xl uppercase tracking-[0.4em]">Merit List Empty</p>
                        </div>
                     </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
