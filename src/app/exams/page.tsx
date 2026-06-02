
"use client"

import { useMemo } from "react"
import Navbar from "@/components/layout/Navbar"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query } from "firebase/firestore"
import { Input } from "@/components/ui/input"
import { Search, Clock, BookOpen } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

export default function ExamsCatalog() {
  const db = useFirestore()
  
  const examsQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, 'exams'))
  }, [db])

  const boardsQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, 'boards'))
  }, [db])

  const { data: exams, loading: examsLoading } = useCollection<any>(examsQuery)
  const { data: boards, loading: boardsLoading } = useCollection<any>(boardsQuery)

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-headline font-bold mb-2 text-[#0F172A]">Exam Catalog</h1>
            <p className="text-[#64748B] font-medium text-lg">Official catalog of all supported Punjab Government Recruitment Boards.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
            <Input className="pl-10 h-12 rounded-xl border-[#E2E8F0]" placeholder="Search exams or boards..." />
          </div>
        </div>

        {/* Board Filtering */}
        <div className="flex flex-wrap gap-2 mb-12">
          <Badge className="bg-[#F97316] text-white px-4 py-2 rounded-lg cursor-pointer">All Boards</Badge>
          {boardsLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-24 rounded-lg" />)
          ) : (
            boards?.map((board: any) => (
              <Badge key={board.id} variant="outline" className="px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-50 border-[#E2E8F0] text-[#475569]">
                {board.abbreviation}
              </Badge>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {examsLoading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-[2rem]" />)
          ) : (
            exams?.map((exam: any) => {
              const board = boards?.find(b => b.id === exam.boardId)
              return (
                <Card key={exam.id} className="bg-white border-[#F1F5F9] shadow-sm hover:shadow-xl transition-all duration-300 group rounded-[2rem] overflow-hidden flex flex-col">
                  <CardContent className="p-8 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-8">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#F97316] bg-orange-50 px-3 py-1 rounded border border-orange-100">
                        {board?.abbreviation || 'Official'}
                      </span>
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">
                        {exam.category}
                      </span>
                    </div>
                    
                    <h3 className="font-headline text-2xl font-black mb-4 text-[#0F172A] group-hover:text-[#F97316] transition-colors">
                      {exam.name}
                    </h3>
                    
                    <p className="text-sm text-[#64748B] font-medium leading-relaxed line-clamp-2 mb-8">
                      {exam.description}
                    </p>

                    <div className="mt-auto space-y-4 pt-8 border-t border-[#F8FAFC]">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.1em] text-[#94A3B8]">
                        <span className="flex items-center gap-2"><Clock className="h-3 w-3" /> Mock Tests</span>
                        <span className="text-[#0F172A]">{exam.totalMocks} Series</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.1em] text-[#94A3B8]">
                        <span className="flex items-center gap-2"><BookOpen className="h-3 w-3" /> Questions</span>
                        <span className="text-[#0F172A]">{exam.activeQuestions}+ MCQs</span>
                      </div>
                      <div className="pt-4">
                        <Button asChild className="w-full h-12 bg-[#0F172A] hover:bg-[#1E3A8A] text-white font-bold rounded-xl gap-2 shadow-lg shadow-blue-500/10">
                          <Link href={`/exams/${exam.id}`}>
                            Start Preparation →
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
