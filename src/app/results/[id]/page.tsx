
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
  ChevronDown,
  ChevronUp,
  BarChart3,
  TrendingUp,
  Trophy,
  Download,
  Award,
  Gem,
  ArrowRight,
  Clock,
  XCircle,
  AlertCircle,
  BookOpen
} from "lucide-react"
import { useUser, useFirestore, useCollection } from "@/firebase"
import { collection, query, where, doc, getDoc, documentId, getDocs } from "firebase/firestore"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import StudentAvatar from "@/components/brand/StudentAvatar"

/**
 * @fileOverview Test Results Hub v5.5 (Production Hardened).
 * FIXED: Null reference guard for sessionData.
 * FIXED: val.includes type error in MetricCard.
 * UPDATED: Solution labeling and fluid typography.
 */

export default function ResultPage() {
  const params = useParams()
  const router = useRouter()
  const mockId = params.id as string
  const db = useFirestore()
  const { user, profile } = useUser()
  const { toast } = useToast()

  const [questions, setQuestions] = useState<any[]>([])
  const [mockData, setMockData] = useState<any>(null)
  const [loadingContent, setLoadingContent] = useState(true)
  const [activeReviewFilter, setActiveReviewFilter] = useState<'ALL' | 'CORRECT' | 'WRONG' | 'SKIPPED'>('ALL')
  const [expandedQs, setExpandedQs] = useState<Record<number, boolean>>({})

  const resultsQuery = useMemo(() => {
    if (!db || !user) return null
    return query(collection(db, "results"), where("userId", "==", user.uid), where("mockId", "==", mockId))
  }, [db, user, mockId])

  const { data: rawResultDocs, loading: resultsLoading } = useCollection<any>(resultsQuery)
  
  const globalResultsQuery = useMemo(() => {
    if (!db || !mockId) return null
    return query(collection(db, "results"), where("mockId", "==", mockId))
  }, [db, mockId])

  const { data: rawGlobalResults } = useCollection<any>(globalResultsQuery)

  const sessionData = useMemo(() => {
    if (!rawResultDocs || rawResultDocs.length === 0) return null
    return [...rawResultDocs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
  }, [rawResultDocs])

  const merit = useMemo(() => {
     if (!rawGlobalResults || !sessionData) return { rank: '?', total: 0, percentile: 0, topper: null };
     const sorted = [...rawGlobalResults].sort((a, b) => (b.score || 0) - (a.score || 0));
     const rank = sorted.findIndex((r: any) => r.userId === user?.uid) + 1 || 1;
     const total = sorted.length;
     const percentile = Math.round(((total - rank) / (total || 1)) * 1000) / 10;
     const topper = sorted[0];
     return { rank, total, percentile, topper };
  }, [rawGlobalResults, sessionData, user]);

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
          const fetchedQuestions: any[] = []
          
          const chunks = []
          for (let i = 0; i < questionIds.length; i += 30) {
            chunks.push(questionIds.slice(i, i + 30))
          }

          const chunkSnaps = await Promise.all(
            chunks.map(chunk => getDocs(query(collection(db, "questions"), where(documentId(), "in", chunk))))
          )

          chunkSnaps.forEach(snap => {
            snap.docs.forEach(d => fetchedQuestions.push({ ...d.data(), id: d.id }))
          })

          setQuestions(questionIds.map(id => fetchedQuestions.find(q => q.id === id)).filter(Boolean))
        }
      } catch (e) {
        toast({ variant: "destructive", title: "Content Missing" })
      } finally {
        setLoadingContent(false)
      }
    }
    loadQuestions()
  }, [db, sessionData, mockId, toast, resultsLoading])

  const sectionalAnalysis = useMemo(() => {
     if (!questions.length || !sessionData) return [];
     const sections: Record<string, { total: number, correct: number, wrong: number, skipped: number }> = {};
     
     questions.forEach((q, i) => {
        const sid = q.sectionId || 'General Hub';
        if (!sections[sid]) sections[sid] = { total: 0, correct: 0, wrong: 0, skipped: 0 };
        sections[sid].total++;
        
        const studentAns = sessionData.answers?.[i];
        if (studentAns === undefined || studentAns === null) {
           sections[sid].skipped++;
        } else {
           const isCorrect = ['A','B','C','D'][studentAns] === q.correctAnswer;
           if (isCorrect) sections[sid].correct++;
           else sections[sid].wrong++;
        }
     });

     return Object.entries(sections).map(([name, data]) => ({
        name,
        ...data,
        accuracy: Math.round((data.correct / (data.correct + data.wrong || 1)) * 100),
        score: data.correct - (data.wrong * (mockData?.negativeMarks || 0.25))
     }));
  }, [questions, sessionData, mockData]);

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

  if (resultsLoading || loadingContent) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-6">
       <Loader2 className="h-12 w-12 text-primary animate-spin" />
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Auditing performance...</p>
    </div>
  )

  if (!sessionData) return (
     <div className="h-screen flex flex-col items-center justify-center text-slate-400 gap-4">
        <AlertCircle className="h-12 w-12 opacity-10" />
        <p className="font-black uppercase tracking-widest text-xs">Result node not found.</p>
        <Button asChild variant="outline" className="rounded-xl border-slate-200">
           <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
     </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-body pb-safe text-left">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-6 py-6 md:py-12 max-w-7xl space-y-8 md:space-y-12">
        
        {/* HERO HUB */}
        <div className="flex flex-col lg:flex-row gap-6 md:gap-10">
           <Card className="flex-1 border-none shadow-5xl rounded-[2.5rem] bg-[#0B1528] text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform duration-1000"><Trophy className="h-96 w-96" /></div>
              <CardContent className="p-6 md:p-14 lg:p-20 space-y-8 md:space-y-12 relative z-10">
                 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                    <div className="space-y-4 max-w-full lg:max-w-[60%]">
                       <div className="flex items-center gap-4">
                          <ShieldCheck className="h-5 w-5 text-primary" />
                          <Badge className="bg-primary/20 text-primary border-none px-4 py-1.5 rounded-full font-black uppercase text-[9px] tracking-[0.2em] shadow-xl">Audit Finalized</Badge>
                       </div>
                       <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-headline font-black uppercase leading-[1.1] tracking-tight break-words">
                          {sessionData.mockTitle}
                       </h1>
                    </div>
                    
                    <div className="flex items-center gap-4 md:gap-8 bg-white/5 backdrop-blur-3xl p-5 md:p-10 rounded-[2rem] border border-white/10 shadow-5xl group/merit w-full lg:w-auto">
                       <div className="flex-1 text-center space-y-1">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">RANK</p>
                          <p className="text-2xl md:text-5xl font-headline font-black text-primary leading-none tabular-nums mt-1">#{merit.rank}</p>
                          <p className="text-[9px] font-black text-slate-500 uppercase mt-1">OF {merit.total}</p>
                       </div>
                       <div className="h-12 md:h-20 w-px bg-white/10 shrink-0" />
                       <div className="flex-1 text-center space-y-1">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">PERCENTILE</p>
                          <p className="text-2xl md:text-5xl font-headline font-black text-emerald-400 leading-none tabular-nums mt-1">{merit.percentile}</p>
                          <p className="text-[9px] font-black text-slate-500 uppercase mt-1">EFFICIENCY</p>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-8 pt-8 border-t border-white/5">
                    <MetricCard label="SCORE" val={`${(sessionData.score || 0).toFixed(1)}`} sub={`/${sessionData.totalQuestions}`} color="text-primary" />
                    <MetricCard label="ACCURACY" val={`${sessionData.accuracy || 0}%`} sub="Precision" color="text-emerald-400" />
                    <MetricCard label="CORRECT" val={Math.floor(sessionData.score || 0)} sub="Successful" color="text-emerald-400" />
                    <MetricCard label="TIME" val={`${Math.floor((sessionData.timeTaken || 0) / 60)}m`} sub="Attempt" color="text-blue-400" />
                 </div>
              </CardContent>
           </Card>

           <div className="w-full lg:w-80 flex flex-col gap-6">
              <Card className="border-none shadow-3xl rounded-[2.5rem] bg-white p-6 md:p-8 space-y-6 border border-slate-100">
                 <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-primary" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Tactical Actions</h3>
                 </div>
                 <div className="space-y-4">
                    <Button onClick={() => window.print()} className="w-full h-12 md:h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg gap-2 border-none">
                       <Download className="h-4 w-4" /> Download Report
                    </Button>
                    <Button variant="outline" asChild className="w-full h-12 md:h-14 border-2 border-slate-100 hover:border-primary hover:text-primary rounded-xl font-black uppercase text-[10px] tracking-[0.2em] text-slate-600">
                       <Link href={`/mocks/${mockId}/attempt`}><TrendingUp className="h-4 w-4 mr-2" /> Re-Attempt</Link>
                    </Button>
                 </div>
              </Card>

              {profile?.status === 'Free' && (
                <div className="bg-primary rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-4xl cursor-pointer">
                   <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-125 transition-transform duration-[2s]"><Award className="h-48 w-48" /></div>
                   <div className="relative z-10 space-y-3 text-left">
                      <h4 className="text-xl font-headline font-black uppercase leading-[1.1]">Elite Cohort</h4>
                      <p className="text-white/70 text-[9px] font-bold uppercase tracking-widest">Unlock solutions and all state ranks.</p>
                      <Button asChild className="w-full h-11 mt-2 bg-white text-primary hover:bg-slate-50 font-black rounded-lg text-[10px] uppercase tracking-widest shadow-xl border-none">
                        <Link href="/pass"><Gem className="h-4 w-4 mr-2" /> Activate Pass</Link>
                      </Button>
                   </div>
                </div>
              )}
           </div>
        </div>

        {/* DETAILED ANALYSIS TABS */}
        <Tabs defaultValue="SECTIONAL" className="space-y-8">
           <div className="bg-white border border-slate-100 rounded-2xl p-1 md:p-1.5 shadow-xl inline-flex w-full md:w-auto overflow-x-auto no-scrollbar justify-start">
             <TabsList className="bg-transparent border-none p-0 flex h-14 md:h-16 gap-1 md:gap-2 px-1">
                <TabsTrigger value="SECTIONAL" className="rounded-xl px-4 md:px-8 font-black uppercase text-[8px] md:text-[10px] tracking-widest gap-2 h-full data-[state=active]:bg-[#0B1528] data-[state=active]:text-white data-[state=active]:shadow-xl transition-all whitespace-nowrap">
                   <BarChart3 className="h-4 w-4" /> Sectional Audit
                </TabsTrigger>
                <TabsTrigger value="TOPPER" className="rounded-xl px-4 md:px-8 font-black uppercase text-[8px] md:text-[10px] tracking-widest gap-2 h-full data-[state=active]:bg-[#0B1528] data-[state=active]:text-white data-[state=active]:shadow-xl transition-all whitespace-nowrap">
                   <Trophy className="h-4 w-4" /> State Comparison
                </TabsTrigger>
                <TabsTrigger value="SOLUTIONS" className="rounded-xl px-4 md:px-8 font-black uppercase text-[8px] md:text-[10px] tracking-widest gap-2 h-full data-[state=active]:bg-[#0B1528] data-[state=active]:text-white data-[state=active]:shadow-xl transition-all whitespace-nowrap">
                   <BrainCircuit className="h-4 w-4" /> Answer Review
                </TabsTrigger>
             </TabsList>
           </div>

           <TabsContent value="SECTIONAL" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                 {sectionalAnalysis.map((s, i) => (
                    <Card key={i} className="border-none shadow-xl rounded-[2.5rem] bg-white p-6 md:p-8 group hover:translate-y-[-4px] transition-all border border-slate-100 hover:border-primary/20">
                       <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
                          <div className="space-y-0.5 text-left min-w-0 flex-1 pr-4">
                             <h4 className="font-headline font-black text-lg md:text-xl uppercase text-[#0B1528] leading-none truncate">{s.name}</h4>
                             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Sectional Node</p>
                          </div>
                          <Badge className={cn(
                             "border-none text-[9px] font-black uppercase px-2.5 py-1 rounded-lg", 
                             s.accuracy >= 70 ? 'bg-emerald-50 text-emerald-600' : s.accuracy >= 40 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                          )}>
                             {s.accuracy}%
                          </Badge>
                       </CardHeader>
                       <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-3">
                             <div className="text-left bg-slate-50/50 p-4 rounded-xl border border-slate-100/50 shadow-inner">
                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">MARKS</p>
                                <p className="text-xl md:text-2xl font-headline font-black text-[#0B1528]">{s.score.toFixed(1)}</p>
                             </div>
                             <div className="text-left bg-rose-50/30 p-4 rounded-xl border border-rose-100/50">
                                <p className="text-[7px] font-black text-rose-300 uppercase tracking-widest mb-0.5">WRONG</p>
                                <p className="text-xl md:text-2xl font-headline font-black text-rose-600">{s.wrong}</p>
                             </div>
                          </div>
                          <div className="space-y-2.5">
                             <div className="flex justify-between items-center text-[8px] font-black uppercase text-slate-400 tracking-[0.2em]">
                                <span>ACCURACY</span>
                                <span className="text-slate-900">{s.correct}/{s.total}</span>
                             </div>
                             <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className={cn("h-full transition-all duration-[2000ms] ease-out", s.accuracy >= 70 ? 'bg-emerald-500' : s.accuracy >= 40 ? 'bg-amber-500' : 'bg-rose-500')} style={{ width: `${s.accuracy}%` }} />
                             </div>
                          </div>
                       </div>
                    </Card>
                 ))}
              </div>
           </TabsContent>

           <TabsContent value="TOPPER" className="m-0 animate-in fade-in duration-500">
              <Card className="border-none shadow-3xl rounded-[3rem] bg-white overflow-hidden border border-slate-100">
                 <div className="grid grid-cols-1 lg:grid-cols-2">
                    <div className="p-8 md:p-12 lg:p-20 space-y-10 md:space-y-12 border-b lg:border-b-0 lg:border-r border-slate-50">
                       <div className="flex items-center gap-6">
                          <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-lg">
                             <Trophy className="h-6 w-6 md:h-8 md:w-8" />
                          </div>
                          <div className="space-y-1 text-left">
                             <h3 className="font-headline font-black text-xl md:text-3xl uppercase text-[#0B1528] tracking-tight">Merit Benchmark</h3>
                             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Node comparison with Rank #1</p>
                          </div>
                       </div>
                       
                       <div className="space-y-10">
                          <CompareMetric label="SCORE PERFORMANCE" user={sessionData.score || 0} topper={merit.topper?.score || 0} max={sessionData.totalQuestions} />
                          <CompareMetric label="ACCURACY TRAIL" user={sessionData.accuracy || 0} topper={merit.topper?.accuracy || 0} unit="%" />
                          <CompareMetric label="TIME EFFICIENCY" user={Math.floor((sessionData.timeTaken || 0) / 60)} topper={Math.floor((merit.topper?.timeTaken || 0) / 60)} isTime />
                       </div>
                    </div>

                    <div className="p-10 md:p-20 flex flex-col items-center justify-center text-center space-y-8 bg-slate-50/50 relative overflow-hidden">
                       <div className="absolute inset-0 opacity-5"><Target className="h-full w-full text-[#0B1528]" /></div>
                       <div className="relative group">
                          <StudentAvatar profile={merit.topper} className="h-32 w-32 md:h-56 md:w-56 border-[8px] border-white shadow-5xl rounded-[3rem] transition-transform duration-700 group-hover:scale-105" />
                          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-amber-400 text-white px-6 py-2 rounded-full font-black text-[9px] uppercase shadow-xl tracking-[0.2em] border-4 border-white animate-bounce">STATE TOPPER</div>
                       </div>
                       <div className="space-y-2 relative z-10">
                          <p className="text-primary font-black uppercase tracking-[0.5em] text-[9px]">REGISTRY LEADER</p>
                          <h4 className="text-2xl md:text-4xl font-headline font-black uppercase text-[#0B1528] tracking-tight">{merit.topper?.name || 'Academic Topper'}</h4>
                       </div>
                    </div>
                 </div>
              </Card>
           </TabsContent>

           <TabsContent value="SOLUTIONS" className="m-0 space-y-6 md:space-y-10 animate-in fade-in duration-500">
              <div className="bg-white border border-slate-100 rounded-[2rem] p-3 md:p-5 shadow-xl flex flex-wrap items-center gap-2 md:gap-4 sticky top-24 z-30 backdrop-blur-xl bg-opacity-95">
                 <FilterPill active={activeReviewFilter === 'ALL'} label="ALL" count={questions.length} onClick={() => setActiveReviewFilter('ALL')} color="bg-slate-100 text-slate-500" />
                 <FilterPill active={activeReviewFilter === 'CORRECT'} label="CORRECT" count={Math.floor(sessionData.score || 0)} onClick={() => setActiveReviewFilter('CORRECT')} color="bg-emerald-50 text-emerald-600" />
                 <FilterPill active={activeReviewFilter === 'WRONG'} label="WRONG" count={Object.keys(sessionData.answers || {}).length - Math.floor(sessionData.score || 0)} onClick={() => setActiveReviewFilter('WRONG')} color="bg-rose-50 text-rose-600" />
                 <FilterPill active={activeReviewFilter === 'SKIPPED'} label="SKIPPED" count={sessionData.totalQuestions - Object.keys(sessionData.answers || {}).length} onClick={() => setActiveReviewFilter('SKIPPED')} color="bg-slate-100 text-slate-300" />
              </div>

              <div className="grid grid-cols-1 gap-4 md:gap-8">
                 {filteredQuestions.map((q) => {
                    const isExpanded = expandedQs[q.index];
                    const studentAns = sessionData.answers?.[q.index];
                    const isCorrect = studentAns !== undefined && ['A','B','C','D'][studentAns] === q.correctAnswer;
                    const isSkipped = studentAns === undefined || studentAns === null;

                    return (
                       <Card key={q.id} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white group border border-slate-100 relative text-left">
                          <div className={cn("absolute top-0 left-0 w-1.5 h-full transition-colors", isCorrect ? 'bg-emerald-500' : isSkipped ? 'bg-slate-200' : 'bg-rose-500')} />
                          <CardContent className="p-6 md:p-12 space-y-6 md:space-y-10">
                             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                   <div className={cn(
                                      "h-12 w-12 md:h-16 md:w-16 rounded-2xl flex items-center justify-center font-black text-xl md:text-3xl shadow-inner",
                                      isCorrect ? "bg-emerald-50 text-emerald-600" : isSkipped ? "bg-slate-50 text-slate-300" : "bg-rose-50 text-rose-500"
                                   )}>
                                      {q.index + 1}
                                   </div>
                                   <div className="space-y-1 text-left">
                                      <div className="flex items-center gap-3">
                                         <Badge className={cn(
                                            "border-none text-[8px] md:text-[10px] font-black uppercase px-2.5 py-1 rounded-md", 
                                            isCorrect ? 'bg-emerald-50 text-emerald-600' : isSkipped ? 'bg-slate-100 text-slate-400' : 'bg-rose-50 text-rose-600'
                                         )}>
                                            {isCorrect ? 'CORRECT' : isSkipped ? 'SKIPPED' : 'INCORRECT'}
                                         </Badge>
                                         {!isCorrect && !isSkipped && <Badge className="bg-[#0B1528] text-white border-none text-[8px] font-black uppercase px-2.5 py-1 rounded-md">Key: {q.correctAnswer}</Badge>}
                                      </div>
                                      <p className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{q.sectionId || 'GENERAL HUB'}</p>
                                   </div>
                                </div>
                                <Button 
                                   onClick={() => setExpandedQs(prev => ({ ...prev, [q.index]: !prev[q.index] }))}
                                   variant="ghost" 
                                   className="h-11 md:h-14 px-6 md:px-10 rounded-xl font-black uppercase text-[9px] tracking-widest gap-3 bg-slate-50 text-[#0B1528] hover:bg-[#0B1528] hover:text-white transition-all w-full md:w-auto"
                                >
                                   {isExpanded ? 'Hide Solution' : 'View Solution'}
                                   {isExpanded ? <ChevronUp className="h-4 w-4" /> : <BrainCircuit className="h-4 w-4 text-primary" />}
                                </Button>
                             </div>

                             <div className="px-1 md:px-2">
                                <QuestionRenderer 
                                   question={q} 
                                   language={mockData?.languageMode || 'ENGLISH_PUNJABI'}
                                   showSolution={isExpanded}
                                   selectedAnswer={studentAns}
                                   className="p-0 border-none shadow-none bg-transparent"
                                />
                             </div>
                          </CardContent>
                       </Card>
                    );
                 })}
              </div>
           </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}

