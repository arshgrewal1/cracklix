
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
import { AdminPageHeader } from "@/components/admin"

/**
 * @fileOverview Hardened CBT Integrity Hub v18.0.
 * FIXED: Spatial rebalancing and typography normalization for a premium SaaS look.
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
    <div className="space-y-10 md:space-y-16 text-[#0F172A] text-left animate-in fade-in duration-700 pt-2 pb-32">
      
      {/* 1. HEADER HUB - REBALANCED */}
      <AdminPageHeader
        icon={ShieldAlert}
        iconClassName="text-rose-500"
        label="Integrity Governance Monitor"
        title="CBT Integrity"
        subtitle="Sanitize global bank overlaps and validate asset fidelity."
        actionLabel="Re-Scan Registry"
        actionIcon={RefreshCw}
        onAction={handleReScan}
      />

      {/* 2. STATS GRID - SPATIALLY BALANCED */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10 px-1">
         <QAStatCard label="Overlapping Assets" value={audit.stats.dup} color="text-rose-600" desc="Identical statements" icon={<Archive />} />
         <QAStatCard label="Broken Nodes" value={audit.stats.broken} color="text-orange-600" desc="Missing metadata" icon={<Activity />} />
         <QAStatCard label="Fidelity Index" value={`${questions && questions.length > 0 ? Math.round(((questions.length - audit.stats.dup) / questions.length) * 100) : 100}%`} color="text-emerald-600" desc="Unique nodes" icon={<Zap />} className="hidden md:block" />
      </div>

      {/* 3. AUDIT STREAM */}
      <div className="space-y-10 px-1">
         <section className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 md:h-12 md:w-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 shadow-inner">
                     <Archive className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-3xl font-black text-[#0F172A] uppercase tracking-tight">Audit Stream</h3>
                    <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Registry Conflict Ledger</p>
                  </div>
               </div>
               {audit.duplicates.length > 0 && (
                  <Button onClick={handleBulkPurgeDuplicates} disabled={isProcessing} className="w-full md:w-auto h-11 md:h-12 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase text-[10px] tracking-widest gap-2 px-8 rounded-full shadow-lg border-none transition-all active:scale-95">
                     {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Purge All Conflicts
                  </Button>
               )}
            </div>
            
            <Card className="border-none shadow-3xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white border border-slate-50">
               <div className="overflow-x-auto">
                 <Table className="min-w-[900px]">
                    <TableHeader className="bg-slate-50/50">
                       <TableRow className="border-slate-100 h-16 md:h-24">
                          <TableHead className="px-8 md:px-12 text-[10px] md:text-[11px] font-black tracking-widest text-slate-400 uppercase">Conflict Statements</TableHead>
                          <TableHead className="text-[10px] md:text-[11px] font-black tracking-widest text-center text-slate-400 uppercase">Confidence</TableHead>
                          <TableHead className="text-right px-8 md:px-12 text-[10px] md:text-[11px] font-black tracking-widest text-slate-400 uppercase">Audit Action</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {qLoading ? (
                          <TableRow className="border-slate-50"><TableCell colSpan={3} className="px-8 py-8 md:py-14 md:px-12"><Skeleton className="h-12 w-full rounded-2xl bg-slate-50" /></TableCell></TableRow>
                       ) : audit.duplicates.length > 0 ? (
                          audit.duplicates.map((d: any) => (
                             <TableRow key={d.id} className="border-slate-50 hover:bg-slate-50 transition-colors group">
                                <TableCell className="px-8 md:px-12 py-6 md:py-10 text-left">
                                   <p className="font-bold text-[#0F172A] text-sm md:text-lg line-clamp-1 truncate max-w-xs md:max-w-xl">{d.englishQuestion}</p>
                                   <code className="text-[8px] md:text-[10px] text-slate-300 font-mono uppercase mt-2 block tracking-widest">Node ID: {d.id.slice(-12)}</code>
                                </TableCell>
                                <TableCell className="text-center">
                                   <Badge className="bg-rose-50 text-rose-600 border-none px-3 py-1 text-[8px] md:text-[10px] font-black tracking-widest uppercase shadow-sm">
                                      100% Match
                                   </Badge>
                                </TableCell>
                                <TableCell className="text-right px-8 md:px-12">
                                   <div className="flex justify-end gap-2 md:gap-4 opacity-20 group-hover:opacity-100 transition-all">
                                      <button onClick={() => handleMergeDuplicate(d)} title="Mark as Duplicate" className="h-9 w-9 md:h-12 md:w-12 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-blue-500 hover:bg-blue-50 active:scale-90 transition-all">
                                         <GitMerge className="h-5 w-5" />
                                      </button>
                                      <button onClick={() => handleDeleteNode(d.id)} title="Purge Node" className="h-9 w-9 md:h-12 md:w-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all">
                                         <Trash2 className="h-5 w-5" />
                                      </button>
                                   </div>
                                </TableCell>
                             </TableRow>
                          ))
                       ) : (
                          <TableRow>
                             <TableCell colSpan={3} className="h-60 md:h-96 text-center">
                                <div className="flex flex-col items-center justify-center opacity-10 space-y-6">
                                   <Zap className="h-20 w-20 md:h-32 md:w-32 text-slate-400" />
                                   <p className="font-black text-sm md:text-3xl tracking-[0.3em] uppercase">Registry Fidelity Normal</p>
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
      <Card className={cn("border-none shadow-xl bg-white rounded-2xl md:rounded-[3rem] p-6 md:p-12 transition-all duration-500 group border border-slate-100 text-left hover:translate-y-[-4px]", className)}>
         <div className="flex items-center justify-between mb-8 md:mb-14">
            <div className={cn("h-11 w-11 md:h-16 md:w-16 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform")}>
               {isValidElement(icon) ? cloneElement(icon as ReactElement<any>, { className: cn("h-5 w-5 md:h-8 md:w-8", color) }) : null}
            </div>
         </div>
         <div className="space-y-1.5 md:space-y-3">
            <p className="text-[8px] md:text-[10px] font-black text-slate-400 tracking-widest uppercase">{label}</p>
            <h4 className={cn("text-xl md:text-5xl font-black tracking-tighter leading-none tabular-nums", color)}>{value}</h4>
            <p className="text-[8px] md:text-[11px] font-bold text-slate-300 tracking-tight mt-1 uppercase">{desc}</p>
         </div>
      </Card>
   )
}
