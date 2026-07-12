
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Smartphone, ShieldAlert, User, Clock, Search, ShieldCheck, Activity, Loader2, ChevronRight, History, RefreshCw } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, limit, where, orderBy } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

/**
 * @fileOverview Institutional Session Monitoring v16.0 (High-Fidelity).
 * FIXED: Balanced header typography and increased spacing for refined PWA presentation.
 * UPDATED: Integrated live sync indicator.
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
    <div className="space-y-10 md:space-y-16 text-[#0F172A] text-left animate-in fade-in duration-700 pt-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-3">
           <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Registry Sync Online</span>
           </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tighter leading-none">Active Sessions</h1>
          <p className="text-slate-500 text-[13px] md:text-lg font-medium max-w-2xl leading-tight">Monitoring the latest authorized login points across the aspirant registry.</p>
        </div>
        <div className="hidden lg:flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
           <Activity className="h-5 w-5 text-primary" />
           <div className="text-left">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Active</p>
              <p className="text-xl font-black tabular-nums leading-none">{filteredUsers.length}</p>
           </div>
        </div>
      </div>

      <div className="relative group px-1">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
         <Input 
           className="h-16 md:h-20 pl-16 rounded-2xl md:rounded-[2rem] bg-white border-slate-100 shadow-xl text-base md:text-xl font-bold" 
           placeholder="Search student identity or email..." 
           value={searchTerm}
           onChange={e => setSearchTerm(e.target.value)}
         />
      </div>

      <Card className="border-none shadow-3xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 text-left">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-16 md:h-24">
                <TableHead className="px-8 md:px-12 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Aspirant Profile</TableHead>
                <TableHead className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Version & ID</TableHead>
                <TableHead className="hidden md:table-cell text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Last Active</TableHead>
                <TableHead className="text-right px-8 md:px-12 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-50"><TableCell colSpan={4} className="px-8 py-8 md:py-12"><Skeleton className="h-12 w-full rounded-2xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((u: any) => (
                  <TableRow key={u.id} className="hover:bg-slate-50 border-slate-50 transition-colors group">
                    <TableCell className="px-8 md:px-12 py-6 md:py-12">
                       <div className="flex items-center gap-4 md:gap-8">
                          <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl flex items-center justify-center text-white font-black uppercase text-base md:text-xl shadow-xl bg-primary">
                             {u.name?.[0] || 'A'}
                          </div>
                          <div className="min-w-0">
                             <p className="font-bold text-[#0F172A] text-base md:text-2xl leading-tight truncate">{u.name || 'System Auto'}</p>
                             <p className="text-[10px] md:text-[12px] text-slate-400 font-bold mt-1.5 uppercase tracking-widest truncate">{u.email}</p>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <div className="inline-flex flex-col items-center gap-2">
                          <Badge className="bg-blue-50 text-blue-600 border-none px-3 py-1 rounded-lg text-[9px] md:text-[10px] font-black shadow-sm">
                             v{u.sessionVersion || 1}.0
                          </Badge>
                          <code className="text-[9px] md:text-[11px] text-slate-300 font-mono tracking-tighter">
                            {u.activeDeviceId?.slice(0, 10)}...
                          </code>
                       </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-center">
                       <div className="inline-flex flex-col items-center">
                          <p className="text-base md:text-lg font-black text-[#0F172A] tabular-nums leading-none">
                            {u.lastLoginAt ? new Date(u.lastLoginAt.seconds * 1000).toLocaleDateString('en-GB') : '---'}
                          </p>
                          <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest tabular-nums">
                             {u.lastLoginAt ? new Date(u.lastLoginAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                          </span>
                       </div>
                    </TableCell>
                    <TableCell className="text-right px-8 md:px-12">
                       <Button asChild variant="ghost" className="h-11 md:h-14 px-6 md:px-8 rounded-full font-black uppercase text-[9px] md:text-[11px] tracking-widest text-primary gap-3 bg-slate-50 shadow-sm border border-slate-100 hover:bg-white active:scale-95 transition-all">
                          <Link href={`/admin/users?q=${u.email}`}>View History <ChevronRight className="h-4 w-4" /></Link>
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                   <TableCell colSpan={4} className="h-80 md:h-[400px] text-center">
                      <div className="flex flex-col items-center justify-center opacity-10 space-y-6 md:space-y-8">
                         <Smartphone className="h-20 w-20 md:h-32 md:w-32 text-slate-400" />
                         <p className="font-black text-xl md:text-4xl uppercase tracking-[0.4em]">No sessions found</p>
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
