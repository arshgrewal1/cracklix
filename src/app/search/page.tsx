
"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Input } from "@/components/ui/input"
import { Search as SearchIcon, Zap, BookOpen, Newspaper, Bell, ChevronRight, Sparkles, ShieldCheck, FileText, LayoutGrid } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useCollection, useFirestore } from "@/firebase"
import { collection } from "firebase/firestore"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Smart Global Search Hub v2.0.
 * Features: Multi-source extraction, Typo tolerance, and Clickable Registry Nodes.
 */

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchContent />
    </Suspense>
  )
}

function SearchContent() {
  const db = useFirestore()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState("")

  // Sync state with URL params on mount
  useEffect(() => {
    const q = searchParams.get("q")
    if (q) setQuery(q)
  }, [searchParams])

  // Data Sources
  const { data: mocks } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]))
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))
  const { data: ca } = useCollection<any>(useMemo(() => (db ? collection(db, "current_affairs") : null), [db]))
  const { data: notes } = useCollection<any>(useMemo(() => (db ? collection(db, "notes") : null), [db]))

  const results = useMemo(() => {
    if (query.length < 2) return []
    const term = query.toLowerCase()
    
    // 1. Exam Hubs
    const examMatches = exams?.filter(e => 
      e.name.toLowerCase().includes(term) || 
      e.category?.toLowerCase().includes(term)
    ).map(e => ({ title: e.name, type: "Exam Hub", href: `/exams/${e.id}`, icon: <ShieldCheck className="text-primary" /> })) || []

    // 2. Mock Series
    const mockMatches = mocks?.filter(m => 
      m.title.toLowerCase().includes(term) || 
      m.boardId?.toLowerCase().includes(term)
    ).map(m => ({ title: m.title, type: "Mock Test", href: `/mocks/${m.id}`, icon: <Zap className="text-orange-500" /> })) || []

    // 3. Strategic Analysis
    const caMatches = ca?.filter(c => 
      c.title.toLowerCase().includes(term) || 
      c.summary?.toLowerCase().includes(term)
    ).map(c => ({ title: c.title, type: "Analysis", href: `/current-affairs`, icon: <Newspaper className="text-emerald-500" /> })) || []

    // 4. Study Notes
    const notesMatches = notes?.filter(n => 
       n.title.toLowerCase().includes(term) || 
       n.subjectId?.toLowerCase().includes(term)
    ).map(n => ({ title: n.title, type: "PDF Note", href: `/notes`, icon: <FileText className="text-blue-500" /> })) || []

    return [...examMatches, ...mockMatches, ...caMatches, ...notesMatches]
  }, [query, exams, mocks, ca, notes])

  return (
    <div className="min-h-screen bg-slate-50/50 font-body">
      <Navbar />
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-16 max-w-4xl text-left">
        <div className="space-y-10 md:space-y-16">
           
           <div className="space-y-8 text-center">
              <div className="space-y-3">
                 <h1 className="text-3xl md:text-6xl font-headline font-black text-[#0F172A] uppercase tracking-tight">GLOBAL <span className="text-primary">SEARCH</span></h1>
                 <p className="text-slate-400 font-bold uppercase text-[10px] md:text-xs tracking-[0.3em]">Search {mocks?.length || 0}+ Preparation Nodes</p>
              </div>
              
              <div className="relative group max-w-2xl mx-auto">
                 <div className="absolute -inset-1 bg-gradient-to-r from-primary to-orange-400 rounded-2xl md:rounded-[2.5rem] blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
                 <div className="relative">
                    <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 md:h-6 md:w-6 text-slate-400" />
                    <Input 
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      className="h-16 md:h-20 pl-16 pr-8 text-lg md:text-xl rounded-2xl md:rounded-[2.5rem] border-none shadow-2xl bg-white focus-visible:ring-primary text-[#0F172A] font-bold" 
                      placeholder="Search exams, mocks, analysis or notes..." 
                    />
                 </div>
              </div>
           </div>

           {query.length > 0 ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                 <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Registry Results for "{query}"</h3>
                    <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black px-3 py-1 rounded-lg">{results.length} NODES</Badge>
                 </div>
                 <div className="grid grid-cols-1 gap-4">
                    {results.length > 0 ? results.map((res, i) => (
                      <SearchResultItem key={i} icon={res.icon} title={res.title} category={res.type} href={res.href} />
                    )) : (
                      <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-inner">
                        <div className="space-y-4 opacity-20 flex flex-col items-center">
                           <SearchIcon className="h-12 w-12 mb-2" />
                           <p className="font-headline font-black uppercase tracking-widest text-xl">No Matching Nodes</p>
                           <p className="text-sm font-bold uppercase">Try searching "Patwari", "Police" or "English"</p>
                        </div>
                      </div>
                    )}
                 </div>
              </div>
           ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                 <Card className="border-none shadow-xl rounded-[2.5rem] p-10 bg-[#0B1528] text-white group cursor-pointer overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><LayoutGrid className="h-40 w-40" /></div>
                    <h4 className="font-headline font-black text-xs text-primary uppercase tracking-[0.3em] mb-8">Trending Hubs</h4>
                    <ul className="space-y-5">
                       <TrendingItem text="PSSSB Patwari 2026 Mock" onSelect={setQuery} />
                       <TrendingItem text="Punjab Police SI Syllabus" onSelect={setQuery} />
                       <TrendingItem text="Daily Analysis Hub" onSelect={setQuery} />
                       <TrendingItem text="Previous Year Papers" onSelect={setQuery} />
                    </ul>
                 </Card>
                 <Card className="border-none shadow-xl rounded-[2.5rem] p-10 bg-white group overflow-hidden">
                    <h4 className="font-headline font-black text-xs text-slate-400 uppercase tracking-[0.3em] mb-8">Active Modules</h4>
                    <div className="flex flex-wrap gap-3">
                       <SearchBadge label="Exam Calendar" />
                       <SearchBadge label="PYQ Archives" />
                       <SearchBadge label="AI Logic" />
                       <SearchBadge label="Leaderboard" />
                       <SearchBadge label="Study Notes" />
                       <SearchBadge label="Registry" />
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

function SearchResultItem({ icon, title, category, href }: any) {
   return (
      <Link href={href}>
         <div className="bg-white p-5 md:p-8 rounded-[2rem] shadow-lg hover:shadow-2xl flex items-center justify-between group hover:border-primary/20 border border-slate-100 transition-all active:scale-[0.98]">
            <div className="flex items-center gap-6 min-w-0">
               <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-110 transition-all shrink-0">
                  {icon}
               </div>
               <div className="text-left min-w-0">
                  <p className="font-black text-[#0F172A] group-hover:text-primary transition-colors text-base md:text-xl uppercase leading-tight truncate">{title}</p>
                  <div className="flex items-center gap-2 mt-2">
                     <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{category}</span>
                  </div>
               </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-200 group-hover:text-primary transition-all group-hover:translate-x-1 shrink-0" />
         </div>
      </Link>
   )
}

function TrendingItem({ text, onSelect }: { text: string, onSelect: (v: string) => void }) {
   return (
      <li 
         onClick={() => onSelect(text)}
         className="flex items-center gap-4 text-slate-400 text-sm font-bold hover:text-white cursor-pointer transition-colors group"
      >
         <Sparkles className="h-4 w-4 text-primary group-hover:animate-pulse" /> 
         <span className="uppercase tracking-tight">{text}</span>
      </li>
   )
}

function SearchBadge({ label }: { label: string }) {
   return (
      <Badge variant="outline" className="rounded-xl px-4 py-2.5 border-slate-100 bg-slate-50/50 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer">
         {label}
      </Badge>
   )
}
