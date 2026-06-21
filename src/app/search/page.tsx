"use client"

import React, { useState, useMemo, useEffect, Suspense } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Search as SearchIcon, Zap, ChevronRight, Sparkles, ShieldCheck, FileText, LayoutGrid, Loader2 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection } from "firebase/firestore"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { AuthorityLogo } from "@/lib/exam-icons"

/**
 * @fileOverview Search Center Hub v3.6 (Build Corrected).
 * FIXED: Resolved React.cloneElement type error and implicit global React error.
 */

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" /></div>}>
      <SearchContent />
    </Suspense>
  )
}

function SearchContent() {
  const db = useFirestore()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading: authLoading } = useUser()
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    }
  }, [user, authLoading, router, pathname]);

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
    ).map((e: any) => ({ 
       title: e.name, 
       type: "Exam Center", 
       href: `/exams/${e.id}`, 
       boardId: e.boardId 
    }))

    const mockMatches = (mocks || []).filter((m: any) => 
      m.title?.toLowerCase().includes(term) || 
      m.boardId?.toLowerCase().includes(term)
    ).map((m: any) => ({ 
       title: m.title, 
       type: "Practice Test", 
       href: `/mocks/${m.id}`, 
       boardId: m.boardId 
    }))

    const notesMatches = (notes || []).filter((n: any) => 
       n.title?.toLowerCase().includes(term) || 
       n.subjectId?.toLowerCase().includes(term)
    ).map((n: any) => ({ 
       title: n.title, 
       type: "Study Material", 
       href: `/notes`, 
       boardId: n.boardId 
    }))

    return [...examMatches, ...mockMatches, ...notesMatches]
  }, [query, exams, mocks, notes])

  if (authLoading || !user) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4">
       <Zap className="h-10 w-10 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase text-slate-300">Authorizing Search Node...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/30 font-body">
      <Navbar />
      <main className="container mx-auto px-4 md:px-6 py-6 md:py-16 max-w-5xl text-left">
        <div className="space-y-8 md:space-y-12">
           
           <div className="text-center space-y-6">
              <div className="space-y-2">
                 <h1 className="text-2xl md:text-6xl font-black text-[#0F172A] tracking-tighter leading-none">Global Search</h1>
                 <p className="text-slate-400 font-bold uppercase text-[9px] md:text-[11px] tracking-[0.4em]">Instant Access to the Registry</p>
              </div>
              
              <div className="relative max-w-2xl mx-auto group">
                 <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-5 group-focus-within:opacity-15 transition duration-1000"></div>
                 <div className="relative">
                    <SearchIcon className={cn("absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 transition-colors", isLoading ? "text-primary animate-pulse" : "text-slate-300")} />
                    <input 
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      autoFocus
                      className="w-full h-14 md:h-18 pl-16 pr-14 text-sm md:text-2xl rounded-2xl md:rounded-[2.5rem] border-none shadow-2xl bg-white focus:ring-4 focus:ring-primary/5 text-[#0F172A] font-bold outline-none placeholder:text-slate-200" 
                      placeholder="Search exams, tests, or notes..." 
                    />
                    {isLoading && <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-primary animate-spin" />}
                 </div>
              </div>
           </div>

           {query.length >= 2 ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">RESULTS: {results.length} NODES</h3>
                    <Badge className="bg-primary/5 text-primary border-none text-[8px] font-black px-3 py-0.5 rounded-lg uppercase">Registry Connected</Badge>
                 </div>
                 <div className="grid grid-cols-1 gap-3">
                    {results.length > 0 ? results.map((res, i) => (
                      <SearchResultItem key={i} boardId={res.boardId} title={res.title} category={res.type} href={res.href} />
                    )) : !isLoading && (
                      <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-inner">
                        <div className="space-y-4 opacity-20 flex flex-col items-center">
                           <SearchIcon className="h-16 w-16" />
                           <p className="text-xl font-bold uppercase tracking-tight">No Results Found</p>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Try keywords like "Patwari" or "Police"</p>
                        </div>
                      </div>
                    )}
                 </div>
              </div>
           ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                 <Card className="border-none shadow-xl rounded-[2.5rem] p-10 bg-[#0B1528] text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><LayoutGrid className="h-44 w-44" /></div>
                    <div className="relative z-10 space-y-8">
                       <h4 className="font-black text-[10px] text-primary uppercase tracking-[0.4em]">Quick Search</h4>
                       <ul className="space-y-5">
                          <TrendingItem text="PSSSB Patwari Hub" onSelect={setQuery} />
                          <TrendingItem text="Punjab Police SI" onSelect={setQuery} />
                          <TrendingItem text="Mental Ability Tests" onSelect={setQuery} />
                          <TrendingItem text="Solved Previous Papers" onSelect={setQuery} />
                       </ul>
                    </div>
                 </Card>
                 <Card className="border-none shadow-xl rounded-[2.5rem] p-10 bg-white group overflow-hidden border border-slate-100">
                    <div className="relative z-10 space-y-8">
                       <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.4em]">Preparation Assets</h4>
                       <div className="flex flex-wrap gap-3">
                          <SearchBadge label="Army Hub" />
                          <SearchBadge label="PPSC Hub" />
                          <SearchBadge label="Clerk Series" />
                          <SearchBadge label="Elite Pass" />
                          <SearchBadge label="Merit List" />
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

function SearchResultItem({ boardId, title, category, href }: { boardId: string, title: string, category: string, href: string }) {
   return (
      <Link href={href} className="block active:scale-[0.99] transition-all">
         <div className="bg-white p-5 md:p-8 rounded-[2rem] shadow-sm hover:shadow-2xl flex items-center justify-between group border border-slate-100 transition-all duration-500">
            <div className="flex items-center gap-6 min-w-0 flex-1">
               <AuthorityLogo boardId={boardId} size="md" className="bg-slate-50 rounded-2xl shadow-inner group-hover:scale-105 transition-transform" />
               <div className="text-left min-w-0 flex-1 space-y-1.5">
                  <p className="font-black text-[#0F172A] group-hover:text-primary transition-colors text-base md:text-2xl leading-tight line-clamp-1 truncate">{title}</p>
                  <div className="flex items-center gap-3">
                     <Badge className="bg-slate-100 text-slate-500 border-none text-[8px] md:text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm">{category}</Badge>
                     <div className="h-1 w-1 rounded-full bg-slate-200" />
                     <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-primary">Verified Node</span>
                  </div>
               </div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all shrink-0 ml-4 shadow-inner">
               <ChevronRightIcon className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </div>
         </div>
      </Link>
   )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6"/>
    </svg>
  )
}

function TrendingItem({ text, onSelect }: { text: string, onSelect: (v: string) => void }) {
   return (
      <li 
         onClick={() => onSelect(text)}
         className="flex items-center gap-4 text-slate-400 text-sm font-bold hover:text-white cursor-pointer transition-colors group active:scale-95"
      >
         <Sparkles className="h-4 w-4 text-primary group-hover:animate-pulse" /> 
         <span className="uppercase tracking-tight truncate">{text}</span>
      </li>
   )
}

function SearchBadge({ label }: { label: string }) {
   return (
      <Badge variant="outline" className="rounded-xl px-4 py-2 border-slate-200 bg-slate-50/50 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all cursor-pointer active:scale-95 shadow-sm">
         {label}
      </Badge>
   )
}
