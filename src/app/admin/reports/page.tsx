
"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle2, Search, ExternalLink, Trash2, ShieldAlert, Clock, User } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function AdminReports() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const reportsQuery = useMemo(() => (db ? query(collection(db, "reports"), orderBy("timestamp", "desc")) : null), [db])
  const { data: reports, loading } = useCollection<any>(reportsQuery)

  const handleResolve = async (id: string) => {
    if (!db) return
    await updateDoc(doc(db, "reports", id), { status: 'RESOLVED' })
    toast({ title: "Audit Resolved", description: "The content report has been marked as audited and corrected." })
  }

  const handleDelete = async (id: string) => {
    if (!db || !confirm("Permanently delete this audit record?")) return
    await deleteDoc(doc(db, "reports", id))
    toast({ title: "Record Purged", description: "Report record removed from queue." })
  }

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="h-6 w-6 text-rose-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Quality Assurance Registry</span>
          </div>
          <h1 className="text-5xl font-black font-headline text-primary uppercase tracking-tight">Audit Queue</h1>
          <p className="text-muted-foreground mt-2 text-lg">Review and correct aspirant reports regarding institutional MCQ accuracy.</p>
        </div>
        <div className="flex gap-4">
           <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pending Audits</span>
              <span className="text-2xl font-headline font-black text-rose-500">{reports?.filter((r: any) => r.status === 'PENDING').length || 0}</span>
           </div>
        </div>
      </div>

      <Card className="border-foreground/5 bg-card/50 shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-white/5 h-16">
                <TableHead className="px-10 text-[10px] font-black uppercase tracking-[0.2em]">Aspirant & Issue</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em]">Institutional Comment</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em]">Context</TableHead>
                <TableHead className="text-right px-10 text-[10px] font-black uppercase tracking-[0.2em]">Audit Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={4} className="px-10 py-8"><Skeleton className="h-16 w-full rounded-2xl bg-white/5" /></TableCell></TableRow>
                ))
              ) : reports && reports.length > 0 ? (
                reports.map((r: any) => (
                  <TableRow key={r.id} className={`hover:bg-white/5 group border-white/5 transition-all duration-300 ${r.status === 'RESOLVED' ? 'opacity-40 grayscale' : ''}`}>
                    <TableCell className="px-10 py-10">
                       <div className="space-y-3">
                          <Badge className={`border-none text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                            r.type === 'WRONG_ANS' ? 'bg-rose-500/10 text-rose-500' :
                            r.type === 'TYPO' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
                          }`}>
                            {r.type?.replace('_', ' ') || 'Issue'}
                          </Badge>
                          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                             <User className="h-3 w-3" /> Aspirant {r.userId?.slice(-4)}
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                       <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/5 shadow-inner">
                          <p className="text-base font-medium text-slate-200 leading-relaxed italic">"{r.comment}"</p>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="space-y-4">
                          <Button variant="ghost" asChild className="h-12 px-6 rounded-xl gap-3 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-all border border-primary/10">
                             <Link href={`/admin/questions/add?id=${r.questionId}`}>
                                <ExternalLink className="h-4 w-4" /> Audit Global Bank
                             </Link>
                          </Button>
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                             <Clock className="h-3 w-3" /> {new Date(r.timestamp?.seconds * 1000).toLocaleString()}
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="text-right px-10">
                       <div className="flex justify-end gap-3 opacity-30 group-hover:opacity-100 transition-all duration-500">
                          {r.status === 'PENDING' && (
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-emerald-500 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20" onClick={() => handleResolve(r.id)}>
                               <CheckCircle2 className="h-6 w-6" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20" onClick={() => handleDelete(r.id)}>
                             <Trash2 className="h-6 w-6" />
                          </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                   <TableCell colSpan={4} className="h-80 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500 opacity-20">
                         <ShieldAlert className="h-24 w-24 mb-6" />
                         <p className="font-black font-headline text-2xl uppercase tracking-widest">Quality Standard High</p>
                         <p className="text-sm font-bold uppercase tracking-[0.2em] mt-2">Zero pending reports in global audit registry.</p>
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
