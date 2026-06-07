
"use client"

import { useMemo, useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, Database, Loader2, RefreshCw, ChevronRight, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, deleteDoc, doc, where, limit, getDocs, startAfter } from "firebase/firestore"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Hardened Institutional Asset Ledger (Global Bank).
 * Standardized: Standardized Firestore instance validation.
 */

export default function QuestionBank() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [boardFilter, setBoardFilter] = useState("all")
  const [examFilter, setExamFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<any[]>([])
  const [lastDoc, setLastDoc] = useState<any>(null)
  const [hasMore, setLastHasMore] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const { data: boards } = useCollection<any>(useMemo(() => (db && typeof db === 'object' ? query(collection(db, "boards")) : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db && typeof db === 'object' ? query(collection(db, "subjects")) : null), [db]))

  const fetchQuestions = useCallback(async (isNext = false) => {
    if (!db || typeof db !== 'object') return
    setLoading(true)
    
    try {
      let constraints: any[] = [limit(50)]
      
      if (examFilter !== "all") constraints.push(where("examId", "==", examFilter))
      else if (boardFilter !== "all") constraints.push(where("boardId", "==", boardFilter))
      
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
      }
      
      setLastDoc(snap.docs[snap.docs.length - 1])
      setLastHasMore(snap.docs.length === 50)
    } catch (e: any) {
      console.error("Registry fetch error:", e);
      toast({ variant: "destructive", title: "Fetch Error" })
    } finally {
      setLoading(false)
    }
  }, [db, boardFilter, examFilter, lastDoc, toast])

  useEffect(() => {
    if (db) fetchQuestions()
  }, [boardFilter, examFilter, db, fetchQuestions])

  const filteredQuestions = useMemo(() => {
    if (!questions) return []
    return questions.filter(q => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = (q.englishQuestion || q.questionEn || "").toLowerCase().includes(term) || 
                             (q.id || "").toLowerCase().includes(term);
        const matchesSub = subjectFilter === "all" || q.subjectId === subjectFilter
        return matchesSearch && matchesSub
      })
  }, [questions, searchTerm, subjectFilter])

  const handleDeleteSingle = async (id: string) => {
    if (!db) return;
    if (!confirm("Permanently purge this asset?")) return;
    try {
      await deleteDoc(doc(db, "questions", id))
      setQuestions(prev => prev.filter(q => q.id !== id))
      toast({ title: "Registry Node Purged" })
    } catch (e) {
      toast({ variant: "destructive", title: "Purge Failed" })
    }
  }

  return (
    <div className="space-y-6 text-[#0F172A] text-left relative pb-32 px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="text-left">
          <div className="flex items-center gap-3 mb-1.5">
            <Database className="h-5 w-5 text-primary" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Atomic Asset Bank</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black font-headline text-primary uppercase tracking-tight">Question Bank</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="md:hidden h-11 rounded-xl bg-white border-slate-200">
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
            <div className="relative w-full lg:w-[40%]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="pl-12 h-11 md:h-12 rounded-xl bg-white border-none shadow-inner" placeholder="Search by ID or Text..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
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
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="h-16">
                  <TableHead className="px-8 text-[9px] font-black uppercase text-slate-500">Identity & Content</TableHead>
                  <TableHead className="text-[9px] font-black uppercase text-slate-500 w-32">Context</TableHead>
                  <TableHead className="text-right px-8 text-[9px] font-black uppercase text-slate-500 w-32">Audit Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && questions.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={3} className="px-8 py-6"><Skeleton className="h-12 w-full rounded-xl" /></TableCell></TableRow>
                  ))
                ) : filteredQuestions.map((q: any) => (
                  <TableRow key={q.id} className="hover:bg-slate-50 border-white/5 transition-colors group">
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-3 mb-1.5">
                        <Badge className="bg-[#0F172A] text-white border-none text-[7px] font-black uppercase px-2 py-0.5">NODE</Badge>
                        <code className="text-[7px] text-slate-400 font-mono">ID: {q.id?.slice(-6)}</code>
                      </div>
                      <p className="font-bold text-[#000000] text-sm leading-snug line-clamp-2">{q.englishQuestion || q.questionEn}</p>
                    </TableCell>
                    <TableCell>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-800 uppercase">{q.boardId}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase truncate">{q.subjectId}</p>
                       </div>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100 transition-all">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white hover:text-primary shadow-sm" asChild><Link href={`/admin/questions/add?id=${q.id}`}><Edit className="h-4 w-4" /></Link></Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-rose-50 hover:text-rose-600 shadow-sm" onClick={() => handleDeleteSingle(q.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden divide-y divide-slate-100">
             {loading && questions.length === 0 ? (
               Array.from({ length: 4 }).map((_, i) => <div key={i} className="p-6 space-y-4"><Skeleton className="h-6 w-1/4" /><Skeleton className="h-12 w-full" /></div>)
             ) : filteredQuestions.map((q: any) => (
                <div key={q.id} className="p-6 space-y-4 bg-white active:bg-slate-50 transition-all">
                   <div className="flex items-center justify-between">
                      <Badge className="bg-[#0F172A] text-white border-none text-[8px] font-black uppercase px-2">{q.boardId}</Badge>
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
