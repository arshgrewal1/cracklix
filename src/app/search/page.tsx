"use client"

import React, { useState, useEffect, useMemo, Suspense, cloneElement, ReactElement, isValidElement } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Search as SearchIcon, Zap, ChevronRight, FileText, LayoutGrid, Loader2, GraduationCap } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection } from "firebase/firestore"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Search Center v6.2.
 * FIXED: TypeScript cloneElement type mismatch for strict production build.
 * FIXED: Corrected Icon rendering logic for Lucide components.
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
  const [queryStr, setQuery] = useState("")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`)
    }
  }, [user, authLoading, router, pathname])

  useEffect(() => {
    const q = searchParams.get("q")
    if (q) setQuery(q)
  }, [searchParams])

  const mocksQuery = useMemo(() => (db ? collection(db, "mocks") : null), [db])
  const examsQuery = useMemo(() => (db ? collection(db, "exams") : null), [db])
  const notesQuery = useMemo(() => (db ? collection(db, "notes") : null), [db])

  const { data: mocks, loading: mLoading } = useCollection<any>(mocksQuery)
  const { data: exams, loading: eLoading } = useCollection<any>(examsQuery)
  const { data: notes, loading: nLoading } = useCollection<any>(notesQuery)

  const isLoading = mLoading || eLoading || nLoading

  const searchResults = useMemo(() => {
    if (queryStr.trim().length < 2) return []
    const term = queryStr.toLowerCase().trim()
    
    const examMatches = (exams || []).filter((e: any) => 
      e.name?.toLowerCase().includes(term) || 
      e.boardId?.toLowerCase().includes(term)
    ).map((e: any) => ({ 
       title: e.name, 
       type: "Exam Center", 
       href: `/exams/view?id=${e.id}`, 
       boardId: e.boardId,
       icon: <GraduationCap />
    }))

    const mockMatches = (mocks || []).filter((m: any) => 
      m.title?.toLowerCase().includes(term) || 
      m.boardId?.toLowerCase().includes(term)
    ).map((m: any) => ({ 
       title: m.title, 
       type: "Practice Test", 
       href: `/mocks/view?id=${m.id}`, 
       boardId: m.boardId,
       icon: <Zap />
    }))

    const notesMatches = (notes || []).filter((n: any) => 
       n.title?.toLowerCase().includes(term) || 
       n.subjectId?.toLowerCase().includes(term)
    ).map((n: any) => ({ 
       title: n.title, 
       type: "Notes & PDFs", 
       href: `/notes`, 
       boardId: n.boardId,
       icon: <FileText />
    }))

    return [...examMatches, ...mockMatches, ...notesMatches]
  }, [queryStr, exams, mocks, notes])

  if (authLoading || !user) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4">
       <Zap className="h-10 w-10 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase text-slate-300">Authorizing Search...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50/30 font-body">
      <Navbar />
      <main className="container mx-auto px-4 md:px-6 py-6 md:py-16 max-w-5xl text-left">
        <div className="space-y-8 md:space-y-12">
           <div className="text-center space-y-6">
              <div className="space-y-2">
                 <h1 className="text-2xl md:text-6xl font-black text-[#0F172A] tracking-tighter leading-none">Find Your Test</h1>
                 <p className="text-slate-400 font-bold text-[9px] md:text-[11px] uppercase tracking-[0.4em]">Instant access to the test bank</p>
              </div>
              
              <div className="relative max-w-[700px] mx-auto group">
                 <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                 <div className="relative">
                    <SearchIcon className={cn("absolute left-4 md:left-6 top-1/2 -translate-y-1/2 h-5 w-5 md:h-6 md:w-6 transition-colors", isLoading ? "text-primary animate-pulse" : "text-slate-400")} />
                    <input 
                      value={queryStr}
                      onChange={e => setQuery(e.target.value)}
                      autoFocus
                      className="w-full h-14 md:h-18 pl-12 md:pl-16 pr-14 text-sm md:text-2xl rounded-2xl md:rounded-[2.5rem] border-none shadow-2xl bg-white focus:ring-4 focus:ring-primary/5 text-slate-900 placeholder-slate-400"
                      placeholder="Search exams, tests, or notes..." 
                    />
                    {isLoading && <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-primary animate-spin" />}
                 </div>
              </div>
           </div>

           {queryStr.length >= 2 ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Results: {searchResults.length} items</h3>
                    <Badge className="bg-primary/5 text-primary border-none text-[8px] font-black px-3 py-0.5 rounded-lg uppercase">Verified List</Badge>
                 </div>
                 <div className="grid grid-cols-1 gap-3">
                    {searchResults.length > 0 ? searchResults.map((res, i) => (
                      <SearchResultItem key={i} title={res.title} category={res.type} href={res.href} icon={res.icon} />
                    )) : !isLoading && (
                      <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-inner">
                        <div className="space-y-4 opacity-20 flex flex-col items-center">
                           <SearchIcon className="h-16 w-16" />
                           <p className="text-xl font-bold tracking-tight">No results found</p>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Try keywords like "Patwari" or "Police"</p>
                        </div>
                      </div>
                    )}
                 </div>
              </div>
           ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                 <Card className="border-none shadow-xl rounded-2xl md:rounded-[2.5rem] p-10 bg-[#0B1528] text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><LayoutGrid className="h-44 w-44" /></div>
                    <div className="relative z-10 space-y-8">
                       <h4 className="font-black text-[10px] text-primary uppercase tracking-[0.4em]">Quick Search</h4>
                       <ul className="space-y-5">
                          <TrendingItem text="PSSSB Patwari Hub" onSelect={setQuery} />
                          <TrendingItem text="Punjab Police SI" onSelect={setQuery} />
                          <TrendingItem text="Mental Ability Tests" onSelect={setQuery} />
                          <TrendingItem text="Solved Old Papers" onSelect={setQuery} />
                       </ul>
                    </div>
                 </Card>
                 <Card className="border-none shadow-xl rounded-[2.5rem] p-10 bg-white group overflow-hidden border border-slate-100">
                    <div className="relative z-10 space-y-8">
                       <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.4em]">Study Items</h4>
                       <div className="flex flex-wrap gap-3">
                          <SearchBadge label="Army Hub" onSelect={setQuery} />
                          <SearchBadge label="PPSC Hub" onSelect={setQuery} />
                          <SearchBadge label="Clerk Series" onSelect={setQuery} />
                          <SearchBadge label="Pro Pass" onSelect={setQuery} />
                          <SearchBadge label="Top Rankers" onSelect={setQuery} />
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

function SearchResultItem({ title, category, href, icon }: { title: string, category: string, href: string, icon: React.ReactNode }) {
   return (
      <Link href={href} className="block active:scale-[0.99] transition-all group">
         <div className="bg-white p-5 md:p-8 rounded-[2rem] shadow-sm hover:shadow-2xl flex items-center justify-between border border-slate-100 transition-all duration-500">
            <div className="flex items-center gap-4 min-w-0 flex-1">
               <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/5 transition-all shrink-0 shadow-inner">
                  {isValidElement(icon)
                    ? cloneElement(icon as ReactElement<{ className?: string }>, {
                        className: "h-5 w-5",
                      })
                    : icon}
               </div>
               <div className="text-left min-w-0 flex-1 space-y-1">
                  <p className="font-black text-[#0F172A] group-hover:text-primary transition-colors text-sm md:text-xl uppercase leading-tight line-clamp-1 truncate">{title}</p>
                  <div className="flex items-center gap-3">
                     <Badge className="bg-slate-100 text-slate-500 border-none text-[8px] md:text-[9px] font-black rounded shadow-sm">{category}</Badge>
                     <div className="h-1 w-1 rounded-full bg-slate-200" />
                     <span className="text-[8px] font-black uppercase tracking-widest text-primary">Verified</span>
                  </div>
               </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all shrink-0 ml-4 shadow-inner">
               <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </div>
         </div>
      </Link>
   )
}

function TrendingItem({ text, onSelect }: { text: string, onSelect: (v: string) => void }) {
   return (
      <li 
         onClick={() => onSelect(text)}
         className="flex items-center gap-4 text-slate-400 text-sm font-bold hover:text-white cursor-pointer transition-colors group active:scale-95"
      >
         <Zap className="h-4 w-4 text-primary group-hover:animate-pulse" /> 
         <span className="tracking-tight truncate">{text}</span>
      </li>
   )
}

function SearchBadge({ label, onSelect }: { label: string, onSelect: (v: string) => void }) {
   return (
      <Badge 
         onClick={() => onSelect(label)}
         variant="outline" 
         className="rounded-xl px-4 py-2 border-slate-200 bg-slate-50/50 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-primary/10 hover:text-primary hover:border-primary transition-all cursor-pointer"
      >
         {label}
      </Badge>
   )
}
