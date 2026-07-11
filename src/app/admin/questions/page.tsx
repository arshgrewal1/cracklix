
"use client"

import React, { useMemo, useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Database, 
  Loader2, 
  RefreshCw, 
  Landmark, 
  Lock, 
  Unlock, 
  Filter, 
  ChevronRight, 
  CloudUpload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Archive,
  GraduationCap,
  X
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { AdminTableSkeleton } from "@/components/admin";

/**
 * @fileOverview Enterprise MCQ Bank Management Hub v4.6.
 * UPDATED: Added a Close button to the bulk selection bar for immediate deselection.
 */

export default function QuestionBank() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
      <QuestionBankContent />
    </Suspense>
  )
}

function QuestionBankContent() {
  const db = useFirestore()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    examId: searchParams.get('examId') || 'all',
    boardId: searchParams.get('boardId') || 'all',
    subjectId: searchParams.get('subjectId') || 'all',
    chapterId: 'all',
    difficulty: 'all',
    status: 'all'
  })

  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<any[]>([])
  const [lastDoc, setLastDoc] = useState<DocumentData | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkProcessing, setIsBulkProcessing] = useState(false)

  const boardsQuery = useMemo(() => (db ? query(collection(db, "boards"), orderBy("abbreviation", "asc")) : null), [db]);
  const examsQuery = useMemo(() => (db ? query(collection(db, "exams"), orderBy("name", "asc")) : null), [db]);
  const subjectsQuery = useMemo(() => (db ? query(collection(db, "subjects"), orderBy("name", "asc")) : null), [db]);
  const chaptersQuery = useMemo(() => (db && filters.subjectId !== 'all' ? query(collection(db, "chapters"), where("subjectId", "==", filters.subjectId)) : null), [db, filters.subjectId]);

  const { data: boards } = useCollection<any>(boardsQuery);
  const { data: exams } = useCollection<any>(examsQuery);
  const { data: subjects } = useCollection<any>(subjectsQuery);
  const { data: chapters } = useCollection<any>(chaptersQuery);

  const fetchQuestions = useCallback(async (nextCursor: DocumentData | null = null) => {
    if (!db) return
    setLoading(true)
    
    if (!nextCursor) {
      setQuestions([])
    }

    const buildQuery = () => {
      const constraints: any[] = [limit(50)]
      
      if (filters.examId !== 'all') constraints.push(where("examId", "==", filters.examId))
      if (filters.boardId !== 'all') constraints.push(where("boardId", "==", filters.boardId))
      if (filters.subjectId !== 'all') constraints.push(where("subjectId", "==", filters.subjectId))
      if (filters.chapterId !== 'all') constraints.push(where("chapterId", "==", filters.chapterId))
      if (filters.difficulty !== 'all') constraints.push(where("difficulty", "==", filters.difficulty))
      if (filters.status !== 'all') constraints.push(where("status", "==", filters.status))

      if (nextCursor) {
        constraints.push(startAfter(nextCursor))
      }
      
      return query(collection(db, "questions"), ...constraints)
    }

    try {
      const q = buildQuery()
      const snap = await getDocs(q)
      let newQs = snap.docs.map((d: DocumentData) => ({ ...d.data(), id: d.id }))
      
      newQs.sort((a: any, b: any) => {
        const tA = a.updatedAt?.seconds || 0;
        const tB = b.updatedAt?.seconds || 0;
        return tB - tA;
      });

      if (nextCursor) {
        setQuestions(prev => [...prev, ...newQs])
      } else { 
        setQuestions(newQs)
        setSelectedIds([]) 
      }
      
      setLastDoc(snap.docs[snap.docs.length - 1] || null)
      setHasMore(snap.docs.length === 50)
    } catch (e: any) {
      console.error("[MCQ_BANK_SYNC_ERROR]", e);
      toast({ variant: "destructive", title: "Registry Sync Failed", description: e.message })
    } finally { 
      setLoading(false) 
    }
  }, [db, filters, toast]);

  useEffect(() => { 
    fetchQuestions(null) 
  }, [filters, fetchQuestions]);

  const filteredQuestions = useMemo(() => {
    if (!questions) return []
    if (!searchTerm.trim()) return questions;
    const term = searchTerm.toLowerCase().trim();
    return questions.filter((q: any) => {
        return (q.englishQuestion || "").toLowerCase().includes(term) || 
               (q.id || "").toLowerCase().includes(term) ||
               (q.tags || []).some((t: string) => t.toLowerCase().includes(term));
    })
  }, [questions, searchTerm])

  const handleBulkAction = async (action: string) => {
    if (!db || selectedIds.length === 0) return;
    setIsBulkProcessing(true);
    const batch = writeBatch(db);
    
    selectedIds.forEach((id: string) => {
      const ref = doc(db, "questions", id);
      if (action === 'DELETE') batch.delete(ref);
      else if (action === 'PUBLISH') batch.update(ref, { status: 'PUBLISHED', updatedAt: serverTimestamp() });
      else if (action === 'ARCHIVE') batch.update(ref, { status: 'ARCHIVED', updatedAt: serverTimestamp() });
      else if (action === 'LOCK') batch.update(ref, { status: 'LOCKED', updatedAt: serverTimestamp() });
    });

    try {
      await batch.commit();
      toast({ title: "Bulk Action Successful", description: `${selectedIds.length} nodes processed.` });
      fetchQuestions(null);
    } finally {
      setIsBulkProcessing(false);
      setSelectedIds([]);
    }
  }

  const availableExams = useMemo(() => {
     if (!exams) return [];
     if (filters.boardId === 'all') return exams;
     return exams.filter((e: any) => e.boardId === filters.boardId);
  }, [exams, filters.boardId]);

  const availableSubjects = useMemo(() => {
     if (!subjects) return [];
     if (filters.boardId === 'all') return subjects;
     return subjects.filter((s: any) => s.boardId === filters.boardId);
  }, [subjects, filters.boardId]);

  return (
    <div className="space-y-6 md:space-y-10 text-left pb-32 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
             <Database className="h-4 w-4 text-primary" />
             <span className="text-[9px] font-black text-slate-400 tracking-tight">Enterprise Asset Bank</span>
          </div>
          <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-none">MCQ Bank</h1>
          <p className="text-slate-500 text-[11px] md:text-lg font-medium leading-tight">Master question repository with complete institutional hierarchy.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
           <Button asChild className="flex-1 md:w-auto h-12 md:h-14 px-8 bg-[#0F172A] hover:bg-black text-white rounded-full font-black text-[10px] tracking-widest gap-3 shadow-xl border-none">
              <Link href="/admin/bulk-import"><CloudUpload className="h-4 w-4" /> Bulk OCR</Link>
           </Button>
           <Button asChild className="flex-1 md:w-auto h-12 md:h-14 px-10 bg-primary hover:bg-blue-700 text-white rounded-full font-black text-[10px] tracking-widest shadow-xl border-none">
              <Link href="/admin/questions/add"><Plus className="h-5 w-5" /> New Question</Link>
           </Button>
        </div>
      </div>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[2.5rem] bg-white mx-1 border border-slate-50 p-4 md:p-8">
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-1.5">
               <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Board</Label>
               <select 
                  value={filters.boardId} 
                  onChange={e => {
                     setFilters({...filters, boardId: e.target.value, examId: 'all', subjectId: 'all', chapterId: 'all'});
                  }} 
                  className="w-full h-10 bg-slate-50 border-none rounded-lg px-3 text-[11px] font-bold outline-none"
               >
                  <option value="all">All Boards</option>
                  {boards?.map((b: any) => <option key={b.id} value={b.id}>{b.abbreviation}</option>)}
               </select>
            </div>
            <div className="space-y-1.5">
               <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Exam</Label>
               <select 
                  value={filters.examId} 
                  onChange={e => setFilters({...filters, examId: e.target.value})} 
                  className="w-full h-10 bg-slate-50 border-none rounded-lg px-3 text-[11px] font-bold outline-none"
               >
                  <option value="all">All Exams</option>
                  {availableExams.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
               </select>
            </div>
            <div className="space-y-1.5">
               <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Subject</Label>
               <select value={filters.subjectId} onChange={e => setFilters({...filters, subjectId: e.target.value, chapterId: 'all'})} className="w-full h-10 bg-slate-50 border-none rounded-lg px-3 text-[11px] font-bold outline-none">
                  <option value="all">All Subjects</option>
                  {availableSubjects?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
               </select>
            </div>
            <div className="space-y-1.5">
               <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Chapter</Label>
               <select value={filters.chapterId} onChange={e => setFilters({...filters, chapterId: e.target.value})} className="w-full h-10 bg-slate-50 border-none rounded-lg px-3 text-[11px] font-bold outline-none">
                  <option value="all">All Chapters</option>
                  {chapters?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
            </div>
            <div className="space-y-1.5">
               <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Level</Label>
               <select value={filters.difficulty} onChange={e => setFilters({...filters, difficulty: e.target.value})} className="w-full h-10 bg-slate-50 border-none rounded-lg px-3 text-[11px] font-bold outline-none">
                  <option value="all">All Levels</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Expert">Expert</option>
               </select>
            </div>
            <div className="space-y-1.5">
               <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Status</Label>
               <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="w-full h-10 bg-slate-50 border-none rounded-lg px-3 text-[11px] font-bold outline-none">
                  <option value="all">All Status</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                  <option value="LOCKED">Locked</option>
                  <option value="ARCHIVED">Archived</option>
               </select>
            </div>
         </div>
         <div className="relative mt-6 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
            <Input 
               className="h-12 pl-12 rounded-xl bg-slate-50 border-none font-bold text-sm" 
               placeholder="Search by statement, ID, or keywords..." 
               value={searchTerm} 
               onChange={e => setSearchTerm(e.target.value)} 
            />
         </div>
      </Card>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="h-14 border-slate-100">
                <TableHead className="w-16 px-6 text-center">
                  <Checkbox 
                    checked={selectedIds.length === filteredQuestions.length && filteredQuestions.length > 0} 
                    onCheckedChange={(checked) => setSelectedIds(checked ? filteredQuestions.map((q: any) => q.id) : [])} 
                  />
                </TableHead>
                <TableHead className="px-6 text-[9px] font-black text-slate-400 tracking-tight">Statement & Identity</TableHead>
                <TableHead className="text-[9px] font-black text-slate-400 tracking-tight">Hierarchy Context</TableHead>
                <TableHead className="text-[9px] font-black text-slate-400 tracking-tight text-center">Type</TableHead>
                <TableHead className="text-right px-10 text-[9px] font-black text-slate-400 tracking-tight">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && questions.length === 0 ? (
                <AdminTableSkeleton rows={5} columns={5} />
              ) : filteredQuestions.length > 0 ? filteredQuestions.map((q: any) => {
                 const subject = subjects?.find((s: any) => s.id === q.subjectId);
                 const chapter = chapters?.find((c: any) => c.id === q.chapterId);
                 return (
                  <TableRow key={q.id} className={cn("hover:bg-slate-50 transition-all group border-slate-50", selectedIds.includes(q.id) && "bg-primary/5")}>
                    <TableCell className="px-6 text-center">
                      <Checkbox checked={selectedIds.includes(q.id)} onCheckedChange={(checked) => setSelectedIds(prev => checked ? [...prev, q.id] : prev.filter(id => id !== q.id))} />
                    </TableCell>
                    <TableCell className="px-6 py-6 text-left max-w-md">
                       <div className="flex items-center gap-2 mb-1.5">
                          <Badge className="bg-slate-100 text-slate-500 border-none text-[8px] font-black uppercase rounded-sm">{q.id.slice(-8)}</Badge>
                          <Badge className={cn("border-none text-[8px] font-black px-2 py-0.5 rounded-sm", q.difficulty === 'Expert' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600')}>{q.difficulty}</Badge>
                       </div>
                       <p className="font-bold text-[#0F172A] text-sm md:text-base leading-snug line-clamp-2">{q.englishQuestion}</p>
                    </TableCell>
                    <TableCell>
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-[#0F172A]">{subject?.name || q.subjectId || 'No Subject'}</p>
                          <p className="text-[9px] text-slate-400 font-medium uppercase tracking-tight">{chapter?.name || q.chapterId || 'No Chapter'}</p>
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <Badge variant="outline" className="border-slate-100 text-slate-400 text-[8px] font-black uppercase px-2">{q.questionType || 'MCQ'}</Badge>
                    </TableCell>
                    <TableCell className="text-right px-10">
                       <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100 transition-all">
                          <Button variant="ghost" size="icon" className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary" asChild>
                             <Link href={`/admin/questions/add?id=${q.id}`}><Edit className="h-4 w-4" /></Link>
                          </Button>
                          <button className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all" onClick={async () => { if(confirm("Purge asset from registry?")) { await deleteDoc(doc(db!, "questions", q.id)); fetchQuestions(null); } }}>
                             <Trash2 className="h-4 w-4" />
                          </button>
                       </div>
                    </TableCell>
                  </TableRow>
                 )
              }) : (
                 <TableRow>
                    <TableCell colSpan={5} className="h-80 text-center">
                       <div className="flex flex-col items-center justify-center opacity-10 space-y-4">
                          <AlertCircle className="h-16 w-16 text-slate-400" />
                          <p className="font-black text-2xl uppercase tracking-widest">No Assets Found</p>
                       </div>
                    </TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={() => fetchQuestions(lastDoc)} disabled={loading} className="gap-3 h-11 px-8 rounded-full font-black uppercase text-[10px] tracking-widest border-slate-100">
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />} Sync next 50 nodes
          </Button>
        </div>
      )}

      {selectedIds.length > 0 && (
         <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-12 duration-500 w-[95vw] max-w-3xl">
            <div className="bg-[#0F172A] text-white px-6 md:px-8 py-4 rounded-[2rem] shadow-5xl flex items-center justify-between border border-white/10 backdrop-blur-xl relative">
               <div className="flex items-center gap-4">
                  <div className="h-11 w-11 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-black text-sm">{selectedIds.length}</div>
                  <div className="hidden sm:block">
                    <p className="text-[11px] font-black uppercase tracking-widest">Assets Selected</p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase">Registry Normalization Active</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <button onClick={() => handleBulkAction('PUBLISH')} disabled={isBulkProcessing} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-emerald-600 transition-all font-black text-[9px] uppercase tracking-widest"><CheckCircle2 className="h-4 w-4" /> Publish</button>
                  <button onClick={() => handleBulkAction('LOCK')} disabled={isBulkProcessing} className="p-3 rounded-xl bg-white/5 hover:bg-amber-600 transition-all active:scale-90"><Lock className="h-4 w-4" /></button>
                  <button onClick={() => handleBulkAction('DELETE')} disabled={isBulkProcessing} className="p-3 rounded-xl bg-white/5 hover:bg-rose-600 transition-all active:scale-90"><Trash2 className="h-4 w-4" /></button>
                  <div className="w-px h-8 bg-white/10 mx-1" />
                  <button onClick={() => setSelectedIds([])} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all active:scale-90 text-slate-400 hover:text-white" title="Clear Selection">
                     <X className="h-4 w-4" />
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  )
}

