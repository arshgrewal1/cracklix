"use client"

import React, { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useDoc, useCollection, useFirestore, useUser } from "@/firebase"
import { doc, collection, query, where, limit, orderBy, updateDoc, arrayUnion, arrayRemove, serverTimestamp, getDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Clock, 
  BookOpen, 
  ShieldCheck, 
  ChevronRight,
  FileText,
  Zap,
  ChevronLeft,
  Info,
  Lock,
  GraduationCap,
  List,
  Download,
  Layers,
  RefreshCw,
  Play,
  BarChart3,
  Newspaper,
  Star,
  ArrowRight,
  LucideIcon,
  Scale,
  CheckCircle2
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

/**
 * @fileOverview Institutional Exam Hub v40.1 (Build Fixed).
 * FIXED: Added missing 'CheckCircle2' import to resolve build failure.
 */

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

export default function ExamHubPage() {
  const params = useParams()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  const { user, profile, loading: userLoading } = useUser()
  const examId = params.id as string

  const { data: exam, loading: examLoading } = useDoc<any>(useMemo(() => (db && examId ? doc(db, "exams", examId) : null), [db, examId]))
  
  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), where("published", "==", true)) : null), [db]);
  const notesQuery = useMemo(() => (db && examId ? query(collection(db, "notes"), where("examId", "==", examId)) : null), [db, examId]);
  const resultsQuery = useMemo(() => (db && user ? query(collection(db, "results"), where("userId", "==", user.uid)) : null), [db, user]);
  const hubQuery = useMemo(() => (db ? query(collection(db, "current_affairs_hub"), where("status", "==", "PUBLISHED")) : null), [db])

  const { data: rawMocks, loading: mocksLoading } = useCollection<any>(mocksQuery)
  const { data: rawNotes, loading: notesLoading } = useCollection<any>(notesQuery)
  const { data: userResults, loading: resultsLoading } = useCollection<any>(resultsQuery)
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: caHub, loading: caLoading } = useCollection<any>(hubQuery);

  const [isPinning, setIsPinning] = useState(false);

  const isPinned = useMemo(() => {
    return profile?.pinnedExams?.includes(examId) || false;
  }, [profile, examId]);

  const togglePin = async () => {
    if (!db || !user || isPinning) return;
    setIsPinning(true);
    const userRef = doc(db, "users", user.uid);
    try {
      if (isPinned) {
        await updateDoc(userRef, { pinnedExams: arrayRemove(examId), updatedAt: serverTimestamp() });
        toast({ title: "Removed from Hub", description: "This vertical is no longer in your personal dashboard." });
      } else {
        await updateDoc(userRef, { pinnedExams: arrayUnion(examId), updatedAt: serverTimestamp() });
        toast({ title: "Pinned to Hub", description: "Successfully added to your personal dashboard." });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Action Failed" });
    } finally {
      setIsPinning(false);
    }
  };

  const isPassActive = useMemo(() => {
     if (!user || !profile) return false;
     const userEmail = user.email?.toLowerCase();
     const isFounder = userEmail && SUPER_ADMIN_WHITELIST.includes(userEmail);
     if (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN' || isFounder) return true;
     if (profile.pass?.active === true) {
        const expiry = new Date(profile.pass.expiryDate);
        return expiry > new Date();
     }
     return false;
  }, [user, profile]);

  const groupedContent = useMemo(() => {
    const mocks = (rawMocks || []).filter(m => {
       const isDirectMatch = m.examId === examId;
       const isArrayMatch = m.examIds?.includes(examId);
       return isDirectMatch || isArrayMatch;
    });
    return {
      FULL: mocks.filter(m => m.mockType === 'FULL'),
      SUBJECT: mocks.filter(m => m.mockType === 'SUBJECT'),
      SECTIONAL: mocks.filter(m => m.mockType === 'SECTIONAL'),
      PYQ: mocks.filter(m => m.mockType === 'PYQ'),
      NOTES: (rawNotes || []).filter(n => n.category === 'NOTES'),
      SYLLABUS: (rawNotes || []).filter(n => n.category === 'SYLLABUS'),
      CA: (caHub || []).filter(item => {
         const term = (exam?.name || "").toLowerCase();
         return item.title?.toLowerCase().includes(term) || item.type === 'DAILY';
      }).sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 10)
    }
  }, [rawMocks, rawNotes, caHub, examId, exam])

  const examPerformance = useMemo(() => {
     if (!rawMocks || !userResults) return { attempted: 0, avgAcc: 0, bestScore: 0 };
     const allAssociatedMocks = [...groupedContent.FULL, ...groupedContent.SUBJECT, ...groupedContent.SECTIONAL, ...groupedContent.PYQ];
     const mockIds = new Set(allAssociatedMocks.map(m => m.id));
     const examResults = (userResults || []).filter(r => mockIds.has(r.mockId));
     if (examResults.length === 0) return { attempted: 0, avgAcc: 0, bestScore: 0 };
     return {
        attempted: examResults.length,
        avgAcc: Math.round(examResults.reduce((acc, r) => acc + (r.accuracy || 0), 0) / examResults.length),
        bestScore: Math.max(...examResults.map(r => r.score || 0))
     }
  }, [userResults, groupedContent, rawMocks]);

  if (examLoading || userLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-6">
       <Zap className="h-10 w-10 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Syncing Hub...</p>
    </div>
  );

  if (!exam) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white p-6 text-center space-y-6">
       <Info className="h-12 w-12 text-slate-200" />
       <h2 className="text-xl font-headline font-black uppercase">Not Found</h2>
       <Button onClick={() => router.push('/exams')} className="h-11 px-8 bg-[#0F172A] text-white rounded-xl font-black uppercase text-[10px]">Return</Button>
    </div>
  );

  const activeBoard = boards?.find((b: any) => b.id === exam.boardId || b.abbreviation === exam.boardId);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body text-left">
      <Navbar />
      
      <section className="bg-white border-b border-slate-100 py-10 md:py-20 text-left relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 opacity-[0.02]"><GraduationCap className="h-48 w-48" /></div>
         <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12">
               <div className="flex items-start gap-4 flex-1 min-w-0">
                  <button onClick={() => router.back()} className="h-10 w-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 shrink-0 hover:bg-slate-50">
                     <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="min-w-0 space-y-5">
                     <div className="flex items-center gap-3">
                        <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-sm">
                           {activeBoard?.abbreviation || 'OFFICIAL'} HUB
                        </Badge>
                        <button 
                           onClick={togglePin} 
                           disabled={isPinning}
                           className={cn(
                              "flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all active:scale-90 shadow-sm font-black uppercase text-[9px] tracking-widest",
                              isPinned ? "bg-primary border-primary text-white" : "bg-white border-slate-200 text-slate-400 hover:border-primary/40 hover:text-primary"
                           )}
                        >
                           {isPinning ? <RefreshCw className="h-3 w-3 animate-spin" /> : isPinned ? <CheckCircle2 className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                           {isPinned ? 'PINNED TO HUB' : 'PIN TO MY HUB'}
                        </button>
                     </div>
                     <div className="space-y-4">
                        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-[#0F172A] leading-[0.9] tracking-tight break-words antialiased">
                           {exam.shortTitle || activeBoard?.abbreviation || exam.name.split(' ')[0]}
                        </h1>
                        <p className="text-sm md:text-2xl font-bold text-slate-400 leading-tight tracking-tight max-w-3xl">
                           {exam.name}
                        </p>
                     </div>
                  </div>
               </div>
               
               <div className="flex items-center gap-6 bg-slate-50/50 px-6 py-4 rounded-2xl border border-slate-100 w-full md:w-auto shadow-inner">
                  <div className="text-center min-w-[70px] space-y-0.5">
                     <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">ACCURACY</p>
                     <p className="text-xl md:text-4xl font-headline font-black text-primary tabular-nums">{examPerformance.avgAcc}%</p>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div className="text-center min-w-[70px] space-y-0.5">
                     <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">ATTEMPTS</p>
                     <p className="text-xl md:text-4xl font-headline font-black text-[#0F172A] tabular-nums">{examPerformance.attempted}</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <main className="container mx-auto px-4 py-8 max-w-7xl pb-40">
         <Tabs defaultValue="FULL" className="space-y-8 md:space-y-12">
            <div className="bg-white border border-slate-100 rounded-2xl p-1 shadow-md overflow-x-auto no-scrollbar relative">
               <TabsList className="bg-transparent border-none p-0 flex h-14 w-full justify-start gap-1 overflow-x-auto no-scrollbar">
                  <DashboardTab value="FULL" label="Full Mock" icon={Zap} />
                  <DashboardTab value="SUBJECT" label="Subjects" icon={BookOpen} />
                  <DashboardTab value="SECTIONAL" label="Sectional" icon={List} />
                  <DashboardTab value="CA" label="Current Affairs" icon={Newspaper} />
                  <DashboardTab value="PYQ" label="PYQ" icon={Layers} />
                  <DashboardTab value="NOTES" label="Notes" icon={FileText} />
               </TabsList>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
               <TabsContent value="FULL" className="m-0">
                  <MockList data={groupedContent.FULL} results={userResults} isPassActive={isPassActive} user={user} loading={mocksLoading} boards={boards} exam={exam} />
               </TabsContent>
               <TabsContent value="SUBJECT" className="m-0">
                  <MockList data={groupedContent.SUBJECT} results={userResults} isPassActive={isPassActive} user={user} loading={mocksLoading} boards={boards} exam={exam} />
               </TabsContent>
               <TabsContent value="SECTIONAL" className="m-0">
                  <MockList data={groupedContent.SECTIONAL} results={userResults} isPassActive={isPassActive} user={user} loading={mocksLoading} boards={boards} exam={exam} />
               </TabsContent>
               <TabsContent value="CA" className="m-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                     {caLoading ? (
                        <Skeleton className="h-40 w-full rounded-2xl" />
                     ) : groupedContent.CA.map((item: any) => (
                        <Link key={item.id} href="/current-affairs">
                           <Card className="border-none shadow-lg rounded-2xl bg-white p-6 flex items-center justify-between group h-full border border-slate-100">
                              <div className="flex items-center gap-6">
                                 <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-primary shrink-0 shadow-inner">
                                    <Newspaper className="h-6 w-6" />
                                 </div>
                                 <div className="space-y-0.5">
                                    <h3 className="text-sm font-black text-[#0F172A] uppercase leading-tight truncate max-w-[160px]">{item.title}</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">{item.month} Updates</p>
                                 </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-primary transition-all" />
                           </Card>
                        </Link>
                     ))}
                  </div>
               </TabsContent>
               <TabsContent value="PYQ" className="m-0">
                  <MockList data={groupedContent.PYQ} results={userResults} isPassActive={isPassActive} user={user} loading={mocksLoading} boards={boards} exam={exam} />
               </TabsContent>
               <TabsContent value="NOTES" className="m-0">
                  <NotesList data={groupedContent.NOTES} isPassActive={isPassActive} loading={notesLoading} />
               </TabsContent>
            </div>
         </Tabs>
      </main>
      <Footer />
    </div>
  )
}

