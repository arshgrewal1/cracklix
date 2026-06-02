
"use client"

import { useMemo } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, orderBy, where } from "firebase/firestore"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, Trophy, ArrowRight, Filter, ShieldCheck, Zap, Layers } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

export default function MocksPage() {
  const db = useFirestore()
  
  const mocksQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "mocks"), where("published", "==", true), orderBy("createdAt", "desc"))
  }, [db])

  const { data: mocks, loading } = useCollection<any>(mocksQuery)

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/30">
      <Navbar />
      <main className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
               <ShieldCheck className="h-5 w-5 text-primary" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Institutional Practice Hub</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-headline font-black text-[#0F172A] uppercase tracking-tight">Mock <span className="text-primary">Series</span></h1>
            <p className="text-slate-500 font-medium text-lg">High-fidelity full length and sectional assessments for Punjab Govt exams.</p>
          </div>
          <div className="flex gap-4">
             <Button variant="outline" className="rounded-2xl h-14 px-8 border-slate-200 bg-white font-bold gap-3 shadow-sm">
                <Filter className="h-5 w-5 text-slate-400" /> All Boards
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[400px] w-full rounded-[3rem]" />
            ))
          ) : mocks && mocks.length > 0 ? (
            mocks.map((mock: any) => (
              <Card key={mock.id} className="border-none shadow-2xl shadow-slate-200/40 hover:translate-y-[-8px] transition-all duration-500 group rounded-[3rem] overflow-hidden bg-white flex flex-col">
                <div className="bg-[#0B1528] p-6 flex justify-between items-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Zap className="h-20 w-20 text-white" /></div>
                  <Badge className="bg-primary text-white border-none px-4 py-1.5 rounded-xl font-black uppercase text-[10px] tracking-widest relative z-10">
                    {mock.boardId || "Official"}
                  </Badge>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] relative z-10">
                    {mock.mockType || 'Full Mock'}
                  </span>
                </div>
                <CardHeader className="p-10 pb-6">
                  <CardTitle className="font-headline text-2xl font-black text-[#0F172A] group-hover:text-primary transition-colors leading-tight">
                    {mock.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-10 pb-10 space-y-8 flex-1">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center"><Clock className="h-5 w-5" /></div>
                      <span className="text-sm font-bold">{mock.duration} Mins</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center"><BookOpen className="h-5 w-5" /></div>
                      <span className="text-sm font-bold">{mock.totalQuestions} MCQs</span>
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Layers className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black uppercase text-slate-400">Difficulty</span>
                     </div>
                     <Badge variant="outline" className={`border-none font-black text-[10px] uppercase tracking-widest ${
                       mock.difficulty === 'hard' ? 'text-rose-500' : 'text-emerald-500'
                     }`}>
                        {mock.difficulty || 'Medium'}
                     </Badge>
                  </div>
                </CardContent>
                <CardFooter className="p-10 pt-0">
                  <Button asChild className="w-full h-16 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl gap-3 shadow-3xl shadow-slate-300">
                    <Link href={`/mocks/${mock.id}`}>
                      Start Audit Series <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-40 text-center space-y-6 bg-white/50 rounded-[4rem] border-2 border-dashed border-slate-200">
               <ShieldCheck className="h-20 w-20 text-slate-200 mx-auto" />
               <div className="space-y-1">
                  <p className="font-headline font-black text-2xl text-slate-300 uppercase">No Series Live</p>
                  <p className="text-slate-400 font-medium">Verified mock tests are being audited by the content engine.</p>
               </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
