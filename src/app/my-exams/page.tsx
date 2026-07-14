"use client"

import React, { useMemo, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
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
  RefreshCw, 
  Zap, 
  BookOpen, 
  FileText, 
  Trophy, 
  Target, 
  BarChart3, 
  Gem, 
  Clock, 
  ShieldCheck, 
  Search,
  CheckCircle2,
  MoreHorizontal,
  Trash2,
  ArrowRight,
  Flame,
  FileStack,
  Layers,
  Settings,
  Loader2,
  Landmark
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
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { AuthorityLogo } from "@/lib/exam-icons"

/**
 * @fileOverview World-Class Personalized Dashboard v3.3.
 * FIXED: Included Landmark in lucide-react imports.
 */

const MODAL_CATEGORIES = [
  { id: "all", label: "All Exams" },
  { id: "punjab", label: "Punjab" },
  { id: "ssc", label: "SSC" },
  { id: "railway", label: "Railway" },
  { id: "bank", label: "Bank" },
  { id: "teaching", label: "Teaching" },
  { id: "police", label: "Police" },
  { id: "judiciary", label: "Judiciary" },
  { id: "psu", label: "PSU" }
];

export default function MyExamsPage() {
  const { user, profile, loading: userLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  
  const [mounted, setMounted] = useState(false)
  const [unpinningId, setUnpinningId] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [modalSearch, setModalSearch] = useState("")
  const [modalCategory, setModalCategory] = useState("all")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!userLoading && !user && mounted) router.push("/login?returnUrl=/my-exams")
  }, [user, userLoading, router, mounted])

  // DATA FETCHING
  const examsQuery = useMemo(() => (db && mounted ? collection(db, "exams") : null), [db, mounted])
  const mocksQuery = useMemo(() => (db && mounted ? collection(db, "mocks") : null), [db, mounted])
  const pyqsQuery = useMemo(() => (db && mounted ? collection(db, "pyqs") : null), [db, mounted])
  const resultsQuery = useMemo(() => (db && user ? query(collection(db, "results"), where("userId", "==", user.uid)) : null), [db, user])
  const boardsQuery = useMemo(() => (db ? collection(db, "boards") : null), [db]);

  const { data: allExams, loading: examsLoading } = useCollection<any>(examsQuery)
  const { data: mocks } = useCollection<any>(mocksQuery)
  const { data: pyqs } = useCollection<any>(pyqsQuery)
  const { data: boards } = useCollection<any>(boardsQuery)
  const { data: results } = useCollection<any>(resultsQuery)

  // STATS CALCULATION
  const statsMap = useMemo(() => {
    const map: Record<string, any> = {};
    (mocks || []).forEach(m => {
       const eids = m.examIds || (m.examId ? [m.examId] : []);
       eids.forEach((eid: string) => {
          if (!map[eid]) map[eid] = { mocks: 0, subject: 0, sectional: 0, pyq: 0, total: 0, daily: 0, attempted: 0 };
          if (m.mockType === 'FULL') map[eid].mocks++;
          else if (m.mockType === 'SUBJECT') map[eid].subject++;
          else if (m.mockType === 'SECTIONAL') map[eid].sectional++;
          else if (m.mockType === 'DAILY_CHALLENGE') map[eid].daily++;
          map[eid].total++;
          
          if (results?.some((r: any) => r.mockId === m.id)) map[eid].attempted++;
       });
    });
    (pyqs || []).forEach(p => {
       if (p.examId) {
          if (!map[p.examId]) map[p.examId] = { mocks: 0, subject: 0, sectional: 0, pyq: 0, total: 0, daily: 0, attempted: 0 };
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
    const totalDaily = pinnedExams.reduce((acc, e) => acc + (statsMap[e.id]?.daily || 0), 0);
    
    let avgProg = 0;
    if (totalExams > 0) {
      const sum = pinnedExams.reduce((acc, e) => {
        const s = statsMap[e.id];
        return acc + (s?.total > 0 ? (s.attempted / s.total) * 100 : 0);
      }, 0);
      avgProg = Math.round(sum / totalExams);
    }

    return [
      { label: "Total Exams", val: totalExams, icon: GraduationCap, color: "text-blue-500", bg: "bg-blue-50" },
      { label: "Mock Tests", val: totalMocks, icon: Zap, color: "text-orange-500", bg: "bg-orange-50" },
      { label: "Daily Quiz", val: totalDaily, icon: Flame, color: "text-rose-500", bg: "bg-rose-50" },
      { label: "Overall Progress", val: `${avgProg}%`, icon: Trophy, color: "text-emerald-500", bg: "bg-emerald-50" },
    ];
  }, [pinnedExams, statsMap]);

  const handleUnpin = async (examId: string) => {
    if (!db || !user || unpinningId) return;
    setUnpinningId(examId);
    try {
      await updateDoc(doc(db, "users", user.uid), { pinnedExams: arrayRemove(examId), updatedAt: serverTimestamp() });
      toast({ title: "Removed from list" });
    } finally { setUnpinningId(null); }
  };

  const handleAddExam = async (examId: string) => {
    if (!db || !user) return;
    if (profile?.pinnedExams?.includes(examId)) {
      toast({ title: "Already added" });
      return;
    }
    try {
      await updateDoc(doc(db, "users", user.uid), { pinnedExams: arrayUnion(examId), updatedAt: serverTimestamp() });
      toast({ title: "Exam added", description: "Dashboard synchronized." });
    } catch (e) {
      toast({ variant: "destructive", title: "Error syncing hub" });
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

  if (userLoading || !mounted) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
      <p className="text-[10px] font-semibold text-slate-300 tracking-widest uppercase">Synchronizing Portal...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-left selection:bg-primary/10">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-8 py-10 md:py-16 max-w-7xl space-y-12 md:space-y-20 pb-40">
        
        {/* 1. PREMIUM HEADER */}
        <section className="space-y-8">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                 <Badge className="bg-white/80 backdrop-blur-md border-slate-100 text-slate-400 px-4 py-1.5 rounded-full font-semibold text-[10px] md:text-xs tracking-tight shadow-sm flex items-center gap-2 w-fit">
                    📚 Personalized Preparation
                 </Badge>
                 <div className="space-y-2">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#60A5FA] antialiased">
                       My exams
                    </h1>
                    <p className="text-slate-500 font-medium text-sm md:text-xl max-w-2xl leading-tight">
                       Manage your personalized exam preparation with one beautiful dashboard.
                    </p>
                 </div>
              </motion.div>

              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="group relative overflow-hidden w-full md:w-auto h-[58px] px-10 bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#60A5FA] hover:brightness-110 rounded-full shadow-[0_15px_40px_rgba(37,99,235,0.30)] transition-all duration-300 active:scale-95 border-none font-bold text-sm tracking-tight text-white">
                    <Plus className="h-5 w-5 mr-2" /> Add new exam
                    <motion.div 
                        animate={{ x: ['-100%', '300%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-25deg] pointer-events-none"
                    />
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[90vh] bg-white rounded-[2rem] md:rounded-[3rem] border-none shadow-5xl p-0 overflow-hidden flex flex-col">
                   <div className="h-2 w-full bg-primary shrink-0" />
                   <DialogHeader className="p-8 md:p-12 pb-2 shrink-0 text-left">
                      <DialogTitle className="text-3xl font-bold text-[#0F172A] tracking-tighter">Exam registry</DialogTitle>
                      <DialogDescription className="text-slate-400 font-semibold text-[10px] md:text-sm mt-2">Select a recruitment vertical to start your journey.</DialogDescription>
                   </DialogHeader>

                   <div className="px-8 md:px-12 py-4 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                      <div className="relative group">
                         <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                         <Input 
                           value={modalSearch}
                           onChange={e => setModalSearch(e.target.value)}
                           className="h-14 md:h-16 pl-14 rounded-2xl bg-slate-50 border-none font-semibold text-base shadow-inner focus-visible:ring-2 focus-visible:ring-primary/10" 
                           placeholder="Search exams like Patwari, Police, etc..." 
                         />
                      </div>

                      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                         {MODAL_CATEGORIES.map(cat => (
                            <button 
                              key={cat.id} 
                              onClick={() => setModalCategory(cat.id)}
                              className={cn(
                                "h-10 px-5 rounded-full font-semibold text-[10px] tracking-tight whitespace-nowrap transition-all border",
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
                                        <h4 className="font-semibold text-[#0F172A] text-sm md:text-base leading-tight truncate">{e.name}</h4>
                                        <p className="text-[9px] font-semibold text-slate-400 mt-1">{e.boardId} Hub</p>
                                     </div>
                                  </div>
                                  <Button 
                                    onClick={() => handleAddExam(e.id)} 
                                    disabled={isAdded}
                                    variant="ghost" 
                                    className={cn(
                                      "h-10 w-10 rounded-xl p-0 transition-all active:scale-90",
                                      isAdded ? "text-emerald-500 bg-emerald-50" : "text-slate-300 hover:text-primary hover:bg-primary/5"
                                    )}
                                  >
                                     {isAdded ? <CheckCircle2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                                  </Button>
                               </div>
                            )
                         })}
                      </div>
                   </div>
                   
                   <DialogFooter className="p-8 md:p-10 pt-4 bg-slate-50 border-t border-slate-100 flex flex-row justify-center shrink-0">
                      <p className="text-[9px] font-semibold text-slate-300 uppercase tracking-widest">Official registry authorized</p>
                   </DialogFooter>
                </DialogContent>
              </Dialog>
           </div>
        </section>

        {/* 2. TOP STATS GRID */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
           {topStats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                 <Card className="border border-slate-100 bg-white shadow-lg shadow-slate-200/50 rounded-[28px] p-6 md:p-8 flex flex-col items-center justify-center text-center group hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden">
                    <div className={cn("absolute -right-4 -bottom-4 w-16 h-16 rounded-full blur-3xl opacity-20", stat.bg)} />
                    <div className={cn("h-12 w-12 md:h-16 md:w-16 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform mb-5", stat.bg, stat.color)}>
                       <stat.icon className="h-6 w-6 md:h-8 md:w-8" />
                    </div>
                    <div className="space-y-1 z-10">
                       <p className="text-xl md:text-4xl font-bold text-[#0F172A] tracking-tighter antialiased tabular-nums">{stat.val}</p>
                       <p className="text-[9px] md:text-[11px] font-semibold text-slate-400 uppercase tracking-tight">{stat.label}</p>
                    </div>
                 </Card>
              </motion.div>
           ))}
        </section>

        {/* 3. PINNED EXAMS GRID */}
        <section className="space-y-10 md:space-y-14">
           {examsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                 {Array.from({ length: 3 }).map((_, i) => <Skeleton className="h-80 w-full rounded-[2.5rem] bg-white" />)}
              </div>
           ) : pinnedExams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                 {pinnedExams.map((exam: any, idx: number) => {
                    const s = statsMap[exam.id] || { mocks: 0, pyq: 0, daily: 0, total: 0, attempted: 0 };
                    const progress = s.total > 0 ? Math.round((s.attempted / s.total) * 100) : 0;
                    const board = boards?.find((b: any) => b.id === exam.boardId || b.abbreviation === exam.boardId);

                    return (
                       <motion.div
                         key={exam.id}
                         initial={{ opacity: 0, y: 25 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: idx * 0.1 }}
                       >
                          <Card className="border border-slate-100 shadow-xl hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] transition-all duration-500 rounded-[2rem] md:rounded-[3rem] bg-white group flex flex-col relative overflow-hidden h-full">
                             
                             <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
                                <button 
                                  onClick={() => handleUnpin(exam.id)}
                                  disabled={unpinningId === exam.id}
                                  className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white/80 backdrop-blur-md border border-slate-100 flex items-center justify-center text-slate-300 hover:text-rose-500 active:scale-90 transition-all shadow-sm"
                                >
                                   {unpinningId === exam.id ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Trash2 className="h-4 w-4" />}
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
                                         <Badge className="bg-primary/5 text-primary border-none text-[9px] font-semibold tracking-tight px-3 py-0.5 rounded shadow-sm">
                                            {board?.abbreviation || 'Official'} Hub
                                         </Badge>
                                         <Badge className="bg-emerald-50 text-emerald-600 border-none text-[9px] font-semibold tracking-tight px-3 py-0.5 rounded shadow-sm">
                                            Live patterns
                                         </Badge>
                                      </div>
                                      <h3 className="text-xl md:text-[28px] font-bold text-[#0F172A] leading-tight group-hover:text-primary transition-colors tracking-tight antialiased uppercase">
                                         {exam.name}
                                      </h3>
                                   </div>

                                   <div className="space-y-3">
                                      <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                                         <span>Overall mastery</span>
                                         <span className="text-primary tabular-nums">{progress}%</span>
                                      </div>
                                      <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner">
                                         <motion.div 
                                           initial={{ width: 0 }}
                                           animate={{ width: `${progress}%` }}
                                           transition={{ duration: 1.5, ease: "easeOut" }}
                                           className="h-full bg-gradient-to-r from-primary to-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.4)]" 
                                         />
                                      </div>
                                   </div>

                                   <div className="grid grid-cols-2 gap-3 pt-4">
                                      <ExamMiniStat icon={Layers} label="Mock tests" val={s.mocks} />
                                      <ExamMiniStat icon={Zap} label="Daily quiz" val={s.daily} />
                                      <ExamMiniStat icon={FileStack} label="Old papers" val={s.pyq} />
                                      <ExamMiniStat icon={BookOpen} label="Notes hub" val="Active" />
                                   </div>
                                </div>

                                <div className="mt-10 md:mt-14 pt-8 border-t border-slate-50 flex flex-col sm:flex-row items-center gap-3">
                                   <Button 
                                     onClick={() => router.push(`/exams/view?id=${exam.id}`)}
                                     className="w-full h-14 bg-[#0F172A] hover:bg-black text-white font-bold text-xs tracking-tight shadow-xl transition-all active:scale-95 border-none gap-3"
                                   >
                                      Continue prep <ChevronRight className="h-4 w-4" />
                                   </Button>
                                   <Button 
                                     variant="outline"
                                     className="w-full sm:w-14 h-14 p-0 rounded-2xl border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-primary transition-all active:scale-95 shadow-sm"
                                     title="Manage nodes"
                                   >
                                      <Settings className="h-5 w-5" />
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
                className="py-24 md:py-40 text-center space-y-10 md:space-y-14 bg-white rounded-[3rem] md:rounded-[5rem] border-2 border-dashed border-slate-100 shadow-inner flex flex-col items-center justify-center px-8"
              >
                 <div className="relative">
                    <div className="h-32 w-32 md:h-48 md:w-48 bg-slate-50 rounded-[3rem] flex items-center justify-center text-slate-200">
                       <GraduationCap className="h-16 w-16 md:h-24 md:w-24" />
                    </div>
                    <div className="absolute -bottom-4 -right-4 h-12 w-12 md:h-16 md:w-16 bg-blue-500 rounded-3xl flex items-center justify-center text-white shadow-2xl animate-bounce">
                       <Zap className="h-6 w-6 md:h-8 md:w-8 fill-current" />
                    </div>
                 </div>

                 <div className="space-y-4 max-w-md">
                    <h2 className="text-2xl md:text-4xl font-bold text-[#0F172A] tracking-tighter leading-none">No exams added yet</h2>
                    <p className="text-slate-400 font-medium text-sm md:text-lg leading-relaxed">
                       Start by adding your first exam vertical to unlock personalized preparation nodes and rankings.
                    </p>
                 </div>

                 <Button 
                   onClick={() => setIsAddModalOpen(true)}
                   className="h-16 md:h-20 px-12 md:px-16 bg-gradient-to-r from-primary via-blue-500 to-blue-400 hover:brightness-110 text-white font-bold text-xs tracking-tight rounded-2xl md:rounded-[2.5rem] shadow-4xl border-none transition-all active:scale-95 flex items-center gap-4 group"
                 >
                    Add first exam <Plus className="h-5 w-5 md:h-7 md:w-7 group-hover:rotate-90 transition-transform duration-300" />
                 </Button>
              </motion.div>
           )}
        </section>

        <div className="flex items-center justify-center gap-10 md:gap-20 opacity-30 grayscale hover:grayscale-0 transition-all duration-1000 py-10 md:py-20 border-t border-slate-100">
           <Landmark className="h-10 w-10 text-slate-400" />
           <ShieldCheck className="h-10 w-10 text-slate-400" />
           <Star className="h-10 w-10 text-slate-400" />
           <Target className="h-10 w-10 text-slate-400" />
        </div>

      </main>
      <Footer />
    </div>
  )
}

function ExamMiniStat({ icon: Icon, label, val }: any) {
  return (
    <div className="p-3 md:p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-1.5 group hover:bg-primary/5 transition-all">
       <Icon className="h-3.5 w-3.5 text-primary opacity-40 group-hover:opacity-100 transition-all" />
       <div className="space-y-0.5">
          <p className="text-[11px] md:text-sm font-bold text-[#0F172A] tabular-nums">{val}</p>
          <p className="text-[7px] md:text-[8px] font-semibold text-slate-400 uppercase tracking-widest truncate">{label}</p>
       </div>
    </div>
  )
}
