
"use client"

import React, { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser, useDoc } from "@/firebase"
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
  Activity
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

/**
 * @fileOverview Premium Subject Selection Hub v6.0.
 * Design: Linear / Stripe / Vercel Minimal Aesthetic.
 * Data: 100% Real-time Registry Sync.
 */

export default function SubjectsPage() {
  const db = useFirestore()
  const { user } = useUser()
  const [mounted, setMounted] = useState(false)
  
  // UI States
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "popular" | "progress">("name")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [boardFilter, setBoardFilter] = useState("all")

  useEffect(() => {
    setMounted(true)
  }, [])

  // Data Engine
  const subjectsQuery = useMemo(() => (db ? collection(db, "subjects") : null), [db])
  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), where("published", "==", true)) : null), [db])
  const resultsQuery = useMemo(() => (db && user ? query(collection(db, "results"), where("userId", "==", user.uid)) : null), [db, user])
  const boardsQuery = useMemo(() => (db ? collection(db, "boards") : null), [db])

  const { data: rawSubjects, loading: sLoading } = useCollection<Subject>(subjectsQuery as any)
  const { data: allMocks } = useCollection<any>(mocksQuery)
  const { data: results } = useCollection<any>(resultsQuery)
  const { data: boards } = useCollection<any>(boardsQuery)

  // Real-time Aggregation Logic
  const subjectNodes = useMemo(() => {
    if (!rawSubjects) return []
    
    const base = rawSubjects.filter(s => s.isActive === true).map(subject => {
      const subjectMocks = (allMocks || []).filter(m => m.learningSubjectId === subject.id)
      const mockIds = new Set(subjectMocks.map(m => m.id))
      const subjectResults = (results || []).filter(r => mockIds.has(r.mockId))
      
      const testCount = subjectMocks.length
      const attemptCount = subjectResults.length
      const avgScore = attemptCount > 0 
        ? Math.round(subjectResults.reduce((acc, r) => acc + (r.accuracy || 0), 0) / attemptCount) 
        : 0

      return {
        ...subject,
        testCount,
        attemptCount,
        avgScore
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
    if (sortBy === 'progress') filtered.sort((a, b) => b.avgScore - a.avgScore)

    return filtered
  }, [rawSubjects, allMocks, results, searchTerm, sortBy, boardFilter])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-white font-body text-left selection:bg-primary/10">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-8 py-8 md:py-16 max-w-[1440px] space-y-10">
        
        {/* 1. HEADER HUD (CLEAN) */}
        <header className="space-y-4 px-1">
           <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Registry sync active</span>
           </div>
           <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tighter">Subjects</h1>
           <p className="text-slate-500 font-medium text-sm md:text-lg max-w-2xl leading-snug">
              Professional preparation hubs mapped to official recruitment verticals.
           </p>
        </header>

        {/* 2. PREMIUM TOOLBAR */}
        <div className="bg-white border border-slate-100 rounded-2xl md:rounded-[1.5rem] p-2 md:p-3 shadow-sm sticky top-24 z-[45] flex flex-col md:flex-row items-center gap-3">
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
              <div className="h-11 md:h-12 bg-slate-50 rounded-xl px-4 flex items-center gap-3 shadow-inner">
                 <Filter className="h-4 w-4 text-slate-400" />
                 <select 
                   value={boardFilter}
                   onChange={e => setBoardFilter(e.target.value)}
                   className="bg-transparent border-none outline-none font-bold text-xs uppercase tracking-tight text-slate-600 cursor-pointer appearance-none min-w-[100px]"
                 >
                    <option value="all">All Boards</option>
                    {boards?.map(b => <option key={b.id} value={b.id}>{b.abbreviation}</option>)}
                 </select>
              </div>

              <div className="h-11 md:h-12 bg-slate-50 rounded-xl px-4 flex items-center gap-3 shadow-inner">
                 <ArrowUpDown className="h-4 w-4 text-slate-400" />
                 <select 
                   value={sortBy}
                   onChange={e => setSortBy(e.target.value as any)}
                   className="bg-transparent border-none outline-none font-bold text-xs uppercase tracking-tight text-slate-600 cursor-pointer appearance-none min-w-[100px]"
                 >
                    <option value="name">Sort A-Z</option>
                    <option value="popular">Popularity</option>
                    <option value="progress">Mastery</option>
                 </select>
              </div>

              <div className="hidden sm:flex h-11 md:h-12 bg-slate-100 p-1 rounded-xl items-center gap-1 shadow-inner">
                 <button onClick={() => setViewMode('grid')} className={cn("h-full px-3 rounded-lg transition-all", viewMode === 'grid' ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600")}>
                    <LayoutGrid className="h-4 w-4" />
                 </button>
                 <button onClick={() => setViewMode('list')} className={cn("h-full px-3 rounded-lg transition-all", viewMode === 'list' ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600")}>
                    <List className="h-4 w-4" />
                 </button>
              </div>
           </div>
        </div>

        {/* 3. SUBJECT GRID */}
        <div className={cn(
           "grid gap-6 md:gap-8",
           viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
        )}>
           <AnimatePresence mode="popLayout">
              {sLoading ? (
                 Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-64 w-full bg-slate-50 animate-pulse rounded-[22px]" />
                 ))
              ) : subjectNodes.length > 0 ? (
                 subjectNodes.map((s, idx) => (
                    <motion.div
                       key={s.id}
                       layout
                       initial={{ opacity: 0, y: 15 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       transition={{ delay: idx * 0.05 }}
                    >
                       <Link href={`/subjects/${s.id}`}>
                          <Card className="bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-6px] hover:border-primary/20 transition-all duration-500 rounded-[22px] overflow-hidden group flex flex-col h-full">
                             <CardContent className="p-8 space-y-6 flex-1 flex flex-col">
                                <div className="flex items-start justify-between">
                                   <div className="h-16 w-16 rounded-[1.25rem] bg-slate-50 flex items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                                      {s.imageUrl ? (
                                         <Image src={s.imageUrl} alt={s.name} fill className="object-cover" />
                                      ) : (
                                         <BookMarked className="h-8 w-8 text-slate-300" />
                                      )}
                                   </div>
                                   <Badge variant="outline" className="text-[8px] font-black uppercase border-slate-100 text-slate-300 tracking-widest">{s.boardId || 'hub'}</Badge>
                                </div>

                                <div className="space-y-2 flex-1">
                                   <h3 className="text-xl font-bold text-[#0F172A] group-hover:text-primary transition-colors leading-tight">{s.name}</h3>
                                   <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-2">
                                      {s.description || "Master the latest official patterns through verified mock test series."}
                                   </p>
                                </div>

                                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-50">
                                   <MetricPlate label="Tests" val={s.testCount} icon={<Zap className="text-primary h-3 w-3" />} />
                                   <MetricPlate label="Solved" val={s.attemptCount} icon={<Activity className="text-emerald-500 h-3 w-3" />} />
                                   <MetricPlate label="Mastery" val={`${s.avgScore}%`} icon={<Trophy className="text-amber-500 h-3 w-3" />} />
                                </div>

                                <div className="pt-4 mt-auto">
                                   <div className="flex items-center justify-between text-primary font-bold text-[10px] uppercase tracking-widest group-hover:gap-2 transition-all">
                                      <span>View Tests</span>
                                      <ChevronRight className="h-4 w-4" />
                                   </div>
                                </div>
                             </CardContent>
                          </Card>
                       </Link>
                    </motion.div>
                 ))
              ) : (
                 <div className="col-span-full py-40 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="h-24 w-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200">
                       <Zap className="h-10 w-10 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                       <h2 className="text-3xl font-black text-[#0F172A] tracking-tighter">Coming Soon</h2>
                       <p className="text-slate-400 font-medium uppercase text-[10px] tracking-[0.3em]">Mock available nahi hai</p>
                    </div>
                    <Button onClick={() => { setSearchTerm(""); setBoardFilter('all'); }} variant="outline" className="rounded-full px-8 h-12">Clear search</Button>
                 </div>
              )}
           </AnimatePresence>
        </div>

        {/* 4. TRUST BADGE */}
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
      <div className="flex flex-col gap-1 text-left min-w-0">
         <div className="flex items-center gap-1.5 opacity-40">
            {icon}
            <span className="text-[8px] font-black uppercase tracking-tight truncate">{label}</span>
         </div>
         <p className="text-sm font-black text-[#0F172A] tabular-nums leading-none truncate">{val}</p>
      </div>
   )
}
