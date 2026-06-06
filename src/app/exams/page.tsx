
"use client"

import { useMemo, Suspense, useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query } from "firebase/firestore"
import { Input } from "@/components/ui/input"
import { Search, GraduationCap, ChevronRight, Zap, ShieldCheck, BookOpen, Layers, FileText } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * @fileOverview High-Density Responsive Exam Catalog v3.0.
 * Optimized: Uses 100% real-time aggregation logic from the 'mocks' collection.
 * Fixed: Replaced fake multipliers with accurate document counts.
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
  const [searchTerm, setSearchTerm] = useState("")

  const examsQuery = useMemo(() => (db ? query(collection(db, 'exams')) : null), [db])
  const boardsQuery = useMemo(() => (db ? query(collection(db, 'boards')) : null), [db])
  const mocksQuery = useMemo(() => (db ? query(collection(db, 'mocks')) : null), [db])

  const { data: exams, loading: examsLoading } = useCollection<any>(examsQuery)
  const { data: boards } = useCollection<any>(boardsQuery)
  const { data: mocks, loading: mocksLoading } = useCollection<any>(mocksQuery)

  // Institutional Aggregation Engine: Calculates live totals from the mocks registry
  const statsMap = useMemo(() => {
    if (!mocks) return {};
    const map: Record<string, any> = {};
    
    mocks.forEach(m => {
      const eid = m.examId;
      if (!eid) return;
      
      if (!map[eid]) {
        map[eid] = {
          full: 0,
          pyq: 0,
          sectional: 0,
          subjects: new Set<string>()
        };
      }
      
      if (m.mockType === 'FULL') map[eid].full++;
      if (m.mockType === 'PYQ') map[eid].pyq++;
      if (m.mockType === 'SECTIONAL') map[eid].sectional++;
      if (m.subjectId) map[eid].subjects.add(m.subjectId);
    });
    
    return map;
  }, [mocks]);

  const filteredExams = useMemo(() => {
    if (!exams) return [];
    return exams.filter((e: any) => e.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [exams, searchTerm])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 pb-safe overflow-x-hidden">
      <Navbar />
      <main className="container mx-auto px-4 py-6 md:py-16 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-16 gap-4 text-left">
          <div className="space-y-1">
             <div className="flex items-center gap-2">
                <GraduationCap className="h-3.5 w-3.5 text-primary" />
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Official Registry 2026</span>
             </div>
             <h1 className="text-2xl md:text-6xl font-headline font-black text-[#0F172A] uppercase tracking-tight leading-none">MASTER <span className="text-primary">CATALOG</span></h1>
             <p className="text-[11px] md:text-lg text-slate-500 font-medium">Connect with 100% verified preparation hubs.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input 
              className="pl-9 h-11 md:h-14 rounded-lg md:rounded-xl bg-white border-none shadow-sm text-sm" 
              placeholder="Search by recruitment name..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
           {examsLoading || mocksLoading ? (
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-[3.5rem]" />)
           ) : filteredExams.map((exam: any) => {
              const board = boards?.find((b: any) => b.id === exam.boardId);
              const stats = statsMap[exam.id] || { full: 0, pyq: 0, sectional: 0, subjects: new Set() };
              
              return (
                <Link key={exam.id} href={`/exams/${exam.id}`}>
                  <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 rounded-xl md:rounded-[3.5rem] bg-white group overflow-hidden text-left h-full flex flex-col border border-slate-100 p-4 md:p-10">
                       <div className="flex justify-between items-start mb-4 md:mb-10">
                          <div className="h-10 w-10 md:h-20 md:w-20 rounded-lg md:rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center relative overflow-hidden shrink-0">
                             {board?.iconUrl ? (
                                <img src={board.iconUrl} className="w-full h-full object-contain p-1.5 md:p-3" alt="Logo" referrerPolicy="no-referrer" />
                             ) : (
                                <GraduationCap className="h-5 w-5 md:h-10 md:w-10 text-slate-300" />
                             )}
                          </div>
                          <Badge className="bg-primary/5 text-primary border-none text-[6px] md:text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md">
                             {board?.abbreviation || 'GOVT'}
                          </Badge>
                       </div>
                       
                       <div className="space-y-1 md:space-y-4 flex-1">
                          <h3 className="text-[15px] md:text-3xl font-black text-[#0F172A] uppercase leading-tight group-hover:text-primary transition-colors">
                            {exam.name}
                          </h3>
                          <p className="text-[10px] md:text-sm font-medium text-slate-400 leading-relaxed line-clamp-1 md:line-clamp-2">
                            {exam.description || "Official syllabus and preparation matrix."}
                          </p>
                       </div>

                       {/* Institutional Reactive Counters: Fixed numbering issues */}
                       <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-6 pt-6 border-t border-slate-50">
                          <CounterNode icon={<Zap className="h-3 w-3 text-primary" />} val={stats.full} label="Full Mocks" />
                          <CounterNode icon={<BookOpen className="h-3 w-3 text-blue-500" />} val={stats.subjects.size} label="Subject Hubs" />
                          <CounterNode icon={<FileText className="h-3 w-3 text-emerald-500" />} val={stats.pyq} label="PYQ Archives" />
                          <CounterNode icon={<Layers className="h-3 w-3 text-orange-500" />} val={stats.sectional} label="Sectionals" />
                       </div>

                       <div className="mt-6 md:mt-10">
                          <Button variant="ghost" className="w-full h-9 md:h-16 rounded-lg md:rounded-2xl bg-slate-900 text-white group-hover:bg-primary transition-all font-black uppercase text-[8px] md:text-[10px] tracking-widest gap-2 shadow-lg">
                             Enter Hub <ChevronRight className="h-3 w-3 md:h-3.5 md:w-3.5" />
                          </Button>
                       </div>
                  </Card>
                </Link>
              )
           })}
        </div>
      </main>
      <Footer />
    </div>
  )
}

function CounterNode({ icon, val, label }: { icon: React.ReactNode, val: number, label: string }) {
  return (
    <div className="space-y-0.5">
       <div className="flex items-center gap-1.5">
          {icon}
          <p className="text-[10px] md:text-[12px] font-black text-[#0F172A]">{val}</p>
       </div>
       <p className="text-[6px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest pl-4.5">{label}</p>
    </div>
  )
}
