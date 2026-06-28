"use client"

import * as React from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Search as SearchIcon, Zap, ChevronRight, FileText, Loader2, GraduationCap } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection } from "firebase/firestore"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Universal Search Hub.
 * FIXED: Added explicit React import for module resolution in React 19.
 * FIXED: Standardized cloneElement usage.
 */

export default function SearchPage() {
  return (
    <React.Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" /></div>}>
      <SearchContent />
    </React.Suspense>
  )
}

function SearchContent() {
  const db = useFirestore()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading: authLoading } = useUser()
  const [queryStr, setQuery] = React.useState("")

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`)
    }
  }, [user, authLoading, router, pathname])

  React.useEffect(() => {
    const q = searchParams.get("q")
    if (q) setQuery(q)
  }, [searchParams])

  const mocksQuery = React.useMemo(() => (db ? collection(db, "mocks") : null), [db])
  const examsQuery = React.useMemo(() => (db ? collection(db, "exams") : null), [db])
  const notesQuery = React.useMemo(() => (db ? collection(db, "notes") : null), [db])

  const { data: mocks, loading: mLoading } = useCollection<any>(mocksQuery)
  const { data: exams, loading: eLoading } = useCollection<any>(examsQuery)
  const { data: notes, loading: nLoading } = useCollection<any>(notesQuery)

  const isLoading = mLoading || eLoading || nLoading

  const searchResults = React.useMemo(() => {
    if (queryStr.trim().length < 2) return []
    const term = queryStr.toLowerCase().trim()
    
    const examMatches = (exams || []).filter((e: any) => 
      e.name?.toLowerCase().includes(term) || 
      e.boardId?.toLowerCase().includes(term)
    ).map((e: any) => ({ 
       title: e.name, 
       type: "Exam Hub", 
       href: `/exams/view?id=${e.id}`, 
       icon: <GraduationCap />
    }))

    const mockMatches = (mocks || []).filter((m: any) => 
      m.title?.toLowerCase().includes(term) || 
      m.boardId?.toLowerCase().includes(term)
    ).map((m: any) => ({ 
       title: m.title, 
       type: "Practice Test", 
       href: `/mocks/view?id=${m.id}`, 
       icon: <Zap />
    }))

    const notesMatches = (notes || []).filter((n: any) => 
       n.title?.toLowerCase().includes(term) || 
       n.subjectId?.toLowerCase().includes(term)
    ).map((n: any) => ({ 
       title: n.title, 
       type: "Library", 
       href: `/notes`, 
       icon: <FileText />
    }))

    return [...examMatches, ...mockMatches, ...notesMatches]
  }, [queryStr, exams, mocks, notes])

  if (authLoading || !user) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4">
       <Zap className="h-10 w-10 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase text-slate-300">Syncing Registry...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50/30 font-body">
      <Navbar />
      <main className="container mx-auto px-4 md:px-6 py-6 md:py-16 max-w-5xl text-left pb-safe">
        <div className="space-y-8 md:space-y-12">
           <div className="text-center space-y-6">
              <h1 className="text-2xl md:text-6xl font-black text-[#0F172A] tracking-tighter uppercase">Find Your Test</h1>
              <div className="relative max-w-[700px] mx-auto group">
                 <div className="relative">
                    <SearchIcon className={cn("absolute left-4 md:left-6 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors", isLoading ? "text-primary animate-pulse" : "text-slate-400")} />
                    <input 
                      value={queryStr}
                      onChange={e => setQuery(e.target.value)}
                      autoFocus
                      className="w-full h-12 md:h-14 pl-12 md:pl-16 pr-14 text-sm md:text-2xl rounded-2xl md:rounded-[2.5rem] border-none shadow-2xl bg-white focus:ring-4 focus:ring-primary/5 text-slate-900"
                      placeholder="Search exams or tests..." 
                    />
                    {isLoading && <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-primary animate-spin" />}
                 </div>
              </div>
           </div>

           {queryStr.length >= 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                 <div className="grid grid-cols-1 gap-3">
                    {searchResults.map((res, i) => (
                      <Link key={i} href={res.href} className="bg-white p-5 md:p-8 rounded-[2rem] shadow-sm hover:shadow-2xl flex items-center justify-center border border-slate-100 transition-all duration-500">
                         <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-primary/5 transition-all">
                               {React.cloneElement(res.icon as React.ReactElement, { className: "h-5 w-5" })}
                            </div>
                            <div className="text-left min-w-0 flex-1">
                               <p className="font-black text-[#0F172A] group-hover:text-primary transition-colors text-sm md:text-xl uppercase leading-tight line-clamp-1 truncate">{res.title}</p>
                               <Badge className="bg-slate-100 text-slate-500 border-none text-[8px] font-black rounded mt-1 uppercase">{res.type}</Badge>
                            </div>
                         </div>
                         <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                      </Link>
                    ))}
                 </div>
              </div>
           )}
        </div>
      </main>
      <Footer />
    </div>
  )
}