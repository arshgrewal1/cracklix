"use client"

import React, { useMemo, useState, useEffect } from "react"
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
  ChevronRight,
  Zap,
  ChevronLeft,
  Lock,
  List,
  Layers,
  RefreshCw,
  Star,
  CheckCircle2,
  AlertCircle,
  ClipboardList
} from "lucide-react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { AuthorityLogo } from "@/lib/exam-icons"

/**
 * @fileOverview Universal Exam Hub Client v3.2.
 * FIXED: Replaced 404 screen with professional "No Mock Tests" empty state for valid exams.
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
  const pyqsQuery = useMemo(() => (db && examId ? query(collection(db, "pyqs"), where("examId", "==", examId)) : null), [db, examId]);
  const resultsQuery = useMemo(() => (db && user ? query(collection(db, "results"), where("userId", "==", user.uid)) : null), [db, user]);

  const { data: rawMocks, loading: mocksLoading } = useCollection<any>(mocksQuery)
  const { data: rawPyqs, loading: pyqsLoading } = useCollection<any>(pyqsQuery)
  const { data: userResults } = useCollection<any>(resultsQuery)
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: categories } = useCollection<any>(useMemo(() => (db ? collection(db, "categories") : null), [db]))

  const [isPinning, setIsPinning] = useState(false);

  const isPinned = useMemo(() => (examId && profile?.pinnedExams?.includes(examId)) || false, [profile, examId]);

  const togglePin = async () => {
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

  const groupedContent = useMemo(() => {
    if (!examId) return { FULL: [], SUBJECT: [], SECTIONAL: [], PYQ: [], total: 0 };
    const mocks = (rawMocks || []).filter(m => m.examId === examId || (m.examIds && m.examIds.includes(examId)));
    const pyqs = rawPyqs || [];
    return {
      FULL: mocks.filter(m => m.mockType === 'FULL'),
      SUBJECT: mocks.filter(m => m.mockType === 'SUBJECT'),
      SECTIONAL: mocks.filter(m => m.mockType === 'SECTIONAL'),
      PYQ: pyqs,
      total: mocks.length + pyqs.length
    }
  }, [rawMocks, rawPyqs, examId])

  if (examLoading || userLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-4">
      <Zap className="h-8 w-8 text-primary animate-pulse" />
      <p className="text-[10px] font-black uppercase text-slate-300">Synchronizing Hub...</p>
    </div>
  );
  
  if (!examId || (!exam && !examLoading)) return (
    <div className="h-screen flex flex-col items-center justify-center text-center p-6 space-y-6 bg-white">
       <div className="h-16 w-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-500 shadow-xl border border-rose-100">
          <AlertCircle className="h-8 w-8" />
       </div>
       <div className="space-y-2">
          <h2 className="text-2xl font-black text-[#0F172A] uppercase">Vertical Not Found</h2>
          <p className="text-slate-500 font-medium max-w-xs mx-auto">
             The preparation node <code className="text-rose-600 bg-rose-50 px-1 py-0.5 rounded">{examId}</code> could not be verified.
          </p>
       </div>
       <Button onClick={() => router.back()} variant="outline" className="rounded-xl h-12 px-8">Return Back</Button>
    </div>
  );

  const activeBoard = boards?.find((b: any) => b.id === exam.boardId);
  const activeCategory = categories?.find((c: any) => c.id === exam.categoryId);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body text-left">
      <Navbar />
      
      <section className="bg-white border-b border-slate-100 py-6 md:py-20 relative overflow-hidden">
         <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-16">
               <div className="flex items-start gap-3 md:gap-8 flex-1 min-w-0">
                  <button onClick={() => router.back()} className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 shrink-0 hover:bg-slate-50"><ChevronLeft className="h-4 w-4" /></button>
                  <div className="min-w-0 space-y-1.5 md:space-y-6">
                     <div className="flex items-center gap-2 md:gap-4">
                        <Badge className="bg-primary/10 text-primary border-none text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm">{activeBoard?.abbreviation || 'OFFICIAL'} HUB</Badge>
                        <button onClick={togglePin} disabled={isPinning} className={cn("flex items-center gap-1 px-2 md:px-4 py-1 rounded-lg md:rounded-xl border transition-all active:scale-95 shadow-sm font-black uppercase text-[7px] md:text-[9px] tracking-widest", isPinned ? "bg-primary border-primary text-white" : "bg-white border-slate-200 text-slate-300 hover:text-primary")}>
                           {isPinning ? <RefreshCw className="h-2.5 w-2.5 animate-spin" /> : isPinned ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Star className="h-2.5 w-2.5" />}
                           {isPinned ? 'FOLLOWING' : 'SAVE'}
                        </button>
                     </div>
                     <div className="flex items-center gap-4 md:gap-8">
                        <AuthorityLogo board={activeBoard} category={activeCategory} size="md" className="w-12 h-12 md:w-28 md:h-28 rounded-xl md:rounded-[2.5rem] bg-slate-50" />
                        <h1 className="text-xl md:text-5xl lg:text-6xl font-black text-[#0F172A] leading-tight tracking-tight">
                           {exam.name}
                        </h1>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <main className="container mx-auto px-2 md:px-4 py-4 md:py-12 max-w-7xl pb-40">
         {groupedContent.total === 0 && !mocksLoading && !pyqsLoading ? (
            <div className="py-20 md:py-32 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
               <div className="h-24 w-24 md:h-32 md:w-32 bg-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-300 shadow-inner">
                  <ClipboardList className="h-10 w-10 md:h-14 md:w-14" />
               </div>
               <div className="space-y-3 max-w-md mx-auto">
                  <h2 className="text-2xl md:text-4xl font-black text-[#0F172A] uppercase tracking-tight">No Mock Tests Available</h2>
                  <p className="text-slate-500 font-medium text-sm md:text-lg leading-relaxed">
                     Mock tests for this exam haven't been published yet. Please check back soon. New tests will be added regularly.
                  </p>
               </div>
               <Button onClick={() => router.back()} variant="outline" className="rounded-xl h-14 px-10 border-2 font-bold uppercase tracking-widest text-[10px]">Return Back</Button>
            </div>
         ) : (
            <Tabs defaultValue="FULL" className="space-y-4 md:space-y-12">
               <div className="bg-white border border-slate-100 rounded-xl md:rounded-[2rem] p-1 shadow-md overflow-x-auto no-scrollbar">
                  <TabsList className="bg-transparent border-none p-0 flex h-10 md:h-14 w-full justify-start gap-1">
                     <DashboardTab value="FULL" label="Mock Tests" icon={Zap} />
                     <DashboardTab value="SUBJECT" label="Subjects" icon={BookOpen} />
                     <DashboardTab value="SECTIONAL" label="Sectional" icon={List} />
                     <DashboardTab value="PYQ" label="Papers" icon={Layers} />
                  </TabsList>
               </div>

               <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
                  <TabsContent value="FULL"><MockList data={groupedContent.FULL} results={userResults} isPassActive={isPassActive} loading={mocksLoading} boards={boards} /></TabsContent>
                  <TabsContent value="SUBJECT"><MockList data={groupedContent.SUBJECT} results={userResults} isPassActive={isPassActive} loading={mocksLoading} boards={boards} /></TabsContent>
                  <TabsContent value="SECTIONAL"><MockList data={groupedContent.SECTIONAL} results={userResults} isPassActive={isPassActive} loading={mocksLoading} boards={boards} /></TabsContent>
                  <TabsContent value="PYQ"><NotesList data={groupedContent.PYQ} isPassActive={isPassActive} loading={pyqsLoading} type="PYQ" /></TabsContent>
               </div>
            </Tabs>
         )}
      </main>
      <Footer />
    </div>
  )
}

function DashboardTab({ value, label, icon: Icon }: { value: string, label: string, icon: any }) {
   return (
      <TabsTrigger value={value} className="px-3 md:px-12 h-full font-black text-[8px] md:text-[10px] data-[state=active]:bg-[#0B1528] data-[state=active]:text-white rounded-lg md:rounded-[1.5rem] transition-all whitespace-nowrap flex items-center gap-1.5 md:gap-3">
         <Icon className="h-3 w-3 md:h-4 md:w-4" /> {label}
      </TabsTrigger>
   )
}

function MockList({ data, results, isPassActive, loading, boards }: any) {
   const router = useRouter();
   if (loading) return <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 md:h-64 w-full rounded-xl md:rounded-[2.5rem] bg-white" />)}</div>;
   if (data.length === 0) return <div className="py-24 text-center opacity-20 flex flex-col items-center justify-center space-y-4 text-slate-300"><Zap className="h-10 w-10" /><p className="font-headline font-black text-lg md:text-xl uppercase tracking-widest">Section Empty</p></div>;

   return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
         {data.map((mock: any) => {
            const isPremium = mock.accessLevel === 'PREMIUM';
            const locked = isPremium && !isPassActive;
            const board = boards?.find((b: any) => b.id === (mock.boardIds?.[0] || mock.boardId));

            return (
               <Card key={mock.id} className="border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl md:rounded-[3rem] bg-white p-4 md:p-10 text-center flex flex-col h-auto min-h-[200px] md:min-h-[400px] group relative overflow-hidden">
                  <div className="h-10 w-10 md:h-20 md:w-20 mx-auto mb-4 md:mb-8">
                     <AuthorityLogo board={board} size="md" className="w-10 h-10 md:w-20 md:h-20 bg-slate-50 rounded-lg md:rounded-xl" />
                  </div>
                  <CardHeader className="p-0 flex-1 space-y-1 md:space-y-4">
                     <CardTitle className="font-bold text-xs md:text-2xl text-[#0F172A] leading-tight line-clamp-2">
                        {mock.title}
                     </CardTitle>
                     <div className="flex items-center justify-center gap-2 md:gap-6 text-[7px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1 md:gap-2"><BookOpen className="h-2.5 w-2.5 md:h-4 md:w-4" /> {mock.totalQuestions} Qs</span>
                        <span className="flex items-center gap-1 md:gap-2"><Clock className="h-2.5 w-2.5 md:h-4 md:w-4" /> {mock.duration}m</span>
                     </div>
                  </CardHeader>
                  <CardContent className="p-0 mt-4 md:mt-8">
                     <button 
                        onClick={() => router.push(locked ? '/pass' : `/mocks/view?id=${mock.id}`)} 
                        className={cn(
                          "w-full h-9 md:h-14 rounded-full font-black text-[8px] md:text-[11px] tracking-widest uppercase shadow-md border-none transition-all active:scale-95 flex items-center justify-center gap-2 md:gap-3", 
                          locked ? "bg-orange-500 text-white" : "bg-[#0F172A] text-white"
                        )}
                      >
                        {locked ? <Lock className="h-2.5 w-2.5 md:h-4 md:w-4" /> : null}
                        {locked ? 'Unlock' : 'Start'}
                     </button>
                  </CardContent>
               </Card>
            )
         })}
      </div>
   )
}

function NotesList({ data, isPassActive, loading, type }: any) {
   if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl bg-white" />)}</div>;
   if (data.length === 0) return <div className="py-24 text-center opacity-20 flex flex-col items-center justify-center space-y-4 text-slate-300"><Layers className="h-10 w-10" /><p className="font-headline font-black text-lg md:text-xl uppercase tracking-widest">No Items</p></div>;

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
         {data.map((item: any) => {
            const isLocked = !item.isFree && !isPassActive;
            return (
               <Card key={item.id} className="border border-slate-100 shadow-md rounded-2xl md:rounded-[2rem] bg-white p-4 md:p-8 flex items-center justify-between group transition-all hover:shadow-xl">
                  <div className="flex items-center gap-4 md:gap-6 min-w-0">
                     <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner">
                        {isLocked ? <Lock className="h-4 w-4 md:h-6 md:w-6 text-amber-500" /> : <Layers className={cn("h-4 w-4 md:h-6 md:w-6", type === 'PYQ' ? 'text-emerald-500' : 'text-blue-500')} />}
                     </div>
                     <div className="min-w-0">
                        <h3 className="text-sm md:text-lg font-black text-[#0F172A] truncate max-w-[150px] md:max-w-[300px] leading-none">{item.title}</h3>
                        <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 md:mt-2">{item.category || type}</p>
                     </div>
                  </div>
                  <button onClick={() => window.open(isLocked ? '/pass' : (item.pdfUrl || '#'), isLocked ? '_self' : '_blank')} className={cn(
                    "h-9 md:h-11 px-5 md:px-8 rounded-full font-black uppercase text-[9px] md:text-[10px] tracking-widest shadow-md shrink-0 border-none transition-all active:scale-95",
                    isLocked ? "bg-orange-500 text-white" : "bg-[#0F172A] text-white"
                  )}>
                     {isLocked ? 'UNLOCK' : 'GET'}
                  </button>
               </Card>
            )
         })}
      </div>
   )
}
