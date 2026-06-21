
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Smartphone, ShieldAlert, User, Clock, Search, ShieldCheck, Activity, Loader2, ChevronRight, History } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, limit, where, orderBy } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

/**
 * @fileOverview Institutional Session Monitoring v15.0 (PWA Optimized).
 * PWA SYNC: Removed uppercase, reduced font scales, and normalized Title Case.
 */

export default function DeviceMonitoringPage() {
  const db = useFirestore()
  const [searchTerm, setSearchTerm] = useState("")

  const usersQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'users'), where("lastLoginAt", "!=", null), limit(200));
  }, [db]);

  const { data: userNodes, loading } = useCollection<any>(usersQuery);

  const filteredUsers = useMemo(() => {
    if (!userNodes) return [];
    return userNodes.filter((u: any) => 
      (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a: any, b: any) => (b.lastLoginAt?.seconds || 0) - (a.lastLoginAt?.seconds || 0));
  }, [userNodes, searchTerm]);

  return (
    <div className="space-y-6 md:space-y-12 text-[#0F172A] text-left animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-1">
              <History className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Session Integrity Monitor</span>
           </div>
          <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight">Active Sessions</h1>
          <p className="text-slate-500 text-[11px] md:text-lg font-medium">Monitoring the latest authorized login points across the aspirant registry.</p>
        </div>
      </div>

      <div className="relative group px-1">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
         <Input 
           className="h-14 md:h-16 pl-14 rounded-2xl md:rounded-full bg-white border-slate-50 shadow-inner text-base md:text-lg font-bold" 
           placeholder="Search student identity or email..." 
           value={searchTerm}
           onChange={e => setSearchTerm(e.target.value)}
         />
      </div>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 text-left">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-14 md:h-20">
                <TableHead className="px-6 md:px-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Aspirant Profile</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Version & Id</TableHead>
                <TableHead className="hidden md:table-cell text-[10px] font-black uppercase tracking-widest text-slate-400">Last Active</TableHead>
                <TableHead className="text-right px-6 md:px-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-50"><TableCell colSpan={4} className="px-6 py-6 md:px-12 md:py-10"><Skeleton className="h-10 w-full rounded-xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((u: any) => (
                  <TableRow key={u.id} className="hover:bg-slate-50 border-slate-50 transition-colors group">
                    <TableCell className="px-6 md:px-12 py-5 md:py-10">
                       <div className="flex items-center gap-4 md:gap-6">
                          <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center text-white font-black uppercase text-[10px] md:text-xs shadow-inner bg-primary">
                             {u.name?.[0] || 'A'}
                          </div>
                          <div className="min-w-0">
                             <p className="font-bold text-[#0F172A] text-sm md:text-lg leading-tight truncate">{u.name || 'System Auto'}</p>
                             <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-tight truncate">{u.email}</p>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <div className="inline-flex flex-col items-center">
                          <Badge className="bg-blue-50 text-blue-600 border-none px-2 py-0.5 rounded text-[8px] md:text-[9px] font-black mb-1">
                             v{u.sessionVersion || 1}
                          </Badge>
                          <code className="text-[8px] text-slate-300 font-mono">
                            {u.activeDeviceId?.slice(0, 8)}...
                          </code>
                       </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                       <div className="flex flex-col">
                          <p className="text-sm font-bold text-[#0F172A] tabular-nums">
                            {u.lastLoginAt ? new Date(u.lastLoginAt.seconds * 1000).toLocaleString() : '---'}
                          </p>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Registry Timestamp</span>
                       </div>
                    </TableCell>
                    <TableCell className="text-right px-6 md:px-12">
                       <Button asChild variant="ghost" className="h-9 md:h-11 rounded-full font-black uppercase text-[8px] md:text-[9px] tracking-widest text-primary gap-2 bg-slate-50 shadow-sm border border-slate-100 hover:bg-white active:scale-95 transition-all">
                          <Link href={`/admin/users?q=${u.email}`}>View History <ChevronRight className="h-3 w-3" /></Link>
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                   <TableCell colSpan={4} className="h-60 md:h-80 text-center">
                      <div className="flex flex-col items-center justify-center opacity-10 space-y-4 md:space-y-6">
                         <Smartphone className="h-16 w-16 md:h-24 md:w-24 text-slate-400" />
                         <p className="font-black text-sm md:text-2xl uppercase tracking-widest">No active login nodes</p>
                      </div>
                   </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
