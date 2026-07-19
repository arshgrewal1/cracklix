
"use client"

import React, { useMemo, useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useDoc, useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, doc } from "firebase/firestore"
import { Card } from "@/components/ui/card"
import { 
  Zap, 
  ChevronRight, 
  ShieldCheck, 
  Target, 
  Layers, 
  ArrowLeft,
  Trophy,
  LayoutGrid,
  ArrowRight,
  AlertCircle,
  BookOpen,
  Star,
  Clock,
  Search,
  CheckCircle2,
  FileStack,
  Bookmark,
  TrendingUp,
  Filter,
  Activity,
  Timer
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { TestSeries, Subject } from "@/types"
import { AuthorityLogo } from "@/lib/exam-icons"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Premium Subject Selection Hub v4.0.
 * Redesigned to match Testbook/Adda247 standards.
 */

const QUICK_ACTIONS = [
  { label: "Practice", icon: Target, color: "text-blue-500", bg: "bg-blue-50", href: "#series" },
  { label: "Mock Tests", icon: Zap, color: "text-orange-500", bg: "bg-orange-50", href: "#series" },
  { label: "PYQs", icon: FileStack, color: "text-purple-500", bg: "bg-purple-50", href: "/pyqs" },
  { label: "Bookmarks", icon: Bookmark, color: "text-rose-500", bg: "bg-rose-50", href: "/bookmarks" },
  { label: "Progress", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50", href: "/dashboard" },
];

const FILTER_CHIPS = [
  { id: "all", label: "All" },
  { id: "completed", label: "Completed" },
  { id: "in-progress", label: "In Progress" },
  { id: "Easy", label: "Easy" },
  { id: "Medium", label: "Medium" },
  { id: "Hard", label: "Hard" },
  { id: "newest", label: "Newest" },
  { id: "popular", label: "Popular" }
];

export default function SubjectDetailPortal() {
  const params = useParams()
  const subjectId = params?.id as string
  const db = useFirestore()
  const router = useRouter()
  const { user } = useUser()
  
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: subject, loading: sLoading } = useDoc<Subject>(useMemo(() => (db && subjectId ? doc(db, "subjects", subjectId) : null), [db, subjectId]));
  
  const seriesQuery = useMemo(() => (db && subjectId ? query(collection(db, "test_series"), where("subjectId", "==", subjectId)) : null), [db, subjectId]);
  const { data: rawSeries, loading: serLoading } = useCollection<TestSeries>(seriesQuery as any);

  const mocksQuery = useMemo(() => (db && subjectId ? query(collection(db, "mocks"), where("learningSubjectId", "==", subjectId)) : null), [db, subjectId]);
  const { data: rawMocks } = useCollection<any>(mocksQuery);

  const resultsQuery = useMemo(() => (db && user ? query(collection(db, "results"), where("userId", "==", user.uid)) : null), [db, user]);
  const { data: results } = useCollection<any>(resultsQuery);

  const mocks = useMemo(() => {
    if (!rawMocks) return [];
    return rawMocks.filter(m => m.published === true);
  }, [rawMocks]);

  const series = useMemo(() => {
     if (!rawSeries) return [];
     let base = rawSeries
        .filter(s => s.isActive !== false)
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

     if (searchTerm) {
        base = base.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));
     }

     if (activeFilter !== 'all') {
        if (['Easy', 'Medium', 'Hard'].includes(activeFilter)) {
           base = base.filter(s => s.difficulty === activeFilter);
        }
        // Logic for Completed/In-Progress can be added if backend tracks per-series progress
     }

     return base;
  }, [rawSeries, searchTerm, activeFilter]);

  const seriesStats = useMemo(() => {
    const map: Record<string, { total: number, qCount: number, attempted: number, progress: number }> = {};
    if (!rawSeries) return map;

    rawSeries.forEach(ser => {
      const testsInSer = (mocks || []).filter(m => m.seriesId === ser.id);
      const attempted = testsInSer.filter(m => (results || []).some((r: any) => r.mockId === m.id)).length;
      const qCount = testsInSer.reduce((acc, m) => acc + (m.totalQuestions || 0), 0);
      
      map[ser.id] = {
        total: testsInSer.length,
        qCount,
        attempted,
        progress: testsInSer.length > 0 ? Math.round((attempted / testsInSer.length) * 100) : 0
      };
    });
    return map;
  }, [rawSeries, mocks, results]);

  const totalSubjectStats = useMemo(() => {
     const totalSeries = series.length;
     const totalTests = mocks.length;
     const totalQuestions = mocks.reduce((acc, m) => acc + (m.totalQuestions || 0), 0);
     const totalAttempts = "1.2M"; // Static premium label or replace with real global logic

     return { totalSeries, totalTests, totalQuestions, totalAttempts };
  }, [series, mocks]);

  if (!mounted || sLoading) return <div className="h-screen w-full flex items-center justify-center bg-white"><Zap className="animate-spin text-primary h-10 w-10" /></div>

  if (!subject) return (
     <div className="h-screen flex flex-col items-center justify-center text-center space-y-6">
        <AlertTriangle className="h-16 w-16 text-slate-200" />
        <h2 className="text-2xl font-black">Subject Hub Not Found</h2>
        <Button onClick={() => router.push('/subjects')} variant="outline">Back to Vault</Button>
     </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-left selection:bg-primary/10">
      <Navbar />
      
      {/* 1. COMPACT PREMIUM HERO */}
      <section className="bg-white border-b border-slate-100 pt-6 pb-8 md:pt-12 md:pb-14 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
         
         <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10 space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
               <div className="relative shrink-0">
                  <div className="h-16 w-16 md:h-24 md:w-24 rounded-2xl md:rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform duration-500 overflow-hidden relative">
                     {subject.imageUrl ? (
                        <Image src={subject.imageUrl} alt={subject.name} fill className="object-cover" />
                     ) : (
                        <BookOpen className="h-8 w-8 md:h-12 md:w-12" />
                     )}
                  </div>
               </div>

               <div className="flex-1 text-center md:text-left space-y-3">
                  <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tighter leading-none">{subject.name}</h1>
                  <p className="text-slate-500 font-medium text-sm md:text-lg max-w-2xl leading-relaxed">{subject.description || "Master core concepts through verified mock tests."}</p>
               </div>

               <div className="flex flex-wrap justify-center md:justify-end gap-2 md:gap-3 shrink-0">
                  <StatsChip label="Series" val={totalSubjectStats.totalSeries} />
                  <StatsChip label="Tests" val={totalSubjectStats.totalTests} />
                  <StatsChip label="Items" val={totalSubjectStats.totalQuestions} />
                  <StatsChip label="Attempts" val={totalSubjectStats.totalAttempts} highlight />
               </div>
            </div>
         </div>
      </section>

      {/* 2. QUICK ACTIONS BAR */}
      <section className="bg-white border-b border-slate-50 py-4 overflow-x-auto no-scrollbar">
         <div className="container mx-auto px-4 md:px-8 max-w-7xl">
            <div className="flex items-center gap-3 md:gap-6 min-w-max">
               {QUICK_ACTIONS.map((action, i) => (
                  <Link key={i} href={action.href}>
                     <div className="flex items-center gap-3 px-6 py-2.5 rounded-full bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all group active:scale-95">
                        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center transition-all", action.bg, action.color)}>
                           <action.icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-bold text-[#0F172A] uppercase tracking-tight">{action.label}</span>
                     </div>
                  </Link>
               ))}
            </div>
         </div>
      </section>

      {/* 3. STICKY INTELLIGENCE HUB (SEARCH + FILTERS) */}
      <div className="sticky top-[80px] z-[45] bg-[#F8FAFC]/80 backdrop-blur-xl border-b border-slate-100 py-4 shadow-sm">
         <div className="container mx-auto px-4 md:px-8 max-w-7xl flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <div className="relative group w-full md:max-w-md">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
               <Input 
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 className="h-11 md:h-12 pl-12 rounded-xl bg-white border-slate-200 shadow-sm font-bold text-sm" 
                 placeholder="Search series or test nodes..." 
               />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0">
               {FILTER_CHIPS.map(chip => (
                  <button 
                    key={chip.id} 
                    onClick={() => setActiveFilter(chip.id)}
                    className={cn(
                       "h-9 px-5 rounded-full font-bold text-[10px] md:text-xs uppercase tracking-tight whitespace-nowrap transition-all border",
                       activeFilter === chip.id ? "bg-[#0F172A] border-[#0F172A] text-white shadow-xl" : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                    )}
                  >
                     {chip.label}
                  </button>
               ))}
            </div>
         </div>
      </div>

      <main className="container mx-auto px-4 md:px-8 py-10 md:py-16 max-w-7xl space-y-12 md:space-y-20">
         
         {/* 4. SERIES GRID */}
         <section id="series" className="space-y-8 md:space-y-12">
            <div className="flex items-center justify-between px-1">
               <div className="space-y-1">
                  <h2 className="text-xl md:text-3xl font-black text-[#0F172A] uppercase tracking-tight">Test series</h2>
                  <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Targeted practice modules</p>
               </div>
               <Button variant="ghost" className="text-primary font-black uppercase text-[10px] tracking-widest">
                  View All Hubs
               </Button>
            </div>

            {serLoading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-[2.5rem] bg-white border border-slate-50" />)}
               </div>
            ) : series.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                  {series.map((item, idx) => {
                     const stats = seriesStats[item.id] || { total: 0, qCount: 0, attempted: 0, progress: 0 };
                     return (
                        <motion.div 
                          key={item.id} 
                          whileHover={{ y: -8 }}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, delay: idx * 0.05 }}
                        >
                           <Link href={`/subjects/${subjectId}/series/${item.id}`}>
                              <Card className="border border-slate-100 shadow-xl hover:shadow-4xl transition-all duration-500 rounded-[2.5rem] bg-white group overflow-hidden flex flex-col p-6 md:p-10 text-left h-full">
                                 <div className="flex justify-between items-start mb-8">
                                    <div className="h-14 w-14 md:h-16 md:w-16 shrink-0 group-hover:rotate-6 transition-transform">
                                       <AuthorityLogo boardId={item.boardId} size="md" className="bg-slate-50 shadow-inner" />
                                    </div>
                                    <Badge className={cn(
                                       "border-none text-[8px] md:text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg shadow-sm",
                                       item.difficulty === 'Easy' ? "bg-emerald-50 text-emerald-600" : item.difficulty === 'Medium' ? "bg-blue-50 text-blue-600" : "bg-rose-50 text-rose-600"
                                    )}>{item.difficulty}</Badge>
                                 </div>

                                 <div className="space-y-4 flex-1">
                                    <h3 className="text-xl md:text-2xl font-black text-[#0F172A] group-hover:text-primary transition-colors leading-tight uppercase line-clamp-2">{item.title}</h3>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                       <SeriesStat icon={Zap} label="Tests" val={stats.total} />
                                       <SeriesStat icon={Layers} label="Questions" val={stats.qCount} />
                                       <SeriesStat icon={Timer} label="Avg Time" val="120m" />
                                       <SeriesStat icon={CheckCircle2} label="Solved" val={stats.attempted} color={stats.attempted > 0 ? "text-emerald-600" : ""} />
                                    </div>
                                 </div>

                                 <div className="mt-8 pt-8 border-t border-slate-50 space-y-6">
                                    <div className="space-y-3">
                                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                          <span className="text-slate-400">Mastery Index</span>
                                          <span className="text-primary tabular-nums">{stats.progress}%</span>
                                       </div>
                                       <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                          <motion.div initial={{ width: 0 }} whileInView={{ width: `${stats.progress}%` }} transition={{ duration: 1 }} className="h-full bg-primary shadow-lg shadow-primary/20" />
                                       </div>
                                    </div>
                                    
                                    <Button className="w-full h-12 md:h-14 bg-[#0F172A] group-hover:bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl transition-all border-none">
                                       Continue Prep <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                 </div>
                              </Card>
                           </Link>
                        </motion.div>
                     )
                  })}
               </div>
            ) : (
               <EmptyState title="No Series Available" sub="This hub is being populated by our audit team. Please check back later." />
            )}
         </section>
      </main>

      <Footer />
      {/* Spacer for bottom nav safety */}
      <div className="h-20 md:h-0" />
    </div>
  )
}

