
"use client"

import { useState, useMemo, useEffect } from "react"
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
  BrainCircuit, 
  ShieldCheck,
  BarChart3,
  Trophy,
  RefreshCw,
  Share2,
  X,
  Clock,
  Printer,
  AlertCircle
} from "lucide-react"
import { useUser, useFirestore, useCollection } from "@/firebase"
import { collection, query, where, doc, getDoc, documentId, getDocs, limit, orderBy } from "firebase/firestore"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import StudentAvatar from "@/components/brand/StudentAvatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

/**
 * @fileOverview Test Results Hub v10.0.
 * FIXED: Removed server-side orderBy to bypass composite index requirements.
 * PERFORMANCE: Sorting results client-side for immediate rendering.
 */

export default function ResultPage() {
  const params = useParams()
  const router = useRouter()
  const mockId = params.id as string
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()

  const [questions, setQuestions] = useState<any[]>([])
  const [mockData, setMockData] = useState<any>(null)
  const [loadingContent, setLoadingContent] = useState(true)
  const [activeReviewFilter, setActiveReviewFilter] = useState<'ALL' | 'CORRECT' | 'WRONG' | 'SKIPPED'>('ALL')
  const [isShareOpen, setIsShareOpen] = useState(false)

  // USER SESSION LISTENER
  const resultsQuery = useMemo(() => {
    if (!db || !user) return null
    return query(collection(db, "results"), where("userId", "==", user.uid), where("mockId", "==", mockId), limit(1))
  }, [db, user, mockId])

  const { data: rawResultDocs, loading: resultsLoading } = useCollection<any>(resultsQuery)
  
  // GLOBAL MERIT LISTENER (PERFORMANCE BYPASS: Client-side sorting)
  const globalResultsQuery = useMemo(() => {
    if (!db || !mockId) return null
    // REMOVED orderBy("score", "desc") to prevent index error
    return query(collection(db, "results"), where("mockId", "==", mockId), limit(100))
  }, [db, mockId])

  const { data: rawGlobalResults } = useCollection<any>(globalResultsQuery)

  const sessionData = useMemo(() => {
    if (!rawResultDocs || rawResultDocs.length === 0) return null
    return rawResultDocs[0]
  }, [rawResultDocs])

  const sortedGlobalResults = useMemo(() => {
    if (!rawGlobalResults) return [];
    return [...rawGlobalResults].sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [rawGlobalResults]);

  const merit = useMemo(() => {
     if (!sortedGlobalResults || sortedGlobalResults.length === 0 || !sessionData) {
        return { rank: '?', total: 0, percentile: 0, topper: null };
     }
     const rank = sortedGlobalResults.findIndex((r: any) => r.userId === user?.uid) + 1 || 1;
     const total = sortedGlobalResults.length;
     const percentile = Math.round(((total - rank) / (total || 1)) * 1000) / 10;
     const topper = sortedGlobalResults[0];
     return { rank, total, percentile, topper };
  }, [sortedGlobalResults, sessionData, user]);

  useEffect(() => {
    async function loadQuestions() {
      if (!db || !sessionData || !mockId) {
        if (!resultsLoading && !sessionData) setLoadingContent(false);
        return;
      }

      setLoadingContent(true)
      try {
        const mockSnap = await getDoc(doc(db, "mocks", mockId))
        if (mockSnap.exists()) {
          const mData = mockSnap.data();
          setMockData(mData);
          
          const questionIds = mData.questionIds || []
          const chunks = []
          for (let i = 0; i < questionIds.length; i += 30) {
            chunks.push(questionIds.slice(i, i + 30))
          }

          const chunkSnaps = await Promise.all(
            chunks.map(chunk => getDocs(query(collection(db, "questions"), where(documentId(), "in", chunk))))
          )

          const fetchedQuestions: any[] = []
          chunkSnaps.forEach(snap => snap.docs.forEach(d => fetchedQuestions.push({ ...d.data(), id: d.id })))
          setQuestions(questionIds.map(id => fetchedQuestions.find(q => q.id === id)).filter(Boolean))
        }
      } finally {
        setLoadingContent(false)
      }
    }
    loadQuestions()
  }, [db, sessionData, mockId, resultsLoading])

  const filteredQuestions = useMemo(() => {
     return questions.map((q, i) => ({ ...q, index: i })).filter((q) => {
        const ans = sessionData?.answers?.[q.index];
        if (activeReviewFilter === 'ALL') return true;
        if (activeReviewFilter === 'CORRECT') return ans !== undefined && ['A','B','C','D'][ans] === q.correctAnswer;
        if (activeReviewFilter === 'WRONG') return ans !== undefined && ['A','B','C','D'][ans] !== q.correctAnswer;
        if (activeReviewFilter === 'SKIPPED') return ans === undefined || ans === null;
        return true;
     });
  }, [questions, sessionData, activeReviewFilter]);

  if (resultsLoading || loadingContent) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>

  if (!sessionData) return <div className="h-screen flex items-center justify-center text-slate-400 font-black uppercase text-xs">Registry Node Missing</div>

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-body pb-safe text-left print:bg-white print:pb-0">
      <Navbar />
      <main className="container mx-auto px-4 md:px-6 py-6 md:py-12 max-w-7xl space-y-8 md:space-y-12">
        
        <Card className="border-none shadow-5xl rounded-[2.5rem] bg-[#0B1528] text-white overflow-hidden relative">
           <CardContent className="p-8 md:p-14 lg:p-16 space-y-10 relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                 <div className="space-y-6 flex-1 text-left">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-headline font-black uppercase leading-[0.95] tracking-tight">{sessionData.mockTitle}</h1>
                    <div className="flex flex-wrap gap-3">
                       <Button asChild className="bg-primary hover:bg-orange-600 text-white font-black uppercase text-[10px] tracking-widest h-12 px-6 rounded-xl shadow-xl">
                          <Link href={`/mocks/${mockId}/instructions`}><RefreshCw className="h-4 w-4 mr-2" /> Re-attempt</Link>
                       </Button>
                       <Button onClick={() => setIsShareOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest h-12 px-6 rounded-xl shadow-xl">
                          <Share2 className="h-4 w-4 mr-2" /> Share Result
                       </Button>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-8 bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 shadow-5xl">
                    <div className="text-center space-y-1">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">RANK</p>
                       <p className="text-3xl md:text-5xl font-headline font-black text-primary leading-none">#{merit.rank}</p>
                    </div>
                    <div className="h-16 w-px bg-white/10" />
                    <div className="text-center space-y-1">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">PERCENTILE</p>
                       <p className="text-3xl md:text-5xl font-headline font-black text-emerald-400 leading-none">{merit.percentile}%</p>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pt-10 border-t border-white/5">
                 <div className="text-left space-y-1"><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">SCORE</p><p className="text-3xl md:text-5xl font-headline font-black text-primary">{Number(sessionData.score).toFixed(1)}</p></div>
                 <div className="text-left space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ACCURACY</p><p className="text-3xl md:text-5xl font-headline font-black text-emerald-400">{sessionData.accuracy}%</p></div>
                 <div className="text-left space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TOTAL Qs</p><p className="text-3xl md:text-5xl font-headline font-black text-blue-400">{sessionData.totalQuestions}</p></div>
                 <div className="text-left space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TIME TAKEN</p><p className="text-3xl md:text-5xl font-headline font-black text-white">{Math.floor(sessionData.timeTaken / 60)}m</p></div>
              </div>
           </CardContent>
        </Card>

        <Tabs defaultValue="SOLUTIONS" className="space-y-8">
           <TabsList className="bg-white border border-slate-100 p-1 h-14 rounded-2xl shadow-sm inline-flex">
              <TabsTrigger value="SOLUTIONS" className="rounded-xl px-8 font-black uppercase text-[10px] gap-2 h-full data-[state=active]:bg-[#0B1528] data-[state=active]:text-white">Answer Review</TabsTrigger>
              <TabsTrigger value="TOPPER" className="rounded-xl px-8 font-black uppercase text-[10px] gap-2 h-full data-[state=active]:bg-[#0B1528] data-[state=active]:text-white">Top 100 Merit</TabsTrigger>
           </TabsList>

           <TabsContent value="SOLUTIONS" className="space-y-6">
              <div className="flex gap-2 pb-4 overflow-x-auto no-scrollbar">
                 {['ALL', 'CORRECT', 'WRONG', 'SKIPPED'].map((f: any) => (
                    <button key={f} onClick={() => setActiveReviewFilter(f)} className={cn("px-6 py-2 rounded-xl text-[9px] font-black uppercase border-2 transition-all", activeReviewFilter === f ? "bg-primary border-primary text-white" : "bg-white border-slate-100 text-slate-400")}>{f}</button>
                 ))}
              </div>
              <div className="grid grid-cols-1 gap-6">
                 {filteredQuestions.map((q) => {
                    const ans = sessionData.answers?.[q.index];
                    const isCorrect = ans !== undefined && ['A','B','C','D'][ans] === q.correctAnswer;
                    return (
                       <Card key={q.id} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white text-left relative">
                          <div className={cn("absolute top-0 left-0 w-2 h-full", isCorrect ? 'bg-emerald-500' : ans === undefined ? 'bg-slate-200' : 'bg-rose-500')} />
                          <CardContent className="p-8 md:p-10">
                             <div className="flex items-center gap-6 mb-8">
                                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner", isCorrect ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-300")}>{q.index + 1}</div>
                                <Badge variant="outline" className="border-slate-100 text-slate-400 uppercase text-[8px] font-black">{q.subjectId}</Badge>
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
                 })}
              </div>
           </TabsContent>

           <TabsContent value="TOPPER" className="space-y-4">
              <Card className="border-none shadow-3xl rounded-[3rem] bg-white overflow-hidden p-8">
                 <div className="space-y-4">
                    {sortedGlobalResults.slice(0, 10).map((r: any, i: number) => (
                       <div key={r.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-4">
                             <span className="font-black text-slate-300 w-6">#{i+1}</span>
                             <p className="font-bold text-[#0F172A] uppercase">{r.userName}</p>
                          </div>
                          <div className="flex gap-8 items-center">
                             <span className="text-xs font-black text-primary">{r.score?.toFixed(1) || '0.0'} PTS</span>
                             <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px]">{r.accuracy}%</Badge>
                          </div>
                       </div>
                    ))}
                 </div>
              </Card>
           </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}
