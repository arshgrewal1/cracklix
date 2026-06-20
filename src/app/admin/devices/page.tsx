
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
 * @fileOverview Institutional Session Monitoring v13.0 (Takeover Aware).
 * UPDATED: Focused on session history and active login tracking.
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
    <div className="space-y-12 text-[#0F172A] text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <History className="h-6 w-6 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Session Integrity monitor</span>
           </div>
          <h1 className="text-5xl font-black font-headline text-[#0F172A] uppercase tracking-tight">Active Sessions</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Monitoring the latest authorized login points across the aspirant registry.</p>
        </div>
      </div>

      <div className="relative group">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
         <Input 
           className="h-16 pl-16 rounded-[1.5rem] bg-white border-slate-100 shadow-2xl text-lg font-medium text-[#0F172A]" 
           placeholder="Search student identity or email..." 
           value={searchTerm}
           onChange={e => setSearchTerm(e.target.value)}
         />
      </div>

      <Card className="border-slate-100 shadow-3xl bg-white rounded-[3rem] overflow-hidden">
        <CardContent className="p-0 text-left">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-20">
                <TableHead className="px-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Aspirant Profile</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 text-center">Last Login</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Status</TableHead>
                <TableHead className="text-right px-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-50"><TableCell colSpan={4} className="px-12 py-10"><Skeleton className="h-12 w-full rounded-2xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((u: any) => (
                  <TableRow key={u.id} className="hover:bg-slate-50 group border-slate-50 transition-all">
                    <TableCell className="px-12 py-10">
                       <div className="flex items-center gap-6">
                          <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center text-white font-black uppercase text-xs shadow-inner bg-primary")}>
                             {u.name?.[0] || 'A'}
                          </div>
                          <div>
                             <p className="font-black text-[#0F172A] text-lg uppercase leading-none">{u.name || 'System Auto'}</p>
                             <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">{u.email}</p>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <div className="inline-flex flex-col items-center">
                          <p className="text-sm font-bold text-[#0F172A] tabular-nums">
                            {u.lastLoginAt ? new Date(u.lastLoginAt.seconds * 1000).toLocaleString() : '---'}
                          </p>
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">REGISTRY TIMESTAMP</p>
                       </div>
                    </TableCell>
                    <TableCell>
                       <Badge className="border-none text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600">
                          AUTHORIZED
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right px-12">
                       <Button asChild variant="ghost" className="h-10 rounded-xl font-black uppercase text-[9px] tracking-widest text-primary gap-2">
                          <Link href={`/admin/users?q=${u.email}`}>View History <ChevronRight className="h-4 w-4" /></Link>
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                   <TableCell colSpan={4} className="h-80 text-center">
                      <div className="flex flex-col items-center justify-center opacity-10 space-y-6">
                         <Smartphone className="h-24 w-24 text-slate-400" />
                         <p className="font-black font-headline text-2xl uppercase tracking-widest">No active login nodes</p>
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
