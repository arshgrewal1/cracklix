
"use client"

import { useMemo, Suspense } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query } from "firebase/firestore"
import { Input } from "@/components/ui/input"
import { Search, Clock, BookOpen, GraduationCap, ChevronRight, Zap, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useSearchParams } from "next/navigation"

/**
 * @fileOverview Professional Exam Vertical Registry.
 * Features Regional vs National Hub separation.
 */

export default function ExamsCatalog() {
  return (
    <Suspense fallback={null}>
      <CatalogContent />
    </Suspense>
  )
}

function CatalogContent() {
  const db = useFirestore()
  const searchParams = useSearchParams()
  const regionParam = searchParams.get("region")

  const examsQuery = useMemo(() => (db ? query(collection(db, 'exams')) : null), [db])
  const boardsQuery = useMemo(() => (db ? query(collection(db, 'boards')) : null), [db])

  const { data: exams, loading: examsLoading } = useCollection<any>(examsQuery)
  const { data: boards, loading: boardsLoading } = useCollection<any>(boardsQuery)

  const regions = useMemo(() => {
    if (!exams || !boards) return { Punjab: [], National: [] };
    const punjabBoards = boards.filter((b: any) => b.region === 'Punjab').map((b: any) => b.id);
    return {
      Punjab: exams.filter((e: any) => punjabBoards.includes(e.boardId)),
      National: exams.filter((e: any) => !punjabBoards.includes(e.boardId))
    }
  }, [exams, boards])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />
      <main className="container mx-auto px-6 py-12 md:py-20 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 text-left">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Official Board Registry</span>
             </div>
             <h1 className="text-5xl md:text-7xl font-headline font-black text-[#0F172A] uppercase leading-[0.9] tracking-tight">Exam <br/> <span className="text-primary">Catalog</span></h1>
             <p className="text-slate-500 font-medium text-lg max-w-xl">
                Access verified preparation hubs for all Punjab Government and Central Recruitment Boards.
             </p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input className="pl-14 h-16 rounded-[1.5rem] bg-white border-none shadow-2xl shadow-slate-200/50 text-lg" placeholder="Search verticals..." />
          </div>
        </div>

        {/* Punjab Verticals */}
        {(!regionParam || regionParam === 'Punjab') && (
           <div className="space-y-10 mb-20">
              <div className="flex items-center gap-4">
                 <ShieldCheck className="h-8 w-8 text-emerald-600" />
                 <h2 className="text-3xl font-headline font-black uppercase text-[#0F172A] tracking-tight">Punjab State Verticals</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {examsLoading ? (
                   Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-[3rem]" />)
                 ) : regions.Punjab.map((exam: any) => (
                    <ExamVerticalCard key={exam.id} exam={exam} boards={boards} />
                 ))}
              </div>
           </div>
        )}

        {/* National Verticals */}
        {(!regionParam || regionParam === 'National') && (
           <div className="space-y-10">
              <div className="flex items-center gap-4">
                 <Zap className="h-8 w-8 text-blue-600" />
                 <h2 className="text-3xl font-headline font-black uppercase text-[#0F172A] tracking-tight">National / Central Verticals</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {examsLoading ? (
                   Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-[3rem]" />)
                 ) : regions.National.map((exam: any) => (
                    <ExamVerticalCard key={exam.id} exam={exam} boards={boards} />
                 ))}
              </div>
           </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

function ExamVerticalCard({ exam, boards }: any) {
  const board = boards?.find((b: any) => b.id === exam.boardId);
  return (
    <Link href={`/exams/${exam.id}`}>
      <Card className="border-none shadow-xl hover:shadow-4xl hover:-translate-y-2 transition-all duration-500 rounded-[3.5rem] bg-white group overflow-hidden text-left h-full flex flex-col border border-slate-100">
        <CardContent className="p-10 flex flex-col h-full">
           <div className="flex justify-between items-start mb-10">
              <div className="h-20 w-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center transition-all group-hover:shadow-xl shadow-inner relative overflow-hidden shrink-0">
                 {board?.iconUrl ? (
                    <img src={board.iconUrl} className="w-full h-full object-contain p-3" alt={board.abbreviation} referrerPolicy="no-referrer" />
                 ) : (
                    <GraduationCap className="h-10 w-10 text-slate-300" />
                 )}
              </div>
              <Badge className="bg-primary/5 text-primary border-none text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl">
                 {board?.abbreviation || 'OFFICIAL'}
              </Badge>
           </div>
           
           <div className="space-y-4 flex-1">
              <h3 className="font-headline text-3xl font-black text-[#0F172A] uppercase leading-[0.95] group-hover:text-primary transition-colors">
                {exam.name}
              </h3>
              <p className="text-sm font-medium text-slate-400 leading-relaxed line-clamp-2">
                {exam.description || "Official syllabus and preparation matrix."}
              </p>
           </div>

           <div className="mt-12 pt-8 border-t border-slate-50 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl group-hover:bg-white transition-all shadow-sm">
                 <Zap className="h-4 w-4 text-primary" />
                 <div className="flex flex-col">
                    <span className="text-xs font-black text-[#0F172A]">{exam.totalMocks || 0}</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Mocks</span>
                 </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl group-hover:bg-white transition-all shadow-sm">
                 <BookOpen className="h-4 w-4 text-blue-500" />
                 <div className="flex flex-col">
                    <span className="text-xs font-black text-[#0F172A]">{exam.activeQuestions || '1k+'}</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Nodes</span>
                 </div>
              </div>
           </div>

           <div className="mt-10">
              <Button variant="ghost" className="w-full h-16 rounded-2xl bg-slate-900 text-white group-hover:bg-primary transition-all shadow-xl font-black uppercase text-[10px] tracking-widest gap-3">
                 Open Exam Hub <ChevronRight className="h-4 w-4" />
              </Button>
           </div>
        </CardContent>
      </Card>
    </Link>
  )
}
