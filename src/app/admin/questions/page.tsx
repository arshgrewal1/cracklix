"use client"

import React, { useMemo, useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, Database, Loader2, RefreshCw, Landmark, Lock, Unlock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, where, limit, getDocs, startAfter, writeBatch, serverTimestamp, orderBy, DocumentData, deleteDoc } from "firebase/firestore"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

type QuestionFilterType = 'ALL' | 'UNUSED' | 'USED' | 'LOCKED' | 'DUPLICATE' | 'REPEATED';

export default function QuestionBank() {
  return (
    <Suspense fallback={<div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
      <QuestionBankContent />
    </Suspense>
  )
}

function QuestionBankContent() {
  const dbInstance = useFirestore()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const boardParam = searchParams?.get('board') || 'all'
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<QuestionFilterType>('ALL')
  
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<any[]>([])
  const [lastDoc, setLastDoc] = useState<DocumentData | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkProcessing, setIsBulkProcessing] = useState(false)

  const { data: boards } = useCollection<any>(useMemo(() => (dbInstance ? query(collection(dbInstance, "boards"), orderBy("displayOrder", "asc")) : null), [dbInstance]));

  const fetchQuestions = useCallback(async (nextCursor: DocumentData | null = null) => {
    if (!dbInstance) return
    setLoading(true)
    try {
      const constraints: any[] = [limit(50)]
      if (activeTab !== 'ALL') {
        if (activeTab === 'REPEATED') constraints.push(where("usedCount", ">", 1))
        else constraints.push(where("status", "==", activeTab))
      }
      if (boardParam !== "all") constraints.push(where("boardId", "==", boardParam))
      if (nextCursor) constraints.push(startAfter(nextCursor))

      const q = query(collection(dbInstance, "questions"), ...constraints)
      const snap = await getDocs(q)
      const newQs = snap.docs.map((d: DocumentData) => ({ ...d.data(), id: d.id }))
      
      if (nextCursor) setQuestions(prev => [...prev, ...newQs])
      else { setQuestions(newQs); setSelectedIds([]); }
      
      setLastDoc(snap.docs[snap.docs.length - 1] || null)
      setHasMore(snap.docs.length === 50)
    } finally { setLoading(false) }
  }, [dbInstance, boardParam, activeTab]);

  useEffect(() => { fetchQuestions(null) }, [boardParam, activeTab, fetchQuestions]);

  const filteredQuestions = useMemo(() => {
    if (!questions) return []
    return questions.filter((q: any) => {
        const term = searchTerm.toLowerCase().trim();
        const qText = (q.englishQuestion || "").toLowerCase();
        return qText.includes(term) || (q.id || "").toLowerCase().includes(term);
    })
  }, [questions, searchTerm])

  const handleBulkStatusChange = (newStatus: string) => {
    if (!dbInstance || selectedIds.length === 0) return;
    setIsBulkProcessing(true);
    const batch = writeBatch(dbInstance);
    selectedIds.forEach((id: string) => batch.update(doc(dbInstance, "questions", id), { status: newStatus, updatedAt: serverTimestamp() }));
    batch.commit().then(() => {
       setQuestions(prev => prev.map((q: any) => selectedIds.includes(q.id) ? { ...q, status: newStatus } : q));
       setSelectedIds([]);
       toast({ title: "Registry Synced" });
    }).finally(() => setIsBulkProcessing(false));
  }

  return (
    <div className="space-y-6 md:space-y-10 text-left pb-32 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
             <Database className="h-4 w-4 text-primary" />
             <span className="text-[9px] font-black text-slate-400 tracking-tight">Registry Bank Hub</span>
          </div>
          <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-none">MCQ Bank</h1>
          <p className="text-slate-500 text-[11px] md:text-lg font-medium leading-tight">Master collection of preparation nodes across Punjab.</p>
        </div>
        
        <Button asChild className="w-full md:w-auto h-11 md:h-14 px-8 bg-primary hover:bg-blue-700 text-white rounded-full font-black text-[10px] tracking-widest shadow-xl border-none transition-all active:scale-95 gap-3">
           <Link href="/admin/questions/add"><Plus className="h-4 w-4" /> Add Question</Link>
        </Button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1">
         <FilterChip active={activeTab === 'ALL'} label="All Nodes" onClick={() => setActiveTab('ALL')} />
         <FilterChip active={activeTab === 'UNUSED'} label="Unused" onClick={() => setActiveTab('UNUSED')} color="text-blue-500" />
         <FilterChip active={activeTab === 'USED'} label="Used" onClick={() => setActiveTab('USED')} color="text-emerald-500" />
         <FilterChip active={activeTab === 'LOCKED'} label="Locked" onClick={() => setActiveTab('LOCKED')} color="text-amber-500" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 px-1">
         <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
            <Input 
              className="h-14 md:h-16 pl-14 rounded-2xl md:rounded-full bg-white border-slate-50 shadow-inner font-bold text-[#0F172A]" 
              placeholder="Search statements..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
         </div>
         <Select value={boardParam} onValueChange={(v) => router.push(`/admin/questions?board=${v}`)}>
            <SelectTrigger className="w-full md:w-64 h-14 md:h-16 rounded-2xl md:rounded-full bg-white border-slate-50 shadow-inner font-bold text-xs">
               <div className="flex items-center gap-3"><Landmark className="h-4 w-4 text-slate-300" /> <SelectValue placeholder="All Boards Hub" /></div>
            </SelectTrigger>
            <SelectContent><SelectItem value="all">All Boards Hub</SelectItem>{boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation} Hub</SelectItem>)}</SelectContent>
         </Select>
      </div>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="h-14 border-slate-100">
                <TableHead className="w-16 px-6 text-center"><Checkbox checked={selectedIds.length === filteredQuestions.length && filteredQuestions.length > 0} onCheckedChange={(checked) => setSelectedIds(checked ? filteredQuestions.map((q: any) => q.id) : [])} /></TableHead>
                <TableHead className="px-6 text-[9px] font-black text-slate-400 tracking-tight">Statement & Node</TableHead>
                <TableHead className="text-[9px] font-black text-slate-400 tracking-tight text-center">Status</TableHead>
                <TableHead className="text-right px-10 text-[9px] font-black text-slate-400 tracking-tight">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && questions.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (<TableRow key={i}><TableCell colSpan={4} className="p-8"><Skeleton className="h-12 w-full rounded-xl bg-slate-50" /></TableCell></TableRow>))
              ) : filteredQuestions.map((q: any) => (
                <TableRow key={q.id} className={cn("hover:bg-slate-50 transition-all group border-slate-50", selectedIds.includes(q.id) && "bg-primary/5")}>
                  <TableCell className="px-6 text-center"><Checkbox checked={selectedIds.includes(q.id)} onCheckedChange={(checked) => setSelectedIds(prev => checked ? [...prev, q.id] : prev.filter(id => id !== q.id))} /></TableCell>
                  <TableCell className="px-6 py-6 text-left max-w-md">
                     <p className="text-[9px] font-black text-primary uppercase tracking-tight mb-1.5">{q.subjectId || "General Hub"}</p>
                     <p className="font-bold text-[#0F172A] text-sm md:text-base leading-snug line-clamp-2">{q.englishQuestion}</p>
                  </TableCell>
                  <TableCell className="text-center">
                     <LifecycleBadge status={q.status || 'UNUSED'} />
                  </TableCell>
                  <TableCell className="text-right px-10">
                     <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100 transition-all">
                        <Button variant="ghost" size="icon" className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90" asChild><Link href={`/admin/questions/add?id=${q.id}`}><Edit className="h-4 w-4" /></Link></Button>
                        <button className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all" onClick={() => { if(confirm("Purge node?")) deleteDoc(doc(dbInstance!, "questions", q.id)) }}><Trash2 className="h-4 w-4" /></button>
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={() => fetchQuestions(lastDoc)} disabled={loading} className="gap-3 h-11 px-8 rounded-full font-black uppercase text-[10px] tracking-widest border-slate-100">
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />} Load more nodes
          </Button>
        </div>
      )}

      {selectedIds.length > 0 && (
         <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-12 duration-500 w-[95vw] max-w-md">
            <div className="bg-[#0F172A] text-white px-6 py-4 rounded-3xl shadow-5xl flex items-center justify-between border border-white/10">
               <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-primary/20 rounded-lg flex items-center justify-center text-primary font-black text-xs">{selectedIds.length}</div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Selected</p>
               </div>
               <div className="flex items-center gap-2">
                  <button onClick={() => handleBulkStatusChange('LOCKED')} disabled={isBulkProcessing} className="p-2.5 rounded-xl bg-white/5 hover:bg-blue-600 transition-all active:scale-90"><Lock className="h-4 w-4" /></button>
                  <button onClick={() => handleBulkStatusChange('UNUSED')} disabled={isBulkProcessing} className="p-2.5 rounded-xl bg-white/5 hover:bg-emerald-600 transition-all active:scale-90"><Unlock className="h-4 w-4" /></button>
                  <button onClick={() => { if(confirm(`Purge ${selectedIds.length} nodes?`)) { const batch = writeBatch(dbInstance!); selectedIds.forEach(id => batch.delete(doc(dbInstance!, 'questions', id))); batch.commit(); setSelectedIds([]); } }} disabled={isBulkProcessing} className="p-2.5 rounded-xl bg-white/5 hover:bg-rose-600 transition-all active:scale-90"><Trash2 className="h-4 w-4" /></button>
               </div>
            </div>
         </div>
      )}
    </div>
  )
}

function FilterChip({ active, label, onClick, color = "" }: any) {
   return (
      <button 
        onClick={onClick} 
        className={cn(
          "px-6 py-2 rounded-full font-bold text-[10px] tracking-tight transition-all border-2 whitespace-nowrap active:scale-95", 
          active ? "bg-[#0F172A] border-[#0F172A] text-white shadow-lg" : `bg-white border-slate-100 hover:bg-slate-50 ${color}`
        )}
      >
        {label}
      </button>
   )
}

function LifecycleBadge({ status }: { status: string }) {
   const styles: Record<string, string> = { 
     'UNUSED': 'bg-blue-50 text-blue-600', 
     'USED': 'bg-emerald-50 text-emerald-600', 
     'LOCKED': 'bg-amber-50 text-amber-600',
     'DUPLICATE': 'bg-rose-50 text-rose-600'
   };
   return (
      <Badge className={cn("border-none px-2.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest", styles[status] || styles.UNUSED)}>
        {status}
      </Badge>
   )
}
