
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
 * @fileOverview Institutional Exam Hub v28.0.
 * UPDATED: Fixed live accuracy and attempt stats with loading skeletons.
 */

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

export default function ExamHubPage() {
  const params = useParams()
  const router = useRouter()
  const db = useFirestore()
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
  const { data: caHub } = useCollection<any>(hubQuery);

  // PASS ACCESS FIREWALL
  const isPassActive = useMemo(() => {
     if (!user || !profile) return false;
     const userEmail = user.email?.toLowerCase();
     const isFounder = userEmail && SUPER_ADMIN_WHITELIST.includes(userEmail);
     if (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN' || isFounder) return true;
     
     if (profile.pass?.active === true) {
        return new Date(profile.pass.expiryDate) > new Date();
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
      })
    }
  }, [rawMocks, rawNotes, caHub, examId, exam])

  // HARDENED ATTEMPT AUDIT LOGIC
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

  if (examLoading || userLoading) return <div className="h-screen flex items-center justify-center bg-white"><Skeleton className="h-16 w-16 rounded-full animate-pulse" /></div>
  if (!exam) return null;

  const activeBoard = boards?.find((b: any) => b.id === exam.boardId || b.abbreviation === exam.boardId);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body text-left print:bg-white print:pb-0">
      <Navbar />
      
      <section className="bg-white border-b border-slate-100 py-6 md:py-12 text-left">
         <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col md:flex-row items-center gap-10">
               <div className="flex items-center gap-6 flex-1">
                  <button onClick={() => router.back()} className="h-12 w-12 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black shrink-0">
                     <ChevronLeft className="h-6 w-6" />
                  </button>
                  <div className="min-w-0 space-y-2">
                     <div className="flex items-center gap-3">
                        <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase px-3 py-1 rounded-lg">
                           {activeBoard?.abbreviation || 'GOVT'} HUB
                        </Badge>
                     </div>
                     <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] uppercase leading-none tracking-tight truncate">
                        {exam.name}
                     </h1>
                  </div>
               </div>
               
               <div className="flex items-center gap-8 bg-slate-50 px-8 py-4 rounded-3xl border border-slate-100">
                  <div className="text-center min-w-[80px]">
                     <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">ACCURACY</p>
                     {resultsLoading || mocksLoading ? (
                        <Skeleton className="h-7 w-12 bg-slate-200 mx-auto" />
                     ) : (
                        <p className="text-2xl font-black text-[#0F172A]">{examPerformance.avgAcc}%</p>
                     )}
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div className="text-center min-w-[80px]">
                     <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">ATTEMPTED</p>
                     {resultsLoading || mocksLoading ? (
                        <Skeleton className="h-7 w-12 bg-slate-200 mx-auto" />
                     ) : (
                        <p className="text-2xl font-black text-[#0F172A]">{examPerformance.attempted}</p>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </section>

      <main className="container mx-auto px-4 py-12 max-w-7xl pb-40">
         <Tabs defaultValue="FULL" className="space-y-12">
            <div className="bg-white border border-slate-100 rounded-[1.8rem] p-1.5 shadow-sm overflow-x-auto no-scrollbar">
               <TabsList className="bg-transparent border-none p-0 flex h-14 w-full justify-start gap-1">
                  <DashboardTab value="FULL" label="Full Length Mock" icon={<Zap />} />
                  <DashboardTab value="SUBJECT" label="Subject-Wise Test" icon={<BookOpen />} />
                  <DashboardTab value="SECTIONAL" label="Sectional Test" icon={<List />} />
                  <DashboardTab value="CA" label="Current Affairs" icon={<Newspaper />} />
                  <DashboardTab value="PYQ" label="PYQ Paper" icon={<Layers />} />
                  <DashboardTab value="NOTES" label="Study Notes" icon={<FileText />} />
                  <DashboardTab value="ANALYTICS" label="Performance" icon={<BarChart3 />} />
               </TabsList>
            </div>

            <div className="animate-in fade-in duration-500">
               <TabsContent value="FULL" className="m-0"><MockList data={groupedContent.FULL} results={userResults} isPassActive={isPassActive} user={user} /></TabsContent>
               <TabsContent value="SUBJECT" className="m-0"><MockList data={groupedContent.SUBJECT} results={userResults} isPassActive={isPassActive} user={user} /></TabsContent>
               <TabsContent value="SECTIONAL" className="m-0"><MockList data={groupedContent.SECTIONAL} results={userResults} isPassActive={isPassActive} user={user} /></TabsContent>
               <TabsContent value="CA" className="m-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {groupedContent.CA.map((item: any) => (
                        <Link key={item.id} href="/current-affairs">
                           <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 md:p-10 flex items-center justify-between group hover:shadow-2xl transition-all">
                              <div className="flex items-center gap-8">
                                 <div className="h-16 w-16 rounded-2xl bg-orange-50 flex items-center justify-center text-primary shadow-inner">
                                    <Newspaper className="h-8 w-8" />
                                 </div>
                                 <div className="space-y-1">
                                    <h3 className="text-xl font-black text-[#0F172A] uppercase">{item.title}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.month} {item.year} Hub</p>
                                 </div>
                              </div>
                              <ChevronRight className="h-6 w-6 text-slate-200 group-hover:text-primary transition-all" />
                           </Card>
                        </Link>
                     ))}
                  </div>
               </TabsContent>
               <TabsContent value="PYQ" className="m-0"><MockList data={groupedContent.PYQ} results={userResults} isPassActive={isPassActive} user={user} /></TabsContent>
               <TabsContent value="NOTES" className="m-0"><NotesList data={groupedContent.NOTES} isPassActive={isPassActive} /></TabsContent>
               <TabsContent value="ANALYTICS" className="m-0">
                  <Card className="border-none shadow-xl rounded-[3rem] bg-white p-12 text-center space-y-8">
                     <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                        <BarChart3 className="h-12 w-12" />
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-3xl font-headline font-black uppercase text-[#0F172A]">Exam Readiness Audit</h3>
                        <p className="text-slate-500 max-w-md mx-auto">Track your accuracy and state-level rank for {exam.name}.</p>
                     </div>
                     <div className="grid grid-cols-3 gap-8 pt-6">
                        <PerformanceNode label="AVERAGE" val={`${examPerformance.avgAcc}%`} color="text-primary" />
                        <PerformanceNode label="ATTEMPTS" val={examPerformance.attempted} color="text-blue-600" />
                        <PerformanceNode label="BEST SCORE" val={examPerformance.bestScore} color="text-emerald-600" />
                     </div>
                  </Card>
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
      <TabsTrigger value={value} className="px-6 h-full font-black text-[10px] uppercase tracking-widest text-slate-400 data-[state=active]:bg-[#0F172A] data-[state=active]:text-white rounded-2xl transition-all whitespace-nowrap flex items-center gap-2">
         {React.cloneElement(icon, { className: "h-4 w-4" })} {label}
      </TabsTrigger>
   )
}

