"use client"

import React, { useMemo, useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, Database, Loader2, RefreshCw, Filter, CheckCircle2, Lock, Unlock, Landmark, GraduationCap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, deleteDoc, doc, where, limit, getDocs, startAfter, writeBatch, serverTimestamp, orderBy, DocumentData } from "firebase/firestore"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional MCQ Bank v18.0 (High Density PWA).
 * UPDATED: Optimized for Title Case and Blue Pill buttons.
 */

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
  
  const boardParam = searchParams.get('board') || 'all'
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<QuestionFilterType>('ALL')
  const [subjectFilter, setSubjectFilter] = useState("all")
  
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<any[]>([])
  const [lastDoc, setLastDoc] = useState<DocumentData | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkProcessing, setIsBulkProcessing] = useState(false)

  const { data: boards } = useCollection<any>(useMemo(() => (dbInstance ? query(collection(dbInstance, "boards"), orderBy("displayOrder", "asc")) : null), [dbInstance]));
  const { data: subjects } = useCollection<any>(useMemo(() => (dbInstance ? query(collection(dbInstance, "subjects"), orderBy("name", "asc")) : null), [dbInstance]));

  const fetchQuestions = useCallback(async (nextCursor: DocumentData | null = null) => {
    if (!dbInstance) return
    setLoading(true)
    try {
      let constraints: any[] = [limit(50)]
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
    <div className="space-y-6 md:space-y-12 text-left relative pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3"><Database className="h-5 w-5 text-primary" /><span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Registry Audit</span></div>
          <h1 className="text-2xl md:text-5xl font-black font-headline text-[#0F172A] tracking-tight">MCQ Bank</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button asChild className="h-12 px-10 shadow-xl bg-primary hover:bg-blue-700 transition-all border-none"><Link href="/admin/questions/add"><Plus className="h-5 w-5" /> Add Question</Link></Button>
          <Select value={boardParam} onValueChange={(v) => router.push(`/admin/questions?board=${v}`)}>
             <SelectTrigger className="h-12 rounded-full bg-white border-slate-200 shadow-sm sm:w-56 font-bold text-xs"><div className="flex items-center gap-3"><Landmark className="h-4 w-4 text-slate-400" /> <SelectValue /></div></SelectTrigger>
             <SelectContent><SelectItem value="all">All Boards</SelectItem>{boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation} Hub</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 bg-white p-3 rounded-full border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
         <FilterChip active={activeTab === 'ALL'} label="All Nodes" onClick={() => setActiveTab('ALL')} />
         <FilterChip active={activeTab === 'UNUSED'} label="Unused" onClick={() => setActiveTab('UNUSED')} color="text-blue-500" />
         <FilterChip active={activeTab === 'USED'} label="Used" onClick={() => setActiveTab('USED')} color="text-emerald-500" />
         <FilterChip active={activeTab === 'LOCKED'} label="Locked" onClick={() => setActiveTab('LOCKED')} color="text-amber-500" />
      </div>

      <Card className="border-none shadow-3xl rounded-[2rem] overflow-hidden bg-white">
        <CardHeader className="p-6 md:p-10 border-b border-slate-50 bg-slate-50/30">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="relative w-full lg:w-[40%]"><Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" /><Input className="pl-14 h-12 rounded-full bg-white border-none shadow-inner font-medium" placeholder="Search statements..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}><SelectTrigger className="w-full sm:w-64 rounded-full h-12 bg-white border-none shadow-sm font-bold text-xs"><SelectValue placeholder="Subject Filter" /></SelectTrigger><SelectContent className="max-h-80">{subjects?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="h-16 border-slate-100"><TableHead className="w-20 px-8 text-center"><Checkbox checked={selectedIds.length === filteredQuestions.length && filteredQuestions.length > 0} onCheckedChange={(checked) => setSelectedIds(checked ? filteredQuestions.map((q: any) => q.id) : [])} /></TableHead><TableHead className="px-8 text-[10px] font-black uppercase tracking-widest">Statement & Node</TableHead><TableHead className="text-[10px] font-black uppercase tracking-widest">Authority</TableHead><TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead><TableHead className="text-right px-10 text-[10px] font-black uppercase tracking-widest">Control</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {loading && questions.length === 0 ? Array.from({ length: 5 }).map((_, i) => (<TableRow key={i}><TableCell colSpan={5} className="p-10"><Skeleton className="h-14 w-full rounded-2xl" /></TableCell></TableRow>)) : 
              filteredQuestions.map((q: any) => (
                <TableRow key={q.id} className={cn("hover:bg-slate-50 transition-all group", selectedIds.includes(q.id) && "bg-primary/5")}>
                  <TableCell className="px-8 text-center"><Checkbox checked={selectedIds.includes(q.id)} onCheckedChange={(checked) => setSelectedIds(prev => checked ? [...prev, q.id] : prev.filter(id => id !== q.id))} /></TableCell>
                  <TableCell className="px-8 py-8 text-left max-w-md"><p className="text-[10px] font-bold text-primary uppercase tracking-tight mb-1">{q.subjectId}</p><p className="font-bold text-[#0F172A] text-base leading-snug line-clamp-2">{q.englishQuestion}</p></TableCell>
                  <TableCell><Badge variant="outline" className="border-slate-200 text-slate-400 text-[8px] font-black">{q.boardId || 'PSSSB'}</Badge></TableCell>
                  <TableCell><LifecycleBadge status={q.status || 'UNUSED'} /></TableCell>
                  <TableCell className="text-right px-10"><div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-all"><Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 shadow-sm" asChild><Link href={`/admin/questions/add?id=${q.id}`}><Edit className="h-4 w-4" /></Link></Button><Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 shadow-sm hover:text-rose-600" onClick={() => { if(confirm("Purge node?")) deleteDoc(doc(dbInstance!, "questions", q.id)) }}><Trash2 className="h-4 w-4" /></Button></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {hasMore && (
        <div className="flex justify-center mt-10">
          <Button variant="outline" onClick={() => fetchQuestions(lastDoc)} disabled={loading} className="gap-3 h-12 px-10 rounded-full font-black uppercase text-[10px]">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Load more nodes
          </Button>
        </div>
      )}

      {selectedIds.length > 0 && (
         <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-12 duration-500">
            <div className="bg-[#0F172A] text-white px-8 py-4 rounded-full shadow-5xl flex items-center gap-12 border border-white/10">
               <div className="flex items-center gap-4"><div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-black">{selectedIds.length}</div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selected</p></div>
               <div className="flex items-center gap-4"><BulkActionBtn icon={<Lock className="h-4 w-4" />} label="Lock" onClick={() => handleBulkStatusChange('LOCKED')} disabled={isBulkProcessing} /><BulkActionBtn icon={<Unlock className="h-4 w-4" />} label="Unlock" onClick={() => handleBulkStatusChange('UNUSED')} disabled={isBulkProcessing} /><Button onClick={() => setSelectedIds([])} variant="ghost" className="text-slate-500 hover:text-white h-9 text-[10px] uppercase">Cancel</Button></div>
            </div>
         </div>
      )}
    </div>
  )
}

function FilterChip({ active, label, onClick, color = "" }: any) {
   return (<button onClick={onClick} className={cn("px-8 py-2.5 rounded-full font-black uppercase text-[10px] tracking-widest transition-all border-2 whitespace-nowrap", active ? "bg-[#0F172A] border-[#0F172A] text-white shadow-xl" : `bg-white border-slate-50 hover:bg-slate-50 ${color}`)}>{label}</button>)
}

function LifecycleBadge({ status }: { status: string }) {
   const styles: Record<string, string> = { 'UNUSED': 'bg-blue-50 text-blue-600', 'USED': 'bg-emerald-50 text-emerald-600', 'LOCKED': 'bg-amber-50 text-amber-600' };
   return (<Badge className={cn("border-none px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest", styles[status] || styles.UNUSED)}>{status}</Badge>)
}

function BulkActionBtn({ icon, label, onClick, disabled }: any) {
   return (<Button onClick={onClick} disabled={disabled} variant="ghost" className="bg-white/5 border-white/10 hover:bg-blue-600 text-white h-10 px-6 text-[10px] gap-2 rounded-full">{icon} {label}</Button>)
}
