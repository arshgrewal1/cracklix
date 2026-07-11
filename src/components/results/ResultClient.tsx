
"use client"

import React, { useState, useMemo, useEffect, Suspense, isValidElement, cloneElement, ReactElement } from "react"
import { useParams, useRouter, useSearchParams, usePathname } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Trophy, 
  CheckCircle2, 
  Target, 
  Zap, 
  Loader2, 
  ShieldCheck,
  BarChart3,
  RefreshCw,
  XCircle,
  AlertCircle,
  Users,
  Clock,
  Timer,
  ChevronRight
} from "lucide-react"
import { useUser, useFirestore, useCollection, useDoc } from "@/firebase"
import { collection, query, where, doc, getDoc, documentId, getDocs, limit } from "firebase/firestore"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import StudentAvatar from "@/components/brand/StudentAvatar"

/**
 * @fileOverview Official Result Node Hub Client v2.5.
 * FIXED: Advanced metrics integration (Percentile, Time) and Title Case normalization.
 */

export default function ResultClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const db = useFirestore()
  const { user, profile } = useUser()
  const { toast } = useToast()

  const [questions, setQuestions] = useState<any[]>([])
  const [mockData, setMockData] = useState<any>(null)
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [activeReviewFilter, setActiveReviewFilter] = useState<'ALL' | 'CORRECT' | 'WRONG' | 'SKIPPED'>('ALL')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const mockId = useMemo(() => {
    const queryId = searchParams.get('id');
    if (queryId) return queryId;
    const pathSegments = pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    return lastSegment !== 'view' ? lastSegment : null;
  }, [pathname, searchParams]);

  const resultRef = useMemo(() => (db && user && mockId ? doc(db, "results", `${user.uid}_${mockId}`) : null), [db, user, mockId]);
  const { data: sessionData, loading: resultLoading } = useDoc<any>(resultRef);

  const globalResultsQuery = useMemo(() => {
    if (!db || !mockId) return null
    return query(collection(db, "results"), where("mockId", "==", mockId), limit(500))
  }, [db, mockId])

  const { data: rawGlobalResults } = useCollection<any>(globalResultsQuery)

  const merit = useMemo(() => {
     if (!rawGlobalResults || !sessionData) return { rank: '?', total: 0, percentile: 0, list: [] };
     
     const uniqueMap = new Map<string, any>();
     [...rawGlobalResults].forEach((r: any) => {
        if (!uniqueMap.has(r.userId) || uniqueMap.get(r.userId).score < r.score) {
           uniqueMap.set(r.userId, r);
        }
     });
     
     const meritList = Array.from(uniqueMap.values()).sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
     
     const myRank = meritList.findIndex((r: any) => r.userId === user?.uid) + 1;
     const actualRank = myRank > 0 ? myRank : 1;
     const total = meritList.length;
     
     // Calculate Percentile
     const percentile = total > 1 
       ? Math.round(((total - actualRank) / (total - 1)) * 1000) / 10 
       : 100;
     
     return { rank: actualRank, total, percentile, list: meritList };
  }, [rawGlobalResults, sessionData, user]);

  useEffect(() => {
    async function loadQuestions() {
      if (!db || !mockId) return;
      try {
        const mockSnap = await getDoc(doc(db, "mocks", mockId))
        if (mockSnap.exists()) {
          const mData = mockSnap.data();
          setMockData(mData);
          const questionIds: string[] = mData.questionIds || []
          if (questionIds.length > 0) {
            const fetched: any[] = []
            const chunks = []
            for (let i = 0; i < questionIds.length; i += 30) { chunks.push(questionIds.slice(i, i + 30)) }
            const chunkSnaps = await Promise.all(chunks.map((chunk: string[]) => getDocs(query(collection(db, "questions"), where(documentId(), "in", chunk)))))
            chunkSnaps.forEach(snap => snap.docs.forEach(d => fetched.push({ ...d.data(), id: d.id })))
            setQuestions(questionIds.map((id: string) => fetched.find((q: any) => q.id === id)).filter(Boolean))
          }
        }
      } catch (e) {
        console.error("[AUDIT_HYDRATION_ERROR]:", e);
      } finally { 
        setLoadingQuestions(false) 
      }
    }
    loadQuestions()
  }, [db, mockId]);

  const filteredQuestions = useMemo(() => {
     if (!sessionData) return [];
     return questions.map((q: any, i: number) => ({ ...q, index: i })).filter((q: any) => {
        const ans = sessionData.answers?.[q.index];
        const isCorrect = ans !== undefined && ['A','B','C','D'][ans] === q.correctAnswer;
        if (activeReviewFilter === 'ALL') return true;
        if (activeReviewFilter === 'CORRECT') return isCorrect;
        if (activeReviewFilter === 'WRONG') return ans !== undefined && !isCorrect;
        if (activeReviewFilter === 'SKIPPED') return ans === undefined || ans === null;
        return true;
     });
  }, [questions, sessionData, activeReviewFilter]);

  const formatTime = (seconds: number) => {
     const m = Math.floor(seconds / 60);
     const s = seconds % 60;
     return `${m}m ${s}s`;
  };

  if (!mounted || resultLoading || (loadingQuestions && questions.length === 0)) return (
     <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase text-slate-300">Auditing Session...</p>
     </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-body pb-safe text-left overflow-x-hidden relative">
      <Navbar />
      <main className="container mx-auto px-4 md:px-8 py-6 md:py-10 max-w-7xl space-y-6 md:space-y-12">
        
        {/* SUMMARY HUB */}
        <div className="bg-[#0B1528] rounded-[2rem] shadow-5xl overflow-hidden p-6 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 border border-white/5">
           <div className="flex items-center gap-5 md:gap-10 min-w-0 flex-1 w-full text-center lg:text-left">
              <div className="h-12 w-12 md:h-20 md:w-20 rounded-2xl md:rounded-3xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-2xl border border-primary/20 transition-transform hover:rotate-6">
                 <Trophy className="h-6 w-6 md:h-10 md:w-10" />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                 <h1 className="text-xl md:text-4xl font-black text-white tracking-tight leading-tight uppercase">{sessionData?.mockTitle || "Practice Result"}</h1>
                 <p className="text-[10px] md:text-[12px] font-bold text-slate-400 tracking-widest uppercase">Performance Hub</p>
              </div>
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-12 shrink-0 w-full lg:w-auto px-2">
              <ResultPill label="Score" val={(sessionData?.score || 0).toFixed(1)} color={(sessionData?.score || 0) < 0 ? "text-rose-400" : "text-primary"} />
              <ResultPill label="Rank" val={`#${merit.rank}`} color="text-white" />
              <ResultPill label="Accuracy" val={`${sessionData?.accuracy || 0}%`} color="text-emerald-400" />
              <ResultPill label="Time" val={formatTime(sessionData?.timeTaken || 0)} color="text-amber-400" />
           </div>

           <div className="shrink-0 w-full lg:w-auto">
              <Button asChild className="w-full lg:w-auto h-12 md:h-16 px-10 bg-primary hover:bg-blue-700 text-white font-bold text-sm md:text-lg tracking-tight rounded-xl md:rounded-2xl shadow-xl transition-all border-none active:scale-95">
                 <Link href={`/mocks/instructions?id=${mockId}`} className="flex items-center justify-center gap-3">
                    <RefreshCw className="h-5 w-5" /> Re-Attempt
                 </Link>
              </Button>
           </div>
        </div>

        {/* ANALYSIS TABS */}
        <Tabs defaultValue="SOLUTIONS" className="space-y-6 md:space-y-10">
           <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <TabsList className="bg-white border border-slate-100 p-1.5 h-12 md:h-16 rounded-xl md:rounded-2xl shadow-md inline-flex gap-2">
                 <TabsTrigger value="SOLUTIONS" className="rounded-lg md:rounded-xl px-6 md:px-10 font-bold text-[11px] md:text-sm h-full data-[state=active]:bg-[#0B1228] data-[state=active]:text-white transition-all">Solutions</TabsTrigger>
                 <TabsTrigger value="TOPPER" className="rounded-lg md:rounded-xl px-6 md:px-10 font-bold text-[11px] md:text-sm h-full data-[state=active]:bg-[#0B1228] data-[state=active]:text-white transition-all">Leaderboard</TabsTrigger>
              </TabsList>
              
              <div className="flex flex-wrap items-center gap-2">
                 <FilterBtn active={activeReviewFilter === 'ALL'} onClick={() => setActiveReviewFilter('ALL')} label="All" count={questions.length} icon={<BarChart3 className="h-4 w-4" />} activeColor="bg-slate-900 border-slate-900" />
                 <FilterBtn active={activeReviewFilter === 'CORRECT'} onClick={() => setActiveReviewFilter('CORRECT')} label="Correct" count={sessionData?.correctCount || 0} icon={<CheckCircle2 className="h-4 w-4" />} activeColor="bg-emerald-600 border-emerald-600" />
                 <FilterBtn active={activeReviewFilter === 'WRONG'} onClick={() => setActiveReviewFilter('WRONG')} label="Wrong" count={sessionData?.wrongCount || 0} icon={<XCircle className="h-4 w-4" />} activeColor="bg-rose-600 border-rose-600" />
              </div>
           </div>

           {/* SOLUTIONS CONTENT */}
           <TabsContent value="SOLUTIONS" className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {filteredQuestions.length > 0 ? filteredQuestions.map((q: any) => {
                 const ans = sessionData?.answers?.[q.index];
                 const isCorrect = ans !== undefined && ['A','B','C','D'][ans] === q.correctAnswer;
                 const isSkipped = ans === undefined || ans === null;
                 return (
                    <Card key={q.id} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white text-left relative group border border-slate-100">
                       <div className={cn("absolute top-0 left-0 w-2 md:w-3 h-full transition-all duration-500", isCorrect ? 'bg-emerald-500' : isSkipped ? 'bg-slate-200' : 'bg-rose-500')} />
                       <CardContent className="p-6 md:p-12 lg:p-16">
                          <div className="flex items-center justify-between mb-8 md:mb-12">
                             <div className="flex items-center gap-4">
                                <span className={cn("h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-sm md:text-2xl shadow-inner", isCorrect ? "bg-emerald-50 text-emerald-600" : isSkipped ? "bg-slate-50 text-slate-400" : "bg-rose-50 text-rose-600")}>{q.index + 1}</span>
                                <Badge variant="outline" className="border-slate-100 text-slate-400 text-[9px] md:text-[11px] font-bold px-3 py-1 rounded-lg uppercase tracking-tight">{(q.subjectId || "GK")}</Badge>
                             </div>
                             {isCorrect ? (
                                <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px] md:text-[12px] px-4 py-1.5 rounded-full shadow-sm uppercase tracking-widest">Correct</Badge>
                             ) : isSkipped ? (
                                <Badge className="bg-slate-50 text-slate-400 border-none font-bold text-[9px] md:text-[12px] px-4 py-1.5 rounded-full uppercase tracking-widest">Skipped</Badge>
                             ) : (
                                <Badge className="bg-rose-50 text-rose-600 border-none font-bold text-[9px] md:text-[12px] px-4 py-1.5 rounded-full shadow-sm uppercase tracking-widest">Incorrect</Badge>
                             )}
                          </div>
                          <div className="w-full">
                            <QuestionRenderer 
                              question={q} 
                              language={mockData?.languageMode || 'ENGLISH_PUNJABI'} 
                              showSolution={true} 
                              selectedAnswer={ans ?? null} 
                              className="p-0 border-none shadow-none max-w-none" 
                            />
                          </div>
                       </CardContent>
                    </Card>
                 )
              }) : (
                 <div className="py-32 text-center opacity-30 flex flex-col items-center justify-center space-y-6">
                    <AlertCircle className="h-20 w-20 text-slate-300" />
                    <p className="font-bold text-2xl uppercase tracking-widest">No matching results found</p>
                 </div>
              )}
           </TabsContent>

           {/* LEADERBOARD CONTENT */}
           <TabsContent value="TOPPER" className="animate-in fade-in duration-500">
              <Card className="border-none shadow-3xl rounded-[3rem] bg-white p-6 md:p-12 text-left border border-slate-100 overflow-hidden">
                 <div className="space-y-8">
                    <div className="p-6 md:p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div className="flex items-center gap-4">
                          <Users className="h-6 w-6 text-primary" />
                          <div>
                            <p className="text-[11px] md:text-sm font-bold text-slate-500 tracking-tight uppercase">Registry Node</p>
                            <p className="text-base md:text-xl font-black text-[#0F172A]">{merit.total} Verified Aspirants</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
                          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Live Merit Sync</span>
                       </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                       {merit.list?.slice(0, 100).map((r: any, i: number) => {
                          const name = (r.userName && r.userName !== 'Aspirant' && !r.userName.includes('@')) ? r.userName : (r.userEmail || "Aspirant");
                          const isCurrentUser = r.userId === user?.uid;
                          
                          return (
                           <div key={r.id} className={cn("flex items-center justify-between py-6 md:py-8 md:px-10 rounded-[2rem] transition-all duration-500 my-2", isCurrentUser ? "bg-primary/5 ring-1 ring-primary/20 shadow-2xl scale-[1.02]" : "hover:bg-slate-50")}>
                              <div className="flex items-center gap-6 md:gap-10 flex-1 min-w-0">
                                 <span className={cn("font-black w-10 md:w-16 text-sm md:text-3xl tabular-nums", i < 3 ? "text-primary" : "text-slate-200")}>#{i+1}</span>
                                 <StudentAvatar profile={{ name, gender: r.gender }} className="h-10 w-10 md:h-20 md:w-20 rounded-xl md:rounded-[2.5rem] border-2 border-white shadow-xl bg-slate-50" />
                                 <div className="min-w-0 flex-1">
                                    <p className={cn("font-black text-sm md:text-2xl truncate tracking-tight uppercase", isCurrentUser ? "text-primary" : "text-[#0F172A]")}>{name} {isCurrentUser && "(You)"}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                       <p className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Score: {(r.score || 0).toFixed(1)}</p>
                                       <div className="h-1 w-1 rounded-full bg-slate-200" />
                                       <p className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Accuracy: {r.accuracy}%</p>
                                    </div>
                                 </div>
                              </div>
                              <div className="shrink-0 ml-4">
                                 <Badge className={cn("border-none text-[10px] md:text-lg font-black px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl tabular-nums shadow-lg", r.accuracy > 85 ? "bg-emerald-50 text-emerald-600" : r.accuracy > 60 ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500")}>{r.accuracy}%</Badge>
                              </div>
                           </div>
                          );
                       })}
                    </div>
                 </div>
              </Card>
           </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}

function ResultPill({ label, val, color, className }: any) {
   return (
      <div className={cn("flex flex-col items-center lg:items-start gap-1", className)}>
         <span className="text-[8px] md:text-[11px] font-bold text-slate-500 tracking-widest uppercase">{label}</span>
         <span className={cn("text-xl md:text-4xl font-black leading-none tabular-nums tracking-tighter", color)}>{val}</span>
      </div>
   )
}

function FilterBtn({ active, onClick, label, count, icon, activeColor }: any) {
   return (
      <button onClick={onClick} className={cn("px-5 py-3 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold border transition-all flex items-center gap-3 whitespace-nowrap active:scale-[0.98] shadow-sm", active ? `${activeColor} text-white shadow-xl` : "bg-white border-slate-100 text-slate-500 hover:border-slate-300")}>
         {icon} {label} <span className="opacity-60 ml-0.5">({count})</span>
      </button>
   )
}
