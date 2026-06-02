"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, FileText, Database, Layers } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, orderBy, deleteDoc, doc } from "firebase/firestore"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function QuestionBank() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [boardFilter, setBoardFilter] = useState("all")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")

  const { data: questions, loading } = useCollection<any>(useMemo(() => (db ? query(collection(db, "questions"), orderBy("createdAt", "desc")) : null), [db]))
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))

  const filteredQuestions = useMemo(() => {
    if (!questions) return []
    return questions.filter(q => {
      const matchesSearch = (q.questionEn || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (q.id || "").toLowerCase().includes(searchTerm.toLowerCase())
      const matchesBoard = boardFilter === "all" || q.boardId === boardFilter
      const matchesSubject = subjectFilter === "all" || q.subjectId === subjectFilter
      const matchesDifficulty = difficultyFilter === "all" || q.difficulty === difficultyFilter
      return matchesSearch && matchesBoard && matchesSubject && matchesDifficulty
    })
  }, [questions, searchTerm, boardFilter, subjectFilter, difficultyFilter])

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this question? This will affect any mock series using this ID.")) return
    try {
      await deleteDoc(doc(db, "questions", id))
      toast({ title: "Deleted", description: "Question removed from global bank." })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: "Could not delete." })
    }
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Layers className="h-6 w-6 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Asset Management</span>
          </div>
          <h1 className="text-5xl font-black font-headline text-primary uppercase tracking-tight">Institutional Bank</h1>
          <p className="text-muted-foreground mt-2 text-lg">Central repository of verified bilingual MCQs for Punjab Government exams.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button asChild variant="outline" className="gap-2 border-foreground/10 h-14 px-8 rounded-2xl font-bold bg-card/50">
            <Link href="/admin/questions/bulk"><FileText className="h-5 w-5" /> Extraction Engine</Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90 gap-3 font-black shadow-2xl h-14 px-10 rounded-2xl uppercase tracking-widest text-xs">
            <Link href="/admin/questions/add"><Plus className="h-5 w-5" /> Compose MCQ</Link>
          </Button>
        </div>
      </div>

      <Card className="border-foreground/5 bg-card/50 shadow-2xl rounded-[3rem] overflow-hidden">
        <CardHeader className="p-10 border-b border-white/5 bg-muted/20">
          <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
            <div className="relative w-full lg:w-[45%]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                className="pl-14 h-16 rounded-[1.5rem] bg-background border-none shadow-inner text-lg font-medium" 
                placeholder="Search by statement, ID or keyword..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
            </div>
            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              <Select value={boardFilter} onValueChange={setBoardFilter}>
                <SelectTrigger className="rounded-xl h-12 bg-background border-none w-32 shadow-sm"><SelectValue placeholder="Board" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Boards</SelectItem>{boards?.map(b => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="rounded-xl h-12 bg-background border-none w-32 shadow-sm"><SelectValue placeholder="Subject" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Subjects</SelectItem>{subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="rounded-xl h-12 bg-background border-none w-32 shadow-sm"><SelectValue placeholder="Level" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Levels</SelectItem><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent>
              </Select>
              <Button variant="ghost" className="h-12 rounded-xl text-slate-400 font-bold" onClick={() => { setSearchTerm(""); setBoardFilter("all"); setSubjectFilter("all"); setDifficultyFilter("all"); }}>Clear</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-white/5 h-16">
                <TableHead className="px-10 text-[10px] font-black uppercase tracking-[0.2em]">Audit ID & Statement</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em]">Classification</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Key</TableHead>
                <TableHead className="text-right px-10 text-[10px] font-black uppercase tracking-[0.2em]">Audit Control</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5"><TableCell colSpan={4} className="px-10 py-8"><Skeleton className="h-14 w-full rounded-2xl bg-white/5" /></TableCell></TableRow>
                ))
              ) : filteredQuestions.map((q: any) => (
                <TableRow key={q.id} className="hover:bg-white/5 group border-white/5 transition-all duration-300">
                  <TableCell className="px-10 py-8 max-w-lg">
                    <div className="space-y-3">
                       <p className="font-bold text-slate-100 text-base leading-relaxed line-clamp-2">{q.questionEn}</p>
                       <div className="flex items-center gap-4">
                          <code className="text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">UUID: {q.id.slice(-8)}</code>
                          <span className="text-[10px] font-bold text-slate-600 italic">Added {new Date(q.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                       <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-slate-700 text-slate-400 w-fit">{q.boardId}</Badge>
                       <Badge className={`text-[9px] font-black uppercase tracking-widest border-none w-fit ${
                         q.difficulty === 'hard' ? 'bg-rose-500/10 text-rose-500' : 
                         q.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-500' : 
                         'bg-orange-500/10 text-orange-500'
                       }`}>{q.difficulty}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-sm shadow-xl">
                       {q.correctAnswer}
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-10">
                    <div className="flex justify-end gap-3 opacity-30 group-hover:opacity-100 transition-all duration-500">
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20" asChild>
                        <Link href={`/admin/questions/add?id=${q.id}`}><Edit className="h-5 w-5" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-rose-500/10 hover:text-rose-500 border border-transparent hover:border-rose-500/20" onClick={() => handleDelete(q.id)}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {!loading && filteredQuestions.length === 0 && (
        <div className="p-32 text-center bg-card/20 rounded-[4rem] border-2 border-dashed border-white/5">
           <Database className="h-20 w-20 text-slate-700 mx-auto mb-6" />
           <p className="text-2xl font-black font-headline uppercase text-slate-500">No MCQs Detected</p>
           <p className="text-slate-600 mt-2 font-medium">Refine your audit filters or add a new question to the bank.</p>
        </div>
      )}
    </div>
  )
}
