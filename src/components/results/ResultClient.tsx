
"use client"

import React, { useState, useMemo, useEffect, useRef } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
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
  ChevronRight,
  Gem,
  ArrowRight,
  Lock,
  UserPlus,
  Share2,
  Download,
  X,
  History,
  TrendingUp,
  Award,
  CircleCheck,
  MousePointer2,
  Calendar
} from "lucide-react"
import { useUser, useCollection, useFirestore, useDoc } from "@/firebase"
import { collection, query, where, doc, getDoc, documentId, getDocs, limit } from "firebase/firestore"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import StudentAvatar from "@/components/brand/StudentAvatar"
import { toPng } from 'html-to-image';
import ResultCard from "./ResultCard"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"
import { motion, AnimatePresence } from "framer-motion"

/**
 * @fileOverview Official Institutional Result Hub v8.0.
 * REDESIGNED: Premium Government-Exam Style Scorecard (#071326).
 */

export default function ResultClient() {
  const db = useFirestore()
  const { user, profile } = useUser()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  
  const [mounted, setMounted] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])
  const [mockData, setMockData] = useState<any>(null)
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [activeReviewFilter, setActiveReviewFilter] = useState<'ALL' | 'CORRECT' | 'WRONG' | 'SKIPPED'>('ALL')
  const [guestResult, setGuestResult] = useState<any>(null)
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  
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

  const isGuestMode = !user || searchParams?.get('guest') === 'true';

  const resultRef = useMemo(() => (db && user && mockId ? doc(db, "results", `${user.uid}_${mockId}`) : null), [db, user, mockId]);
  const { data: cloudSession, loading: resultLoading } = useDoc<any>(resultRef);

  useEffect(() => {
     if (isGuestMode && mockId) {
        const stored = localStorage.getItem(`cracklix_guest_result_${mockId}`);
        if (stored) setGuestResult(JSON.parse(stored));
     }
  }, [isGuestMode, mockId]);

  const sessionData = user ? cloudSession : guestResult;

  const globalResultsQuery = useMemo(() => {
    if (!db || !mockId) return null
    return query(collection(db, "results"), where("mockId", "==", mockId), limit(500))
  }, [db, mockId])

  const { data: rawGlobalResults } = useCollection<any>(globalResultsQuery)

  const merit = useMemo(() => {
     if (!rawGlobalResults || !sessionData || !user) return { rank: '?', total: 0, percentile: 0, list: [] };
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
     const percentile = total > 1 ? Math.round(((total - actualRank) / (total - 1)) * 1000) / 10 : 100;
     return { rank: actualRank, total, percentile, list: meritList };
  }, [rawGlobalResults, sessionData, user]);

  useEffect(() => {
    async function loadQuestions() {
      if (!db || !mockId) return;
      try {
        let mockSnap = await getDoc(doc(db, "mocks", mockId))
        if (!mockSnap.exists()) mockSnap = await getDoc(doc(db, "daily_quizzes", mockId));
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
        console.error("[RESULT_LOAD_ERROR]:", e);
      } finally { setLoadingQuestions(false) }
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

  const performanceStatus = useMemo(() => {
     const acc = sessionData?.accuracy || 0;
     if (acc >= 90) return { label: "Outstanding", color: "text-[#00C853]", bg: "bg-[#00C853]/10", icon: <Trophy className="text-[#00C853]" /> };
     if (acc >= 75) return { label: "Excellent", color: "text-[#1976FF]", bg: "bg-[#1976FF]/10", icon: <Star className="text-[#1976FF]" /> };
     if (acc >= 60) return { label: "Very Good", color: "text-[#FF9800]", bg: "bg-[#FF9800]/10", icon: <TrendingUp className="text-[#FF9800]" /> };
     return { label: "Needs Improvement", color: "text-[#FF5252]", bg: "bg-[#FF5252]/10", icon: <AlertCircle className="text-[#FF5252]" /> };
  }, [sessionData]);

  const chartData = useMemo(() => [
     { name: 'Correct', value: sessionData?.correctCount || 0, color: '#00C853' },
     { name: 'Wrong', value: sessionData?.wrongCount || 0, color: '#FF5252' },
     { name: 'Skipped', value: questions.length - (sessionData?.attemptedCount || 0), color: '#374151' }
  ], [sessionData, questions]);

  const formatTime = (seconds: number) => {
     const m = Math.floor(seconds / 60);
     const s = seconds % 60;
     return `${m}m ${s}s`;
  };

  const handleShare = async () => {
    if (isProcessingImage) return;
    setIsProcessingImage(true);
    try {
       const node = document.getElementById('cracklix-result-card');
       if (!node) return;
       const dataUrl = await toPng(node, { quality: 1, pixelRatio: 2, cacheBust: true });
       const blob = await (await fetch(dataUrl)).blob();
       const file = new File([blob], `cracklix-result-${mockId}.png`, { type: 'image/png' });
       if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'My Cracklix Result', text: `I scored ${sessionData.score} on ${mockData?.title}!` });
       } else {
          const link = document.createElement('a'); link.download = `result-${mockId}.png`; link.href = dataUrl; link.click();
          toast({ title: "Result card saved" });
       }
    } catch (err) { toast({ variant: "destructive", title: "Share failed" }); }
    finally { setIsProcessingImage(false); }
  };

  if (!mounted || (resultLoading && user) || (loadingQuestions && questions.length === 0)) return (
     <div className="h-screen w-full flex flex-col items-center justify-center bg-[#071326] space-y-4">
        <Loader2 className="h-10 w-10 text-[#1976FF] animate-spin" />
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Auditing Performance...</p>
     </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#071326] font-body text-white selection:bg-primary/20 overflow-x-hidden relative">
      <Navbar />
      
      {/* EXPORT NODE (Hidden) */}
      <div className="fixed left-[-9999px] top-0 pointer-events-none">
         <ResultCard 
            studentName={profile?.name || "Aspirant"}
            examTitle={mockData?.title || "Mock Test"}
            score={sessionData?.score?.toFixed(1) || 0}
            rank={user ? merit.rank : 'Guest'}
            accuracy={sessionData?.accuracy || 0}
            timeTaken={formatTime(sessionData?.timeTaken || 0)}
            correct={sessionData?.correctCount || 0}
            wrong={sessionData?.wrongCount || 0}
            total={questions.length}
            percentile={user ? merit.percentile : undefined}
            date={new Date(sessionData?.timestamp || Date.now()).toLocaleDateString('en-GB')}
         />
      </div>

      <main className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-6xl space-y-8">
        
        {/* 1. PREMIUM RESULT HEADER */}
        <section className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#101B32]/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-14 border border-white/5 shadow-5xl">
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <ShieldCheck className="h-64 w-64 text-white" />
           </div>

           {/* Hero Left: Identity & Title */}
           <div className="lg:col-span-4 space-y-6 text-center lg:text-left z-10">
              <div className="flex flex-col items-center lg:items-start gap-4">
                 <div className="flex items-center gap-3">
                    <Badge className="bg-[#1976FF] text-white border-none px-4 py-1 rounded-full font-black text-[9px] uppercase tracking-widest shadow-xl">Verified Analysis</Badge>
                    <div className="h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"><CheckCircle2 className="h-3 w-3 text-white" /></div>
                 </div>
                 <h1 className="text-2xl md:text-5xl font-black tracking-tighter leading-[1] text-white uppercase break-words">
                    {mockData?.title || "Practice Result"}
                 </h1>
                 <p className="text-slate-400 font-bold text-sm flex items-center gap-3 justify-center lg:justify-start">
                    <Calendar className="h-4 w-4 text-[#1976FF]" /> 
                    {new Date(sessionData?.timestamp || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                 </p>
              </div>
              <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                 <Button onClick={handleShare} disabled={isProcessingImage} className="h-12 md:h-14 px-8 bg-[#1976FF] hover:bg-blue-600 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl border-none gap-3 active:scale-95">
                    {isProcessingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />} Share Result
                 </Button>
                 <Button variant="outline" className="h-12 md:h-14 px-8 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 font-black uppercase text-[10px] tracking-widest shadow-xl" asChild>
                    <Link href={`/mocks/instructions?id=${mockId}`}><RefreshCw className="h-4 w-4 mr-2" /> Re-Attempt</Link>
                 </Button>
              </div>
           </div>

           {/* Hero Center: The Score Ring */}
           <div className="lg:col-span-4 flex justify-center z-10">
              <div className="relative h-56 w-56 md:h-72 md:w-72 flex items-center justify-center">
                 <svg className="h-full w-full transform -rotate-90 drop-shadow-[0_0_20px_rgba(25,118,255,0.3)]">
                    <circle cx="50%" cy="50%" r="45%" className="stroke-white/5 fill-none" strokeWidth="16" />
                    <motion.circle 
                       cx="50%" cy="50%" r="45%" 
                       className="stroke-[#1976FF] fill-none" 
                       strokeWidth="16" 
                       strokeLinecap="round"
                       initial={{ strokeDasharray: "0 1000" }}
                       animate={{ strokeDasharray: `${(sessionData?.accuracy || 0) * 2.82} 1000` }}
                       transition={{ duration: 2, ease: "easeOut" }}
                    />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-1">
                    <span className="text-5xl md:text-7xl font-black text-white tabular-nums tracking-tighter">
                       {sessionData?.accuracy || 0}%
                    </span>
                    <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.3em]">{performanceStatus.label}</span>
                 </div>
              </div>
           </div>

           {/* Hero Right: Rank & Percentile Cards */}
           <div className="lg:col-span-4 grid grid-cols-1 gap-4 z-10 w-full max-w-[280px] mx-auto lg:max-w-none">
              <ScoreStat icon={<Trophy className="text-amber-400" />} label="State Rank" value={user ? `#${merit.rank}` : "Guest"} sub={`out of ${merit.total} students`} />
              <ScoreStat icon={<Target className="text-emerald-400" />} label="Percentile" value={user ? `${merit.percentile}%` : "---"} sub="Comparative accuracy" />
           </div>
        </section>

        {/* 2. STATS LEDGER GRID */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
           <LedgerCard icon={<Zap className="text-[#1976FF]" />} label="Total Score" val={(sessionData?.score || 0).toFixed(1)} sub="Registry Score" />
           <LedgerCard icon={<CheckCircle2 className="text-[#00C853]" />} label="Correct" val={sessionData?.correctCount || 0} sub="Verified Nodes" />
           <LedgerCard icon={<XCircle className="text-[#FF5252]" />} label="Wrong" val={sessionData?.wrongCount || 0} sub="Accuracy Leak" />
           <LedgerCard icon={<MousePointer2 className="text-slate-400" />} label="Skipped" val={questions.length - (sessionData?.attemptedCount || 0)} sub="No Attempt" />
           <LedgerCard icon={<Clock className="text-amber-400" />} label="Time Taken" val={formatTime(sessionData?.timeTaken || 0)} sub="Completion Pace" />
           <LedgerCard icon={<Timer className="text-blue-400" />} label="Avg Time/Q" val={sessionData?.attemptedCount > 0 ? `${(sessionData.timeTaken / sessionData.attemptedCount).toFixed(0)}s` : "---"} sub="Node Latency" />
           <LedgerCard icon={<BarChart3 className="text-purple-400" />} label="Attempt Rate" val={questions.length > 0 ? `${Math.round(((sessionData?.attemptedCount || 0) / questions.length) * 100)}%` : "0%"} sub="Volume Node" />
           <LedgerCard icon={<AlertCircle className="text-rose-400" />} label="Negative Pts" val={(sessionData?.wrongCount * (mockData?.negativeMarks || 0.25)).toFixed(1)} sub="Penalty Audit" />
        </section>

        {/* 3. DEEP ANALYSIS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
           
           {/* Charts & Progress */}
           <div className="lg:col-span-8 space-y-8">
              <Card className="border-none shadow-xl rounded-[2.5rem] bg-[#101B32] p-8 md:p-12 space-y-12 border border-white/5">
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><BarChart3 className="h-5 w-5" /></div>
                    <h3 className="text-xl md:text-2xl font-black uppercase text-white tracking-tight">Question distribution</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="h-64 relative flex items-center justify-center">
                       <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                             <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={8} dataKey="value">
                                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                             </Pie>
                             <Tooltip contentStyle={{ backgroundColor: '#101B32', border: 'none', borderRadius: '12px', color: 'white' }} />
                          </PieChart>
                       </ResponsiveContainer>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-black text-white">{questions.length}</span>
                          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Total</span>
                       </div>
                    </div>
                    <div className="space-y-6">
                       <MetricBar label="Accuracy" val={sessionData?.accuracy || 0} color="bg-[#00C853]" />
                       <MetricBar label="Completion" val={questions.length > 0 ? Math.round(((sessionData?.attemptedCount || 0) / questions.length) * 100) : 0} color="bg-[#1976FF]" />
                       <MetricBar label="Speed Hub" val={mockData?.duration > 0 ? Math.min(100, Math.round(((mockData.duration * 60) / (sessionData?.timeTaken || 1)) * 50)) : 0} color="bg-[#FF9800]" />
                    </div>
                 </div>
              </Card>

              {/* Status Message */}
              <div className={cn("p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl flex items-center gap-8 md:gap-12 relative overflow-hidden", performanceStatus.bg)}>
                 <div className="h-16 w-16 md:h-24 md:w-24 rounded-3xl bg-white/10 flex items-center justify-center shrink-0 shadow-2xl">
                    {React.cloneElement(performanceStatus.icon as React.ReactElement, { className: "h-10 w-10 md:h-14 md:w-14" })}
                 </div>
                 <div className="text-left space-y-2">
                    <p className={cn("text-xs md:text-sm font-black uppercase tracking-[0.3em]", performanceStatus.color)}>Institutional Audit</p>
                    <h4 className="text-2xl md:text-4xl font-black text-white tracking-tight uppercase leading-none">{performanceStatus.label} attempt!</h4>
                    <p className="text-slate-400 font-medium text-sm md:text-lg leading-relaxed max-w-xl">
                       {(sessionData?.accuracy || 0) > 80 
                          ? "Your preparation is highly aligned with the official board patterns. Focus on maintaining your pace to secure a top merit rank."
                          : "Great attempt. We recommend reviewing the rationalizations for wrong answers to identify and patch accuracy leaks."}
                    </p>
                 </div>
              </div>
           </div>

           {/* Achievements & Rank Preview */}
           <div className="lg:col-span-4 space-y-8">
              <Card className="border-none shadow-xl rounded-[2.5rem] bg-[#101B32] p-8 md:p-10 border border-white/5 space-y-10">
                 <div className="space-y-1 text-left">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Achievements</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Merit Badges Earned</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    {(sessionData?.accuracy || 0) >= 90 && <BadgeNode icon={<Trophy className="text-amber-400" />} label="Top Tier" />}
                    {(sessionData?.accuracy || 0) === 100 && <BadgeNode icon={<Target className="text-emerald-400" />} label="Perfect" />}
                    {(sessionData?.timeTaken || 0) < (mockData?.duration || 0) * 30 && <BadgeNode icon={<Zap className="text-[#1976FF]" />} label="Quick Node" />}
                    {sessionData?.attemptedCount === questions.length && <BadgeNode icon={<ShieldCheck className="text-blue-400" />} label="Thorough" />}
                    {!((sessionData?.accuracy || 0) >= 90) && (
                       <div className="col-span-2 py-10 text-center opacity-20 italic font-black uppercase text-[10px]">No badges unlocked</div>
                    )}
                 </div>
              </Card>

              <div className="p-8 md:p-12 bg-gradient-to-br from-[#1976FF] to-blue-600 rounded-[2.5rem] md:rounded-[3rem] text-white space-y-8 text-center relative overflow-hidden group shadow-4xl">
                 <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform"><Users className="h-32 w-32" /></div>
                 <div className="space-y-4 relative z-10">
                    <h4 className="text-2xl font-black leading-tight uppercase">Leaderboard Hub</h4>
                    <p className="text-white/70 text-sm font-medium">Compare your detailed analytics with 10,000+ aspirants across Punjab.</p>
                 </div>
                 <Button asChild className="w-full h-14 bg-white text-[#1976FF] hover:bg-slate-50 font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl relative z-10 border-none">
                    <Link href="/leaderboard">Open Merit Index <ChevronRight className="h-4 w-4" /></Link>
                 </Button>
              </div>
           </div>
        </div>

        {/* 4. SOLUTION REWIND TABS */}
        <Tabs defaultValue="SOLUTIONS" className="space-y-8 pt-10">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
              <TabsList className="bg-white/5 border border-white/5 p-1.5 h-14 rounded-2xl inline-flex gap-2">
                 <TabsTrigger value="SOLUTIONS" className="rounded-xl px-10 font-black uppercase text-[10px] h-full data-[state=active]:bg-white data-[state=active]:text-[#0F172A] transition-all tracking-widest">Solutions Hub</TabsTrigger>
              </TabsList>
              
              <div className="flex flex-wrap items-center gap-2">
                 <ReviewFilterBtn active={activeReviewFilter === 'ALL'} onClick={() => setActiveReviewFilter('ALL')} label="All" count={questions.length} icon={<BarChart3 />} color="bg-white/5 border-white/5 text-slate-400" activeColor="bg-white text-[#0F172A] border-white shadow-xl" />
                 <ReviewFilterBtn active={activeReviewFilter === 'CORRECT'} onClick={() => setActiveReviewFilter('CORRECT')} label="Correct" count={sessionData?.correctCount || 0} icon={<CheckCircle2 />} color="bg-[#00C853]/5 border-[#00C853]/10 text-[#00C853]" activeColor="bg-[#00C853] text-white shadow-xl shadow-[#00C853]/20" />
                 <ReviewFilterBtn active={activeReviewFilter === 'WRONG'} onClick={() => setActiveReviewFilter('WRONG')} label="Wrong" count={sessionData?.wrongCount || 0} icon={<XCircle />} color="bg-[#FF5252]/5 border-[#FF5252]/10 text-[#FF5252]" activeColor="bg-[#FF5252] text-white shadow-xl shadow-[#FF5252]/20" />
                 <ReviewFilterBtn active={activeReviewFilter === 'SKIPPED'} onClick={() => setActiveReviewFilter('SKIPPED')} label="Skipped" count={questions.length - (sessionData?.attemptedCount || 0)} icon={<MousePointer2 />} color="bg-slate-700/20 border-white/5 text-slate-400" activeColor="bg-slate-500 text-white shadow-xl" />
              </div>
           </div>

           <TabsContent value="SOLUTIONS" className="space-y-6 md:space-y-10 animate-in fade-in duration-500">
              {filteredQuestions.map((q: any) => {
                 const ans = sessionData?.answers?.[q.index];
                 const isCorrect = ans !== undefined && ['A','B','C','D'][ans] === q.correctAnswer;
                 const isSkipped = ans === undefined || ans === null;
                 
                 return (
                    <Card key={q.id} className="border-none shadow-4xl rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden bg-[#101B32] text-left relative group border border-white/5">
                       <div className={cn("absolute top-0 left-0 w-2 md:w-3 h-full transition-all duration-500", isCorrect ? 'bg-[#00C853]' : isSkipped ? 'bg-slate-500/30' : 'bg-[#FF5252]')} />
                       <CardContent className="p-8 md:p-14 lg:p-20">
                          <div className="flex items-center justify-between mb-10 md:mb-14">
                             <div className="flex items-center gap-5">
                                <span className={cn("h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-sm md:text-2xl shadow-inner", isCorrect ? "bg-[#00C853]/10 text-[#00C853]" : isSkipped ? "bg-white/5 text-slate-500" : "bg-[#FF5252]/10 text-[#FF5252]")}>{q.index + 1}</span>
                                <Badge variant="outline" className="border-white/5 text-slate-400 text-[10px] md:text-[12px] font-black tracking-widest px-4 py-1.5 rounded-xl uppercase">{(q.subjectId || "Official Node")}</Badge>
                             </div>
                             {isCorrect ? (
                                <div className="flex items-center gap-2 text-[#00C853] font-black text-[10px] md:text-sm uppercase tracking-widest"><CheckCircle2 className="h-5 w-5" /> Accurate</div>
                             ) : isSkipped ? (
                                <div className="flex items-center gap-2 text-slate-500 font-black text-[10px] md:text-sm uppercase tracking-widest"><AlertCircle className="h-5 w-5" /> Not Attempted</div>
                             ) : (
                                <div className="flex items-center gap-2 text-[#FF5252] font-black text-[10px] md:text-sm uppercase tracking-widest"><XCircle className="h-5 w-5" /> Error Node</div>
                             )}
                          </div>
                          <div className="w-full text-white">
                            <QuestionRenderer 
                              question={q} 
                              language={mockData?.languageMode || 'ENGLISH_PUNJABI'} 
                              showSolution={true} 
                              selectedAnswer={ans ?? null} 
                              className="p-0 border-none shadow-none max-w-none bg-transparent text-white" 
                            />
                          </div>
                       </CardContent>
                    </Card>
                 )
              })}
           </TabsContent>
        </Tabs>
      </main>
      
      {/* FINAL HUB BRANDING */}
      <section className="py-12 border-t border-white/5 opacity-40">
         <div className="container mx-auto px-4 text-center space-y-2">
            <h4 className="text-xl font-black tracking-[0.4em] uppercase text-white">Cracklix</h4>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Punjab Government Exam Preparation Platform</p>
         </div>
      </section>

      <Footer />
    </div>
  )
}

function ScoreStat({ icon, label, value, sub }: any) {
   return (
      <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center gap-5 group hover:bg-white/10 transition-all duration-300">
         <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">{icon}</div>
         <div className="min-w-0 text-left">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
            <p className="text-xl md:text-2xl font-black text-white leading-none tabular-nums">{value}</p>
            <p className="text-[8px] font-bold text-slate-500 mt-1 uppercase tracking-tight">{sub}</p>
         </div>
      </div>
   )
}

function LedgerCard({ icon, label, val, sub }: any) {
   return (
      <Card className="border-none bg-[#101B32] rounded-[2rem] p-6 md:p-10 space-y-4 hover:translate-y-[-4px] transition-all duration-500 group border border-white/5 text-left">
         <div className="h-11 w-11 md:h-14 md:w-14 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            {React.cloneElement(icon as React.ReactElement, { className: "h-6 w-6 md:h-8 md:w-8" })}
         </div>
         <div className="space-y-1">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
            <p className="text-2xl md:text-4xl font-black text-white leading-none tabular-nums tracking-tighter">{val}</p>
            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-tight">{sub}</p>
         </div>
      </Card>
   )
}

function MetricBar({ label, val, color }: any) {
   return (
      <div className="space-y-3 text-left">
         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
            <span className="text-slate-400">{label}</span>
            <span className="text-white tabular-nums">{val}%</span>
         </div>
         <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 1.5 }} className={cn("h-full rounded-full shadow-[0_0_10px_rgba(25,118,255,0.4)]", color)} />
         </div>
      </div>
   )
}

function BadgeNode({ icon, label }: any) {
   return (
      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-3 group transition-all hover:bg-white/10 hover:translate-y-[-2px]">
         <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/5 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">{icon}</div>
         <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
   )
}

function ReviewFilterBtn({ active, onClick, label, count, icon, color, activeColor }: any) {
   return (
      <button onClick={onClick} className={cn("px-5 py-3 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest border transition-all flex items-center gap-3 active:scale-95", active ? activeColor : `${color}`)}>
         {React.cloneElement(icon as React.ReactElement, { className: "h-4 w-4" })} {label} <span className="opacity-40 tabular-nums">{count}</span>
      </button>
   )
}

