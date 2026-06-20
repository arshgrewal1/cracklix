"use client"

import React, { useState, useMemo, useEffect, Suspense, cloneElement, isValidElement } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Search as SearchIcon, Zap, BookOpen, Newspaper, Bell, ChevronRight, Sparkles, ShieldCheck, FileText, LayoutGrid, Loader2 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useCollection, useFirestore } from "@/firebase"
import { collection } from "firebase/firestore"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Search Center Hub v2.1 (TypeScript Hardened).
 */

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
      <SearchContent />
    </Suspense>
  )
}

function SearchContent() {
  const db = useFirestore()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState("")

  useEffect(() => {
    const q = searchParams.get("q")
    if (q) setQuery(q)
  }, [searchParams])

  const { data: mocks, loading: mLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]))
  const { data: exams, loading: eLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))
  const { data: notes, loading: nLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "notes") : null), [db]))

  const isLoading = mLoading || eLoading || nLoading;

  const results = useMemo(() => {
    if (query.trim().length < 2) return []
    const term = query.toLowerCase().trim()
    
    const examMatches = (exams || []).filter((e: any) => 
      e.name?.toLowerCase().includes(term) || 
      e.boardId?.toLowerCase().includes(term)
    ).map((e: any) => ({ title: e.name, type: "Exam Center", href: `/exams/${e.id}`, icon: <ShieldCheck className="text-primary" /> }))

    const mockMatches = (mocks || []).filter((m: any) => 
      m.title?.toLowerCase().includes(term) || 
      m.boardId?.toLowerCase().includes(term)
    ).map((m: any) => ({ title: m.title, type: "Practice Test", href: `/mocks/${m.id}`, icon: <Zap className="text-orange-500" /> }))

    const notesMatches = (notes || []).filter((n: any) => 
       n.title?.toLowerCase().includes(term) || 
       n.subjectId?.toLowerCase().includes(term)
    ).map((n: any) => ({ title: n.title, type: "Study Material", href: `/notes`, icon: <FileText className="text-blue-500" /> }))

    return [...examMatches, ...mockMatches, ...notesMatches]
  }, [query, exams, mocks, notes])

  return (
    <div className="min-h-screen bg-slate-50/30 font-body">
      <Navbar />
      <main className="container mx-auto px-4 md:px-6 py-6 md:py-10 max-w-5xl text-left">
        <div className="space-y-8">
           
           <div className="text-center space-y-6">
              <div className="space-y-2">
                 <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tighter leading-none uppercase">Global Search</h1>
                 <p className="text-slate-400 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.4em]">Find your preparation hub instantly</p>
              </div>
              
              <div className="relative max-w-2xl mx-auto group">
                 <div className="absolute -inset-1 bg-gradient-to-r from-primary to-orange-400 rounded-2xl blur opacity-5 group-focus-within:opacity-15 transition duration-1000"></div>
                 <div className="relative">
                    <SearchIcon className={cn("absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors", isLoading ? "text-primary animate-pulse" : "text-slate-400")} />
                    <input 
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      autoFocus
                      className="w-full h-12 md:h-16 pl-14 pr-6 text-sm md:text-xl rounded-2xl border-none shadow-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-[#0F172A] font-bold outline-none" 
                      placeholder="Search exams, tests, or notes..." 
                    />
                    {isLoading && <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary animate-spin" />}
                 </div>
              </div>
           </div>

           {query.length >= 2 ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">RESULTS: {results.length}</h3>
                    <Badge className="bg-primary/5 text-primary border-none text-[8px] font-black px-3 py-0.5 rounded-lg uppercase">Live Updates</Badge>
                 </div>
                 <div className="grid grid-cols-1 gap-3">
                    {results.length > 0 ? results.map((res, i) => (
                      <SearchResultItem key={i} icon={res.icon} title={res.title} category={res.type} href={res.href} />
                    )) : !isLoading && (
                      <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100 shadow-inner">
                        <div className="space-y-3 opacity-20 flex flex-col items-center">
                           <SearchIcon className="h-10 w-10" />
                           <p className="text-lg font-bold">No Results Found</p>
                           <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Try searching "Patwari", "Police" or "English"</p>
                        </div>
                      </div>
                    )}
                 </div>
              </div>
           ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                 <Card className="border-none shadow-xl rounded-[2rem] p-8 bg-[#0B1528] text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><LayoutGrid className="h-32 w-32" /></div>
                    <div className="relative z-10 space-y-6">
                       <h4 className="font-black text-[9px] text-primary uppercase tracking-[0.3em]">Quick Search</h4>
                       <ul className="space-y-4">
                          <TrendingItem text="PSSSB Patwari Center" onSelect={setQuery} />
                          <TrendingItem text="Punjab Police SI Prep" onSelect={setQuery} />
                          <TrendingItem text="Mental Ability Tests" onSelect={setQuery} />
                          <TrendingItem text="Official Previous Papers" onSelect={setQuery} />
                       </ul>
                    </div>
                 </Card>
                 <Card className="border-none shadow-xl rounded-[2rem] p-8 bg-white group overflow-hidden border border-slate-100">
                    <div className="relative z-10 space-y-6">
                       <h4 className="font-black text-[9px] text-slate-400 uppercase tracking-[0.3em]">Study Materials</h4>
                       <div className="flex flex-wrap gap-2">
                          <SearchBadge label="Army Hub" />
                          <SearchBadge label="Teaching" />
                          <SearchBadge label="Elite Pass" />
                          <SearchBadge label="Leaderboard" />
                       </div>
                    </div>
                 </Card>
              </div>
           )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

function SearchResultItem({ icon, title, category, href }: { icon: React.ReactNode, title: string, category: string, href: string }) {
   return (
      <Link href={href} className="block active:scale-[0.99] transition-all">
         <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm hover:shadow-xl flex items-center justify-between group border border-slate-100 transition-all duration-300">
            <div className="flex items-center gap-4 min-w-0 flex-1">
               <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/5 transition-all shrink-0 shadow-inner">
                  {isValidElement(icon) 
                    ? cloneElement(icon as React.ReactElement<any>, { className: "h-5 w-5" }) 
                    : icon}
               </div>
               <div className="text-left min-w-0 flex-1 space-y-1">
                  <p className="font-black text-[#0F172A] group-hover:text-primary transition-colors text-sm md:text-xl uppercase leading-tight line-clamp-1 truncate">{title}</p>
                  <div className="flex items-center gap-2">
                     <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{category}</span>
                     <div className="h-0.5 w-0.5 rounded-full bg-slate-200" />
                     <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em] text-primary">Live</span>
                  </div>
               </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-primary transition-all group-hover:translate-x-1 shrink-0 ml-4" />
         </div>
      </Link>
   )
}

function TrendingItem({ text, onSelect }: { text: string, onSelect: (v: string) => void }) {
   return (
      <li 
         onClick={() => onSelect(text)}
         className="flex items-center gap-3 text-slate-400 text-xs font-bold hover:text-white cursor-pointer transition-colors group active:scale-95"
      >
         <Sparkles className="h-3 w-3 text-primary group-hover:animate-pulse" /> 
         <span className="uppercase tracking-tight truncate text-[11px]">{text}</span>
      </li>
   )
}

function SearchBadge({ label }: { label: string }) {
   return (
      <Badge variant="outline" className="rounded-lg px-3 py-1.5 border-slate-200 bg-slate-50/50 text-[8px] font-black uppercase tracking-widest text-slate-500 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all cursor-pointer active:scale-95 shadow-sm">
         {label}
      </Badge>
   )
}
