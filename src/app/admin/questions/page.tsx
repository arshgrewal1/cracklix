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
import { collection, query, deleteDoc, doc, where, limit, getDocs, startAfter, writeBatch, serverTimestamp, orderBy } from "firebase/firestore"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Paginated Question Bank Hub v37.0.
 * Layout refactor: Removed redundant horizontal padding.
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
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<any[]>([])
  const [lastDoc, setLastDoc] = useState<any>(null)
  const [hasMore, setHasMore] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkProcessing, setIsBulkProcessing] = useState(false)

  const { data: boards } = useCollection<any>(useMemo(() => (dbInstance ? query(collection(dbInstance, "boards"), orderBy("displayOrder", "asc")) : null), [dbInstance]));
  const { data: subjects } = useCollection<any>(useMemo(() => (dbInstance ? query(collection(dbInstance, "subjects"), orderBy("name", "asc")) : null), [dbInstance]));
  const { data: exams } = useCollection<any>(useMemo(() => (dbInstance ? collection(dbInstance, "exams") : null), [dbInstance]));

  const activeBoard = useMemo(() => boards?.find((b: any) => b.id === boardParam), [boards, boardParam]);

  const fetchQuestions = useCallback(async (nextCursor: any = null) => {
    if (!dbInstance) return
    setLoading(true)
    
    try {
      let constraints: any[] = [limit(50)]
      if (activeTab === 'LOCKED') constraints.push(where("status", "==", "LOCKED"))
      if (activeTab === 'USED') constraints.push(where("status", "==", "USED"))
      if (activeTab === 'DUPLICATE') constraints.push(where("status", "==", "DUPLICATE"))
      if (activeTab === 'REPEATED') constraints.push(where("usedCount", ">", 1))
      if (activeTab === 'UNUSED') constraints.push(where("status", "==", "UNUSED"));
      if (boardParam !== "all") constraints.push(where("boardId", "==", boardParam))
      
      if (nextCursor) constraints.push(startAfter(nextCursor))

      const q = query(collection(dbInstance, "questions"), ...constraints)
      const snap = await getDocs(q)
      const newQs = snap.docs.map(d => ({ ...d.data(), id: d.id }))
      
      if (nextCursor) {
        setQuestions(prev => [...prev, ...newQs])
      } else {
        setQuestions(newQs)
        setSelectedIds([])
      }
      
      setLastDoc(snap.docs[snap.docs.length - 1] || null)
      setHasMore(snap.docs.length === 50)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed" })
    } finally {
      setLoading(false)
    }
  }, [dbInstance, boardParam, activeTab, toast])

  useEffect(() => {
    fetchQuestions(null)
  }, [boardParam, activeTab, fetchQuestions]);

  const filteredQuestions = useMemo(() => {
    if (!questions) return []
    return questions.filter(q => {
        const term = searchTerm.toLowerCase();
        const qText = (q.englishQuestion || q.questionEn || "").toLowerCase();
        const matchesSearch = qText.includes(term) || (q.id || "").toLowerCase().includes(term);
        const matchesSub = subjectFilter === "all" || q.subjectId === subjectFilter
        const matchesDiff = difficultyFilter === "all" || q.difficulty === difficultyFilter
        return matchesSearch && matchesSub && matchesDiff
      })
  }, [questions, searchTerm, subjectFilter, difficultyFilter])

  const handleBulkStatusChange = (newStatus: string) => {
    if (!dbInstance || selectedIds.length === 0) return;
    setIsBulkProcessing(true);
    const batch = writeBatch(dbInstance);
    
    selectedIds.forEach(id => {
      batch.update(doc(dbInstance, "questions", id), { status: newStatus, updatedAt: serverTimestamp() });
    });

    batch.commit().then(() => {
       setQuestions(prev => prev.map(q => selectedIds.includes(q.id) ? { ...q, status: newStatus } : q));
       setSelectedIds([]);
       toast({ title: "Registry Synced" });
    }).catch(() => toast({ variant: "destructive", title: "Update Failed" })).finally(() => setIsBulkProcessing(false));
  }

  return (
    <div className="space-y-6 md:space-y-12 text-[#0F172A] text-left relative pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="text-left space-y-2">
          <div className="flex items-center gap-3"><Database className="h-5 w-5 text-primary" /><span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-slate-500">Registry Audit Hub</span></div>
          <h1 className="text-2xl md:text-5xl font-black font-headline text-[#0F172A] uppercase tracking-tight leading-none truncate max-w-[280px] sm:max-w-none">{activeBoard?.name || "Global Bank"}</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Button asChild className="bg-[#0F172A] hover:bg-black text-white gap-3 font-black h-14 md:h-16 px-10 rounded-2xl uppercase tracking-widest text-[11px] w-full sm:w-auto order-first sm:order-last border-none shadow-2xl transition-all active:scale-95"><Link href="/admin/questions/add"><Plus className="h-5 w-5" /> Add Question</Link></Button>
          <div className="flex gap-3 w-full">
             <Select value={boardParam} onValueChange={(v) => router.push(`/admin/questions?board=${v}`)}>
                <SelectTrigger className="h-14 rounded-xl bg-white border-slate-200 shadow-sm flex-1 sm:w-56 font-black uppercase text-[10px] tracking-widest"><div className="flex items-center gap-3 truncate"><Landmark className="h-4 w-4 shrink-0 text-slate-400" /> <SelectValue placeholder="All Boards" /></div></SelectTrigger>
                <SelectContent className="max-h-80"><SelectItem value="all">All Boards</SelectItem>{boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
             </Select>
             <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className={cn("h-14 w-14 rounded-xl bg-white border-slate-200 shadow-sm sm:hidden transition-all", showFilters && "bg-slate-900 text-white border-slate-900")}><Filter className="h-5 w-5" /></Button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar scroll-smooth snap-x">
         <FilterChip active={activeTab === 'ALL'} label="ALL NODES" onClick={() => setActiveTab('ALL')} />
         <FilterChip active={activeTab === 'UNUSED'} label="UNUSED" onClick={() => setActiveTab('UNUSED')} color="text-blue-500" />
         <FilterChip active={activeTab === 'USED'} label="USED" onClick={() => setActiveTab('USED')} color="text-emerald-500" />
         <FilterChip active={activeTab === 'LOCKED'} label="LOCKED" onClick={() => setActiveTab('LOCKED')} color="text-amber-500" />
         <FilterChip active={activeTab === 'DUPLICATE'} label="DUPE" onClick={() => setActiveTab('DUPLICATE')} color="text-rose-500" />
      </div>

      <Card className="border-none shadow-3xl rounded-[2rem] md:rounded-[4rem] overflow-hidden bg-white">
        <CardHeader className={cn("p-6 md:p-10 border-b border-slate-50 bg-slate-50/30", !showFilters && "hidden md:block")}>
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="relative w-full lg:w-[40%]"><Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" /><Input className="pl-14 h-14 rounded-2xl bg-white border-none shadow-inner text-sm md:text-base font-medium" placeholder="Search statements..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <Select value={subjectFilter} onValueChange={setSubjectFilter}><SelectTrigger className="w-full sm:w-56 rounded-xl h-12 bg-white border-none shadow-sm font-bold text-xs"><SelectValue placeholder="Subject Hub" /></SelectTrigger><SelectContent className="max-h-80 overflow-y-auto"><SelectItem value="all">All Subjects</SelectItem>{subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}><SelectTrigger className="w-full sm:w-44 rounded-xl h-12 bg-white border-none shadow-sm font-bold text-xs"><SelectValue placeholder="Difficulty" /></SelectTrigger><SelectContent><SelectItem value="all">All Levels</SelectItem><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Hard">Hard</SelectItem></SelectContent></Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto relative scroll-smooth">
            <Table className="min-w-[900px]">
              <TableHeader className="bg-slate-50/50">
                <TableRow className="h-20 border-slate-100"><TableHead className="w-20 px-8 text-center"><Checkbox checked={selectedIds.length === filteredQuestions.length && filteredQuestions.length > 0} onCheckedChange={(checked) => setSelectedIds(checked ? filteredQuestions.map(q => q.id) : [])} className="border-primary h-5 w-5" /></TableHead><TableHead className="px-8 text-[11px] font-black uppercase tracking-widest text-slate-500">Statement Identity</TableHead><TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-500">Board & Exam</TableHead><TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-500">Audit Status</TableHead><TableHead className="text-right px-10 text-[11px] font-black uppercase tracking-widest text-slate-500">Control</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {loading && questions.length === 0 ? Array.from({ length: 8 }).map((_, i) => (<TableRow key={i}><TableCell colSpan={5} className="px-10 py-8"><Skeleton className="h-16 w-full rounded-2xl" /></TableCell></TableRow>)) : 
                filteredQuestions.map((q: any) => (
                  <TableRow key={q.id} className={cn("hover:bg-slate-50/80 border-slate-50 transition-all group", selectedIds.includes(q.id) && "bg-primary/5")}>
                    <TableCell className="px-8 text-center"><Checkbox checked={selectedIds.includes(q.id)} onCheckedChange={(checked) => setSelectedIds(prev => checked ? [...prev, q.id] : prev.filter(id => id !== q.id))} className="border-primary h-5 w-5" /></TableCell>
                    <TableCell className="px-8 py-10 text-left max-w-md"><p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-2.5">{subjects?.find((s:any) => s.id === q.subjectId)?.name || 'GENERAL HUB'}</p><p className="font-bold text-[#0F172A] text-[15px] md:text-lg leading-snug line-clamp-3 antialiased">{q.englishQuestion}</p></TableCell>
                    <TableCell>
                       <div className="space-y-2">
                          <div className="flex items-center gap-2.5"><Landmark className="h-4 w-4 text-slate-400" /><span className="text-[10px] md:text-xs font-black text-slate-600 uppercase tracking-tight">{boards?.find((b:any) => b.id === q.boardId)?.abbreviation || 'PSSSB'}</span></div>
                          <div className="flex items-center gap-2.5"><GraduationCap className="h-4 w-4 text-slate-400" /><span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase truncate max-w-[160px]">{exams?.find((e:any) => e.id === q.examId)?.name || 'GENERAL VERTICAL'}</span></div>
                       </div>
                    </TableCell>
                    <TableCell><LifecycleBadge status={q.status || 'UNUSED'} /></TableCell>
                    <TableCell className="text-right px-10">
                      <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-all">
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:text-primary hover:border-primary" asChild><Link href={`/admin/questions/add?id=${q.id}`}><Edit className="h-5 w-5" /></Link></Button>
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:text-rose-600 hover:border-rose-200" onClick={() => { if(confirm("Purge node?")) { deleteDoc(doc(dbInstance, "questions", q.id)); setQuestions(prev => prev.filter(p => p.id !== q.id)); } }}><Trash2 className="h-5 w-5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {hasMore && (
        <div className="flex justify-center mt-10">
          <Button onClick={() => fetchQuestions(lastDoc)} disabled={loading} className="rounded-2xl h-16 px-16 bg-white border border-slate-200 text-[#0F172A] font-black uppercase text-[11px] tracking-[0.2em] gap-4 shadow-3xl hover:bg-slate-50 transition-all active:scale-95">
            {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <RefreshCw className="h-6 w-6 text-primary" />} Sync Next Bank
          </Button>
        </div>
      )}

      {selectedIds.length > 0 && (
         <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-12 duration-500">
            <div className="bg-[#0F172A] text-white px-8 md:px-12 py-5 md:py-8 rounded-full shadow-5xl flex flex-col md:flex-row items-center gap-6 md:gap-16 border border-white/10 ring-8 ring-primary/5">
               <div className="flex items-center gap-5"><div className="h-12 w-12 md:h-16 md:w-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary font-black shadow-inner text-xl">{selectedIds.length}</div><p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300">Nodes Selected</p></div>
               <div className="h-12 w-px bg-white/10 hidden md:block" /><div className="flex flex-wrap items-center justify-center gap-3 md:gap-6"><BulkActionBtn icon={<Lock className="h-4 w-4" />} label="Lock" onClick={() => handleBulkStatusChange('LOCKED')} disabled={isBulkProcessing} /><BulkActionBtn icon={<Unlock className="h-4 w-4" />} label="Unlock" onClick={() => handleBulkStatusChange('UNUSED')} disabled={isBulkProcessing} /><BulkActionBtn icon={<CheckCircle2 className="h-4 w-4" />} label="Mark Used" onClick={() => handleBulkStatusChange('USED')} disabled={isBulkProcessing} /><Button onClick={() => setSelectedIds([])} variant="ghost" className="text-slate-500 hover:text-white h-12 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest">Cancel</Button></div>
            </div>
         </div>
      )}
    </div>
  )
}

function FilterChip({ active, label, onClick, color = "text-slate-400" }: any) {
   return (<button onClick={onClick} className={cn("px-6 py-3 rounded-xl font-black uppercase text-[10px] md:text-xs tracking-widest transition-all border-2 whitespace-nowrap snap-center", active ? "bg-[#0F172A] border-[#0F172A] text-white shadow-2xl scale-105" : "bg-white border-slate-50 hover:border-slate-100 " + color)}>{label}</button>)
}

function LifecycleBadge({ status }: { status: string }) {
   const styles: Record<string, string> = { 'UNUSED': 'bg-blue-50 text-blue-600', 'USED': 'bg-emerald-50 text-emerald-600', 'LOCKED': 'bg-amber-50 text-amber-600', 'REPEATED': 'bg-indigo-50 text-indigo-600', 'DUPLICATE': 'bg-rose-50 text-rose-600' };
   return (<Badge className={cn("border-none px-4 py-1.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-sm", styles[status] || styles.UNUSED)}>{status}</Badge>)
}

function BulkActionBtn({ icon, label, onClick, disabled }: any) {
   return (<Button onClick={onClick} disabled={disabled} variant="outline" className="bg-white/5 border-white/10 hover:bg-primary hover:border-primary text-white h-12 md:h-14 px-6 md:px-10 rounded-2xl font-black uppercase text-[10px] md:text-[11px] tracking-widest gap-3 transition-all active:scale-95 shadow-xl">{icon} {label}</Button>)
}
