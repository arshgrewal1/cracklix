"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Clock, User, Activity, Download, ChevronRight } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, limit, DocumentData, FirestoreDataConverter } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { AuditLog } from "@/types"
import { cn } from "@/lib/utils"

const auditLogConverter: FirestoreDataConverter<AuditLog> = {
    toFirestore: (data: AuditLog): DocumentData => data,
    fromFirestore: (snap): AuditLog => snap.data() as AuditLog
};

/**
 * @fileOverview Premium Audit Trail Hub v3.0.
 * Redesigned for high-fidelity administrative monitoring.
 */

export default function AuditLogsPage() {
  const db = useFirestore()
  
  // Real-time audit listener
  const logsQuery = useMemo(() => (db ? query(collection(db, "audit_logs").withConverter(auditLogConverter), limit(100)) : null), [db])
  const { data: allLogs, loading } = useCollection<AuditLog>(logsQuery)

  // Sort logs by newest first client-side
  const logs = useMemo(() => {
    if (!allLogs) return []
    return [...allLogs].sort((a, b) => {
      const timeA = a.timestamp?.seconds || 0
      const timeB = b.timestamp?.seconds || 0
      return timeB - timeA
    })
  }, [allLogs])

  return (
    <div className="space-y-6 md:space-y-12 pb-32 text-left animate-in fade-in duration-700">
      
      {/* Header Hub */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1.5">
           <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Security Governance</span>
           </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tighter antialiased">Audit Trail</h1>
          <p className="text-slate-500 font-medium text-sm md:text-lg">Detailed ledger of all institutional modifications and extraction activities.</p>
        </div>
        <Button variant="outline" className="h-11 md:h-14 px-8 rounded-full border-slate-200 bg-white font-bold text-xs tracking-tight gap-2 shadow-sm hover:bg-slate-50 active:scale-95 transition-all">
           <Download className="h-4 w-4" /> Export Ledger
        </Button>
      </div>

      {/* Main Ledger Card */}
      <Card className="border-none shadow-2xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 text-left overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-16 md:h-20">
                <TableHead className="px-6 md:px-12 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Administrator</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Action</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resource context</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-50">
                    <TableCell colSpan={4} className="px-6 py-6 md:px-12 md:py-10">
                      <Skeleton className="h-10 w-full rounded-xl bg-slate-50" />
                    </TableCell>
                  </TableRow>
                ))
              ) : logs && logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log.id} className="border-slate-50 hover:bg-slate-50/80 transition-all group">
                    <TableCell className="px-6 md:px-12 py-5 md:py-8">
                       <div className="flex items-center gap-3 text-slate-500">
                          <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] md:text-[13px] font-black text-[#0F172A] tabular-nums leading-none">
                              {log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleDateString('en-GB') : "N/A"}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
                              {log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ""}
                            </span>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-4">
                          <div className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                             <User className="h-4 w-4 md:h-5 md:w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#0F172A] text-xs md:text-base truncate max-w-[140px] leading-tight">
                              {log.user || 'System Node'}
                            </p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Verified Admin</p>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <Badge className="bg-[#0F172A] text-white border-none uppercase text-[8px] md:text-[9px] font-black px-3 py-1 rounded-lg shadow-sm">
                          {log.action?.replace('_', ' ') || 'MODIFICATION'}
                       </Badge>
                    </TableCell>
                    <TableCell className="max-w-md">
                       <div className="flex items-center justify-between gap-4">
                          <p className="text-[11px] md:text-sm font-medium text-slate-500 line-clamp-1 leading-relaxed">
                            {log.details || 'Registry modification event logged.'}
                          </p>
                          <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-primary transition-all group-hover:translate-x-1 shrink-0" />
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                   <TableCell colSpan={4} className="h-60 md:h-96 text-center">
                      <div className="flex flex-col items-center justify-center opacity-10 space-y-6">
                         <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center">
                           <Activity className="h-10 w-10 text-slate-400" />
                         </div>
                         <p className="font-black text-sm md:text-2xl uppercase tracking-[0.3em]">No Audit Entries</p>
                      </div>
                   </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-4 text-slate-300 py-6">
        <ShieldCheck className="h-4 w-4" />
        <span className="text-[9px] font-black uppercase tracking-[0.5em]">Registry Locked & Audited</span>
      </div>
    </div>
  )
}
