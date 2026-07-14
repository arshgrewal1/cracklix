"use client"

import React, { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart3, ShieldCheck, Clock, User, Zap, Filter, Search, ChevronRight } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, orderBy, limit, where } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { AdminPageHeader, AdminTableSkeleton, AdminSearchInput } from "@/components/admin"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Daily Challenge Audit Hub v1.0.
 * Tracking every individual attempt node for daily quizzes.
 */

export default function DailyQuizResultsAudit() {
  const db = useFirestore()
  const [searchTerm, setSearchTerm] = useState("")

  const resultsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "results"), limit(500));
  }, [db]);

  const { data: rawResults, loading } = useCollection<any>(resultsQuery);

  const filteredResults = useMemo(() => {
    if (!rawResults) return [];
    return [...rawResults]
      .filter((r: any) => {
         const isDaily = r.mockType === 'DAILY_CHALLENGE' || r.mockId?.startsWith('quiz-');
         const matchesSearch = !searchTerm || 
            r.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            r.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.mockTitle?.toLowerCase().includes(searchTerm.toLowerCase());
         return isDaily && matchesSearch;
      })
      .sort((a, b) => {
         const tA = new Date(a.timestamp || 0).getTime();
         const tB = b.updatedAt?.seconds ? b.updatedAt.seconds * 1000 : new Date(b.timestamp || 0).getTime();
         return tB - tA;
      });
  }, [rawResults, searchTerm]);

  return (
    <div className="space-y-10 md:space-y-16 text-left pb-32 animate-in fade-in duration-700 pt-2 px-1">
      
      <AdminPageHeader
        icon={BarChart3}
        label="Performance Audit"
        title="Quiz Results"
        subtitle="Individual attempt logs for all synchronized Daily Challenges."
      />

      <AdminSearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search by student name, email, or quiz title..."
      />

      <Card className="border-none shadow-3xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[1100px]">
              <TableHeader className="bg-slate-50/50">
                <TableRow className="h-16 md:h-24 border-slate-100">
                  <TableHead className="px-8 md:px-12 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Student Identity</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Challenge Title</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-center text-slate-400">Metrics</TableHead>
                  <TableHead className="text-right px-8 md:px-12 text-[10px] font-black uppercase tracking-widest text-slate-400">Audit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <AdminTableSkeleton rows={8} columns={5} />
                ) : filteredResults.length > 0 ? filteredResults.map((r) => (
                  <TableRow key={r.id} className="hover:bg-slate-50 border-slate-50 transition-all group">
                    <TableCell className="px-8 md:px-12 py-6 md:py-8">
                       <div className="flex items-center gap-3 text-slate-400">
                          <Clock className="h-3.5 w-3.5" />
                          <div className="flex flex-col">
                             <span className="font-bold text-[#0F172A] text-xs md:text-sm tabular-nums leading-none">
                               {new Date(r.timestamp).toLocaleDateString('en-GB')}
                             </span>
                             <span className="text-[8px] md:text-[9px] font-black uppercase mt-1 tracking-tight">
                               {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </span>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-4">
                          <div className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-blue-50 flex items-center justify-center text-primary font-black uppercase text-xs md:text-sm shadow-inner group-hover:scale-105 transition-transform">
                             {r.userName?.[0] || 'A'}
                          </div>
                          <div className="min-w-0">
                             <p className="font-bold text-[#0F172A] text-xs md:text-base truncate max-w-[180px] leading-tight">{r.userName}</p>
                             <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate max-w-[180px]">{r.userEmail}</p>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="min-w-0">
                          <p className="font-bold text-[#0F172A] text-xs md:text-base line-clamp-1 max-w-[250px]">{r.mockTitle}</p>
                          <Badge variant="outline" className="mt-1.5 text-[7px] font-black uppercase border-slate-200 text-slate-300 tracking-widest">Challenge Node</Badge>
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <div className="inline-flex items-center gap-4">
                          <div className="text-center">
                             <p className="text-xs md:text-xl font-black text-primary tabular-nums">{(r.score || 0).toFixed(1)}</p>
                             <p className="text-[7px] font-black text-slate-300 uppercase">Score</p>
                          </div>
                          <div className="w-px h-6 bg-slate-100" />
                          <div className="text-center">
                             <p className={cn("text-xs md:text-xl font-black tabular-nums", r.accuracy > 70 ? "text-emerald-500" : "text-amber-500")}>{r.accuracy}%</p>
                             <p className="text-[7px] font-black text-slate-300 uppercase">Accuracy</p>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="text-right px-8 md:px-12">
                       <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] md:text-[9px] px-3 py-1 rounded shadow-sm">SYNCED</Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                     <TableCell colSpan={5} className="h-80 md:h-[500px] text-center">
                        <div className="flex flex-col items-center justify-center opacity-10 space-y-6">
                           <Zap className="h-20 w-20 md:h-32 md:w-32 text-slate-400" />
                           <p className="font-black text-xl md:text-3xl uppercase tracking-[0.4em]">No Records Found</p>
                        </div>
                     </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-center gap-4 text-slate-300 py-6">
        <ShieldCheck className="h-4 w-4" />
        <span className="text-[9px] font-black uppercase tracking-[0.5em]">Institutional Audit Registry Synchronized</span>
      </div>
    </div>
  )
}
