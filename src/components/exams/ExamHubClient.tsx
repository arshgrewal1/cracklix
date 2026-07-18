"use client"

import React, { useMemo, useEffect, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useDoc, useCollection, useFirestore, useUser } from "@/firebase"
import { doc, collection, query, where, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore"
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
  Megaphone
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { AuthorityLogo } from "@/lib/exam-icons"
import { motion, AnimatePresence } from "framer-motion"

/**
 * @fileOverview Premium Exam Hub Client v32.0.
 * FIXED: Board-level distribution logic - show all tests assigned to board if no specific exam targeting.
 */

export default function ExamHubClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const db = useFirestore()
  const { toast } = useToast()
  const { user, profile, loading: userLoading } = useUser()

  const examId = useMemo(() => {
    const queryId = searchParams.get('id');
    if (queryId) return queryId;
    const pathSegments = pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    return lastSegment !== 'view' && lastSegment !== 'exams' ? lastSegment : "";
  }, [pathname, searchParams]);

  const examRef = useMemo(() => (db && examId ? doc(db, "exams", examId) : null), [db, examId]);
  const { data: exam, loading: examLoading } = useDoc<any>(examRef);
  
  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), where("published", "==", true)) : null), [db]);
  const quizzesQuery = useMemo(() => (db ? query(collection(db, "daily_quizzes"), where("published", "==", true)) : null), [db]);
  const pyqsQuery = useMemo(() => (db && examId ? query(collection(db, "pyqs"), where("examId", "==", examId)) : null), [db, examId]);
  const notesQuery = useMemo(() => (db && examId ? query(collection(db, "notes"), where("examId", "==", examId)) : null), [db, examId]);

  const { data: rawMocks, loading: mocksLoading } = useCollection<any>(mocksQuery)
  const { data: rawQuizzes, loading: quizzesLoading } = useCollection<any>(quizzesQuery)
  const { data: rawPyqs, loading: pyqsLoading } = useCollection<any>(pyqsQuery)
  const { data: rawNotes, loading: notesLoading } = useCollection<any>(notesQuery)
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: categories } = useCollection<any>(useMemo(() => (db ? collection(db, "categories") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))

  const [isPinning, setIsPinning] = useState(false);

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
     const userEmail = user.email?.toLowerCase();
     const isFounder = userEmail && ['arshdeepgrewal1122@gmail.com'].includes(userEmail);
     if (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN' || isFounder) return true;
     return profile?.passStatus === 'active';
  }, [user, profile]);

  const groupedContent = useMemo(() => {
    if (!examId || !exam) return { FULL: [], SUBJECT: [], SECTIONAL: [], CA: [], PYQ: [], NOTES: [], SUBJECTS_WITH_CONTENT: [] };
    
    // Combine standard mocks and daily quizzes
    const allMocks = [...(rawMocks || []), ...(rawQuizzes || [])];
    
    // Board-Level Distibution Filter
    const mocks = allMocks.filter(m => {
       // A. Direct target match
       const isDirectMatch = m.examId === examId || (m.examIds && m.examIds.includes(examId));
       
       // B. Broad Board Match: belongs to this board AND no specific exams are targetted
       const boardMatch = m.boardId === exam.boardId || (m.boardIds && m.boardIds.includes(exam.boardId));
       const isGenericBoardTest = boardMatch && (!m.examIds || m.examIds.length === 0 || (m.examIds.length === 1 && m.examIds[0] === 'GENERAL'));
       
       return isDirectMatch || isGenericBoardTest;
    });

    const subjectWiseTests = mocks.filter(m => m.mockType === 'SUBJECT');
    const subjectIdsWithTests = new Set(subjectWiseTests.map(m => m.learningSubjectId).filter(Boolean));
    const subjectsWithContent = (subjects || []).filter(s => subjectIdsWithTests.has(s.id));
    
    return {
      FULL: mocks.filter(m => m.mockType === 'FULL'),
      SUBJECT: subjectWiseTests,
      SECTIONAL: mocks.filter(m => m.mockType === 'SECTIONAL'),
      CA: mocks.filter(m => m.mockType === 'CA_QUIZ' || m.mockType === 'DAILY_CHALLENGE'),
      PYQ: (rawPyqs || []),
      NOTES: (rawNotes || []),
      SUBJECTS_WITH_CONTENT: subjectsWithContent
    }
  }, [rawMocks, rawQuizzes, rawPyqs, rawNotes, examId, exam, subjects]);

  const activeBoard = boards?.find((b: any) => b.id === exam?.boardId);
  const activeCategory = categories?.find((c: any) => c.id === exam?.categoryId);

  if (examLoading || userLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-6">
       <Zap className="h-10 w-10 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.4em]">Synchronizing Center...</p>
    </div>
  );

  if (!examId || (!exam && !examLoading)) return (
    <div className="h-screen flex flex-col items-center justify-center text-center p-6 space-y-6 bg-white">
       <div className="h-16 w-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-500 shadow-xl border border-blue-100"><AlertCircle className="h-8 w-8" /></div>
       <div className="space-y-2">
         <h2 className="text-2xl font-black text-[#0F172A]">Exam Not Found</h2>
         <p className="text-slate-500 font-medium max-sm:px-4 max-w-sm mx-auto">This preparation vertical is currently under maintenance or has been archived.</p>
       </div>
       <Button onClick={() => router.back()} variant="outline" className="rounded-full h-12 px-10 font-bold">Return Back</Button>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] font-body text-left overflow-x-hidden w-full max-w-full">
      <Navbar />
      
      <section className="px-4 md:px-8 pt-6 pb-2">
         <motion.div 
           initial={{ opacity: 0, y: 15 }}
           animate={{ opacity: 1, y: 0 }}
           className="max-w-7xl mx-auto bg-gradient-to-br from-[#0F172A] via-[#111827] to-[#1E293B] rounded-[24px] md:rounded-[32px] p-5 md:p-12 text-white relative overflow-hidden shadow-4xl group border border-white/5"
         >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000 pointer-events-none">
               <Trophy className="h-64 w-64 text-white" />
            </div>
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-[80px]" />

            <div className="relative z-10 space-y-8">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <button onClick={() => router.back()} className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 active:scale-90 transition-all shrink-0">
                        <ChevronLeft className="h-5 w-5" />
                     </button>
                     <Badge className="bg-primary/20 text-[#60A5FA] border border-primary/20 px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest">
                        {activeBoard?.abbreviation || 'Official'} Hub
                     </Badge>
                  </div>
                  <button 
                     onClick={togglePin} 
                     disabled={isPinning}
                     className={cn(
                        "h-9 w-9 rounded-xl flex items-center justify-center transition-all active:scale-90 border",
                        isPinned ? "bg-primary border-primary text-white" : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                     )}
                  >
                     {isPinning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Bookmark className={cn("h-4 w-4", isPinned && "fill-current")} />}
                  </button>
               </div>

               <div className="flex items-center gap-5 md:gap-8">
                  <AuthorityLogo board={activeBoard} category={activeCategory} size="md" className="h-16 w-16 md:h-24 md:w-24 shrink-0 bg-slate-50 border-4 border-white/10 shadow-2xl" />
                  <div className="min-w-0 space-y-1 flex-1">
                     <h1 className="text-xl md:text-5xl font-black text-white leading-[1.1] tracking-tight break-words">
                        {exam.name}
                     </h1>
                     <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] md:sm font-bold text-slate-400 uppercase tracking-widest">Verified Official Preparation</p>
                     </div>
                  </div>
               </div>

               <div className="flex flex-wrap gap-2 pt-2">
                  <ResourceChip icon={<Zap className="h-3 w-3" />} label={`${groupedContent.FULL.length + groupedContent.SUBJECT.length} Mocks`} />
                  <ResourceChip icon={<FileText className="h-3 w-3" />} label={`${groupedContent.PYQ.length} Papers`} />
                  <ResourceChip icon={<BookOpen className="h-3 w-3" />} label="Notes" />
                  <ResourceChip icon={<ShieldCheck className="h-3 w-3" />} label="Verified" />
               </div>
            </div>
         </motion.div>
      </section>

      <section className="px-4 md:px-8 py-6">
         <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            <MiniStatCard label="Available tests" value={`${groupedContent.FULL.length + groupedContent.SUBJECT.length}+`} icon={<Layers className="text-blue-500" />} />
            <MiniStatCard label="MCQ items" value={`${(groupedContent.FULL.length + groupedContent.SUBJECT.length) * 100}+`} icon={<Zap className="text-orange-500" />} />
            <MiniStatCard label="Aspirants" value={`${exam.studentCount || '12K+'}`} icon={<Users className="text-emerald-500" />} />
            <MiniStatCard label="Success rate" value="84%" icon={<BarChart3 className="text-purple-500" />} />
         </div>
      </section>

      <main className="container mx-auto px-4 md:px-8 py-4 max-w-7xl pb-40 space-y-10">
         <Tabs defaultValue="FULL" className="space-y-10">
            <div className="sticky top-[80px] z-40 -mx-4 px-4 bg-[#F8FAFC]/80 backdrop-blur-md pb-4 pt-2">
               <div className="bg-white border border-slate-100 rounded-2xl p-1 shadow-md flex items-center h-[52px]">
                  <TabsList className="bg-transparent border-none p-0 flex h-full w-full justify-start gap-1 overflow-x-auto no-scrollbar snap-x">
                     <DashboardTab value="FULL" label="Full length" icon={Zap} />
                     <DashboardTab value="SUBJECT" label="Subject tests" icon={BookOpen} />
                     <DashboardTab value="SECTIONAL" label="Sectional" icon={List} />
                     <DashboardTab value="CA" label="Current affairs" icon={Newspaper} />
                     <DashboardTab value="PYQ" label="Old papers" icon={FileStack} />
                     <DashboardTab value="NOTES" label="Study notes" icon={FileText} />
                  </TabsList>
               </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
               <TabsContent value="FULL"><MockList data={groupedContent.FULL} isPassActive={isPassActive} loading={mocksLoading || quizzesLoading} boards={boards} type="FULL" /></TabsContent>
               <TabsContent value="SUBJECT">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                     {groupedContent.SUBJECTS_WITH_CONTENT.map((sub: any) => (
                        <Link key={sub.id} href={`/subjects/${sub.id}?examId=${examId}`}>
                           <Card className="border border-slate-100 shadow-xl hover:shadow-4xl transition-all duration-500 rounded-[2.5rem] bg-white group overflow-hidden h-full flex flex-col p-8 md:p-10 text-left">
                              <div className="flex justify-between items-start mb-8">
                                 <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                    <BookOpen className="h-8 w-8" />
                                 </div>
                                 <Badge className="bg-slate-50 text-slate-400 border-none px-3 py-1 font-black text-[9px] uppercase tracking-widest">Subject Hub</Badge>
                              </div>
                              <div className="space-y-4 flex-1">
                                 <h3 className="text-xl md:text-3xl font-black text-[#0F172A] group-hover:text-primary transition-colors leading-tight uppercase">{sub.name}</h3>
                                 <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Zap className="h-3.5 w-3.5 text-primary" /> Multi-Series Registry Active
                                 </p>
                              </div>
                              <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between text-primary font-black text-[10px] uppercase tracking-[0.2em]">
                                 <span>Open Hierarchy</span>
                                 <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                              </div>
                           </Card>
                        </Link>
                     ))}
                  </div>
               </TabsContent>
               <TabsContent value="SECTIONAL"><MockList data={groupedContent.SECTIONAL} isPassActive={isPassActive} loading={mocksLoading || quizzesLoading} boards={boards} type="SECTIONAL" /></TabsContent>
               <TabsContent value="CA"><MockList data={groupedContent.CA} isPassActive={isPassActive} loading={mocksLoading || quizzesLoading} boards={boards} type="CA" /></TabsContent>
               <TabsContent value="PYQ"><MockList data={groupedContent.PYQ} isPassActive={isPassActive} loading={pyqsLoading} boards={boards} type="PYQ" /></TabsContent>
               <TabsContent value="NOTES"><MockList data={groupedContent.NOTES} isPassActive={isPassActive} loading={notesLoading} boards={boards} type="NOTES" /></TabsContent>
            </div>
         </Tabs>

         <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-slate-100">
            <RelatedContentFeed title="Latest Current Affairs" icon={Zap} href="/current-affairs" color="text-orange-500" bg="bg-orange-50" />
            <RelatedContentFeed title="Official Notifications" icon={Megaphone} href="/notifications" color="text-blue-500" bg="bg-blue-50" />
         </section>
      </main>
      
      <Footer />
    </div>
  )
}

