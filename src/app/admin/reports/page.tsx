
"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle2, Search, ExternalLink, Trash2, ShieldAlert } from "lucide-react"
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
    toast({ title: "Resolved", description: "Report marked as audited." })
  }

  const handleDelete = async (id: string) => {
    if (!db || !confirm("Delete this report?")) return
    await deleteDoc(doc(db, "reports", id))
    toast({ title: "Deleted", description: "Report record removed." })
  }

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="h-5 w-5 text-rose-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Quality Assurance Engine</span>
          </div>
          <h1 className="text-4xl font-black font-headline text-primary uppercase tracking-tight">Audit Queue</h1>
          <p className="text-muted-foreground mt-1">Review student reports regarding incorrect answers or typos in the question bank.</p>
        </div>
      </div>

      <Card className="border-foreground/5 bg-card/50 shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-white/5">
                <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Issue Type</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Student Comment</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Question Ref</TableHead>
                <TableHead className="text-right px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={4} className="px-8"><Skeleton className="h-14 w-full rounded-xl bg-white/5" /></TableCell></TableRow>
                ))
              ) : reports && reports.length > 0 ? (
                reports.map((r: any) => (
                  <TableRow key={r.id} className={`hover:bg-white/5 group border-white/5 transition-colors ${r.status === 'RESOLVED' ? 'opacity-40' : ''}`}>
                    <TableCell className="px-8 py-6">
                       <Badge className={`border-none text-[8px] font-black uppercase ${
                         r.type === 'WRONG_ANS' ? 'bg-rose-500/10 text-rose-500' :
                         r.type === 'TYPO' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
                       }`}>
                         {r.type?.replace('_', ' ') || 'Issue'}
                       </Badge>
                       <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase">{new Date(r.timestamp?.seconds * 1000).toLocaleDateString()}</p>
                    </TableCell>
                    <TableCell className="max-w-md">
                       <p className="text-sm font-medium text-slate-200 leading-relaxed italic">"{r.comment}"</p>
                    </TableCell>
                    <TableCell>
                       <Button variant="ghost" asChild className="h-9 px-4 rounded-xl gap-2 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/10">
                          <Link href={`/admin/questions/add?id=${r.questionId}`}>
                             <ExternalLink className="h-3 w-3" /> Audit MCQ
                          </Link>
                       </Button>
                    </TableCell>
                    <TableCell className="text-right px-8">
                       <div className="flex justify-end gap-2 opacity-30 group-hover:opacity-100 transition-all">
                          {r.status === 'PENDING' && (
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-emerald-500 hover:bg-emerald-500/10" onClick={() => handleResolve(r.id)}>
                               <CheckCircle2 className="h-5 w-5" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-rose-500 hover:bg-rose-500/10" onClick={() => handleDelete(r.id)}>
                             <Trash2 className="h-5 w-5" />
                          </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                   <TableCell colSpan={4} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500 opacity-20">
                         <CheckCircle2 className="h-12 w-12 mb-4" />
                         <p className="font-black font-headline text-lg">No Pending Reports</p>
                         <p className="text-xs uppercase tracking-widest font-black">Question bank is clean.</p>
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
