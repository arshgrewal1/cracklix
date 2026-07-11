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
  Newspaper
} from "lucide-react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { AuthorityLogo } from "@/lib/exam-icons"

/**
 * @fileOverview Shared Exam Center Client Hub v24.3.
 * OPTIMIZED: Compact Category selector for mobile/PWA (48px height).
 */

function EmptyStateCard({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) {
  const router = useRouter();
  
  return (
    <div className="py-20 md:py-28 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in-50">
      <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
         <Icon className="h-10 w-10" />
      </div>
      <div className="space-y-2 max-w-sm mx-auto">
         <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
           {title}
         </h3>
         <p className="text-slate-500 dark:text-slate-400 text-sm">
           {description}
         </p>
      </div>
      <div className="flex items-center gap-4 pt-2">
         <Button variant="outline" onClick={() => router.push('/exams')} className="h-11 px-6 rounded-lg">
            Browse Other Exams
         </Button>
         <Button onClick={() => window.location.reload()} className="h-11 px-6 rounded-lg">
            Refresh
         </Button>
      </div>
    </div>
  );
}

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

  const { data: rawMocks, loading: mocksLoading } = useCollection<any>(mocksQuery)
  const { data: rawPyqs, loading: pyqsLoading } = useCollection<any>(pyqsQuery)
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
    if (!examId) return { FULL: [], SUBJECT: [], SECTIONAL: [], CA: [], PYQ: [] };
    const mocks = (rawMocks || []).filter(m => m.examId === examId || (m.examIds && m.examIds.includes(examId)));
    const pyqs = rawPyqs || [];
    return {
      FULL: mocks.filter(m => m.mockType === 'FULL'),
      SUBJECT: mocks.filter(m => m.mockType === 'SUBJECT'),
      SECTIONAL: mocks.filter(m => m.mockType === 'SECTIONAL'),
      CA: mocks.filter(m => m.mockType === 'CA_QUIZ'),
      PYQ: pyqs,
    }
  }, [rawMocks, rawPyqs, examId])

  if (examLoading || userLoading) return <div className="h-screen flex items-center justify-center bg-white"><Zap className="h-8 w-8 text-primary animate-pulse" /></div>;
  
  if (!examId || (!exam && !examLoading)) return (
    <div className="h-screen flex flex-col items-center justify-center text-center p-6 space-y-6 bg-white">
       <div className="h-16 w-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-500 shadow-xl"><AlertCircle className="h-8 w-8" /></div>
       <div className="space-y-2">
         <h2 className="text-2xl font-black text-[#0F172A]">Exam Not Found</h2>
         <p className="text-slate-500 font-medium max-w-sm mx-auto">The exam you are looking for does not exist or has been moved.</p>
       </div>
       <Button onClick={() => router.back()} variant="outline" className="rounded-xl h-12 px-8">Go Back</Button>
    </div>
  );

  const activeBoard = boards?.find((b: any) => b.id === exam.boardId);
  const activeCategory = categories?.find((c: any) => c.id === exam.categoryId);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-slate-900 font-body text-left">
      <Navbar />
      <section className="bg-white dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 py-10 md:py-20">
         <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-16">
               <div className="flex items-start gap-3 md:gap-8 flex-1 min-w-0">
                  <button onClick={() => router.back()} className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0 hover:bg-slate-50 dark:hover:bg-slate-800"><ChevronLeft className="h-4 w-4" /></button>
                  <div className="min-w-0 space-y-3">
                     <div className="flex items-center gap-2 md:gap-4">
                        <Badge className="bg-primary/10 text-primary border-none text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm">{activeBoard?.abbreviation || 'OFFICIAL'} Hub</Badge>
                        <button onClick={togglePin} disabled={isPinning} className={cn("flex items-center gap-1 px-3 py-1 rounded-xl border transition-all active:scale-95 shadow-sm font-black uppercase text-[7px] md:text-[9px] tracking-widest", isPinned ? "bg-primary border-primary text-white" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-300 hover:text-primary")}>
                           {isPinning ? <RefreshCw className="h-2.5 w-2.5 animate-spin" /> : isPinned ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Star className="h-2.5 w-2.5" />}
                           {isPinned ? 'Following' : 'Save'}
                        </button>
                     </div>
                     <div className="flex items-center gap-4 md:gap-8">
                        <AuthorityLogo board={activeBoard} category={activeCategory} size="md" className="w-12 h-12 md:w-28 md:h-28 rounded-xl md:rounded-[2.5rem] bg-slate-50 dark:bg-slate-800" />
                        <h1 className="text-xl md:text-5xl lg:text-6xl font-black text-[#0F172A] dark:text-white leading-tight tracking-tight">{exam.name}</h1>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <main className="container mx-auto px-2 md:px-4 py-8 md:py-12 max-w-7xl pb-40">
        <Tabs defaultValue="FULL" className="space-y-8 md:space-y-12">
           {/* CATEGORY SELECTOR OPTIMIZATION */}
           <div className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl p-1 shadow-md overflow-x-auto no-scrollbar flex items-center h-12 md:h-14">
              <TabsList className="bg-transparent border-none p-0 flex h-full w-full justify-start gap-1 snap-x snap-mandatory">
                 <DashboardTab value="FULL" label="Full Mock Tests" icon={Zap} />
                 <DashboardTab value="SUBJECT" label="Subject Tests" icon={BookOpen} />
                 <DashboardTab value="SECTIONAL" label="Sectional Tests" icon={List} />
                 <DashboardTab value="CA" label="Current Affairs" icon={Newspaper} />
              </TabsList>
           </div>
           <div className="animate-in fade-in slide-in-from-bottom-3">
              <TabsContent value="FULL"><MockList data={groupedContent.FULL} isPassActive={isPassActive} loading={mocksLoading} boards={boards} type="FULL" /></TabsContent>
              <TabsContent value="SUBJECT"><MockList data={groupedContent.SUBJECT} isPassActive={isPassActive} loading={mocksLoading} boards={boards} type="SUBJECT" /></TabsContent>
              <TabsContent value="SECTIONAL"><MockList data={groupedContent.SECTIONAL} isPassActive={isPassActive} loading={mocksLoading} boards={boards} type="SECTIONAL" /></TabsContent>
              <TabsContent value="CA"><MockList data={groupedContent.CA} isPassActive={isPassActive} loading={mocksLoading} boards={boards} type="CA" /></TabsContent>
           </div>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}

function DashboardTab({ value, label, icon: Icon }: { value: string, label: string, icon: any }) {
   return (
      <TabsTrigger value={value} className="px-4 md:px-8 h-full font-bold text-[11px] md:text-[14px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/50 border border-transparent data-[state=active]:bg-[#0F172A] data-[state=active]:text-white dark:data-[state=active]:bg-slate-700 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 md:gap-3 snap-start">
         <Icon className="h-4 w-4 md:h-[18px] md:w-[18px] shrink-0" /> {label}
      </TabsTrigger>
   )
}

function MockList({ data, isPassActive, loading, boards, type }: any) {
   const router = useRouter();
   if (loading) return <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">{Array.from({ length: 3 }).map((_, i) => <Skeleton className="h-40 md:h-64 w-full rounded-xl md:rounded-[2.5rem] bg-white dark:bg-slate-800" key={i} />)}</div>;
   
   if (data.length === 0) {
     const emptyStates: any = {
       FULL: {
         icon: Zap,
         title: "No Mock Tests Available",
         description: "Mock tests for this exam will be added soon. Please check back later."
       },
       SUBJECT: {
         icon: BookOpen,
         title: "No Subjects Available",
         description: "Subject-wise content has not been added for this exam yet."
       },
       SECTIONAL: {
         icon: List,
         title: "No Sectional Tests Available",
         description: "Sectional tests are currently unavailable for this exam."
       },
       CA: {
         icon: Newspaper,
         title: "No Current Affairs Quizzes",
         description: "Daily and monthly CA quizzes for this exam will appear here."
       }
     };
     return <EmptyStateCard {...emptyStates[type]} />;
   }

   return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
         {data.map((mock: any) => {
            const isPremium = mock.accessLevel === 'PREMIUM';
            const locked = isPremium && !isPassActive;
            const board = boards?.find((b: any) => b.id === (mock.boardIds?.[0] || mock.boardId));
            return (
               <Card key={mock.id} className="border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl md:rounded-[3rem] bg-white dark:bg-slate-800/50 p-4 md:p-10 text-center flex flex-col group h-full">
                  <div className="h-10 w-10 md:h-20 md:w-20 mx-auto mb-4 md:mb-8"><AuthorityLogo board={board} size="md" className="w-full h-full bg-slate-50 dark:bg-slate-800 rounded-lg md:rounded-xl" /></div>
                  <CardHeader className="p-0 flex-1 space-y-1 md:space-y-4">
                     <CardTitle className="font-bold text-xs md:text-xl text-[#0F172A] dark:text-white leading-tight line-clamp-2">{mock.title}</CardTitle>
                     <div className="flex items-center justify-center gap-2 md:gap-4 text-[8px] md:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">
                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {mock.totalQuestions} Qs</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {mock.duration}m</span>
                     </div>
                  </CardHeader>
                  <CardContent className="p-0 mt-4 md:mt-8">
                     <button onClick={() => router.push(locked ? '/pass' : `/mocks/view?id=${mock.id}`)} className={cn("w-full h-10 md:h-14 rounded-full font-black text-[9px] md:text-[11px] tracking-widest uppercase shadow-md transition-all active:scale-95 flex items-center justify-center gap-2", locked ? "bg-orange-50 text-white" : "bg-[#0F172A] dark:bg-primary text-white")}>
                        {locked ? <Lock className="h-3 w-3" /> : null} {locked ? 'Unlock' : 'Start'}
                     </button>
                  </CardContent>
               </Card>
            )
         })}
      </div>
   )
}
