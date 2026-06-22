"use client"

import React, { useState, useMemo, useEffect, Suspense, isValidElement, cloneElement, ReactElement } from "react"
import { useParams, useRouter } from "next/navigation"
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
  Users
} from "lucide-react"
import { useUser, useFirestore, useCollection, useDoc } from "@/firebase"
import { collection, query, where, doc, getDoc, documentId, getDocs, limit } from "firebase/firestore"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import StudentAvatar from "@/components/brand/StudentAvatar"

export default function ResultClient() {
  const params = useParams()
  const router = useRouter()
  const mockId = params.id as string
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

  const resultRef = useMemo(() => (db && user && mockId ? doc(db, "results", `${user.uid}_${mockId}`) : null), [db, user, mockId]);
  const { data: sessionData, loading: resultLoading } = useDoc<any>(resultRef);

  const globalResultsQuery = useMemo(() => {
    if (!db || !mockId) return null
    return query(collection(db, "results"), where("mockId", "==", mockId), limit(300))
  }, [db, mockId])

  const { data: rawGlobalResults } = useCollection<any>(globalResultsQuery)

  const merit = useMemo(() => {
     if (!rawGlobalResults || !sessionData) return { rank: '?', total: 0, percentile: 0, list: [] };
     
     const uniqueMap = new Map<string, any>();
     [...rawGlobalResults].sort((a: any, b: any) => (b.score || 0) - (a.score || 0)).forEach((r: any) => {
        if (!uniqueMap.has(r.userId) || uniqueMap.get(r.userId).score < r.score) {
           uniqueMap.set(r.userId, r);
        }
     });
     const meritList = Array.from(uniqueMap.values()).sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
     
     const rank = meritList.findIndex((r: any) => r.userId === user?.uid) + 1;
     const actualRank = rank > 0 ? rank : 1;
     const total = meritList.length;
     const percentile = total > 0 ? Math.round(((total - actualRank + 1) / (total || 1)) * 1000) / 10 : 0;
     
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

  if (!mounted || resultLoading || (loadingQuestions && questions.length === 0)) return (
     <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase text-slate-300">Auditing Session...</p>
     </div>
  );

  if (!sessionData) return (
     <div className="h-screen flex flex-col items-center justify-center text-center bg-white p-6 space-y-6">
        <AlertCircle className="h-10 w-10 text-slate-200" />
        <div className="space-y-1">
           <h2 className="text-xl font-headline font-black uppercase text-[#0F172A]">Registry Link Missing</h2>
           <p className="text-slate-500 font-medium text-sm max-w-xs mx-auto">This attempt data node could not be verified.</p>
        </div>
        <Button asChild className="bg-[#0F172A] hover:bg-black text-white rounded-xl h-11 px-8 font-black uppercase text-[10px]"><Link href="/dashboard">Return Dashboard</Link></Button>
     </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-body pb-safe text-left overflow-hidden relative touch-pan-y">
      <Navbar />
      <main className="container mx-auto px-4 md:px-8 py-6 md:py-10 max-w-7xl space-y-8 md:space-y-12">
        
        <div className="bg-[#0B1528] rounded-[2rem] shadow-5xl overflow-hidden p-6 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 border border-white/5">
           <div className="flex items-center gap-5 md:gap-8 min-w-0 flex-1 w-full text-center lg:text-left">
              <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-2xl border border-primary/20">
                 <Trophy className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                 <h1 className="text-lg md:text-3xl font-black text-white uppercase tracking-tight leading-tight">{sessionData.mockTitle}</h1>
                 <p className="text-[9px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest">Performance Hub</p>
              </div>
           </div>

           <div className="flex flex-wrap items-center justify-center lg:justify-end gap-6 md:gap-10 shrink-0 w-full lg:w-auto px-2">
              <ResultPill label="SCORE" val={(sessionData.score || 0).toFixed(1)} color={(sessionData.score || 0) < 0 ? "text-rose-400" : "text-primary"} />
              <div className="hidden md:block w-px h-10 bg-white/10" />
              <ResultPill label="RANK" val={`#${merit.rank}`} color="text-white" />
              <div className="hidden md:block w-px h-10 bg-white/10" />
              <ResultPill label="ACCURACY" val={`${sessionData.accuracy || 0}%`} color="text-emerald-400" />
           </div>

           <div className="flex gap-4 shrink-0 w-full lg:w-auto">
              <Button asChild className="w-full lg:w-auto h-12 md:h-14 px-8 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-xl transition-all border-none active:scale-95">
                 <Link href={`/mocks/${sessionData.mockId}/instructions`} className="flex items-center justify-center gap-3">
                    <RefreshCw className="h-4 w-4" /> RE-ATTEMPT
                 </Link>
              </Button>
           </div>
        </div>

        <Tabs defaultValue="SOLUTIONS" className="space-y-6 md:space-y-8">
           <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <TabsList className="bg-white border border-slate-100 p-1.5 h-12 md:h-14 rounded-xl shadow-md inline-flex">
                 <TabsTrigger value="SOLUTIONS" className="rounded-lg px-6 md:px-8 font-black uppercase text-[9px] md:text-[10px] h-full data-[state=active]:bg-[#0B1528] data-[state=active]:text-white transition-all">Solutions</TabsTrigger>
                 <TabsTrigger value="TOPPER" className="rounded-lg px-6 md:px-8 font-black uppercase text-[9px] md:text-[10px] h-full data-[state=active]:bg-[#0B1528] data-[state=active]:text-white transition-all">Leaderboard</TabsTrigger>
              </TabsList>
              
              <div className="flex flex-wrap gap-2">
                 <FilterBtn active={activeReviewFilter === 'ALL'} onClick={() => setActiveReviewFilter('ALL')} label="ALL" count={questions.length} icon={<BarChart3 className="h-3.5 w-3.5" />} activeColor="bg-slate-900 border-slate-900" />
                 <FilterBtn active={activeReviewFilter === 'CORRECT'} onClick={() => setActiveReviewFilter('CORRECT')} label="CORRECT" count={sessionData.correctCount || 0} icon={<CheckCircle2 className="h-3.5 w-3.5" />} activeColor="bg-emerald-600 border-emerald-600" />
                 <FilterBtn active={activeReviewFilter === 'WRONG'} onClick={() => setActiveReviewFilter('WRONG')} label="WRONG" count={sessionData.wrongCount || 0} icon={<XCircle className="h-3.5 w-3.5" />} activeColor="bg-rose-600 border-rose-600" />
              </div>
           </div>

           <TabsContent value="SOLUTIONS" className="space-y-5 md:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {filteredQuestions.length > 0 ? filteredQuestions.map((q: any) => {
                 const ans = sessionData.answers?.[q.index];
                 const isCorrect = ans !== undefined && ['A','B','C','D'][ans] === q.correctAnswer;
                 const isSkipped = ans === undefined || ans === null;
                 return (
                    <Card key={q.id} className="border-none shadow-lg rounded-[1.5rem] overflow-hidden bg-white text-left relative group border border-slate-100">
                       <div className={cn("absolute top-0 left-0 w-1.5 md:w-2 h-full transition-all duration-500", isCorrect ? 'bg-emerald-500' : isSkipped ? 'bg-slate-200' : 'bg-rose-500')} />
                       <CardContent className="p-6 md:p-10 lg:p-14">
                          <div className="flex items-center justify-between mb-6 md:mb-10">
                             <div className="flex items-center gap-3">
                                <span className={cn("h-8 w-8 md:h-12 md:w-12 rounded-lg md:rounded-xl flex items-center justify-center font-black text-xs md:text-xl shadow-inner", isCorrect ? "bg-emerald-50 text-emerald-600" : isSkipped ? "bg-slate-50 text-slate-400" : "bg-rose-50 text-rose-600")}>{q.index + 1}</span>
                                <Badge variant="outline" className="border-slate-100 text-slate-400 uppercase text-[8px] md:text-[10px] font-black px-2 py-0.5 rounded">{(q.subjectId || "GK").toUpperCase()}</Badge>
                             </div>
                             {isCorrect ? (
                                <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] md:text-[10px] uppercase px-3 py-1 rounded-full shadow-sm">CORRECT</Badge>
                             ) : isSkipped ? (
                                <Badge className="bg-slate-50 text-slate-400 border-none font-black text-[8px] md:text-[10px] uppercase px-3 py-1 rounded-full">SKIPPED</Badge>
                             ) : (
                                <Badge className="bg-rose-50 text-rose-600 border-none font-black text-[8px] md:text-[10px] uppercase px-3 py-1 rounded-full shadow-sm">WRONG</Badge>
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
                 <div className="py-24 text-center opacity-30 flex flex-col items-center justify-center space-y-4">
                    <AlertCircle className="h-12 w-12 text-slate-300" />
                    <p className="font-headline font-black text-xl uppercase tracking-widest">No Items Found</p>
                 </div>
              )}
           </TabsContent>

           <TabsContent value="TOPPER" className="animate-in fade-in duration-500">
              <Card className="border-none shadow-2xl rounded-[2rem] bg-white p-6 md:p-10 text-left border border-slate-100 overflow-hidden">
                 <div className="space-y-6">
                    <div className="p-5 md:p-8 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between mb-4">
                       <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-primary" />
                          <p className="text-[10px] md:text-sm font-black uppercase text-slate-500 tracking-tight">Global Registry: <span className="text-[#0F172A]">{merit.total} Aspirants</span></p>
                       </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                       {merit.list?.slice(0, 50).map((r: any, i: number) => {
                          const name = (r.userName && r.userName !== 'Aspirant' && !r.userName.includes('@')) ? r.userName : (r.userEmail?.split('@')[0] || "Aspirant");
                          const isCurrentUser = r.userId === user?.uid;
                          
                          return (
                           <div key={r.id} className={cn("flex items-center justify-between py-4 md:py-6 md:px-8 rounded-xl transition-all duration-300 my-1.5", isCurrentUser ? "bg-primary/5 ring-1 ring-primary/10 shadow-lg" : "hover:bg-slate-50")}>
                              <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
                                 <span className={cn("font-black w-6 md:w-10 text-xs md:text-2xl tabular-nums", i < 3 ? "text-primary" : "text-slate-300")}>#{i+1}</span>
                                 <StudentAvatar profile={{ name, gender: r.gender }} className="h-8 w-8 md:h-14 md:w-14 rounded-lg md:rounded-2xl border border-white shadow-sm" />
                                 <div className="min-w-0 flex-1">
                                    <p className={cn("font-black text-xs md:text-xl uppercase truncate", isCurrentUser ? "text-primary" : "text-[#0F172A]")}>{name} {isCurrentUser && "(You)"}</p>
                                    <p className="text-[7px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score: {(r.score || 0).toFixed(1)}</p>
                                 </div>
                              </div>
                              <div className="shrink-0 ml-4">
                                 <Badge className={cn("border-none text-[9px] md:text-sm font-black px-2.5 md:px-5 py-1 rounded-lg tabular-nums shadow-sm", r.accuracy > 85 ? "bg-emerald-50 text-emerald-600" : r.accuracy > 60 ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500")}>{r.accuracy}%</Badge>
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
         <span className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</span>
         <span className={cn("text-lg md:text-3xl font-headline font-black leading-none tabular-nums tracking-tighter", color)}>{val}</span>
      </div>
   )
}

function FilterBtn({ active, onClick, label, count, icon, activeColor }: any) {
   return (
      <button onClick={onClick} className={cn("px-4 py-2.5 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2.5 whitespace-nowrap active:scale-[0.98] shadow-sm", active ? `${activeColor} text-white shadow-md` : "bg-white border-slate-100 text-slate-400 hover:border-slate-200")}>
         {icon} {label} <span className="opacity-60 ml-0.5">({count})</span>
      </button>
   )
}