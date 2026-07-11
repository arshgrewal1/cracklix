'use client';

import React, { useMemo, useState } from "react"
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
  Newspaper
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { AuthorityLogo } from "@/lib/exam-icons"

/**
 * @fileOverview Exam Center v25.0.
 * OPTIMIZED: Compact Category selector for mobile/PWA (48px height).
 */
export default function ExamHubPage() {
  const params = useParams()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  const { user, profile, loading: userLoading } = useUser()
  const examId = (params?.id as string) ?? ""

  const { data: exam, loading: examLoading } = useDoc<any>(useMemo(() => (db && examId ? doc(db, "exams", examId) : null), [db, examId]))
  
  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), where("published", "==", true)) : null), [db]);
  const pyqsQuery = useMemo(() => (db && examId ? query(collection(db, "pyqs"), where("examId", "==", examId)) : null), [db, examId]);
  const resultsQuery = useMemo(() => (db && user ? query(collection(db, "results"), where("userId", "==", user.uid)) : null), [db, user]);

  const { data: rawMocks, loading: mocksLoading } = useCollection<any>(mocksQuery)
  const { data: rawPyqs, loading: pyqsLoading } = useCollection<any>(pyqsQuery)
  const { data: userResults } = useCollection<any>(resultsQuery)
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: categories } = useCollection<any>(useMemo(() => (db ? collection(db, "categories") : null), [db]))

  const [isPinning, setIsPinning] = useState(false);

  const isPinned = useMemo(() => profile?.pinnedExams?.includes(examId) || false, [profile, examId]);

  const togglePin = async () => {
    if (!db || !user || isPinning) return;
    setIsPinning(true);
    const userRef = doc(db, "users", user.uid);
    try {
      if (isPinned) {
        await updateDoc(userRef, { pinnedExams: arrayRemove(examId), updatedAt: serverTimestamp() });
        toast({ title: "Removed from list" });
      } else {
        await updateDoc(userRef, { pinnedExams: arrayUnion(examId), updatedAt: serverTimestamp() });
        toast({ title: "Added to list" });
      }
    } finally { setIsPinning(false); }
  };

  const isPassActive = useMemo(() => {
     if (!user || !profile) return false;
     if (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') return true;
     return profile?.passStatus === 'active';
  }, [user, profile]);

  const groupedContent = useMemo(() => {
    const mocks = (rawMocks || []).filter((m:any) => m.examId === examId || m.examIds?.includes(examId));
    return {
      FULL: mocks.filter((m:any) => m.mockType === 'FULL'),
      SUBJECT: mocks.filter((m:any) => m.mockType === 'SUBJECT'),
      SECTIONAL: mocks.filter((m:any) => m.mockType === 'SECTIONAL'),
      CA: mocks.filter((m:any) => m.mockType === 'CA_QUIZ'),
      PYQ: (rawPyqs || [])
    }
  }, [rawMocks, rawPyqs, examId])

  if (examLoading || userLoading) return <div className="h-screen flex flex-col items-center justify-center bg-white space-y-4"><Zap className="h-8 w-8 text-primary animate-pulse" /><p className="text-[10px] font-black uppercase text-slate-300">Synchronizing...</p></div>;
  if (!exam) return null;

  const activeBoard = boards?.find((b: any) => b.id === exam.boardId);
  const activeCategory = categories?.find((c: any) => c.id === exam.categoryId);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body text-left">
      <Navbar />
      
      <section className="bg-white border-b border-slate-100 py-10 md:py-20 relative overflow-hidden">
         <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-10 md:gap-16">
               <div className="flex items-start gap-6 flex-1 min-w-0">
                  <button onClick={() => router.back()} className="h-10 w-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 shrink-0 hover:bg-slate-50"><ChevronLeft className="h-5 w-5" /></button>
                  <div className="min-w-0 space-y-4">
                     <div className="flex items-center gap-4">
                        <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded shadow-sm">{activeBoard?.abbreviation || 'OFFICIAL'} HUB</Badge>
                        <button onClick={togglePin} disabled={isPinning} className={cn("flex items-center gap-2 px-4 py-1.5 rounded-xl border transition-all active:scale-95 shadow-sm font-black uppercase text-[9px] tracking-widest", isPinned ? "bg-primary border-primary text-white" : "bg-white border-slate-200 text-slate-400 hover:text-primary")}>
                           {isPinning ? <RefreshCw className="h-3 w-3 animate-spin" /> : isPinned ? <CheckCircle2 className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                           {isPinned ? 'FOLLOWING' : 'SAVE EXAM'}
                        </button>
                     </div>
                     <div className="flex items-center gap-6">
                        <AuthorityLogo board={activeBoard} category={activeCategory} size="md" className="shadow-inner rounded-xl md:rounded-[2rem] bg-slate-50 p-3 md:p-4" />
                        <h1 className="text-2xl md:text-6xl font-black text-[#0F172A] leading-tight tracking-tight">
                           {exam.name}
                        </h1>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl pb-40">
         <Tabs defaultValue="FULL" className="space-y-8 md:space-y-12">
            {/* CATEGORY SELECTOR OPTIMIZATION - 48PX HEIGHT */}
            <div className="bg-white border border-slate-100 rounded-2xl p-1 shadow-md overflow-x-auto no-scrollbar flex items-center h-12">
               <TabsList className="bg-transparent border-none p-0 flex h-full w-full justify-start gap-1 snap-x snap-mandatory">
                  <DashboardTab value="FULL" label="Full Mock Tests" icon={Zap} />
                  <DashboardTab value="SUBJECT" label="Subject Tests" icon={BookOpen} />
                  <DashboardTab value="SECTIONAL" label="Sectional Tests" icon={List} />
                  <DashboardTab value="CA" label="Current Affairs" icon={Newspaper} />
               </TabsList>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
               <TabsContent value="FULL"><MockList data={groupedContent.FULL} isPassActive={isPassActive} loading={mocksLoading} boards={boards} /></TabsContent>
               <TabsContent value="SUBJECT"><MockList data={groupedContent.SUBJECT} isPassActive={isPassActive} loading={mocksLoading} boards={boards} /></TabsContent>
               <TabsContent value="SECTIONAL"><MockList data={groupedContent.SECTIONAL} isPassActive={isPassActive} loading={mocksLoading} boards={boards} /></TabsContent>
               <TabsContent value="CA"><MockList data={groupedContent.CA} isPassActive={isPassActive} loading={mocksLoading} boards={boards} /></TabsContent>
            </div>
         </Tabs>
      </main>
      <Footer />
    </div>
  )
}

