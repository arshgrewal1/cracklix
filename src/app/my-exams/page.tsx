"use client"

import React, { useMemo, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useCollection, useFirestore } from "@/firebase"
import { collection, query, where, doc, updateDoc, arrayRemove, arrayUnion, serverTimestamp } from "firebase/firestore"
import { 
  GraduationCap, 
  ChevronRight, 
  Plus, 
  Zap, 
  Trophy, 
  Target, 
  Activity, 
  Bell,
  CheckCircle2,
  Trash2,
  Settings,
  Loader2,
  Landmark,
  Clock,
  Layout,
  Search,
  X,
  Layers,
  Bookmark,
  ShieldCheck
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { AuthorityLogo } from "@/lib/exam-icons"
import Link from "next/link"

/**
 * @fileOverview Premium Minimalist My Exams Hub v7.1.
 * FIXED: Added missing ShieldCheck import to resolve runtime ReferenceError.
 */

const MODAL_CATEGORIES = [
  { id: "all", label: "All Exams" },
  { id: "punjab", label: "Punjab" },
  { id: "ssc", label: "SSC" },
  { id: "bank", label: "Bank" },
  { id: "teaching", label: "Teaching" },
  { id: "police", label: "Police" }
];

export default function MyExamsPage() {
  const { user, profile, loading: userLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  
  const [mounted, setMounted] = useState(false)
  const [unpinningId, setUnpinningId] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [settingsExam, setSettingsExam] = useState<any>(null)
  const [modalSearch, setModalSearch] = useState("")
  const [modalCategory, setModalCategory] = useState("all")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!userLoading && !user && mounted) router.push("/login?returnUrl=/my-exams")
  }, [user, userLoading, router, mounted])

  // Data Listeners
  const examsQuery = useMemo(() => (db && mounted ? collection(db, "exams") : null), [db, mounted]);
  const seriesQuery = useMemo(() => (db && mounted ? collection(db, "test_series") : null), [db, mounted]);
  const mocksQuery = useMemo(() => (db && mounted ? collection(db, "mocks") : null), [db, mounted]);
  const pyqsQuery = useMemo(() => (db && mounted ? collection(db, "pyqs") : null), [db, mounted]);
  const resultsQuery = useMemo(() => (db && user ? query(collection(db, "results"), where("userId", "==", user.uid)) : null), [db, user]);

  const { data: allExams, loading: examsLoading } = useCollection<any>(examsQuery)
  const { data: allTestSeries, loading: seriesLoading } = useCollection<any>(seriesQuery)
  const { data: mocks } = useCollection<any>(mocksQuery)
  const { data: pyqs } = useCollection<any>(pyqsQuery)
  const { data: results } = useCollection<any>(resultsQuery)

  const statsMap = useMemo(() => {
    const map: Record<string, { mocks: number, total: number, attempted: number, pyq: number }> = {};
    if (!mocks) return map;

    mocks.forEach(m => {
       const eids = m.examIds || (m.examId ? [m.examId] : []);
       const sId = m.seriesId;
       
       // Handle Exams
       eids.forEach((eid: string) => {
          if (!map[eid]) map[eid] = { mocks: 0, total: 0, attempted: 0, pyq: 0 };
          if (m.mockType === 'FULL') map[eid].mocks++;
          map[eid].total++;
          if (results?.some((r: any) => r.mockId === m.id)) map[eid].attempted++;
       });

       // Handle Series
       if (sId) {
          if (!map[sId]) map[sId] = { mocks: 0, total: 0, attempted: 0, pyq: 0 };
          map[sId].total++;
          if (results?.some((r: any) => r.mockId === m.id)) map[sId].attempted++;
       }
    });
    (pyqs || []).forEach(p => {
       if (p.examId) {
          if (!map[p.examId]) map[p.examId] = { mocks: 0, total: 0, attempted: 0, pyq: 0 };
          map[p.examId].pyq++;
          map[p.examId].total++;
       }
    });
    return map;
  }, [mocks, pyqs, results]);

  const pinnedExams = useMemo(() => {
    if (!allExams || !profile?.pinnedExams) return []
    return (allExams as any[]).filter((e: any) => profile.pinnedExams?.includes(e.id))
  }, [allExams, profile])

  const pinnedSeries = useMemo(() => {
     if (!allTestSeries || !profile?.pinnedSeries) return []
     return (allTestSeries as any[]).filter((s: any) => profile.pinnedSeries?.includes(s.id))
  }, [allTestSeries, profile])

  const topStats = useMemo(() => {
    const totalExams = pinnedExams.length;
    const totalSeries = pinnedSeries.length;
    
    let avgProg = 0;
    const combined = [...pinnedExams, ...pinnedSeries];
    if (combined.length > 0) {
      const sum = combined.reduce((acc, item) => {
        const s = statsMap[item.id];
        return acc + (s?.total > 0 ? (s.attempted / s.total) * 100 : 0);
      }, 0);
      avgProg = Math.round(sum / combined.length);
    }

    return [
      { label: "Target Hubs", val: totalExams + totalSeries, icon: GraduationCap },
      { label: "Tests Ready", val: combined.reduce((acc, item) => acc + (statsMap[item.id]?.total || 0), 0), icon: Zap },
      { label: "Attempts", val: results?.length || 0, icon: Activity },
      { label: "Avg Mastery", val: `${avgProg}%`, icon: Trophy },
    ];
  }, [pinnedExams, pinnedSeries, statsMap, results]);

  const handleUnpin = async (id: string, type: 'EXAM' | 'SERIES') => {
    if (!db || !user || unpinningId) return;
    setUnpinningId(id);
    const field = type === 'EXAM' ? 'pinnedExams' : 'pinnedSeries';
    try {
      await updateDoc(doc(db, "users", user.uid), { [field]: arrayRemove(id), updatedAt: serverTimestamp() });
      toast({ title: "Removed from dashboard" });
      setSettingsExam(null);
    } catch (e) {
      toast({ variant: "destructive", title: "Sync failed" });
    } finally { setUnpinningId(null); }
  };

  const handleAddExam = async (examId: string) => {
    if (!db || !user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), { pinnedExams: arrayUnion(examId), updatedAt: serverTimestamp() });
      toast({ title: "Exam added" });
    } catch (e) {
      toast({ variant: "destructive", title: "Sync failed" });
    }
  };

  const findExamsByBoard = (boardId: string) => {
    if (!allExams) return [];
    return allExams.filter((e: any) => e.boardId === boardId);
  };

  const filteredModalExams = useMemo(() => {
    if (!allExams) return [];
    return allExams.filter((e: any) => {
      const matchesSearch = !modalSearch || e.name.toLowerCase().includes(modalSearch.toLowerCase());
      const matchesCat = modalCategory === 'all' || e.boardId?.toLowerCase().includes(modalCategory) || e.categoryId?.toLowerCase().includes(modalCategory);
      return matchesSearch && matchesCat;
    });
  }, [allExams, modalSearch, modalCategory]);

  if (userLoading || !mounted) return <div className="h-screen w-full flex items-center justify-center bg-white"><Zap className="h-10 w-10 text-primary animate-pulse" /></div>;

  return (
    <div className="min-h-screen bg-white font-body text-left">
      <Navbar />
      
      <main className="container mx-auto px-6 md:px-12 py-10 md:py-16 max-w-4xl space-y-12 pb-32">
        
        {/* 1. MINIMAL HEADER */}
        <section className="flex items-start justify-between">
           <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tighter">My Exams</h1>
              <p className="text-slate-400 font-bold text-sm md:text-lg">Manage your target verticals from one hub.</p>
           </div>
           <button className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-primary transition-all">
              <Bell className="h-6 w-6" />
           </button>
        </section>

        {/* 2. ADD NEW EXAM BUTTON */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
           <DialogTrigger asChild>
              <Button className="w-full h-14 md:h-16 bg-[#1677FF] hover:bg-blue-700 text-white rounded-[24px] font-bold text-base shadow-none border-none transition-all active:scale-[0.98]">
                 <Plus className="h-5 w-5 mr-2" /> Add new exam
              </Button>
           </DialogTrigger>
           <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[90vh] bg-white rounded-[2rem] md:rounded-[3rem] border-none shadow-5xl p-0 overflow-hidden flex flex-col">
              <div className="h-2 w-full bg-[#1677FF] shrink-0" />
              <DialogHeader className="p-8 md:p-12 pb-4 shrink-0 text-left">
                 <DialogTitle className="text-3xl font-black text-[#0F172A] tracking-tighter">Exam registry</DialogTitle>
                 <DialogDescription className="text-slate-400 font-bold text-[10px] mt-2 uppercase tracking-widest">Select target preparation hubs</DialogDescription>
              </DialogHeader>

              <div className="px-8 md:px-12 py-4 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                 <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-[#1677FF] transition-colors" />
                    <Input 
                      value={modalSearch}
                      onChange={e => setModalSearch(e.target.value)}
                      className="h-14 md:h-16 pl-14 rounded-2xl bg-slate-50 border-none font-bold text-base shadow-inner" 
                      placeholder="Search exams..." 
                    />
                 </div>

                 <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                    {MODAL_CATEGORIES.map(cat => (
                       <button 
                         key={cat.id} 
                         onClick={() => setModalCategory(cat.id)}
                         className={cn(
                           "h-10 px-6 rounded-full font-bold text-[10px] tracking-tight transition-all border",
                           modalCategory === cat.id ? "bg-[#0F172A] border-[#0F172A] text-white shadow-xl" : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                         )}
                       >
                          {cat.label}
                       </button>
                    ))}
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    {filteredModalExams.map((e) => {
                       const isAdded = profile?.pinnedExams?.includes(e.id);
                       return (
                          <div key={e.id} className={cn(
                            "p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group",
                            isAdded ? "bg-primary/5 border-primary" : "bg-white border-slate-100 hover:border-slate-300 shadow-sm"
                          )}>
                             <div className="flex items-center gap-4 min-w-0">
                                <AuthorityLogo boardId={e.boardId} size="sm" className="h-12 w-12 shrink-0 bg-slate-50 shadow-inner" />
                                <div className="min-w-0">
                                   <h4 className="font-bold text-[#0F172A] text-sm md:text-base leading-tight truncate">{e.name}</h4>
                                   <p className="text-[9px] font-bold text-slate-300 mt-1 uppercase tracking-widest">{e.boardId} Authority</p>
                                </div>
                             </div>
                             <button 
                               onClick={() => handleAddExam(e.id)} 
                               disabled={isAdded}
                               className={cn(
                                 "h-10 w-10 rounded-xl p-0 transition-all active:scale-90 flex items-center justify-center border-none",
                                 isAdded ? "text-emerald-50 bg-emerald-500" : "text-slate-300 hover:text-primary hover:bg-primary/5 bg-transparent"
                               )}
                             >
                                {isAdded ? <CheckCircle2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                             </button>
                          </div>
                       )
                    })}
                 </div>
              </div>
              <DialogFooter className="p-8 md:p-10 pt-4 bg-slate-50 border-t border-slate-100 flex flex-row justify-center shrink-0">
                 <Button onClick={() => setIsAddModalOpen(false)} className="rounded-full px-12 h-14 bg-[#0F172A] hover:bg-black font-bold uppercase text-[10px] tracking-widest">Close Registry</Button>
              </DialogFooter>
           </DialogContent>
        </Dialog>

        {/* 3. QUICK STATS STRIP */}
        <section className="bg-white border border-slate-100 rounded-[28px] p-8 md:p-10 flex flex-row items-center justify-around md:justify-between shadow-sm overflow-x-auto no-scrollbar">
           {topStats.map((stat, i) => (
              <React.Fragment key={i}>
                 <div className="flex flex-col items-center gap-2 md:gap-3 text-center min-w-[80px]">
                    <stat.icon className={cn("h-4 w-4 md:h-5 md:w-5 text-primary")} />
                    <div className="space-y-0.5">
                       <p className="text-xl md:text-3xl font-black text-[#0F172A] tabular-nums tracking-tighter leading-none">{stat.val}</p>
                       <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    </div>
                 </div>
                 {i < topStats.length - 1 && <div className="hidden md:block w-px h-12 bg-slate-100" />}
              </React.Fragment>
           ))}
        </section>

        {/* 4. TARGET VERTICALS LIST */}
        <section className="space-y-10">
           <div className="space-y-1 px-1">
              <h2 className="text-xl md:text-2xl font-black text-[#0F172A] tracking-tight">Target verticals</h2>
              <p className="text-slate-400 font-bold text-[10px] md:text-sm">Active hubs in your preparation cycle</p>
           </div>

           <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                 {examsLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                       <div key={i} className="py-8 border-b border-slate-50 flex items-center gap-6" />
                    ))
                 ) : pinnedExams.length > 0 ? (
                    pinnedExams.map((exam, idx) => {
                       const s = statsMap[exam.id] || { mocks: 0, total: 0, attempted: 0, pyq: 0 };
                       const progress = s.total > 0 ? Math.round((s.attempted / s.total) * 100) : 0;
                       
                       return (
                          <motion.div 
                             key={exam.id} 
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0, scale: 0.98 }}
                             transition={{ delay: idx * 0.05 }}
                          >
                             <div className="group block py-6 md:py-8 border-b border-slate-100 hover:bg-slate-50/50 transition-all rounded-[24px] px-2 md:px-4 -mx-2 md:-mx-4 cursor-pointer" onClick={() => router.push(`/exams/view?id=${exam.id}`)}>
                                <div className="flex items-center gap-6">
                                   <div className="shrink-0 relative">
                                      <AuthorityLogo boardId={exam.boardId} size="md" className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-slate-50 border-none shadow-sm group-hover:scale-105 transition-transform" />
                                   </div>

                                   <div className="flex-1 min-w-0 space-y-4">
                                      <div className="space-y-2">
                                         <h3 className="text-lg md:text-2xl font-[800] text-[#0F172A] leading-none tracking-tight group-hover:text-[#1677FF] transition-colors">{exam.name}</h3>
                                         <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="outline" className="bg-[#1677FF]/5 text-[#1677FF] border-none text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-sm">{exam.boardId} Hub</Badge>
                                         </div>
                                      </div>

                                      <div className="flex items-center gap-4">
                                         <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div 
                                              initial={{ width: 0 }}
                                              animate={{ width: `${progress}%` }}
                                              transition={{ duration: 1.5, ease: "easeOut" }}
                                              className="h-full bg-[#1677FF] rounded-full" 
                                            />
                                         </div>
                                         <span className="text-[10px] md:text-sm font-black text-[#1677FF] tabular-nums min-w-[32px] text-right">{progress}%</span>
                                      </div>
                                   </div>

                                   <div className="shrink-0 flex items-center gap-4">
                                      <button 
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSettingsExam({...exam, type: 'EXAM'}); }}
                                        className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-primary active:scale-90 transition-all opacity-0 group-hover:opacity-100 hidden md:flex"
                                      >
                                         <Settings className="h-5 w-5" />
                                      </button>
                                      <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-primary transition-all">
                                         <ChevronRight className="h-6 w-6" />
                                      </div>
                                   </div>
                                </div>
                             </div>
                          </motion.div>
                       )
                    })
                 ) : !examsLoading && (
                    <div className="py-20 text-center opacity-40">
                       <Layout className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No target verticals registered</p>
                    </div>
                 )}
              </AnimatePresence>
           </div>
        </section>

        {/* 5. TARGET SERIES LIST */}
        <section className="space-y-10 pt-6">
           <div className="space-y-1 px-1">
              <h2 className="text-xl md:text-2xl font-black text-[#0F172A] tracking-tight">Pinned series</h2>
              <p className="text-slate-400 font-bold text-[10px] md:text-sm">Quick access to specialized preparation series</p>
           </div>

           <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                 {seriesLoading ? (
                    Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-24 w-full bg-slate-50 animate-pulse rounded-2xl" />)
                 ) : pinnedSeries.length > 0 ? (
                    pinnedSeries.map((ser, idx) => {
                       const s = statsMap[ser.id] || { total: 0, attempted: 0 };
                       const progress = s.total > 0 ? Math.round((s.attempted / s.total) * 100) : 0;
                       
                       return (
                          <motion.div 
                             key={ser.id} 
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0, scale: 0.98 }}
                             transition={{ delay: idx * 0.05 }}
                          >
                             <div className="group block py-6 md:py-8 border-b border-slate-100 hover:bg-slate-50/50 transition-all rounded-[24px] px-2 md:px-4 -mx-2 md:-mx-4 cursor-pointer" onClick={() => router.push(`/subjects/${ser.subjectId}/series/${ser.id}`)}>
                                <div className="flex items-center gap-6">
                                   <div className="shrink-0">
                                      <AuthorityLogo boardId={ser.boardId || "GENERAL"} size="sm" className="h-12 w-12 bg-white border border-slate-100 shadow-inner rounded-xl" />
                                   </div>
                                   <div className="flex-1 min-w-0">
                                      <h3 className="text-base md:text-lg font-bold text-[#0F172A] leading-tight mb-3 group-hover:text-primary transition-colors">{ser.title}</h3>
                                      <div className="flex items-center gap-4">
                                         <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress}%` }} />
                                         </div>
                                         <span className="text-[10px] font-black text-emerald-600 tabular-nums">{progress}%</span>
                                      </div>
                                   </div>
                                   <div className="shrink-0 flex items-center gap-3">
                                      <button 
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSettingsExam({...ser, type: 'SERIES'}); }}
                                        className="h-9 w-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-primary active:scale-90 transition-all md:opacity-0 group-hover:opacity-100"
                                      >
                                         <Settings className="h-4 w-4" />
                                      </button>
                                      <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-all" />
                                   </div>
                                </div>
                             </div>
                          </motion.div>
                       )
                    })
                 ) : !seriesLoading && (
                    <div className="py-20 text-center opacity-40">
                       <Layers className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No pinned series hubs</p>
                    </div>
                 )}
              </AnimatePresence>
           </div>
        </section>

        <div className="flex items-center justify-center gap-3 text-slate-300 pt-10 opacity-30">
           <ShieldCheck className="h-4 w-4" />
           <span className="text-[9px] font-bold uppercase tracking-[0.4em]">Institutional Registry Hardened</span>
        </div>

      </main>

      {/* SETTINGS DIALOG */}
      <Dialog open={!!settingsExam} onOpenChange={(o) => !o && setSettingsExam(null)}>
         <DialogContent className="sm:max-w-md w-[95vw] rounded-[2rem] md:rounded-[3rem] bg-white border-none shadow-5xl p-8 md:p-12 text-left">
            <div className="h-1.5 w-full bg-[#1677FF] absolute top-0 left-0" />
            <DialogHeader className="space-y-4">
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-[#1677FF] shadow-inner">
                     <Settings className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                     <DialogTitle className="text-2xl font-black text-[#0F172A] tracking-tighter uppercase">{settingsExam?.name || settingsExam?.title}</DialogTitle>
                     <DialogDescription className="text-slate-400 font-bold text-[9px] uppercase tracking-widest">{settingsExam?.type === 'EXAM' ? 'Vertical node control' : 'Series node control'}</DialogDescription>
                  </div>
               </div>
            </DialogHeader>

            <div className="py-8 space-y-6">
               <div className="bg-slate-50 rounded-2xl p-6 space-y-4 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Clock className="h-3 w-3" /> Quick Stats
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                     <div><p className="text-[8px] font-black text-slate-400 uppercase">Solved</p><p className="text-lg font-black text-[#0F172A]">{statsMap[settingsExam?.id]?.attempted || 0}</p></div>
                     <div><p className="text-[8px] font-black text-slate-400 uppercase">Archive</p><p className="text-lg font-black text-[#1677FF]">{statsMap[settingsExam?.id]?.total || 0}</p></div>
                  </div>
               </div>

               <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Lifecycle control</p>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleUnpin(settingsExam?.id, settingsExam?.type)}
                    disabled={unpinningId === settingsExam?.id}
                    className="w-full h-14 justify-start text-rose-500 hover:bg-rose-50 rounded-xl font-bold gap-3 border-none"
                  >
                     {unpinningId === settingsExam?.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                     Remove from dashboard
                  </Button>
               </div>
            </div>

            <DialogFooter>
               <Button onClick={() => setSettingsExam(null)} className="w-full h-14 rounded-full bg-[#0F172A] hover:bg-black text-white font-bold text-sm tracking-tight border-none shadow-xl">
                  Finish audit
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  )
}