function MockList({ data, results, isPassActive, user }: { data: any[], results: any[], isPassActive: boolean, user: any }) {
   const router = useRouter();
   if (data.length === 0) return <div className="py-32 text-center opacity-20"><Zap className="h-16 w-16 mx-auto mb-4" /><p className="font-black uppercase tracking-widest">Registry Hub Empty</p></div>;

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {data.map((mock: any) => {
            const result = results?.find((r: any) => r.mockId === mock.id);
            const tier = (mock.accessLevel || mock.accessType || 'FREE').trim().toUpperCase();
            const isPremium = tier === 'PREMIUM';
            const locked = isPremium && !isPassActive;

            return (
               <Card key={mock.id} className="border-none shadow-xl rounded-[2.5rem] bg-white hover:shadow-4xl transition-all group p-8 md:p-10 text-left border border-slate-100 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-8">
                     <Badge className={cn(
                        "border-none text-[8px] font-black px-3 py-1 rounded shadow-lg uppercase", 
                        isPremium ? "bg-amber-100 text-amber-600" : "bg-emerald-50 text-emerald-600"
                     )}>
                        {isPremium ? '🔒 PREMIUM TEST' : 'FREE TEST'}
                     </Badge>
                     {result && <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black px-3 py-1">AUDITED</Badge>}
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-[#0F172A] uppercase leading-tight group-hover:text-primary transition-colors flex-1">{mock.title}</h3>
                  <div className="flex items-center gap-6 mt-10 pt-6 border-t border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                     <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> {mock.duration}m</span>
                     <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> {mock.totalQuestions} Qs</span>
                  </div>
                  <div className="mt-8">
                     {locked ? (
                        <Button onClick={() => router.push('/pass')} className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-[10px] rounded-2xl shadow-xl gap-2 border-none transition-all active:scale-95">
                           <Lock className="h-4 w-4" /> UNLOCK TEST
                        </Button>
                     ) : (
                        <Button onClick={() => router.push(user ? `/mocks/${mock.id}/instructions` : `/login?returnUrl=/mocks/${mock.id}`)} className="w-full h-14 bg-slate-900 hover:bg-black text-white font-black uppercase text-[10px] rounded-2xl shadow-xl gap-2 border-none transition-all active:scale-95">
                           <Play className="h-6 w-6 fill-current" /> START TEST
                        </Button>
                     )}
                  </div>
               </Card>
            )
         })}
      </div>
   )
}

function NotesList({ data, isPassActive }: { data: any[], isPassActive: boolean }) {
   if (data.length === 0) return <div className="py-32 text-center opacity-20"><FileText className="h-16 w-16 mx-auto mb-4" /><p className="font-black uppercase tracking-widest">No Materials Hub</p></div>;
   return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {data.map((note: any) => (
            <Card key={note.id} className="border-none shadow-xl rounded-[2.5rem] bg-white p-10 flex items-center justify-between group hover:shadow-2xl transition-all">
               <div className="flex items-center gap-8">
                  <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                     <FileText className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                     <h3 className="text-xl font-black text-[#0F172A] uppercase">{note.title}</h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{note.category}</p>
                  </div>
               </div>
               <Button asChild className="h-12 px-6 bg-slate-50 hover:bg-slate-100 text-[#0F172A] rounded-xl border border-slate-100 font-black uppercase text-[9px] tracking-widest gap-2 transition-all">
                  <a href={note.pdfUrl} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4" /> Download</a>
               </Button>
            </Card>
         ))}
      </div>
   )
}

function PerformanceNode({ label, val, color }: any) {
   return (
      <div className="space-y-1">
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
         <p className={cn("text-3xl font-headline font-black", color)}>{val}</p>
      </div>
   )
}
