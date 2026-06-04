
"use client"

import { useMemo } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, ChevronRight, GraduationCap, Target, Sparkles, Layout } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

/**
 * @fileOverview Final Exam Gateway Node.
 * Replaces the global mock list with an Exam Selection Portal to ensure content isolation.
 * Fixed: Added missing Badge import and aligned with Testbook aesthetic.
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

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body">
      <Navbar />
      <main className="container mx-auto px-4 py-8 md:py-16 max-w-7xl">
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
             <ShieldCheck className="h-6 w-6 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Institutional Registry</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-headline font-black text-[#000000] uppercase tracking-tighter leading-[0.9]">
            Select Your <br/> <span className="text-primary">Exam Hub</span>
          </h1>
          <p className="text-slate-500 font-medium text-base md:text-lg max-w-2xl mx-auto mt-4">
            Choose your target recruitment board to access structured Full Mocks, Subject mastery, and PYQ archives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
           {examsLoading ? (
             Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-[2.5rem]" />)
           ) : exams?.map((exam: any) => {
             const board = boards?.find(b => b.id === exam.boardId)
             return (
                <Link key={exam.id} href={`/exams/${exam.id}`}>
                   <Card className="border-none shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 rounded-[2.5rem] bg-white group overflow-hidden text-left h-full flex flex-col border border-slate-50">
                      <CardContent className="p-8 md:p-10 flex flex-col h-full">
                         <div className="flex justify-between items-start mb-8">
                            <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:shadow-lg transition-all shadow-inner relative overflow-hidden">
                               {board?.iconUrl ? (
                                 <img src={board.iconUrl} alt={board.abbreviation} className="w-full h-full object-contain p-2" />
                               ) : (
                                 <GraduationCap className="h-7 w-7 text-primary" />
                               )}
                            </div>
                            <Badge className="bg-primary/5 text-primary border-none text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">
                               {board?.abbreviation || 'PSSSB'} BOARD
                            </Badge>
                         </div>
                         
                         <div className="space-y-2 flex-1">
                            <h3 className="font-headline text-2xl md:text-3xl font-black text-[#000000] uppercase leading-tight group-hover:text-primary transition-colors">
                               {exam.name}
                            </h3>
                            <p className="text-xs md:text-sm font-medium text-slate-400 leading-relaxed line-clamp-2">
                               {exam.description || "Comprehensive preparation hub for all specialized cadre posts."}
                            </p>
                         </div>

                         <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="space-y-0.5 text-left">
                                  <p className="text-[10px] font-black text-[#000000] leading-none">{exam.totalMocks || 0}+ Series</p>
                                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Active Registry</p>
                               </div>
                            </div>
                            <Button variant="ghost" className="h-11 w-11 rounded-2xl bg-slate-50 text-[#0F172A] group-hover:bg-primary group-hover:text-white transition-all shadow-sm p-0">
                               <ChevronRight className="h-5 w-5" />
                            </Button>
                         </div>
                      </CardContent>
                   </Card>
                </Link>
             )
           })}
        </div>

        <div className="mt-20 p-10 md:p-16 rounded-[3.5rem] bg-[#0F172A] text-white relative overflow-hidden shadow-3xl group">
           <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:scale-110 transition-transform"><Sparkles className="h-48 w-48" /></div>
           <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10 text-left">
              <div className="space-y-6">
                 <div className="flex items-center gap-3 text-left">
                    <Target className="h-8 w-8 text-primary" />
                    <h2 className="text-3xl md:text-4xl font-headline font-black uppercase leading-tight">Master Any <br/> Recruitment Hub</h2>
                 </div>
                 <p className="text-slate-400 text-base font-medium leading-relaxed">
                    Cracklix provides isolated, high-fidelity preparation hubs for every major Punjab recruitment cycle. No noise, just precision.
                 </p>
                 <Button asChild className="bg-white text-[#0F172A] hover:bg-slate-100 h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl">
                    <Link href="/exams">View All Boards Hub</Link>
                 </Button>
              </div>
              <div className="hidden lg:flex justify-end gap-10">
                 <div className="space-y-6">
                    <PortalStat val="500+" label="Full Mocks" />
                    <PortalStat val="10k+" label="Atomic MCQs" />
                 </div>
                 <div className="h-32 w-px bg-white/5 self-center" />
                 <div className="space-y-6">
                    <PortalStat val="24/7" label="Audit Online" />
                    <PortalStat val="State" label="Rankers" />
                 </div>
              </div>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function PortalStat({ val, label }: any) {
   return (
      <div className="text-left">
         <p className="text-2xl font-headline font-black text-primary leading-none">{val}</p>
         <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{label}</p>
      </div>
   )
}
