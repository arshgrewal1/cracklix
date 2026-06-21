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
  Star,
  ArrowRight,
  CheckCircle2
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

/**
 * @fileOverview Institutional Exam detail Hub v46.0.
 * Terminology: "Open Exam".
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
  const pyqsQuery = useMemo(() => (db && examId ? query(collection(db, "pyqs"), where("examId", "==", examId)) : null), [db, examId]);
  const resultsQuery = useMemo(() => (db && user ? query(collection(db, "results"), where("userId", "==", user.uid)) : null), [db, user]);

  const { data: rawMocks, loading: mocksLoading } = useCollection<any>(mocksQuery)
  const { data: rawPyqs, loading: pyqsLoading } = useCollection<any>(pyqsQuery)
  const { data: userResults } = useCollection<any>(resultsQuery)
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))

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
    const mocks = (rawMocks || []).filter(m => m.examId === examId || m.examIds?.includes(examId));
    return {
      FULL: mocks.filter(m => m.mockType === 'FULL'),
      SUBJECT: mocks.filter(m => m.mockType === 'SUBJECT'),
      SECTIONAL: mocks.filter(m => m.mockType === 'SECTIONAL'),
      PYQ: (rawPyqs || [])
    }
  }, [rawMocks, rawPyqs, examId])

  if (examLoading || userLoading) return <div className="h-screen flex flex-col items-center justify-center bg-white space-y-4"><Zap className="h-8 w-8 text-primary animate-pulse" /><p className="text-[10px] font-black uppercase text-slate-300">Synchronizing...</p></div>;
  if (!exam) return <div className="h-screen flex flex-col items-center justify-center text-center p-6 space-y-4"><h2 className="text-xl font-black uppercase">Not Found</h2><Button onClick={() => router.push('/exams')}>Return</Button></div>;

  const activeBoard = boards?.find((b: any) => b.id === exam.boardId);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body text-left">
      <Navbar />
      
      <section className="bg-white border-b border-slate-100 py-14 md:py-20 relative overflow-hidden">
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
                     <h1 className="text-3xl md:text-6xl font-black text-[#0F172A] leading-tight tracking-tight">
                        {exam.name}
                     </h1>
                     <p className="text-sm md:text-xl font-bold text-slate-400 max-w-3xl leading-snug">Prepare with verified official patterns and expert solutions.</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <main className="container mx-auto px-4 py-12 max-w-7xl pb-40">
         <Tabs defaultValue="FULL" className="space-y-12">
            <div className="bg-white border border-slate-100 rounded-[2rem] p-1.5 shadow-xl overflow-x-auto no-scrollbar">
               <TabsList className="bg-transparent border-none p-0 flex h-14 w-full justify-start gap-2">
                  <DashboardTab value="FULL" label="Full Mock Tests" icon={Zap} />
                  <DashboardTab value="SUBJECT" label="Subject Tests" icon={BookOpen} />
                  <DashboardTab value="SECTIONAL" label="Sectional Tests" icon={List} />
                  <DashboardTab value="PYQ" label="Official Papers" icon={Layers} />
               </TabsList>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
               <TabsContent value="FULL"><MockList data={groupedContent.FULL} results={userResults} isPassActive={isPassActive} loading={mocksLoading} boards={boards} /></TabsContent>
               <TabsContent value="SUBJECT"><MockList data={groupedContent.SUBJECT} results={userResults} isPassActive={isPassActive} loading={mocksLoading} boards={boards} /></TabsContent>
               <TabsContent value="SECTIONAL"><MockList data={groupedContent.SECTIONAL} results={userResults} isPassActive={isPassActive} loading={mocksLoading} boards={boards} /></TabsContent>
               <TabsContent value="PYQ"><NotesList data={groupedContent.PYQ} isPassActive={isPassActive} loading={pyqsLoading} type="PYQ" /></TabsContent>
            </div>
         </Tabs>
      </main>
      <Footer />
    </div>
  )
}

function DashboardTab({ value, label, icon: Icon }: { value: string, label: string, icon: any }) {
   return (
      <TabsTrigger value={value} className="px-8 md:px-12 h-full font-black text-[10px] md:text-[11px] uppercase tracking-widest text-slate-400 data-[state=active]:bg-[#0F172A] data-[state=active]:text-white rounded-[1.5rem] transition-all whitespace-nowrap flex items-center gap-3">
         <Icon className="h-4 w-4" /> {label}
      </TabsTrigger>
   )
}

function MockList({ data, results, isPassActive, loading, boards }: any) {
   const router = useRouter();
   if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-[2.5rem] bg-white" />)}</div>;
   if (data.length === 0) return <div className="py-24 text-center opacity-20 flex flex-col items-center gap-4 text-slate-300"><Zap className="h-12 w-12" /><p className="font-headline font-black text-xl uppercase tracking-widest">Section Empty</p></div>;

   return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
         {data.map((mock: any) => {
            const result = results?.find((r: any) => r.mockId === mock.id);
            const isPremium = mock.accessLevel === 'PREMIUM';
            const locked = isPremium && !isPassActive;
            const board = boards?.find((b: any) => b.id === (mock.boardIds?.[0] || mock.boardId));

            return (
               <Card key={mock.id} className="border border-slate-100 shadow-xl hover:shadow-4xl transition-all duration-500 rounded-[2.5rem] bg-white p-10 text-center flex flex-col h-[400px] group relative overflow-hidden">
                  <div className="h-14 w-14 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center p-2 mb-8 shadow-inner relative overflow-hidden border border-slate-100">
                     <ShieldCheck className="h-full w-full text-primary" />
                  </div>
                  <CardHeader className="p-0 flex-1 space-y-5">
                     <CardTitle className="font-black text-xl md:text-2xl text-[#0F172A] leading-tight line-clamp-2">
                        {mock.title}
                     </CardTitle>
                     <div className="flex items-center justify-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> {mock.totalQuestions} Items</span>
                        <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {mock.duration}m Time</span>
                     </div>
                  </CardHeader>
                  <CardContent className="p-0 mt-8">
                     <Button onClick={() => router.push(locked ? '/pass' : `/mocks/${mock.id}/instructions`)} className={cn("w-full h-12 rounded-xl font-black text-[11px] tracking-[0.2em] uppercase shadow-lg border-none transition-all active:scale-95", locked ? "bg-amber-500 hover:bg-amber-600" : "bg-[#0F172A] hover:bg-black")}>
                        {locked ? <><Lock className="h-4 w-4 mr-2" /> Unlock Exam</> : 'Start Exam'}
                     </Button>
                  </CardContent>
               </Card>
            )
         })}
      </div>
   )
}

function NotesList({ data, isPassActive, loading, type }: any) {
   if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl bg-white" />)}</div>;
   if (data.length === 0) return <div className="py-24 text-center opacity-20 flex flex-col items-center gap-4 text-slate-300"><Layers className="h-12 w-12" /><p className="font-headline font-black text-xl uppercase tracking-widest">No Items Found</p></div>;

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {data.map((item: any) => {
            const isLocked = !item.isFree && !isPassActive;
            return (
               <Card key={item.id} className="border border-slate-100 shadow-xl rounded-[2rem] bg-white p-8 flex items-center justify-between group transition-all hover:shadow-2xl">
                  <div className="flex items-center gap-6 min-w-0">
                     <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-blue-50 transition-colors">
                        {isLocked ? <Lock className="h-6 w-6 text-amber-500" /> : <FileText className={cn("h-6 w-6", type === 'PYQ' ? 'text-emerald-500' : 'text-blue-500')} />}
                     </div>
                     <div className="min-w-0">
                        <h3 className="text-lg font-black text-[#0F172A] truncate max-w-[300px] uppercase leading-none">{item.title}</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">{item.category || type} Node</p>
                     </div>
                  </div>
                  <Button asChild className="h-11 px-8 bg-[#0F172A] hover:bg-black text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-md shrink-0">
                     <Link href={isLocked ? '/pass' : (item.pdfUrl || '#')} target={isLocked ? '_self' : '_blank'}>
                        {isLocked ? 'UNLOCK' : 'DOWNLOAD'}
                     </Link>
                  </Button>
               </Card>
            )
         })}
      </div>
   )
}
