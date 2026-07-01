"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Clock, User, Activity, Download } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, limit, DocumentData, FirestoreDataConverter } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { AuditLog } from "@/types"

const auditLogConverter: FirestoreDataConverter<AuditLog> = {
    toFirestore: (data: AuditLog): DocumentData => data,
    fromFirestore: (snap): AuditLog => snap.data() as AuditLog
};

/**
 * @fileOverview Optimized Audit Trail Console v2.0 (PWA Optimized).
 * FIXED: Removed uppercase headers, reduced font scales, and applied high-density padding.
 */

export default function AuditLogsPage() {
  const db = useFirestore()
  const logsQuery = useMemo(() => (db ? query(collection(db, "audit_logs").withConverter(auditLogConverter), limit(50)) : null), [db])
  const { data: allLogs, loading } = useCollection<AuditLog>(logsQuery)

  const logs = useMemo(() => {
    if (!allLogs) return []
    return [...allLogs].sort((a, b) => {
      const timeA = a.timestamp?.seconds || 0
      const timeB = b.timestamp?.seconds || 0
      return timeB - timeA
    })
  }, [allLogs])

  return (
    <div className="space-y-6 md:space-y-12 pb-20 text-[#0F172A] text-left animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Security Monitor</span>
           </div>
          <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight">Audit Trail</h1>
          <p className="text-slate-500 text-[11px] md:text-lg font-medium">Detailed ledger of all institutional modifications and extraction activities.</p>
        </div>
        <Button variant="outline" className="h-11 md:h-14 px-8 rounded-full border-slate-200 bg-white font-black uppercase text-[10px] tracking-widest gap-2 shadow-sm text-[#0F172A]">
           <Download className="h-4 w-4" /> Export Ledger
        </Button>
      </div>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 text-left">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-14 md:h-20">
                <TableHead className="px-6 md:px-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Administrator</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Action</TableHead>
                <TableHead className="hidden md:table-cell text-[10px] font-black uppercase tracking-widest text-slate-400">Resource Context</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-50"><TableCell colSpan={4} className="px-6 py-6 md:px-12 md:py-8"><Skeleton className="h-10 w-full rounded-xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : logs && logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log.id} className="border-slate-50 hover:bg-slate-50 transition-colors group">
                    <TableCell className="px-6 md:px-12 py-5 md:py-8">
                       <div className="flex items-center gap-2 text-slate-500">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="text-[10px] md:text-xs font-bold tabular-nums">{log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleString() : "N/A"}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-3">
                          <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                             <User className="h-4 w-4 md:h-5 md:w-5" />
                          </div>
                          <p className="font-bold text-[#0F172A] text-xs md:text-sm truncate max-w-[120px]">{log.user || 'System'}</p>
                       </div>
                    </TableCell>
                    <TableCell>
                       <Badge className="bg-slate-100 text-slate-600 border-none uppercase text-[8px] md:text-[9px] font-black px-2 py-0.5 rounded-md">
                          {log.action}
                       </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-md">
                       <p className="text-[11px] font-medium text-slate-500 line-clamp-1">{log.details}</p>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                   <TableCell colSpan={4} className="h-60 md:h-80 text-center">
                      <div className="flex flex-col items-center justify-center opacity-10 space-y-4">
                         <Activity className="h-16 w-16 text-slate-400" />
                         <p className="font-black text-sm md:text-2xl uppercase tracking-widest">No Audit Entries</p>
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