function DashboardTab({ value, label, icon: Icon }: { value: string, label: string, icon: LucideIcon }) {
   return (
      <TabsTrigger value={value} className="px-5 md:px-8 h-full font-black text-[9px] md:text-[10px] uppercase tracking-widest text-slate-400 data-[state=active]:bg-[#0F172A] data-[state=active]:text-white rounded-xl transition-all whitespace-nowrap flex items-center gap-2">
         <Icon className="h-3.5 w-3.5" /> {label}
      </TabsTrigger>
   )
}

function MockList({ data, results, isPassActive, user, loading, boards, exam }: any) {
   const router = useRouter();
   const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
   
   if (loading) return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[420px] w-full rounded-[32px]" />)}
      </div>
   );

   const isCourtExam = exam?.name?.toLowerCase().includes('court') || exam?.id?.toLowerCase().includes('court');

   if (data.length === 0) return (
      <div className="py-24 text-center opacity-20 flex flex-col items-center gap-4">
         <Zap className="h-10 w-10 text-slate-300" />
         <p className="font-headline font-black text-lg uppercase tracking-widest">Section Empty</p>
      </div>
   );

   return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
         {data.map((mock: any) => {
            const result = results?.find((r: any) => r.mockId === mock.id);
            const tier = (mock.accessLevel || mock.accessType || 'FREE').trim().toUpperCase();
            const isPremium = tier === 'PREMIUM';
            const locked = isPremium && !isPassActive;
            const board = boards?.find((b: any) => b.id === (mock.boardIds?.[0] || mock.boardId));
            const difficulty = mock.difficulty || "Medium";

            return (
               <Card key={mock.id} className="border border-[#E5E7EB] shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:translate-y-[-4px] transition-all duration-500 rounded-[32px] bg-white p-8 md:p-10 text-center flex flex-col h-[420px] group relative overflow-hidden">
                  
                  <div className="absolute top-6 right-6 flex flex-col gap-2 items-end">
                    {result && <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black uppercase tracking-widest px-3 py-1 shadow-sm">Attempted</Badge>}
                  </div>

                  <div className="h-[70px] w-[70px] mx-auto rounded-full bg-[#F8FAFC] flex items-center justify-center p-3.5 shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500 mb-8 overflow-hidden border border-slate-100 relative">
                     {isCourtExam ? (
                        <Scale className="h-8 w-8 text-slate-600" />
                     ) : board?.iconUrl && !failedImages[board.id] ? (
                       <img 
                         src={board.iconUrl} 
                         className="h-full w-full object-contain" 
                         alt="Logo" 
                         referrerPolicy="no-referrer"
                         onError={() => setFailedImages(prev => ({...prev, [board.id]: true}))}
                       />
                     ) : (
                       <Zap className="h-8 w-8 text-primary fill-current opacity-40" />
                     )}
                  </div>

                  <CardHeader className="p-0 flex-1 space-y-6">
                     <CardTitle className="font-extrabold text-xl md:text-2xl text-[#04102B] leading-tight tracking-tight line-clamp-2 min-h-[62px]">
                        {mock.title}
                     </CardTitle>

                     <div className="flex items-center justify-center gap-4 text-[14px] font-bold text-[#64748B] tracking-tight">
                        <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-primary opacity-50" /> {mock.totalQuestions} Qs</span>
                        <div className="h-4 w-px bg-slate-100" />
                        <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary opacity-50" /> {mock.duration} Min</span>
                     </div>

                     <div className="flex items-center justify-center gap-3">
                        <DifficultyBadge level={difficulty} isPremium={isPremium} />
                        <Badge variant="outline" className="border-slate-100 text-[#94A3B8] text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">{board?.abbreviation || 'PSSSB'}</Badge>
                     </div>
                  </CardHeader>

                  <CardContent className="p-0 mt-10">
                     {locked ? (
                        <Button onClick={() => router.push('/pass')} className="w-full h-[56px] bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-widest rounded-[18px] transition-all shadow-xl shadow-amber-500/10 active:scale-95 border-none gap-2">
                           <Lock className="h-4 w-4" /> Unlock Premium Pass
                        </Button>
                     ) : (
                        <Button onClick={() => router.push(user ? `/mocks/${mock.id}/instructions` : `/login?returnUrl=/mocks/${mock.id}`)} className="w-full h-[56px] bg-[#04102B] hover:bg-[#2F6BFF] text-white font-black text-xs uppercase tracking-widest rounded-[18px] transition-all shadow-xl shadow-slate-900/10 active:scale-95 border-none group/btn">
                           <span className="flex items-center justify-center gap-2">
                             Attempt Now <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                           </span>
                        </Button>
                     )}
                  </CardContent>
               </Card>
            )
         })}
      </div>
   )
}

