
"use client"

import React, { useMemo, useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Database, 
  Loader2, 
  RefreshCw, 
  Filter, 
  ChevronRight, 
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Archive,
  Layers,
  ArrowUpDown,
  Download,
  UploadCloud,
  Tag,
  X,
  ShieldCheck,
  ExternalLink,
  Copy
} from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { 
  collection, 
  query, 
  doc, 
  where, 
  limit, 
  getDocs, 
  startAfter, 
  writeBatch, 
  serverTimestamp, 
  orderBy, 
  DocumentData, 
  deleteDoc 
} from "firebase/firestore"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { AdminPageHeader, AdminSearchInput, AdminTableSkeleton } from "@/components/admin"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { mcqEngine, DiagnosticReport } from "@/lib/mcq-engine"

/**
 * @fileOverview Master MCQ Bank Hub v3.0 [Duplicate Detection].
 * ADDED: Duplicate counter and specialized filtering logic.
 */

export default function MCQBankPage() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    subjectId: 'all',
    difficulty: 'all',
    status: 'all',
    boardId: 'all'
  })

  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<any[]>([])
  const [lastDoc, setLastDoc] = useState<any>(null)
  const [hasMore, setHasMore] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkProcessing, setIsBulkProcessing] = useState(false)
  const [diagnostic, setDiagnostic] = useState<DiagnosticReport | null>(null)

  const subjectsQuery = useMemo(() => (db ? query(collection(db, "subjects"), orderBy("name", "asc")) : null), [db])
  const boardsQuery = useMemo(() => (db ? query(collection(db, "boards"), orderBy("abbreviation", "asc")) : null), [db])
  
  const { data: subjects } = useCollection<any>(subjectsQuery)
  const { data: boards } = useCollection<any>(boardsQuery)

  // Duplicate Analysis Logic
  const duplicateAnalysis = useMemo(() => {
    const hashes = new Map<string, string[]>();
    const duplicateIds = new Set<string>();

    questions.forEach(q => {
      const text = (q.englishQuestion || "").trim().toLowerCase();
      if (!text) return;
      
      if (hashes.has(text)) {
        const ids = hashes.get(text)!;
        ids.push(q.id);
        ids.forEach(id => duplicateIds.add(id));
      } else {
        hashes.set(text, [q.id]);
      }
    });

    return {
      count: duplicateIds.size,
      ids: duplicateIds
    };
  }, [questions]);

  const fetchQuestions = useCallback(async (isLoadMore = false) => {
    if (!db) return
    setLoading(true)
    
    try {
      const result = await mcqEngine.fetch(
        db, 
        { ...filters, searchTerm }, 
        50, 
        isLoadMore ? lastDoc : undefined
      )

      if (isLoadMore) {
        setQuestions(prev => [...prev, ...result.data])
      } else {
        setQuestions(result.data)
      }

      setLastDoc(result.lastVisible)
      setHasMore(result.hasMore)
      setDiagnostic(result.diagnostic)

    } catch (e: any) {
      toast({ variant: "destructive", title: "Database Standby", description: e.message })
    } finally {
      setLoading(false)
    }
  }, [db, filters, searchTerm, lastDoc, toast])

  useEffect(() => {
    fetchQuestions(false)
  }, [filters, searchTerm])

  const handleBulkAction = async (action: string) => {
    if (!db || selectedIds.length === 0) return;
    setIsBulkProcessing(true);
    const batch = writeBatch(db);
    
    selectedIds.forEach(id => {
      const ref = doc(db, "mcqBank", id);
      if (action === 'DELETE') batch.delete(ref);
      else if (action === 'PUBLISH') batch.update(ref, { status: 'PUBLISHED', updatedAt: serverTimestamp() });
      else if (action === 'ARCHIVE') batch.update(ref, { status: 'ARCHIVED', updatedAt: serverTimestamp() });
    });

    try {
      await batch.commit();
      toast({ title: "Database Updated", description: `${selectedIds.length} items synced.` });
      fetchQuestions(false);
      setSelectedIds([]);
    } finally { setIsBulkProcessing(false); }
  }

  const displayedQuestions = useMemo(() => {
    if (filters.status === 'DUPLICATE') {
      return questions.filter(q => duplicateAnalysis.ids.has(q.id));
    }
    return questions;
  }, [questions, filters.status, duplicateAnalysis.ids]);

  return (
    <div className="space-y-6 md:space-y-12 text-left pb-32 animate-in fade-in duration-700 pt-2 px-1">
      
      <AdminPageHeader
        icon={Database}
        label="Central Question Database"
        title="Question Bank"
        subtitle="Manage practice items with duplicate detection and auto-recovery."
        actionLabel="Add Question"
        actionIcon={Plus}
        actionHref="/admin/mcq-bank/add"
      >
        <div className="flex gap-3">
           <Button asChild variant="outline" className="h-11 md:h-14 rounded-full font-bold px-8 shadow-sm">
              <Link href="/admin/bulk-import"><UploadCloud className="h-4 w-4 mr-2" /> Bulk Upload</Link>
           </Button>
        </div>
      </AdminPageHeader>

      {/* METRIC COUNTERS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-1">
         <MetricCard label="Total in bank" value={questions.length} icon={<Database className="text-primary" />} />
         <MetricCard label="Unused items" value={questions.filter(q => q.status === 'UNUSED').length} icon={<Zap className="text-orange-500" />} />
         <MetricCard label="Used pool" value={questions.filter(q => q.status === 'USED').length} icon={<CheckCircle2 className="text-emerald-500" />} />
         <MetricCard label="Duplicates" value={duplicateAnalysis.count} icon={<Copy className="text-rose-500" />} highlight={duplicateAnalysis.count > 0} />
      </div>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[2.5rem] bg-white border border-slate-50 p-6 md:p-10 space-y-6">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FilterSelect 
              label="Board" 
              value={filters.boardId} 
              onChange={v => setFilters({...filters, boardId: v})}
              options={boards?.map(b => ({ label: b.abbreviation, value: b.id })) || []}
            />
            <FilterSelect 
              label="Subject" 
              value={filters.subjectId} 
              onChange={v => setFilters({...filters, subjectId: v})}
              options={subjects?.map(s => ({ label: s.name, value: s.id })) || []}
            />
            <FilterSelect 
              label="Level" 
              value={filters.difficulty} 
              onChange={v => setFilters({...filters, difficulty: v})}
              options={['Easy', 'Medium', 'Hard', 'Expert'].map(d => ({ label: d, value: d }))}
            />
            <FilterSelect 
              label="Status & Integrity" 
              value={filters.status} 
              onChange={v => setFilters({...filters, status: v})}
              options={[
                { label: 'PUBLISHED', value: 'PUBLISHED' },
                { label: 'DRAFT', value: 'DRAFT' },
                { label: 'ARCHIVED', value: 'ARCHIVED' },
                { label: 'UNUSED', value: 'UNUSED' },
                { label: 'USED', value: 'USED' },
                { label: 'SHOW DUPLICATES', value: 'DUPLICATE' }
              ]}
            />
         </div>
         <AdminSearchInput
           value={searchTerm}
           onChange={setSearchTerm}
           placeholder="Search statement, ID, or keywords..."
         />
      </Card>

      {duplicateAnalysis.count > 0 && filters.status !== 'DUPLICATE' && (
        <Card className="bg-rose-50 border border-rose-100 p-6 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-2">
           <div className="flex items-center gap-4">
              <AlertCircle className="h-6 w-6 text-rose-500" />
              <div className="text-left">
                 <p className="text-sm font-black text-rose-600 uppercase">Redundancy detected</p>
                 <p className="text-xs font-bold text-rose-400">Found {duplicateAnalysis.count} questions with identical statements.</p>
              </div>
           </div>
           <Button 
             onClick={() => setFilters({...filters, status: 'DUPLICATE'})}
             className="h-10 px-6 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-[10px] uppercase border-none"
           >
              Filter Duplicates
           </Button>
        </Card>
      )}

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white border border-slate-50">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="h-14 border-slate-100">
                <TableHead className="w-16 px-6 text-center">
                  <Checkbox 
                    checked={selectedIds.length === displayedQuestions.length && displayedQuestions.length > 0} 
                    onCheckedChange={(checked) => setSelectedIds(checked ? displayedQuestions.map(q => q.id) : [])} 
                  />
                </TableHead>
                <TableHead className="px-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Node ID</TableHead>
                <TableHead className="text-[9px] font-black uppercase tracking-widest text-slate-400">Statement</TableHead>
                <TableHead className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Status</TableHead>
                <TableHead className="text-right px-10 text-[9px] font-black uppercase tracking-widest text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && questions.length === 0 ? (
                <AdminTableSkeleton rows={8} columns={5} />
              ) : displayedQuestions.length > 0 ? displayedQuestions.map((q) => (
                <TableRow key={q.id} className={cn("hover:bg-slate-50 transition-all border-slate-50 group", selectedIds.includes(q.id) && "bg-primary/5")}>
                  <TableCell className="px-6 text-center">
                    <Checkbox checked={selectedIds.includes(q.id)} onCheckedChange={(checked) => setSelectedIds(prev => checked ? [...prev, q.id] : prev.filter(id => id !== q.id))} />
                  </TableCell>
                  <TableCell className="px-6 py-6 text-left">
                     <div className="space-y-1.5">
                        <code className="text-[10px] font-mono text-primary font-black">ID: {q.id.slice(-8)}</code>
                        <div className="flex gap-2">
                           <Badge variant="outline" className="border-slate-100 text-slate-400 text-[7px] px-1.5 uppercase">{q.subjectId || 'General'}</Badge>
                        </div>
                        {duplicateAnalysis.ids.has(q.id) && (
                          <Badge className="bg-rose-500 text-white border-none text-[7px] font-black uppercase px-2 py-0.5 animate-pulse">Duplicate</Badge>
                        )}
                     </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                     <p className="font-bold text-[#0F172A] text-sm md:text-base leading-snug line-clamp-2">{q.englishQuestion}</p>
                  </TableCell>
                  <TableCell className="text-center">
                     <Badge className={cn("border-none text-[8px] font-black uppercase px-2 py-0.5 shadow-sm", q.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400')}>{q.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right px-10">
                     <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100 transition-all">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white shadow-sm" asChild>
                           <Link href={`/admin/mcq-bank/add?id=${q.id}`}><Edit className="h-4 w-4" /></Link>
                        </Button>
                        <button className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all" onClick={async () => { if(confirm("Delete this question?")) { await deleteDoc(doc(db!, "mcqBank", q.id)); fetchQuestions(false); } }}>
                           <Trash2 className="h-4 w-4" />
                        </button>
                     </div>
                  </TableCell>
                </TableRow>
              )) : !loading && (
                <TableRow>
                   <TableCell colSpan={5} className="h-96 text-center">
                      <div className="flex flex-col items-center justify-center opacity-10 space-y-6">
                         <Layers className="h-20 w-20 text-slate-400" />
                         <p className="font-black text-2xl uppercase tracking-[0.4em]">No matching nodes</p>
                      </div>
                   </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {hasMore && questions.length > 0 && (
        <div className="flex justify-center mt-10">
           <Button variant="outline" onClick={() => fetchQuestions(true)} disabled={loading} className="rounded-full px-12 h-14 font-black uppercase text-[10px] tracking-widest border-slate-200 gap-3">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Load More Items
           </Button>
        </div>
      )}

      {selectedIds.length > 0 && (
         <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-12 duration-500 w-[95vw] max-w-3xl">
            <div className="bg-[#0F172A] text-white px-8 py-5 rounded-[2.5rem] shadow-5xl flex items-center justify-between border border-white/10 backdrop-blur-xl">
               <div className="flex items-center gap-5">
                  <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary font-black text-lg">{selectedIds.length}</div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest leading-none">Items Selected</p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase mt-1.5 tracking-widest">Database Sync Active</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <button onClick={() => handleBulkAction('PUBLISH')} disabled={isBulkProcessing} className="flex items-center gap-2 px-6 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition-all font-black text-[10px] uppercase shadow-lg"><CheckCircle2 className="h-4 w-4" /> Publish</button>
                  <button onClick={() => handleBulkAction('DELETE')} disabled={isBulkProcessing} className="p-3 rounded-xl bg-white/5 hover:bg-rose-600 transition-all active:scale-90 shadow-sm"><Trash2 className="h-4 w-4" /></button>
                  <div className="w-px h-10 bg-white/10 mx-2" />
                  <button onClick={() => setSelectedIds([])} className="text-slate-400 hover:text-white p-1"><X className="h-6 w-6" /></button>
               </div>
            </div>
         </div>
      )}

      <div className="flex items-center justify-center gap-4 text-slate-300 py-10 opacity-50">
        <ShieldCheck className="h-5 w-5" />
        <span className="text-[9px] font-black uppercase tracking-[0.5em]">Institutional Filtering Engine Verified</span>
      </div>
    </div>
  )
}

function MetricCard({ label, value, icon, highlight }: any) {
  return (
    <Card className={cn(
      "border-none shadow-xl bg-white p-6 md:p-8 rounded-2xl transition-all duration-500 hover:translate-y-[-2px] border border-slate-50 flex flex-col items-center justify-center text-center gap-2",
      highlight && "ring-2 ring-rose-500/20 bg-rose-50/10"
    )}>
       <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shadow-inner shrink-0">
          {icon}
       </div>
       <div className="space-y-0.5">
          <p className="text-[14px] md:text-3xl font-black text-[#0F172A] tabular-nums leading-none">{value}</p>
          <p className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
       </div>
    </Card>
  )
}

function FilterSelect({ label, value, onChange, options }: any) {
  return (
    <div className="space-y-1.5 text-left">
       <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">{label}</label>
       <select 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 font-bold text-xs outline-none shadow-inner appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
       >
          <option value="all">All {label === 'Board' ? 'Authority' : label === 'Level' ? 'Difficulty' : label}</option>
          {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
       </select>
    </div>
  )
}
