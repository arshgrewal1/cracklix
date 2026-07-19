"use client"

import React, { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Zap, 
  Clock, 
  BookOpen, 
  ChevronRight, 
  Lock,
  Landmark,
  Filter,
  RefreshCw,
  ShieldCheck,
  Mic,
  Trophy,
  FileStack,
  Bookmark,
  Star,
  UserPlus,
  Play,
  Cpu,
  Calculator,
  Languages,
  GraduationCap,
  Layers,
  Timer,
  BrainCircuit,
  X,
  Target,
  BarChart3,
  History,
  Activity,
  AlertCircle,
  TrendingUp,
  Award,
  FileSearch,
  BookMarked,
  Newspaper,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, orderBy } from "firebase/firestore"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { AuthorityLogo } from "@/lib/exam-icons"
import { motion, AnimatePresence } from "framer-motion"

/**
 * @fileOverview Premium Practice Hub v6.2.
 * UPDATED: Normalized casing for text labels and headings.
 */

const QUICK_ACTIONS = [
  { label: "Bookmarks", icon: Bookmark, color: "text-rose-500", bg: "bg-rose-50", href: "/bookmarks" },
  { label: "Wrong questions", icon: X, color: "text-rose-600", bg: "bg-rose-100", href: "/revision" },
  { label: "Analytics", icon: BarChart3, color: "text-primary", bg: "bg-blue-50", href: "/dashboard" },
  { label: "History", icon: History, color: "text-slate-500", bg: "bg-slate-100", href: "/dashboard" },
  { label: "Rankings", icon: Trophy, color: "text-amber-600", bg: "bg-amber-50", href: "/leaderboard" },
  { label: "Downloads", icon: FileStack, color: "text-purple-500", bg: "bg-purple-50", href: "/notes" },
];

const CATEGORIES = [
  { id: "punjab-gk", label: "Punjab GK", icon: Landmark, color: "from-amber-400 to-orange-500" },
  { id: "reasoning", label: "Reasoning", icon: BrainCircuit, color: "from-blue-400 to-indigo-600" },
  { id: "math", label: "Math", icon: Calculator, color: "from-cyan-400 to-blue-600" },
  { id: "punjabi", label: "Punjabi", icon: GraduationCap, color: "from-rose-400 to-pink-600" },
  { id: "english", label: "English", icon: Languages, color: "from-emerald-400 to-teal-600" },
];

const FILTER_CHIPS = [
  { label: "All hubs", id: "all" },
  { label: "Not attempted", id: "NOT_ATTEMPTED" },
  { label: "Completed", id: "COMPLETED" },
  { label: "Free tests", id: "FREE" },
  { label: "Premium hub", id: "PREMIUM" },
  { label: "Popular", id: "POPULAR" },
];

