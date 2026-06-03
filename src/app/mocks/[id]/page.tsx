
"use client"

import { useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useDoc, useFirestore, useUser } from "@/firebase"
import { doc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Clock, 
  BookOpen, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ChevronLeft,
  Info,
  Layers,
  Award,
  Lock
} from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * @fileOverview Mock Overview & Instructions Page.
 * Acts as a professional bridge before the aspirants enter the secure CBT engine.
 */

export default function MockOverviewPage() {
  const params = useParams()
  const router = useRouter()
  const db = useFirestore()
  const mockId = params.id as string
  
  const { data: mock, loading } = useDoc<any>(useMemo(() => (db ? doc(db, "mocks", mockId) : null), [db, mockId]))

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Skeleton className="h-20 w-20 rounded-full" /></div>
  if (!mock) return <div className="h-screen flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest">Assesment vertical not found.</div>

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-body">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-6 py-12 max-w-6xl">
        <div className="mb-12">
           <Button variant="ghost" onClick={() => router.back()} className="rounded-xl text-slate-400 hover:text-[#0F172A] gap-2 mb-8 p-0">
             <ChevronLeft className="h-5 w-5" /> Back to Hub
           </Button>
           
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Institutional Audit Protocol</span>
                 </div>
                 <h1 className="text-5xl md:text-6xl font-headline font-black text-[#0F172A] uppercase tracking-tight leading-[0.9]">
                   {mock.title}
                 </h1>
                 <div className="flex flex-wrap gap-4 pt-2">
                    <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-xl font-black uppercase text-[10px] tracking-widest">
                       {mock.boardId || "PSSSB"} Official
                    </Badge>
                    <Badge variant="outline" className="border-slate-200 text-slate-400 px-4 py-1.5 rounded-xl font-black uppercase text-[10px] tracking-widest">
                       {mock.mockType || "Full Length"}
                    </Badge>
                 </div>
              </div>
              <div className="flex gap-6 items-center">
                 <div className="text-right hidden sm:block">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Aspirant Attempts</p>
                    <p className="text-2xl font-black text-[#0F172A]">1,250+</p>
                 </div>
                 <div className="h-12 w-px bg-slate-200 mx-2" />
                 <Button asChild className="h-20 px-12 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-[0.3em] text-xs rounded-[2rem] shadow-3xl shadow-slate-400 gap-4 group">
                    <Link href={`/mocks/${mockId}/attempt`}>
                       Initialize Engine <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                    </Link>
                 </Button>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           <div className="lg:col-span-8 space-y-12">
              <Card className="border-none shadow-3xl shadow-slate-900/5 rounded-[3.5rem] bg-white overflow-hidden">
                 <CardHeader className="p-12 border-b border-slate-50">
                    <CardTitle className="font-headline text-2xl font-black text-[#0F172A] uppercase">Official Instructions</CardTitle>
                    <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Verified Audit Guidelines for CBT 2026</CardDescription>
                 </CardHeader>
                 <CardContent className="p-12 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <InstructionCard icon={<Clock className="text-primary" />} title="Duration" value={`${mock.duration || 150} Minutes`} desc="Fixed timer as per official notification." />
                       <InstructionCard icon={<BookOpen className="text-blue-500" />} title="Structure" value={`${mock.totalQuestions || 150} Questions`} desc="50 Qs (Paper A - Qualifying) + 100 Qs (Paper B)." />
                       <InstructionCard icon={<Award className="text-emerald-500" />} title="Marking" value="1 Mark / Question" desc="Standard marking for official Punjab exams." />
                       <InstructionCard icon={<AlertTriangle className="text-rose-500" />} title="Negative" value="-0.25 Penalty" desc="Applied for every mismatched audit choice." />
                    </div>

                    <div className="bg-slate-50 rounded-[2.5rem] p-10 space-y-6">
                       <h4 className="font-black text-xs uppercase tracking-[0.3em] text-[#0F172A] flex items-center gap-3">
                          <Info className="h-4 w-4 text-primary" /> Core Guidelines
                       </h4>
                       <ul className="space-y-4">
                          <GuidelineItem text="Paper A (50 Questions) is mandatory qualifying. You must score 50% to qualify for Paper B evaluation." />
                          <GuidelineItem text="The clock will start automatically upon initializing the test engine." />
                          <GuidelineItem text="Bilingual language switch (English/Punjabi) is available on the top-bar for every question." />
                          <GuidelineItem text="Final submission is required to generate your All Punjab Rank and accuracy report." />
                       </ul>
                    </div>
                 </CardContent>
              </Card>
           </div>

           <div className="lg:col-span-4 space-y-10">
              <Card className="border-none shadow-3xl shadow-slate-900/10 rounded-[3.5rem] bg-[#0F172A] text-white p-12 overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-8 opacity-5"><Lock className="h-40 w-40 rotate-12" /></div>
                 <div className="relative z-10 space-y-8">
                    <div className="space-y-2">
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">CBT Engine Protocol</p>
                       <h3 className="text-3xl font-headline font-black leading-tight uppercase">High Fidelity Environment</h3>
                    </div>
                    <p className="text-slate-400 font-medium leading-relaxed">
                       You are about to enter a secure testing environment. Arsh Grewal management monitors all attempt trails for institutional integrity.
                    </p>
                    <div className="pt-6 flex items-center gap-4 text-emerald-500">
                       <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Audit Nodes Online</span>
                    </div>
                 </div>
              </Card>

              <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white p-10 space-y-6 text-center">
                 <div className="h-16 w-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mx-auto">
                    <Layers className="h-7 w-7 text-primary" />
                 </div>
                 <div className="space-y-1">
                    <p className="font-headline font-black text-lg text-[#0F172A] uppercase">Sectional Weighting</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Pattern Check</p>
                 </div>
                 <div className="space-y-3 pt-4">
                    <WeightingItem label="Paper A: Punjabi (Qualifying)" value="50 Questions" />
                    <WeightingItem label="Paper B: GS & Punjab GK" value="50 Questions" />
                    <WeightingItem label="Paper B: Quant & Reasoning" value="30 Questions" />
                    <WeightingItem label="Paper B: English & ICT" value="20 Questions" />
                 </div>
              </Card>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function InstructionCard({ icon, title, value, desc }: any) {
   return (
      <div className="flex gap-6 group">
         <div className="h-16 w-16 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-primary/5 transition-all">
            {icon}
         </div>
         <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</p>
            <p className="text-xl font-black text-[#0F172A]">{value}</p>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
         </div>
      </div>
   )
}

function GuidelineItem({ text }: { text: string }) {
   return (
      <li className="flex gap-4 items-start">
         <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
         <span className="text-sm font-bold text-slate-600 leading-relaxed">{text}</span>
      </li>
   )
}

function WeightingItem({ label, value }: any) {
   return (
      <div className="flex justify-between items-center py-2 border-b border-slate-50">
         <span className="text-[10px] font-black uppercase text-slate-400 tracking-tight">{label}</span>
         <span className="text-xs font-black text-primary">{value}</span>
      </div>
   )
}
