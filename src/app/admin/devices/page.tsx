
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Smartphone, ShieldAlert, User, Clock, Search, ShieldCheck, Activity, Loader2 } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, orderBy, limit, where } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Device Monitoring Console v1.0.
 * Tracking hardware density and flagging account sharing patterns.
 */

export default function DeviceMonitoringPage() {
  const db = useFirestore()
  const [searchTerm, setSearchTerm] = useState("")

  const usersQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'users'), where("deviceCount", ">", 0), limit(200));
  }, [db]);

  const { data: userNodes, loading } = useCollection<any>(usersQuery);

  const filteredUsers = useMemo(() => {
    if (!userNodes) return [];
    return userNodes.filter(u => 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => (b.deviceCount || 0) - (a.deviceCount || 0));
  }, [userNodes, searchTerm]);

  const stats = useMemo(() => {
    if (!userNodes) return { shared: 0, healthy: 0 };
    return {
      shared: userNodes.filter((u: any) => u.deviceCount >= 2).length,
      healthy: userNodes.filter((u: any) => u.deviceCount < 2).length
    }
  }, [userNodes]);

  return (
    <div className="space-y-12 pb-20 text-[#0F172A] text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <ShieldAlert className="h-6 w-6 text-rose-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Security & Integrity Hub</span>
           </div>
          <h1 className="text-5xl font-black font-headline text-[#0F172A] uppercase tracking-tight">Device Audit</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Monitoring account hardware density and detecting sharing patterns.</p>
        </div>
        <div className="flex gap-4">
           <Card className="border-slate-100 bg-white rounded-2xl px-8 py-4 flex items-center gap-4 shadow-xl">
              <div className="space-y-0.5 text-left">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Shared Nodes (2+)</p>
                 <p className="text-3xl font-headline font-black text-rose-600">{stats.shared}</p>
              </div>
              <Activity className="h-8 w-8 text-rose-100" />
           </Card>
        </div>
      </div>

      <div className="mx-4 relative group">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
         <Input 
           className="h-16 pl-16 rounded-[1.5rem] bg-white border-slate-100 shadow-2xl text-lg font-medium text-[#0F172A]" 
           placeholder="Search student email or identity..." 
           value={searchTerm}
           onChange={e => setSearchTerm(e.target.value)}
         />
      </div>

      <Card className="border-slate-100 shadow-3xl bg-white rounded-[3rem] overflow-hidden mx-4">
        <CardContent className="p-0 text-left">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-20">
                <TableHead className="px-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Aspirant Profile</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 text-center">Node Density</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Registry Status</TableHead>
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
                          <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center text-white font-black uppercase text-xs shadow-inner", u.deviceCount >= 2 ? "bg-rose-500" : "bg-primary")}>
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
                          <p className={cn("text-3xl font-headline font-black", u.deviceCount >= 2 ? "text-rose-600" : "text-[#0F172A]")}>{u.deviceCount}</p>
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">ACTIVE DEVICES</p>
                       </div>
                    </TableCell>
                    <TableCell>
                       <Badge className={cn("border-none text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg", u.deviceCount >= 2 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600")}>
                          {u.deviceCount >= 2 ? 'MAX REACHED' : 'HEALTHY'}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right px-12">
                       <Button asChild variant="ghost" className="h-10 rounded-xl font-black uppercase text-[9px] tracking-widest text-primary gap-2">
                          <Link href={`/admin/users?q=${u.email}`}>View Profile <ChevronRight className="h-4 w-4" /></Link>
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                   <TableCell colSpan={4} className="h-80 text-center">
                      <div className="flex flex-col items-center justify-center opacity-10 space-y-6">
                         <Smartphone className="h-24 w-24 text-slate-400" />
                         <p className="font-black font-headline text-2xl uppercase tracking-widest">No active hardware nodes</p>
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
