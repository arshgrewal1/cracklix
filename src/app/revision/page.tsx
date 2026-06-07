
"use client"

import { useMemo, useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where } from "firebase/firestore"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { 
  Bookmark, 
  Search, 
  Trash2, 
  ChevronRight, 
  BrainCircuit, 
  Languages, 
  AlertCircle, 
  History, 
  Star, 
  Zap, 
  Sparkles,
  ShieldAlert,
  GraduationCap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

/**
 * @fileOverview Institutional Revision & Preparation Hub.
 * Optimized: Removed Firestore orderBy to bypass composite index requirement.
 */

export default function RevisionHub() {
  const db = useFirestore()
  const { user } = useUser()
  const [searchTerm, setSearchTerm] = useState("")

  const bookmarkQuery = useMemo(() => (db && user ? query(collection(db, "bookmarks"), where("userId", "==", user.uid)) : null), [db, user])
  const { data: bookmarks, loading: bLoading } = useCollection<any>(bookmarkQuery)

  // Simplified query to bypass composite index requirement
  const resultsQuery = useMemo(() => (db && user ? query(collection(db, "results"), where("userId", "==", user.uid)) : null), [db, user])
  const { data: rawResults, loading: rLoading } = useCollection<any>(resultsQuery)

  const results = useMemo(() => {
    if (!rawResults) return []
    // Client-side chronological sort
    return [...rawResults].sort((a: any, b: any) => {
      const tA = new Date(a.timestamp || 0).getTime()
      const tB = new Date(b.timestamp || 0).getTime()
      return tB - tA
    }).slice(0, 20)
  }, [rawResults])

  // Smart logic to extract "Audit Failures" from recent results for revision
  const wrongAttempts = useMemo(() => {
    if (!results) return []
    const wrongs: any[] = []
    results.forEach(res => {
      if (res.accuracy < 100) wrongs.push({
        id: res.id,
        mockId: res.mockId,
        title: `Audit Miss in ${res.mockTitle}`,
        count: res.totalQuestions - res.score,
        date: new Date(res.timestamp).toLocaleDateString()
      })
    })
    return wrongs
  }, [results])

  const filteredBookmarks = useMemo(() => {
    if (!bookmarks) return []
    return bookmarks.filter(b => b.questionText?.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [bookmarks, searchTerm])

  return (
    <div className="min-h-screen bg-slate-50/30">
      <Navbar />
      <main className="container mx-auto px-6 py-16 max-w-6xl">
        <div className="space-y-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3">
                 <History className="h-5 w-5 text-primary" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Preparation Mastery Hub</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-headline font-black text-[#0F172A] tracking-tight uppercase leading-[0.9]">
                Revision <br/> <span className="text-primary">Mastery</span>
              </h1>
              <p className="text-slate-500 font-medium text-lg max-w-xl">
                Registry for your saved items and missed concepts. Optimize your preparation trajectory for the 2026 cycle.
              </p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                className="pl-12 h-14 rounded-2xl bg-white border-none shadow-xl shadow-slate-200/50 font-bold" 
                placeholder="Search revision bank..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="bookmarks" className="space-y-10">
             <TabsList className="bg-white border border-slate-100 p-1.5 h-16 rounded-2xl shadow-sm inline-flex">
                <TabsTrigger value="bookmarks" className="rounded-xl px-8 font-black uppercase text-[10px] gap-2 h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">
                   <Bookmark className="h-4 w-4" /> Bookmarks
                </TabsTrigger>
                <TabsTrigger value="wrong" className="rounded-xl px-8 font-black uppercase text-[10px] gap-2 h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">
                   <AlertCircle className="h-4 w-4" /> Missed Nodes
                </TabsTrigger>
                <TabsTrigger value="starred" className="rounded-xl px-8 font-black uppercase text-[10px] gap-2 h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">
                   <Star className="h-4 w-4" /> Critical
                </TabsTrigger>
             </TabsList>

             <TabsContent value="bookmarks" className="space-y-6">
                {bLoading ? (
                   Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-44 w-full rounded-[2.5rem]" />)
                ) : filteredBookmarks.length > 0 ? (
                  filteredBookmarks.map((b) => (
                    <Card key={b.id} className="border-none shadow-2xl shadow-slate-200/30 bg-white hover:translate-y-[-4px] transition-all duration-300 rounded-[2.5rem] overflow-hidden group text-left">
                      <CardContent className="p-10 space-y-6">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-widest px-3">
                                 {b.subjectId || 'General Punjab Hub'}
                              </Badge>
                              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Added {new Date(b.timestamp).toLocaleDateString()}</span>
                           </div>
                           <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-rose-500 hover:bg-rose-50 opacity-20 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="h-5 w-5" />
                           </Button>
                        </div>
                        
                        <h3 className="text-xl md:text-2xl font-bold text-[#0F172A] leading-tight">
                           {b.questionText}
                        </h3>

                        <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                           <div className="flex gap-4">
                              <Button variant="outline" className="rounded-xl border-slate-100 text-[10px] font-black uppercase h-10 px-6 gap-2">
                                 <Languages className="h-4 w-4" /> Bilingual
                              </Button>
                              <Button variant="ghost" className="text-primary font-black uppercase text-[10px] gap-2">
                                 <BrainCircuit className="h-4 w-4" /> AI Rationale
                              </Button>
                           </div>
                           <Button variant="ghost" className="h-12 w-12 rounded-2xl bg-slate-50 hover:bg-primary hover:text-white transition-all shadow-sm">
                              <ChevronRight className="h-5 w-5" />
                           </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <EmptyRevision icon={<Bookmark />} title="No Bookmarks Detected" desc="Save high-fidelity questions during mocks to revise them later." />
                )}
             </TabsContent>

             <TabsContent value="wrong" className="space-y-6">
                {rLoading ? (
                   Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-44 w-full rounded-[2.5rem]" />)
                ) : wrongAttempts.length > 0 ? (
                  wrongAttempts.map((w) => (
                    <Card key={w.id} className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden group text-left">
                       <CardContent className="p-10 flex items-center justify-between">
                          <div className="flex items-center gap-8">
                             <div className="h-16 w-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shadow-inner">
                                <ShieldAlert className="h-8 w-8" />
                             </div>
                             <div>
                                <h3 className="text-xl font-headline font-black text-[#0F172A] uppercase leading-tight">{w.title}</h3>
                                <p className="text-[11px] font-black text-slate-400 mt-1 uppercase tracking-widest">{w.count} Incorrect Audit Choices • {w.date}</p>
                             </div>
                          </div>
                          <Button asChild className="bg-[#0F172A] hover:bg-black text-white h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl shadow-slate-200">
                             <Link href={`/results/${w.mockId}`}>Audit Failures <ChevronRight className="h-4 w-4" /></Link>
                          </Button>
                       </CardContent>
                    </Card>
                  ))
                ) : (
                  <EmptyRevision icon={<GraduationCap className="text-emerald-500" />} title="Perfect Audit Registry" desc="No missed nodes detected in your recent history. Excellence verified." />
                )}
             </TabsContent>

             <TabsContent value="starred">
                <EmptyRevision icon={<Star />} title="Priority Matrix Empty" desc="Tag critical items as high-priority to build your custom revision strategy." />
             </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function EmptyRevision({ icon, title, desc }: any) {
   return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-300 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 shadow-inner">
         <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-8 opacity-20">
            {icon}
         </div>
         <p className="font-headline font-black text-2xl text-slate-400 uppercase tracking-tight">{title}</p>
         <p className="text-base font-medium opacity-50 mt-2 max-w-sm text-center">{desc}</p>
      </div>
   )
}