function StatsChip({ label, val, highlight }: { label: string, val: string | number, highlight?: boolean }) {
   return (
      <div className={cn(
         "px-4 py-2 rounded-xl flex flex-col items-center justify-center text-center shadow-sm border transition-all",
         highlight ? "bg-primary border-primary text-white shadow-xl shadow-primary/20" : "bg-white border-slate-100 text-[#0F172A]"
      )}>
         <span className="text-sm md:text-xl font-black leading-none tabular-nums">{val}</span>
         <span className={cn("text-[7px] md:text-[8px] font-bold uppercase tracking-wider mt-1 opacity-60", highlight && "opacity-80")}>{label}</span>
      </div>
   )
}

function SeriesStat({ icon: Icon, label, val, color }: any) {
   return (
      <div className="flex items-center gap-2">
         <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
            <Icon className="h-3.5 w-3.5 text-slate-400" />
         </div>
         <div className="min-w-0">
            <p className={cn("text-xs font-black text-[#0F172A] leading-none", color)}>{val}</p>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{label}</p>
         </div>
      </div>
   )
}

function EmptyState({ title, sub }: { title: string, sub: string }) {
  return (
    <div className="py-24 md:py-40 flex flex-col items-center justify-center text-center space-y-10 bg-white rounded-[4rem] border border-slate-100 shadow-2xl mx-1 animate-in zoom-in-95 duration-700 relative overflow-hidden w-full max-w-4xl mx-auto">
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
       <div className="relative">
          <div className="h-32 w-32 md:h-44 md:w-44 bg-slate-50 rounded-[3rem] md:rounded-[4rem] flex items-center justify-center text-slate-200 border-2 border-dashed border-slate-200 relative z-10">
             <Layers className="h-12 w-12 md:h-20 md:w-20" />
          </div>
          <div className="absolute -bottom-2 -right-2 h-12 w-12 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-100 z-20">
             <AlertCircle className="h-6 w-6 text-primary animate-pulse" />
          </div>
       </div>
       <div className="space-y-4 max-w-sm px-6 relative z-10">
          <h3 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tight uppercase leading-none">{title}</h3>
          <p className="text-slate-400 font-bold text-sm md:text-lg tracking-tight leading-relaxed">{sub}</p>
       </div>
       <div className="relative z-10 pt-4">
          <Button asChild className="h-14 px-10 bg-[#0F172A] text-white rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl border-none active:scale-95 transition-all">
             <Link href="/exams">Return to Exam Vault</Link>
          </Button>
       </div>
    </div>
  );
}
