
"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter, Edit, Trash2, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

export default function QuestionBank() {
  const db = useFirestore()
  
  const questionsQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "questions"), orderBy("createdAt", "desc"))
  }, [db])

  const { data: questions, loading } = useCollection<any>(questionsQuery)

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Question Bank</h1>
          <p className="text-muted-foreground">Manage and audit {questions?.length || 0} questions across all exam categories.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="gap-2 border-primary/20 text-primary font-bold">
            <FileText className="h-4 w-4" /> Import CSV
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90 gap-2 font-bold shadow-xl shadow-primary/20">
            <Link href="/admin/questions/add">
              <Plus className="h-4 w-4" /> Add Question
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-foreground/5 bg-card/50 shadow-2xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-10 h-11" placeholder="Search by question text or ID..." />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" /> Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question ID</TableHead>
                <TableHead className="w-[400px]">Question Content</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-80" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : questions && questions.length > 0 ? (
                questions.map((q: any) => (
                  <TableRow key={q.id} className="hover:bg-white/5 group">
                    <TableCell className="font-mono text-[10px] text-muted-foreground uppercase">{q.id.slice(-6)}</TableCell>
                    <TableCell className="max-w-[400px]">
                      <p className="truncate font-bold text-primary text-sm">{q.text}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">{q.topic}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-secondary/10 text-secondary border-none text-[10px] font-bold">
                        {q.subjectId}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${
                        q.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' :
                        q.difficulty === 'Medium' ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'
                      } border-none text-[10px] font-bold`}>
                        {q.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/50 hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground font-bold">
                    The question bank is empty.
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
