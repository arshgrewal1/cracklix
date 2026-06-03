"use client"

import { useMemo } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, Trophy, ArrowRight, Filter, ShieldCheck, Zap, Layers, Sparkles, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

/**
 * @fileOverview Final Mock Hub (Testbook Style Overhaul).
 * Features: Squircle icons, centered layout, and institutional typography.
 */

export default function MocksPage() {
  const db = useFirestore()
  
  const mocksQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "mocks"), orderBy("createdAt", "desc"))
  }, [db])

  const boardsQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "boards"))
  }, [db])

  const { data: allMocks, loading: mocksLoading, error } = useCollection<any>(mocksQuery)
  const { data: boards } = useCollection<any>(boardsQuery)

  const mocks = useMemo(() => {
    if (!allMocks) return []
    return allMocks.filter(m => m.published === true)
  }, [allMocks])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/30 font-body">
      <Navbar />
      <main className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-20">
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-3">
               <ShieldCheck className="h-5 w-5 text-primary" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Institutional Practice Hub</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-headline font-black text-[#0F172A] uppercase tracking-tight">Mock <span className="text-primary">Series</span></h1>
            <p className="text-slate-500 font-medium text-lg">High-fidelity assessments for Punjab Govt exams.</p>
          </div>
          <div className="flex gap-4">
             <Button className="rounded-2xl h-14 px-10 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest gap-3 shadow-xl shadow-emerald-900/20">
                <Sparkles className="h-5 w-5" /> Quick Practice
             </Button>
             <Button variant="outline" className="rounded-2xl h-14 px-8 border-slate-200 bg-white font-bold gap-3 shadow-sm">
                <Filter className="h-5 w-5 text-slate-400" /> All Boards
             </Button>
          </div>
        </div>

        {error && (
           <div className="mb-10 p-6 bg-rose-50 border border-rose-100 rounded-3xl flex items-center gap-4 text-rose-600">
              <AlertCircle className="h-6 w-6" />
              <p className="font-bold text-sm">Failed to sync with cloud repository. Please refresh or check connection.</p>
           </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {mocksLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[400px] w-full rounded-[3.5rem]" />
            ))
          ) : mocks && mocks.length > 0 ? (
            mocks.map((mock: any) => {
              const board = boards?.find(b => b.id === mock.boardId)
              return (
                <Card key={mock.id} className="border-none shadow-2xl shadow-slate-200/40 hover:shadow-4xl hover:translate-y-[-10px] transition-all duration-500 group rounded-[3.5rem] overflow-hidden bg-white flex flex-col text-center">
                  <CardContent className="p-12 space-y-8 flex-1 flex flex-col items-center">
                    {/* Testbook Style Squircle Icon */}
                    <div className="h-24 w-24 rounded-[2.5rem] bg-[#0F172A] flex items-center justify-center relative overflow-hidden shadow-2xl group-hover:scale-110 transition-transform duration-500">
                      {board?.iconUrl ? (
                         <Image src={board.iconUrl} fill alt={board.abbreviation} className="object-contain p-6" />
                      ) : (
                         <Zap className="h-10 w-10 text-primary fill-current" />
                      )}
                    </div>
                    
                    <div className="space-y-4">
                       <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">{board?.abbreviation || 'PSSSB'}</p>
                       <h3 className="font-headline text-2xl font-black text-[#0F172A] leading-tight px-4 line-clamp-2">
                        {mock.title}
                       </h3>
                    </div>

                    <div className="flex items-center justify-center gap-10 pt-4">
                       <div className="flex items-center gap-2.5 text-slate-400">
                          <BookOpen className="h-4 w-4" />
                          <span className="text-[11px] font-black uppercase tracking-widest">{mock.totalQuestions} Qs</span>
                       </div>
                       <div className="flex items-center gap-2.5 text-slate-400">
                          <Clock className="h-4 w-4" />
                          <span className="text-[11px] font-black uppercase tracking-widest">{mock.duration}m</span>
                       </div>
                    </div>

                    <div className="w-full pt-6">
                      <Button asChild className="w-full h-16 bg-[#0B1528] hover:bg-black text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-[1.5rem] shadow-3xl shadow-slate-300 transition-all active:scale-95">
                        <Link href={`/mocks/${mock.id}`}>
                          Start Audit Series <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <div className="col-span-full py-40 text-center space-y-6 bg-white/50 rounded-[4rem] border-2 border-dashed border-slate-200">
               <ShieldCheck className="h-20 w-20 text-slate-200 mx-auto" />
               <div className="space-y-1">
                  <p className="font-headline font-black text-2xl text-slate-300 uppercase">No Series Found</p>
                  <p className="text-slate-400 font-medium">Verify your uploads in the Command Center.</p>
               </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
