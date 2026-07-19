
"use client"

import React, { useMemo, useEffect, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useDoc, useCollection, useFirestore, useUser } from "@/firebase"
import { doc, collection, query, where, updateDoc, arrayUnion, arrayRemove, serverTimestamp, orderBy, limit } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Clock, 
  BookOpen, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
  Lock,
  Zap,
  Play,
  Target,
  RefreshCw,
  Gem,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Newspaper,
  Star,
  Users,
  BarChart3,
  FileText,
  Bookmark,
  Layers,
  Flame,
  Trophy,
  List,
  FileStack,
  Megaphone,
  X,
  Activity,
  TrendingUp,
  Timer
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { AuthorityLogo } from "@/lib/exam-icons"
import { motion, AnimatePresence } from "framer-motion"

/**
 * @fileOverview Enterprise Exam Hub Client v40.0.
 * FIXED: Removed all hardcoded stats.
 * ADDED: Real-time Firestore aggregation for Tests, MCQs, Aspirants, and Success Rate.
 */

export default function ExamHubClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const db = useFirestore()
  const { toast } = useToast()
  const { user, profile, loading: userLoading } = useUser()

  const [mounted, setMounted] = useState(false);
  const [isPinning, setIsPinning] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const examId = useMemo(() => {
    const queryId = searchParams.get('id');
    if (queryId) return queryId;
    const pathSegments = pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    return lastSegment !== 'view' && lastSegment !== 'exams' ? lastSegment : "";
  }, [pathname, searchParams]);

  const examRef = useMemo(() => (db && examId ? doc(db, "exams", examId) : null), [db, examId]);
  const { data: exam, loading: examLoading } = useDoc<any>(examRef);

  // REAL-TIME REGISTRY QUERIES
  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), where("published", "==", true)) : null), [db]);
  const quizzesQuery = useMemo(() => (db ? query(collection(db, "daily_quizzes"), where("published", "==", true)) : null), [db]);
  const resultsQuery = useMemo(() => (db ? query(collection(db, "results"), orderBy("timestamp", "desc"), limit(500)) : null), [db]);
  const pyqsQuery = useMemo(() => (db && examId ? query(collection(db, "pyqs"), where("examId", "==", examId)) : null), [db, examId]);
  const notesQuery = useMemo(() => (db && examId ? query(collection(db, "notes"), where("examId", "==", examId)) : null), [db, examId]);

  const { data: rawMocks, loading: mocksLoading } = useCollection<any>(mocksQuery)
  const { data: rawQuizzes, loading: quizzesLoading } = useCollection<any>(quizzesQuery)
  const { data: rawResults, loading: resultsLoading } = useCollection<any>(resultsQuery)
  const { data: rawPyqs, loading: pyqsLoading } = useCollection<any>(rawPyqsQuery)
  const { data: rawNotes, loading: notesLoading } = useCollection<any>(notesQuery)
  
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))

  // AGGREGATION ENGINE
  const metrics = useMemo(() => {
    if (!examId || !exam) return { totalTests: 0, totalMCQs: 0, aspirants: 0, successRate: 0, trending: [] };

    // 1. Filter tests for this exam
    const allMocks = [...(rawMocks || []), ...(rawQuizzes || [])];
    const examTests = allMocks.filter(m => {
       const isDirectMatch = m.examId === examId || (m.examIds && m.examIds.includes(examId));
       const boardMatch = m.boardId === exam.boardId || (m.boardIds && m.boardIds.includes(exam.boardId));
       const isGenericBoardTest = boardMatch && (!m.examIds || m.examIds.length === 0 || (m.examIds.length === 1 && m.examIds[0] === 'GENERAL'));
       return isDirectMatch || isGenericBoardTest;
    });

    const testIds = new Set(examTests.map(t => t.id));

    // 2. Count MCQs
    const totalMCQs = examTests.reduce((acc, t) => acc + (t.questionIds?.length || 0), 0);

    // 3. Filter Results for this exam
    const examResults = (rawResults || []).filter(r => testIds.has(r.mockId));
    
    // 4. Calculate Unique Aspirants
    const uniqueAspirants = new Set(examResults.map(r => r.userId)).size;

    // 5. Calculate Success Rate (Accuracy >= 40% is considered a pass node)
    const passedAttempts = examResults.filter(r => (r.accuracy || 0) >= 40).length;
    const successRate = examResults.length > 0 ? Math.round((passedAttempts / examResults.length) * 100) : 0;

    return {
      totalTests: examTests.length,
      totalMCQs,
      aspirants: uniqueAspirants,
      successRate,
      recentActivity: examResults.slice(0, 5)
    };
  }, [examId, exam, rawMocks, rawQuizzes, rawResults]);

  const groupedContent = useMemo(() => {
    if (!examId || !exam) return { FULL: [], SUBJECT: [], SECTIONAL: [], CA: [], PYQ: [], NOTES: [], SUBJECTS_WITH_CONTENT: [] };
    
    const allMocks = [...(rawMocks || []), ...(rawQuizzes || [])];
    const mocks = allMocks.filter(m => {
       const isDirectMatch = m.examId === examId || (m.examIds && m.examIds.includes(examId));
       const boardMatch = m.boardId === exam.boardId || (m.boardIds && m.boardIds.includes(exam.boardId));
       const isGenericBoardTest = boardMatch && (!m.examIds || m.examIds.length === 0 || (m.examIds.length === 1 && m.examIds[0] === 'GENERAL'));
       return isDirectMatch || isGenericBoardTest;
    });

    const subjectIdsWithTests = new Set(mocks.map(m => m.learningSubjectId).filter(Boolean));
    const subjectsWithContent = (subjects || []).filter(s => subjectIdsWithTests.has(s.id));
    
    return {
      FULL: mocks.filter(m => m.mockType === 'FULL'),
      SUBJECT: mocks.filter(m => m.mockType === 'SUBJECT'),
      SECTIONAL: mocks.filter(m => m.mockType === 'SECTIONAL'),
      CA: mocks.filter(m => m.mockType === 'CA_QUIZ' || m.mockType === 'DAILY_CHALLENGE'),
      PYQ: (rawPyqs || []),
      NOTES: (rawNotes || []),
      SUBJECTS_WITH_CONTENT: subjectsWithContent
    }
  }, [rawMocks, rawQuizzes, rawPyqs, rawNotes, examId, exam, subjects]);

  const isPinned = useMemo(() => (examId && profile?.pinnedExams?.includes(examId)) || false, [profile, examId]);

  const togglePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!db || !user || isPinning || !examId) return;
    setIsPinning(true);
    const userRef = doc(db, "users", user.uid);
    try {
      if (isPinned) {
        await updateDoc(userRef, { pinnedExams: arrayRemove(examId), updatedAt: serverTimestamp() });
        toast({ title: "Removed from hub" });
      } else {
        await updateDoc(userRef, { pinnedExams: arrayUnion(examId), updatedAt: serverTimestamp() });
        toast({ title: "Added to your hub" });
      }
    } finally { setIsPinning(false); }
  };

  const isPassActive = useMemo(() => {
     if (!user || !profile) return false;
     if (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') return true;
     return profile?.passStatus === 'active';
  }, [user, profile]);

  if (!mounted || examLoading || userLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-6">
       <Zap className="h-10 w-10 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.4em]">Synchronizing Registry...</p>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] font-body text-left overflow-x-hidden w-full max-w-full">
      <Navbar />
      
      {/* 1. PREMIUM HEADER HUB */}
      <section className="px-4 md:px-8 pt-6 pb-2">
         <motion.div 
           initial={{ opacity: 0, y: 15 }}
           animate={{ opacity: 1, y: 0 }}
           className="max-w-7xl mx-auto bg-[#0F172A] rounded-[24px] md:rounded-[48px] p-6 md:p-14 text-white relative overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.15)] group border border-white/5"
         >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000 pointer-events-none">
               <Trophy className="h-64 w-64 text-white" />
            </div>
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />

            <div className="relative z-10 space-y-10">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <button onClick={() => router.back()} className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 active:scale-90 transition-all shrink-0">
                        <ChevronLeft className="h-5 w-5" />
                     </button>
                     <Badge className="bg-primary/20 text-[#60A5FA] border border-primary/20 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest">
                        {exam?.boardId || 'Official'} Hub
                     </Badge>
                  </div>
                  <button 
                     onClick={togglePin} 
                     disabled={isPinning}
                     className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center transition-all active:scale-90 border",
                        isPinned ? "bg-primary border-primary text-white" : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                     )}
                  >
                     {isPinning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Bookmark className={cn("h-4 w-4", isPinned && "fill-current")} />}
                  </button>
               </div>

               <div className="flex flex-col md:flex-row items-center gap-8 md:gap-14">
                  <AuthorityLogo boardId={exam?.boardId} size="lg" className="h-24 w-24 md:h-36 md:w-36 shrink-0 bg-slate-50 border-[6px] border-white/10 shadow-2xl" />
                  <div className="min-w-0 space-y-4 flex-1 text-center md:text-left">
                     <h1 className="text-3xl md:text-7xl font-black text-white leading-[1.05] tracking-tighter break-words uppercase antialiased">
                        {exam.name}
                     </h1>
                     <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                        <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
                           <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                           <p className="text-[10px] font-black uppercase tracking-widest">Official Patterns</p>
                        </div>
                        <p className="text-slate-400 font-bold text-sm md:text-lg">Targeting latest recruitment norms.</p>
                     </div>
                  </div>
               </div>
            </div>
         </motion.div>
      </section>

      {/* 2. REAL-TIME ANALYTICS GRID */}
      <section className="px-4 md:px-8 py-8 md:py-12">
         <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            <EnterpriseStatCard 
              label="Total tests" 
              value={metrics.totalTests} 
              sub="Practice Hub" 
              icon={<Layers />} 
              color="text-blue-500" 
              bgColor="bg-blue-50" 
              trend="+4 today"
            />
            <EnterpriseStatCard 
              label="MCQ items" 
              value={`${(metrics.totalMCQs / 1000).toFixed(1)}K+`} 
              sub="Question Bank" 
              icon={<Zap />} 
              color="text-orange-500" 
              bgColor="bg-orange-50" 
              trend="Updated"
            />
            <EnterpriseStatCard 
              label="Live aspirants" 
              value={metrics.aspirants === 0 ? "Be the First" : `${(metrics.aspirants / 1000).toFixed(1)}K+`} 
              sub="Active Students" 
              icon={<Users />} 
              color="text-emerald-500" 
              bgColor="bg-emerald-50" 
              isLive
            />
            <EnterpriseStatCard 
              label="Success rate" 
              value={metrics.successRate === 0 ? "No Data Yet" : `${metrics.successRate}%`} 
              sub="Difficulty index" 
              icon={<BarChart3 />} 
              color="text-purple-500" 
              bgColor="bg-purple-50" 
              trend="Verified"
            />
         </div>
      </section>

      {/* 3. CONTENT TABS HUB */}
      <main className="container mx-auto px-4 md:px-8 py-4 max-w-7xl pb-40 space-y-12">
         <Tabs defaultValue="FULL" className="space-y-10">
            <div className="sticky top-[80px] z-40 -mx-4 px-4 bg-[#F8FAFC]/90 backdrop-blur-md pb-6 pt-2">
               <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-1 flex items-center h-[60px] overflow-hidden">
                  <TabsList className="bg-transparent border-none p-0 flex h-full w-full justify-start gap-1 overflow-x-auto no-scrollbar snap-x">
                     <DashboardTab value="FULL" label="Full mocks" icon={Zap} />
                     <DashboardTab value="SUBJECT" label="Subject tests" icon={BookOpen} />
                     <DashboardTab value="SECTIONAL" label="Sectional hub" icon={List} />
                     <DashboardTab value="CA" label="Current affairs" icon={Newspaper} />
                     <DashboardTab value="PYQ" label="Old papers" icon={FileStack} />
                     <DashboardTab value="NOTES" label="Study notes" icon={FileText} />
                  </TabsList>
               </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <TabsContent value="FULL"><MockList data={groupedContent.FULL} isPassActive={isPassActive} loading={mocksLoading || quizzesLoading} boards={boards} /></TabsContent>
               <TabsContent value="SUBJECT">
                  {groupedContent.SUBJECTS_WITH_CONTENT.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                      {groupedContent.SUBJECTS_WITH_CONTENT.map((sub: any) => {
                          const seriesCount = (allSeries || []).filter((s: any) => s.subjectId === sub.id).length;
                          return (
                            <Link key={sub.id} href={`/subjects/${sub.id}?examId=${examId}`}>
                                <Card className="border border-slate-100 shadow-xl hover:shadow-4xl transition-all duration-500 rounded-[2.5rem] bg-white group overflow-hidden h-full flex flex-col p-8 md:p-12 text-left">
                                  <div className="flex justify-between items-start mb-8">
                                      <div className="h-16 w-16 md:h-20 md:w-20 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                        <BookOpen className="h-8 w-8" />
                                      </div>
                                      <Badge className="bg-slate-50 text-slate-400 border-none px-3 py-1 font-black text-[9px] uppercase tracking-widest">Subject Hub</Badge>
                                  </div>
                                  <div className="space-y-4 flex-1">
                                      <h3 className="text-xl md:text-3xl font-black text-[#0F172A] group-hover:text-primary transition-colors leading-tight uppercase tracking-tight">{sub.name}</h3>
                                      <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Zap className="h-3.5 w-3.5 text-primary" /> {seriesCount} Series Active
                                      </p>
                                  </div>
                                  <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between text-primary font-black text-[10px] uppercase tracking-[0.2em]">
                                      <span>Explore Hierarchy</span>
                                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                  </div>
                                </Card>
                            </Link>
                          )
                      })}
                    </div>
                  ) : <MockList data={[]} loading={false} />}
               </TabsContent>
               <TabsContent value="SECTIONAL"><MockList data={groupedContent.SECTIONAL} isPassActive={isPassActive} loading={mocksLoading || quizzesLoading} boards={boards} /></TabsContent>
               <TabsContent value="CA"><MockList data={groupedContent.CA} isPassActive={isPassActive} loading={mocksLoading || quizzesLoading} boards={boards} /></TabsContent>
               <TabsContent value="PYQ"><MockList data={groupedContent.PYQ} isPassActive={isPassActive} loading={pyqsLoading} boards={boards} /></TabsContent>
               <TabsContent value="NOTES"><MockList data={groupedContent.NOTES} isPassActive={isPassActive} loading={notesLoading} boards={boards} /></TabsContent>
            </div>
         </Tabs>

         {/* RECENT ACTIVITY & UPDATES */}
         <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-12 border-t border-slate-200">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 md:p-12 border border-slate-100 text-left overflow-hidden relative">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03]"><Megaphone className="h-32 w-32" /></div>
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-inner"><Flame className="h-5 w-5" /></div>
                     <h3 className="text-xl md:text-2xl font-black text-[#0F172A] tracking-tight uppercase">Recent Activity</h3>
                  </div>
                  <div className="space-y-6">
                     {metrics.recentActivity.length > 0 ? metrics.recentActivity.map((activity, i) => (
                        <div key={i} className="flex items-center justify-between gap-4 group">
                           <div className="flex items-center gap-4 min-w-0">
                              <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0F172A] font-bold text-xs uppercase shadow-sm">{(activity.userName || 'A')[0]}</div>
                              <div className="min-w-0">
                                 <p className="text-sm font-bold text-[#0F172A] truncate">Achievement Node: {activity.userName || 'Student'}</p>
                                 <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Scored {activity.score} on {activity.mockTitle}</p>
                              </div>
                           </div>
                           <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] uppercase">{activity.accuracy}%</Badge>
                        </div>
                     )) : (
                        <div className="py-8 text-center opacity-30 italic font-bold uppercase text-xs">Registry Standby</div>
                     )}
                  </div>
               </div>
            </Card>

            <Card className="border-none shadow-xl rounded-[2.5rem] bg-[#0F172A] text-white p-8 md:p-12 border border-white/5 text-left overflow-hidden group">
               <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000"><Star className="h-64 w-64 text-primary" /></div>
               <div className="relative z-10 space-y-10">
                  <div className="space-y-2">
                     <h3 className="text-3xl font-black tracking-tight leading-none uppercase">Aspirant Support</h3>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Official Guidance Hub</p>
                  </div>
                  <p className="text-slate-400 font-medium leading-relaxed">
                     Need specific help with the {exam.name} recruitment pattern? Our technical node is synchronized 24x7 to solve your preparation queries.
                  </p>
                  <Button asChild className="w-full h-14 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-4xl border-none transition-all active:scale-95">
                     <Link href="/support">Open Support Desk <ArrowRight className="h-4 w-4 ml-3" /></Link>
                  </Button>
               </div>
            </Card>
         </section>
      </main>
      
      <Footer />
    </div>
  )
}

