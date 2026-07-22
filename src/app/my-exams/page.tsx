
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
  Star, 
  Plus, 
  X, 
  Zap, 
  BookOpen, 
  Trophy, 
  Target, 
  ShieldCheck, 
  Search,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Flame,
  FileStack,
  Layers,
  Settings,
  Loader2,
  Landmark,
  Activity,
  Timer,
  BarChart3,
  TrendingUp,
  Award,
  Info,
  Clock
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
 * @fileOverview Premium Personalized Dashboard v5.3 [Data Hardened].
 * FIXED: Removed all hardcoded fallbacks for accuracy and solved questions.
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

  const examsQuery = useMemo(() => (db && mounted ? collection(db, "exams") : null), [db, mounted]);
  const mocksQuery = useMemo(() => (db && mounted ? collection(db, "mocks") : null), [db, mounted]);
  const pyqsQuery = useMemo(() => (db && mounted ? collection(db, "pyqs") : null), [db, mounted]);
  const resultsQuery = useMemo(() => (db && user ? query(collection(db, "results"), where("userId", "==", user.uid)) : null), [db, user]);
  const boardsQuery = useMemo(() => (db ? collection(db, "boards") : null), [db]);
  const subjectsQuery = useMemo(() => (db ? collection(db, "subjects") : null), [db]);

  const { data: allExams, loading: examsLoading } = useCollection<any>(examsQuery)
  const { data: mocks } = useCollection<any>(mocksQuery)
  const { data: pyqs } = useCollection<any>(pyqsQuery)
  const { data: boards } = useCollection<any>(boardsQuery)
  const { data: results } = useCollection<any>(resultsQuery)
  const { data: subjects } = useCollection<any>(subjectsQuery)

  const statsMap = useMemo(() => {
    const map: Record<string, { mocks: number, total: number, attempted: number, pyq: number }> = {};
    if (!mocks) return map;

    mocks.forEach(m => {
       const eids = m.examIds || (m.examId ? [m.examId] : []);
       eids.forEach((eid: string) => {
          if (!map[eid]) map[eid] = { mocks: 0, total: 0, attempted: 0, pyq: 0 };
          if (m.mockType === 'FULL') map[eid].mocks++;
          map[eid].total++;
          if (results?.some((r: any) => r.mockId === m.id)) map[eid].attempted++;
       });
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

  const topStats = useMemo(() => {
    const totalExams = pinnedExams.length;
    const totalMocks = pinnedExams.reduce((acc, e) => acc + (statsMap[e.id]?.mocks || 0), 0);
    
    let avgProg = 0;
    if (totalExams > 0) {
      const sum = pinnedExams.reduce((acc, e) => {
        const s = statsMap[e.id];
        return acc + (s?.total > 0 ? (s.attempted / s.total) * 100 : 0);
      }, 0);
      avgProg = Math.round(sum / totalExams);
    }

    return [
      { label: "Total exams", val: totalExams, icon: GraduationCap, color: "text-blue-500", bg: "bg-blue-50" },
      { label: "Mock tests", val: totalMocks, icon: Zap, color: "text-orange-500", bg: "bg-orange-50" },
      { label: "Practice rate", val: results?.length || 0, icon: Activity, color: "text-rose-500", bg: "bg-rose-50" },
      { label: "Mastery level", val: `${avgProg}%`, icon: Trophy, color: "text-emerald-500", bg: "bg-emerald-50" },
    ];
  }, [pinnedExams, statsMap, results]);

  const meritAnalytics = useMemo(() => {
    if (!results || results.length === 0) return { accuracy: 0, solved: 0, attemptRate: 0 };
    
    const totalAccuracy = results.reduce((acc, r) => acc + (r.accuracy || 0), 0);
    const totalSolved = results.reduce((acc, r) => acc + (r.correctCount || 0), 0);
    
    const pinnedExamIds = new Set(profile?.pinnedExams || []);
    const availableMocks = (mocks || []).filter(m => {
       const eids = m.examIds || (m.examId ? [m.examId] : []);
       return eids.some(eid => pinnedExamIds.has(eid));
    });
    
    const attemptRate = availableMocks.length > 0 
      ? Math.round((results.length / availableMocks.length) * 100) 
      : 0;

    return { 
      accuracy: Math.round(totalAccuracy / results.length), 
      solved: totalSolved, 
      attemptRate 
    };
  }, [results, mocks, profile]);

  const subjectWeightage = useMemo(() => {
    if (!results || results.length === 0 || !mocks) return [];
    
    const subMap: Record<string, { total: number, correct: number }> = {};
    
    results.forEach(res => {
      const mock = mocks.find(m => m.id === res.mockId);
      if (mock && mock.learningSubjectId) {
        const sId = mock.learningSubjectId;
        const sub = (subjects || []).find((s: any) => s.id === sId);
        const name = sub?.name || sId;
        if (!subMap[name]) subMap[name] = { total: 0, correct: 0 };
        subMap[name].total += res.totalQuestions;
        subMap[name].correct += res.correctCount;
      }
    });
    
    return Object.entries(subMap)
      .map(([name, data]) => ({
        name,
        val: Math.round((data.correct / data.total) * 100)
      }))
      .sort((a, b) => b.val - a.val)
      .slice(0, 3);
  }, [results, mocks, subjects]);

  const handleUnpin = async (examId: string) => {
    if (!db || !user || unpinningId) return;
    setUnpinningId(examId);
    try {
      await updateDoc(doc(db, "users", user.uid), { pinnedExams: arrayRemove(examId), updatedAt: serverTimestamp() });
      toast({ title: "Removed from dashboard" });
      if (settingsExam?.id === examId) setSettingsExam(null);
    } catch (e) {
      toast({ variant: "destructive", title: "Sync failed" });
    } finally { setUnpinningId(null); }
  };

  const handleAddExam = async (examId: string) => {
    if (!db || !user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), { pinnedExams: arrayUnion(examId), updatedAt: serverTimestamp() });
      toast({ title: "Exam added", description: "Dashboard synchronized." });
    } catch (e) {
      toast({ variant: "destructive", title: "Sync failed" });
    }
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
    <div className="min-h-screen bg-[#F8FAFC] font-body text-left selection:bg-primary/10">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-[1280px] space-y-12 pb-[calc(110px+env(safe-area-inset-bottom))]">
        
        {/* 1. HEADER */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-1">
           <div className="space-y-2">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                 <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-full font-bold text-[10px] tracking-tight">
                    📚 My preparation
                 </Badge>
              </motion.div>
              <div className="space-y-1">
                 <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-[#0F172A] leading-none antialiased">
                    My Exams
                 </h1>
                 <p className="text-slate-500 font-medium text-sm md:text-lg">Manage your target verticals from one hub.</p>
              </div>
           </div>

           <div className="flex items-center gap-4 w-full md:w-auto">
             <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                   <Button className="flex-1 md:flex-none h-14 md:h-16 px-10 bg-primary hover:bg-blue-700 text-white rounded-[20px] font-bold text-sm shadow-2xl transition-all active:scale-95 border-none shrink-0">
                      <Plus className="h-5 w-5 mr-3" /> Add new exam
                   </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[90vh] bg-white rounded-[2rem] md:rounded-[3rem] border-none shadow-5xl p-0 overflow-hidden flex flex-col">
                   <div className="h-2 w-full bg-primary shrink-0" />
                   <DialogHeader className="p-8 md:p-12 pb-4 shrink-0 text-left">
                      <DialogTitle className="text-3xl font-black text-[#0F172A] tracking-tighter">Exam registry</DialogTitle>
                      <DialogDescription className="text-slate-400 font-bold text-[10px] mt-2">Select a vertical to begin your journey.</DialogDescription>
                   </DialogHeader>

                   <div className="px-8 md:px-12 py-4 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                      <div className="relative group">
                         <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                         <Input 
                           value={modalSearch}
                           onChange={e => setModalSearch(e.target.value)}
                           className="h-14 md:h-16 pl-14 rounded-2xl bg-slate-50 border-none font-bold text-base shadow-inner" 
                           placeholder="Search exams like Patwari, Police, etc..." 
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
                                        <p className="text-[9px] font-bold text-slate-300 mt-1 uppercase tracking-widest">{e.boardId} Hub</p>
                                     </div>
                                  </div>
                                  <button 
                                    onClick={() => handleAddExam(e.id)} 
                                    disabled={isAdded}
                                    className={cn(
                                      "h-10 w-10 rounded-xl p-0 transition-all active:scale-90 flex items-center justify-center border-none",
                                      isAdded ? "text-emerald-500 bg-emerald-50" : "text-slate-300 hover:text-primary hover:bg-primary/5 bg-transparent"
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
                      <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                         <ShieldCheck className="h-3 w-3" /> Official registry sync active
                      </p>
                   </DialogFooter>
                </DialogContent>
             </Dialog>
           </div>
        </section>

        {/* 2. PERFORMANCE HUB: FIXED 4 COLUMNS ON ALL SCREENS */}
        <section className="px-1">
           <div className="grid grid-cols-4 gap-2 md:gap-8">
              {topStats.map((stat, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: i * 0.05 }}
                   className="w-full"
                 >
                    <Card className="border border-slate-100 bg-white shadow-md md:shadow-xl rounded-xl md:rounded-[28px] p-2 md:p-8 flex flex-col items-center justify-center text-center group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden h-[110px] md:h-auto">
                       <div className={cn("h-7 w-7 md:h-14 md:w-14 rounded-lg md:rounded-2xl flex items-center justify-center shadow-inner mb-2 md:mb-4", stat.bg, stat.color)}>
                          <stat.icon className="h-4 w-4 md:h-7 md:w-7" />
                       </div>
                       <div className="space-y-0 z-10 w-full px-1">
                          <p className="text-sm md:text-[34px] font-[900] text-[#0F172A] tracking-tighter tabular-nums leading-none">{stat.val}</p>
                          <p className="text-[7px] md:text-[10px] font-bold text-slate-400 mt-1 leading-tight break-words">{stat.label}</p>
                       </div>
                    </Card>
                 </motion.div>
              ))}
           </div>
        </section>

        {/* 3. PINNED EXAMS GRID */}
        <section className="space-y-10 md:space-y-14">
           <div className="flex items-center justify-between px-2">
              <div className="space-y-1">
                 <h2 className="text-xl md:text-3xl font-[800] text-[#0F172A] tracking-tighter">Target verticals</h2>
                 <p className="text-[10px] font-bold text-slate-400 tracking-tight">Active hubs in your preparation cycle</p>
              </div>
           </div>

           {examsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                 {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-[2.5rem] bg-white border border-slate-100" />)}
              </div>
           ) : pinnedExams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                 {pinnedExams.map((exam: any, idx: number) => {
                    const s = statsMap[exam.id] || { mocks: 0, total: 0, attempted: 0, pyq: 0 };
                    const progress = s.total > 0 ? Math.round((s.attempted / s.total) * 100) : 0;
                    const board = boards?.find((b: any) => b.id === exam.boardId || b.abbreviation === exam.boardId);

                    return (
                       <motion.div
                         key={exam.id}
                         initial={{ opacity: 0, y: 25 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: idx * 0.1 }}
                         className="flex"
                       >
                          <Card className="border border-slate-100 shadow-2xl hover:shadow-[0_40px_100px_rgba(0,0,0,0.08)] transition-all duration-500 rounded-[2.5rem] md:rounded-[3rem] bg-white group flex flex-col relative overflow-hidden w-full">
                             <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
                                <button 
                                  onClick={() => setSettingsExam(exam)}
                                  className="h-10 w-10 rounded-xl bg-white/80 backdrop-blur-md border border-slate-100 flex items-center justify-center text-slate-300 hover:text-primary active:scale-90 transition-all shadow-sm cursor-pointer"
                                >
                                   <Settings className="h-5 w-5" />
                                </button>
                             </div>

                             <CardContent className="p-8 md:p-12 flex flex-col flex-1 text-center md:text-left">
                                <div className="mb-8 md:mb-10 flex justify-center md:justify-start">
                                   <div className="relative group-hover:scale-110 transition-transform duration-500">
                                      <AuthorityLogo board={board} boardId={exam.boardId} size="md" className="h-16 w-16 md:h-24 md:w-24 shadow-2xl bg-slate-50 border-4 border-white" />
                                   </div>
                                </div>

                                <div className="space-y-6 flex-1">
                                   <div className="space-y-2">
                                      <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                                         <Badge className="bg-primary/5 text-primary border-none text-[9px] font-black uppercase tracking-widest px-3 py-0.5 rounded shadow-sm">
                                            {board?.abbreviation || 'Official'} hub
                                         </Badge>
                                         <Badge className="bg-emerald-50 text-emerald-600 border-none text-[9px] font-black uppercase tracking-widest px-3 py-0.5 rounded shadow-sm">
                                            Live patterns
                                         </Badge>
                                      </div>
                                      <h3 className="text-xl md:text-[28px] font-[800] text-[#0F172A] leading-[1.1] group-hover:text-primary transition-colors tracking-tight antialiased">
                                         {exam.name}
                                      </h3>
                                   </div>

                                   <div className="space-y-3">
                                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                         <span>Preparation progress</span>
                                         <span className="text-primary tabular-nums">{progress}%</span>
                                      </div>
                                      <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner">
                                         <motion.div 
                                           initial={{ width: 0 }}
                                           animate={{ width: `${progress}%` }}
                                           transition={{ duration: 1.5, ease: "easeOut" }}
                                           className="h-full bg-gradient-to-r from-primary to-blue-400 shadow-xl" 
                                         />
                                      </div>
                                   </div>

                                   <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                      <ExamMiniStat icon={Layers} label="Full mocks" val={s.mocks} />
                                      <ExamMiniStat icon={Zap} label="Topic wise" val={s.total - s.mocks} />
                                      <ExamMiniStat icon={FileStack} label="Old papers" val={s.pyq} />
                                      <ExamMiniStat icon={BookOpen} label="Notes hub" val="Active" />
                                   </div>
                                </div>

                                <div className="mt-10 md:mt-14 pt-8 border-t border-slate-50">
                                   <Button 
                                     onClick={() => router.push(`/exams/view?id=${exam.id}`)}
                                     className="w-full h-14 md:h-16 bg-[#0F172A] hover:bg-black text-white font-bold text-sm tracking-tight shadow-3xl transition-all active:scale-95 border-none gap-3 rounded-2xl"
                                   >
                                      Continue prep <ArrowRight className="h-4 w-4" />
                                   </Button>
                                </div>
                             </CardContent>
                          </Card>
                       </motion.div>
                    )
                 })}
              </div>
           ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-24 md:py-40 text-center space-y-10 md:space-y-14 bg-white rounded-[40px] md:rounded-[80px] border-2 border-dashed border-slate-200 shadow-inner flex flex-col items-center justify-center px-8"
              >
                 <div className="relative">
                    <div className="h-32 w-32 md:h-48 md:w-48 bg-slate-50 rounded-[3rem] flex items-center justify-center text-slate-200">
                       <GraduationCap className="h-16 w-16 md:h-24 md:w-24" />
                    </div>
                    <div className="absolute -bottom-4 -right-4 h-12 w-12 md:h-16 md:w-16 bg-blue-500 rounded-3xl flex items-center justify-center text-white shadow-2xl animate-bounce">
                       <Zap className="h-6 w-6 md:h-8 md:w-8 fill-current" />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <h2 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tighter leading-none">Your list is empty</h2>
                    <p className="text-slate-500 font-medium text-sm md:text-lg">
                       Personalize your dashboard by adding target exams from the registry.
                    </p>
                 </div>

                 <Button 
                   onClick={() => setIsAddModalOpen(true)}
                   className="h-16 md:h-20 px-12 md:px-16 bg-primary hover:bg-blue-700 text-white font-bold text-sm tracking-tight rounded-2xl md:rounded-[2.5rem] shadow-4xl border-none transition-all active:scale-95 flex items-center gap-4 group"
                 >
                    Start selection <ChevronRight className="h-5 w-5 md:h-7 md:w-7 group-hover:translate-x-2 transition-transform" />
                 </Button>
              </motion.div>
           )}
        </section>

        {/* 4. PERFORMANCE SUMMARY SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-14 pt-10">
           <Card className="lg:col-span-8 border-none shadow-3xl rounded-[2.5rem] bg-white overflow-hidden border border-slate-100">
              <CardHeader className="p-8 md:p-12 border-b border-slate-50 bg-slate-50/30">
                 <div className="flex items-center justify-between">
                    <div className="space-y-1">
                       <CardTitle className="text-xl md:text-3xl font-black text-[#0F172A] tracking-tight">Merit analytics</CardTitle>
                       <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Real-time performance audit</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <BarChart3 className="h-6 w-6" />
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="p-8 md:p-12 space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <ProgressNode label="Avg accuracy" val={`${meritAnalytics.accuracy}%`} color="text-emerald-500" />
                    <ProgressNode label="Attempt rate" val={`${meritAnalytics.attemptRate}%`} color="text-blue-500" />
                    <ProgressNode label="Solved questions" val={meritAnalytics.solved.toLocaleString()} color="text-orange-500" />
                 </div>
                 {subjectWeightage.length > 0 && (
                    <div className="pt-10 border-t border-slate-50">
                       <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Top subject mastery</h4>
                       <div className="space-y-6">
                          {subjectWeightage.map((sw, i) => (
                             <SubjectProg key={i} label={sw.name} val={sw.val} color={i === 0 ? "bg-primary" : i === 1 ? "bg-orange-500" : "bg-emerald-500"} />
                          ))}
                       </div>
                    </div>
                 )}
              </CardContent>
           </Card>

           <div className="lg:col-span-4 space-y-8">
              <div className="p-8 md:p-10 bg-[#0F172A] text-white rounded-[3rem] shadow-xl space-y-6 text-left group hover:translate-y-[-4px] transition-all duration-500 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000">
                    <ShieldCheck className="h-64 w-64 text-primary" />
                 </div>
                 <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary shadow-inner">
                          <ShieldCheck className="h-6 w-6" />
                       </div>
                       <h4 className="text-[11px] font-black uppercase tracking-widest text-white">Security protocol</h4>
                    </div>
                    <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-medium">Your preparation verticals and attempt results are synchronized with the master registry for state ranking calculations.</p>
                 </div>
              </div>

              <Card className="border-none shadow-3xl bg-white rounded-[3rem] p-8 md:p-10 space-y-8 text-left relative overflow-hidden border border-slate-100">
                 <div className="space-y-2">
                    <h3 className="text-xl font-black tracking-tight text-[#0F172A]">Registry help</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Support hub</p>
                 </div>
                 <p className="text-xs text-slate-500 leading-relaxed">Need assistance with your exam selection or premium pass activation?</p>
                 <Button asChild variant="outline" className="w-full h-12 rounded-xl border-slate-200 text-[#0F172A] font-bold text-xs">
                    <Link href="/support">Open support center</Link>
                 </Button>
              </Card>
           </div>
        </section>

        <div className="flex items-center justify-center gap-10 md:gap-20 opacity-30 grayscale hover:grayscale-0 transition-all duration-1000 py-10 md:py-20 border-t border-slate-100">
           <Landmark className="h-10 w-10 text-slate-400" />
           <ShieldCheck className="h-10 w-10 text-slate-400" />
           <Star className="h-10 w-10 text-slate-400" />
           <Target className="h-10 w-10 text-slate-400" />
        </div>

      </main>
      <Footer />

      {/* SETTINGS DIALOG */}
      <Dialog open={!!settingsExam} onOpenChange={(o) => !o && setSettingsExam(null)}>
         <DialogContent className="sm:max-w-md w-[95vw] rounded-[2rem] md:rounded-[3rem] bg-white border-none shadow-5xl p-8 md:p-12 text-left">
            <div className="h-1.5 w-full bg-primary absolute top-0 left-0" />
            <DialogHeader className="space-y-4">
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-primary shadow-inner">
                     <Settings className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                     <DialogTitle className="text-2xl font-black text-[#0F172A] tracking-tighter uppercase">{settingsExam?.name}</DialogTitle>
                     <DialogDescription className="text-slate-400 font-bold text-[9px] uppercase tracking-widest">Vertical settings hub</DialogDescription>
                  </div>
               </div>
            </DialogHeader>

            <div className="py-8 space-y-6">
               <div className="bg-slate-50 rounded-2xl p-6 space-y-4 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Info className="h-3 w-3" /> Quick stats
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                     <div><p className="text-[8px] font-black text-slate-400 uppercase">Tests taken</p><p className="text-lg font-black text-[#0F172A]">{statsMap[settingsExam?.id]?.attempted || 0}</p></div>
                     <div><p className="text-[8px] font-black text-slate-400 uppercase">Available</p><p className="text-lg font-black text-primary">{statsMap[settingsExam?.id]?.total || 0}</p></div>
                  </div>
               </div>

               <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Account control</p>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleUnpin(settingsExam?.id)}
                    disabled={unpinningId === settingsExam?.id}
                    className="w-full h-14 justify-start text-rose-500 hover:bg-rose-50 rounded-xl font-bold gap-3"
                  >
                     {unpinningId === settingsExam?.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                     Remove from dashboard
                  </Button>
               </div>
            </div>

            <DialogFooter>
               <Button onClick={() => setSettingsExam(null)} className="w-full h-14 rounded-full bg-[#0F172A] hover:bg-black font-bold text-sm tracking-tight border-none shadow-xl">
                  Done
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}

function ExamMiniStat({ icon: Icon, label, val }: any) {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-1.5 group hover:bg-primary/5 transition-all">
       <Icon className="h-4 w-4 text-primary opacity-40 group-hover:opacity-100 transition-all" />
       <div className="space-y-0.5">
          <p className="text-sm md:text-base font-[900] text-[#0F172A] tabular-nums leading-none">{val}</p>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate leading-none mt-1">{label}</p>
       </div>
    </div>
  )
}

function ProgressNode({ label, val, color }: any) {
   return (
      <div className="text-center md:text-left space-y-2">
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
         <p className={cn("text-2xl md:text-[40px] font-black tabular-nums tracking-tighter antialiased leading-none", color)}>{val}</p>
      </div>
   )
}

function SubjectProg({ label, val, color }: any) {
   return (
      <div className="space-y-2.5">
         <div className="flex justify-between items-center text-[10px] md:text-xs font-bold uppercase tracking-tight text-[#0F172A]">
            <span>{label}</span>
            <span className="text-slate-400 tabular-nums">{val}%</span>
         </div>
         <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner">
            <motion.div initial={{ width: 0 }} whileInView={{ width: `${val}%` }} transition={{ duration: 1.2 }} className={cn("h-full", color)} />
         </div>
      </div>
   )
}
