"use client"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useDoc, useCollection, useFirestore } from "@/firebase"
import { doc, collection, query, where } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Clock, 
  BookOpen, 
  ShieldCheck, 
  ChevronRight,
  Layers,
  FileText,
  Zap,
  Target,
  Trophy,
  BarChart3
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function ExamHubPage() {
  const params = useParams()
  const db = useFirestore()
  const examId = params.id as string

  const { data: exam, loading } = useDoc<any>(useMemo(() => (db ? doc(db, "exams", examId) : null), [db, examId]))
  const { data: mocks } = useCollection<any>(useMemo(() => (db ? query(collection(db, "mocks"), where("examId", "==", examId), where("published", "==", true)) : null), [db, examId]))

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Skeleton className="h-20 w-20 rounded-full" /></div>
  if (!exam) return <div className="h-screen flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest">Exam Hub not found.</div>

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/30">
      <Navbar />
      
      <section className="bg-[#08152D] text-white py-24 relative overflow-hidden">
         <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[150%] bg-primary/10 blur-[120px] rounded-full" />
         <div className="container mx-auto px-6 max-w-7xl relative z-10 text-left">
            <div className="max-w-4xl space-y-8">
               <div className="flex items-center gap-4">
                  <Badge className="bg-primary text-white border-none px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-[0.2em]">
                     Official {exam.boardId} Portal
                  </Badge>
                  <div className="flex items-center gap-2 text-emerald-400">
                     <ShieldCheck className="h-4 w-4" />
                     <span className="text-[10px] font-black uppercase tracking-widest">2026 Audit Complete</span>
                  </div>
               </div>
               <h1 className="text-5xl md:text-8xl font-headline font-black leading-[0.9] tracking-tight uppercase">
                  {exam.name} <br/> <span className="text-primary">Mastery Hub</span>
               </h1>
               <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl">
                  {exam.description} Specialized assessments for PSSSB and PPSC 2026 patterns.
               </p>
            </div>
         </div>
      </section>

      <main className="container mx-auto px-6 -mt-10 max-w-7xl relative z-20 pb-32">
         <Tabs defaultValue="full" className="space-y-12">
            <div className="bg-white p-2 rounded-[2rem] shadow-3xl border border-slate-100 flex items-center overflow-x-auto custom-scrollbar">
               <TabsList className="bg-transparent border-none p-0 flex gap-2 h-auto">
                  <TabsTrigger value="full" className="rounded-xl px-8 h-12 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white"><Zap className="h-4 w-4 mr-2" /> Full Mocks</TabsTrigger>
                  <TabsTrigger value="subject" className="rounded-xl px-8 h-12 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white"><Layers className="h-4 w-4 mr-2" /> Subject Tests</TabsTrigger>
                  <TabsTrigger value="sectional" className="rounded-xl px-8 h-12 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white"><Target className="h-4 w-4 mr-2" /> Sectionals</TabsTrigger>
                  <TabsTrigger value="pyqs" className="rounded-xl px-8 h-12 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white"><FileText className="h-4 w-4 mr-2" /> PYQ Archives</TabsTrigger>
                  <TabsTrigger value="stats" className="rounded-xl px-8 h-12 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white"><BarChart3 className="h-4 w-4 mr-2" /> All Punjab Rank</TabsTrigger>
               </TabsList>
            </div>

            <TabsContent value="full" className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {mocks?.filter((m:any) => m.mockType === 'FULL').map((mock: any) => (
                  <MockCard key={mock.id} mock={mock} />
               ))}
               {mocks?.filter((m:any) => m.mockType === 'FULL').length === 0 && <EmptyState label="No Full Mocks Structure detected." />}
            </TabsContent>

            <TabsContent value="subject" className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {mocks?.filter((m:any) => m.mockType === 'SUBJECT').map((mock: any) => (
                  <MockCard key={mock.id} mock={mock} />
               ))}
               {mocks?.filter((m:any) => m.mockType === 'SUBJECT').length === 0 && <EmptyState label="No Subject Mastery tests structured." />}
            </TabsContent>

            <TabsContent value="sectional" className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {mocks?.filter((m:any) => m.mockType === 'SECTIONAL').map((mock: any) => (
                  <MockCard key={mock.id} mock={mock} />
               ))}
               {mocks?.filter((m:any) => m.mockType === 'SECTIONAL').length === 0 && <EmptyState label="No Sectional puzzles structured." />}
            </TabsContent>

            <TabsContent value="pyqs" className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {mocks?.filter((m:any) => m.mockType === 'PYQ').map((mock: any) => (
                  <MockCard key={mock.id} mock={mock} />
               ))}
               {mocks?.filter((m:any) => m.mockType === 'PYQ').length === 0 && <EmptyState label="No Previous Year Paper nodes structured." />}
            </TabsContent>

            <TabsContent value="stats">
               <Card className="p-20 text-center bg-white rounded-[4rem] shadow-4xl space-y-8">
                  <Trophy className="h-20 w-20 text-amber-400 mx-auto" />
                  <div className="space-y-2">
                     <h3 className="text-3xl font-headline font-black uppercase text-[#0F172A]">All Punjab Benchmark</h3>
                     <p className="text-slate-400 font-medium">Attempt a Full Length mock to participate in the global state-wise ranking.</p>
                  </div>
                  <Button className="h-14 px-12 bg-primary text-white font-black uppercase text-xs rounded-2xl shadow-xl">Participate Now</Button>
               </Card>
            </TabsContent>
         </Tabs>
      </main>

      <Footer />
    </div>
  )
}

function MockCard({ mock }: { mock: any }) {
  return (
    <Card className="border-none shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all duration-300 rounded-[2.5rem] bg-white group overflow-hidden text-left">
      <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-10">
         <div className="flex items-center gap-8">
            <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-2xl text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-all">
               <Zap className="h-8 w-8" />
            </div>
            <div>
               <h3 className="text-2xl font-headline font-black text-[#0F172A] group-hover:text-primary transition-colors">{mock.title}</h3>
               <div className="flex items-center gap-6 mt-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {mock.duration} Min Audit</span>
                  <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> {mock.totalQuestions} MCQs</span>
                  {mock.mockType === 'PYQ' && <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-lg text-[8px] uppercase">{mock.year} ARCHIVE</Badge>}
               </div>
            </div>
         </div>
         <Button asChild className="w-full md:w-auto h-14 px-10 bg-[#0F172A] hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs rounded-2xl gap-3 shadow-2xl">
            <Link href={`/mocks/${mock.id}`}>Attempt <ChevronRight className="h-4 w-4" /></Link>
         </Button>
      </CardContent>
    </Card>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="col-span-full p-24 text-center text-slate-300 border-2 border-dashed rounded-[4rem] space-y-4 bg-white/50">
       <ShieldCheck className="h-12 w-12 mx-auto opacity-10" />
       <p className="font-black font-headline text-xl uppercase">{label}</p>
    </div>
  )
}
