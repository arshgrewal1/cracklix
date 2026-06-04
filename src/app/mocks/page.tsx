"use client"

import { useMemo } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, ChevronRight, GraduationCap, MapPin, Target, Sparkles } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

/**
 * @fileOverview Final Exam Gateway Node.
 * Replaces the global mock list with an Exam Selection Portal to ensure content isolation.
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
      <main className="container mx-auto px-4 py-12 md:py-24 max-w-7xl">
        <div className="text-center mb-16 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
             <ShieldCheck className="h-8 w-8 text-primary" />
             <span className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-400">Institutional Registry</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-headline font-black text-[#000000] uppercase tracking-tighter leading-[0.9]">
            Select Your <br/> <span className="text-primary">Exam Hub</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto mt-6">
            Choose your target recruitment board to access structured Full Mocks, Subject mastery, and PYQ archives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {examsLoading ? (
             Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-[3rem]" />)
           ) : exams?.map((exam: any) => {
             const board = boards?.find(b => b.id === exam.boardId)
             return (
                <Link key={exam.id} href={`/exams/${exam.id}`}>
                   <Card className="border-none shadow-3xl shadow-slate-900/5 hover:shadow-4xl hover:-translate-y-2 transition-all duration-500 rounded-[3rem] bg-white group overflow-hidden text-left h-full flex flex-col border border-slate-50">
                      <CardContent className="p-10 flex flex-col h-full">
                         <div className="flex justify-between items-start mb-10">
                            <div className="h-16 w-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center group-hover:shadow-xl transition-all shadow-inner relative overflow-hidden">
                               {board?.iconUrl ? (
                                 <Image src={board.iconUrl} alt={board.abbreviation} fill className="object-contain p-2" />
                               ) : (
                                 <GraduationCap className="h-8 w-8 text-primary" />
                               )}
                            </div>
                            <Badge className="bg-primary/5 text-primary border-none text-[9px] font-black uppercase tracking-widest px-3 py-1">
                               {board?.abbreviation || 'PSSSB'} BOARD
                            </Badge>
                         </div>
                         
                         <div className="space-y-3 flex-1">
                            <h3 className="font-headline text-3xl font-black text-[#000000] uppercase leading-tight group-hover:text-primary transition-colors">
                               {exam.name}
                            </h3>
                            <p className="text-sm font-medium text-slate-400 leading-relaxed line-clamp-2">
                               {exam.description || "Comprehensive preparation hub for all specialized cadre posts."}
                            </p>
                         </div>

                         <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="space-y-0.5">
                                  <p className="text-[10px] font-black text-[#0F172A] leading-none">{exam.totalMocks || 0}+ Series</p>
                                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Active Registry</p>
                               </div>
                            </div>
                            <Button variant="ghost" className="h-12 w-12 rounded-2xl bg-slate-50 text-[#0F172A] group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                               <ChevronRight className="h-5 w-5" />
                            </Button>
                         </div>
                      </CardContent>
                   </Card>
                </Link>
             )
           })}
        </div>

        <div className="mt-24 p-12 md:p-20 rounded-[4rem] bg-[#0F172A] text-white relative overflow-hidden shadow-4xl group">
           <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 group-hover:scale-110 transition-transform"><Sparkles className="h-64 w-64" /></div>
           <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10 text-left">
              <div className="space-y-8">
                 <div className="flex items-center gap-4 text-left">
                    <Target className="h-10 w-10 text-primary" />
                    <h2 className="text-4xl md:text-5xl font-headline font-black uppercase leading-tight">Master Any <br/> Recruitment Hub</h2>
                 </div>
                 <p className="text-slate-400 text-lg font-medium leading-relaxed">
                    Cracklix provides isolated, high-fidelity preparation hubs for every major Punjab recruitment cycle. No noise, just precision.
                 </p>
                 <Button asChild className="bg-white text-[#0F172A] hover:bg-slate-100 h-16 px-12 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl">
                    <Link href="/exams">View All Boards Node</Link>
                 </Button>
              </div>
              <div className="hidden lg:flex justify-end">
                 <div className="h-48 w-px bg-white/5 mx-12" />
                 <div className="space-y-8">
                    <PortalStat val="500+" label="Full Mocks" />
                    <PortalStat val="10k+" label="Atomic MCQs" />
                    <PortalStat val="24/7" label="Audit Online" />
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
         <p className="text-3xl font-headline font-black text-primary leading-none">{val}</p>
         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{label}</p>
      </div>
   )
}
