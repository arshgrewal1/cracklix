
"use client"

import React, { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, orderBy, doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore"
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
  Layout,
  Bookmark,
  Loader2
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
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

/**
 * @fileOverview Institutional Practice Hub v8.0 [Pin Feature Added].
 * FIXED: Added Pin/Bookmark functionality for Test Series.
 */

const FILTER_CHIPS = [
  { id: "all", label: "All Tests" },
  { id: "FREE", label: "Free Preview" },
  { id: "PREMIUM", label: "Premium Hub" },
];

export default function PracticeHub() {
  const db = useFirestore()
  const { user, profile, loading: userLoading } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [mounted, setMounted] = useState(false)
  const [pinningId, setPinningId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
       window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [])

  useEffect(() => {
    if (mounted && !userLoading && !user) {
      const returnUrl = window.location.pathname + window.location.search;
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [user, userLoading, router, pathname, mounted])

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
      
      const accessNode = hasSeriesAccess(profile, ser);
      
      const counts = {
        totalTests: testsInSer.length,
        questions: testsInSer.reduce((sum, m) => sum + (Number(m.totalQuestions) || 0), 0),
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
      const isAccessFilter = ['FREE', 'PREMIUM'].includes(activeFilter);
      const matchesAccess = !isAccessFilter || 
                           (activeFilter === 'FREE' && (s.accessLevel === 'FREE' || s.counts.free > 0)) || 
                           (activeFilter === 'PREMIUM' && (s.accessLevel === 'PREMIUM' || s.counts.premium > 0))
      return search && matchesAccess;
    })

    if (sortBy === 'newest') base.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    if (sortBy === 'alphabetical') base.sort((a, b) => a.title.localeCompare(b.title))
    if (sortBy === 'tests') base.sort((a, b) => (b.testCount || 0) - (a.testCount || 0))

    return base
  }, [processedSeries, searchTerm, activeFilter, sortBy])

  const handleToggleSeriesPin = async (e: React.MouseEvent, seriesId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!db || !user || pinningId) return;

    setPinningId(seriesId);
    const isPinned = profile?.pinnedSeries?.includes(seriesId);
    const userRef = doc(db, "users", user.uid);

    try {
      if (isPinned) {
        await updateDoc(userRef, { pinnedSeries: arrayRemove(seriesId), updatedAt: serverTimestamp() });
        toast({ title: "Removed from dashboard" });
      } else {
        await updateDoc(userRef, { pinnedSeries: arrayUnion(seriesId), updatedAt: serverTimestamp() });
        toast({ title: "Series pinned to dashboard" });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Sync failed" });
    } finally {
      setPinningId(null);
    }
  };

  const totalStats = useMemo(() => {
     return {
        totalSeries: processedSeries.length,
        totalTests: allMocks?.length || 0,
        solved: results?.length || 0
     }
  }, [processedSeries, allMocks, results])

  if (!mounted || userLoading || !user) return <div className="h-screen w-full flex items-center justify-center bg-white"><Zap className="h-10 w-10 text-primary animate-pulse" /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-left flex flex-col overflow-x-hidden">
      <Navbar />
      
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6 md:space-y-10 pb-32">
        
        {/* 1. COMPACT HEADER */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
           <div className="space-y-1">
              <div className="flex items-center gap-2">
                 <Zap className="h-4 w-4 text-[#1677FF] fill-current" />
                 <h1 className="text-xl md:text-3xl font-[900] text-[#071B4D] tracking-tight">Practice Hub</h1>
              </div>
              <p className="text-slate-500 font-medium text-xs md:text-sm">Verified series with real-time state ranking.</p>
           </div>

           {/* 2. SIMPLE STATS STRIP */}
           <div className="bg-white border border-[#E5EAF2] rounded-xl px-6 h-14 md:h-16 flex items-center gap-8 md:gap-12 shadow-sm shrink-0">
              <HeaderStat label="Series" val={totalStats.totalSeries} />
              <div className="w-px h-8 bg-[#E5EAF2]" />
              <HeaderStat label="Tests" val={totalStats.totalTests} color="text-[#1677FF]" />
              <div className="w-px h-8 bg-[#E5EAF2]" />
              <HeaderStat label="Attempts" val={totalStats.solved} color="text-[#10B981]" />
           </div>
        </section>

        {/* 3. SEARCH & CONTROLS */}
        <div className="space-y-4">
           <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative group flex-1 w-full">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-[#1677FF] transition-colors" />
                 <Input 
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                   placeholder="Search series title..." 
                   className="h-11 md:h-12 pl-11 rounded-xl bg-white border-[#E5EAF2] shadow-sm text-sm font-bold"
                 />
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                 <SelectTrigger className="h-11 md:h-12 rounded-xl border-[#E5EAF2] bg-white shadow-sm font-bold text-[11px] text-[#071B4D] w-full md:w-[160px] px-4 gap-2">
                    <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                    <SelectValue placeholder="Sort" />
                 </SelectTrigger>
                 <SelectContent className="rounded-xl border-[#E5EAF2] shadow-xl z-[2000] bg-white">
                    <SelectItem value="newest" className="font-bold text-[11px]">Newest</SelectItem>
                    <SelectItem value="alphabetical" className="font-bold text-[11px]">A-Z</SelectItem>
                    <SelectItem value="tests" className="font-bold text-[11px]">Content</SelectItem>
                 </SelectContent>
              </Select>
           </div>

           <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {FILTER_CHIPS.map(chip => (
                 <button 
                   key={chip.id} 
                   onClick={() => setActiveFilter(chip.id)}
                   className={cn(
                      "h-9 px-6 rounded-lg font-bold text-[10px] md:text-[11px] tracking-tight transition-all border active:scale-95 shadow-sm whitespace-nowrap",
                      activeFilter === chip.id 
                         ? "bg-[#1677FF] border-[#1677FF] text-white" 
                         : "bg-white border-[#E5EAF2] text-slate-500 hover:border-[#1677FF]"
                   )}
                 >
                    {chip.label}
                 </button>
              ))}
           </div>
        </div>

        {/* 4. CLASSIC SERIES LIST */}
        <div className="space-y-4">
           {serLoading || mocksLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl bg-white border border-[#E5EAF2]" />)
           ) : filteredSeries.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                 {filteredSeries.map((ser, i) => {
                    const isPremium = ser.accessLevel === 'PREMIUM' || ser.counts.premium > 0;
                    const isPinned = profile?.pinnedSeries?.includes(ser.id);
                    
                    return (
                       <motion.div 
                         key={ser.id} 
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: i * 0.03 }}
                       >
                          <Link href={`/subjects/${ser.subjectId}/series/${ser.id}`}>
                             <div className="bg-white border border-[#E5EAF2] hover:border-[#1677FF]/30 hover:shadow-lg transition-all duration-300 rounded-[20px] p-4 md:p-6 group flex flex-row items-start gap-4 md:gap-8 text-left relative overflow-hidden">
                                
                                {/* LEFT: LOGO HUB */}
                                <div className="shrink-0 mt-1">
                                   <AuthorityLogo 
                                      boardId={ser.boardId} 
                                      size="sm" 
                                      className="h-12 w-12 md:h-16 md:w-16 shadow-sm border border-[#E5EAF2] bg-[#F8FAFC] rounded-xl group-hover:scale-105 transition-transform" 
                                   />
                                </div>

                                {/* CENTER: CONTENT HUB */}
                                <div className="flex-1 min-w-0 space-y-2">
                                   <div className="space-y-1">
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                         <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-[#1677FF] uppercase tracking-widest leading-none">{ser.difficulty || 'Expert'}</span>
                                            {isPremium ? (
                                               <Badge className="bg-amber-50 text-amber-600 border-none px-2 py-0.5 rounded-md font-black text-[7px] uppercase tracking-widest h-5 flex items-center">Premium</Badge>
                                            ) : (
                                               <Badge className="bg-emerald-50 text-emerald-600 border-none px-2 py-0.5 rounded-md font-black text-[7px] uppercase tracking-widest h-5 flex items-center">Free</Badge>
                                            )}
                                         </div>
                                         <button 
                                           onClick={(e) => handleToggleSeriesPin(e, ser.id)}
                                           disabled={pinningId === ser.id}
                                           className={cn(
                                             "h-8 w-8 rounded-lg border flex items-center justify-center transition-all active:scale-90",
                                             isPinned ? "bg-primary/10 border-primary text-primary" : "bg-white border-slate-100 text-slate-300 hover:text-primary hover:border-primary/20"
                                           )}
                                         >
                                            {pinningId === ser.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bookmark className={cn("h-3.5 w-3.5", isPinned && "fill-current")} />}
                                         </button>
                                      </div>
                                      <h3 className="text-base md:text-xl font-[800] text-[#071B4D] group-hover:text-[#1677FF] transition-colors leading-tight tracking-tight">
                                         {ser.title}
                                      </h3>
                                   </div>
                                   
                                   <p className="text-[#64748B] font-medium text-[12px] md:text-[14px] line-clamp-2 leading-snug antialiased">
                                      {ser.description || "Official pattern test series verified by institutional mentors."}
                                   </p>

                                   <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] md:text-[13px] font-bold text-[#64748B] pt-2">
                                      <div className="flex items-center gap-1.5">
                                         <span className="text-[#071B4D] tabular-nums">{ser.counts.totalTests}</span> 
                                         <span className="opacity-50 uppercase text-[9px] tracking-tight font-black">Tests</span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                         <span className="text-[#071B4D] tabular-nums">{ser.counts.questions}</span> 
                                         <span className="opacity-50 uppercase text-[9px] tracking-tight font-black">Questions</span>
                                      </div>
                                      {ser.attemptedCount > 0 && (
                                         <div className="flex items-center gap-1.5 text-[#10B981]">
                                            <span>{ser.attemptedCount}</span> 
                                            <span className="opacity-50 uppercase text-[9px] tracking-tight font-black">Solved</span>
                                         </div>
                                      )}
                                      {ser.avgAccuracy > 0 && (
                                         <div className="flex items-center gap-1.5 text-[#F59E0B]">
                                            <span>{ser.avgAccuracy}%</span> 
                                            <span className="opacity-50 uppercase text-[9px] tracking-tight font-black">Mastery</span>
                                         </div>
                                      )}
                                   </div>
                                </div>

                                {/* RIGHT: ACTION HUB */}
                                <div className="shrink-0 self-center hidden sm:flex flex-col items-end gap-2">
                                   <Button className="h-10 px-6 bg-[#1677FF] hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl border-none shadow-md active:scale-95 transition-all">
                                      {ser.progress > 0 ? "Continue" : "Start"} →
                                   </Button>
                                   {ser.progress > 0 && (
                                      <div className="flex items-center gap-2">
                                         <div className="w-16 h-1 bg-[#F8FAFC] rounded-full overflow-hidden border border-[#E5EAF2]">
                                            <div className="h-full bg-[#1677FF]" style={{ width: `${ser.progress}%` }} />
                                         </div>
                                         <span className="text-[9px] font-black text-[#1677FF] tabular-nums">{ser.progress}%</span>
                                      </div>
                                   )}
                                </div>
                             </div>
                          </Link>
                       </motion.div>
                    )
                 })}
              </div>
           ) : (
              <div className="py-24 text-center opacity-30 italic font-black uppercase tracking-widest border-2 border-dashed border-[#E5EAF2] rounded-3xl bg-white">
                 <Zap className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                 <p className="text-sm">No series discovered in registry</p>
              </div>
           )}
        </div>

        <div className="flex items-center justify-center gap-3 text-slate-300 py-6 opacity-40">
           <ShieldCheck className="h-4 w-4" />
           <span className="text-[9px] font-bold uppercase tracking-widest">Institutional database sync active</span>
        </div>

      </main>
      <Footer />
    </div>
  )
}

function HeaderStat({ label, val, color = "text-[#071B4D]" }: any) {
   return (
      <div className="flex flex-col items-center md:items-start gap-0.5">
         <p className="text-xl md:text-2xl font-black tabular-nums leading-none tracking-tighter">{val}</p>
         <p className="text-[9px] md:text-[10px] font-[800] text-slate-400 tracking-tight">{label}</p>
      </div>
   )
}
