
"use client"

import React, { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, orderBy, doc } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Zap, 
  Clock, 
  BookOpen, 
  ChevronRight, 
  Layers, 
  Trophy,
  Filter,
  ArrowRight,
  ShieldCheck,
  Target,
  BarChart3,
  History,
  Activity,
  Star,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Gem,
  X,
  Smartphone,
  Calendar,
  Award,
  ArrowUpDown,
  Unlock,
  FileStack,
  BookMarked,
  Timer,
  Layout
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { AuthorityLogo } from "@/lib/exam-icons"
import { TestSeries, MockTest } from "@/types"
import { hasSeriesAccess } from "@/lib/access-control"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

/**
 * @fileOverview Institutional Practice Hub v4.0 [Compact Enterprise Redesign].
 * FIXED: Implemented Testbook-style compact cards for PWA optimization.
 * UI: Unified card dimensions with 2x3 stats grid and 48px CTAs.
 */

export default function PracticeHub() {
  const db = useFirestore()
  const { user, profile, loading: userLoading } = useUser()
  const router = useRouter()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  // Real-time Data Listeners
  const seriesQuery = useMemo(() => (db ? query(collection(db, "test_series"), where("isActive", "==", true)) : null), [db])
  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), where("published", "==", true)) : null), [db])
  const resultsQuery = useMemo(() => (db && user ? query(collection(db, "results"), where("userId", "==", user.uid)) : null), [db, user])

  const { data: rawSeries, loading: serLoading } = useCollection<TestSeries>(seriesQuery as any)
  const { data: allMocks, loading: mocksLoading } = useCollection<MockTest>(mocksQuery as any)
  const { data: results } = useCollection<any>(resultsQuery)

  const processedSeries = useMemo(() => {
    if (!rawSeries || !allMocks) return []
    
    return rawSeries.map(ser => {
      const testsInSer = allMocks.filter(m => m.seriesId === ser.id)
      const testIds = new Set(testsInSer.map(m => m.id))
      const seriesResults = results?.filter(r => testIds.has(r.mockId)) || []
      
      const attempted = seriesResults.length;
      const progress = testsInSer.length > 0 ? Math.round((attempted / testsInSer.length) * 100) : 0
      
      // Access Audit
      const accessNode = hasSeriesAccess(profile, ser);
      
      // Dynamic Content Analysis
      const counts = {
        mock: testsInSer.filter(m => m.mockType === 'FULL').length,
        subject: testsInSer.filter(m => m.mockType === 'SUBJECT').length,
        sectional: testsInSer.filter(m => m.mockType === 'SECTIONAL').length,
        pyq: testsInSer.filter(m => m.mockType === 'PYQ').length,
        ca: testsInSer.filter(m => m.mockType === 'CA_QUIZ' || m.mockType === 'DAILY_CHALLENGE').length,
        practice: testsInSer.filter(m => m.mockType === 'PRACTICE_SET').length,
        mini: testsInSer.filter(m => m.mockType === 'MINI_TEST').length,
        revision: testsInSer.filter(m => m.mockType === 'REVISION_TEST').length,
        questions: testsInSer.reduce((sum, m) => sum + (m.totalQuestions || 0), 0),
        free: testsInSer.filter(m => m.accessLevel === 'FREE').length,
        premium: testsInSer.filter(m => m.accessLevel === 'PREMIUM').length,
      };

      const avgAccuracy = seriesResults.length > 0 
        ? Math.round(seriesResults.reduce((s, r) => s + (r.accuracy || 0), 0) / seriesResults.length)
        : 0;
      
      return {
        ...ser,
        counts,
        testCount: testsInSer.length,
        attemptedCount: attempted,
        progress,
        avgAccuracy,
        hasPurchasedAccess: accessNode.hasAccess,
        accessStatus: accessNode.status
      }
    })
  }, [rawSeries, allMocks, results, profile])

  const filteredSeries = useMemo(() => {
    let base = processedSeries.filter(s => {
      const search = !searchTerm || s.title?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesAccess = activeFilter === 'all' || 
                           (activeFilter === 'FREE' && s.accessLevel === 'FREE') || 
                           (activeFilter === 'PREMIUM' && s.accessLevel === 'PREMIUM')
      const matchesDifficulty = activeFilter === 'all' || s.difficulty === activeFilter
      
      return search && (activeFilter === 'all' || matchesAccess || matchesDifficulty)
    })

    if (sortBy === 'newest') base.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    if (sortBy === 'alphabetical') base.sort((a, b) => a.title.localeCompare(b.title))
    if (sortBy === 'tests') base.sort((a, b) => (b.testCount || 0) - (a.testCount || 0))

    return base
  }, [processedSeries, searchTerm, activeFilter, sortBy])

  const totalStats = useMemo(() => {
     return {
        totalSeries: processedSeries.length,
        totalTests: allMocks?.length || 0,
        solved: results?.length || 0
     }
  }, [processedSeries, allMocks, results])

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-left flex flex-col overflow-x-hidden">
      <Navbar />
      
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6 md:space-y-10 pb-[calc(120px+env(safe-area-inset-bottom))]">
        
        {/* COMPACT DASHBOARD HEADER */}
        <section className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 px-1">
           <div className="space-y-1">
              <div className="flex items-center gap-3">
                 <div className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
                    <Zap className="h-5 w-5 fill-current" />
                 </div>
                 <h1 className="text-2xl md:text-4xl font-[900] tracking-tighter text-[#0F172A] antialiased">Practice hub</h1>
              </div>
              <p className="text-slate-500 font-medium text-xs md:text-base max-w-xl">Verified series with real-time state ranking.</p>
           </div>

           <div className="w-full lg:w-auto bg-white border-slate-100 shadow-sm rounded-2xl p-3 md:p-6 flex items-center justify-between lg:justify-start gap-3 md:gap-10 border overflow-hidden">
              <HeaderStat label="Series" val={totalStats.totalSeries} />
              <div className="w-px h-6 md:h-8 bg-slate-100" />
              <HeaderStat label="Mocks" val={totalStats.totalTests} color="text-primary" />
              <div className="w-px h-6 md:h-8 bg-slate-100" />
              <HeaderStat label="Attempts" val={totalStats.solved} color="text-emerald-600" />
           </div>
        </section>

        {/* COMPACT TOOLBAR */}
        <div className="sticky top-[80px] z-[45] bg-[#F8FAFC]/90 backdrop-blur-xl -mx-4 px-4 py-3 md:py-4 border-b border-slate-100">
           <div className="max-w-6xl mx-auto space-y-4">
              <div className="flex flex-col md:flex-row items-center gap-3">
                 <div className="relative group flex-1 w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <Input 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="Search series..." 
                      className="h-12 md:h-13 pl-12 rounded-xl bg-white border-slate-200 shadow-sm text-base font-bold"
                    />
                 </div>
                 
                 <div className="flex items-center gap-2 shrink-0">
                    <Select value={sortBy} onValueChange={setSortBy}>
                       <SelectTrigger className="h-11 md:h-12 rounded-full border-slate-100 bg-white shadow-sm font-bold text-[11px] text-[#0F172A] w-[140px] md:w-[160px] px-5 gap-2 border-none">
                          <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                          <SelectValue placeholder="Sort" />
                       </SelectTrigger>
                       <SelectContent className="rounded-2xl border-slate-100 shadow-5xl z-[2000] bg-white p-1">
                          <SelectItem value="newest" className="font-bold text-[11px] rounded-xl focus:bg-primary/5 py-2.5">Newest</SelectItem>
                          <SelectItem value="alphabetical" className="font-bold text-[11px] rounded-xl focus:bg-primary/5 py-2.5">A-Z</SelectItem>
                          <SelectItem value="tests" className="font-bold text-[11px] rounded-xl focus:bg-primary/5 py-2.5">Content</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
                 {FILTER_CHIPS.map(chip => (
                    <button 
                      key={chip.id} 
                      onClick={() => setActiveFilter(chip.id)}
                      className={cn(
                         "h-9 px-5 rounded-full font-bold text-[10px] md:text-xs tracking-tight transition-all border active:scale-95 shadow-sm whitespace-nowrap",
                         activeFilter === chip.id 
                            ? "bg-[#0F172A] border-[#0F172A] text-white" 
                            : "bg-white border-slate-100 text-slate-400 hover:text-primary"
                      )}
                    >
                       {chip.label}
                    </button>
                 ))}
              </div>
           </div>
        </div>

        {/* COMPACT ENTERPRISE GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
           {serLoading || mocksLoading ? (
              Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[380px] w-full rounded-[24px] bg-white border border-slate-100" />)
           ) : filteredSeries.length > 0 ? (
              filteredSeries.map((ser, i) => (
                 <motion.div 
                   key={ser.id} 
                   initial={{ opacity: 0, y: 15 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.05 }}
                   className="flex flex-col h-full"
                 >
                    <Link href={`/subjects/${ser.subjectId}/series/${ser.id}`} className="h-full">
                       <Card className="border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[24px] bg-white group flex flex-col h-full relative overflow-hidden text-left border-none">
                          <CardContent className="p-5 md:p-6 space-y-4 md:space-y-6 flex-1 flex flex-col">
                             
                             {/* Compact Header */}
                             <div className="flex justify-between items-start w-full">
                                <AuthorityLogo boardId={ser.boardId} size="sm" className="h-12 w-12 md:h-14 md:w-14 shadow-lg bg-slate-50 border-2 border-white" />
                                {ser.hasPurchasedAccess ? (
                                   <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1 rounded-full font-black text-[8px] uppercase tracking-widest shadow-sm">
                                      Purchased
                                   </Badge>
                                ) : (
                                   <Badge className="bg-amber-50 text-amber-600 border-none px-3 py-1 rounded-full font-black text-[8px] uppercase tracking-widest shadow-sm">
                                      Premium
                                   </Badge>
                                )}
                             </div>

                             {/* Compact Identity */}
                             <div className="space-y-2 flex-1">
                                <div className="space-y-1">
                                   <p className="text-[9px] font-black text-primary uppercase tracking-widest">{ser.difficulty || 'Expert'}</p>
                                   <h3 className="text-[17px] md:text-xl font-[800] text-[#0F172A] group-hover:text-primary transition-colors leading-tight line-clamp-2">
                                      {ser.title}
                                   </h3>
                                </div>
                                <p className="text-slate-400 font-medium text-[11px] md:text-xs line-clamp-2 leading-relaxed opacity-80">
                                   {ser.description || "Official pattern test series verified by institutional mentors."}
                                </p>
                             </div>

                             {/* High-Density 2-Column Stats Grid */}
                             <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pt-4 border-t border-slate-50">
                                <StatItem label="Items" val={ser.counts.totalTests} icon={Layers} />
                                <StatItem label="Questions" val={ser.counts.questions} icon={Target} />
                                {ser.counts.free > 0 && <StatItem label="Preview" val={ser.counts.free} icon={Unlock} color="text-emerald-600" />}
                                {ser.attemptedCount > 0 && <StatItem label="Solved" val={ser.attemptedCount} icon={CheckCircle2} color="text-emerald-500" />}
                                {ser.counts.pyq > 0 && <StatItem label="PYQs" val={ser.counts.pyq} icon={FileStack} />}
                                {ser.avgAccuracy > 0 && <StatItem label="Mastery" val={`${ser.avgAccuracy}%`} icon={Award} color="text-amber-600" />}
                             </div>

                             {/* Progress Line */}
                             <div className="space-y-2 pt-2">
                                <div className="flex justify-between items-center text-[8px] font-black uppercase text-slate-300 tracking-widest">
                                   <span>My Progress</span>
                                   <span className="text-primary tabular-nums">{ser.progress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100">
                                   <motion.div 
                                     initial={{ width: 0 }}
                                     animate={{ width: `${ser.progress}%` }}
                                     transition={{ duration: 1.2 }}
                                     className="h-full bg-primary" 
                                   />
                                </div>
                             </div>

                             {/* Compact CTA */}
                             <div className="pt-2">
                                <Button className="w-full h-11 md:h-12 rounded-xl bg-[#0F172A] group-hover:bg-primary text-white font-bold uppercase text-[10px] tracking-widest shadow-md transition-all active:scale-95 border-none flex items-center justify-between px-6">
                                   <span>
                                      {ser.progress === 0 ? "Start" : ser.progress === 100 ? "Analysis" : "Resume"}
                                   </span> 
                                   <ChevronRight className="h-4 w-4 opacity-40 group-hover:translate-x-1 transition-transform" />
                                </Button>
                             </div>
                          </CardContent>
                       </Card>
                    </Link>
                 </motion.div>
              ))
           ) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-30 italic font-black uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-[2rem] bg-white mx-1">
                 <Zap className="h-12 w-12 text-slate-300 mb-4" />
                 <p className="text-base">Registry standby</p>
              </div>
           )}
        </div>

        <div className="flex items-center justify-center gap-3 text-slate-300 py-6 opacity-40">
           <ShieldCheck className="h-4 w-4" />
           <span className="text-[9px] font-bold uppercase tracking-widest">Institutional registry sync</span>
        </div>

      </main>
      <Footer />
    </div>
  )
}

function HeaderStat({ label, val, color = "text-[#0F172A]" }: any) {
   return (
      <div className="flex flex-col gap-0.5 text-left">
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">{label}</p>
         <p className={cn("text-xl md:text-2xl font-[900] tabular-nums tracking-tighter leading-none", color)}>{val}</p>
      </div>
   )
}

function StatItem({ label, val, icon: Icon, color }: any) {
  return (
    <div className="flex items-center justify-between gap-2 min-w-0">
       <div className="flex items-center gap-1.5 min-w-0">
          <Icon className="h-3 w-3 text-slate-300 shrink-0" />
          <span className="text-[9px] font-bold text-slate-400 truncate tracking-tight">{label}</span>
       </div>
       <span className={cn("text-[11px] font-black tabular-nums tracking-tight", color || "text-[#0F172A]")}>{val}</span>
    </div>
  )
}
