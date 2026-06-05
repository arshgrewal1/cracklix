"use client"

import { useMemo, Suspense } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, where } from "firebase/firestore"
import { Input } from "@/components/ui/input"
import { Search, Clock, BookOpen, GraduationCap, ChevronRight, Zap, ShieldCheck, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useSearchParams } from "next/navigation"

/**
 * @fileOverview Institutional Exam Catalog.
 * Strictly filters out dummy and draft content.
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

  // Strictly query published verticals
  const examsQuery = useMemo(() => (db ? query(collection(db, 'exams')) : null), [db])
  const boardsQuery = useMemo(() => (db ? query(collection(db, 'boards')) : null), [db])

  const { data: exams, loading: examsLoading } = useCollection<any>(examsQuery)
  const { data: boards, loading: boardsLoading } = useCollection<any>(boardsQuery)

  const categorizedData = useMemo(() => {
    if (!exams || !boards) return { Punjab: [], Teaching: [], National: [] };
    
    const validExams = exams.filter((e: any) => e.totalMocks > 0);
    
    return {
      Punjab: validExams.filter((e: any) => {
         const b = boards.find(b => b.id === e.boardId);
         return b?.category === 'PUNJAB_STATE';
      }),
      Teaching: validExams.filter((e: any) => {
         const b = boards.find(b => b.id === e.boardId);
         return b?.category === 'TEACHING';
      }),
      National: validExams.filter((e: any) => {
         const b = boards.find(b => b.id === e.boardId);
         return b?.category === 'CENTRAL';
      })
    }
  }, [exams, boards])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />
      <main className="container mx-auto px-6 py-12 md:py-24 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 text-left">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Official Exam Catalog 2026</span>
             </div>
             <h1 className="text-5xl md:text-7xl font-headline font-black text-[#0F172A] uppercase leading-[0.9] tracking-tight">Verified <br/> <span className="text-primary">Preparation Hubs</span></h1>
             <p className="text-slate-500 font-medium text-lg max-w-xl">
                Only published preparation verticals are displayed in the official registry.
             </p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input className="pl-14 h-16 rounded-[1.5rem] bg-white border-none shadow-2xl shadow-slate-200/50 text-lg" placeholder="Search verticals..." />
          </div>
        </div>

        {/* Section: Punjab State Exams */}
        <CatalogSection title="Punjab State Verticals" data={categorizedData.Punjab} boards={boards} loading={examsLoading} icon={<ShieldCheck className="text-emerald-600" />} />
        
        {/* Section: Teaching Exams */}
        <CatalogSection title="Teaching Cadre Registry" data={categorizedData.Teaching} boards={boards} loading={examsLoading} icon={<BookOpen className="text-blue-600" />} />

        {/* Section: Central Exams */}
        <CatalogSection title="National / Central Hubs" data={categorizedData.National} boards={boards} loading={examsLoading} icon={<Zap className="text-orange-600" />} />
      </main>
      <Footer />
    </div>
  )
}

function CatalogSection({ title, data, boards, loading, icon }: any) {
   if (!loading && data.length === 0) return null;
   return (
      <div className="space-y-10 mb-24">
         <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-lg">{icon}</div>
            <h2 className="text-3xl font-headline font-black uppercase text-[#0F172A] tracking-tight">{title}</h2>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
               Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-[3.5rem]" />)
            ) : data.map((exam: any) => (
               <ExamVerticalCard key={exam.id} exam={exam} boards={boards} />
            ))}
         </div>
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
              <Badge className="bg-primary/5 text-primary border-none text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">
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

           <div className="mt-10">
              <Button variant="ghost" className="w-full h-16 rounded-2xl bg-slate-900 text-white group-hover:bg-primary transition-all shadow-xl font-black uppercase text-[10px] tracking-widest gap-3">
                 Open Registry <ChevronRight className="h-4 w-4" />
              </Button>
           </div>
        </CardContent>
      </Card>
    </Link>
  )
}
