
"use client"

import { useMemo, useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, Filter, ShieldCheck, Zap, Layers, FileText, Newspaper, Target, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

/**
 * @fileOverview Mobile-Optimized Mock Hub.
 * Features: High-density cards, small typography, and absolute black text.
 */

export default function MocksPage() {
  const db = useFirestore()
  const [activeTab, setActiveTab] = useState("FULL")
  
  const mocksQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "mocks"))
  }, [db])

  const boardsQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "boards"))
  }, [db])

  const { data: allMocks, loading: mocksLoading } = useCollection<any>(mocksQuery)
  const { data: boards } = useCollection<any>(boardsQuery)

  const mocks = useMemo(() => {
    if (!allMocks) return []
    return [...allMocks]
      .filter(m => m.published === true)
      .sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0
        const dateB = b.createdAt?.seconds || 0
        return dateB - dateA
      })
  }, [allMocks])

  const filteredMocks = useMemo(() => {
    return mocks.filter(m => m.mockType === activeTab)
  }, [mocks, activeTab])

  const categories = [
    { id: "FULL", label: "Full", icon: <Zap className="h-3 w-3" /> },
    { id: "SUBJECT", label: "Subject", icon: <Layers className="h-3 w-3" /> },
    { id: "SECTIONAL", label: "Section", icon: <Target className="h-3 w-3" /> },
    { id: "PYQ", label: "PYQs", icon: <FileText className="h-3 w-3" /> },
    { id: "CA_QUIZ", label: "CA", icon: <Newspaper className="h-3 w-3" /> },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-white font-body">
      <Navbar />
      <main className="container mx-auto px-4 py-6 md:py-12 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:mb-16">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2">
               <ShieldCheck className="h-3 w-3 text-primary" />
               <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Institutional Hub</span>
            </div>
            <h1 className="text-3xl md:text-6xl font-headline font-black text-[#000000] uppercase tracking-tight leading-none">Mock <span className="text-primary">Series</span></h1>
            <p className="text-slate-500 font-medium text-xs md:text-lg">Modular assessments for 2026 cycle.</p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" className="rounded-xl h-10 px-4 border-slate-100 bg-white font-bold gap-2 text-[10px] shadow-sm">
                <Filter className="h-3 w-3 text-slate-400" /> Filter Authority
             </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 md:space-y-12">
           <div className="bg-slate-50 p-1 rounded-xl shadow-inner border border-slate-100 flex items-center overflow-x-auto no-scrollbar">
              <TabsList className="bg-transparent border-none p-0 flex gap-1 h-auto">
                 {categories.map(cat => (
                    <TabsTrigger 
                       key={cat.id} 
                       value={cat.id} 
                       className="rounded-lg px-4 md:px-8 h-10 md:h-14 font-black uppercase text-[9px] md:text-[10px] tracking-widest data-[state=active]:bg-[#0F172A] data-[state=active]:text-white flex items-center gap-2 shrink-0 transition-all"
                    >
                       {cat.icon}
                       {cat.label}
                       <span className="ml-1 text-[8px] opacity-50">({mocks.filter(m => m.mockType === cat.id).length})</span>
                    </TabsTrigger>
                 ))}
              </TabsList>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-12">
             {mocksLoading ? (
               Array.from({ length: 4 }).map((_, i) => (
                 <Skeleton key={i} className="h-48 md:h-[400px] w-full rounded-2xl" />
               ))
             ) : filteredMocks.length > 0 ? (
               filteredMocks.map((mock: any) => {
                 const board = boards?.find(b => b.id === mock.boardId)
                 return (
                   <Card key={mock.id} className="border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden bg-white flex flex-col group">
                     <CardContent className="p-5 md:p-12 space-y-4 md:space-y-8 flex-1 flex flex-col items-center md:items-center">
                       <div className="flex items-center gap-4 w-full md:flex-col md:items-center md:gap-8">
                          <div className="h-12 w-12 md:h-24 md:w-24 rounded-xl md:rounded-[2.5rem] bg-[#0F172A] flex items-center justify-center relative overflow-hidden shadow-lg shrink-0">
                            {board?.iconUrl ? (
                                <Image src={board.iconUrl} fill alt={board.abbreviation} className="object-contain p-2 md:p-6" />
                            ) : (
                                <Zap className="h-6 w-6 md:h-10 md:w-10 text-primary fill-current" />
                            )}
                          </div>
                          <div className="text-left md:text-center space-y-1 md:space-y-4 flex-1 min-w-0">
                             <p className="text-[8px] md:text-[10px] font-black uppercase text-primary tracking-widest">{board?.abbreviation || 'PSSSB'} {activeTab}</p>
                             <h3 className="font-headline text-sm md:text-2xl font-black text-[#000000] leading-tight uppercase truncate md:whitespace-normal md:line-clamp-2">
                              {mock.title}
                             </h3>
                          </div>
                       </div>

                       <div className="flex items-center justify-center gap-6 md:gap-10 w-full pt-1 md:pt-4 border-t md:border-none border-slate-50 mt-auto">
                          <div className="flex items-center gap-1.5 text-slate-400">
                             <BookOpen className="h-3 w-3" />
                             <span className="text-[9px] md:text-[11px] font-black uppercase tracking-widest">{mock.totalQuestions} Qs</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                             <Clock className="h-3 w-3" />
                             <span className="text-[9px] md:text-[11px] font-black uppercase tracking-widest">{mock.duration}m</span>
                          </div>
                       </div>

                       <div className="w-full pt-2 md:pt-6">
                         <Button asChild className="w-full h-10 md:h-16 bg-[#0B1528] hover:bg-black text-white font-black uppercase tracking-widest text-[9px] md:text-[10px] rounded-xl md:rounded-[1.5rem] shadow-md transition-all active:scale-95">
                           <Link href={`/mocks/${mock.id}`}>
                             Start <ArrowRight className="h-3 w-3 ml-2" />
                           </Link>
                         </Button>
                       </div>
                     </CardContent>
                   </Card>
                 )
               })
             ) : (
               <div className="col-span-full py-20 text-center space-y-4 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                  <ShieldCheck className="h-10 w-10 text-slate-200 mx-auto" />
                  <p className="font-headline font-black text-sm text-slate-400 uppercase tracking-widest">No Series Available</p>
               </div>
             )}
           </div>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}
