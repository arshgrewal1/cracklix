"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, Database, Layers, CheckCircle2, Clock, Filter, Archive } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, deleteDoc, doc, where } from "firebase/firestore"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/**
 * @fileOverview Institutional Question Bank Asset Registry.
 * Fixed: Filterable reusable bank logic.
 */

export default function QuestionBank() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [boardFilter, setBoardFilter] = useState("all")

  const qQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "questions"), where("isStandalone", "==", true))
  }, [db])

  const { data: allQuestions, loading } = useCollection<any>(qQuery)
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))

  const filteredQuestions = useMemo(() => {
    if (!allQuestions) return []
    return allQuestions
      .filter(q => {
        const matchesSearch = (q.questionEn || "").toLowerCase().includes(searchTerm.toLowerCase())
        const matchesSub = subjectFilter === "all" || q.subjectId === subjectFilter
        const matchesBoard = boardFilter === "all" || q.boardId === boardFilter
        return matchesSearch && matchesSub && matchesBoard
      })
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  }, [allQuestions, searchTerm, subjectFilter, boardFilter])

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently purge this asset from the global bank?")) return
    await deleteDoc(doc(db!, "questions", id))
    toast({ title: "Asset Purged", description: "Node removed from reusable bank." })
  }

  return (
    <div className="space-y-10 pb-20 text-[#0F172A]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Database className="h-6 w-6 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Atomic Asset Registry</span>
          </div>
          <h1 className="text-5xl font-black font-headline text-primary uppercase tracking-tight">Question Bank</h1>
          <p className="text-muted-foreground mt-2 text-lg">Central hub for {allQuestions?.length || 0} reusable exam nodes.</p>
        </div>
        <div className="flex gap-4">
           <Button asChild variant="outline" className="h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-3 shadow-sm bg-white">
              <Link href="/admin/bulk-import"><Plus className="h-5 w-5" /> Bulk Ingestion</Link>
           </Button>
          <Button asChild className="bg-[#0F172A] hover:bg-black text-white gap-3 font-black shadow-2xl h-14 px-10 rounded-2xl uppercase tracking-widest text-xs">
            <Link href="/admin/questions/add"><Plus className="h-5 w-5" /> Manual Node</Link>
          </Button>
        </div>
      </div>

      <Card className="border-foreground/5 bg-card/50 shadow-3xl rounded-[3rem] overflow-hidden">
        <CardHeader className="p-10 border-b border-slate-50 bg-muted/20">
          <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
            <div className="relative w-full lg:w-[45%]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input className="pl-14 h-16 rounded-[1.5rem] bg-white border-none shadow-inner" placeholder="Search atomic bank..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-4">
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="rounded-xl h-12 bg-white border-none w-44 shadow-sm"><SelectValue placeholder="Subject" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Subjects</SelectItem>{subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={boardFilter} onValueChange={setBoardFilter}>
                <SelectTrigger className="rounded-xl h-12 bg-white border-none w-40 shadow-sm"><SelectValue placeholder="Authority" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Boards</SelectItem>{boards?.map(b => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 text-left">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-white/5 h-16">
                <TableHead className="px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Atomic Statement</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Institutional Context</TableHead>
                <TableHead className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Solution</TableHead>
                <TableHead className="text-right px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5"><TableCell colSpan={4} className="px-10 py-8"><Skeleton className="h-14 w-full rounded-2xl bg-white/5" /></TableCell></TableRow>
                ))
              ) : filteredQuestions.length > 0 ? filteredQuestions.map((q: any) => (
                <TableRow key={q.id} className="hover:bg-slate-50 border-white/5 transition-colors group">
                  <TableCell className="px-10 py-8 max-w-lg text-left">
                    <p className="font-bold text-[#0F172A] line-clamp-1">{q.questionEn}</p>
                    <div className="flex items-center gap-4 mt-2">
                       <code className="text-[9px] font-mono text-slate-500 uppercase">UID: {q.id.slice(-8)}</code>
                       {q.imageUrl && <Badge className="bg-blue-50 text-blue-600 border-none text-[8px] font-black uppercase">VISUAL NODE</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-left">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">{q.boardId}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{q.subjectId} • {q.chapterId || 'General'}</p>
                     </div>
                  </TableCell>
                  <TableCell className="text-center">
                     <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-black text-sm mx-auto shadow-inner">{q.correctAnswer}</div>
                  </TableCell>
                  <TableCell className="text-right px-10">
                    <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white shadow-sm border border-transparent hover:border-slate-100" asChild>
                        <Link href={`/admin/questions/add?id=${q.id}`}><Edit className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-50 hover:text-rose-500 shadow-sm border border-transparent hover:border-rose-100" onClick={() => handleDelete(q.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                   <TableCell colSpan={4} className="h-40 text-center opacity-30 italic text-slate-400 font-bold uppercase text-xs">Awaiting atomic ingestion. Use Bulk Ingestion to populate the bank.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
