
"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CheckCircle2, 
  Target, 
  Zap, 
  Loader2, 
  ShieldCheck,
  BarChart3,
  Trophy,
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

/**
 * @fileOverview Test Results Hub v33.0 (Ultra-Compact).
 * UPDATED: Renamed button to RE-ATTEMPT.
 * FIXED: Reduced padding and scaling across the entire page to minimize scrolling.
 */

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>}>
      <ResultContent />
    </Suspense>
  )
}

function ResultContent() {
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

  const resultRef = useMemo(() => (db && user && mockId ? doc(db, "results", `${user.uid}_${mockId}`) : null), [db, user, mockId]);
  const { data: sessionData, loading: resultLoading } = useDoc<any>(resultRef);

  const globalResultsQuery = useMemo(() => {
    if (!db || !mockId) return null
    return query(collection(db, "results"), where("mockId", "==", mockId), limit(300))
  }, [db, mockId])

  const { data: rawGlobalResults } = useCollection<any>(globalResultsQuery)

  const merit = useMemo(() => {
     if (!rawGlobalResults || !sessionData) return { rank: '?', total: 0, percentile: 0, list: [] };
     
     const uniqueMap = new Map();
     [...rawGlobalResults].sort((a, b) => (b.score || 0) - (a.score || 0)).forEach(r => {
        if (!uniqueMap.has(r.userId) || uniqueMap.get(r.userId).score < r.score) {
           uniqueMap.set(r.userId, r);
        }
     });
     const meritList = Array.from(uniqueMap.values()).sort((a,b) => b.score - a.score);
     
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
          const questionIds = mData.questionIds || []
          if (questionIds.length > 0) {
            const fetched: any[] = []
            const chunks = []
            for (let i = 0; i < questionIds.length; i += 30) { chunks.push(questionIds.slice(i, i + 30)) }
            const chunkSnaps = await Promise.all(chunks.map(chunk => getDocs(query(collection(db, "questions"), where(documentId(), "in", chunk)))))
            chunkSnaps.forEach(snap => snap.docs.forEach(d => fetched.push({ ...d.data(), id: d.id })))
            setQuestions(questionIds.map(id => fetched.find(q => q.id === id)).filter(Boolean))
          }
        }
      } catch (e) {
        console.error("[QUESTION_HYDRATION_ERROR]:", e);
      } finally { 
        setLoadingQuestions(false) 
      }
    }
    loadQuestions()
  }, [db, mockId]);

  const filteredQuestions = useMemo(() => {
     if (!sessionData) return [];
     return questions.map((q, i) => ({ ...q, index: i })).filter((q) => {
        const ans = sessionData.answers?.[q.index];
        const isCorrect = ans !== undefined && ['A','B','C','D'][ans] === q.correctAnswer;
        if (activeReviewFilter === 'ALL') return true;
        if (activeReviewFilter === 'CORRECT') return isCorrect;
        if (activeReviewFilter === 'WRONG') return ans !== undefined && !isCorrect;
        if (activeReviewFilter === 'SKIPPED') return ans === undefined || ans === null;
        return true;
     });
  }, [questions, sessionData, activeReviewFilter]);

  if (resultLoading || (loadingQuestions && questions.length === 0)) return (
     <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-6">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Auditing Session Node...</p>
     </div>
  );

  if (!sessionData) return (
     <div className="h-screen flex flex-col items-center justify-center text-center bg-white p-6 space-y-6">
        <AlertCircle className="h-12 w-12 text-slate-200" />
        <div className="space-y-2">
           <h2 className="text-2xl font-headline font-black uppercase text-[#0F172A]">Registry Node Missing</h2>
           <p className="text-slate-400 font-medium max-w-xs mx-auto">The requested attempt data could not be verified in the master repository.</p>
        </div>
        <Button asChild className="bg-[#0F172A] hover:bg-black text-white rounded-xl h-12 px-10 font-black uppercase text-[10px]"><Link href="/dashboard">Return Dashboard</Link></Button>
     </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-body pb-safe text-left">
      <Navbar />
      <main className="container mx-auto px-2 md:px-6 py-4 md:py-8 max-w-7xl space-y-4 md:space-y-6">
        
        {/* SCORE BANNER - ULTRA COMPACT */}
        <div className="bg-[#0B1528] rounded-xl shadow-2xl overflow-hidden flex flex-col lg:flex-row items-center justify-between p-3 md:p-5 lg:px-8 lg:py-4 gap-4 md:gap-6">
           <div className="flex items-center gap-3 md:gap-6 min-w-0 flex-1 w-full lg:w-auto">
              <div className="h-8 w-8 md:h-10 md:w-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary shrink-0 shadow-lg">
                 <Trophy className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div className="min-w-0 flex-1">
                 <h1 className="text-xs md:text-lg font-black text-white uppercase tracking-tight truncate">{sessionData.mockTitle}</h1>
                 <p className="text-[7px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Official Audit Score Index</p>
              </div>
           </div>

           <div className="flex items-center justify-center gap-5 md:gap-8 lg:gap-10 shrink-0 w-full lg:w-auto px-2">
              <ResultPill label="SCORE" val={(sessionData.score || 0).toFixed(1)} color={(sessionData.score || 0) < 0 ? "text-rose-400" : "text-primary"} />
              <div className="w-px h-6 md:h-8 bg-white/10" />
              <ResultPill label="RANK" val={`#${merit.rank}`} color="text-white" />
              <div className="w-px h-6 md:h-8 bg-white/10" />
              <ResultPill label="ACCURACY" val={`${sessionData.accuracy || 0}%`} color="text-emerald-400" />
              <div className="w-px h-6 md:h-8 bg-white/10 hidden xs:block" />
              <ResultPill label="PERCENTILE" val={`${merit.percentile}%`} color="text-blue-400" className="hidden xs:flex" />
           </div>

           <div className="flex gap-3 shrink-0 w-full lg:w-auto">
              <Button asChild className="w-full lg:w-auto h-9 md:h-11 px-6 bg-primary hover:bg-orange-600 text-white font-black uppercase text-[9px] tracking-widest rounded-lg shadow-lg border-none active:scale-95 transition-all">
                 <Link href={`/mocks/${sessionData.mockId}/instructions`} className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5" /> RE-ATTEMPT
                 </Link>
              </Button>
           </div>
        </div>

        <Tabs defaultValue="SOLUTIONS" className="space-y-4 md:space-y-6">
           <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <TabsList className="bg-white border border-slate-100 p-1 h-10 md:h-12 rounded-xl shadow-sm inline-flex">
                 <TabsTrigger value="SOLUTIONS" className="rounded-lg px-6 font-black uppercase text-[8px] md:text-[10px] h-full data-[state=active]:bg-[#0B1528] data-[state=active]:text-white transition-all whitespace-nowrap">Check Answers</TabsTrigger>
                 <TabsTrigger value="TOPPER" className="rounded-lg px-6 font-black uppercase text-[8px] md:text-[10px] h-full data-[state=active]:bg-[#0B1528] data-[state=active]:text-white transition-all whitespace-nowrap">State Ranking</TabsTrigger>
              </TabsList>
              
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                 <FilterBtn active={activeReviewFilter === 'ALL'} onClick={() => setActiveReviewFilter('ALL')} label="ALL" count={questions.length} icon={<BarChart3 className="h-3 w-3" />} activeColor="bg-slate-900 border-slate-900" />
                 <FilterBtn active={activeReviewFilter === 'CORRECT'} onClick={() => setActiveReviewFilter('CORRECT')} label="CORRECT" count={sessionData.correctCount || 0} icon={<CheckCircle2 className="h-3 w-3" />} activeColor="bg-emerald-600 border-emerald-600" />
                 <FilterBtn active={activeReviewFilter === 'WRONG'} onClick={() => setActiveReviewFilter('WRONG')} label="WRONG" count={sessionData.wrongCount || 0} icon={<XCircle className="h-3 w-3" />} activeColor="bg-rose-600 border-rose-600" />
              </div>
           </div>

           <TabsContent value="SOLUTIONS" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              {filteredQuestions.length > 0 ? filteredQuestions.map((q) => {
                 const ans = sessionData.answers?.[q.index];
                 const isCorrect = ans !== undefined && ['A','B','C','D'][ans] === q.correctAnswer;
                 const isSkipped = ans === undefined || ans === null;
                 return (
                    <Card key={q.id} className="border-none shadow-sm rounded-xl md:rounded-[2rem] overflow-hidden bg-white text-left relative group">
                       <div className={cn("absolute top-0 left-0 w-1.5 h-full transition-all", isCorrect ? 'bg-emerald-500' : isSkipped ? 'bg-slate-200' : 'bg-rose-500')} />
                       <CardContent className="p-4 md:p-8 lg:p-10">
                          <div className="flex items-center justify-between mb-4 md:mb-6">
                             <div className="flex items-center gap-3">
                                <span className={cn("h-8 w-8 md:h-10 md:w-10 rounded-lg flex items-center justify-center font-black text-sm md:text-lg shadow-inner", isCorrect ? "bg-emerald-50 text-emerald-600" : isSkipped ? "bg-slate-50 text-slate-400" : "bg-rose-50 text-rose-600")}>{q.index + 1}</span>
                                <Badge variant="outline" className="border-slate-100 text-slate-400 uppercase text-[8px] font-black px-2 py-0.5 rounded shadow-none">{(q.subjectId || "GK").toUpperCase()}</Badge>
                             </div>
                             {isCorrect ? (
                                <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] md:text-[9px] uppercase px-3 py-1 rounded-full">CORRECT</Badge>
                             ) : isSkipped ? (
                                <Badge className="bg-slate-100 text-slate-400 border-none font-black text-[8px] md:text-[9px] uppercase px-3 py-1 rounded-full">SKIPPED</Badge>
                             ) : (
                                <Badge className="bg-rose-50 text-rose-600 border-none font-black text-[8px] md:text-[9px] uppercase px-3 py-1 rounded-full">INCORRECT</Badge>
                             )}
                          </div>
                          <QuestionRenderer 
                            question={q} 
                            language={mockData?.languageMode || 'ENGLISH_PUNJABI'} 
                            showSolution={true} 
                            selectedAnswer={ans} 
                            className="p-0 border-none shadow-none" 
                          />
                       </CardContent>
                    </Card>
                 )
              }) : (
                 <div className="py-20 text-center opacity-20 flex flex-col items-center gap-4">
                    <AlertCircle className="h-10 w-10" />
                    <p className="font-headline font-black text-base uppercase tracking-widest">No nodes match filter</p>
                 </div>
              )}
           </TabsContent>

           <TabsContent value="TOPPER" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <Card className="border-none shadow-lg rounded-[2rem] bg-white p-5 md:p-8 text-left">
                 <div className="space-y-4">
                    <div className="p-3 md:p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between mb-4 md:mb-6">
                       <div className="flex items-center gap-3">
                          <Users className="h-4 w-4 text-slate-400" />
                          <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-500">Live Aspirant Density: <span className="text-[#0F172A]">{merit.total} Verified Nodes</span></p>
                       </div>
                    </div>

                    <div className="divide-y divide-slate-50">
                       {merit.list?.slice(0, 100).map((r: any, i: number) => {
                          const name = (r.userName && r.userName !== 'Aspirant' && !r.userName.includes('@')) ? r.userName : (r.userEmail?.split('@')[0] || "Student");
                          const isCurrentUser = r.userId === user?.uid;
                          
                          return (
                           <div key={r.id} className={cn("flex items-center justify-between py-3 md:px-4 rounded-xl transition-all", isCurrentUser ? "bg-primary/5 ring-1 ring-primary/10" : "hover:bg-slate-50/50")}>
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                 <span className={cn("font-black w-8 text-xs md:text-lg", i < 3 ? "text-primary" : "text-slate-300")}>#{i+1}</span>
                                 <StudentAvatar profile={{ name, gender: r.gender }} className="h-8 w-8 md:h-10 md:w-10 rounded-lg" />
                                 <div className="min-w-0">
                                    <p className={cn("font-black text-xs md:text-base uppercase truncate", isCurrentUser ? "text-primary" : "text-[#0F172A]")}>{name} {isCurrentUser && "(You)"}</p>
                                    <p className="text-[7px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Score: {(r.score || 0).toFixed(1)}</p>
                                 </div>
                              </div>
                              <div className="flex gap-4 items-center shrink-0">
                                 <Badge className={cn("border-none text-[8px] md:text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm", r.accuracy > 85 ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500")}>{r.accuracy}%</Badge>
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
      <div className={cn("flex flex-col items-center md:items-start gap-0.5", className)}>
         <span className="text-[6px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">{label}</span>
         <span className={cn("text-xs md:text-2xl font-headline font-black leading-none tabular-nums", color)}>{val}</span>
      </div>
   )
}

function FilterBtn({ active, onClick, label, count, icon, activeColor }: any) {
   return (
      <button onClick={onClick} className={cn("px-4 py-2 rounded-lg text-[7px] md:text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 shadow-sm", active ? `${activeColor} text-white shadow-md` : "bg-white border-slate-100 text-slate-400 hover:border-slate-200")}>
         {icon} {label} <span className="opacity-60 text-[6px] md:text-[8px]">({count})</span>
      </button>
   )
}
