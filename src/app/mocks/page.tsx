
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
  Award
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { AuthorityLogo } from "@/lib/exam-icons"
import { TestSeries, MockTest } from "@/types"
import { hasSeriesAccess } from "@/lib/access-control"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

/**
 * @fileOverview Premium Practice Hub v2.0 [Series-Based Locking].
 */

const FILTER_CHIPS = [
  { label: "All series", id: "all" },
  { label: "Free", id: "FREE" },
  { label: "Premium", id: "PREMIUM" },
  { label: "Easy", id: "Easy" },
  { label: "Medium", id: "Medium" },
  { label: "Hard", id: "Hard" },
];

export default function PracticeHub() {
  const db = useFirestore()
  const { user, profile, loading: userLoading } = useUser()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedSeriesForPurchase, setSelectedSeriesForPurchase] = useState<any>(null)

  // Data Engine
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
      const attempted = results?.filter(r => testIds.has(r.mockId)).length || 0
      
      const progress = testsInSer.length > 0 ? Math.round((attempted / testsInSer.length) * 100) : 0
      
      // Access Audit
      const accessNode = hasSeriesAccess(profile, ser);
      
      return {
        ...ser,
        testCount: testsInSer.length,
        attemptedCount: attempted,
        progress,
        isLocked: !accessNode.hasAccess,
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
      const matchesDifficulty = activeFilter === 'all' || s.difficulty === activeFilter || matchesAccess
      
      return search && (activeFilter === 'all' || matchesAccess || s.difficulty === activeFilter)
    })

    if (sortBy === 'newest') base.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    if (sortBy === 'alphabetical') base.sort((a, b) => a.title.localeCompare(b.title))
    if (sortBy === 'tests') base.sort((a, b) => b.testCount - a.testCount)

    return base
  }, [processedSeries, searchTerm, activeFilter, sortBy])

  const stats = useMemo(() => {
     return {
        totalSeries: processedSeries.length,
        totalTests: allMocks?.length || 0,
        solved: results?.length || 0
     }
  }, [processedSeries, allMocks, results])

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-left flex flex-col overflow-x-hidden">
      <Navbar />
      
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-8 md:space-y-12">
        
        {/* HEADER & DASHBOARD */}
        <section className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 px-1">
           <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <Zap className="h-6 w-6 fill-current" />
                 </div>
                 <h1 className="text-3xl md:text-[44px] font-[900] tracking-tighter text-[#0F172A] leading-none antialiased">Practice hub</h1>
              </div>
              <p className="text-slate-500 font-medium text-sm md:text-lg max-w-xl">Master specific subjects with tiered test series and real-time state ranking.</p>
           </div>

           <Card className="w-full lg:w-auto bg-white border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[24px] p-5 md:p-8 flex items-center justify-between lg:justify-start gap-4 md:gap-12 border relative overflow-hidden">
              <div className="flex flex-col gap-0.5">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Series</p>
                 <p className="text-xl md:text-4xl font-black text-[#0F172A] tabular-nums tracking-tighter">{stats.totalSeries}</p>
              </div>
              <div className="w-px h-8 md:h-10 bg-slate-100" />
              <div className="flex flex-col gap-0.5">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total tests</p>
                 <p className="text-xl md:text-4xl font-black text-primary tabular-nums tracking-tighter">{stats.totalTests}</p>
              </div>
              <div className="w-px h-8 md:h-10 bg-slate-100" />
              <div className="flex flex-col gap-0.5">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">My solved</p>
                 <p className="text-xl md:text-4xl font-black text-emerald-600 tabular-nums tracking-tighter">{stats.solved}</p>
              </div>
           </Card>
        </section>

        {/* TOOLBAR */}
        <div className="sticky top-[80px] z-[45] bg-[#F8FAFC]/90 backdrop-blur-xl -mx-4 px-4 py-4 md:py-6 border-b border-slate-100">
           <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex flex-col md:flex-row items-center gap-4">
                 <div className="relative group flex-1 w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <Input 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="Search for series (e.g. Punjab History, Reasoning)..." 
                      className="h-16 md:h-18 pl-16 rounded-[22px] bg-white border-slate-200 shadow-xl text-lg font-bold"
                    />
                 </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
                 {FILTER_CHIPS.map(chip => (
                    <button 
                      key={chip.id} 
                      onClick={() => setActiveFilter(chip.id)}
                      className={cn(
                         "h-10 px-6 rounded-full font-bold text-[10px] md:text-xs tracking-tight transition-all border active:scale-95 shadow-sm whitespace-nowrap",
                         activeFilter === chip.id 
                            ? "bg-[#0F172A] border-[#0F172A] text-white shadow-xl" 
                            : "bg-white border-slate-100 text-slate-400 hover:text-primary"
                      )}
                    >
                       {chip.label}
                    </button>
                 ))}
              </div>
           </div>
        </div>

        {/* SERIES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
           {serLoading || mocksLoading ? (
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-[2.5rem] bg-white" />)
           ) : filteredSeries.length > 0 ? (
              filteredSeries.map((ser, i) => (
                 <motion.div 
                   key={ser.id} 
                   whileHover={{ y: ser.isLocked ? 0 : -8 }}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.05 }}
                   className="flex flex-col h-full"
                 >
                    <div 
                      onClick={() => ser.isLocked ? setSelectedSeriesForPurchase(ser) : router.push(`/subjects/${ser.subjectId}/series/${ser.id}`)}
                      className="cursor-pointer h-full"
                    >
                       <Card className={cn(
                         "border border-slate-100 shadow-xl hover:shadow-5xl transition-all duration-500 rounded-[2.5rem] bg-white group flex flex-col h-full relative overflow-hidden",
                         ser.isLocked && "opacity-80"
                       )}>
                          <CardContent className="p-8 md:p-10 space-y-8 flex-1 flex flex-col text-left">
                             <div className="flex justify-between items-start w-full relative z-10">
                                <AuthorityLogo boardId={ser.boardId} size="md" className="h-16 w-16 md:h-20 md:w-20 shadow-2xl bg-slate-50 border-4 border-white" />
                                <div className="flex flex-col items-end gap-2">
                                   {ser.isLocked ? (
                                      <Badge className="bg-amber-50 text-amber-600 border-none px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest shadow-sm flex items-center gap-1.5">
                                         <Lock className="h-3 w-3" /> Premium
                                      </Badge>
                                   ) : (
                                      <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest shadow-sm flex items-center gap-1.5">
                                         <CheckCircle2 className="h-3 w-3" /> Purchased
                                      </Badge>
                                   )}
                                </div>
                             </div>

                             <div className="space-y-4 flex-1 relative z-10">
                                <h3 className="text-xl md:text-2xl font-black text-[#0F172A] group-hover:text-primary transition-colors leading-tight line-clamp-2">
                                   {ser.title}
                                </h3>
                                <p className="text-slate-400 font-medium text-xs md:text-sm line-clamp-2 leading-relaxed">
                                   {ser.description || "Master these official pattern tests for superior preparation."}
                                </p>
                             </div>

                             <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50 relative z-10">
                                <SeriesStat icon={Layers} label="Tests" val={ser.testCount} />
                                <SeriesStat icon={CheckCircle2} label="Solved" val={ser.attemptedCount} highlight={ser.attemptedCount > 0} />
                             </div>

                             {!ser.isLocked && (
                                <div className="space-y-2.5 pt-6 relative z-10">
                                   <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                      <span>Preparation</span>
                                      <span className="text-primary tabular-nums">{ser.progress}%</span>
                                   </div>
                                   <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${ser.progress}%` }}
                                        className="h-full bg-primary" 
                                      />
                                   </div>
                                </div>
                             )}

                             <div className="pt-8 relative z-10">
                                <Button className={cn(
                                   "w-full h-14 rounded-2xl font-bold text-xs tracking-tight shadow-3xl transition-all active:scale-95 border-none",
                                   ser.isLocked ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-[#0F172A] group-hover:bg-primary text-white"
                                )}>
                                   {ser.isLocked ? "Unlock series" : "Continue prep"} 
                                   {ser.isLocked ? <Lock className="h-4 w-4 ml-auto" /> : <ChevronRight className="h-4 w-4 ml-auto opacity-30" />}
                                </Button>
                             </div>
                             
                             {ser.isLocked && (
                                <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                   <div className="h-16 w-16 rounded-full bg-white shadow-2xl flex items-center justify-center text-amber-500 scale-0 group-hover:scale-100 transition-transform duration-500">
                                      <Lock className="h-8 w-8" />
                                   </div>
                                </div>
                             )}
                          </CardContent>
                       </Card>
                    </div>
                 </motion.div>
              ))
           ) : (
              <div className="col-span-full py-40 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center gap-6 opacity-30">
                 <Zap className="h-16 w-16 text-slate-300" />
                 <p className="text-xl font-bold uppercase tracking-widest text-slate-400">Hub standby</p>
              </div>
           )}
        </div>

        {/* PURCHASE DIALOG */}
        <Dialog open={!!selectedSeriesForPurchase} onOpenChange={() => setSelectedSeriesForPurchase(null)}>
           <DialogContent className="sm:max-w-xl w-[95vw] rounded-[2.5rem] md:rounded-[3.5rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
              <div className="h-2 w-full bg-amber-500 shrink-0" />
              <div className="p-8 md:p-14 space-y-10 overflow-y-auto custom-scrollbar flex-1">
                 <div className="flex items-center gap-8 border-b border-slate-50 pb-10">
                    <AuthorityLogo boardId={selectedSeriesForPurchase?.boardId} size="lg" className="h-24 w-24 md:h-32 md:w-32 bg-slate-50 border-4 border-white shadow-2xl" />
                    <div className="space-y-2">
                       <Badge className="bg-amber-50 text-amber-600 border-none text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full">Premium pass</Badge>
                       <DialogTitle className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tighter leading-none">
                          {selectedSeriesForPurchase?.title}
                       </DialogTitle>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <PurchaseStat icon={Layers} label="Tests" val={selectedSeriesForPurchase?.testCount} />
                    <PurchaseStat icon={Smartphone} label="Android PWA" val="Active" />
                    <PurchaseStat icon={Calendar} label="Validity" val="365 Days" />
                    <PurchaseStat icon={ShieldCheck} label="Official" val="Verified" />
                 </div>

                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Series Benefits</p>
                    <div className="grid grid-cols-1 gap-3">
                       <BenefitNode text="Unlock all tests in this specific series." />
                       <BenefitNode text="Access detailed bilingual explanations." />
                       <BenefitNode text="Real-time All Punjab Rank calculation." />
                       <BenefitNode text="One year of premium access to this hub." />
                    </div>
                 </div>

                 <div className="pt-6">
                    <Button asChild className="w-full h-16 md:h-20 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-[0.2em] text-xs md:text-sm rounded-2xl md:rounded-[2.5rem] shadow-4xl border-none transition-all active:scale-95 flex items-center justify-between px-10">
                       <Link href="/pass">
                          <span>Buy Elite Pass</span>
                          <span className="text-2xl font-black">₹{selectedSeriesForPurchase?.price || 299}</span>
                       </Link>
                    </Button>
                    <p className="text-center text-[9px] font-bold text-slate-300 mt-6 uppercase tracking-widest">Secure institutional payment portal</p>
                 </div>
              </div>
           </DialogContent>
        </Dialog>

        <div className="flex items-center justify-center gap-4 text-slate-300 py-10 opacity-50">
           <ShieldCheck className="h-5 w-5" />
           <span className="text-[10px] font-bold uppercase tracking-widest">Institutional registry verified</span>
        </div>

      </main>
      <Footer />
    </div>
  )
}

function SeriesStat({ icon: Icon, label, val, highlight }: any) {
  return (
    <div className="flex flex-col gap-1 text-left">
       <div className="flex items-center gap-2 opacity-40">
          <Icon className="h-3.5 w-3.5 text-[#0F172A]" />
          <span className="text-[8px] font-black uppercase tracking-tight">{label}</span>
       </div>
       <p className={cn("text-base md:text-xl font-black tabular-nums tracking-tighter", highlight ? "text-emerald-600" : "text-[#0F172A]")}>{val}</p>
    </div>
  )
}

function PurchaseStat({ icon: Icon, label, val }: any) {
   return (
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center text-center gap-2">
         <Icon className="h-4 w-4 text-amber-500" />
         <div>
            <p className="text-sm font-black text-[#0F172A] leading-none tabular-nums">{val}</p>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</p>
         </div>
      </div>
   )
}

function BenefitNode({ text }: { text: string }) {
   return (
      <div className="flex items-center gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
         <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
         <p className="text-[11px] md:text-sm font-bold text-emerald-900 leading-tight">{text}</p>
      </div>
   )
}
