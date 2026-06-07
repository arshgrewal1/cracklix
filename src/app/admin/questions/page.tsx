
"use client"

import { useMemo, useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, Database, Loader2, RefreshCw, Filter, CheckCircle2, AlertTriangle } from "lucide-react"
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
 * @fileOverview Institutional Asset Ledger (Global Bank).
 * Added: Bulk selection, Mass Deletion, and Used/Unused filters.
 */

export default function QuestionBank() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [boardFilter, setBoardFilter] = useState("all")
  const [usageFilter, setUsageFilter] = useState("all") // all, used, unused
  
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

  // Map of question usage across all mocks
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
      let constraints: any[] = [limit(100)]
      
      if (boardFilter !== "all") constraints.push(where("boardId", "==", boardFilter))
      
      if (isNext && lastDoc) {
        constraints.push(startAfter(lastDoc))
      }

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
      setLastHasMore(snap.docs.length === 100)
    } catch (e: any) {
      console.error("Registry fetch error:", e);
      toast({ variant: "destructive", title: "Fetch Error" })
    } finally {
      setLoading(false)
    }
  }, [db, boardFilter, lastDoc, toast])

  useEffect(() => {
    if (db) fetchQuestions()
  }, [boardFilter, db, fetchQuestions])

  const filteredQuestions = useMemo(() => {
    if (!questions) return []
    return questions.filter(q => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = (q.englishQuestion || q.questionEn || "").toLowerCase().includes(term) || 
                             (q.id || "").toLowerCase().includes(term);
        const matchesSub = subjectFilter === "all" || q.subjectId === subjectFilter
        
        const isUsed = usedQuestionIds.has(q.id);
        const matchesUsage = usageFilter === "all" || 
                           (usageFilter === "used" && isUsed) || 
                           (usageFilter === "unused" && !isUsed);

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
      toast({ title: "Bulk Deletion Complete", description: "All selected nodes removed." });
    } catch (e) {
      toast({ variant: "destructive", title: "Mass Delete Failed" });
    } finally {
      setIsDeletingBulk(false);
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredQuestions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredQuestions.map(q => q.id));
    }
  }

  return (
    <div className="space-y-6 text-[#0F172A] text-left relative pb-32 px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="text-left">
          <div className="flex items-center gap-3 mb-1.5">
            <Database className="h-5 w-5 text-primary" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Asset Bank</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black font-headline text-primary uppercase tracking-tight">Question Bank</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {selectedIds.length > 0 && (
             <Button 
               variant="destructive" 
               onClick={handleBulkDelete} 
               disabled={isDeletingBulk}
               className="h-11 md:h-12 px-8 rounded-xl font-black uppercase text-[9px] tracking-widest gap-2 shadow-xl"
             >
                {isDeletingBulk ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete {selectedIds.length} Nodes
             </Button>
          )}
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="h-11 rounded-xl bg-white border-slate-200">
             <Filter className="h-4 w-4 mr-2" /> Filters
          </Button>
          <Button asChild className="bg-[#0F172A] hover:bg-black text-white gap-2 font-black shadow-2xl h-11 md:h-12 px-8 rounded-xl md:rounded-2xl uppercase tracking-widest text-[9px] w-full sm:w-auto">
            <Link href="/admin/questions/add"><Plus className="h-4 w-4" /> Add Manual</Link>
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-3xl rounded-2xl md:rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className={cn("p-4 md:p-8 border-b border-slate-50 bg-muted/20", !showFilters && "hidden md:block")}>
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:w-[35%]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input className="pl-12 h-11 md:h-12 rounded-xl bg-white border-none shadow-inner" placeholder="Search text or ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3 w-full lg:w-auto">
              <Select value={boardFilter} onValueChange={v => setBoardFilter(v)}>
                <SelectTrigger className="w-full sm:w-36 rounded-xl h-11 bg-white border-none shadow-sm font-bold text-xs">
                  <SelectValue placeholder="Board" />
                </SelectTrigger>
                <SelectContent><SelectItem value="all">All Boards</SelectItem>{boards?.map(b => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-full sm:w-36 rounded-xl h-11 bg-white border-none shadow-sm font-bold text-xs">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto"><SelectItem value="all">All Subjects</SelectItem>{subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={usageFilter} onValueChange={setUsageFilter}>
                <SelectTrigger className="w-full sm:w-36 rounded-xl h-11 bg-white border-none shadow-sm font-bold text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="all">All Status</SelectItem>
                   <SelectItem value="used">Used in Mocks</SelectItem>
                   <SelectItem value="unused">Fresh / Unused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="h-16">
                  <TableHead className="w-12 px-6">
                    <Checkbox checked={selectedIds.length === filteredQuestions.length && filteredQuestions.length > 0} onCheckedChange={toggleSelectAll} />
                  </TableHead>
                  <TableHead className="px-6 text-[9px] font-black uppercase text-slate-500">Content</TableHead>
                  <TableHead className="text-[9px] font-black uppercase text-slate-500 w-32">Usage</TableHead>
                  <TableHead className="text-right px-8 text-[9px] font-black uppercase text-slate-500 w-32">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && questions.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={4} className="px-8 py-6"><Skeleton className="h-12 w-full rounded-xl" /></TableCell></TableRow>
                  ))
                ) : filteredQuestions.map((q: any) => {
                  const isUsed = usedQuestionIds.has(q.id);
                  return (
                    <TableRow key={q.id} className="hover:bg-slate-50 border-white/5 transition-colors group">
                      <TableCell className="px-6">
                         <Checkbox checked={selectedIds.includes(q.id)} onCheckedChange={() => setSelectedIds(prev => prev.includes(q.id) ? prev.filter(id => id !== q.id) : [...prev, q.id])} />
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <div className="flex items-center gap-3 mb-1.5">
                          <Badge className="bg-[#0F172A] text-white border-none text-[7px] font-black uppercase px-2 py-0.5">NODE</Badge>
                          <code className="text-[7px] text-slate-400 font-mono">ID: {q.id?.slice(-6)}</code>
                        </div>
                        <p className="font-bold text-[#000000] text-sm leading-snug line-clamp-2">{q.englishQuestion || q.questionEn}</p>
                      </TableCell>
                      <TableCell>
                         <Badge className={cn("border-none text-[8px] font-black px-2 py-0.5 rounded uppercase", isUsed ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600")}>
                            {isUsed ? "USED" : "FRESH"}
                         </Badge>
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100 transition-all">
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white hover:text-primary shadow-sm" asChild><Link href={`/admin/questions/add?id=${q.id}`}><Edit className="h-4 w-4" /></Link></Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-rose-50 hover:text-rose-600 shadow-sm" onClick={() => handleDeleteSingle(q.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden divide-y divide-slate-100">
             {loading && questions.length === 0 ? (
               Array.from({ length: 4 }).map((_, i) => <div key={i} className="p-6 space-y-4"><Skeleton className="h-6 w-1/4" /><Skeleton className="h-12 w-full" /></div>)
             ) : filteredQuestions.map((q: any) => (
                <div key={q.id} className="p-6 space-y-4 bg-white active:bg-slate-50 transition-all">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <Checkbox checked={selectedIds.includes(q.id)} onCheckedChange={() => setSelectedIds(prev => prev.includes(q.id) ? prev.filter(id => id !== q.id) : [...prev, q.id])} />
                         <Badge className="bg-[#0F172A] text-white border-none text-[8px] font-black uppercase px-2">{q.boardId}</Badge>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400">ID: {q.id?.slice(-6)}</span>
                   </div>
                   <p className="font-bold text-sm text-[#0F172A] leading-relaxed line-clamp-3">{q.englishQuestion || q.questionEn}</p>
                   <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{q.subjectId}</p>
                      <div className="flex gap-2">
                         <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl" asChild><Link href={`/admin/questions/add?id=${q.id}`}><Edit className="h-4 w-4" /></Link></Button>
                         <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl text-rose-500 border-rose-100 bg-rose-50" onClick={() => handleDeleteSingle(q.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                   </div>
                </div>
             ))}
          </div>
        </CardContent>
      </Card>
      
      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button onClick={() => fetchQuestions(true)} disabled={loading} className="rounded-xl h-11 px-10 bg-white border border-slate-200 text-[#0F172A] font-black uppercase text-[10px] tracking-widest gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}
