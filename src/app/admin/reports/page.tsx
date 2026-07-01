"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle2, ExternalLink, Trash2, ShieldAlert, Clock, User, Layers } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Audit Reports Hub v14.0 (PWA Optimized).
 * PWA SYNC: Removed uppercase, reduced font scales, and implemented high-density Title Case.
 */

export default function AdminReports() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const reportsQuery = useMemo(() => (db ? query(collection(db, "reports")) : null), [db])
  const { data: allReports, loading } = useCollection<any>(reportsQuery)

  const reports = useMemo(() => {
    if (!allReports) return []
    return [...allReports].sort((a: any, b: any) => {
      const timeA = a.timestamp?.seconds || 0
      const timeB = b.timestamp?.seconds || 0
      return timeB - timeA
    })
  }, [allReports])

  const handleResolve = async (id: string) => {
    if (!db) return
    const docRef = doc(db, "reports", id)
    updateDoc(docRef, { status: 'RESOLVED' })
      .then(() => {
        toast({ title: "Audit Resolved" })
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: { status: 'RESOLVED' }
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  const handleDelete = async (id: string) => {
    if (!db || !confirm("Permanently purge this audit record?")) return
    const docRef = doc(db, "reports", id)
    deleteDoc(docRef)
      .then(() => {
        toast({ title: "Record Purged" })
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  return (
    <div className="space-y-6 md:space-y-12 text-[#0F172A] text-left animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="h-4 w-4 text-rose-500" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Quality Assurance Registry</span>
           </div>
          <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight">Audit Queue</h1>
          <p className="text-slate-500 text-[11px] md:text-lg font-medium">Reviewing {reports?.filter((r: any) => r.status === 'PENDING').length || 0} active student flags.</p>
        </div>
      </div>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 text-left overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-14 md:h-20">
                <TableHead className="px-6 md:px-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Aspirant & Issue</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Comment</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Registry Context</TableHead>
                <TableHead className="text-right px-6 md:px-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-50"><TableCell colSpan={4} className="px-6 py-6 md:px-12 md:py-10"><Skeleton className="h-10 w-full rounded-xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : reports && reports.length > 0 ? (
                reports.map((r: any) => (
                  <TableRow key={r.id} className={cn("border-slate-50 hover:bg-slate-50 transition-colors group", r.status === 'RESOLVED' && "opacity-40 grayscale")}>
                    <TableCell className="px-6 md:px-12 py-5 md:py-10">
                       <div className="space-y-3">
                          <Badge className={cn(
                            "border-none text-[8px] md:text-[9px] font-black uppercase px-2.5 py-0.5 rounded shadow-sm",
                            r.type === 'WRONG_ANS' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                          )}>
                            {r.type?.replace('_', ' ') || 'Audit Node'}
                          </Badge>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                             <User className="h-3 w-3" /> Node: {r.userId?.slice(-6)}
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="max-w-xs md:max-w-md">
                       <div className="bg-slate-50 p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-100 shadow-inner">
                          <p className="text-xs md:text-base font-medium text-slate-600 italic leading-relaxed">&quot;{r.comment}&quot;</p>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="space-y-4">
                          <Button variant="ghost" asChild className="h-9 md:h-11 px-4 md:px-6 rounded-full border border-slate-200 bg-white font-black uppercase text-[8px] md:text-[10px] tracking-widest gap-2 shadow-sm">
                             <Link href={`/admin/questions/add?id=${r.questionId}`}><ExternalLink className="h-3 w-3" /> Audit Registry</Link>
                          </Button>
                          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-300 tabular-nums">
                             <Clock className="h-3 w-3" /> {new Date(r.timestamp?.seconds * 1000).toLocaleDateString()}
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="text-right px-6 md:px-12">
                       <div className="flex justify-end gap-2 md:gap-3 opacity-20 group-hover:opacity-100 transition-all">
                          {r.status === 'PENDING' && (
                            <button onClick={() => handleResolve(r.id)} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 active:scale-90 transition-all">
                               <CheckCircle2 className="h-5 w-5" />
                            </button>
                          )}
                          <button onClick={() => handleDelete(r.id)} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all">
                             <Trash2 className="h-5 w-5" />
                          </button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                   <TableCell colSpan={4} className="h-60 md:h-80 text-center">
                      <div className="flex flex-col items-center justify-center opacity-10 space-y-4">
                         <ShieldAlert className="h-16 w-16 md:h-24 md:w-24 text-slate-400" />
                         <p className="font-black text-sm md:text-2xl uppercase tracking-widest">Registry Secured</p>
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
