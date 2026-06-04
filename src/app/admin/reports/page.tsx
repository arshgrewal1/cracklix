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

/**
 * @fileOverview Institutional Content Audit Node.
 * Standardised to high-contrast Navy/White theme for readability.
 * Fixed: Removed orderBy to prevent index errors, handling sorting client-side.
 */

export default function AdminReports() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const reportsQuery = useMemo(() => (db ? query(collection(db, "reports")) : null), [db])
  const { data: allReports, loading } = useCollection<any>(reportsQuery)

  const reports = useMemo(() => {
    if (!allReports) return []
    return [...allReports].sort((a, b) => {
      const timeA = a.timestamp?.seconds || 0
      const timeB = b.timestamp?.seconds || 0
      return timeB - timeA
    })
  }, [allReports])

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
    <div className="space-y-12 text-[#0F172A]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="h-6 w-6 text-rose-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Quality Assurance Registry</span>
          </div>
          <h1 className="text-5xl font-black font-headline text-[#0F172A] uppercase tracking-tight">Audit Queue</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Review and correct aspirant reports regarding institutional MCQ accuracy.</p>
        </div>
        <div className="flex gap-4">
           <div className="px-8 py-4 bg-white border border-slate-100 rounded-[1.5rem] flex items-center gap-6 shadow-xl">
              <div className="space-y-0.5 text-left">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">Pending Audits</span>
                 <p className="text-4xl font-headline font-black text-rose-600 leading-none">{reports?.filter((r: any) => r.status === 'PENDING').length || 0}</p>
              </div>
              <div className="h-10 w-px bg-slate-100" />
              <Layers className="h-8 w-8 text-slate-200" />
           </div>
        </div>
      </div>

      <Card className="border-slate-100 shadow-2xl bg-white rounded-[3.5rem] overflow-hidden">
        <CardContent className="p-0 text-left">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-20">
                <TableHead className="px-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Aspirant & Issue</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Institutional Comment</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Operational Context</TableHead>
                <TableHead className="text-right px-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Audit Control</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={4} className="px-12 py-10"><Skeleton className="h-20 w-full rounded-[2rem] bg-slate-50" /></TableCell></TableRow>
                ))
              ) : reports && reports.length > 0 ? (
                reports.map((r: any) => (
                  <TableRow key={r.id} className={`hover:bg-slate-50 group border-slate-50 transition-all duration-500 ${r.status === 'RESOLVED' ? 'opacity-40 grayscale-[0.8]' : ''}`}>
                    <TableCell className="px-12 py-12">
                       <div className="space-y-4">
                          <Badge className={`border-none text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-xl shadow-lg ${
                            r.type === 'WRONG_ANS' ? 'bg-rose-50 text-rose-600' :
                            r.type === 'TYPO' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {r.type?.replace('_', ' ') || 'Audit Flag'}
                          </Badge>
                          <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                             <User className="h-4 w-4 text-primary" /> Aspirant NODE: {r.userId?.slice(-6)}
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="max-w-md py-12">
                       <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner">
                          <p className="text-lg font-medium text-slate-600 leading-relaxed italic antialiased text-left">"{r.comment}"</p>
                       </div>
                    </TableCell>
                    <TableCell className="py-12 text-left">
                       <div className="space-y-6">
                          <Button variant="ghost" asChild className="h-14 px-8 rounded-2xl gap-4 text-[11px] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary/5 transition-all border-2 border-primary/10 shadow-sm">
                             <Link href={`/admin/questions/add?id=${r.questionId}`}>
                                <ExternalLink className="h-5 w-5" /> Audit Global Repository
                             </Link>
                          </Button>
                          <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                             <Clock className="h-4 w-4" /> {new Date(r.timestamp?.seconds * 1000).toLocaleString()}
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="text-right px-12 py-12">
                       <div className="flex justify-end gap-4 opacity-30 group-hover:opacity-100 transition-all duration-700">
                          {r.status === 'PENDING' && (
                            <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl text-emerald-600 hover:bg-emerald-50 shadow-sm" onClick={() => handleResolve(r.id)}>
                               <CheckCircle2 className="h-7 w-7" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl text-rose-600 hover:bg-rose-50 shadow-sm" onClick={() => handleDelete(r.id)}>
                             <Trash2 className="h-7 w-7" />
                          </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                   <TableCell colSpan={4} className="h-[450px] text-center">
                      <div className="flex flex-col items-center justify-center text-slate-300 opacity-20 text-center">
                         <ShieldAlert className="h-32 w-32 mb-10" />
                         <p className="font-black font-headline text-3xl uppercase tracking-[0.2em]">Institutional Integrity High</p>
                         <p className="text-lg font-bold uppercase tracking-[0.3em] mt-4">Zero pending flags in the global audit registry.</p>
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