function DashboardTab({ value, label, icon: Icon }: { value: string, label: string, icon: any }) {
   return (
      <TabsTrigger value={value} className="px-4 md:px-6 h-full font-bold text-[13px] md:text-[14px] text-slate-500 bg-white border border-slate-50 data-[state=active]:border-transparent data-[state=active]:bg-[#0F172A] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all whitespace-nowrap flex items-center gap-2 md:gap-3 snap-start">
         <Icon className="h-[18px] w-[18px] shrink-0" /> {label}
      </TabsTrigger>
   )
}

function MockList({ data, results, isPassActive, loading, boards }: any) {
   const router = useRouter();
   if (loading) return <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">{Array.from({ length: 3 }).map((_, i) => <Skeleton className="h-64 w-full rounded-2xl md:rounded-[2.5rem] bg-white" key={i} />)}</div>;
   if (data.length === 0) return (
     <div className="py-24 text-center opacity-30 flex flex-col items-center gap-4 text-slate-300">
        <Zap className="h-12 w-12" />
        <p className="font-headline font-black text-xl uppercase tracking-widest">No Tests Found</p>
     </div>
   );

   return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
         {data.map((mock: any) => {
            const isPremium = mock.accessLevel === 'PREMIUM';
            const locked = isPremium && !isPassActive;
            const board = boards?.find((b: any) => b.id === (mock.boardIds?.[0] || mock.boardId));

            return (
               <Card key={mock.id} className="border border-slate-100 shadow-xl hover:shadow-4xl transition-all duration-500 rounded-2xl md:rounded-[2.5rem] bg-white p-4 md:p-10 text-center flex flex-col group relative overflow-hidden h-full">
                  <div className="h-10 w-10 md:h-16 md:w-16 mx-auto mb-4 md:mb-8">
                     <AuthorityLogo board={board} size="md" className="w-full h-full shadow-inner rounded-lg bg-slate-50 p-1 md:p-2" />
                  </div>
                  <CardHeader className="p-0 flex-1 space-y-2 md:space-y-5">
                     <CardTitle className="font-black text-xs md:text-2xl text-[#0F172A] leading-tight line-clamp-2">
                        {mock.title}
                     </CardTitle>
                     <div className="flex items-center justify-center gap-2 md:gap-6 text-[8px] md:text-[11px] font-bold text-slate-400 uppercase tracking-tight"> 
                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3 md:h-4 md:w-4" /> {mock.totalQuestions} Qs</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3 md:h-4 md:w-4" /> {mock.duration}m</span>
                     </div>
                  </CardHeader>
                  <CardContent className="p-0 mt-4 md:mt-8">
                     <Button onClick={() => router.push(locked ? '/pass' : `/mocks/instructions?id=${mock.id}`)} className={cn("w-full h-10 md:h-14 rounded-full font-black text-[9px] md:text-[11px] tracking-widest uppercase shadow-lg border-none transition-all active:scale-95", locked ? "bg-amber-500 hover:bg-amber-600" : "bg-[#0F172A] hover:bg-black")}>
                        {locked ? <Lock className="h-3 w-3 mr-2" /> : null} {locked ? 'Unlock' : 'Start'}
                     </Button>
                  </CardContent>
               </Card>
            )
         })}
      </div>
   )
}
