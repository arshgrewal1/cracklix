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

/**
 * @fileOverview Test Results Hub v37.0 (Responsive Hardened).
 * FIXED: Banner metrics scaling for 320px devices. Ultra high-density flex logic applied.
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
        console.error("[AUDIT_HYDRATION_ERROR]:", e);
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
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Auditing Session...</p>
     </div>
  );

  if (!sessionData) return (
     <div className="h-screen flex flex-col items-center justify-center text-center bg-white p-6 space-y-6">
        <AlertCircle className="h-12 w-12 text-slate-200" />
        <div className="space-y-2">
           <h2 className="text-2xl font-headline font-black uppercase text-[#0F172A]">Registry Link Missing</h2>
           <p className="text-slate-400 font-medium max-w-xs mx-auto">This attempt data node could not be verified in the master repository.</p>
        </div>
        <Button asChild className="bg-[#0F172A] hover:bg-black text-white rounded-xl h-12 px-10 font-black uppercase text-[10px]"><Link href="/dashboard">Return Dashboard</Link></Button>
     </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-body pb-safe text-left overflow-x-hidden">
      <Navbar />
      <main className="container mx-auto px-2 xs:px-4 md:px-8 py-4 md:py-10 max-w-7xl space-y-6 md:space-y-10">
        
        {/* SCORE BANNER - HIGH DENSITY RESPONSIVE */}
        <div className="bg-[#0B1528] rounded-[1.5rem] md:rounded-[3rem] shadow-5xl overflow-hidden flex flex-col lg:flex-row items-center justify-between p-5 md:p-10 lg:px-14 lg:py-8 gap-5 md:gap-10">
           <div className="flex items-center gap-3 md:gap-10 min-w-0 flex-1 w-full lg:w-auto">
              <div className="h-10 w-10 md:h-18 md:w-18 rounded-xl md:rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-2xl">
                 <Trophy className="h-5 w-5 md:h-10 md:w-10" />
              </div>
              <div className="min-w-0 flex-1 space-y-1 md:space-y-2">
                 <h1 className="text-[12px] xs:text-sm md:text-3xl font-black text-white uppercase tracking-tight truncate leading-tight">{sessionData.mockTitle}</h1>
                 <p className="text-[5px] xs:text-[7px] md:text-[11px] font-bold text-slate-500 uppercase tracking-[0.4em] leading-none">Official Merit Audit Index</p>
              </div>
           </div>

           <div className="flex items-center justify-center gap-2 xs:gap-6 md:gap-12 lg:gap-16 shrink-0 w-full lg:w-auto px-0.5">
              <ResultPill label="SCORE" val={(sessionData.score || 0).toFixed(1)} color={(sessionData.score || 0) < 0 ? "text-rose-400" : "text-primary"} />
              <div className="w-px h-6 md:h-16 bg-white/5" />
              <ResultPill label="RANK" val={`#${merit.rank}`} color="text-white" />
              <div className="w-px h-6 md:h-16 bg-white/5" />
              <ResultPill label="ACCURACY" val={`${sessionData.accuracy || 0}%`} color="text-emerald-400" />
              <div className="w-px h-6 md:h-16 bg-white/5 hidden xs:block" />
              <ResultPill label="PERCENT" val={`${merit.percentile}%`} color="text-blue-400" className="hidden xs:flex" />
           </div>

           <div className="flex gap-4 shrink-0 w-full lg:w-auto">
              <Button asChild className="w-full lg:w-auto h-11 md:h-16 px-6 md:px-12 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[9px] md:text-[12px] tracking-[0.2em] rounded-xl md:rounded-2xl shadow-3xl shadow-primary/20 border-none active:scale-95 transition-all">
                 <Link href={`/mocks/${sessionData.mockId}/instructions`} className="flex items-center justify-center gap-3">
                    <RefreshCw className="h-3.5 w-3.5 md:h-5 md:w-5" /> RE-ATTEMPT
                 </Link>
              </Button>
           </div>
        </div>

        <Tabs defaultValue="SOLUTIONS" className="space-y-6 md:space-y-10">
           <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <TabsList className="bg-white border border-slate-100 p-1 h-11 md:h-14 rounded-xl md:rounded-2xl shadow-sm inline-flex overflow-x-auto no-scrollbar">
                 <TabsTrigger value="SOLUTIONS" className="rounded-lg md:rounded-xl px-4 xs:px-6 md:px-10 font-black uppercase text-[8px] md:text-[11px] h-full data-[state=active]:bg-[#0B1528] data-[state=active]:text-white transition-all whitespace-nowrap">Audit Answers</TabsTrigger>
                 <TabsTrigger value="TOPPER" className="rounded-lg md:rounded-xl px-4 xs:px-6 md:px-10 font-black uppercase text-[8px] md:text-[11px] h-full data-[state=active]:bg-[#0B1528] data-[state=active]:text-white transition-all whitespace-nowrap">State Merit</TabsTrigger>
              </TabsList>
              
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
                 <FilterBtn active={activeReviewFilter === 'ALL'} onClick={() => setActiveReviewFilter('ALL')} label="ALL" count={questions.length} icon={<BarChart3 className="h-4 w-4" />} activeColor="bg-slate-900 border-slate-900" />
                 <FilterBtn active={activeReviewFilter === 'CORRECT'} onClick={() => setActiveReviewFilter('CORRECT')} label="COR" count={sessionData.correctCount || 0} icon={<CheckCircle2 className="h-3 w-3" />} activeColor="bg-emerald-600 border-emerald-600" />
                 <FilterBtn active={activeReviewFilter === 'WRONG'} onClick={() => setActiveReviewFilter('WRONG')} label="ERR" count={sessionData.wrongCount || 0} icon={<XCircle className="h-3 w-3" />} activeColor="bg-rose-600 border-rose-600" />
              </div>
           </div>

           <TabsContent value="SOLUTIONS" className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-3 duration-700">
              {filteredQuestions.length > 0 ? filteredQuestions.map((q) => {
                 const ans = sessionData.answers?.[q.index];
                 const isCorrect = ans !== undefined && ['A','B','C','D'][ans] === q.correctAnswer;
                 const isSkipped = ans === undefined || ans === null;
                 return (
                    <Card key={q.id} className="border-none shadow-xl rounded-[1.5rem] md:rounded-[3rem] overflow-hidden bg-white text-left relative group border border-slate-100">
                       <div className={cn("absolute top-0 left-0 w-1 md:w-2 h-full transition-all duration-500", isCorrect ? 'bg-emerald-500' : isSkipped ? 'bg-slate-200' : 'bg-rose-500')} />
                       <CardContent className="p-5 md:p-14 lg:p-20">
                          <div className="flex items-center justify-between mb-6 md:mb-12">
                             <div className="flex items-center gap-3 md:gap-4">
                                <span className={cn("h-8 w-8 md:h-14 md:w-14 rounded-lg md:rounded-2xl flex items-center justify-center font-black text-xs md:text-2xl shadow-inner", isCorrect ? "bg-emerald-50 text-emerald-600" : isSkipped ? "bg-slate-50 text-slate-400" : "bg-rose-50 text-rose-600")}>{q.index + 1}</span>
                                <Badge variant="outline" className="border-slate-100 text-slate-400 uppercase text-[8px] md:text-[11px] font-black px-2 py-0.5 rounded-md">{(q.subjectId || "GK").toUpperCase()}</Badge>
                             </div>
                             {isCorrect ? (
                                <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] md:text-[11px] uppercase px-3 py-1 rounded-full shadow-sm">CORRECT</Badge>
                             ) : isSkipped ? (
                                <Badge className="bg-slate-50 text-slate-400 border-none font-black text-[8px] md:text-[11px] uppercase px-3 py-1 rounded-full">SKIPPED</Badge>
                             ) : (
                                <Badge className="bg-rose-50 text-rose-600 border-none font-black text-[8px] md:text-[11px] uppercase px-3 py-1 rounded-full shadow-sm">INCORRECT</Badge>
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
                 <div className="py-24 text-center opacity-20 flex flex-col items-center gap-6">
                    <AlertCircle className="h-12 w-12 text-slate-300" />
                    <p className="font-headline font-black text-xl uppercase tracking-[0.4em]">No Results Filtered</p>
                 </div>
              )}
           </TabsContent>

           <TabsContent value="TOPPER" className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-3 duration-700">
              <Card className="border-none shadow-3xl rounded-[2rem] md:rounded-[4rem] bg-white p-5 md:p-14 text-left border border-slate-100">
                 <div className="space-y-6 md:space-y-10">
                    <div className="p-4 md:p-8 bg-slate-50 rounded-xl md:rounded-[2.5rem] border border-slate-100 flex items-center justify-between mb-6 md:mb-12">
                       <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-primary" />
                          <p className="text-[10px] md:text-[14px] font-black uppercase text-slate-500 tracking-widest">Global Node: <span className="text-[#0F172A]">{merit.total} Active Aspirants</span></p>
                       </div>
                    </div>

                    <div className="divide-y divide-slate-50">
                       {merit.list?.slice(0, 100).map((r: any, i: number) => {
                          const name = (r.userName && r.userName !== 'Aspirant' && !r.userName.includes('@')) ? r.userName : (r.userEmail?.split('@')[0] || "Aspirant");
                          const isCurrentUser = r.userId === user?.uid;
                          
                          return (
                           <div key={r.id} className={cn("flex items-center justify-between py-3 md:py-6 md:px-8 rounded-xl md:rounded-[2rem] transition-all duration-500", isCurrentUser ? "bg-primary/5 ring-2 ring-primary/10 shadow-xl" : "hover:bg-slate-50/50")}>
                              <div className="flex items-center gap-3 xs:gap-6 md:gap-10 flex-1 min-w-0">
                                 <span className={cn("font-black w-6 xs:w-8 md:w-12 text-[10px] xs:text-sm md:text-3xl leading-none", i < 3 ? "text-primary" : "text-slate-200")}>#{i+1}</span>
                                 <StudentAvatar profile={{ name, gender: r.gender }} className="h-9 w-9 md:h-16 md:w-16 rounded-lg md:rounded-2xl shadow-md" />
                                 <div className="min-w-0 flex-1 space-y-0.5 md:space-y-1">
                                    <p className={cn("font-black text-[11px] xs:text-sm md:text-2xl uppercase truncate tracking-tight", isCurrentUser ? "text-primary" : "text-[#0F172A]")}>{name} {isCurrentUser && "(You)"}</p>
                                    <p className="text-[6px] xs:text-[8px] md:text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em]">Score: {(r.score || 0).toFixed(1)}</p>
                                 </div>
                              </div>
                              <div className="flex gap-2 xs:gap-6 items-center shrink-0">
                                 <Badge className={cn("border-none text-[8px] xs:text-[9px] md:text-[14px] font-black px-2 md:px-6 md:py-2 rounded-lg md:rounded-xl shadow-sm tabular-nums", r.accuracy > 85 ? "bg-emerald-50 text-emerald-600" : r.accuracy > 60 ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-500")}>{r.accuracy}%</Badge>
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
      <div className={cn("flex flex-col items-center md:items-start gap-0.5 xs:gap-1.5", className)}>
         <span className="text-[5px] xs:text-[7px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] leading-none">{label}</span>
         <span className={cn("text-[10px] xs:text-lg md:text-4xl lg:text-5xl font-headline font-black leading-none tabular-nums tracking-tighter", color)}>{val}</span>
      </div>
   )
}

function FilterBtn({ active, onClick, label, count, icon, activeColor }: any) {
   return (
      <button onClick={onClick} className={cn("px-3 xs:px-5 md:px-8 py-2 md:py-4 rounded-lg md:rounded-2xl text-[7px] md:text-[11px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 xs:gap-3 whitespace-nowrap active:scale-95 shadow-sm", active ? `${activeColor} text-white shadow-md` : "bg-white border-slate-100 text-slate-400 hover:border-slate-200")}>
         {icon} {label} <span className="opacity-50 text-[6px] md:text-[10px]">({count})</span>
      </button>
   )
}