function MetricCard({ label, val, sub, color }: any) {
   const valStr = String(val);
   return (
      <div className="space-y-1.5 md:space-y-2 p-5 md:p-8 bg-white/5 border border-white/5 rounded-3xl transition-all hover:bg-white/10 group text-left">
         <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">{label}</p>
         <div className="flex items-baseline gap-1">
            <p className={cn("text-xl sm:text-2xl md:text-5xl font-headline font-black leading-none tracking-tighter whitespace-nowrap", color)}>{val}</p>
            <span className="text-[10px] md:text-[12px] font-bold text-slate-600 uppercase tracking-widest">{sub}</span>
         </div>
         <div className="flex items-center gap-2 pt-1 md:pt-2">
            <div className={cn("h-1 w-1 md:h-1.5 md:w-1.5 rounded-full animate-pulse", valStr.includes('NaN') ? 'bg-rose-500' : 'bg-emerald-500')} />
            <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{valStr.includes('NaN') ? 'Error Syncing' : 'Node Active'}</p>
         </div>
      </div>
   )
}

function CompareMetric({ label, user, topper, max, unit = "", isTime = false }: any) {
   const userVal = Number(user) || 0;
   const topperVal = Number(topper) || 0;
   const maxVal = max ? Number(max) : Math.max(userVal, topperVal, 100);
   
   const userPer = (userVal / maxVal) * 100;
   const topperPer = (topperVal / maxVal) * 100;

   return (
      <div className="space-y-4 text-left">
         <div className="flex justify-between items-end">
            <div className="space-y-1">
               <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-[#0B1528]">{label}</span>
               <div className="h-0.5 w-6 bg-primary rounded-full" />
            </div>
            <div className="flex gap-6">
               <div className="text-right">
                  <p className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">YOU</p>
                  <p className="text-lg md:text-xl font-black text-[#0B1528]">{user}{unit}{isTime && 'm'}</p>
               </div>
               <div className="text-right">
                  <p className="text-[7px] md:text-[8px] font-black text-amber-500 uppercase tracking-widest leading-none mb-0.5">TOPPER</p>
                  <p className="text-lg md:text-xl font-black text-amber-600">{topper}{unit}{isTime && 'm'}</p>
               </div>
            </div>
         </div>
         <div className="relative h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div className="absolute inset-0 bg-amber-400/20 transition-all duration-[1500ms] ease-out" style={{ width: `${topperPer}%` }} />
            <div className="absolute inset-0 bg-amber-400 transition-all duration-[1800ms] ease-out border-r-2 border-amber-600" style={{ width: `${topperPer}%` }} />
            <div className="absolute inset-0 bg-primary/40 border-r-2 border-primary transition-all duration-[1200ms] ease-out" style={{ width: `${userPer}%` }} />
         </div>
      </div>
   )
}

function FilterPill({ active, label, count, onClick, color }: any) {
   return (
      <button 
         onClick={onClick}
         className={cn(
            "flex items-center gap-2.5 md:gap-4 px-4 md:px-8 py-2.5 md:py-4 rounded-xl transition-all active:scale-95 border-2 shadow-sm",
            active ? 'bg-[#0B1528] border-[#0B1528] text-white shadow-lg' : 'bg-white border-slate-50 text-slate-400 hover:border-slate-200'
         )}
      >
         <span className={cn("h-6 w-6 md:h-7 md:w-7 rounded-lg flex items-center justify-center font-black text-[10px] md:text-xs", color)}>{count}</span>
         <span className="text-[9px] md:text-[11px] font-black uppercase tracking-widest">{label}</span>
      </button>
   )
}