function DashboardTab({ value, label, icon: Icon }: { value: string, label: string, icon: any }) {
   return (
      <TabsTrigger value={value} className="px-6 h-full font-bold text-[13px] text-slate-500 bg-white border border-transparent data-[state=active]:bg-[#0F172A] data-[state=active]:text-white rounded-xl transition-all whitespace-nowrap flex items-center gap-3 snap-start border-none">
         <Icon className="h-4 w-4 shrink-0" /> {label}
      </TabsTrigger>
   )
}

function ResourceChip({ icon, label }: any) {
   return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl">
         <span className="text-primary">{icon}</span>
         <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tight">{label}</span>
      </div>
   )
}

function MiniStatCard({ label, value, icon }: any) {
   return (
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-slate-50 flex items-center gap-6 md:gap-10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group">
         <div className="h-14 w-14 md:h-20 md:w-20 rounded-full bg-white shadow-[0_10px_25px_rgba(0,0,0,0.06)] flex items-center justify-center shrink-0 border border-slate-50 group-hover:scale-105 transition-transform">
            {React.cloneElement(icon as React.ReactElement, { className: "h-6 w-6 md:h-9 md:w-9" })}
         </div>
         <div className="min-w-0 flex-1 space-y-1">
            <p className="text-[10px] md:text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-2">{label}</p>
            <p className="text-2xl md:text-5xl font-black text-[#0F172A] tabular-nums leading-none tracking-tighter">{value}</p>
         </div>
      </div>
   )
}

