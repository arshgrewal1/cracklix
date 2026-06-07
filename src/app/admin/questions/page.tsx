
"use client"

import { useMemo, useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, Database, Loader2, RefreshCw, Filter, CheckCircle2, AlertTriangle, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, deleteDoc, doc, where, limit, getDocs, startAfter, writeBatch } from "firebase/firestore"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Asset Ledger (Global Bank) v12.0.
 * FIXED: Bulk selection and mass deletion logic using explicit state handlers.
 */

export default function QuestionBank() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [boardFilter, setBoardFilter] = useState("all")
  const [usageFilter, setUsageFilter] = useState("all")
  
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<any[]>([])
  const [lastDoc, setLastDoc] = useState<any>(null)
  const [hasMore, setLastHasMore] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  // Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeletingBulk, setIsDeletingBulk] = useState(false)

  const boardsQuery = useMemo(() => (db ? query(collection(db, "boards")) : null), [db])
  const subjectsQuery = useMemo(() => (db ? query(collection(db, "subjects")) : null), [db])
  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks")) : null), [db])

  const { data: boards } = useCollection<any>(boardsQuery)
  const { data: subjects } = useCollection<any>(subjectsQuery)
  const { data: mocks } = useCollection<any>(mocksQuery)

  const usedQuestionIds = useMemo(() => {
    if (!mocks) return new Set<string>();
    const ids = new Set<string>();
    mocks.forEach((m: any) => {
      if (m.questionIds) m.questionIds.forEach((id: string) => ids.add(id));
    });
    return ids;
  }, [mocks]);

  const fetchQuestions = useCallback(async (isNext = false) => {
    if (!db) return
    setLoading(true)
    
    try {
      let constraints: any[] = [limit(50)]
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
      toast({ variant: "destructive", title: "Fetch Error" })
    } finally {
      setLoading(false)
    }
  }, [db, boardFilter, lastDoc, toast])

  useEffect(() => {
    if (db) fetchQuestions()
  }, [boardFilter, db]) // Only re-fetch on board filter or mount

  const filteredQuestions = useMemo(() => {
    if (!questions) return []
    return questions.filter(q => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = (q.englishQuestion || q.questionEn || "").toLowerCase().includes(term) || 
                             (q.id || "").toLowerCase().includes(term);
        const matchesSub = subjectFilter === "all" || q.subjectId === subjectFilter
        const isUsed = usedQuestionIds.has(q.id);
        const matchesUsage = usageFilter === "all" || (usageFilter === "used" && isUsed) || (usageFilter === "unused" && !isUsed);
        return matchesSearch && matchesSub && matchesUsage
      })
  }, [questions, searchTerm, subjectFilter, usageFilter, usedQuestionIds])

  const handleDeleteSingle = async (id: string) => {
    if (!db) return;
    if (!confirm("Permanently delete this question?")) return;
    try {
      await deleteDoc(doc(db, "questions", id))
      setQuestions(prev => prev.filter(q => q.id !== id))
      setSelectedIds(prev => prev.filter(sid => sid !== id))
      toast({ title: "Question Deleted" })
    } catch (e) {
      toast({ variant: "destructive", title: "Deletion Failed" })
    }
  }

  const handleBulkDelete = async () => {
    if (!db || selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected questions permanently?`)) return;

    setIsDeletingBulk(true);
    const batch = writeBatch(db);
    
    selectedIds.forEach(id => {
      batch.delete(doc(db, "questions", id));
    });

    try {
      await batch.commit();
      setQuestions(prev => prev.filter(q => !selectedIds.includes(q.id)));
      setSelectedIds([]);
      toast({ title: "Bulk Deletion Complete", description: `${selectedIds.length} nodes removed from bank.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Mass Delete Failed" });
    } finally {
      setIsDeletingBulk(false);
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredQuestions.map(q => q.id));
    } else {
      setSelectedIds([]);
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(sid => sid !== id));
    }
  }

  return (
    <div className="space-y-6 text-[#0F172A] text-left relative pb-32 px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="text-left">
          <div className="flex items-center gap-3 mb-1.5">
            <Database className="h-5 w-5 text-primary" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Asset Bank Hub</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black font-headline text-primary uppercase tracking-tight leading-none">Question Bank</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="h-11 rounded-xl bg-white border-slate-200 shadow-sm">
             <Filter className="h-4 w-4 mr-2" /> Filters
          </Button>
          <Button asChild className="bg-[#0F172A] hover:bg-black text-white gap-2 font-black shadow-xl h-11 md:h-12 px-8 rounded-xl md:rounded-2xl uppercase tracking-widest text-[9px] w-full sm:w-auto transition-all active:scale-95">
            <Link href="/admin/questions/add"><Plus className="h-4 w-4" /> Add Manual</Link>
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-3xl rounded-2xl md:rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className={cn("p-4 md:p-8 border-b border-slate-50 bg-muted/10", !showFilters && "hidden md:block")}>
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:w-[35%]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input className="pl-12 h-11 md:h-12 rounded-xl bg-white border-slate-100 shadow-inner" placeholder="Search content or ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3 w-full lg:w-auto">
              <Select value={boardFilter} onValueChange={v => setBoardFilter(v)}>
                <SelectTrigger className="w-full sm:w-36 rounded-xl h-11 bg-white border-none shadow-sm font-bold text-xs"><SelectValue placeholder="Board" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Boards</SelectItem>{boards?.map(b => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-full sm:w-36 rounded-xl h-11 bg-white border-none shadow-sm font-bold text-xs"><SelectValue placeholder="Subject" /></SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto"><SelectItem value="all">All Subjects</SelectItem>{subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={usageFilter} onValueChange={setUsageFilter}>
                <SelectTrigger className="w-full sm:w-36 rounded-xl h-11 bg-white border-none shadow-sm font-bold text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                   <SelectItem value="all">All Status</SelectItem>
                   <SelectItem value="used">Used</SelectItem>
                   <SelectItem value="unused">Unused</SelectItem>
                </SelectContent>
              </Select>
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
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      className="border-primary"
                    />
                  </TableHead>
                  <TableHead className="px-6 text-[9px] font-black uppercase text-slate-500">Asset Content</TableHead>
                  <TableHead className="text-[9px] font-black uppercase text-slate-500 w-32">Usage</TableHead>
                  <TableHead className="text-right px-8 text-[9px] font-black uppercase text-slate-500 w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && questions.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={4} className="px-8 py-6"><Skeleton className="h-12 w-full rounded-xl" /></TableCell></TableRow>
                  ))
                ) : filteredQuestions.map((q: any) => {
                  const isUsed = usedQuestionIds.has(q.id);
                  const isSelected = selectedIds.includes(q.id);
                  return (
                    <TableRow key={q.id} className={cn("hover:bg-slate-50 border-slate-50 transition-colors group", isSelected && "bg-primary/5")}>
                      <TableCell className="px-6 text-center">
                         <Checkbox 
                           checked={isSelected} 
                           onCheckedChange={(checked) => handleSelectOne(q.id, !!checked)}
                           className="border-primary"
                         />
                      </TableCell>
                      <TableCell className="px-6 py-6 text-left">
                        <div className="flex items-center gap-3 mb-1.5">
                          <Badge className="bg-[#0F172A] text-white border-none text-[7px] font-black uppercase px-2 py-0.5">NODE</Badge>
                          <code className="text-[7px] text-slate-400 font-mono uppercase">ID: {q.id?.slice(-8)}</code>
                        </div>
                        <p className="font-bold text-[#000000] text-sm md:text-base leading-snug line-clamp-3">{q.englishQuestion || q.questionEn}</p>
                      </TableCell>
                      <TableCell>
                         <Badge className={cn("border-none text-[8px] font-black px-2 py-0.5 rounded uppercase", isUsed ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600")}>
                            {isUsed ? "USED" : "FRESH"}
                         </Badge>
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100 transition-all">
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white hover:text-primary shadow-sm" asChild><Link href={`/admin/questions/add?id=${q.id}`}><Edit className="h-5 w-5" /></Link></Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-50 hover:text-rose-600 shadow-sm" onClick={() => handleDeleteSingle(q.id)}><Trash2 className="h-5 w-5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button onClick={() => fetchQuestions(true)} disabled={loading} className="rounded-2xl h-14 px-12 bg-white border border-slate-200 text-[#0F172A] font-black uppercase text-[10px] tracking-widest gap-3 shadow-xl hover:bg-slate-50 transition-all">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
            Sync More Nodes
          </Button>
        </div>
      )}

      {/* FLOATING BULK ACTION BAR */}
      {selectedIds.length > 0 && (
         <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 duration-300">
            <div className="bg-[#0F172A] text-white px-8 py-4 rounded-[2rem] shadow-5xl flex items-center gap-8 border border-white/10 ring-8 ring-primary/10">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-black">
                     {selectedIds.length}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Assets Selected</p>
               </div>
               <div className="h-8 w-px bg-white/10" />
               <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedIds([])}
                    className="h-12 rounded-xl text-slate-400 hover:text-white font-black uppercase text-[10px] tracking-widest"
                  >
                    Clear
                  </Button>
                  <Button 
                    onClick={handleBulkDelete}
                    disabled={isDeletingBulk}
                    className="h-14 px-10 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest gap-3 shadow-2xl transition-all active:scale-95"
                  >
                     {isDeletingBulk ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                     Permanent Purge
                  </Button>
               </div>
               <button onClick={() => setSelectedIds([])} className="p-2 hover:bg-white/5 rounded-full text-slate-500"><X className="h-5 w-5" /></button>
            </div>
         </div>
      )}
    </div>
  )
}
