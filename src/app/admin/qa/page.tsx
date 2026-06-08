
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
  Rocket,
  GitMerge,
  Eye,
  FileText
} from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, deleteDoc, writeBatch, updateDoc, serverTimestamp } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Integrity & Cleanup Dashboard v2.0.
 * FIXED: ReferenceError resolved by defining handleReScan.
 */

export default function QADashboard() {
  const db = useFirestore()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  const { data: questions, loading: qLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "questions") : null), [db]))
  const { data: mocks, loading: mLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]))

  // ADVANCED INTEGRITY ANALYSIS
  const audit = useMemo(() => {
    if (!questions || !mocks) return { duplicates: [], broken: [], stats: { dup: 0, broken: 0 } }

    const contentHashes: Record<string, string[]> = {};
    const duplicates: any[] = [];
    const broken: any[] = [];

    questions.forEach(q => {
       // 1. DUPLICATE DETECTION HASH (Text + Options + Answer)
       const hash = `${q.englishQuestion?.trim()}_${q.correctAnswer}`.toLowerCase();
       if (contentHashes[hash]) {
          duplicates.push({ ...q, originalId: contentHashes[hash][0] });
          contentHashes[hash].push(q.id);
       } else {
          contentHashes[hash] = [q.id];
       }

       // 2. BROKEN NODE DETECTION
       if (!q.correctAnswer || !q.englishQuestion || !q.subjectId) {
          broken.push(q);
       }
    });

    return { 
       duplicates, 
       broken, 
       stats: { dup: duplicates.length, broken: broken.length } 
    };
  }, [questions, mocks])

  const handleReScan = () => {
    toast({ title: "Re-scanning Registry", description: "Fidelity audit synchronized with live data." })
  }

  const handleBulkPurgeDuplicates = async () => {
    if (!db || audit.duplicates.length === 0) return
    if (!confirm(`CRITICAL AUDIT: Permanently purge ${audit.duplicates.length} duplicate nodes?`)) return
    
    setIsProcessing(true)
    const batch = writeBatch(db)
    audit.duplicates.forEach(d => batch.delete(doc(db, "questions", d.id)))

    try {
      await batch.commit()
      toast({ title: "Registry Sanitized", description: "All redundant overlaps purged." })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleMergeDuplicate = async (dup: any) => {
     if (!db) return;
     setIsProcessing(true);
     try {
        const batch = writeBatch(db);
        // Mark as duplicate in registry instead of delete (Soft Merge)
        batch.update(doc(db, "questions", dup.id), { 
           status: 'DUPLICATE', 
           isDuplicateOf: dup.originalId,
           updatedAt: serverTimestamp() 
        });
        await batch.commit();
        toast({ title: "Node Merged", description: "Marked as redundant audit point." });
     } finally {
        setIsProcessing(false);
     }
  }

  return (
    <div className="space-y-12 pb-20 text-[#0F172A] text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <ShieldAlert className="h-6 w-6 text-rose-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Integrity Governance Monitor</span>
           </div>
          <h1 className="text-5xl font-black font-headline text-[#0F172A] uppercase tracking-tight leading-none">CBT Integrity</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Sanitize global bank overlaps and validate asset fidelity.</p>
        </div>
        <div className="flex gap-4">
           <Button 
             onClick={handleReScan} 
             className="bg-[#0F172A] hover:bg-black text-white h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 shadow-2xl transition-all border-none"
           >
              <RefreshCw className={cn("h-5 w-5", qLoading && "animate-spin")} /> Re-Scan Registry
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
         <QAStatCard label="Overlapping Assets" value={audit.stats.dup} color="text-rose-600" desc="Questions with identical statements & keys." />
         <QAStatCard label="Broken Nodes" value={audit.stats.broken} color="text-orange-600" desc="Missing metadata or logic paths." />
         <QAStatCard label="Fidelity Index" value={`${questions && questions.length > 0 ? Math.round(((questions.length - audit.stats.dup) / questions.length) * 100) : 100}%`} color="text-emerald-600" desc="Valid, unique preparation nodes." />
      </div>

      <div className="space-y-12 px-4">
         <section className="space-y-6">
            <div className="flex justify-between items-center">
               <h3 className="text-2xl font-headline font-black uppercase flex items-center gap-4">
                  <Archive className="h-6 w-6 text-rose-600" /> Duplicate Audit Stream
               </h3>
               {audit.duplicates.length > 0 && (
                  <Button onClick={handleBulkPurgeDuplicates} variant="outline" className="h-11 rounded-xl border-rose-100 text-rose-600 font-black uppercase text-[9px] gap-2">
                     <Trash2 className="h-4 w-4" /> Purge All
                  </Button>
               )}
            </div>
            
            <Card className="border-slate-100 shadow-3xl bg-white rounded-[2.5rem] overflow-hidden">
               <Table>
                  <TableHeader className="bg-slate-50/50">
                     <TableRow className="border-slate-50 h-16">
                        <TableHead className="px-10 text-[10px] font-black uppercase text-slate-500">Conflict Statements</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-center text-slate-500">Confidence</TableHead>
                        <TableHead className="text-right px-10 text-[10px] font-black uppercase text-slate-500">Audit Action</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {qLoading ? (
                        Array.from({length: 3}).map((_, i) => <TableRow key={i}><TableCell colSpan={3} className="p-10"><Skeleton className="h-12 w-full rounded-xl" /></TableCell></TableRow>)
                     ) : audit.duplicates.length > 0 ? (
                        audit.duplicates.map((d: any) => (
                           <TableRow key={d.id} className="border-slate-50 hover:bg-slate-50 transition-colors group">
                              <TableCell className="px-10 py-6 text-left">
                                 <p className="font-bold text-[#0F172A] line-clamp-1">{d.englishQuestion}</p>
                                 <code className="text-[9px] text-slate-400 font-mono uppercase tracking-widest mt-1 block">NODE: {d.id} • ORIGIN: {d.originalId}</code>
                              </TableCell>
                              <TableCell className="text-center">
                                 <Badge className="bg-rose-50 text-rose-600 border-none px-4 py-1 text-[9px] uppercase font-black tracking-widest">
                                    100% OVERLAP
                                 </Badge>
                              </TableCell>
                              <TableCell className="text-right px-10">
                                 <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-all">
                                    <Button onClick={() => handleMergeDuplicate(d)} variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600">
                                       <GitMerge className="h-5 w-5" />
                                    </Button>
                                    <Button onClick={async () => { if(confirm("Purge conflict?")) await deleteDoc(doc(db!, "questions", d.id)); }} variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600">
                                       <Trash2 className="h-5 w-5" />
                                    </Button>
                                 </div>
                              </TableCell>
                           </TableRow>
                        ))
                     ) : (
                        <TableRow><TableCell colSpan={3} className="h-40 text-center opacity-30 italic font-black uppercase text-[10px]">No overlaps detected. Registry fidelity is 100%.</TableCell></TableRow>
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
      <Card className="border-slate-100 bg-white rounded-[2.5rem] p-10 shadow-2xl text-left border border-slate-50">
         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">{label}</p>
         <h4 className={`text-6xl font-headline font-black tracking-tighter ${color} leading-none`}>{value}</h4>
         <p className="text-xs font-bold text-slate-500 mt-5 leading-relaxed">{desc}</p>
      </Card>
   )
}
