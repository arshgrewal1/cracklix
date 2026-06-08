
"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Clock, User, Activity, Filter, Download } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, limit } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

/**
 * @fileOverview Optimized Audit Trail Console.
 * PERFORMANCE: Removed server-side orderBy to prevent index requirements and bypass query deadlocks.
 */

export default function AuditLogsPage() {
  const db = useFirestore()
  const logsQuery = useMemo(() => (db ? query(collection(db, "audit_logs"), limit(50)) : null), [db])
  const { data: allLogs, loading } = useCollection<any>(logsQuery)

  const logs = useMemo(() => {
    if (!allLogs) return []
    return [...allLogs].sort((a, b) => {
      const timeA = a.timestamp?.seconds || 0
      const timeB = b.timestamp?.seconds || 0
      return timeB - timeA
    })
  }, [allLogs])

  return (
    <div className="space-y-12 text-[#0F172A]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Security & Integrity Monitor</span>
           </div>
          <h1 className="text-5xl font-black font-headline text-[#0F172A] uppercase tracking-tight">Audit Trail</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Detailed ledger of all institutional modifications and extraction activities.</p>
        </div>
        <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 bg-white font-black uppercase text-[10px] tracking-widest gap-3 shadow-sm text-[#0F172A]">
           <Download className="h-4 w-4" /> Export Ledger
        </Button>
      </div>

      <Card className="border-slate-100 shadow-3xl bg-white rounded-[3rem] overflow-hidden">
        <CardContent className="p-0 text-left">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-20">
                <TableHead className="px-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Timestamp</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Administrator</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Action Details</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Resource Context</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-50"><TableCell colSpan={4} className="px-12 py-8"><Skeleton className="h-12 w-full rounded-2xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : logs && logs.length > 0 ? (
                logs.map((log: any) => (
                  <TableRow key={log.id} className="border-slate-50 hover:bg-slate-50 transition-colors group">
                    <TableCell className="px-12 py-8">
                       <div className="flex items-center gap-3 text-slate-500">
                          <Clock className="h-4 w-4" />
                          <span className="text-xs font-bold">{new Date(log.timestamp?.seconds * 1000).toLocaleString()}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                             <User className="h-5 w-5" />
                          </div>
                          <p className="font-bold text-[#0F172A]">{log.adminName || 'System'}</p>
                       </div>
                    </TableCell>
                    <TableCell>
                       <Badge className="bg-slate-100 text-slate-600 border-none uppercase text-[9px] font-black px-3 py-1">
                          {log.action}
                       </Badge>
                    </TableCell>
                    <TableCell className="max-w-md">
                       <p className="text-xs font-medium text-slate-500 line-clamp-1">{log.details}</p>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                   <TableCell colSpan={4} className="h-80 text-center">
                      <div className="flex flex-col items-center justify-center opacity-20 space-y-4">
                         <Activity className="h-16 w-16 text-slate-400" />
                         <p className="font-black uppercase tracking-widest text-[10px] text-slate-500">No audit entries recorded in this cycle.</p>
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
