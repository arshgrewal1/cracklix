
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
  X
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

/**
 * @fileOverview Enterprise Question Bank Hub v1.2.
 * SIMPLIFIED: Replaced "MCQ Bank" and "Registry" with easier words.
 */

export default function MCQBankPage() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    subjectId: 'all',
    difficulty: 'all',
    status: 'all',
    year: 'all'
  })

  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<any[]>([])
  const [lastDoc, setLastDoc] = useState<DocumentData | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkProcessing, setIsBulkProcessing] = useState(false)

  const subjectsQuery = useMemo(() => (db ? query(collection(db, "subjects"), orderBy("name", "asc")) : null), [db])
  const { data: subjects } = useCollection<any>(subjectsQuery)

  const fetchQuestions = useCallback(async (nextCursor: DocumentData | null = null) => {
    if (!db) return
    setLoading(true)
    
    if (!nextCursor) setQuestions([])

    const constraints: any[] = [orderBy("updatedAt", "desc"), limit(50)]
    if (filters.subjectId !== 'all') constraints.push(where("subjectId", "==", filters.subjectId))
    if (filters.difficulty !== 'all') constraints.push(where("difficulty", "==", filters.difficulty))
    if (filters.status !== 'all') constraints.push(where("status", "==", filters.status))
    if (nextCursor) constraints.push(startAfter(nextCursor))

    try {
      const q = query(collection(db, "mcqBank"), ...constraints)
      const snap = await getDocs(q)
      const newQs = snap.docs.map(d => ({ ...d.data(), id: d.id }))
      
      if (nextCursor) setQuestions(prev => [...prev, ...newQs])
      else setQuestions(newQs)
      
      setLastDoc(snap.docs[snap.docs.length - 1] || null)
      setHasMore(snap.docs.length === 50)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Update Failed", description: e.message })
    } finally { setLoading(false) }
  }, [db, filters, toast])

  useEffect(() => { fetchQuestions(null) }, [filters, fetchQuestions])

  const filteredQuestions = useMemo(() => {
    if (!searchTerm.trim()) return questions;
    const term = searchTerm.toLowerCase();
    return questions.filter(q => 
      (q.englishQuestion || "").toLowerCase().includes(term) ||
      (q.tags || []).some((t: string) => t.toLowerCase().includes(term))
    )
  }, [questions, searchTerm])

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
      fetchQuestions(null);
      setSelectedIds([]);
    } finally { setIsBulkProcessing(false); }
  }

  return (
    <div className="space-y-6 md:space-y-12 text-left pb-32 animate-in fade-in duration-700 pt-2">
      
      <AdminPageHeader
        icon={Database}
        label="Central Question Database"
        title="Question Bank"
        subtitle="Manage all your practice questions and metadata in one place."
        actionLabel="Add Question"
        actionIcon={Plus}
        actionHref="/admin/mcq-bank/add"
      >
        <div className="flex gap-3">
           <Button asChild variant="outline" className="h-12 md:h-14 rounded-full font-bold px-8 shadow-sm">
              <Link href="/admin/bulk-import"><UploadCloud className="h-4 w-4 mr-2" /> Bulk Upload</Link>
           </Button>
        </div>
      </AdminPageHeader>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[2.5rem] bg-white mx-1 border border-slate-50 p-6 md:p-8 space-y-6">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
               <label className="text-[9px] font-black uppercase text-slate-400 ml-1">By Subject</label>
               <select value={filters.subjectId} onChange={e => setFilters({...filters, subjectId: e.target.value})} className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 font-bold text-xs outline-none">
                  <option value="all">All Subjects</option>
                  {subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
               </select>
            </div>
            <div className="space-y-1.5">
               <label className="text-[9px] font-black uppercase text-slate-400 ml-1">By Difficulty</label>
               <select value={filters.difficulty} onChange={e => setFilters({...filters, difficulty: e.target.value})} className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 font-bold text-xs outline-none">
                  <option value="all">All Levels</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Expert">Expert</option>
               </select>
            </div>
            <div className="space-y-1.5">
               <label className="text-[9px] font-black uppercase text-slate-400 ml-1">By Status</label>
               <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 font-bold text-xs outline-none">
                  <option value="all">All Items</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
               </select>
            </div>
            <div className="flex items-end">
               <Button onClick={() => setFilters({subjectId: 'all', difficulty: 'all', status: 'all', year: 'all'})} variant="ghost" className="h-11 w-full rounded-xl text-slate-400 font-bold uppercase text-[9px]">Clear Filters</Button>
            </div>
         </div>
         <AdminSearchInput
           value={searchTerm}
           onChange={setSearchTerm}
           placeholder="Search questions by text or ID..."
         />
      </Card>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="h-14 border-slate-100">
                <TableHead className="w-16 px-6 text-center">
                  <Checkbox 
                    checked={selectedIds.length === filteredQuestions.length && filteredQuestions.length > 0} 
                    onCheckedChange={(checked) => setSelectedIds(checked ? filteredQuestions.map(q => q.id) : [])} 
                  />
                </TableHead>
                <TableHead className="px-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Question ID</TableHead>
                <TableHead className="text-[9px] font-black uppercase tracking-widest text-slate-400">Statement</TableHead>
                <TableHead className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Status</TableHead>
                <TableHead className="text-right px-10 text-[9px] font-black uppercase tracking-widest text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && questions.length === 0 ? (
                <AdminTableSkeleton rows={5} columns={5} />
              ) : filteredQuestions.length > 0 ? filteredQuestions.map((q) => (
                <TableRow key={q.id} className={cn("hover:bg-slate-50 transition-all border-slate-50 group", selectedIds.includes(q.id) && "bg-primary/5")}>
                  <TableCell className="px-6 text-center">
                    <Checkbox checked={selectedIds.includes(q.id)} onCheckedChange={(checked) => setSelectedIds(prev => checked ? [...prev, q.id] : prev.filter(id => id !== q.id))} />
                  </TableCell>
                  <TableCell className="px-6 py-6 text-left">
                     <div className="space-y-1.5">
                        <code className="text-[10px] font-mono text-primary font-bold">ID: {q.id.slice(-8)}</code>
                        <div className="flex gap-2">
                           <Badge variant="outline" className="border-slate-100 text-slate-400 text-[7px] px-1.5">{q.subjectId || 'General'}</Badge>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                     <p className="font-bold text-[#0F172A] text-sm leading-snug line-clamp-2">{q.englishQuestion}</p>
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
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white" asChild>
                           <Link href={`/admin/mcq-bank/add?id=${q.id}`}><Edit className="h-5 w-5" /></Link>
                        </Button>
                        <button className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all" onClick={async () => { if(confirm("Delete this question?")) { await deleteDoc(doc(db!, "mcqBank", q.id)); fetchQuestions(null); } }}>
                           <Trash2 className="h-5 w-5" />
                        </button>
                     </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                   <TableCell colSpan={5} className="h-60 text-center opacity-10 italic font-black uppercase text-xl tracking-[0.4em]">Database Empty</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {hasMore && (
        <div className="flex justify-center mt-8">
           <Button variant="outline" onClick={() => fetchQuestions(lastDoc)} className="rounded-full px-10 h-12 font-black uppercase text-[10px] tracking-widest border-slate-200">Load More Questions</Button>
        </div>
      )}

      {selectedIds.length > 0 && (
         <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-12 duration-500 w-[95vw] max-w-3xl">
            <div className="bg-[#0F172A] text-white px-8 py-5 rounded-[2.5rem] shadow-5xl flex items-center justify-between border border-white/10 backdrop-blur-xl">
               <div className="flex items-center gap-5">
                  <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary font-black text-lg">{selectedIds.length}</div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest leading-none">Items Selected</p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">Batch Management Active</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <button onClick={() => handleBulkAction('PUBLISH')} disabled={isBulkProcessing} className="px-6 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-[10px] uppercase transition-all">Publish</button>
                  <button onClick={() => handleBulkAction('ARCHIVE')} disabled={isBulkProcessing} className="p-3 rounded-xl bg-white/5 hover:bg-amber-600 transition-all"><Archive className="h-4 w-4" /></button>
                  <button onClick={() => handleBulkAction('DELETE')} disabled={isBulkProcessing} className="p-3 rounded-xl bg-white/5 hover:bg-rose-600 transition-all"><Trash2 className="h-4 w-4" /></button>
                  <div className="w-px h-10 bg-white/10 mx-2" />
                  <button onClick={() => setSelectedIds([])} className="text-slate-400 hover:text-white p-1"><X className="h-5 w-5" /></button>
               </div>
            </div>
         </div>
      )}
    </div>
  )
}
