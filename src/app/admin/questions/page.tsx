
"use client"

import React, { useMemo, useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, Database, Loader2, RefreshCw, Filter, CheckCircle2, AlertTriangle, X, Lock, Unlock, Zap, History, LayoutGrid, GraduationCap, Layers } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, deleteDoc, doc, where, limit, getDocs, startAfter, writeBatch, serverTimestamp, updateDoc } from "firebase/firestore"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Asset Ledger (Global Bank) v15.0.
 * UPDATED: Added Recruitment Vertical and Target Section Hub context to table cells.
 */

type QuestionFilterType = 'ALL' | 'UNUSED' | 'USED' | 'LOCKED' | 'DUPLICATE' | 'REPEATED';

export default function QuestionBank() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<QuestionFilterType>('ALL')
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [boardFilter, setBoardFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<any[]>([])
  const [lastDoc, setLastDoc] = useState<any>(null)
  const [hasMore, setLastHasMore] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkProcessing, setIsBulkProcessing] = useState(false)

  const boardsQuery = useMemo(() => (db ? query(collection(db, "boards")) : null), [db])
  const subjectsQuery = useMemo(() => (db ? query(collection(db, "subjects")) : null), [db])
  const examsQuery = useMemo(() => (db ? query(collection(db, "exams")) : null), [db])
  
  const { data: boards } = useCollection<any>(boardsQuery)
  const { data: subjects } = useCollection<any>(subjectsQuery)
  const { data: exams } = useCollection<any>(examsQuery)

  const fetchQuestions = useCallback(async (isNext = false) => {
    if (!db) return
    setLoading(true)
    
    try {
      let constraints: any[] = [limit(50)]
      
      if (activeTab === 'LOCKED') constraints.push(where("status", "==", "LOCKED"))
      if (activeTab === 'UNUSED') constraints.push(where("status", "==", "UNUSED"))
      if (activeTab === 'USED') constraints.push(where("status", "==", "USED"))
      if (activeTab === 'DUPLICATE') constraints.push(where("status", "==", "DUPLICATE"))
      if (activeTab === 'REPEATED') constraints.push(where("usedCount", ">", 1))

      if (boardFilter !== "all") constraints.push(where("boardId", "==", boardFilter))
      if (isNext && lastDoc) constraints.push(startAfter(lastDoc))

      const q = query(collection(db, "questions"), ...constraints)
      const snap = await getDocs(q)
      const newQs = snap.docs.map(d => ({ ...d.data(), id: d.id }))
      
      if (isNext) {
        setQuestions(prev => [...prev, ...newQs])
      } else {
        setQuestions(newQs)
        setSelectedIds([])
      }
      
      setLastDoc(snap.docs[snap.docs.length - 1])
      setLastHasMore(snap.docs.length === 50)
    } catch (e: any) {
      console.error(e)
      toast({ variant: "destructive", title: "Fetch Error", description: "Registry index sync pending." })
    } finally {
      setLoading(false)
    }
  }, [db, boardFilter, activeTab, lastDoc, toast])

  useEffect(() => {
    if (db) fetchQuestions()
  }, [boardFilter, activeTab, db])

  const filteredQuestions = useMemo(() => {
    if (!questions) return []
    return questions.filter(q => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = (q.englishQuestion || q.questionEn || "").toLowerCase().includes(term) || 
                             (q.id || "").toLowerCase().includes(term);
        const matchesSub = subjectFilter === "all" || q.subjectId === subjectFilter
        const matchesDiff = difficultyFilter === "all" || q.difficulty === difficultyFilter
        return matchesSearch && matchesSub && matchesDiff
      })
  }, [questions, searchTerm, subjectFilter, difficultyFilter])

  const handleBulkStatusChange = async (newStatus: string) => {
    if (!db || selectedIds.length === 0) return;
    setIsBulkProcessing(true);
    const batch = writeBatch(db);
    
    selectedIds.forEach(id => {
      batch.update(doc(db, "questions", id), { 
        status: newStatus, 
        updatedAt: serverTimestamp() 
      });
    });

    try {
      await batch.commit();
      setQuestions(prev => prev.map(q => selectedIds.includes(q.id) ? { ...q, status: newStatus } : q));
      setSelectedIds([]);
      toast({ title: "Bulk Audit Complete", description: `Updated ${selectedIds.length} assets to ${newStatus}.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Bulk Update Failed" });
    } finally {
      setIsBulkProcessing(false);
    }
  }

  return (
    <div className="space-y-6 text-[#0F172A] text-left relative pb-32 px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="text-left">
          <div className="flex items-center gap-3 mb-1.5">
            <Database className="h-5 w-5 text-primary" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Asset Management Hub</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black font-headline text-[#0F172A] uppercase tracking-tight leading-none">Global Bank</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="h-11 rounded-xl bg-white border-slate-200 shadow-sm">
             <Filter className="h-4 w-4 mr-2" /> Quick Filters
          </Button>
          <Button asChild className="bg-[#0F172A] hover:bg-black text-white gap-2 font-black shadow-xl h-11 md:h-12 px-8 rounded-xl md:rounded-2xl uppercase tracking-widest text-[9px] w-full sm:w-auto border-none">
            <Link href="/admin/questions/add"><Plus className="h-4 w-4" /> Add Asset</Link>
          </Button>
        </div>
      </div>

      {/* ADVANCED FILTER CHIPS */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
         <FilterChip active={activeTab === 'ALL'} label="All Nodes" onClick={() => setActiveTab('ALL')} count={null} />
         <FilterChip active={activeTab === 'UNUSED'} label="Unused" onClick={() => setActiveTab('UNUSED')} color="text-blue-500" />
         <FilterChip active={activeTab === 'USED'} label="Used" onClick={() => setActiveTab('USED')} color="text-emerald-500" />
         <FilterChip active={activeTab === 'LOCKED'} label="Locked" onClick={() => setActiveTab('LOCKED')} color="text-amber-500" />
         <FilterChip active={activeTab === 'REPEATED'} label="Repeated" onClick={() => setActiveTab('REPEATED')} color="text-indigo-500" />
         <FilterChip active={activeTab === 'DUPLICATE'} label="Duplicates" onClick={() => setActiveTab('DUPLICATE')} color="text-rose-500" />
      </div>

      <Card className="border-none shadow-3xl rounded-2xl md:rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className={cn("p-4 md:p-8 border-b border-slate-50 bg-slate-50/30", !showFilters && "hidden md:block")}>
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:w-[35%]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input className="pl-12 h-11 md:h-12 rounded-xl bg-white border-slate-100 shadow-inner" placeholder="Search statements..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3 w-full lg:w-auto">
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-full sm:w-40 rounded-xl h-11 bg-white border-none shadow-sm font-bold text-xs"><SelectValue placeholder="Subject" /></SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto"><SelectItem value="all">All Subjects</SelectItem>{subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-full sm:w-36 rounded-xl h-11 bg-white border-none shadow-sm font-bold text-xs"><SelectValue placeholder="Difficulty" /></SelectTrigger>
                <SelectContent>
                   <SelectItem value="all">Mixed</SelectItem>
                   <SelectItem value="Easy">Easy</SelectItem>
                   <SelectItem value="Medium">Medium</SelectItem>
                   <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" onClick={() => { setSearchTerm(""); setSubjectFilter("all"); setBoardFilter("all"); setActiveTab("ALL"); }} className="h-11 w-11 rounded-xl text-slate-400"><X className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="h-16 border-slate-100">
                  <TableHead className="w-16 px-6 text-center">
                    <Checkbox 
                      checked={selectedIds.length === filteredQuestions.length && filteredQuestions.length > 0} 
                      onCheckedChange={(checked) => setSelectedIds(checked ? filteredQuestions.map(q => q.id) : [])}
                      className="border-primary"
                    />
                  </TableHead>
                  <TableHead className="px-6 text-[9px] font-black uppercase text-slate-500">Statement Identity</TableHead>
                  <TableHead className="text-[9px] font-black uppercase text-slate-500">Context Node</TableHead>
                  <TableHead className="text-[9px] font-black uppercase text-slate-500">Status Node</TableHead>
                  <TableHead className="text-[9px] font-black uppercase text-slate-500">Audit Usage</TableHead>
                  <TableHead className="text-right px-8 text-[9px] font-black uppercase text-slate-500">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && questions.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={6} className="px-8 py-6"><Skeleton className="h-12 w-full rounded-xl" /></TableCell></TableRow>
                  ))
                ) : filteredQuestions.map((q: any) => (
                  <TableRow key={q.id} className={cn("hover:bg-slate-50 border-slate-50 transition-colors group", selectedIds.includes(q.id) && "bg-primary/5")}>
                    <TableCell className="px-6 text-center">
                       <Checkbox 
                         checked={selectedIds.includes(q.id)} 
                         onCheckedChange={(checked) => setSelectedIds(prev => checked ? [...prev, q.id] : prev.filter(id => id !== q.id))}
                         className="border-primary"
                       />
                    </TableCell>
                    <TableCell className="px-6 py-6 text-left max-w-md">
                      <div className="flex items-center gap-3 mb-1.5">
                        <Badge variant="outline" className="text-[7px] font-black uppercase border-slate-200 text-slate-400">ID: {q.id?.slice(-8)}</Badge>
                        <p className="text-[8px] font-bold text-primary uppercase tracking-widest">{subjects?.find((s:any) => s.id === q.subjectId)?.name || q.subjectId}</p>
                      </div>
                      <p className="font-bold text-[#0F172A] text-sm leading-snug line-clamp-2">{q.englishQuestion}</p>
                    </TableCell>
                    <TableCell>
                       <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <GraduationCap className="h-3 w-3 text-slate-300" />
                             <span className="text-[8px] font-black text-slate-500 uppercase">{exams?.find(e => e.id === q.examId)?.name || q.examId || 'UNMAPPED'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <Layers className="h-3 w-3 text-slate-300" />
                             <span className="text-[8px] font-bold text-slate-400 uppercase">{q.sectionId || 'GENERAL HUB'}</span>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <LifecycleBadge status={q.status || 'UNUSED'} />
                    </TableCell>
                    <TableCell>
                       <div className="flex flex-col">
                          <span className="text-[11px] font-black text-[#0F172A]">{q.usedCount || 0} Times</span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Audit Cycle</span>
                       </div>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100 transition-all">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white hover:text-primary shadow-sm" asChild><Link href={`/admin/questions/add?id=${q.id}`}><Edit className="h-4 w-4" /></Link></Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-50 hover:text-rose-600 shadow-sm" onClick={async () => { if(confirm("Purge asset?")) { await deleteDoc(doc(db!, "questions", q.id)); fetchQuestions(); } }}><Trash2 className="h-4 w-4" /></Button>
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
        <div className="flex justify-center mt-8">
          <Button onClick={() => fetchQuestions(true)} disabled={loading} className="rounded-2xl h-14 px-12 bg-white border border-slate-200 text-[#0F172A] font-black uppercase text-[10px] tracking-widest gap-3 shadow-xl hover:bg-slate-50">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />} Sync Registry Nodes
          </Button>
        </div>
      )}

      {/* BULK ACTION COMMAND HUB */}
      {selectedIds.length > 0 && (
         <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10">
            <div className="bg-[#0F172A] text-white px-8 py-5 rounded-[2.5rem] shadow-5xl flex items-center gap-10 border border-white/10 ring-8 ring-primary/5">
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary font-black shadow-inner">
                     {selectedIds.length}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Nodes Selected</p>
               </div>
               <div className="h-10 w-px bg-white/10" />
               <div className="flex items-center gap-3">
                  <BulkActionBtn icon={<Lock />} label="Lock" onClick={() => handleBulkStatusChange('LOCKED')} disabled={isBulkProcessing} />
                  <BulkActionBtn icon={<Unlock />} label="Unlock" onClick={() => handleBulkStatusChange('UNUSED')} disabled={isBulkProcessing} />
                  <BulkActionBtn icon={<CheckCircle2 />} label="Mark Used" onClick={() => handleBulkStatusChange('USED')} disabled={isBulkProcessing} />
                  <Button onClick={() => setSelectedIds([])} variant="ghost" className="text-slate-500 hover:text-white h-10 px-4 rounded-xl font-bold uppercase text-[9px]">Cancel</Button>
               </div>
            </div>
         </div>
      )}
    </div>
  )
}

function FilterChip({ active, label, onClick, color = "text-slate-400" }: any) {
   return (
      <button 
         onClick={onClick}
         className={cn(
            "px-6 py-2.5 rounded-xl font-black uppercase text-[9px] tracking-[0.2em] transition-all border-2 whitespace-nowrap",
            active ? "bg-[#0F172A] border-[#0F172A] text-white shadow-xl" : "bg-white border-slate-50 hover:border-slate-100 " + color
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
      'REPEATED': 'bg-indigo-50 text-indigo-600',
      'DUPLICATE': 'bg-rose-50 text-rose-600'
   };
   return (
      <Badge className={cn("border-none px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm", styles[status] || styles.UNUSED)}>
         {status}
      </Badge>
   )
}

function BulkActionBtn({ icon, label, onClick, disabled }: any) {
   return (
      <Button 
         onClick={onClick}
         disabled={disabled}
         variant="outline" 
         className="bg-white/5 border-white/10 hover:bg-primary hover:border-primary text-white h-11 px-6 rounded-xl font-black uppercase text-[9px] tracking-widest gap-2 shadow-sm transition-all"
      >
         {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: "h-3.5 w-3.5" }) : icon} {label}
      </Button>
   )
}
