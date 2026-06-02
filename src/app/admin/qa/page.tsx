
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
  SearchCode
} from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, deleteDoc } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

/**
 * @fileOverview Phase 55: Institutional QA & Testing Dashboard.
 * Scans for broken links, missing content, and data quality issues.
 */

export default function QADashboard() {
  const db = useFirestore()
  const { toast } = useToast()
  const [isScanning, setIsScanning] = useState(false)

  const { data: questions, loading: qLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "questions") : null), [db]))
  const { data: mocks, loading: mLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]))

  const issues = useMemo(() => {
    if (!questions || !mocks) return { brokenQuestions: [], brokenMocks: [], stats: { total: 0, critical: 0 } }

    const brokenQuestions = questions.filter((q: any) => 
      !q.correctAnswer || 
      !q.questionEn || 
      !q.optionAEn || 
      !q.explanationEn ||
      (q.questionPa && !q.optionAPa) // Partial bilingual check
    )

    const brokenMocks = mocks.filter((m: any) => 
      !m.questionIds || 
      m.questionIds.length === 0 || 
      m.questionIds.length !== m.totalQuestions ||
      m.questionIds.some((id: string) => !questions.find(q => q.id === id))
    )

    return {
      brokenQuestions,
      brokenMocks,
      stats: {
        total: brokenQuestions.length + brokenMocks.length,
        critical: brokenQuestions.length
      }
    }
  }, [questions, mocks])

  const handleRunScan = () => {
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      toast({ title: "Scan Complete", description: `Detected ${issues.stats.total} institutional integrity issues.` })
    }, 1500)
  }

  const handleDelete = async (coll: string, id: string) => {
    if (!confirm("Permanently purge this broken asset?")) return
    await deleteDoc(doc(db, coll, id))
    toast({ title: "Asset Purged", description: "Repository cleaned successfully." })
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <ShieldAlert className="h-6 w-6 text-rose-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Quality Assurance Engine</span>
           </div>
          <h1 className="text-5xl font-black font-headline text-primary uppercase tracking-tight">Audit Console</h1>
          <p className="text-muted-foreground mt-2 text-lg">Systematic scan for broken MCQs, incomplete mocks, and pattern mismatches.</p>
        </div>
        <Button 
          onClick={handleRunScan} 
          disabled={isScanning}
          className="bg-primary hover:bg-primary/90 h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 shadow-2xl shadow-primary/20"
        >
          <RefreshCw className={`h-5 w-5 ${isScanning ? 'animate-spin' : ''}`} /> {isScanning ? "Scanning Repo..." : "Run Integrity Scan"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <QAStatCard label="Critical Errors" value={issues.stats.critical} color="text-rose-500" desc="Questions missing core metadata" />
         <QAStatCard label="Broken Mocks" value={issues.brokenMocks.length} color="text-orange-500" desc="Mocks with missing references" />
         <QAStatCard label="Overall Health" value={`${questions ? Math.round(((questions.length - issues.stats.critical) / questions.length) * 100) : 0}%`} color="text-emerald-500" desc="Repository content integrity score" />
      </div>

      <div className="space-y-10">
         <section className="space-y-6">
            <h3 className="text-2xl font-headline font-black uppercase flex items-center gap-4">
               <AlertTriangle className="h-6 w-6 text-rose-500" /> Broken Question Node
            </h3>
            <Card className="border-none shadow-3xl bg-card/50 rounded-[2.5rem] overflow-hidden">
               <Table>
                  <TableHeader className="bg-muted/30">
                     <TableRow className="border-white/5 h-16">
                        <TableHead className="px-10 text-[10px] font-black uppercase">Question Statement</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-center">Missing Data</TableHead>
                        <TableHead className="text-right px-10 text-[10px] font-black uppercase">Action</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {qLoading ? (
                        <TableRow><TableCell colSpan={3} className="p-10"><Skeleton className="h-12 w-full rounded-xl bg-white/5" /></TableCell></TableRow>
                     ) : issues.brokenQuestions.length > 0 ? (
                        issues.brokenQuestions.map((q: any) => (
                           <TableRow key={q.id} className="border-white/5 hover:bg-white/5 transition-colors">
                              <TableCell className="px-10 py-6 max-w-md">
                                 <p className="font-bold text-slate-100 line-clamp-1">{q.questionEn || "Untitled Content"}</p>
                                 <code className="text-[9px] text-slate-500 font-mono">UUID: {q.id}</code>
                              </TableCell>
                              <TableCell className="text-center">
                                 <div className="flex flex-wrap justify-center gap-2">
                                    {!q.correctAnswer && <Badge className="bg-rose-500/10 text-rose-500 border-none text-[8px]">No Answer</Badge>}
                                    {!q.explanationEn && <Badge className="bg-orange-500/10 text-orange-500 border-none text-[8px]">No Rationale</Badge>}
                                    {!q.questionPa && <Badge className="bg-blue-500/10 text-blue-500 border-none text-[8px]">No Punjabi</Badge>}
                                 </div>
                              </TableCell>
                              <TableCell className="text-right px-10">
                                 <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5" asChild>
                                       <Link href={`/admin/questions/add?id=${q.id}`}><Edit className="h-4 w-4" /></Link>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-500/10 hover:text-rose-500" onClick={() => handleDelete('questions', q.id)}>
                                       <Trash2 className="h-4 w-4" />
                                    </Button>
                                 </div>
                              </TableCell>
                           </TableRow>
                        ))
                     ) : (
                        <TableRow><TableCell colSpan={3} className="h-40 text-center opacity-30 italic">No broken questions detected in registry.</TableCell></TableRow>
                     )}
                  </TableBody>
               </Table>
            </Card>
         </section>

         <section className="space-y-6">
            <h3 className="text-2xl font-headline font-black uppercase flex items-center gap-4">
               <FileWarning className="h-6 w-6 text-orange-500" /> Series Pattern Failures
            </h3>
            <Card className="border-none shadow-3xl bg-card/50 rounded-[2.5rem] overflow-hidden">
               <Table>
                  <TableHeader className="bg-muted/30">
                     <TableRow className="border-white/5 h-16">
                        <TableHead className="px-10 text-[10px] font-black uppercase">Series Title</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-center">Audit Result</TableHead>
                        <TableHead className="text-right px-10 text-[10px] font-black uppercase">Action</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {mLoading ? (
                        <TableRow><TableCell colSpan={3} className="p-10"><Skeleton className="h-12 w-full rounded-xl bg-white/5" /></TableCell></TableRow>
                     ) : issues.brokenMocks.length > 0 ? (
                        issues.brokenMocks.map((m: any) => (
                           <TableRow key={m.id} className="border-white/5 hover:bg-white/5 transition-colors">
                              <TableCell className="px-10 py-6">
                                 <p className="font-bold text-slate-100">{m.title}</p>
                                 <code className="text-[9px] text-slate-500 font-mono">{m.boardId} • {m.examId}</code>
                              </TableCell>
                              <TableCell className="text-center">
                                 <Badge className="bg-rose-500/20 text-rose-500 border-none px-4 py-1 text-[9px] uppercase font-black">
                                    {m.questionIds?.length || 0} / {m.totalQuestions} Questions Linked
                                 </Badge>
                              </TableCell>
                              <TableCell className="text-right px-10">
                                 <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5" asChild>
                                       <Link href={`/admin/mocks/builder?id=${m.id}`}><Edit className="h-4 w-4" /></Link>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-500/10 hover:text-rose-500" onClick={() => handleDelete('mocks', m.id)}>
                                       <Trash2 className="h-4 w-4" />
                                    </Button>
                                 </div>
                              </TableCell>
                           </TableRow>
                        ))
                     ) : (
                        <TableRow><TableCell colSpan={3} className="h-40 text-center opacity-30 italic">All mock series passed the structural audit.</TableCell></TableRow>
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
      <Card className="border-none bg-card/40 rounded-[2.5rem] p-10 shadow-2xl">
         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">{label}</p>
         <h4 className={`text-6xl font-headline font-black tracking-tighter ${color} leading-none`}>{value}</h4>
         <p className="text-xs font-bold text-slate-400 mt-5 leading-relaxed">{desc}</p>
      </Card>
   )
}
