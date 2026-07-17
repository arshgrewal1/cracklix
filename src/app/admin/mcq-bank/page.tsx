
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
  ShieldCheck
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
 * @fileOverview Master MCQ Bank Hub v2.0.
 * Rebuilt using the High-Fidelity MCQ Engine for deterministic filtering.
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

  const fetchQuestions = useCallback(async (isLoadMore = false) => {
    if (!db) return
    setLoading(true)
    setDiagnostic(null)
    
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
      toast({ variant: "destructive", title: "Sync Failed", description: e.message })
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
      toast({ title: "Update Complete", description: `${selectedIds.length} items updated.` });
      fetchQuestions(false);
      setSelectedIds([]);
    } finally { setIsBulkProcessing(false); }
  }

  return (
    <div className="space-y-6 md:space-y-12 text-left pb-32 animate-in fade-in duration-700 pt-2 px-1">
      
      <AdminPageHeader
        icon={Database}
        label="Central Question Database"
        title="Question Bank"
        subtitle="Manage practice questions and metadata with deterministic filtering."
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
              label="Difficulty" 
              value={filters.difficulty} 
              onChange={v => setFilters({...filters, difficulty: v})}
              options={['Easy', 'Medium', 'Hard', 'Expert'].map(d => ({ label: d, value: d }))}
            />
            <FilterSelect 
              label="Status" 
              value={filters.status} 
              onChange={v => setFilters({...filters, status: v})}
              options={['PUBLISHED', 'DRAFT', 'ARCHIVED'].map(s => ({ label: s, value: s }))}
            />
         </div>
         <AdminSearchInput
           value={searchTerm}
           onChange={setSearchTerm}
           placeholder="Search statement, ID, or keywords..."
         />
      </Card>

      {diagnostic && !loading && (
        <Card className="bg-amber-50 border border-amber-100 p-8 rounded-[2rem] space-y-4 animate-in slide-in-from-top-2">
           <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-amber-600" />
              <h4 className="font-black uppercase text-xs tracking-widest text-amber-700">Diagnostic Report</h4>
           </div>
           <p className="text-sm font-medium text-amber-600 leading-relaxed">{diagnostic.message}</p>
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(diagnostic.filterPass).map(([key, pass]) => (
                <div key={key} className={cn("px-3 py-1.5 rounded-lg flex items-center justify-between text-[9px] font-bold uppercase", pass ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
                   <span>{key.replace('Id', '')}</span>
                   {pass ? <CheckCircle2 className="h-3 w-3" /> : <X className="h-3 w-3" />}
                </div>
              ))}
           </div>
        </Card>
      )}

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white border border-slate-50">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="h-14 border-slate-100">
                <TableHead className="w-16 px-6 text-center">
                  <Checkbox 
                    checked={selectedIds.length === questions.length && questions.length > 0} 
                    onCheckedChange={(checked) => setSelectedIds(checked ? questions.map(q => q.id) : [])} 
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
              ) : questions.length > 0 ? questions.map((q) => (
                <TableRow key={q.id} className={cn("hover:bg-slate-50 transition-all border-slate-50 group", selectedIds.includes(q.id) && "bg-primary/5")}>
                  <TableCell className="px-6 text-center">
                    <Checkbox checked={selectedIds.includes(q.id)} onCheckedChange={(checked) => setSelectedIds(prev => checked ? [...prev, q.id] : prev.filter(id => id !== q.id))} />
                  </TableCell>
                  <TableCell className="px-6 py-6 text-left">
                     <div className="space-y-1.5">
                        <code className="text-[10px] font-mono text-primary font-bold">ID: {q.id.slice(-8)}</code>
                        <div className="flex gap-2">
                           <Badge variant="outline" className="border-slate-100 text-slate-400 text-[7px] px-1.5 uppercase">{q.subjectId || 'General'}</Badge>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                     <p className="font-bold text-[#0F172A] text-sm md:text-base leading-snug line-clamp-2">{q.englishQuestion}</p>
                     {q.tags?.length > 0 && (
                        <div className="flex gap-1.5 mt-2">
                           {q.tags.slice(0, 3).map((t: string) => <span key={t} className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">#{t}</span>)}
                        </div>
                     )}
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
                         <p className="font-black text-2xl uppercase tracking-[0.4em]">Database Standby</p>
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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Load More Nodes
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
                    <p className="text-[8px] font-bold text-slate-500 uppercase mt-1.5 tracking-widest">Registry Sync Active</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <button onClick={() => handleBulkAction('PUBLISH')} disabled={isBulkProcessing} className="px-6 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-[10px] uppercase transition-all shadow-lg">Publish</button>
                  <button onClick={() => handleBulkAction('ARCHIVE')} disabled={isBulkProcessing} className="p-3 rounded-xl bg-white/5 hover:bg-amber-600 transition-all active:scale-90 border border-white/5"><Archive className="h-4 w-4" /></button>
                  <button onClick={() => handleBulkAction('DELETE')} disabled={isBulkProcessing} className="p-3 rounded-xl bg-white/5 hover:bg-rose-600 transition-all active:scale-90 border border-white/5"><Trash2 className="h-4 w-4" /></button>
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

function FilterSelect({ label, value, onChange, options }: any) {
  return (
    <div className="space-y-1.5 text-left">
       <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">{label}</label>
       <select 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 font-bold text-xs outline-none shadow-inner appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
       >
          <option value="all">All {label}s</option>
          {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
       </select>
    </div>
  )
}