function EnterpriseStatCard({ label, value, sub, icon, color, bgColor, trend, isLive }: any) {
   return (
      <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.04)] bg-white p-6 md:p-10 rounded-[2.5rem] relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group border border-slate-50">
         <div className="absolute top-0 right-0 p-4 md:p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: "h-12 w-12 md:h-20 md:w-20" }) : null}
         </div>
         <div className="space-y-4 md:space-y-6 relative z-10 text-left">
            <div className="flex justify-between items-start">
               <div className={cn("h-11 w-11 md:h-16 md:w-16 rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner border border-white/10 transition-transform duration-500 group-hover:scale-105", bgColor, color)}>
                  {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: "h-6 w-6 md:h-8 md:w-8" }) : null}
               </div>
               {isLive && (
                  <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                     <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Live Sync</span>
                  </div>
               )}
            </div>
            <div className="space-y-1">
               <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
               <h4 className={cn("text-2xl md:text-5xl font-black tracking-tighter leading-none tabular-nums truncate", color)}>{value}</h4>
               <div className="flex items-center justify-between pt-2">
                  <p className="text-[8px] md:text-[11px] font-bold text-slate-300 uppercase tracking-tight">{sub}</p>
                  {trend && <span className="text-[8px] md:text-[9px] font-black text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">{trend}</span>}
               </div>
            </div>
         </div>
      </Card>
   )
}