export default function MockTestsPage() {
  const db = useFirestore()
  const { user, profile, loading: userLoading } = useUser()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState("all")

  // DATA ENGINE
  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), where("published", "==", true)) : null), [db])
  const resultsQuery = useMemo(() => (db && user ? query(collection(db, "results"), where("userId", "==", user.uid)) : null), [db, user])
  const boardsQuery = useMemo(() => (db ? collection(db, "boards") : null), [db])

  const { data: rawMocks, loading: mocksLoading } = useCollection<any>(mocksQuery)
  const { data: results } = useCollection<any>(resultsQuery)
  const { data: boards } = useCollection<any>(boardsQuery)

  const isPassActive = useMemo(() => {
    if (!profile) return false
    if (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') return true
    return profile.passStatus === 'active'
  }, [profile])

  const stats = useMemo(() => {
    if (!rawMocks) return { available: 0, attempted: 0, completed: 0, avgScore: 0 };
    const attemptedCount = results?.length || 0;
    const avgScore = results?.length ? Math.round(results.reduce((acc, r) => acc + (r.accuracy || 0), 0) / results.length) : 0;
    return { available: rawMocks.length, attempted: attemptedCount, avgScore };
  }, [rawMocks, results]);

  const filteredMocks = useMemo(() => {
    if (!rawMocks) return []
    return rawMocks.filter(m => {
      const search = searchTerm.toLowerCase().trim()
      const matchesSearch = !search || m.title?.toLowerCase().includes(search)
      const matchesCategory = !selectedCategory || m.title?.toLowerCase().includes(selectedCategory.toLowerCase()) || m.subjectId === selectedCategory
      
      const res = results?.find(r => r.mockId === m.id)
      if (activeFilter === 'COMPLETED') return matchesSearch && matchesCategory && !!res
      if (activeFilter === 'NOT_ATTEMPTED') return matchesSearch && matchesCategory && !res
      if (activeFilter === 'FREE') return matchesSearch && matchesCategory && m.accessLevel === 'FREE'
      if (activeFilter === 'PREMIUM') return matchesSearch && matchesCategory && m.accessLevel === 'PREMIUM'
      
      return matchesSearch && matchesCategory
    }).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  }, [rawMocks, searchTerm, selectedCategory, activeFilter, results])

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-left selection:bg-primary/10 flex flex-col overflow-x-hidden">
      <Navbar />
      
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-12 md:space-y-20 pb-[env(safe-area-inset-bottom,60px)]">
        
        {/* 1. PREMIUM DASHBOARD HEADER */}
        <section className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 px-1">
           <div className="space-y-3">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <Zap className="h-6 w-6 fill-current" />
                 </div>
                 <h1 className="text-3xl md:text-[44px] font-black tracking-tighter text-[#0F172A] leading-none">Practice hub</h1>
              </div>
              <p className="text-[#64748B] font-medium text-sm md:text-lg">Real-time mock tests based on latest commission patterns.</p>
           </div>

           <Card className="bg-white border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[24px] p-5 md:p-8 flex items-center gap-10 md:gap-16 shrink-0 relative overflow-hidden border">
              <div className="absolute top-0 right-0 p-4 opacity-[0.02]"><Activity className="h-24 w-24" /></div>
              <div className="flex flex-col gap-1 text-left">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Available</p>
                 <p className="text-2xl md:text-4xl font-black text-[#0F172A] tabular-nums tracking-tighter">{stats.available}</p>
              </div>
              <div className="w-px h-10 bg-slate-100" />
              <div className="flex flex-col gap-1 text-left">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">My solved</p>
                 <p className="text-2xl md:text-4xl font-black text-primary tabular-nums tracking-tighter">{stats.attempted}</p>
              </div>
              <div className="w-px h-10 bg-slate-100" />
              <div className="flex flex-col gap-1 text-left">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Avg score</p>
                 <p className="text-2xl md:text-4xl font-black text-emerald-500 tabular-nums tracking-tighter">{stats.avgScore}%</p>
              </div>
           </Card>
        </section>

        {/* 2. STICKY INTELLIGENCE BAR */}
        <div className="sticky top-[80px] z-[45] bg-[#F8FAFC]/90 backdrop-blur-xl -mx-4 px-4 py-4 md:py-6 border-b border-slate-100">
           <div className="max-w-5xl mx-auto space-y-6">
              <div className="relative group">
                 <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                    <Search className="h-6 w-6" />
                 </div>
                 <Input 
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                   placeholder="Search test name, series or subject..." 
                   className="h-16 md:h-20 pl-16 pr-14 rounded-[22px] bg-white border-slate-200 shadow-xl text-lg md:text-2xl font-bold placeholder:text-slate-200 focus:ring-4 focus:ring-primary/5 transition-all"
                 />
                 <button className="absolute right-6 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center text-slate-300 hover:text-primary transition-all">
                    <Filter className="h-6 w-6" />
                 </button>
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
                            : "bg-white border-slate-100 text-slate-400 hover:border-primary/40 hover:text-primary"
                      )}
                    >
                       {chip.label}
                    </button>
                 ))}
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14">
           {/* 3. MAIN TEST GRID */}
           <div className="lg:col-span-8 space-y-12">
              <div className="flex items-center justify-between px-2">
                 <div className="text-left space-y-1">
                    <h2 className="text-xl md:text-3xl font-black text-[#0F172A] tracking-tighter">Available tests</h2>
                    <p className="text-[10px] font-bold text-slate-400 tracking-tight">Showing {filteredMocks.length} specialized series</p>
                 </div>
                 <Badge className="bg-primary/10 text-primary border-none font-bold text-[10px] px-3 py-1 rounded-lg">Live hub</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                 {mocksLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-[32px] bg-white border border-slate-100" />)
                 ) : filteredMocks.length > 0 ? (
                    filteredMocks.map((mock, i) => {
                       const res = results?.find(r => r.mockId === mock.id);
                       const board = boards?.find(b => b.id === (mock.boardIds?.[0] || mock.boardId));
                       return <PremiumMockCard key={mock.id} mock={mock} result={res} board={board} isPassActive={isPassActive} index={i} />
                    })
                 ) : (
                    <div className="col-span-full py-40 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100 space-y-8 opacity-40">
                       <Zap className="h-20 w-20 mx-auto text-slate-200" />
                       <p className="text-xl font-bold text-slate-400 tracking-tight">No tests found in this filter</p>
                       <button onClick={() => { setActiveFilter('all'); setSearchTerm(''); }} className="h-11 px-8 rounded-full border border-slate-200 font-bold text-[10px] bg-white hover:bg-slate-50 transition-all">Clear Filter</button>
                    </div>
                 )}
              </div>

              {/* 4. SUBJECT COLLECTIONS GALLEY */}
              <section className="space-y-8 pt-10">
                 <div className="flex items-center gap-3 px-2">
                    <BookMarked className="h-6 w-6 text-primary" />
                    <h2 className="text-xl md:text-3xl font-black text-[#0F172A] tracking-tighter">Subject collections</h2>
                 </div>
                 <div className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-8 -mx-4 px-4 md:mx-0 md:px-0 w-full">
                    {CATEGORIES.map((cat, i) => (
                       <motion.div key={cat.id} whileHover={{ y: -6 }} className="shrink-0 w-[200px] md:w-[280px]">
                          <Link href={`/subjects/${cat.id}`}>
                             <Card className="p-8 md:p-10 border-slate-100 shadow-lg hover:shadow-4xl transition-all duration-500 rounded-[32px] bg-white group text-center space-y-8 h-full flex flex-col relative overflow-hidden">
                                <div className={cn("h-16 w-16 md:h-20 md:w-20 rounded-[2rem] bg-gradient-to-br flex items-center justify-center text-white mx-auto shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-transform relative z-10", cat.color)}>
                                   <cat.icon className="h-8 w-8 md:h-10 md:w-10" />
                                </div>
                                <div className="space-y-2 relative z-10">
                                   <h4 className="font-bold text-sm md:text-xl text-[#0F172A] leading-tight">{cat.label}</h4>
                                   <p className="text-[10px] font-bold text-slate-400">12+ Test Hubs</p>
                                </div>
                                <div className="pt-4 mt-auto">
                                   <Button variant="ghost" className="h-10 w-10 rounded-full bg-slate-50 text-slate-300 group-hover:bg-primary group-hover:text-white transition-all p-0">
                                      <ArrowRight className="h-4 w-4" />
                                   </Button>
                                </div>
                                <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none group-hover:scale-125 transition-all"><Star className="h-32 w-32" /></div>
                             </Card>
                          </Link>
                       </motion.div>
                    ))}
                 </div>
              </section>
           </div>

           {/* 5. RIGHT PERFORMANCE & QUICK ACTIONS */}
           <div className="lg:col-span-4 space-y-10 md:space-y-16">
              <Card className="border-none shadow-5xl bg-[#0F172A] text-white rounded-[32px] md:rounded-[40px] p-8 md:p-12 space-y-10 text-left relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-1000">
                    <Activity className="h-64 w-64 text-primary" />
                 </div>
                 <div className="relative z-10 space-y-10">
                    <div className="flex items-center justify-between">
                       <h3 className="text-2xl font-bold tracking-tight">Performance</h3>
                       <div className="h-11 w-11 bg-white/5 rounded-xl flex items-center justify-center text-primary shadow-inner border border-white/5"><TrendingUp className="h-5 w-5" /></div>
                    </div>

                    <div className="flex items-center justify-center py-6">
                       <div className="relative h-44 w-44 flex items-center justify-center">
                          <svg className="h-full w-full transform -rotate-90">
                             <circle cx="50%" cy="50%" r="44%" className="stroke-white/5 fill-none" strokeWidth="12" />
                             <motion.circle 
                               cx="50%" cy="50%" r="44%" 
                               className="stroke-primary fill-none" 
                               strokeWidth="12" 
                               strokeLinecap="round"
                               initial={{ strokeDashoffset: 276 }}
                               animate={{ strokeDashoffset: 276 - (276 * stats.avgScore / 100) }}
                               transition={{ duration: 1.5, ease: "easeOut" }}
                               style={{ strokeDasharray: 276 }}
                             />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                             <span className="text-4xl md:text-6xl font-black tracking-tighter tabular-nums text-white">{stats.avgScore}%</span>
                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Mastery</span>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <PerformanceSnippet label="Solved" val={stats.attempted} icon={<CheckCircle2 className="text-emerald-500 h-3 w-3" />} />
                       <PerformanceSnippet label="Merit" val="Participating" icon={<Trophy className="text-amber-500 h-3 w-3" />} />
                    </div>

                    <Button asChild variant="ghost" className="w-full text-primary font-bold tracking-tight gap-3 hover:bg-white/5 h-14 border border-white/5 rounded-2xl">
                       <Link href="/dashboard">View full registry <ArrowUpRight className="h-4 w-4" /></Link>
                    </Button>
                 </div>
              </Card>

              <div className="space-y-8">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-2">Quick access</h3>
                 <div className="grid grid-cols-2 gap-4">
                    {QUICK_ACTIONS.map((action, i) => (
                       <Link key={i} href={action.href}>
                          <div className="p-6 bg-white border border-slate-100 rounded-[24px] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-start gap-4 group active:scale-95 h-full relative overflow-hidden text-left">
                             <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform", action.bg, action.color)}>
                                <action.icon className="h-6 w-6" />
                             </div>
                             <span className="text-xs font-bold text-[#0F172A] tracking-tight">{action.label}</span>
                             <ChevronRight className="absolute right-6 bottom-7 h-4 w-4 text-slate-100 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </div>
                       </Link>
                    ))}
                 </div>
              </div>
           </div>
        </div>

      </main>
      <Footer />
    </div>
  )
}

