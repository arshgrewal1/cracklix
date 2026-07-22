
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
  X,
  ShieldCheck,
  Zap,
  Layers
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
import { AdminTableSkeleton, AdminPageHeader, AdminSearchInput } from "@/components/admin";
import { mcqEngine, DiagnosticReport } from "@/lib/mcq-engine"

/**
 * @fileOverview Legacy Questions Hub v5.1 [Row Selection Enabled].
 * Refactored to share the High-Fidelity MCQ Engine for deterministic results.
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
    difficulty: 'all',
    status: 'all'
  })

  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<any[]>([])
  const [lastDoc, setLastDoc] = useState<any>(null)
  const [hasMore, setHasMore] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkProcessing, setIsBulkProcessing] = useState(false)
  const [diagnostic, setDiagnostic] = useState<DiagnosticReport | null>(null)

  const boardsQuery = useMemo(() => (db ? query(collection(db, "boards"), orderBy("abbreviation", "asc")) : null), [db]);
  const examsQuery = useMemo(() => (db ? query(collection(db, "exams"), orderBy("name", "asc")) : null), [db]);
  const subjectsQuery = useMemo(() => (db ? query(collection(db, "subjects"), orderBy("name", "asc")) : null), [db]);

  const { data: boards } = useCollection<any>(boardsQuery);
  const { data: exams } = useCollection<any>(examsQuery);
  const { data: subjects } = useCollection<any>(subjectsQuery);

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
        setSelectedIds([])
      }

      setLastDoc(result.lastVisible)
      setHasMore(result.hasMore)
      setDiagnostic(result.diagnostic)

    } catch (e: any) {
      toast({ variant: "destructive", title: "Registry Sync Failed", description: e.message })
    } finally { 
      setLoading(false) 
    }
  }, [db, filters, searchTerm, lastDoc, toast]);

  useEffect(() => { 
    fetchQuestions(false) 
  }, [filters, searchTerm]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action: string) => {
    if (!db || selectedIds.length === 0) return;
    setIsBulkProcessing(true);
    const batch = writeBatch(db);
    
    selectedIds.forEach((id: string) => {
      const ref = doc(db, "questions", id);
      if (action === 'DELETE') batch.delete(ref);
      else if (action === 'PUBLISH') batch.update(ref, { status: 'PUBLISHED', updatedAt: serverTimestamp() });
      else if (action === 'ARCHIVE') batch.update(ref, { status: 'ARCHIVED', updatedAt: serverTimestamp() });
    });

    try {
      await batch.commit();
      toast({ title: "Bulk Action Successful", description: `${selectedIds.length} nodes processed.` });
      fetchQuestions(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Bulk Sync Failed" });
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

  return (
    <div className="space-y-6 md:space-y-10 text-left pb-32 animate-in fade-in duration-700 pt-2 px-1">
      <AdminPageHeader
        icon={Database}
        label="Legacy Ingestion Bank"
        title="Question Registry"
        subtitle="Manage original collection with enhanced high-fidelity filtering."
        actionLabel="New Question"
        actionIcon={Plus}
        actionHref="/admin/questions/add"
      >
        <div className="flex gap-3">
           <Button asChild className="h-11 md:h-14 px-8 bg-[#0F172A] hover:bg-black text-white font-black text-[10px] tracking-widest gap-3 shadow-xl border-none">
              <Link href="/admin/bulk-import"><CloudUpload className="h-4 w-4" /> Bulk OCR</Link>
           </Button>
        </div>
      </AdminPageHeader>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[2.5rem] bg-white border border-slate-50 p-6 md:p-8 space-y-6">
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <FilterNode 
              label="Board" 
              value={filters.boardId} 
              onChange={v => setFilters({...filters, boardId: v, examId: 'all'})}
              options={boards?.map(b => ({ label: b.abbreviation, value: b.id })) || []}
            />
            <FilterNode 
              label="Exam" 
              value={filters.examId} 
              onChange={v => setFilters({...filters, examId: v})}
              options={availableExams.map((e: any) => ({ label: e.name, value: e.id }))}
            />
            <FilterNode 
              label="Subject" 
              value={filters.subjectId} 
              onChange={v => setFilters({...filters, subjectId: v})}
              options={subjects?.map(s => ({ label: s.name, value: s.id })) || []}
            />
            <FilterNode 
              label="Level" 
              value={filters.difficulty} 
              onChange={v => setFilters({...filters, difficulty: v})}
              options={['Easy', 'Medium', 'Hard', 'Expert'].map(d => ({ label: d, value: d }))}
            />
            <FilterNode 
              label="Status" 
              value={filters.status} 
              onChange={v => setFilters({...filters, status: v})}
              options={['PUBLISHED', 'DRAFT', 'ARCHIVED'].map(s => ({ label: s, value: s }))}
            />
         </div>
         <AdminSearchInput
           value={searchTerm}
           onChange={setSearchTerm}
           placeholder="Search statement, ID, or tags..."
         />
      </Card>

      {diagnostic && !loading && (
        <Card className="bg-rose-50 border border-rose-100 p-8 rounded-[2.5rem] space-y-6 shadow-sm">
           <div className="flex items-center gap-4">
              <AlertCircle className="h-8 w-8 text-rose-500" />
              <div className="text-left">
                 <h4 className="font-black text-rose-600 uppercase tracking-widest text-xs">Registry Standby</h4>
                 <p className="text-sm font-medium text-rose-400 mt-1">{diagnostic.message}</p>
              </div>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(diagnostic.filterPass).map(([key, pass]) => (
                <div key={key} className={cn("p-3 rounded-xl flex items-center justify-between border-2 transition-all", pass ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-white border-rose-100 text-rose-400 opacity-60")}>
                   <span className="text-[10px] font-black uppercase tracking-tight">{key.replace('Id', '')}</span>
                   {pass ? <CheckCircle2 className="h-4 w-4" /> : <X className="h-4 w-4" />}
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
                    onCheckedChange={(checked) => setSelectedIds(checked ? questions.map((q: any) => q.id) : [])} 
                  />
                </TableHead>
                <TableHead className="px-6 text-[9px] font-black text-slate-400 tracking-tight uppercase">Identity</TableHead>
                <TableHead className="text-[9px] font-black text-slate-400 tracking-tight uppercase">Statement</TableHead>
                <TableHead className="text-[9px] font-black text-slate-400 tracking-tight text-center uppercase">Type</TableHead>
                <TableHead className="text-right px-10 text-[9px] font-black text-slate-400 tracking-tight uppercase">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && questions.length === 0 ? (
                <AdminTableSkeleton rows={8} columns={5} />
              ) : questions.length > 0 ? questions.map((q: any) => (
                <TableRow 
                  key={q.id} 
                  onClick={() => toggleSelection(q.id)}
                  className={cn("hover:bg-slate-50 transition-all group border-slate-50 cursor-pointer", selectedIds.includes(q.id) && "bg-primary/5")}
                >
                  <TableCell className="px-6 text-center" onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={selectedIds.includes(q.id)} onCheckedChange={() => toggleSelection(q.id)} />
                  </TableCell>
                  <TableCell className="px-6 py-6 text-left max-w-[140px]">
                     <div className="space-y-2">
                        <code className="text-[10px] font-mono text-primary font-black bg-blue-50 px-2 py-0.5 rounded">ID: {q.id.slice(-8)}</code>
                        <div className="flex flex-wrap gap-1">
                           <Badge variant="outline" className="text-[7px] border-slate-100 text-slate-300 font-bold uppercase">{q.boardId || 'GOVT'}</Badge>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                     <p className="font-bold text-[#0F172A] text-sm md:text-base leading-snug line-clamp-2">{q.englishQuestion}</p>
                     <div className="flex items-center gap-3 mt-2.5">
                        <Badge className="bg-slate-50 text-slate-400 border-none text-[8px] font-black rounded uppercase tracking-tighter">Level: {q.difficulty}</Badge>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{subjects?.find((s:any) => s.id === q.subjectId)?.name || q.subjectId}</span>
                     </div>
                  </TableCell>
                  <TableCell className="text-center">
                     <Badge variant="outline" className="border-slate-100 text-slate-400 text-[8px] font-black uppercase px-2 shadow-sm">{q.questionType || 'MCQ'}</Badge>
                  </TableCell>
                  <TableCell className="text-right px-10" onClick={(e) => e.stopPropagation()}>
                     <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100 transition-all">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white shadow-sm" asChild>
                           <Link href={`/admin/questions/add?id=${q.id}`}><Edit className="h-4 w-4" /></Link>
                        </Button>
                        <button className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all border-none cursor-pointer" onClick={async () => { if(confirm("Purge asset from registry?")) { await deleteDoc(doc(db!, "questions", q.id)); fetchQuestions(false); } }}>
                           <Trash2 className="h-4 w-4" />
                        </button>
                     </div>
                  </TableCell>
                </TableRow>
              )) : !loading && (
                 <TableRow>
                    <TableCell colSpan={5} className="h-80 text-center">
                       <div className="flex flex-col items-center justify-center opacity-10 space-y-6">
                          <Layers className="h-20 w-20 text-slate-400" />
                          <p className="font-black text-2xl uppercase tracking-[0.4em]">Registry Empty</p>
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
          <Button variant="outline" onClick={() => fetchQuestions(true)} disabled={loading} className="gap-3 h-14 px-12 rounded-full font-black uppercase text-[10px] tracking-widest border-slate-200 shadow-xl bg-white hover:bg-slate-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <RefreshCw className="h-4 w-4 text-primary" />} Load Next Node
          </Button>
        </div>
      )}

      {selectedIds.length > 0 && (
         <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-12 duration-500 w-[95vw] max-w-3xl">
            <div className="bg-[#0F172A] text-white px-8 py-5 rounded-[2.5rem] shadow-5xl flex items-center justify-between border border-white/10 backdrop-blur-xl relative">
               <div className="flex items-center gap-5">
                  <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary font-black text-lg shadow-xl">{selectedIds.length}</div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest leading-none">Assets Staged</p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">Batch Management Protocol</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <button onClick={() => handleBulkAction('PUBLISH')} disabled={isBulkProcessing} className="flex items-center gap-2 px-6 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition-all font-black text-[10px] uppercase shadow-lg border-none cursor-pointer"><CheckCircle2 className="h-4 w-4" /> Publish</button>
                  <button onClick={() => handleBulkAction('DELETE')} disabled={isBulkProcessing} className="p-3 rounded-xl bg-white/5 hover:bg-rose-600 transition-all active:scale-90 shadow-sm border-none cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                  <div className="w-px h-10 bg-white/10 mx-2" />
                  <button onClick={() => setSelectedIds([])} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all active:scale-90 text-slate-400 hover:text-white bg-transparent border-none cursor-pointer" title="Clear Registry Selection">
                     <X className="h-5 w-5" />
                  </button>
               </div>
            </div>
         </div>
      )}

      <div className="flex items-center justify-center gap-4 text-slate-300 py-10 opacity-30">
        <ShieldCheck className="h-5 w-5" />
        <span className="text-[9px] font-black uppercase tracking-[0.5em]">Institutional Audit Hub Secure</span>
      </div>
    </div>
  )
}

function FilterNode({ label, value, onChange, options }: any) {
  return (
    <div className="space-y-1.5 text-left">
       <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">{label}</label>
       <select 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 font-bold text-xs outline-none shadow-inner appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
       >
          <option value="all">All {label.split(' ')[1]}s</option>
          {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
       </select>
    </div>
  )
}
