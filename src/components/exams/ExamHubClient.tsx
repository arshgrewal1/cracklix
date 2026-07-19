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
  MoreVertical,
  Activity
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { AuthorityLogo } from "@/lib/exam-icons"
import { motion, AnimatePresence } from "framer-motion"

/**
 * @fileOverview Premium Exam Detail Hub v5.0 (Testbook Quality).
 * Completely redesigned for high-fidelity information density and tactical preparation flow.
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

  // REAL-TIME DATA QUERIES
  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), where("published", "==", true)) : null), [db]);
  const quizzesQuery = useMemo(() => (db ? query(collection(db, "daily_quizzes"), where("published", "==", true)) : null), [db]);
  const resultsQuery = useMemo(() => (db && user ? query(collection(db, "results"), where("userId", "==", user.uid)) : null), [db, user]);
  const pyqsQuery = useMemo(() => (db && examId ? query(collection(db, "pyqs"), where("examId", "==", examId)) : null), [db, examId]);
  const notesQuery = useMemo(() => (db && examId ? query(collection(db, "notes"), where("examId", "==", examId)) : null), [db, examId]);

  const { data: rawMocks, loading: mocksLoading } = useCollection<any>(mocksQuery)
  const { data: rawQuizzes, loading: quizzesLoading } = useCollection<any>(quizzesQuery)
  const { data: results } = useCollection<any>(resultsQuery)
  const { data: rawPyqs } = useCollection<any>(rawPyqsQuery)
  const { data: rawNotes } = useCollection<any>(rawNotesQuery)
  
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))

  // AGGREGATION LOGIC
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

  const stats = useMemo(() => {
     const totalTests = (groupedContent.FULL.length + groupedContent.SUBJECT.length + groupedContent.SECTIONAL.length);
     const attempted = results?.filter(r => (groupedContent.FULL.some(m => m.id === r.mockId) || groupedContent.SUBJECT.some(m => m.id === r.mockId))).length || 0;
     const avgAccuracy = results?.length ? Math.round(results.reduce((acc, r) => acc + (r.accuracy || 0), 0) / results.length) : 0;
     return { totalTests, attempted, avgAccuracy };
  }, [groupedContent, results]);

  const isPinned = useMemo(() => (examId && profile?.pinnedExams?.includes(examId)) || false, [profile, examId]);

  const togglePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!db || !user || isPinning || !examId) return;
    setIsPinning(true);
    const userRef = doc(db, "users", user.uid);
    try {
      if (isPinned) {
        await updateDoc(userRef, { pinnedExams: arrayRemove(examId), updatedAt: serverTimestamp() });
        toast({ title: "Removed from My Exams" });
      } else {
        await updateDoc(userRef, { pinnedExams: arrayUnion(examId), updatedAt: serverTimestamp() });
        toast({ title: "Added to My Exams", description: "This hub is now pinned to your dashboard." });
      }
    } finally { setIsPinning(false); }
  };

  if (!mounted || examLoading || userLoading) return <div className="h-screen w-full flex items-center justify-center bg-white"><Zap className="h-10 w-10 text-primary animate-pulse" /></div>;
  if (!exam) return <div className="p-20 text-center uppercase font-black text-slate-300">Exam Vertical Not Registered</div>

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] font-body text-left selection:bg-primary/10">
      <Navbar />
      
      {/* 1. PREMIUM TESTBOOK-STYLE HERO */}
      <section className="bg-[#0F172A] text-white pt-10 pb-12 md:pt-16 md:pb-24 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
         <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px]" />
         
         <div className="container mx-auto px-4 md:px-12 max-w-7xl relative z-10 space-y-10">
            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-widest">
               <Link href="/exams" className="hover:text-white transition-colors">Exams</Link>
               <ChevronRight className="h-3 w-3" />
               <span className="text-primary">{exam.name}</span>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-10 md:gap-14">
               <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 flex-1 min-w-0">
                  <div className="relative shrink-0 group-hover:scale-105 transition-transform duration-500">
                    <AuthorityLogo boardId={exam.boardId} size="lg" className="h-24 w-24 md:h-40 md:w-40 border-[6px] border-white/5 shadow-2xl bg-white/5 backdrop-blur-xl" />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 h-10 w-10 rounded-xl border-4 border-[#0F172A] flex items-center justify-center shadow-xl">
                      <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="space-y-4 text-center md:text-left flex-1 min-w-0">
                    <h1 className="text-3xl md:text-6xl font-black tracking-tighter leading-[1.1] uppercase antialiased truncate-multiline">
                       {exam.name} <br className="hidden md:block" /> <span className="text-primary italic">Selection Hub.</span>
                    </h1>
                    <p className="text-slate-400 font-medium text-sm md:text-xl leading-relaxed max-w-2xl line-clamp-2">
                       {exam.description || "Master the official Punjab recruitment pattern with verified practice series."}
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 pt-2">
                       <Badge className="bg-primary/20 text-primary border border-primary/20 px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest">Live Content Node</Badge>
                       <span className="text-[11px] md:text-xs font-bold text-slate-500 flex items-center gap-2 uppercase tracking-widest">
                          <Users className="h-3.5 w-3.5" /> 12.4K+ Aspirants Active
                       </span>
                    </div>
                  </div>
               </div>

               <div className="flex flex-col gap-4 w-full md:w-auto shrink-0">
                  <Button 
                    onClick={togglePin} 
                    disabled={isPinning}
                    variant="outline" 
                    className={cn(
                      "h-14 md:h-16 px-10 rounded-2xl border-white/10 font-black uppercase text-[10px] tracking-widest gap-3 transition-all",
                      isPinned ? "bg-primary border-primary text-white" : "bg-white/5 text-white hover:bg-white/10"
                    )}
                  >
                     {isPinning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Bookmark className={cn("h-4 w-4", isPinned && "fill-current")} />}
                     {isPinned ? "In My Exams" : "Add to Dashboard"}
                  </Button>
                  <Button asChild className="h-14 md:h-16 px-10 bg-white text-[#0F172A] hover:bg-slate-50 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-3 shadow-2xl border-none">
                     <Link href="/pass"><Gem className="h-5 w-5 text-primary" /> Unlock Elite Hub</Link>
                  </Button>
               </div>
            </div>

            {/* QUICK STATS STRIP */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-white/5">
               <HeroStat icon={Zap} label="Mock Tests" val={stats.totalTests} />
               <HeroStat icon={FileStack} label="Old Papers" val={groupedContent.PYQ.length} />
               <HeroStat icon={Target} label="My Progress" val={`${stats.avgAccuracy}%`} />
               <HeroStat icon={Trophy} label="Ranking" val="Verified" />
            </div>
         </div>
      </section>

      {/* 2. TABS & CONTENT HUB */}
      <main className="container mx-auto px-4 md:px-12 py-10 md:py-16 max-w-7xl pb-40 space-y-12">
         <Tabs defaultValue="MOCK" className="space-y-10">
            <div className="sticky top-[80px] z-[45] bg-[#F8FAFC]/90 backdrop-blur-md -mx-4 px-4 py-4 md:py-6 border-b border-slate-100">
               <div className="bg-white border border-slate-200 shadow-sm rounded-[20px] p-1 flex items-center h-[60px] md:h-[68px] overflow-hidden max-w-4xl mx-auto">
                  <TabsList className="bg-transparent border-none p-0 flex h-full w-full justify-between gap-1 overflow-x-auto no-scrollbar snap-x">
                     <HubTab value="MOCK" label="Mock Series" icon={Zap} />
                     <HubTab value="SUBJECT" label="Subject Tests" icon={BookOpen} />
                     <HubTab value="PYQ" label="Previous Papers" icon={FileStack} />
                     <HubTab value="NOTES" label="Study Notes" icon={FileText} />
                     <HubTab value="CA" label="Current Affairs" icon={Newspaper} />
                  </TabsList>
               </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <TabsContent value="MOCK"><TestGrid data={groupedContent.FULL} loading={mocksLoading} /></TabsContent>
               <TabsContent value="SUBJECT">
                  {groupedContent.SUBJECTS_WITH_CONTENT.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                      {groupedContent.SUBJECTS_WITH_CONTENT.map((sub: any) => (
                        <Link key={sub.id} href={`/subjects/${sub.id}?examId=${examId}`}>
                            <Card className="border border-slate-100 shadow-xl hover:shadow-5xl transition-all duration-500 rounded-[2.5rem] bg-white group overflow-hidden h-full flex flex-col p-8 md:p-12 text-left">
                              <div className="flex justify-between items-start mb-8">
                                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                    <BookOpen className="h-8 w-8" />
                                  </div>
                                  <Badge className="bg-slate-50 text-slate-400 border-none px-3 py-1 font-black text-[9px] uppercase tracking-widest">Subject Hub</Badge>
                              </div>
                              <div className="space-y-4 flex-1">
                                  <h3 className="text-xl md:text-3xl font-black text-[#0F172A] group-hover:text-primary transition-colors leading-tight uppercase tracking-tight">{sub.name}</h3>
                                  <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Zap className="h-3.5 w-3.5 text-primary" /> Multi-Series Active
                                  </p>
                              </div>
                              <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between text-primary font-black text-[10px] uppercase tracking-[0.2em]">
                                  <span>Start Exploring</span>
                                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                              </div>
                            </Card>
                        </Link>
                      ))}
                    </div>
                  ) : <div className="py-20 text-center opacity-30 font-black uppercase">No Subject Nodes Available</div>}
               </TabsContent>
               <TabsContent value="PYQ"><TestGrid data={groupedContent.PYQ} isPYQ loading={false} /></TabsContent>
               <TabsContent value="NOTES"><TestGrid data={groupedContent.NOTES} isNote loading={false} /></TabsContent>
               <TabsContent value="CA"><TestGrid data={groupedContent.CA} loading={quizzesLoading} /></TabsContent>
            </div>
         </Tabs>
      </main>

      <Footer />
    </div>
  )
}

