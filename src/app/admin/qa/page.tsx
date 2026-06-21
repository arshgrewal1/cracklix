"use client"

import React, { useMemo, useState, isValidElement, cloneElement, ReactElement } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  ShieldAlert, 
  Trash2, 
  RefreshCw,
  Archive,
  GitMerge,
  Activity,
  Zap,
  Loader2
} from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, doc, writeBatch, serverTimestamp, deleteDoc, setDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors"
import { cn } from "@/lib/utils"
import type { Question } from "@/types"

/**
 * @fileOverview Hardened CBT Integrity Hub v17.1.
 * FIXED: React.cloneElement typed correctly to resolve TS2769.
 */

interface QAStatCardProps {
  label: string;
  value: string | number;
  color: string;
  desc: string;
  icon: React.ReactNode;
  className?: string;
}

export default function QADashboard() {
  const db = useFirestore()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  const { data: questions, loading: qLoading } = useCollection<Question>(useMemo(() => (db ? collection(db, "questions") : null), [db]) as any)

  const audit = useMemo(() => {
    if (!questions) return { duplicates: [], broken: [], stats: { dup: 0, broken: 0 } }

    const contentHashes: Record<string, string[]> = {};
    const duplicates: any[] = [];
    const broken: any[] = [];

    questions.forEach((q: Question) => {
       const hash = `${(q.englishQuestion || "").trim()}_${q.correctAnswer}`.toLowerCase();
       if (contentHashes[hash]) {
          duplicates.push({ ...q, originalId: contentHashes[hash][0] });
          contentHashes[hash].push(q.id);
       } else {
          contentHashes[hash] = [q.id];
       }

       if (!q.correctAnswer || !q.englishQuestion || !q.subjectId) {
          broken.push(q);
       }
    });

    return { 
       duplicates, 
       broken, 
       stats: { dup: duplicates.length, broken: broken.length } 
    };
  }, [questions])

  const handleReScan = () => {
    toast({ title: "Audit Synchronized", description: "Registry fidelity check complete." })
  }

  const handleBulkPurgeDuplicates = () => {
    if (!db || audit.duplicates.length === 0) return
    if (!confirm(`Permanently purge ${audit.duplicates.length} duplicate nodes?`)) return
    
    setIsProcessing(true)
    const batch = writeBatch(db)
    audit.duplicates.forEach((d: any) => batch.delete(doc(db, "questions", d.id)))

    batch.commit()
      .then(() => {
        toast({ title: "Registry Sanitized", description: "All redundant overlaps purged." })
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: 'questions/bulk_delete',
          operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsProcessing(false)
      })
  }

  const handleDeleteNode = (id: string) => {
    if (!db) return
    if (!confirm("Permanently purge this conflict node?")) return

    const nodeRef = doc(db, "questions", id)
    deleteDoc(nodeRef)
      .then(() => {
        toast({ title: "Node Purged" })
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: nodeRef.path,
          operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
  }

  const handleMergeDuplicate = (dup: any) => {
     if (!db) return;
     const nodeRef = doc(db, "questions", dup.id)
     const payload = { 
        status: 'DUPLICATE' as any, 
        isDuplicateOf: dup.originalId,
        updatedAt: serverTimestamp() 
     };

     setDoc(nodeRef, payload, { merge: true })
        .then(() => {
           toast({ title: "Node Merged", description: "Marked as redundant audit point." });
        })
        .catch(async (serverError) => {
           const permissionError = new FirestorePermissionError({
              path: nodeRef.path,
              operation: 'update',
              requestResourceData: payload,
           } satisfies SecurityRuleContext);
           errorEmitter.emit('permission-error', permissionError);
        });
  }

  return (
    <div className="space-y-6 md:space-y-12 pb-20 text-[#0F172A] text-left animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="h-4 w-4 text-rose-500" />
              <span className="text-[9px] font-black tracking-[0.1em] text-slate-400">Integrity Governance Monitor</span>
           </div>
          <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight">CBT Integrity</h1>
          <p className="text-slate-500 text-[11px] md:text-lg font-medium leading-tight">Sanitize global bank overlaps and validate asset fidelity.</p>
        </div>
        <Button 
          onClick={handleReScan} 
          disabled={qLoading}
          className="w-full md:w-auto h-11 md:h-14 px-8 bg-primary hover:bg-blue-700 text-white rounded-full font-black text-[10px] tracking-widest shadow-xl border-none transition-all active:scale-95 gap-3"
        >
          {qLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Re-Scan Registry
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 px-1">
         <QAStatCard label="Overlapping Assets" value={audit.stats.dup} color="text-rose-600" desc="Identical statements" icon={<Archive />} />
         <QAStatCard label="Broken Nodes" value={audit.stats.broken} color="text-orange-600" desc="Missing metadata" icon={<Activity />} />
         <QAStatCard label="Fidelity Index" value={`${questions && questions.length > 0 ? Math.round(((questions.length - audit.stats.dup) / questions.length) * 100) : 100}%`} color="text-emerald-600" desc="Unique nodes" icon={<Zap />} className="hidden md:block" />
      </div>

      <div className="space-y-6 md:space-y-12 px-1">
         <section className="space-y-6">
            <div className="flex justify-between items-center px-1">
               <div className="flex items-center gap-3">
                  <Archive className="h-5 w-5 text-rose-500" />
                  <h3 className="text-lg md:text-3xl font-black text-[#0F172A]">Duplicate Audit Stream</h3>
               </div>
               {audit.duplicates.length > 0 && (
                  <Button onClick={handleBulkPurgeDuplicates} disabled={isProcessing} variant="outline" className="h-10 rounded-full border-rose-100 text-rose-600 font-black text-[9px] gap-2 px-6 hover:bg-rose-50">
                     {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} Purge All
                  </Button>
               )}
            </div>
            
            <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white border border-slate-50">
               <div className="overflow-x-auto">
                 <Table className="min-w-[800px]">
                    <TableHeader className="bg-slate-50/50">
                       <TableRow className="border-slate-50 h-14 md:h-20">
                          <TableHead className="px-6 md:px-12 text-[9px] md:text-[10px] font-black tracking-widest text-slate-400">Conflict Statements</TableHead>
                          <TableHead className="text-[9px] md:text-[10px] font-black tracking-widest text-center text-slate-400">Confidence</TableHead>
                          <TableHead className="text-right px-6 md:px-12 text-[9px] md:text-[10px] font-black tracking-widest text-slate-400">Audit Action</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {qLoading ? (
                          Array.from({length: 3}).map((_, i) => <TableRow key={i} className="border-slate-50"><TableCell colSpan={3} className="px-6 py-6 md:px-12 md:py-10"><Skeleton className="h-10 w-full rounded-xl bg-slate-50" /></TableCell></TableRow>)
                       ) : audit.duplicates.length > 0 ? (
                          audit.duplicates.map((d: any) => (
                             <TableRow key={d.id} className="border-slate-50 hover:bg-slate-50 transition-colors group">
                                <TableCell className="px-6 md:px-12 py-5 md:py-8 text-left">
                                   <p className="font-bold text-[#0F172A] text-sm md:text-base line-clamp-1 truncate max-w-xs md:max-w-md">{d.englishQuestion}</p>
                                   <code className="text-[8px] text-slate-300 font-mono uppercase mt-1.5 block">Node: {d.id.slice(0, 8)}...</code>
                                </TableCell>
                                <TableCell className="text-center">
                                   <Badge className="bg-rose-50 text-rose-600 border-none px-2.5 py-0.5 text-[8px] md:text-[9px] font-black tracking-widest">
                                      100% Overlap
                                   </Badge>
                                </TableCell>
                                <TableCell className="text-right px-6 md:px-12">
                                   <div className="flex justify-end gap-2 md:gap-3 opacity-20 group-hover:opacity-100 transition-all">
                                      <button onClick={() => handleMergeDuplicate(d)} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-blue-500 hover:bg-blue-50 active:scale-90 transition-all">
                                         <GitMerge className="h-4 w-4 md:h-5 md:w-5" />
                                      </button>
                                      <button onClick={() => handleDeleteNode(d.id)} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all">
                                         <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                                      </button>
                                   </div>
                                </TableCell>
                             </TableRow>
                          ))
                       ) : (
                          <TableRow>
                             <TableCell colSpan={3} className="h-40 text-center">
                                <div className="flex flex-col items-center justify-center opacity-10 space-y-4">
                                   <Zap className="h-12 w-12 text-slate-300" />
                                   <p className="font-black text-sm md:text-xl tracking-widest uppercase">Registry Fidelity 100%</p>
                                </div>
                             </TableCell>
                          </TableRow>
                       )}
                    </TableBody>
                 </Table>
               </div>
            </Card>
         </section>
      </div>
    </div>
  )
}

function QAStatCard({ label, value, color, desc, icon, className }: QAStatCardProps) {
   return (
      <Card className={cn("border-none shadow-lg bg-white rounded-2xl md:rounded-[2.5rem] p-5 md:p-10 transition-all duration-500 group border border-slate-50 text-left hover:translate-y-[-4px]", className)}>
         <div className="flex items-center justify-between mb-4 md:mb-8">
            <div className={cn("h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform")}>
               {isValidElement(icon) && cloneElement(icon as ReactElement<any>, { className: cn("h-5 w-5 md:h-6 md:w-6", color) })}
            </div>
         </div>
         <div className="space-y-0.5 md:space-y-1">
            <p className="text-[8px] md:text-[10px] font-black text-slate-400 tracking-tight uppercase">{label}</p>
            <h4 className={cn("text-2xl md:text-6xl font-black tracking-tighter leading-none tabular-nums", color)}>{value}</h4>
            <p className="text-[8px] md:text-[11px] font-bold text-slate-300 tracking-tight mt-1.5 md:mt-3 uppercase">{desc}</p>
         </div>
      </Card>
   )
}
