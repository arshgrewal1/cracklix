"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Edit, 
  Search, 
  RefreshCw,
  FileWarning,
  Layers,
  SearchCode,
  Archive,
  Rocket
} from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, deleteDoc, writeBatch, updateDoc } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors"

/**
 * @fileOverview Institutional Integrity & Cleanup Dashboard.
 * Features: Dummy Content Scanner, Duplicate Detection, and Review Queue.
 */

export default function QADashboard() {
  const db = useFirestore()
  const { toast } = useToast()
  const [isScanning, setIsScanning] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const { data: questions, loading: qLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "questions") : null), [db]))
  const { data: mocks, loading: mLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]))

  // AI-Driven Integrity Analysis
  const audit = useMemo(() => {
    if (!questions || !mocks) return { dummyMocks: [], brokenQuestions: [], orphanMocks: [], stats: { dummy: 0, critical: 0 } }

    const dummyKeywords = ["TEST", "DUMMY", "DEMO", "SAMPLE", "MOCK 1", "MOCK 2", "MOCK 3"];
    
    const dummyMocks = mocks.filter((m: any) => 
      dummyKeywords.some(kw => m.title?.toUpperCase().includes(kw)) ||
      m.isDummy === true ||
      !m.boardId ||
      !m.examId
    )

    const orphanMocks = mocks.filter((m: any) => 
      !m.questionIds || 
      m.questionIds.length === 0 ||
      m.questionIds.length !== m.totalQuestions
    )

    const brokenQuestions = questions.filter((q: any) => 
      !q.correctAnswer || 
      !q.questionEn || 
      dummyKeywords.some(kw => q.questionEn?.toUpperCase().includes(kw))
    )

    return {
      dummyMocks,
      brokenQuestions,
      orphanMocks,
      stats: {
        dummy: dummyMocks.length,
        critical: brokenQuestions.length + orphanMocks.length
      }
    }
  }, [questions, mocks])

  const handleBulkPurgeDummy = async () => {
    if (!db || audit.dummyMocks.length === 0) return
    if (!confirm(`CRITICAL AUDIT: Permanently purge ${audit.dummyMocks.length} dummy/demo mocks?`)) return
    
    setIsSyncing(true)
    const batch = writeBatch(db)
    audit.dummyMocks.forEach(m => {
       batch.delete(doc(db, "mocks", m.id))
    })

    try {
      await batch.commit()
      toast({ title: "Registry Cleaned", description: "All flagged dummy nodes successfully purged." })
    } catch (e) {
      toast({ variant: "destructive", title: "Audit Failed", description: "Cloud database rejected bulk purge." })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleMoveToReview = async (id: string, coll: string) => {
    if (!db) return
    const docRef = doc(db, coll, id)
    try {
      await updateDoc(docRef, { status: 'REVIEW', published: false })
      toast({ title: "Node Isolated", description: "Moved to Admin Review Queue." })
    } catch (e) {
      toast({ variant: "destructive", title: "Isolation Failed" })
    }
  }

  return (
    <div className="space-y-12 pb-20 text-[#0F172A] text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <ShieldAlert className="h-6 w-6 text-rose-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Integrity & Audit Hub</span>
           </div>
          <h1 className="text-5xl font-black font-headline text-[#0F172A] uppercase tracking-tight">System Cleanup</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Scan and isolate dummy, demo, or placeholder preparation nodes.</p>
        </div>
        <div className="flex gap-4">
           <Button 
             onClick={handleBulkPurgeDummy} 
             disabled={isSyncing || audit.dummyMocks.length === 0}
             className="bg-rose-600 hover:bg-rose-700 text-white h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 shadow-2xl"
           >
              <Trash2 className="h-5 w-5" /> Purge All Dummy Nodes
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
         <QAStatCard label="Dummy Detections" value={audit.stats.dummy} color="text-rose-600" desc="Flagged based on Demo/Test keywords" />
         <QAStatCard label="Orphan Series" value={audit.orphanMocks.length} color="text-orange-600" desc="Mocks with zero linked questions" />
         <QAStatCard label="Bank Integrity" value={`${questions && questions.length > 0 ? Math.round(((questions.length - audit.brokenQuestions.length) / questions.length) * 100) : 100}%`} color="text-emerald-600" desc="Validated high-fidelity MCQ nodes" />
      </div>

      <div className="space-y-12 px-4">
         <section className="space-y-6">
            <h3 className="text-2xl font-headline font-black uppercase flex items-center gap-4">
               <Archive className="h-6 w-6 text-rose-600" /> Dummy & Demo Review Queue
            </h3>
            <Card className="border-slate-100 shadow-3xl bg-white rounded-[2.5rem] overflow-hidden">
               <Table>
                  <TableHeader className="bg-slate-50/50">
                     <TableRow className="border-slate-50 h-16">
                        <TableHead className="px-10 text-[10px] font-black uppercase text-slate-500">Resource Title</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-center text-slate-500">Anomaly Type</TableHead>
                        <TableHead className="text-right px-10 text-[10px] font-black uppercase text-slate-500">Isolation Action</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {mLoading ? (
                        <TableRow><TableCell colSpan={3} className="p-10"><Skeleton className="h-12 w-full rounded-xl" /></TableCell></TableRow>
                     ) : audit.dummyMocks.length > 0 ? (
                        audit.dummyMocks.map((m: any) => (
                           <TableRow key={m.id} className="border-slate-50 hover:bg-slate-50 transition-colors group">
                              <TableCell className="px-10 py-6 text-left">
                                 <p className="font-bold text-[#000000] uppercase">{m.title || "Untitled Blueprint"}</p>
                                 <code className="text-[9px] text-slate-400 font-mono">{m.boardId} • {m.examId}</code>
                              </TableCell>
                              <TableCell className="text-center">
                                 <Badge className="bg-rose-50 text-rose-600 border-none px-4 py-1 text-[9px] uppercase font-black">
                                    {m.isDummy ? 'MANUAL_DUMMY' : 'KEYWORD_FLAG'}
                                 </Badge>
                              </TableCell>
                              <TableCell className="text-right px-10">
                                 <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-all">
                                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600" asChild>
                                       <Link href={`/admin/mocks/builder?id=${m.id}`}><Edit className="h-4 w-4" /></Link>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-orange-50 text-orange-600" onClick={() => handleMoveToReview(m.id, 'mocks')}>
                                       <Archive className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600" onClick={() => handleMoveToReview(m.id, 'mocks')}>
                                       <Trash2 className="h-4 w-4" />
                                    </Button>
                                 </div>
                              </TableCell>
                           </TableRow>
                        ))
                     ) : (
                        <TableRow><TableCell colSpan={3} className="h-40 text-center opacity-30 italic font-black uppercase text-[10px]">Zero dummy nodes detected in active registry.</TableCell></TableRow>
                     )}
                  </TableBody>
               </Table>
            </Card>
         </section>
      </div>
    </div>
  )
}

function QAStatCard({ label, value, color, desc }: any) {
   return (
      <Card className="border-slate-100 bg-white rounded-[2.5rem] p-10 shadow-2xl text-left">
         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">{label}</p>
         <h4 className={`text-6xl font-headline font-black tracking-tighter ${color} leading-none`}>{value}</h4>
         <p className="text-xs font-bold text-slate-500 mt-5 leading-relaxed">{desc}</p>
      </Card>
   )
}
