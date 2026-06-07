
"use client"

import { useMemo, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useCollection, useFirestore } from "@/firebase"
import { collection, query, where, doc, updateDoc } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Target, 
  Zap, 
  ChevronRight, 
  History, 
  Search, 
  Star,
  ShieldCheck,
  LayoutGrid,
  Clock,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { useRouter } from "next/navigation"

/**
 * @fileOverview Institutional "My Exams" Dashboard.
 * Optimized: Client-side sorting for Results to bypass composite index requirements.
 */

export default function MyExamsPage() {
  const { user, profile, loading: userLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login?returnUrl=/my-exams")
    }
  }, [user, userLoading, router])

  const examsQuery = useMemo(() => (db ? collection(db, "exams") : null), [db])
  const { data: allExams } = useCollection<any>(examsQuery)

  // Simplified query to bypass index requirement
  const resultsQuery = useMemo(() => {
    if (!db || !user) return null
    return query(collection(db, "results"), where("userId", "==", user.uid))
  }, [db, user])

  const { data: rawResults, loading: attemptsLoading } = useCollection<any>(resultsQuery)

  const recentAttempts = useMemo(() => {
    if (!rawResults) return []
    // Client-side chronological sort
    return [...rawResults].sort((a: any, b: any) => {
      const tA = new Date(a.timestamp || 0).getTime()
      const tB = new Date(b.timestamp || 0).getTime()
      return tB - tA
    })
  }, [rawResults])

  const pinnedExams = useMemo(() => {
    if (!allExams || !profile?.pinnedExams) return []
    return allExams.filter((e: any) => profile.pinnedExams?.includes(e.id))
  }, [allExams, profile])

  if (userLoading) return <div className="h-screen flex items-center justify-center bg-white"><Zap className="h-8 w-8 text-primary animate-pulse" /></div>

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 md:py-12 max-w-6xl space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left">
           <div className="space-y-1">
              <div className="flex items-center gap-2">
                 <Target className="h-4 w-4 text-primary" />
                 <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Aspirant Dashboard</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-[#0F172A] uppercase tracking-tight">My Exams</h1>
           </div>
           <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="pl-10 h-11 rounded-xl bg-white border-none shadow-sm text-sm" placeholder="Search my registry..." />
           </div>
        </div>

        {/* PINNED REGISTRY */}
        <section className="space-y-4">
           <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                 <Star className="h-3 w-3 text-amber-500 fill-current" /> Pinned Hubs
              </h3>
              <Link href="/exams" className="text-[9px] font-black text-primary uppercase hover:underline">Add New Hub</Link>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {pinnedExams.length > 0 ? pinnedExams.map((exam) => (
                 <Link key={exam.id} href={`/exams/${exam.id}`}>
                    <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl bg-white p-4 md:p-6 text-left group">
                       <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-slate-50 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-primary/10 transition-colors">
                          <LayoutGrid className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                       </div>
                       <h4 className="font-black text-[13px] md:text-lg text-[#0F172A] uppercase leading-tight line-clamp-1">{exam.name}</h4>
                       <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase mt-1">Registry Active</p>
                    </Card>
                 </Link>
              )) : (
                 <Card className="col-span-full border-2 border-dashed border-slate-200 bg-white/50 p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                    <Sparkles className="h-8 w-8 text-slate-200 mb-3" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No target exams pinned.</p>
                    <Button asChild variant="link" className="text-primary font-black uppercase text-[10px]"><Link href="/exams">Browse Catalog</Link></Button>
                 </Card>
              )}
           </div>
        </section>

        {/* CONTINUE PREPARATION */}
        <section className="space-y-4">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <History className="h-3 w-3" /> Continue Preparation
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {attemptsLoading ? (
                 Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
              ) : recentAttempts?.slice(0, 4).map((r: any) => (
                 <Link key={r.id} href={`/results/${r.mockId}`}>
                    <Card className="border-none shadow-sm hover:shadow-lg transition-all rounded-2xl bg-white p-5 flex items-center justify-between group overflow-hidden relative">
                       <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                       <div className="flex items-center gap-5 min-w-0">
                          <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                             <Zap className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                             <h4 className="font-black text-sm md:text-base text-[#0F172A] uppercase truncate">{r.mockTitle}</h4>
                             <div className="flex items-center gap-3 mt-1 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase">
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(r.timestamp).toLocaleDateString()}</span>
                                <span className="text-emerald-600">Score: {r.score}/{r.totalQuestions}</span>
                             </div>
                          </div>
                       </div>
                       <ChevronRight className="h-5 w-5 text-slate-200 group-hover:text-primary transition-all" />
                    </Card>
                 </Link>
              ))}
           </div>
        </section>

        {/* RECRUITMENT GALAXY */}
        <section className="bg-[#0B1528] rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl text-left">
           <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><ShieldCheck className="h-40 w-40" /></div>
           <div className="relative z-10 space-y-6 max-w-xl">
              <h2 className="text-2xl md:text-4xl font-headline font-black uppercase leading-tight">Master your target <br/> recruitment hub.</h2>
              <p className="text-slate-400 text-sm md:text-lg font-medium leading-relaxed">Access 100% verified patterns, PYQs, and daily strategic news for your selected exams.</p>
              <Button asChild className="bg-primary hover:bg-orange-600 text-white font-black uppercase text-[10px] tracking-widest h-14 px-10 rounded-xl shadow-xl transition-all active:scale-95 border-none">
                 <Link href="/mocks">Explore All Series</Link>
              </Button>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