function MockList({ data, isPassActive, loading, boards, type }: any) {
   const router = useRouter();
   if (loading) return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
         {Array.from({ length: 3 }).map((_, i) => <Skeleton className="h-64 w-full rounded-[2.5rem] bg-white border border-slate-100" key={i} />)}
      </div>
   );
   
   if (data.length === 0) {
     return (
        <div className="py-24 md:py-32 flex flex-col items-center justify-center text-center space-y-8 bg-white rounded-[3rem] border border-slate-100 shadow-xl mx-1 animate-in zoom-in-95 duration-500">
           <div className="relative">
              <div className="absolute -inset-6 bg-primary/5 blur-3xl rounded-full" />
              <div className="relative h-20 w-20 md:h-28 md:w-28 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-200">
                 <Zap className="h-10 w-10 md:h-14 md:w-14" />
              </div>
           </div>
           <div className="space-y-3 max-sm:px-6">
              <h3 className="text-xl md:text-3xl font-black text-[#0F172A] tracking-tight">No mock tests available</h3>
              <p className="text-slate-400 font-medium text-sm md:text-lg leading-snug">Mock tests will appear here once verified and published by the audit team.</p>
           </div>
           <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center px-8">
              <Button asChild className="w-full sm:w-auto h-14 px-10 bg-[#0F172A] text-white rounded-full font-bold shadow-xl border-none">
                 <Link href="/exams">Browse Other Exams</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full sm:w-auto h-14 px-10 text-slate-400 font-bold">
                 <Link href="/">Return Home</Link>
              </Button>
           </div>
        </div>
     );
   }

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
         {data.map((mock: any, i: number) => {
            const isPremium = mock.accessLevel?.toUpperCase() === 'PREMIUM';
            const locked = isPremium && !isPassActive;
            const board = boards?.find((b: any) => b.id === (mock.boardIds?.[0] || mock.boardId));
            const isNote = type === 'NOTES';
            const isPaper = type === 'PYQ';

            return (
               <motion.div
                 key={mock.id}
                 initial={{ opacity: 0, y: 15 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.05 }}
               >
                  <Card className="border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2rem] md:rounded-[2.5rem] bg-white group h-full flex flex-col p-6 md:p-10 relative overflow-hidden">
                     <div className="flex justify-between items-start mb-6 md:mb-10 w-full">
                        <AuthorityLogo board={board} size="md" className="h-14 w-14 md:h-20 md:w-20 shadow-2xl border-4 border-white bg-slate-50" />
                        <div className="flex flex-col items-end gap-2">
                           {isPremium ? (
                              <Badge className="bg-amber-50 text-amber-600 border-none px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest shadow-sm flex items-center gap-1.5">
                                 <Lock className="h-3 w-3" /> Premium
                              </Badge>
                           ) : (
                              <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest shadow-sm">Free Access</Badge>
                           )}
                           <div className="flex items-center gap-1 text-amber-400">
                              <Star className="h-3 w-3 fill-current" />
                              <span className="text-[10px] font-black text-slate-400">4.9</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex-1 space-y-4 text-left">
                        <div className="space-y-1.5">
                           <Badge variant="outline" className="bg-slate-50 text-slate-400 border-none text-[8px] font-black uppercase tracking-widest px-2">{mock.difficulty || 'Medium'}</Badge>
                           <h3 className="text-lg md:text-2xl font-bold text-[#0F172A] group-hover:text-primary transition-colors leading-tight line-clamp-2 uppercase tracking-tight">
                              {mock.title}
                           </h3>
                        </div>

                        {!isNote && !isPaper && (
                           <div className="flex flex-wrap items-center gap-4 text-[10px] md:text-[11px] font-bold text-slate-400 pt-4 border-t border-slate-50">
                              <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary/40" /> {mock.totalQuestions} Items</span>
                              <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary/40" /> {mock.duration}m Time</span>
                           </div>
                        )}
                        {isPaper && (
                           <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold text-slate-400 pt-4 border-t border-slate-50">
                              <Calendar className="h-4 w-4 text-primary/40" /> Official {mock.year} Paper
                           </div>
                        )}
                     </div>

                     <div className="mt-8 md:mt-12 pt-2">
                        <Button 
                          onClick={() => {
                             if (isNote || isPaper) {
                                window.open(mock.pdfUrl, '_blank');
                             } else {
                                router.push(locked ? '/pass' : `/mocks/view?id=${mock.id}`);
                             }
                          }}
                          className={cn(
                           "w-full h-12 md:h-16 rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest shadow-xl border-none transition-all active:scale-95 gap-3", 
                           locked ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-[#0F172A] hover:bg-black text-white"
                        )}>
                           {locked ? <Lock className="h-4 w-4" /> : isNote || isPaper ? <Download className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current text-primary" />} 
                           {locked ? 'Unlock Hub' : isNote || isPaper ? 'Download PDF' : 'Continue'}
                           <ChevronRight className="h-4 w-4 ml-auto opacity-30" />
                        </Button>
                     </div>
                  </Card>
               </motion.div>
            )
         })}
      </div>
   )
}

function RelatedContentFeed({ title, icon: Icon, href, color, bg }: any) {
   return (
      <Link href={href}>
         <div className="p-6 md:p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl flex items-center justify-between group hover:border-primary/30 transition-all duration-500">
            <div className="flex items-center gap-6">
               <div className={cn("h-12 w-12 md:h-16 md:w-16 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform", bg)}>
                  <Icon className={cn("h-6 w-6 md:h-8 md:w-8", color)} />
               </div>
               <div className="text-left">
                  <h4 className="text-base md:text-2xl font-black text-[#0F172A] tracking-tight">{title}</h4>
                  <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Updated just now</p>
               </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all">
               <ArrowRight className="h-5 w-5" />
            </div>
         </div>
      </Link>
   )
}
