"use client"

import React, { useMemo, useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useDoc, useCollection, useFirestore, useUser } from "@/firebase"
import { doc, collection, query, where, limit, orderBy } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
  Newspaper
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Exam Hub v31.0 (Hardened).
 * RESTORED: Unlock button for premium preparation nodes is now restored permanently.
 */

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

export default function ExamHubPage() {
  const params = useParams()
  const router = useRouter()
  const db = useFirestore()
  const { user, profile, loading: userLoading } = useUser()
  const examId = params.id as string

  // 1. PRIMARY OFFICIAL LIST LISTENERS
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

  // PASS ACCESS FIREWALL
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

  // CONTENT GROUPING LOGIC
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

  // HARDENED PERFORMANCE CHECK
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
      
      {/* HEADER */}
      <section className="bg-white border-b border-slate-100 py-6 md:py-16 text-left">
         <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
               <div className="flex items-center gap-4 flex-1">
                  <button onClick={() => router.back()} className="h-10 w-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                     <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="min-w-0 space-y-2">
                     <div className="flex items-center gap-2">
                        <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-sm">
                           {activeBoard?.abbreviation || 'OFFICIAL'} HUB
                        </Badge>
                     </div>
                     <h1 className="text-xl md:text-5xl font-black text-[#0F172A] uppercase leading-tight tracking-tight truncate">
                        {exam.name}
                     </h1>
                  </div>
               </div>
               
               <div className="flex items-center gap-6 bg-slate-50/50 px-6 py-4 rounded-2xl border border-slate-100 w-full md:w-auto">
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

      {/* TABS NAVIGATION */}
      <main className="container mx-auto px-4 py-8 max-w-7xl pb-40">
         <Tabs defaultValue="FULL" className="space-y-8 md:space-y-12">
            <div className="bg-white border border-slate-100 rounded-2xl p-1 shadow-md overflow-x-auto no-scrollbar relative">
               <TabsList className="bg-transparent border-none p-0 flex h-14 w-full justify-start gap-1 overflow-x-auto no-scrollbar">
                  <DashboardTab value="FULL" label="Full Mock" icon={<Zap />} />
                  <DashboardTab value="SUBJECT" label="Subjects" icon={<BookOpen />} />
                  <DashboardTab value="SECTIONAL" label="Sectional" icon={<List />} />
                  <DashboardTab value="CA" label="Current Affairs" icon={<Newspaper />} />
                  <DashboardTab value="PYQ" label="PYQ" icon={<Layers />} />
                  <DashboardTab value="NOTES" label="Notes" icon={<FileText />} />
               </TabsList>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
               <TabsContent value="FULL" className="m-0">
                  <MockList data={groupedContent.FULL} results={userResults} isPassActive={isPassActive} user={user} loading={mocksLoading} />
               </TabsContent>
               <TabsContent value="SUBJECT" className="m-0">
                  <MockList data={groupedContent.SUBJECT} results={userResults} isPassActive={isPassActive} user={user} loading={mocksLoading} />
               </TabsContent>
               <TabsContent value="SECTIONAL" className="m-0">
                  <MockList data={groupedContent.SECTIONAL} results={userResults} isPassActive={isPassActive} user={user} loading={mocksLoading} />
               </TabsContent>
               <TabsContent value="CA" className="m-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                     {caLoading ? (
                        <Skeleton className="h-40 w-full rounded-2xl" />
                     ) : groupedContent.CA.map((item: any) => (
                        <Link key={item.id} href="/current-affairs">
                           <Card className="border-none shadow-lg rounded-2xl bg-white p-6 flex items-center justify-between group h-full">
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
                  <MockList data={groupedContent.PYQ} results={userResults} isPassActive={isPassActive} user={user} loading={mocksLoading} />
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

function DashboardTab({ value, label, icon }: any) {
   return (
      <TabsTrigger value={value} className="px-5 md:px-8 h-full font-black text-[9px] md:text-[10px] uppercase tracking-widest text-slate-400 data-[state=active]:bg-[#0F172A] data-[state=active]:text-white rounded-xl transition-all whitespace-nowrap flex items-center gap-2">
         {React.cloneElement(icon, { className: "h-3.5 w-3.5" })} {label}
      </TabsTrigger>
   )
}

function MockList({ data, results, isPassActive, user, loading }: any) {
   const router = useRouter();
   
   if (loading) return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
      </div>
   );

   if (data.length === 0) return (
      <div className="py-24 text-center opacity-20 flex flex-col items-center gap-4">
         <Zap className="h-10 w-10 text-slate-300" />
         <p className="font-headline font-black text-lg uppercase tracking-widest">Section Empty</p>
      </div>
   );

   return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
         {data.map((mock: any) => {
            const result = results?.find((r: any) => r.mockId === mock.id);
            const tier = (mock.accessLevel || mock.accessType || 'FREE').trim().toUpperCase();
            const isPremium = tier === 'PREMIUM';
            const locked = isPremium && !isPassActive;

            return (
               <Card key={mock.id} className="border-none shadow-lg rounded-[2rem] bg-white group p-6 md:p-10 flex flex-col h-full border border-slate-100 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6 md:mb-10">
                     <Badge className={cn(
                        "border-none text-[8px] font-black px-2.5 py-0.5 rounded shadow-md uppercase tracking-widest", 
                        isPremium ? "bg-amber-100 text-amber-600" : "bg-emerald-50 text-emerald-600"
                     )}>
                        {isPremium ? '🔒 PREMIUM' : 'FREE'}
                     </Badge>
                     {result && <Badge className="bg-primary text-white border-none text-[7px] font-black px-2 py-0.5 rounded uppercase">CHECKED</Badge>}
                  </div>
                  
                  <h3 className="text-base md:text-2xl font-black text-[#0F172A] uppercase leading-tight mb-6 md:mb-8 flex-1 group-hover:text-primary transition-colors">
                     {mock.title}
                  </h3>

                  <div className="flex items-center gap-6 pt-4 border-t border-slate-50 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                     <span className="flex items-center gap-2"><Clock className="h-3 w-3 text-primary" /> {mock.duration}m</span>
                     <span className="flex items-center gap-2"><BookOpen className="h-3 w-3 text-primary" /> {mock.totalQuestions} Qs</span>
                  </div>

                  <div className="mt-8">
                     {locked ? (
                        <Button onClick={() => router.push('/pass')} className="w-full h-12 md:h-16 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-[9px] md:text-[10px] tracking-widest rounded-xl shadow-lg gap-2 border-none">
                           <Lock className="h-3.5 w-3.5" /> UNLOCK TEST
                        </Button>
                     ) : (
                        <Button onClick={() => router.push(user ? `/mocks/${mock.id}/instructions` : `/login?returnUrl=/mocks/${mock.id}`)} className="w-full h-12 md:h-16 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[9px] md:text-[10px] tracking-widest rounded-xl shadow-lg border-none gap-3 active:scale-95 transition-all">
                           <Play className="h-4 w-4 fill-current text-primary" /> START TEST
                        </Button>
                     )}
                  </div>
               </Card>
            )
         })}
      </div>
   )
}

function NotesList({ data, isPassActive, loading }: any) {
   if (loading) return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
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