function PerformanceSnippet({ label, val, icon }: any) {
   return (
      <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-2 text-left">
         <div className="flex items-center gap-2">
            {icon}
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
         </div>
         <p className="text-base md:text-xl font-black text-white tabular-nums truncate">{val}</p>
      </div>
   )
}

function PremiumMockCard({ mock, result, board, isPassActive, index }: any) {
   const isPremium = mock.accessLevel?.toUpperCase() === 'PREMIUM';
   const locked = isPremium && !isPassActive;
   const isCompleted = !!result;
   const maxMarks = (mock.totalQuestions || 25) * (mock.positiveMarks || 1);

   return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
         <Card className="border border-slate-100 shadow-xl hover:shadow-5xl transition-all duration-500 rounded-[32px] md:rounded-[40px] bg-white group flex flex-col relative overflow-hidden h-full">
            <CardContent className="p-8 md:p-10 space-y-8 flex-1 flex flex-col text-left">
               
               <div className="flex justify-between items-start w-full">
                  <div className="relative group-hover:rotate-6 transition-transform duration-500">
                    <AuthorityLogo board={board} boardId={mock.boardId} size="md" className="h-16 w-16 md:h-20 md:w-20 shadow-xl border-4 border-white bg-slate-50" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                     <div className="flex items-center gap-2">
                        {isPremium ? (
                           <Badge className="bg-amber-50 text-amber-600 border-none px-3 py-1 rounded-lg font-bold text-[9px] tracking-tight">Elite Pass</Badge>
                        ) : (
                           <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1 rounded-lg font-bold text-[9px] tracking-tight">Free Test</Badge>
                        )}
                        <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-primary transition-all active:scale-90 cursor-pointer shadow-inner">
                           <Bookmark className="h-4 w-4" />
                        </div>
                     </div>
                     <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100 shadow-inner">
                        <Star className="h-3 w-3 text-amber-400 fill-current" />
                        <span className="text-[10px] font-bold text-slate-500">4.8</span>
                     </div>
                  </div>
               </div>

               <div className="space-y-5 flex-1">
                  <div className="space-y-1.5">
                     <h3 className="text-xl md:text-2xl font-bold text-[#0F172A] group-hover:text-primary transition-colors leading-tight line-clamp-2">{mock.title}</h3>
                     <p className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Official pattern verified
                     </p>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-6 border-t border-slate-50">
                     <Metric icon={BookOpen} label={`${mock.totalQuestions} Questions`} />
                     <Metric icon={Timer} label={`${mock.duration}m Duration`} />
                     <Metric icon={Target} label={`${maxMarks} Marks`} />
                     {isCompleted ? (
                        <Metric icon={Trophy} label={`Score: ${result.score}`} highlight />
                     ) : (
                        <Metric icon={Layers} label={mock.difficulty || "Standard"} />
                     )}
                  </div>
               </div>

               {isCompleted && (
                  <div className="space-y-2.5 pt-4">
                     <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Subject mastery</span>
                        <span className="text-emerald-600">{result.accuracy}%</span>
                     </div>
                     <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${result.accuracy}%` }} />
                     </div>
                  </div>
               )}

               <div className="pt-8">
                  <Button asChild className={cn(
                    "w-full h-14 md:h-18 rounded-[18px] md:rounded-[24px] font-bold text-[10px] md:text-xs shadow-2xl transition-all active:scale-95 border-none gap-3 tracking-tight",
                    isCompleted ? "bg-emerald-600 hover:bg-emerald-700 text-white" :
                    locked ? "bg-amber-500 hover:bg-amber-600 text-white" :
                    "bg-[#0F172A] hover:bg-black text-white"
                  )}>
                     <Link href={locked ? '/pass' : isCompleted ? `/results/view?id=${mock.id}` : `/mocks/instructions?id=${mock.id}`}>
                        {isCompleted ? <BarChart3 className="h-4 w-4" /> : locked ? <Lock className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current text-primary" />}
                        {isCompleted ? 'View analysis' : locked ? 'Unlock pass' : 'Start preparation'}
                        <ChevronRight className="h-4 w-4 ml-auto opacity-30" />
                     </Link>
                  </Button>
               </div>
            </CardContent>
         </Card>
      </motion.div>
   )
}

function Metric({ icon: Icon, label, highlight }: any) {
   return (
      <div className="flex items-center gap-2.5 text-left">
         <Icon className="h-4 w-4 text-slate-300 shrink-0" />
         <div className="min-w-0">
            <p className={cn("text-[11px] font-bold leading-none truncate tracking-tight", highlight ? "text-primary" : "text-[#0F172A]")}>{label}</p>
         </div>
      </div>
   )
}
