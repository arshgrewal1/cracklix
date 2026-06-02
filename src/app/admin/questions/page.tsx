
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter, Edit, Trash2, FileText, Database, ArrowUpDown } from "lucide-react"
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
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")

  const questionsQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "questions"), orderBy("createdAt", "desc"))
  }, [db])

  const subjectsQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "subjects"))
  }, [db])

  const { data: questions, loading } = useCollection<any>(questionsQuery)
  const { data: subjects } = useCollection<any>(subjectsQuery)

  const filteredQuestions = useMemo(() => {
    if (!questions) return []
    return questions.filter(q => {
      const matchesSearch = q.text?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           q.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           q.id.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesSubject = subjectFilter === "all" || q.subjectId === subjectFilter
      const matchesDifficulty = difficultyFilter === "all" || q.difficulty === difficultyFilter
      
      return matchesSearch && matchesSubject && matchesDifficulty
    })
  }, [questions, searchTerm, subjectFilter, difficultyFilter])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question? This action cannot be undone.")) return
    try {
      await deleteDoc(doc(db, "questions", id))
      toast({ title: "Question Deleted", description: "Successfully removed from the global bank." })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: "Could not delete question." })
    }
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black font-headline text-primary">Global Question Bank</h1>
          <p className="text-muted-foreground mt-1">Institutional scale MCQ repository managed by Arsh Grewal.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="gap-2 border-foreground/10 h-12 px-6 rounded-xl font-bold">
            <FileText className="h-4 w-4" /> Bulk Import
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90 gap-2 font-black shadow-xl shadow-primary/20 h-12 px-8 rounded-xl uppercase tracking-widest text-xs">
            <Link href="/admin/questions/add">
              <Plus className="h-4 w-4" /> Create MCQ
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard icon={<Database className="text-primary" />} label="Total Bank" value={questions?.length || 0} color="primary" />
        <StatsCard icon={<Filter className="text-secondary" />} label="Subjects" value={subjects?.length || 0} color="secondary" />
        <StatsCard icon={<ArrowUpDown className="text-emerald-500" />} label="Active Series" value="48" color="emerald" />
        <StatsCard icon={<Search className="text-rose-500" />} label="Audit Required" value="12" color="rose" />
      </div>

      <Card className="border-foreground/5 bg-card/50 shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 border-b border-white/5 bg-muted/20">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="relative w-full lg:w-[40%]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                className="pl-12 h-14 rounded-2xl bg-background border-none shadow-inner text-lg" 
                placeholder="Search by text, topic or ID..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              <div className="space-y-1.5 flex-1 lg:min-w-[180px]">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Subject</p>
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger className="rounded-xl h-11 bg-background border-none shadow-sm">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 flex-1 lg:min-w-[180px]">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Difficulty</p>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="rounded-xl h-11 bg-background border-none shadow-sm">
                    <SelectValue placeholder="All Difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="ghost" className="mt-5 h-11 rounded-xl hover:bg-white/5" onClick={() => { setSearchTerm(""); setSubjectFilter("all"); setDifficultyFilter("all"); }}>
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-white/5">
                <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest">Question Information</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Metadata</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Options</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                <TableHead className="text-right px-8 text-[10px] font-black uppercase tracking-widest">Operations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5">
                    <TableCell className="px-8"><Skeleton className="h-10 w-64 rounded-xl" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-32 rounded-xl" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-md" /></TableCell>
                    <TableCell className="text-right px-8"><Skeleton className="h-10 w-24 ml-auto rounded-xl" /></TableCell>
                  </TableRow>
                ))
              ) : filteredQuestions.length > 0 ? (
                filteredQuestions.map((q: any) => (
                  <TableRow key={q.id} className="hover:bg-white/5 group border-white/5 transition-colors">
                    <TableCell className="px-8 py-6 max-w-[450px]">
                      <div className="space-y-1">
                        <p className="font-bold text-[#0F172A] text-base line-clamp-2 leading-relaxed">{q.text}</p>
                        <div className="flex items-center gap-3">
                           <span className="font-mono text-[9px] text-muted-foreground uppercase bg-slate-100 px-2 py-0.5 rounded">ID: {q.id.slice(-6)}</span>
                           <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Topic: {q.topic}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Badge variant="secondary" className="bg-secondary/10 text-secondary border-none text-[10px] font-black px-3 py-1 uppercase tracking-widest">
                          {q.subjectId}
                        </Badge>
                        <div className="flex items-center gap-1.5 ml-1">
                          <div className={`h-1.5 w-1.5 rounded-full ${q.difficulty === 'Easy' ? 'bg-green-500' : q.difficulty === 'Hard' ? 'bg-rose-500' : 'bg-orange-500'}`} />
                          <span className="text-[10px] font-bold text-slate-500">{q.difficulty}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <span className="text-xs font-black text-slate-400">4 Choices</span>
                    </TableCell>
                    <TableCell>
                       <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[9px] font-black uppercase tracking-widest">Verified</Badge>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <div className="flex justify-end gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl hover:bg-slate-100 hover:text-primary" asChild>
                          <Link href={`/admin/questions/add?id=${q.id}`}>
                            <Edit className="h-5 w-5" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-11 w-11 rounded-2xl hover:bg-rose-50 hover:text-rose-500" 
                          onClick={() => handleDelete(q.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-60 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Database className="h-16 w-16 mb-6 opacity-5" />
                      <p className="font-black font-headline text-2xl">No Results Match</p>
                      <p className="text-sm uppercase tracking-widest font-black opacity-30 mt-1">Adjust filters or search criteria for Arsh Grewal's Bank.</p>
                      <Button variant="outline" className="mt-6 rounded-xl" onClick={() => { setSearchTerm(""); setSubjectFilter("all"); setDifficultyFilter("all"); }}>
                        Reset All Filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function StatsCard({ icon, label, value, color }: any) {
  return (
    <Card className="border-foreground/5 bg-card/50 shadow-xl rounded-3xl overflow-hidden group hover:scale-[1.02] transition-all">
      <CardContent className="p-6 flex items-center gap-5">
        <div className={`h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/5 transition-colors`}>
          {icon}
        </div>
        <div>
          <p className="text-3xl font-black font-headline tracking-tighter">{value}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
