
"use client"

import { useState, useMemo, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CheckCircle2, 
  XCircle, 
  Target, 
  Zap, 
  Loader2, 
  BrainCircuit, 
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Clock,
  TrendingUp,
  Activity,
  Trophy,
  Users,
  Share2,
  Download,
  Info,
  ArrowRight,
  Filter,
  Medal,
  Award,
  MessageCircle,
  Send
} from "lucide-react"
import { useFirestore, useUser, useCollection } from "@/firebase"
import { collection, query, where, doc, getDoc, documentId, getDocs, orderBy, limit } from "firebase/firestore"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import BackButton from "@/components/navigation/BackButton"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell, PieChart, Pie } from "recharts"
import StudentAvatar from "@/components/brand/StudentAvatar"

/**
 * @fileOverview Elite Institutional Results Hub v25.0.
 * Rebuilt for Testbook-Level Experience with Real-Time State Ranking.
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

  // 1. Fetch User Result
  const resultsQuery = useMemo(() => {
    if (!db || !user) return null
    return query(collection(db, "results"), where("userId", "==", user.uid), where("mockId", "==", mockId))
  }, [db, user, mockId])

  const { data: rawResultDocs, loading: resultsLoading } = useCollection<any>(resultsQuery)
  
  // 2. Fetch Global Results for this mock to calculate Rank
  const globalResultsQuery = useMemo(() => {
    if (!db || !mockId) return null
    return query(collection(db, "results"), where("mockId", "==", mockId), orderBy("score", "desc"))
  }, [db, mockId])

  const { data: globalResults } = useCollection<any>(globalResultsQuery)

  const sessionData = useMemo(() => {
    if (!rawResultDocs || rawResultDocs.length === 0) return null
    return [...rawResultDocs].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
  }, [rawResultDocs])

  // 3. Merit Stats Engine
  const merit = useMemo(() => {
     if (!globalResults || !sessionData) return { rank: '?', total: 0, percentile: 0, topper: null };
     const sorted = [...globalResults].sort((a, b) => b.score - a.score);
     const rank = sorted.findIndex((r: any) => r.userId === user?.uid) + 1 || sorted.findIndex((r: any) => r.score <= sessionData.score) + 1;
     const total = sorted.length;
     const percentile = Math.round(((total - rank) / (total || 1)) * 1000) / 10;
     const topper = sorted[0];
     return { rank, total, percentile, topper };
  }, [globalResults, sessionData, user]);

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
        toast({ variant: "destructive", title: "Audit Sync Failed" })
      } finally {
        setLoadingContent(false)
      }
    }
    loadQuestions()
  }, [db, sessionData, mockId, toast, resultsLoading])

  const sectionalAudit = useMemo(() => {
     if (!questions.length || !sessionData) return [];
     const sections: Record<string, { total: number, correct: number, wrong: number, skipped: number }> = {};
     
     questions.forEach((q, i) => {
        const sid = q.sectionId || 'General Knowledge';
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
        score: data.correct - (data.wrong * 0.25)
     }));
  }, [questions, sessionData]);

  const filteredQuestions = useMemo(() => {
     return questions.map((q, i) => ({ ...q, index: i })).filter((q, i) => {
        const ans = sessionData?.answers?.[i];
        if (activeReviewFilter === 'ALL') return true;
        if (activeReviewFilter === 'CORRECT') return ans !== undefined && ['A','B','C','D'][ans] === q.correctAnswer;
        if (activeReviewFilter === 'WRONG') return ans !== undefined && ['A','B','C','D'][ans] !== q.correctAnswer;
        if (activeReviewFilter === 'SKIPPED') return ans === undefined || ans === null;
        return true;
     });
  }, [questions, sessionData, activeReviewFilter]);

  const handleShare = () => {
     const text = `🔥 I just attempted ${sessionData.mockTitle} on Cracklix!\n\n🏆 Rank: #${merit.rank} of ${merit.total}\n🎯 Score: ${sessionData.score}/${sessionData.totalQuestions}\n📈 Percentile: ${merit.percentile}%\n\nPrepare for Punjab Government Exams here: ${window.location.origin}`;
     window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  if (resultsLoading || loadingContent) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-6">
       <div className="relative">
          <Zap className="h-16 w-16 text-primary animate-pulse" />
          <div className="absolute -inset-4 bg-primary/20 blur-xl rounded-full animate-ping" />
       </div>
       <p className="text-[12px] font-black uppercase tracking-[0.4em] text-primary">Synchronizing State Rank Index...</p>
    </div>
  )

  if (!sessionData) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-6 space-y-8">
       <Trophy className="h-20 w-20 text-slate-200" />
       <p className="text-lg font-bold text-slate-400 uppercase tracking-widest text-center">Result Audit Missing</p>
       <Button asChild className="rounded-2xl h-16 px-12 bg-[#0B1528] text-white font-black uppercase text-[10px] tracking-widest shadow-xl">
          <Link href="/mocks">Browse Mock Series</Link>
       </Button>
    </div>
  )

  const unattempted = sessionData.totalQuestions - Object.keys(sessionData.answers || {}).length;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body pb-safe text-left selection:bg-primary/20">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-6 py-6 md:py-12 max-w-7xl space-y-8 md:space-y-12">
        
        {/* 1. ELITE PERFORMANCE HUD */}
        <div className="flex flex-col lg:flex-row gap-6 md:gap-10">
           
           {/* LEFT: MERIT HERO */}
           <Card className="flex-1 border-none shadow-3xl rounded-[2.5rem] md:rounded-[3.5rem] bg-[#0B1528] text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 group-hover:scale-110 transition-transform"><Trophy className="h-64 w-64" /></div>
              <CardContent className="p-8 md:p-16 space-y-12 relative z-10">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                          <ShieldCheck className="h-6 w-6 text-primary" />
                          <Badge className="bg-primary/20 text-primary border-none px-4 py-1.5 rounded-full font-black uppercase text-[9px] tracking-[0.2em] shadow-lg">Official Audit Node</Badge>
                       </div>
                       <h1 className="text-3xl md:text-5xl lg:text-6xl font-headline font-black uppercase leading-[0.9] tracking-tighter">
                          {sessionData.mockTitle}
                       </h1>
                    </div>
                    
                    <div className="flex items-center gap-6 md:gap-12 bg-white/5 backdrop-blur-md p-6 md:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
                       <div className="text-center space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">STATE RANK</p>
                          <p className="text-4xl md:text-7xl font-headline font-black text-primary leading-none">#{merit.rank}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">OF {merit.total}</p>
                       </div>
                       <div className="h-16 w-px bg-white/10" />
                       <div className="text-center space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PERCENTILE</p>
                          <p className="text-4xl md:text-7xl font-headline font-black text-emerald-400 leading-none">{merit.percentile}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Mastery Index</p>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 pt-6">
                    <HeroMetric label="SCORE" val={`${sessionData.score}/${sessionData.totalQuestions}`} sub="Registry Pts" color="text-primary" />
                    <HeroMetric label="ACCURACY" val={`${sessionData.accuracy}%`} sub="Precision" color="text-emerald-400" />
                    <HeroMetric label="CORRECT" val={sessionData.score} sub="Audit Success" color="text-emerald-400" />
                    <HeroMetric label="TIME" val={`${Math.floor(sessionData.timeTaken / 60)}m`} sub="Pace Index" color="text-blue-400" />
                 </div>
              </CardContent>
           </Card>

           {/* RIGHT: QUICK ACTIONS */}
           <div className="w-full lg:w-80 flex flex-col gap-6">
              <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 space-y-6">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Institutional Access</h3>
                 <div className="space-y-4">
                    <Button onClick={handleShare} className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl gap-3">
                       <MessageCircle className="h-5 w-5 fill-current" /> Share Result
                    </Button>
                    <Button variant="outline" onClick={() => window.print()} className="w-full h-14 border-slate-100 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-600 gap-3">
                       <Download className="h-5 w-5" /> Audit PDF
                    </Button>
                    <Button asChild variant="ghost" className="w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest text-primary hover:bg-primary/5">
                       <Link href={`/mocks/${mockId}/attempt`}><Zap className="h-4 w-4 mr-2" /> Re-attempt Node</Link>
                    </Button>
                 </div>
              </Card>

              <div className="bg-primary rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><Award className="h-24 w-24" /></div>
                 <h4 className="text-xl font-headline font-black uppercase leading-tight relative z-10">Sync Your <br/> Success.</h4>
                 <p className="text-white/70 text-[10px] font-bold uppercase mt-2 relative z-10">Joined Hall of Rankers?</p>
                 <Button asChild className="w-full mt-6 bg-white text-primary hover:bg-slate-50 font-black h-12 rounded-xl text-[10px] uppercase shadow-lg">
                    <Link href="/leaderboard">View Leaderboard</Link>
                 </Button>
              </div>
           </div>
        </div>

        {/* 2. TABBED ANALYSIS MODULE */}
        <Tabs defaultValue="SECTIONAL" className="space-y-8">
           <TabsList className="bg-white border border-slate-100 p-1.5 h-16 rounded-[1.5rem] md:rounded-[2rem] shadow-sm inline-flex w-full md:w-auto overflow-x-auto no-scrollbar justify-start gap-2">
              <TabsTrigger value="SECTIONAL" className="rounded-xl px-6 md:px-10 font-black uppercase text-[10px] gap-3 h-full data-[state=active]:bg-[#0B1528] data-[state=active]:text-white transition-all whitespace-nowrap">
                 <BarChart3 className="h-4 w-4" /> Sectional Audit
              </TabsTrigger>
              <TabsTrigger value="TOPPER" className="rounded-xl px-6 md:px-10 font-black uppercase text-[10px] gap-3 h-full data-[state=active]:bg-[#0B1528] data-[state=active]:text-white transition-all whitespace-nowrap">
                 <TrendingUp className="h-4 w-4" /> Topper Analysis
              </TabsTrigger>
              <TabsTrigger value="SOLUTIONS" className="rounded-xl px-6 md:px-10 font-black uppercase text-[10px] gap-3 h-full data-[state=active]:bg-[#0B1528] data-[state=active]:text-white transition-all whitespace-nowrap">
                 <BrainCircuit className="h-4 w-4" /> Solution Review
              </TabsTrigger>
              <TabsTrigger value="LEADERBOARD" className="rounded-xl px-6 md:px-10 font-black uppercase text-[10px] gap-3 h-full data-[state=active]:bg-[#0B1528] data-[state=active]:text-white transition-all whitespace-nowrap">
                 <Medal className="h-4 w-4" /> Mock Rankers
              </TabsTrigger>
           </TabsList>

           <TabsContent value="SECTIONAL" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {sectionalAudit.map((s, i) => (
                    <Card key={i} className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 group hover:translate-y-[-4px] transition-all">
                       <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
                          <h4 className="font-headline font-black text-lg uppercase text-[#0B1528] leading-none truncate pr-4">{s.name}</h4>
                          <Badge className={cn("border-none text-[8px] font-black uppercase px-2 py-0.5", s.accuracy > 70 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600')}>
                             {s.accuracy}% Accuracy
                          </Badge>
                       </CardHeader>
                       <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                             <MiniStat label="SCORE" val={s.score} />
                             <MiniStat label="WRONG" val={s.wrong} color="text-rose-500" />
                          </div>
                          <div className="space-y-2">
                             <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400">
                                <span>Mastery Progress</span>
                                <span>{s.correct}/{s.total}</span>
                             </div>
                             <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                                <div className={cn("h-full transition-all duration-1000", s.accuracy > 70 ? 'bg-emerald-500' : 'bg-rose-500')} style={{ width: `${s.accuracy}%` }} />
                             </div>
                          </div>
                       </div>
                    </Card>
                 ))}
              </div>
           </TabsContent>

           <TabsContent value="TOPPER" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Card className="border-none shadow-xl rounded-[3rem] bg-white overflow-hidden">
                 <div className="grid grid-cols-1 lg:grid-cols-2">
                    <div className="p-10 md:p-16 space-y-12 border-b lg:border-b-0 lg:border-r border-slate-50">
                       <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner">
                             <Trophy className="h-6 w-6" />
                          </div>
                          <h3 className="font-headline font-black text-2xl uppercase">Topper Comparison</h3>
                       </div>
                       
                       <div className="space-y-10">
                          <CompareRow label="SCORE" user={sessionData.score} topper={merit.topper?.score || 0} max={sessionData.totalQuestions} />
                          <CompareRow label="ACCURACY" user={sessionData.accuracy} topper={merit.topper?.accuracy || 0} unit="%" />
                          <CompareRow label="TIME (MIN)" user={Math.floor(sessionData.timeTaken / 60)} topper={Math.floor((merit.topper?.timeTaken || 0) / 60)} />
                       </div>
                    </div>

                    <div className="p-10 md:p-16 flex flex-col items-center justify-center text-center space-y-8 bg-slate-50/30">
                       <div className="relative">
                          <StudentAvatar profile={merit.topper} className="h-32 w-32 md:h-40 md:w-40 border-8 border-white shadow-2xl rounded-[3.5rem]" />
                          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-amber-400 text-white px-5 py-1.5 rounded-full font-black text-[10px] uppercase shadow-lg">STATE TOPPER</div>
                       </div>
                       <div className="space-y-2">
                          <h4 className="text-2xl font-headline font-black uppercase text-[#0B1528]">{merit.topper?.name || 'Aspirant #1'}</h4>
                          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">REGISTRY SCORE: {merit.topper?.score || 0} PTS</p>
                       </div>
                    </div>
                 </div>
              </Card>
           </TabsContent>

           <TabsContent value="LEADERBOARD" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Card className="border-none shadow-xl rounded-[3rem] bg-white overflow-hidden">
                 <div className="p-8 md:p-12 border-b border-slate-50 bg-slate-50/50 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                       <Users className="h-6 w-6 text-primary" />
                       <h3 className="font-headline font-black text-xl uppercase">Mock Leaderboard</h3>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] px-4 py-1.5 rounded-full">{merit.total} Candidates</Badge>
                 </div>
                 <div className="p-0">
                    <div className="divide-y divide-slate-50">
                       {globalResults?.slice(0, 10).map((r: any, idx: number) => (
                          <div key={r.id} className={cn(
                             "p-6 md:p-10 flex items-center justify-between transition-all",
                             r.userId === user?.uid ? "bg-primary/5 border-l-4 border-primary" : "hover:bg-slate-50/50"
                          )}>
                             <div className="flex items-center gap-6 md:gap-10">
                                <span className="font-headline font-black text-xl md:text-3xl text-slate-200">#{idx + 1}</span>
                                <div className="flex items-center gap-5">
                                   <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300 font-black">
                                      {idx === 0 ? <Medal className="h-6 w-6 text-amber-500" /> : <Users className="h-5 w-5" />}
                                   </div>
                                   <div className="text-left">
                                      <p className="font-black text-[#0B1528] text-sm md:text-lg uppercase leading-none">{r.userId === user?.uid ? 'You' : `Candidate ${r.userId.slice(-6)}`}</p>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{r.accuracy}% Accuracy</p>
                                   </div>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-xl md:text-3xl font-headline font-black text-[#0B1528] leading-none">{r.score}</p>
                                <p className="text-[8px] font-black text-slate-300 uppercase mt-1">POINTS</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </Card>
           </TabsContent>

           <TabsContent value="SOLUTIONS" className="m-0 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
              
              {/* PALETTE FILTER */}
              <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex flex-wrap items-center gap-4">
                 <FilterNode active={activeReviewFilter === 'ALL'} label="ALL" count={questions.length} onClick={() => setActiveReviewFilter('ALL')} color="bg-slate-50 text-slate-500" />
                 <FilterNode active={activeReviewFilter === 'CORRECT'} label="CORRECT" count={sessionData.score} onClick={() => setActiveReviewFilter('CORRECT')} color="bg-emerald-50 text-emerald-600" />
                 <FilterNode active={activeReviewFilter === 'WRONG'} label="WRONG" count={Object.keys(sessionData.answers).length - sessionData.score} onClick={() => setActiveReviewFilter('WRONG')} color="bg-rose-50 text-rose-600" />
                 <FilterNode active={activeReviewFilter === 'SKIPPED'} label="SKIPPED" count={unattempted} onClick={() => setActiveReviewFilter('SKIPPED')} color="bg-slate-100 text-slate-400" />
              </div>

              <div className="grid grid-cols-1 gap-6 md:gap-8">
                 {filteredQuestions.map((q) => {
                    const isExpanded = expandedQs[q.index];
                    const studentAns = sessionData.answers?.[q.index];
                    const isCorrect = studentAns !== undefined && ['A','B','C','D'][studentAns] === q.correctAnswer;
                    const isSkipped = studentAns === undefined || studentAns === null;

                    return (
                       <Card key={q.id} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white group hover:shadow-2xl transition-all">
                          <div className={cn("h-2 w-full", isCorrect ? 'bg-emerald-500' : isSkipped ? 'bg-slate-200' : 'bg-rose-500')} />
                          <CardContent className="p-8 md:p-12 space-y-8">
                             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                   <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-slate-50 flex items-center justify-center font-black text-xl text-slate-300">
                                      {q.index + 1}
                                   </div>
                                   <div className="space-y-1">
                                      <Badge className={cn("border-none text-[9px] font-black uppercase px-3 py-1 rounded-lg", isCorrect ? 'bg-emerald-50 text-emerald-600' : isSkipped ? 'bg-slate-100 text-slate-400' : 'bg-rose-50 text-rose-600')}>
                                         {isCorrect ? 'SUCCESS' : isSkipped ? 'SKIPPED' : 'FAILURE'}
                                      </Badge>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">{q.sectionId || 'General'}</p>
                                   </div>
                                </div>
                                <Button 
                                   onClick={() => setExpandedQs(prev => ({ ...prev, [q.index]: !prev[q.index] }))}
                                   variant="ghost" 
                                   className="h-12 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 bg-slate-50 text-primary hover:bg-primary/10"
                                >
                                   {isExpanded ? 'Hide Rationale' : 'Audit Rationale'}
                                   {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                             </div>

                             <QuestionRenderer 
                                question={q} 
                                language={mockData?.languageMode || 'ENGLISH_PUNJABI'}
                                showSolution={isExpanded}
                                selectedAnswer={studentAns}
                                className="p-0 border-none shadow-none bg-transparent"
                             />
                          </CardContent>
                       </Card>
                    );
                 })}
              </div>
           </TabsContent>
        </Tabs>

        {/* INSTITUTIONAL BRANDING */}
        <div className="pt-24 border-t border-slate-200 flex flex-col items-center gap-4 text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Cracklix v25.0 • Audit Complete</p>
           <div className="flex flex-col items-center gap-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Developed by <span className="text-[#0B1528]">Arsh Grewal</span></p>
              <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Founder & Lead Engineer</p>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function HeroMetric({ label, val, sub, color }: any) {
   return (
      <div className="space-y-1.5 md:space-y-3 p-6 md:p-8 bg-white/5 border border-white/5 rounded-[2rem] transition-all hover:bg-white/10 group">
         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
         <p className={cn("text-2xl md:text-4xl font-headline font-black leading-none", color)}>{val}</p>
         <p className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter group-hover:text-slate-400">{sub}</p>
      </div>
   )
}

function MiniStat({ label, val, color = "text-[#0B1528]" }: any) {
   return (
      <div className="text-left">
         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
         <p className={cn("text-xl font-black leading-none", color)}>{val}</p>
      </div>
   )
}

function CompareRow({ label, user, topper, max, unit = "" }: any) {
   const userPer = max ? (user / max) * 100 : user;
   const topperPer = max ? (topper / max) * 100 : topper;

   return (
      <div className="space-y-4">
         <div className="flex justify-between items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
            <div className="flex gap-4">
               <span className="text-xs font-bold text-slate-600">You: <strong className="text-[#0B1528]">{user}{unit}</strong></span>
               <span className="text-xs font-bold text-slate-600">Topper: <strong className="text-amber-600">{topper}{unit}</strong></span>
            </div>
         </div>
         <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div className="absolute inset-0 bg-amber-400 transition-all duration-1000" style={{ width: `${topperPer}%` }} />
            <div className="absolute inset-0 bg-primary/40 border-r-4 border-primary transition-all duration-1000" style={{ width: `${userPer}%` }} />
         </div>
      </div>
   )
}

function FilterNode({ active, label, count, onClick, color }: any) {
   return (
      <button 
         onClick={onClick}
         className={cn(
            "flex items-center gap-3 px-6 py-3 rounded-2xl transition-all active:scale-95 border-2",
            active ? 'bg-[#0B1528] border-[#0B1528] text-white shadow-xl' : 'bg-white border-slate-50 text-slate-400 hover:border-slate-100'
         )}
      >
         <span className={cn("h-5 w-5 rounded-lg flex items-center justify-center font-black text-[9px]", color)}>{count}</span>
         <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </button>
   )
}
