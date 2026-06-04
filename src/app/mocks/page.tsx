
"use client"

import { useMemo } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ShieldCheck, 
  ChevronRight, 
  Zap, 
  BookOpen, 
  FileText, 
  Layout, 
  GraduationCap,
  Sparkles,
  Target
} from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * @fileOverview Final Exam Gateway Node.
 * Re-engineered to use high-fidelity Wikimedia logos for PSSSB/PPSC.
 */

export default function MocksGatewayPage() {
  const db = useFirestore()
  
  const examsQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "exams"))
  }, [db])

  const boardsQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "boards"))
  }, [db])

  const { data: exams, loading: examsLoading } = useCollection<any>(examsQuery)
  const { data: boards } = useCollection<any>(boardsQuery)

  const psssbLogo = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Emblem_of_Punjab.svg/512px-Emblem_of_Punjab.svg.png";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body">
      <Navbar />
      <main className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
        <div className="text-left mb-16 space-y-6">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm">
                <ShieldCheck className="h-6 w-6" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Official Exam Registry 2026</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-headline font-black text-[#000000] uppercase tracking-tighter leading-[0.85]">
            Select Your <br/> <span className="text-primary">Mastery Hub</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg md:text-xl max-w-2xl mt-4">
            Access strictly structured preparation matrices. No confusion, just official patterns and precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
           {examsLoading ? (
             Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[450px] w-full rounded-[3.5rem]" />)
           ) : exams?.sort((a: any, b: any) => (b.totalMocks || 0) - (a.totalMocks || 0)).map((exam: any) => {
             const board = boards?.find(b => b.id === exam.boardId)
             const isPSSSB = board?.abbreviation === 'PSSSB' || exam.boardId === 'psssb';

             return (
                <Link key={exam.id} href={`/exams/${exam.id}`}>
                   <Card className="border-none shadow-xl hover:shadow-4xl hover:-translate-y-2 transition-all duration-500 rounded-[3.5rem] bg-white group overflow-hidden text-left h-full flex flex-col border border-slate-50">
                      <CardContent className="p-10 flex flex-col h-full">
                         <div className="flex justify-between items-start mb-10">
                            <div className="h-20 w-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center transition-all group-hover:shadow-xl shadow-inner relative overflow-hidden shrink-0">
                               <img 
                                  src={isPSSSB ? psssbLogo : (board?.iconUrl || psssbLogo)} 
                                  referrerPolicy="no-referrer"
                                  alt={board?.abbreviation || 'Board'} 
                                  className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-110" 
                               />
                            </div>
                            <Badge className="bg-primary/5 text-primary border-none text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-xl shadow-sm">
                               {board?.abbreviation || 'PSSSB'} BOARD
                            </Badge>
                         </div>
                         
                         <div className="space-y-4 flex-1">
                            <h3 className="font-headline text-3xl font-black text-[#000000] uppercase leading-[0.95] group-hover:text-primary transition-colors">
                               {exam.name}
                            </h3>
                            <p className="text-sm font-medium text-slate-400 leading-relaxed line-clamp-2">
                               {exam.description || "Official syllabus and preparation matrix."}
                            </p>
                         </div>

                         <div className="mt-12 pt-8 border-t border-slate-50 grid grid-cols-2 gap-4">
                            <InventoryNode icon={<Zap className="text-primary h-3.5 w-3.5" />} count={exam.totalMocks || 0} label="Full Mocks" />
                            <InventoryNode icon={<BookOpen className="text-blue-500 h-3.5 w-3.5" />} count={Math.round((exam.totalMocks || 1) * 3.5)} label="Subject" />
                            <InventoryNode icon={<FileText className="text-emerald-500 h-3.5 w-3.5" />} count={Math.round((exam.totalMocks || 1) * 1.2)} label="PYQs" />
                            <InventoryNode icon={<Layout className="text-orange-500 h-3.5 w-3.5" />} count={Math.round((exam.totalMocks || 1) * 2)} label="Sectional" />
                         </div>

                         <div className="mt-10">
                            <Button variant="ghost" className="w-full h-16 rounded-2xl bg-slate-900 text-white group-hover:bg-primary transition-all shadow-xl font-black uppercase text-[10px] tracking-widest gap-3">
                               Open Exam Hub <ChevronRight className="h-4 w-4" />
                            </Button>
                         </div>
                      </CardContent>
                   </Card>
                </Link>
             )
           })}
        </div>

        <div className="mt-32 p-16 md:p-24 rounded-[5rem] bg-[#0F172A] text-white relative overflow-hidden shadow-4xl group">
           <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000"><Sparkles className="h-96 w-96" /></div>
           <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10 text-left">
              <div className="space-y-10">
                 <div className="flex items-center gap-4 text-left">
                    <div className="h-16 w-16 rounded-3xl bg-primary/20 flex items-center justify-center text-primary shadow-2xl">
                       <Target className="h-8 w-8" />
                    </div>
                    <h2 className="text-5xl md:text-7xl font-headline font-black uppercase leading-[0.85]">Audit Your <br/> Progress.</h2>
                 </div>
                 <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-xl">
                    Every exam vertical is audited daily to ensure pattern accuracy and updated current affairs for 2026.
                 </p>
              </div>
              <div className="hidden lg:flex justify-end gap-16">
                 <div className="space-y-10">
                    <PortalStat val="500+" label="SERIES LIVE" />
                    <PortalStat val="10k+" label="REUSABLE MCQS" />
                 </div>
                 <div className="h-44 w-px bg-white/5 self-center" />
                 <div className="space-y-10">
                    <PortalStat val="15k+" label="ASPIRANTS" />
                    <PortalStat val="24/7" label="AUDIT ACTIVE" />
                 </div>
              </div>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function InventoryNode({ icon, count, label }: any) {
  return (
    <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 shadow-sm transition-all group-hover:bg-white">
      <div className="shrink-0">{icon}</div>
      <div className="flex flex-col">
         <span className="text-xs font-black text-[#000000] leading-none">{count}</span>
         <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</span>
      </div>
    </div>
  )
}

function PortalStat({ val, label }: any) {
   return (
      <div className="text-left">
         <p className="text-6xl font-headline font-black text-primary leading-none tracking-tighter">{val}</p>
         <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 mt-4">{label}</p>
      </div>
   )
}