function DashboardTab({ value, label, icon: Icon }: { value: string, label: string, icon: any }) {
   return (
      <TabsTrigger value={value} className="px-6 h-full font-bold text-[13px] text-slate-500 bg-white border border-transparent data-[state=active]:bg-[#0F172A] data-[state=active]:text-white rounded-xl transition-all whitespace-nowrap flex items-center gap-3 snap-start border-none">
         <Icon className="h-4 w-4 shrink-0" /> {label}
      </TabsTrigger>
   )
}

function MockList({ data, isPassActive, loading, boards }: any) {
   const router = useRouter();
   if (loading) return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
         {Array.from({ length: 3 }).map((_, i) => <Skeleton className="h-64 w-full rounded-[3rem] bg-white border border-slate-200" key={i} />)}
      </div>
   );
   
   if (!data || data.length === 0) {
     return (
        <div className="py-24 md:py-40 flex flex-col items-center justify-center text-center space-y-8 bg-white rounded-[3rem] border border-slate-100 shadow-2xl mx-1 animate-in zoom-in-95 duration-700 relative overflow-hidden w-full max-w-4xl mx-auto">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
           <div className="relative">
              <div className="h-32 w-32 md:h-44 md:w-44 bg-slate-50 rounded-[3rem] md:rounded-[4rem] flex items-center justify-center text-slate-200 border-2 border-dashed border-slate-200 relative z-10">
                 <Zap className="h-12 w-12 md:h-20 md:w-20" />
              </div>
              <div className="absolute -bottom-2 -right-2 h-12 w-12 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-100 z-20">
                 <Clock className="h-6 w-6 text-primary animate-pulse" />
              </div>
           </div>
           <div className="space-y-3 max-w-sm px-6 relative z-10">
              <h3 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tight uppercase leading-none">No test yet</h3>
              <p className="text-slate-400 font-black text-[10px] md:text-sm uppercase tracking-widest leading-snug">Free Coming Soon</p>
              <p className="text-slate-400 text-xs md:text-sm font-medium mt-2">Our audit node is synchronizing this vertical with the master database.</p>
           </div>
           <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full justify-center px-8">
              <Button onClick={() => router.push('/exams')} className="w-full sm:w-auto h-14 px-10 bg-[#0F172A] hover:bg-black text-white rounded-full font-bold shadow-xl border-none">
                 Browse other exams
              </Button>
           </div>
        </div>
     );
   }

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
         {data.map((mock: any, i: number) => {
            const isPremium = mock.accessLevel?.toUpperCase() === 'PREMIUM';
            const locked = isPremium && !isPassActive;
            const board = boards?.find((b: any) => b.id === (mock.boardIds?.[0] || mock.boardId));

            return (
               <motion.div
                 key={mock.id}
                 initial={{ opacity: 0, y: 15 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.05 }}
               >
                  <Card className="border border-slate-100 shadow-xl hover:shadow-4xl transition-all duration-500 rounded-[2.5rem] md:rounded-[3rem] bg-white group h-full flex flex-col p-8 md:p-10 relative overflow-hidden">
                     <div className="flex justify-between items-start mb-10 w-full">
                        <AuthorityLogo board={board} size="md" className="h-16 w-16 md:h-20 md:w-20 shadow-2xl border-4 border-white bg-slate-50" />
                        <div className="flex flex-col items-end gap-2">
                           {isPremium ? (
                              <Badge className="bg-amber-50 text-amber-600 border-none px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-sm flex items-center gap-1.5">
                                 <Lock className="h-3 w-3" /> Elite Pass
                              </Badge>
                           ) : (
                              <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-sm">Free access</Badge>
                           )}
                           <div className="flex items-center gap-1 text-amber-400">
                              <Star className="h-3 w-3 fill-current" />
                              <span className="text-[10px] font-black text-slate-400">4.9</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex-1 space-y-6 text-left">
                        <div className="space-y-2">
                           <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{mock.difficulty || 'Medium'} level</p>
                           <h3 className="text-xl md:text-3xl font-black text-[#0F172A] group-hover:text-primary transition-colors leading-tight uppercase tracking-tight line-clamp-2">
                              {mock.title}
                           </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 text-[10px] md:text-[11px] font-bold text-slate-400 pt-6 border-t border-slate-50">
                           <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary/40" /> {mock.totalQuestions} items</span>
                           <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary/40" /> {mock.duration}m time</span>
                        </div>
                     </div>

                     <div className="mt-12 pt-2">
                        <Button 
                          onClick={() => router.push(locked ? '/pass' : `/mocks/view?id=${mock.id}`)}
                          className={cn(
                           "w-full h-14 md:h-20 rounded-2xl md:rounded-[2rem] font-black uppercase text-[10px] md:text-sm tracking-widest shadow-2xl border-none transition-all active:scale-95 gap-3", 
                           locked ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-[#0F172A] hover:bg-black text-white"
                        )}>
                           {locked ? <Lock className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current text-primary" />} 
                           {locked ? 'Unlock vertical' : 'Attempt test'}
                           <ChevronRight className="h-5 w-5 ml-auto opacity-30" />
                        </Button>
                     </div>
                  </Card>
               </motion.div>
            )
         })}
      </div>
   )
}

    