"use client"

import React, { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, orderBy, doc } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Zap, 
  ChevronRight, 
  BookOpen, 
  Search,
  BookMarked,
  AlertCircle,
  LayoutGrid,
  List,
  ArrowUpDown,
  Filter,
  ShieldCheck,
  Target,
  Trophy,
  History,
  Activity,
  FileStack,
  Layers,
  ArrowRight,
  Clock,
  Unlock,
  Lock
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { Subject } from "@/types"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/**
 * @fileOverview Premium Subject Selection Hub v8.1.
 * UPDATED: Recalculated sticky offset to top-[84px] md:top-[116px] for reduced header height.
 */

export default function SubjectsPage() {
  const db = useFirestore()
  const { user, profile } = useUser()
  const [mounted, setMounted] = useState(false)
  
  // UI States
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [boardFilter, setBoardFilter] = useState("all")

  useEffect(() => {
    setMounted(true)
  }, [])

  // Data Engine - Subscribing to live collections
  const subjectsQuery = useMemo(() => (db ? collection(db, "subjects") : null), [db])
  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), where("published", "==", true)) : null), [db])
  const resultsQuery = useMemo(() => (db && user ? query(collection(db, "results"), where("userId", "==", user.uid)) : null), [db, user])
  const boardsQuery = useMemo(() => (db ? collection(db, "boards") : null), [db])
  const pyqsQuery = useMemo(() => (db ? collection(db, "pyqs") : null), [db])

  const { data: rawSubjects, loading: sLoading } = useCollection<Subject>(subjectsQuery as any)
  const { data: allMocks } = useCollection<any>(mocksQuery)
  const { data: results } = useCollection<any>(resultsQuery)
  const { data: boards } = useCollection<any>(boardsQuery)
  const { data: allPyqs } = useCollection<any>(pyqsQuery)

  // Real-time Aggregation Logic
  const subjectNodes = useMemo(() => {
    if (!rawSubjects) return []
    
    const base = rawSubjects.filter(s => s.isActive === true).map(subject => {
      const subjectMocks = (allMocks || []).filter(m => m.learningSubjectId === subject.id)
      const subjectPyqs = (allPyqs || []).filter(p => p.subjectId === subject.id)
      
      const mockIds = new Set(subjectMocks.map(m => m.id))
      const subjectResults = (results || []).filter(r => mockIds.has(r.mockId))
      
      const testCount = subjectMocks.filter(m => m.mockType !== 'FULL').length
      const mockCount = subjectMocks.filter(m => m.mockType === 'FULL').length
      const questionCount = subjectMocks.reduce((acc, m) => acc + (Number(m.totalQuestions) || 0), 0)
      const pyqCount = subjectPyqs.length
      
      const attemptCount = subjectResults.length
      const progress = subjectMocks.length > 0 
        ? Math.round((attemptCount / subjectMocks.length) * 100) 
        : 0

      // Identify if everything in this hub is premium
      const hasPremium = subjectMocks.some(m => m.accessLevel === 'PREMIUM');

      return {
        ...subject,
        testCount,
        mockCount,
        pyqCount,
        questionCount,
        attemptCount,
        progress,
        hasPremium
      }
    })

    // Filter & Search
    let filtered = base.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (boardFilter === 'all' || s.boardId === boardFilter)
    )

    // Sort
    if (sortBy === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name))
    if (sortBy === 'popular') filtered.sort((a, b) => b.attemptCount - a.attemptCount)
    if (sortBy === 'progress') filtered.sort((a, b) => b.progress - a.progress)

    return filtered
  }, [rawSubjects, allMocks, results, allPyqs, searchTerm, sortBy, boardFilter])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-left selection:bg-primary/10 flex flex-col overflow-x-hidden">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-8 py-8 md:py-16 max-w-[1440px] space-y-10">
        
        <header className="space-y-4 px-1">
           <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Registry sync active</span>
           </div>
           <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tighter antialiased leading-none">Subjects</h1>
           <p className="text-slate-500 font-medium text-sm md:text-lg max-w-2xl leading-snug">
              Professional preparation hubs mapped to official recruitment verticals.
           </p>
        </header>

        {/* PREMIUM TOOLBAR */}
        <div className="bg-white border border-slate-100 rounded-2xl md:rounded-[1.5rem] p-2 md:p-3 shadow-sm sticky top-[84px] md:top-[116px] z-[45] flex flex-col md:flex-row items-center gap-3">
           <div className="relative group flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
              <Input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="h-11 md:h-12 pl-11 rounded-xl bg-slate-50 border-none font-bold text-sm shadow-inner" 
                placeholder="Search subject hubs..." 
              />
           </div>

           <div className="flex items-center gap-2 w-full md:w-auto">
              <Select value={boardFilter} onValueChange={setBoardFilter}>
                 <SelectTrigger className="h-11 md:h-12 bg-slate-50 border-none rounded-xl px-5 font-bold text-xs shadow-inner w-[140px] md:w-[160px] gap-3">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <SelectValue placeholder="All Boards" />
                 </SelectTrigger>
                 <SelectContent className="rounded-2xl border-slate-100 shadow-5xl z-[2000] bg-white p-1">
                    <SelectItem value="all" className="font-bold text-[11px] rounded-xl focus:bg-primary/5 py-3 uppercase tracking-tight">All Boards</SelectItem>
                    {boards?.map(b => (
                       <SelectItem key={b.id} value={b.id} className="font-bold text-[11px] rounded-xl focus:bg-primary/5 py-3 uppercase tracking-tight">{b.abbreviation}</SelectItem>
                    ))}
                 </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                 <SelectTrigger className="h-11 md:h-12 bg-slate-50 border-none rounded-xl px-5 font-bold text-xs shadow-inner w-[140px] md:w-[160px] gap-3">
                    <ArrowUpDown className="h-4 w-4 text-slate-400" />
                    <SelectValue placeholder="Sort" />
                 </SelectTrigger>
                 <SelectContent className="rounded-2xl border-slate-100 shadow-5xl z-[2000] bg-white p-1">
                    <SelectItem value="name" className="font-bold text-[11px] rounded-xl focus:bg-primary/5 py-3 uppercase tracking-tight">Sort A-Z</SelectItem>
                    <SelectItem value="popular" className="font-bold text-[11px] rounded-xl focus:bg-primary/5 py-3 uppercase tracking-tight">Popularity</SelectItem>
                    <SelectItem value="progress" className="font-bold text-[11px] rounded-xl focus:bg-primary/5 py-3 uppercase tracking-tight">Mastery</SelectItem>
                 </SelectContent>
              </Select>
           </div>
        </div>

        {/* COMPACT ENTERPRISE GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
           <AnimatePresence mode="popLayout">
              {sLoading ? (
                 Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-80 w-full bg-white animate-pulse rounded-[24px] border border-slate-100" />
                 ))
              ) : subjectNodes.length > 0 ? (
                 subjectNodes.map((s, idx) => (
                    <motion.div
                       key={s.id}
                       layout
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       transition={{ duration: 0.3, delay: idx * 0.05 }}
                    >
                       <Link href={`/subjects/${s.id}`}>
                          <Card className="bg-white border border-slate-100 shadow-sm hover:shadow-4xl hover:translate-y-[-6px] transition-all duration-500 rounded-[24px] overflow-hidden group flex flex-col h-full min-h-[330px] md:min-h-[360px] relative text-left">
                             
                             <CardContent className="p-5 md:p-7 flex flex-col h-full space-y-4">
                                
                                {/* TOP ROW: Logo & Badges */}
                                <div className="flex items-center justify-between gap-4">
                                   <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-blue-50/80 flex items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-105 transition-transform shrink-0 border border-blue-100/50">
                                      {s.imageUrl ? (
                                         <Image src={s.imageUrl} alt={s.name} fill className="object-cover" />
                                      ) : (
                                         <BookMarked className="h-6 w-6 text-primary/60" />
                                      )}
                                   </div>
                                   <div className="flex items-center gap-2">
                                      {s.hasPremium && (
                                         <Badge className="bg-amber-50 text-amber-600 border-none text-[8px] font-black uppercase tracking-widest px-2 shadow-sm h-6">
                                            <Lock className="h-2.5 w-2.5 mr-1" /> Elite
                                         </Badge>
                                      )}
                                      <Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-400 text-[8px] font-black uppercase tracking-widest px-2 h-6">Subject Hub</Badge>
                                   </div>
                                </div>

                                {/* SECOND ROW: Title */}
                                <div className="space-y-1">
                                   <h3 className="text-lg md:text-xl font-[800] text-[#0F172A] group-hover:text-primary transition-colors leading-tight line-clamp-2 min-h-[2.4em]">
                                      {s.name}
                                   </h3>
                                   {/* THIRD ROW: Description */}
                                   <p className="text-[11px] md:text-xs text-slate-400 font-medium leading-relaxed line-clamp-2 h-[3em]">
                                      {s.description || "Master the latest official patterns through verified mock test series."}
                                   </p>
                                </div>

                                {/* FOURTH ROW: Statistics Grid */}
                                {(s.testCount > 0 || s.mockCount > 0 || s.pyqCount > 0) ? (
                                   <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pt-3 border-t border-slate-50">
                                      <MetricPlate label="Subject tests" val={s.testCount} icon={<BookOpen className="h-3 w-3" />} />
                                      <MetricPlate label="Mock tests" val={s.mockCount} icon={<Zap className="h-3 w-3" />} />
                                      <MetricPlate label="PYQs" val={s.pyqCount} icon={<FileStack className="h-3 w-3" />} />
                                      <MetricPlate label="Questions" val={s.questionCount} icon={<Layers className="h-3 w-3" />} />
                                   </div>
                                ) : (
                                   <div className="flex-1 flex items-center justify-center py-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Coming soon</p>
                                   </div>
                                )}

                                {/* FIFTH ROW: Progress Hub */}
                                {user && (s.testCount > 0 || s.mockCount > 0) && (
                                   <div className="space-y-2 pt-2">
                                      <div className="flex justify-between items-center text-[8px] font-black uppercase text-slate-400 tracking-widest">
                                         <span>Solved {s.attemptCount}/{s.testCount + s.mockCount}</span>
                                         <span className="text-primary">{s.progress}%</span>
                                      </div>
                                      <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100">
                                         <motion.div 
                                           initial={{ width: 0 }} 
                                           animate={{ width: `${s.progress}%` }} 
                                           transition={{ duration: 1.2 }} 
                                           className="h-full bg-primary" 
                                         />
                                      </div>
                                   </div>
                                )}

                                {/* BOTTOM ACTION */}
                                <div className="pt-4 mt-auto">
                                   <Button className="w-full h-[48px] md:h-[52px] rounded-xl bg-gradient-to-r from-[#0F172A] to-[#1E293B] group-hover:from-primary group-hover:to-blue-500 text-white font-bold uppercase text-[10px] tracking-widest shadow-lg transition-all active:scale-95 border-none flex items-center justify-center gap-2">
                                      {s.progress > 0 ? 'Continue learning' : 'Explore subject'}
                                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                                   </Button>
                                </div>
                             </CardContent>
                          </Card>
                       </Link>
                    </motion.div>
                 ))
              ) : (
                 <div className="col-span-full py-40 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="h-24 w-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 shadow-inner">
                       <Zap className="h-10 w-10 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                       <h2 className="text-3xl font-black text-[#0F172A] tracking-tighter">Coming Soon</h2>
                       <p className="text-slate-400 font-medium text-xs md:text-sm uppercase tracking-[0.3em]">No subjects matched your filter</p>
                    </div>
                    <Button onClick={() => { setSearchTerm(""); setBoardFilter('all'); }} variant="outline" className="rounded-full px-8 h-12 text-xs font-bold uppercase tracking-widest">Clear search</Button>
                 </div>
              )}
           </AnimatePresence>
        </div>

        <div className="pt-10 flex items-center justify-center gap-4 text-slate-300 opacity-50">
           <ShieldCheck className="h-5 w-5" />
           <span className="text-[10px] font-bold uppercase tracking-widest">Institutional Registry Verified</span>
        </div>

      </main>

      <Footer />
    </div>
  )
}

function MetricPlate({ label, val, icon }: any) {
   return (
      <div className="flex flex-col gap-0.5 text-left min-w-0">
         <div className="flex items-center gap-1.5 opacity-40">
            <span className="text-slate-400 shrink-0">{icon}</span>
            <span className="text-[8px] font-black uppercase tracking-tight truncate">{label}</span>
         </div>
         <p className="text-[12px] md:text-sm font-black text-[#0F172A] tabular-nums leading-none truncate pl-4.5">{val}</p>
      </div>
   )
}
