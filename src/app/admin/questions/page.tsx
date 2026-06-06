
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, Database, Filter, Eye, AlertCircle, CheckSquare, History, X, Loader2, Zap, AlertTriangle, Layers, Copy, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, deleteDoc, doc, where, writeBatch, setDoc, serverTimestamp, limit, orderBy } from "firebase/firestore"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/**
 * @fileOverview Institutional Asset Ledger (Global Bank) v5.0.
 * Features: Massive Scale Pagination, ID-Based Search, and Usage Detection.
 */

export default function QuestionBank() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [boardFilter, setBoardFilter] = useState("all")
  const [examFilter, setExamFilter] = useState("all")
  const [showUnusedOnly, setShowUnusedOnly] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [pageLimit, setPageLimit] = useState(50)

  // Optimized Scalable Query
  const qQuery = useMemo(() => {
    if (!db) return null
    let constraints: any[] = [where("isStandalone", "==", true), orderBy("createdAt", "desc"), limit(pageLimit)];
    
    if (examFilter !== "all") constraints.unshift(where("examId", "==", examFilter));
    else if (boardFilter !== "all") constraints.unshift(where("boardId", "==", boardFilter));
    
    return query(collection(db, "questions"), ...constraints)
  }, [db, boardFilter, examFilter, pageLimit])

  const mocksQuery = useMemo(() => (db ? collection(db, "mocks") : null), [db])

  const { data: allQuestions, loading } = useCollection<any>(qQuery)
  const { data: allMocks } = useCollection<any>(mocksQuery)
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))

  // Usage Matrix Generator
  const usageMap = useMemo(() => {
    if (!allQuestions || !allMocks) return {};
    const map: Record<string, string[]> = {};
    allMocks.forEach(m => {
       m.questionIds?.forEach((qid: string) => {
          if (!map[qid]) map[qid] = [];
          map[qid].push(m.title);
       });
    });
    return map;
  }, [allQuestions, allMocks]);

  const filteredQuestions = useMemo(() => {
    if (!allQuestions) return []
    return allQuestions
      .filter(q => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = (q.questionEn || q.titleEn || "").toLowerCase().includes(term) || 
                             (q.displayId || "").toLowerCase().includes(term);
        const matchesSub = subjectFilter === "all" || q.subjectId === subjectFilter
        const usageCount = usageMap[q.id]?.length || 0;
        const matchesUnused = !showUnusedOnly || usageCount === 0
        return matchesSearch && matchesSub && matchesUnused
      })
  }, [allQuestions, searchTerm, subjectFilter, showUnusedOnly, usageMap])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredQuestions.map(q => q.id))
    } else {
      setSelectedIds([])
    }
  }

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handlePurgeIds = async (ids: string[]) => {
    if (!db || ids.length === 0) return
    const usedIds = ids.filter(id => (usageMap[id]?.length || 0) > 0);
    const confirmMsg = usedIds.length > 0 
      ? `CRITICAL AUDIT: ${usedIds.length} questions in your selection are ACTIVE in mocks. Deleting them will break those tests. Continue?`
      : `Audit: Permanently purge ${ids.length} nodes from registry?`;

    if (!confirm(confirmMsg)) return

    setIsDeleting(true)
    try {
      const batchSize = 400
      for (let i = 0; i < ids.length; i += batchSize) {
        const chunk = ids.slice(i, i + batchSize)
        const batch = writeBatch(db)
        chunk.forEach(id => { batch.delete(doc(db, "questions", id)) })
        await batch.commit()
      }
      toast({ title: "Audit Success", description: `${ids.length} items successfully purged.` })
      setSelectedIds([])
    } catch (e: any) {
      toast({ variant: "destructive", title: "Audit Error", description: "Registry sync failed." })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteSingle = (id: string) => {
    const usage = usageMap[id] || [];
    if (usage.length > 0) {
      if (!confirm(`WARNING: This question is used in ${usage.length} mocks. Deleting it will cause errors. Proceed?`)) return;
    } else if (!confirm("Permanently purge this asset?")) return;
    
    const qRef = doc(db!, "questions", id)
    deleteDoc(qRef)
      .then(() => toast({ title: "Asset Purged" }))
      .catch(async () => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: qRef.path, operation: 'delete' })));
  }

  const allSelected = filteredQuestions.length > 0 && selectedIds.length === filteredQuestions.length;

  return (
    <div className="space-y-6 text-[#0F172A] text-left relative pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
        <div className="text-left">
          <div className="flex items-center gap-3 mb-1.5">
            <Database className="h-5 w-5 text-primary" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Scalable Asset Bank</span>
          </div>
          <h1 className="text-4xl font-black font-headline text-primary uppercase tracking-tight">Question Bank</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Enterprise grade management for 1M+ MCQ nodes.</p>
        </div>
        <div className="flex gap-4">
           <Button asChild variant="outline" className="h-12 px-6 rounded-2xl font-black uppercase text-[9px] tracking-widest gap-2 shadow-sm bg-white border-slate-200">
              <Link href="/admin/bulk-import"><Plus className="h-4 w-4" /> Bulk Ingestion</Link>
           </Button>
          <Button asChild className="bg-[#0F172A] hover:bg-black text-white gap-2 font-black shadow-2xl h-12 px-8 rounded-2xl uppercase tracking-widest text-[9px]">
            <Link href="/admin/questions/add"><Plus className="h-4 w-4" /> Add Manual</Link>
          </Button>
        </div>
      </div>

      {selectedIds.length > 0 && (
         <div className="mx-4 bg-[#0B1528] p-4 rounded-2xl flex flex-wrap items-center justify-between animate-in fade-in slide-in-from-top-4 shadow-4xl text-white sticky top-2 z-[60] border border-white/10">
            <div className="flex items-center gap-6 px-4">
               <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary"><CheckSquare className="h-5 w-5" /></div>
               <div>
                  <p className="text-lg font-headline font-black leading-none uppercase">{selectedIds.length} Assets Targeted</p>
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Bulk Audit Terminal</p>
               </div>
            </div>
            <div className="flex items-center gap-3 px-4">
               <Button onClick={() => setSelectedIds([])} variant="ghost" className="text-slate-400 hover:text-white uppercase text-[9px] font-black">Cancel</Button>
               <Button onClick={() => handlePurgeIds(selectedIds)} className="h-12 px-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase text-[9px] shadow-xl">{isDeleting ? "Purging..." : "Purge Selection"}</Button>
            </div>
         </div>
      )}

      <Card className="border-none shadow-3xl rounded-[2.5rem] overflow-hidden bg-white mx-4">
        <CardHeader className="p-8 border-b border-slate-50 bg-muted/20">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:w-[40%]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="pl-12 h-12 rounded-xl bg-white border-none shadow-inner" placeholder="Search by Question ID (e.g. PP-001) or Text..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select value={boardFilter} onValueChange={v => { setBoardFilter(v); setExamFilter("all"); }}>
                <SelectTrigger className="rounded-xl h-11 bg-white border-none w-36 shadow-sm font-bold text-xs"><SelectValue placeholder="Board" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Boards</SelectItem>{boards?.map(b => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={examFilter} onValueChange={setExamFilter}>
                <SelectTrigger className="rounded-xl h-11 bg-white border-none w-48 shadow-sm font-bold text-xs"><SelectValue placeholder="Target Exam" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Exams</SelectItem>{exams?.filter(e => boardFilter === "all" || e.boardId === boardFilter).map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="rounded-xl h-11 bg-white border-none w-36 shadow-sm font-bold text-xs"><SelectValue placeholder="Subject" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Subjects</SelectItem>{subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-white/5 h-16">
                <TableHead className="w-[60px] px-8 text-center"><Checkbox checked={allSelected} onCheckedChange={(v) => handleSelectAll(!!v)} /></TableHead>
                <TableHead className="px-4 text-[9px] font-black uppercase text-slate-500">Identity & Content</TableHead>
                <TableHead className="text-[9px] font-black uppercase text-slate-500">Context</TableHead>
                <TableHead className="text-center text-[9px] font-black uppercase text-slate-500">Usage</TableHead>
                <TableHead className="text-right px-8 text-[9px] font-black uppercase text-slate-500">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={5} className="px-8 py-6"><Skeleton className="h-12 w-full rounded-xl" /></TableCell></TableRow>
                ))
              ) : filteredQuestions.length > 0 ? filteredQuestions.map((q: any) => {
                const usages = usageMap[q.id] || [];
                return (
                  <TableRow key={q.id} className={cn("hover:bg-slate-50 border-white/5 transition-colors group", selectedIds.includes(q.id) ? 'bg-primary/5' : '')}>
                    <TableCell className="px-8 py-6 text-center"><Checkbox checked={selectedIds.includes(q.id)} onCheckedChange={() => toggleSelection(q.id)} /></TableCell>
                    <TableCell className="px-4 py-8 max-w-xl text-left">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-[#0F172A] text-white border-none text-[8px] font-black uppercase px-2 py-0.5">{q.displayId || 'Q-NODE'}</Badge>
                        <Badge variant="outline" className="text-[7px] font-bold uppercase">{q.questionType}</Badge>
                      </div>
                      <p className="font-bold text-[#000000] text-base leading-snug line-clamp-2">{q.questionEn}</p>
                    </TableCell>
                    <TableCell className="text-left">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-800 uppercase">{q.boardId}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">{q.subjectId}</p>
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <TooltipProvider>
                          <Tooltip>
                             <TooltipTrigger asChild>
                                <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-xl border transition-all cursor-help", usages.length > 0 ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-slate-50 border-slate-100 text-slate-400")}>
                                   <Layers className="h-3 w-3" />
                                   <span className="text-xs font-black">{usages.length}</span>
                                </div>
                             </TooltipTrigger>
                             <TooltipContent className="bg-[#0F172A] text-white p-4 rounded-xl border-white/10 shadow-4xl w-64">
                                <p className="text-[9px] font-black uppercase text-primary mb-2">Usage Hub</p>
                                {usages.length > 0 ? <ul className="space-y-2">{usages.map((name, i) => <li key={i} className="text-[10px] font-bold border-b border-white/5 pb-1">{name}</li>)}</ul> : <p className="text-[10px] italic">Standalone Node</p>}
                             </TooltipContent>
                          </Tooltip>
                       </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100 transition-all">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white hover:text-primary shadow-sm" asChild><Link href={`/admin/questions/add?id=${q.id}`}><Edit className="h-4 w-4" /></Link></Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-50 hover:text-rose-600 shadow-sm" onClick={() => handleDeleteSingle(q.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              }) : <TableRow><TableCell colSpan={5} className="h-80 text-center opacity-20 italic">No nodes matching filter.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="flex justify-center items-center gap-4 mt-8">
         <Button variant="outline" size="sm" onClick={() => setPageLimit(prev => Math.max(50, prev - 50))} disabled={pageLimit <= 50} className="rounded-xl font-black text-[9px] uppercase"><ChevronLeft className="h-4 w-4" /> Prev Nodes</Button>
         <span className="text-[10px] font-black text-slate-400 uppercase">Audit Limit: {pageLimit}</span>
         <Button variant="outline" size="sm" onClick={() => setPageLimit(prev => prev + 50)} className="rounded-xl font-black text-[9px] uppercase">Next Nodes <ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  )
}