function HeroStat({ icon: Icon, label, val }: any) {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-5 group">
       <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-primary shadow-inner group-hover:bg-primary group-hover:text-white transition-all">
          <Icon className="h-5 w-5" />
       </div>
       <div className="text-center md:text-left space-y-0.5">
          <p className="text-lg md:text-2xl font-black tabular-nums">{val}</p>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
       </div>
    </div>
  )
}

function HubTab({ value, label, icon: Icon }: { value: string, label: string, icon: any }) {
   return (
      <TabsTrigger value={value} className="px-6 h-full font-black text-[10px] md:text-[11px] uppercase tracking-widest text-slate-500 bg-white border border-transparent data-[state=active]:bg-[#0F172A] data-[state=active]:text-white rounded-[16px] transition-all whitespace-nowrap flex items-center gap-3 snap-start">
         <Icon className="h-4 w-4 shrink-0" /> {label}
      </TabsTrigger>
   )
}

function TestGrid({ data, loading, isPYQ = false, isNote = false }: any) {
   if (loading) return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
         {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 w-full rounded-[32px] bg-white border border-slate-200" />)}
      </div>
   );
   
   if (!data || data.length === 0) return (
      <div className="py-40 text-center opacity-20 flex flex-col items-center gap-6">
         <Zap className="h-20 w-20" />
         <p className="font-headline font-black text-2xl md:text-4xl uppercase tracking-[0.4em]">Vault Empty</p>
      </div>
   );

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
         {data.map((item: any, i: number) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
               <Card className="border border-slate-100 shadow-xl hover:shadow-5xl transition-all duration-500 rounded-[2.5rem] bg-white group h-full flex flex-col p-8 md:p-10 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-8">
                     <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-primary shadow-inner">
                        {isNote ? <FileText className="h-7 w-7" /> : isPYQ ? <FileStack className="h-7 w-7" /> : <Zap className="h-7 w-7" />}
                     </div>
                     <Badge className={cn("border-none text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg", item.accessLevel === 'PREMIUM' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600')}>
                        {item.accessLevel === 'PREMIUM' ? 'ELITE' : 'FREE'}
                     </Badge>
                  </div>
                  <div className="space-y-4 flex-1 text-left">
                     <div className="space-y-1.5">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{item.difficulty || 'Standard'} Pattern</p>
                        <h3 className="text-xl md:text-2xl font-black text-[#0F172A] leading-tight line-clamp-2 uppercase">{item.title}</h3>
                     </div>
                     <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                        <MetricNode icon={BookOpen} label="Items" val={item.totalQuestions || "Verified"} />
                        <MetricNode icon={Timer} label="Duration" val={item.duration ? `${item.duration}m` : "Self"} />
                     </div>
                  </div>
                  <div className="mt-10">
                     <Button asChild className="w-full h-14 md:h-16 rounded-2xl font-black uppercase text-[10px] md:text-[11px] tracking-widest shadow-xl border-none active:scale-95 gap-3 bg-[#0F172A] hover:bg-black text-white">
                        <Link href={isNote || isPYQ ? (item.pdfUrl || '#') : `/mocks/instructions?id=${item.id}`}>
                           {isNote || isPYQ ? <Download className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                           {isNote || isPYQ ? "Download PDF" : "Start Mock"}
                           <ChevronRight className="h-4 w-4 ml-auto opacity-40" />
                        </Link>
                     </Button>
                  </div>
               </Card>
            </motion.div>
         ))}
      </div>
   )
}

function MetricNode({ icon: Icon, label, val }: any) {
   return (
      <div className="flex items-center gap-2">
         <Icon className="h-3.5 w-3.5 text-slate-300" />
         <div className="text-left">
            <p className="text-[11px] font-black text-[#0F172A] leading-none">{val}</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">{label}</p>
         </div>
      </div>
   )
}
