
"use client"

import { useMemo, useEffect, useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useCollection, useFirestore } from "@/firebase"
import { collection, query, where, doc, updateDoc, limit, orderBy } from "firebase/firestore"
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
  Sparkles,
  GraduationCap,
  Bell,
  Activity,
  Award
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

/**
 * @file Overview Elite "My Exams" Live Hub v7.0.
 * PERSONALIZED ENGINE: Instantly detects new mocks/news for pinned hubs.
 * PERFORMANCE: Uses sub-collection queries and chronological sorting.
 */

export default function MyExamsPage() {
  const { user, profile, loading: userLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login?returnUrl=/my-exams")
    }
  }, [user, userLoading, router])

  const examsQuery = useMemo(() => (db ? collection(db, "exams") : null), [db])
  const boardsQuery = useMemo(() => (db ? collection(db, "boards") : null), [db])
  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), where("published", "==", true), orderBy("createdAt", "desc"), limit(20)) : null), [db])
  
  const { data: allExams } = useCollection<any>(examsQuery)
  const { data: boards } = useCollection<any>(boardsQuery)
  const { data: recentMocks } = useCollection<any>(mocksQuery)

  const resultsQuery = useMemo(() => {
    if (!db || !user) return null
    return query(collection(db, "results"), where("userId", "==", user.uid), limit(5))
  }, [db, user])

  const { data: rawResults, loading: attemptsLoading } = useCollection<any>(resultsQuery)

  const recentAttempts = useMemo(() => {
    if (!rawResults) return []
    return [...rawResults].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [rawResults])

  const pinnedExams = useMemo(() => {
    if (!allExams || !profile?.pinnedExams) return []
    return allExams.filter((e: any) => profile.pinnedExams?.includes(e.id))
  }, [allExams, profile])

  if (userLoading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-6">
       <Zap className="h-12 w-12 text-primary animate-spin" />
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Syncing Mastery Hub...</p>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body pb-32">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 md:py-12 max-w-6xl space-y-12">
        
        {/* HEADER: ELITE NODES */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 text-left">
           <div className="space-y-3">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-inner">
                    <Target className="h-6 w-6" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Institutional Dashboard</span>
              </div>
              <h1 className="text-4xl md:text-7xl font-headline font-black text-[#0F172A] uppercase tracking-tighter leading-none">MY <span className="text-primary">EXAMS</span></h1>
              <p className="text-sm md:text-xl text-slate-400 font-medium max-w-xl">Strategic overview of your selected recruitment verticals.</p>
           </div>
           <Button asChild className="h-16 px-10 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-4xl gap-3">
              <Link href="/exams"><LayoutGrid className="h-5 w-5" /> Add Master Hub</Link>
           </Button>
        </div>

        {/* PINNED HUBS: LIVE DETECTION */}
        <section className="space-y-6">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-3">
                 <Star className="h-4 w-4 text-amber-500 fill-current" /> Pinned Mastery Nodes
              </h3>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pinnedExams.length > 0 ? pinnedExams.map((exam) => {
                 const board = boards?.find((b: any) => b.id.toLowerCase() === exam.boardId?.toLowerCase() || b.abbreviation?.toLowerCase() === exam.boardId?.toLowerCase());
                 const logoUrl = board?.iconUrl || exam.iconUrl;
                 const isImgFailed = failedImages[exam.id];
                 const isArmy = exam.boardId?.toLowerCase() === 'army' || exam.id?.toLowerCase().includes('army');
                 
                 // Elite logic: Find new mocks for this pinned hub
                 const hasNewMocks = recentMocks?.some(m => m.examId === exam.id && (Date.now() - (m.createdAt?.seconds * 1000 || 0)) < 86400000 * 7);

                 return (
                  <Link key={exam.id} href={`/exams/${exam.id}`}>
                      <Card className="border-none shadow-xl hover:shadow-4xl transition-all duration-500 rounded-[2.5rem] bg-white p-8 text-left group relative overflow-hidden h-full flex flex-col border border-slate-100 hover:border-primary/20">
                        {hasNewMocks && (
                           <div className="absolute top-8 left-8 z-20">
                              <Badge className="bg-rose-500 text-white border-none animate-pulse text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg shadow-rose-500/20">NEW MOCKS</Badge>
                           </div>
                        )}
                        <div className="flex justify-between items-start mb-8">
                           <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center shrink-0 border border-slate-100 shadow-inner group-hover:scale-105 transition-transform overflow-hidden">
                              {logoUrl && !isImgFailed ? (
                                <img src={logoUrl} className={cn("w-full h-full object-contain p-2", isArmy ? "scale-150" : "")} referrerPolicy="no-referrer" alt="Logo" onError={() => setFailedImages(p => ({...p, [exam.id]: true}))} />
                              ) : (
                                <GraduationCap className="h-8 w-8 text-slate-200" />
                              )}
                           </div>
                           <Badge className="bg-primary/5 text-primary border-none text-[8px] font-black uppercase px-3 py-1 rounded-lg">REGISTRY HUB</Badge>
                        </div>
                        <h4 className="font-black text-xl text-[#0F172A] uppercase leading-tight flex-1 mb-2">{exam.name}</h4>
                        <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-6">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{board?.abbreviation || 'GOVT'} Authority</p>
                           <ChevronRight className="h-5 w-5 text-slate-200 group-hover:text-primary transition-all group-hover:translate-x-1" />
                        </div>
                      </Card>
                  </Link>
                 )
              }) : (
                 <Card className="col-span-full border-2 border-dashed border-slate-200 bg-white/50 py-24 rounded-[3.5rem] flex flex-col items-center justify-center text-center space-y-6">
                    <div className="h-20 w-20 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300">
                       <Sparkles className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                       <p className="text-xl font-headline font-black text-[#0F172A] uppercase">Mastery Nodes Empty</p>
                       <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Pin recruitment hubs to track them instantly.</p>
                    </div>
                    <Button asChild className="bg-[#0F172A] hover:bg-black rounded-xl h-12 px-10 font-black uppercase text-[10px] tracking-widest shadow-xl">
                       <Link href="/exams">Browse Hub Registry</Link>
                    </Button>
                 </Card>
              )}
           </div>
        </section>

        {/* RECENT ACTIVITY: CHRONOLOGICAL */}
        <section className="space-y-6">
           <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-3 px-2">
              <History className="h-4 w-4" /> Activity Trajectory
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {attemptsLoading ? (
                 Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-[2.5rem]" />)
              ) : recentAttempts.length > 0 ? recentAttempts.map((r: any) => (
                 <Link key={r.id} href={`/results/${r.mockId}`}>
                    <Card className="border-none shadow-xl hover:shadow-4xl transition-all duration-300 rounded-[2.5rem] bg-white p-6 md:p-10 flex items-center justify-between group overflow-hidden relative">
                       <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                       <div className="flex items-center gap-8 min-w-0">
                          <div className="h-14 w-14 md:h-20 md:w-20 rounded-[1.5rem] bg-slate-50 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-primary/5 transition-all">
                             <Zap className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                          </div>
                          <div className="min-w-0 space-y-2">
                             <h4 className="font-black text-lg md:text-2xl text-[#0F172A] uppercase truncate leading-none">{r.mockTitle}</h4>
                             <div className="flex items-center gap-4 text-[10px] md:text-[12px] font-bold text-slate-400 uppercase tracking-tight">
                                <span className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-primary" /> {new Date(r.timestamp).toLocaleDateString()}</span>
                                <Badge className="bg-emerald-50 text-emerald-600 border-none font-black px-2 py-0">Score: {r.score}</Badge>
                             </div>
                          </div>
                       </div>
                       <ChevronRight className="h-6 w-6 text-slate-200 group-hover:text-primary transition-all group-hover:translate-x-2" />
                    </Card>
                 </Link>
              )) : (
                <div className="col-span-full py-16 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm opacity-30 italic">
                   <p className="font-black uppercase tracking-[0.3em] text-[10px]">Awaiting your first evaluation attempt.</p>
                </div>
              )}
           </div>
        </section>

        {/* CTA: STRATEGIC GROWTH */}
        <section className="bg-gradient-to-br from-[#0B1528] to-[#0F172A] rounded-[4rem] p-10 md:p-20 text-white relative overflow-hidden shadow-5xl text-left border border-white/5">
           <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 group-hover:scale-110 transition-transform"><Award className="h-80 w-80" /></div>
           <div className="relative z-10 space-y-10 max-w-2xl">
              <div className="space-y-4">
                 <Badge className="bg-primary text-white border-none px-4 py-1 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-primary/20">ELITE REGISTRY ENABLED</Badge>
                 <h2 className="text-4xl md:text-7xl font-headline font-black uppercase leading-[0.85] tracking-tighter">Your Future <br/> Node is Active.</h2>
              </div>
              <p className="text-base md:text-2xl text-slate-400 font-medium leading-relaxed antialiased">
                 Every mastery pass node includes 24/7 access to the official PSSSB registry and real-time current affairs verification. Fix your logic gaps today.
              </p>
              <div className="flex flex-col sm:row items-center gap-4">
                 <Button asChild className="w-full sm:w-auto bg-primary hover:bg-orange-600 text-white font-black uppercase text-[11px] tracking-[0.2em] h-16 px-12 rounded-2xl shadow-5xl transition-all active:scale-95 border-none">
                    <Link href="/mocks">Explore All Hubs <Zap className="ml-3 h-4 w-4 fill-current" /></Link>
                 </Button>
                 <Button asChild variant="ghost" className="text-slate-400 hover:text-white uppercase font-black text-[10px] tracking-widest">
                    <Link href="/pass">Upgrade Account</Link>
                 </Button>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
