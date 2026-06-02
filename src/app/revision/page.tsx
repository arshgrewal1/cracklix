"use client"

import { useMemo, useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, orderBy } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Bookmark, Search, Trash2, ChevronRight, BrainCircuit, ShieldCheck, Languages, AlertCircle, History, Star, Zap, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

/**
 * @fileOverview Final Revision Hub.
 * Central portal for Bookmarks, Wrong Attempts (Smart Revision), and AI Rationalizations.
 */

export default function RevisionCenter() {
  const db = useFirestore()
  const { user } = useUser()
  const [searchTerm, setSearchTerm] = useState("")

  const bookmarkQuery = useMemo(() => (db && user ? query(collection(db, "bookmarks"), where("userId", "==", user.uid)) : null), [db, user])
  const { data: bookmarks, loading: bLoading } = useCollection<any>(bookmarkQuery)

  const resultsQuery = useMemo(() => (db && user ? query(collection(db, "results"), where("userId", "==", user.uid), orderBy("timestamp", "desc"), limit(20)) : null), [db, user])
  const { data: results, loading: rLoading } = useCollection<any>(resultsQuery)

  // Smart logic to extract "Wrong Attempts" from recent results
  const wrongAttempts = useMemo(() => {
    if (!results) return []
    const wrongs: any[] = []
    results.forEach(res => {
      // In a real app, you'd fetch the actual question details here
      // For this MVP UI, we visualize the count of missed nodes
      if (res.accuracy < 100) wrongs.push({
        id: res.id,
        title: `Missed in ${res.mockTitle}`,
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
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <History className="h-5 w-5 text-primary" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Preparation Audit Hub</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-headline font-black text-[#0F172A] tracking-tight uppercase leading-[0.9]">
                Revision <br/> <span className="text-primary">Center</span>
              </h1>
              <p className="text-slate-500 font-medium text-lg max-w-xl">
                Master the concepts you missed. Review your saved items and improve your accuracy for the 2026 Punjab recruitment cycle.
              </p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                className="pl-12 h-14 rounded-2xl bg-white border-none shadow-xl shadow-slate-200/50" 
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
                   <AlertCircle className="h-4 w-4" /> Smart Revision
                </TabsTrigger>
                <TabsTrigger value="starred" className="rounded-xl px-8 font-black uppercase text-[10px] gap-2 h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">
                   <Star className="h-4 w-4" /> Priority
                </TabsTrigger>
             </TabsList>

             <TabsContent value="bookmarks" className="space-y-6">
                {bLoading ? (
                   Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-44 w-full rounded-[2.5rem]" />)
                ) : filteredBookmarks.length > 0 ? (
                  filteredBookmarks.map((b) => (
                    <Card key={b.id} className="border-none shadow-2xl shadow-slate-200/30 bg-white hover:translate-y-[-4px] transition-all duration-300 rounded-[2.5rem] overflow-hidden group">
                      <CardContent className="p-10 space-y-6">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-widest px-3">
                                 {b.subjectId || 'General Punjab GK'}
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
                                 <Languages className="h-4 w-4" /> Bilingual Support
                              </Button>
                              <Button variant="ghost" className="text-primary font-black uppercase text-[10px] gap-2">
                                 <BrainCircuit className="h-4 w-4" /> AI Rationalization
                              </Button>
                           </div>
                           <Button variant="ghost" className="h-12 w-12 rounded-2xl bg-slate-50 hover:bg-primary hover:text-white transition-all">
                              <ChevronRight className="h-5 w-5" />
                           </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <RevisionEmptyState icon={<Bookmark />} title="No Bookmarks Detected" desc="Save high-fidelity questions during mocks to revise them later." />
                )}
             </TabsContent>

             <TabsContent value="wrong" className="space-y-6">
                {rLoading ? (
                   Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-[2.5rem]" />)
                ) : wrongAttempts.length > 0 ? (
                  wrongAttempts.map((w) => (
                    <Card key={w.id} className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden group">
                       <CardContent className="p-10 flex items-center justify-between">
                          <div className="flex items-center gap-8">
                             <div className="h-16 w-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shadow-inner">
                                <Zap className="h-8 w-8" />
                             </div>
                             <div>
                                <h3 className="text-xl font-headline font-black text-[#0F172A] uppercase">{w.title}</h3>
                                <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">{w.count} Incorrect Audit Choices • {w.date}</p>
                             </div>
                          </div>
                          <Button className="bg-[#0F172A] hover:bg-black text-white h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3">
                             Review Errors <ChevronRight className="h-4 w-4" />
                          </Button>
                       </CardContent>
                    </Card>
                  ))
                ) : (
                  <RevisionEmptyState icon={<ShieldCheck className="text-emerald-500" />} title="Audit Engine Clean" desc="No wrong attempts detected in your recent history. Perfect accuracy!" />
                )}
             </TabsContent>

             <TabsContent value="starred">
                <RevisionEmptyState icon={<Star />} title="Priority Matrix Empty" desc="Tag items as high-priority to build your custom revision strategy." />
             </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function RevisionEmptyState({ icon, title, desc }: any) {
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