function DifficultyBadge({ level, isPremium }: { level: string, isPremium: boolean }) {
  if (isPremium) return <Badge className="bg-[#EEF2FF] text-[#2F6BFF] border-none text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">PREMIUM</Badge>;
  if (level === 'Easy') return <Badge className="bg-[#DCFCE7] text-[#16A34A] border-none text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">EASY</Badge>;
  if (level === 'Hard') return <Badge className="bg-[#FEE2E2] text-[#DC2626] border-none text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">HARD</Badge>;
  return <Badge className="bg-[#FEF3C7] text-[#D97706] border-none text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">MEDIUM</Badge>;
}

function NotesList({ data, isPassActive, loading }: any) {
   if (loading) return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {Array.from({ length: 2 }).map((_, i) => <Skeleton className="h-32 w-full rounded-2xl" />)}
      </div>
   );

   if (data.length === 0) return (
      <div className="py-24 text-center opacity-20 flex flex-col items-center gap-4">
         <FileText className="h-10 w-10 text-slate-300" />
         <p className="font-headline font-black text-lg uppercase tracking-widest">No Materials Found</p>
      </div>
   );

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {data.map((note: any) => (
            <Card key={note.id} className="border-none shadow-lg rounded-2xl bg-white p-6 md:p-8 flex items-center justify-between group border border-slate-100">
               <div className="flex items-center gap-6 min-w-0">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                     <FileText className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                     <h3 className="text-sm md:text-xl font-black text-[#0F172A] uppercase truncate max-w-[180px]">{note.title}</h3>
                     <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{note.category}</p>
                  </div>
               </div>
               <Button asChild className="h-10 md:h-12 px-4 md:px-8 bg-slate-900 text-white rounded-xl font-black uppercase text-[8px] md:text-[9px] tracking-widest shadow-lg shrink-0">
                  <a href={note.pdfUrl} target="_blank" rel="noopener noreferrer"><Download className="h-3.5 w-3.5 md:mr-2" /> <span className="hidden md:inline">Download</span></a>
               </Button>
            </Card>
         ))}
      </div>
   )
}
