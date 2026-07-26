
'use client';

import React, { useState, useMemo, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useFirestore, useDoc } from "@/firebase"
import { 
  collection, 
  query, 
  doc, 
  getDoc, 
  documentId, 
  getDocs, 
  deleteDoc,
  where,
  limit,
  increment,
  updateDoc,
  getCountFromServer,
  serverTimestamp
} from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { 
  Trophy, 
  Target, 
  Zap, 
  Loader2, 
  ShieldCheck,
  CheckCircle2,
  Clock,
  BarChart3,
  Download,
  RotateCcw,
  Layers,
  XCircle,
  ArrowRight,
  BookOpen,
  X,
  TrendingUp,
  AlertCircle,
  Award,
  Activity,
  Timer
} from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import { motion, AnimatePresence } from "framer-motion"
import ResultCard from "./ResultCard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BrandingSettings } from "@/types"
import { AuthorityLogo } from "@/lib/exam-icons"
import { useExamStore } from "@/store/useExamStore"
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * @fileOverview Cracklix Advanced Analytics Engine V2 [Hardened].
 * Replaced existing calculations with professional formulas:
 * Attempt Accuracy, Overall Accuracy, Readiness Score, Grade System, and Topper Comparison.
 */

export default function ResultClient() {
  const db = useFirestore()
  const { user, profile, loading: userLoading } = useUser()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const resetStore = useExamStore(s => s.resetStore);
  
  const [mounted, setMounted] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [activeReviewFilter, setActiveReviewFilter] = useState<'ALL' | 'CORRECT' | 'WRONG' | 'SKIPPED'>('ALL')
  const [guestResult, setGuestResult] = useState<any>(null)
  const [activeMainTab, setActiveMainTab] = useState<string>("OVERVIEW")
  const [isExporting, setIsExporting] = useState(false)
  
  const [sessionData, setSessionData] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(true);
  const [errorNotFound, setErrorNotFound] = useState(false);
  
  const [liveRank, setLiveRank] = useState<number | string>("---")
  const [totalCandidates, setTotalCandidates] = useState<number>(0)
  const [topperScore, setTopperScore] = useState<number>(0)
  const [avgScore, setAvgScore] = useState<number>(0)

  useEffect(() => { setMounted(true) }, [])

  const mockId = searchParams.get('id')
  const attemptIdFromUrl = searchParams?.get('attemptId')

  const { data: branding } = useDoc<BrandingSettings>(useMemo(() => (db ? doc(db, 'settings', 'branding') : null), [db]));

  useEffect(() => {
    if (userLoading || !db || !mockId || !mounted) return;
    
    let isSubscribed = true;
    let retryCount = 0;
    const MAX_RETRIES = 6;

    async function resolveId() {
       setIsSearching(true);
       setErrorNotFound(false);

       if (!user) {
          const guestRes = localStorage.getItem(`cracklix_guest_result_${mockId}`);
          if (guestRes) {
             setGuestResult(JSON.parse(guestRes));
             setIsSearching(false);
          } else {
             setErrorNotFound(true);
             setIsSearching(false);
          }
          return;
       }

       const targetId = attemptIdFromUrl 
          ? `${user.uid}_${mockId}_${attemptIdFromUrl}` 
          : `${user.uid}_${mockId}`;

       const tryFetch = async () => {
          if (!isSubscribed) return;
          try {
             const docRef = doc(db, "results", targetId);
             const snap = await getDoc(docRef);

             if (snap.exists()) {
                setSessionData({ ...snap.data(), id: snap.id });
                setIsSearching(false);
                return;
             }

             const resQuery = query(
                collection(db, "results"),
                where("userId", "==", user.uid),
                where("mockId", "==", mockId),
                limit(5)
             );
             const querySnap = await getDocs(resQuery);
             if (!querySnap.empty) {
                const results = querySnap.docs.map(d => ({ ...d.data(), id: d.id }));
                const latest = results.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
                setSessionData(latest);
                setIsSearching(false);
                return;
             }

             if (retryCount < MAX_RETRIES) {
                retryCount++;
                setTimeout(tryFetch, 600);
             } else {
                setErrorNotFound(true);
                setIsSearching(false);
             }
          } catch (e) {
             setErrorNotFound(true);
             setIsSearching(false);
          }
       };

       tryFetch();
    }

    resolveId();
    return () => { isSubscribed = false; };
  }, [user, userLoading, db, mockId, attemptIdFromUrl, mounted]);

  const activeSession = useMemo(() => user ? sessionData : guestResult, [user, sessionData, guestResult]);

  useEffect(() => {
     if (!db || !mockId || !activeSession) return;
     async function fetchRankingMetrics() {
        try {
           const entriesRef = collection(db, "leaderboards", mockId, "entries");
           const countSnap = await getCountFromServer(entriesRef);
           setTotalCandidates(countSnap.data().count);
           
           const superiorQuery = query(entriesRef, where("highestScore", ">", activeSession.score));
           const superiorCountSnap = await getCountFromServer(superiorQuery);
           setLiveRank(superiorCountSnap.data().count + 1);

           const topperQuery = query(entriesRef, orderBy("highestScore", "desc"), limit(1));
           const topperSnap = await getDocs(topperQuery);
           if (!topperSnap.empty) {
              setTopperScore(topperSnap.docs[0].data().highestScore);
           }

           const allQuery = query(entriesRef, limit(100));
           const allSnap = await getDocs(allQuery);
           const scores = allSnap.docs.map(d => d.data().highestScore);
           setAvgScore(scores.reduce((a, b) => a + b, 0) / (scores.length || 1));

        } catch (e) {}
     }
     fetchRankingMetrics();
  }, [db, mockId, activeSession]);

  useEffect(() => {
    async function loadQuestions() {
      if (!db || !mockId) { setLoadingQuestions(false); return; }
      try {
        setLoadingQuestions(true);
        let mockSnap = await getDoc(doc(db, "mocks", mockId));
        if (!mockSnap.exists()) mockSnap = await getDoc(doc(db, "daily_quizzes", mockId));
        
        if (mockSnap.exists()) {
          const mData = mockSnap.data();
          const questionIds = mData.questionIds || [];
          if (questionIds.length > 0) {
            const fetchedQuestions: any[] = [];
            const chunks = [];
            for (let i = 0; i < questionIds.length; i += 30) { chunks.push(questionIds.slice(i, i + 30)) }
            for (const chunk of chunks) {
              const [mcqSnap, legacySnap, usedSnap] = await Promise.all([
                 getDocs(query(collection(db, "mcqBank"), where(documentId(), "in", chunk))),
                 getDocs(query(collection(db, "questions"), where(documentId(), "in", chunk))),
                 getDocs(query(collection(db, "usedQuestions"), where(documentId(), "in", chunk)))
              ]);
              mcqSnap.docs.forEach(d => fetchedQuestions.push({ ...d.data(), id: d.id }));
              legacySnap.forEach(d => { if (!fetchedQuestions.find(f => f.id === d.id)) fetchedQuestions.push({ ...d.data(), id: d.id }); });
              usedSnap.forEach(d => { if (!fetchedQuestions.find(f => f.id === d.id)) fetchedQuestions.push({ ...d.data(), id: d.id }); });
            }
            setQuestions(questionIds.map((id: string) => fetchedQuestions.find((q: any) => q.id === id)).filter(Boolean));
          }
        }
      } catch (e) {} finally { setLoadingQuestions(false) }
    }
    loadQuestions()
  }, [db, mockId]);

  const metrics = useMemo(() => {
    if (!activeSession) return null;
    
    const posMarks = activeSession.positiveMarks || 1;
    const negMarks = activeSession.negativeMarks || 0.25;
    const correct = activeSession.correctCount || 0;
    const wrong = activeSession.wrongCount || 0;
    const totalQ = activeSession.totalQuestions || questions.length;
    const attempted = correct + wrong;
    
    const score = Number(activeSession.score) || 0;
    const maxMarks = totalQ * posMarks;
    const percentage = (score / maxMarks) * 100;
    
    const attemptAccuracy = attempted > 0 ? (correct / attempted) * 100 : 0;
    const overallAccuracy = (correct / totalQ) * 100;
    const attemptRate = (attempted / totalQ) * 100;
    
    const readiness = (percentage + attemptAccuracy + attemptRate) / 3;
    
    const getGrade = (p: number) => {
      if (p >= 90) return "A+";
      if (p >= 80) return "A";
      if (p >= 70) return "B+";
      if (p >= 60) return "B";
      if (p >= 50) return "C";
      if (p >= 40) return "D";
      if (p >= 30) return "E";
      return "F";
    };

    const getReadinessLevel = (r: number) => {
      if (r >= 80) return "Excellent";
      if (r >= 60) return "Good";
      if (r >= 40) return "Average";
      if (r >= 20) return "Weak";
      return "Critical";
    };

    const percentile = totalCandidates > 1 
      ? Number(Math.max(0, ((totalCandidates - Number(liveRank)) / totalCandidates) * 100).toFixed(1))
      : 0;

    return {
      score,
      maxMarks,
      percentage,
      attemptAccuracy,
      overallAccuracy,
      attemptRate,
      readiness,
      readinessLevel: getReadinessLevel(readiness),
      grade: getGrade(percentage),
      isQualified: percentage >= 40,
      percentile,
      topperGap: Math.max(0, topperScore - score)
    };
  }, [activeSession, questions, liveRank, totalCandidates, topperScore]);

  const handleRetake = useCallback(() => {
    if (!mockId) return;
    if (user && db) { deleteDoc(doc(db, "attempts", `${user.uid}_${mockId}`)).catch(() => {}); }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`cracklix_guest_attempt_${mockId}`);
      localStorage.removeItem(`cracklix_guest_result_${mockId}`);
    }
    resetStore();
    router.push(`/mocks/attempt?id=${mockId}&retake=true`);
  }, [db, mockId, user, router, resetStore]);

  const handleDownloadPDF = async () => { 
    if (isExporting || !activeSession) return;
    setIsExporting(true);
    
    try {
      setActiveMainTab("REPORT"); 
      toast({ title: "Capturing institutional report..." });
      
      await new Promise(r => setTimeout(r, 1200));
      if (typeof window !== 'undefined' && 'fonts' in document) {
         await (document as any).fonts.ready;
      }
      
      const element = document.getElementById('cracklix-result-card');
      if (!element) throw new Error("Analysis node missing from DOM.");

      const style = document.createElement('style');
      style.id = 'cracklix-export-hardening';
      style.innerHTML = `
        #cracklix-result-card * {
          opacity: 1 !important;
          filter: none !important;
          text-shadow: none !important;
        }
        #cracklix-result-card .text-slate-300, 
        #cracklix-result-card .text-slate-400 { color: #475569 !important; }
      `;
      document.head.appendChild(style);

      const canvas = await html2canvas(element, {
        scale: 4,
        useCORS: true,
        backgroundColor: "#FFFFFF",
        logging: false,
        foreignObjectRendering: true
      });

      style.remove();

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
      pdf.save(`Result_${activeSession.userName}.pdf`);
      
      toast({ title: "PDF Export Complete" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Export Failed" });
    } finally {
      setIsExporting(false);
    }
  };

  const reviewNodes = useMemo(() => {
    if (!activeSession || !questions.length) return { all: [], correct: [], wrong: [], skipped: [] };
    const all = questions.map((q, i) => ({ ...q, originalIndex: i }));
    const correct: any[] = [], wrong: any[] = [], skipped: any[] = [];
    all.forEach((q) => {
      const ans = activeSession.answers?.[q.originalIndex] ?? activeSession.answers?.[String(q.originalIndex)];
      const isAttempted = ans !== null && ans !== undefined && String(ans) !== "";
      if (!isAttempted) skipped.push(q);
      else {
        const userSelectedLabel = ['A', 'B', 'C', 'D'][Number(ans)];
        if (userSelectedLabel === q.correctAnswer) correct.push(q); else wrong.push(q);
      }
    });
    return { all, correct, wrong, skipped };
  }, [questions, activeSession]);

  const filteredQuestions = useMemo(() => {
    if (activeReviewFilter === 'CORRECT') return reviewNodes.correct;
    if (activeReviewFilter === 'WRONG') return reviewNodes.wrong;
    if (activeReviewFilter === 'SKIPPED') return reviewNodes.skipped;
    return reviewNodes.all;
  }, [activeReviewFilter, reviewNodes]);

  const formatTimeStr = (secs: number) => {
     if (!secs || secs <= 0) return "---";
     const m = Math.floor(secs / 60);
     const s = secs % 60;
     return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  if (!mounted || isSearching) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-6">
      <Zap className="h-10 w-10 text-primary animate-spin" />
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Syncing Analysis Node...</p>
    </div>
  );

  if (errorNotFound || !activeSession || !metrics) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <Card className="max-w-md w-full bg-white rounded-[3rem] p-10 md:p-16 shadow-5xl border border-slate-100 space-y-10">
          <AlertCircle className="h-16 w-16 text-rose-500 mx-auto" />
          <h2 className="text-2xl font-black text-[#0F172A] tracking-tighter uppercase">Entry Not Found</h2>
          <Button asChild className="w-full h-16 bg-[#0F172A] rounded-2xl font-bold"><Link href="/dashboard">Return to Hub</Link></Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-[#0F172A] selection:bg-primary/10 flex flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-12 space-y-8 md:space-y-10 pb-40">
        
        {/* HEADER HUB */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8 px-1 print:hidden">
           <div className="flex items-center gap-5 md:gap-10 text-left w-full lg:w-auto">
              <AuthorityLogo boardId={activeSession?.boardId || "GENERAL"} size="lg" className="h-14 w-14 md:h-24 md:w-24 rounded-2xl shadow-xl" />
              <div className="space-y-1 flex-1 min-w-0">
                 <div className="flex items-center gap-2">
                    <Badge className={cn("border-none text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm", metrics.isQualified ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                       {metrics.isQualified ? "Qualified" : "Not Qualified"}
                    </Badge>
                 </div>
                 <h1 className="text-xl md:text-3xl font-black tracking-tight text-[#0F172A] leading-tight truncate">
                   {activeSession?.mockTitle}
                 </h1>
                 <div className="flex flex-wrap items-center justify-start gap-2 md:gap-3 font-bold text-[9px] md:text-xs text-slate-400">
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {new Date(activeSession.timestamp).toLocaleDateString('en-GB')}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-200" />
                    <span>Attempt ID: {activeSession.attemptId?.slice(0, 8)}</span>
                 </div>
              </div>
           </div>
           
           <div className="flex flex-col gap-3 w-full lg:w-auto shrink-0">
              <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="bg-white border border-slate-100 p-1 rounded-xl shadow-sm">
                 <TabsList className="bg-transparent border-none p-0 flex h-10 w-full gap-1">
                    <TabsTrigger value="OVERVIEW" className="flex-1 rounded-lg px-6 font-bold text-[10px] uppercase data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Summary</TabsTrigger>
                    <TabsTrigger value="REVIEW" className="flex-1 rounded-lg px-6 font-bold text-[10px] uppercase data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Review</TabsTrigger>
                    <TabsTrigger value="REPORT" className="flex-1 rounded-lg px-6 font-bold text-[10px] uppercase data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Report</TabsTrigger>
                 </TabsList>
              </Tabs>
              <div className="flex gap-2">
                 <Button variant="outline" onClick={handleRetake} className="flex-1 h-11 border-2 font-bold uppercase text-[10px] rounded-xl"><RotateCcw className="h-3.5 w-3.5 mr-2" /> Retake</Button>
                 <Button onClick={handleDownloadPDF} disabled={isExporting} className="flex-1 h-11 bg-primary text-white font-bold uppercase text-[10px] rounded-xl shadow-lg shadow-primary/20">
                    {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5 mr-2" />} Export PDF
                 </Button>
              </div>
           </div>
        </div>

        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full space-y-12">
            <TabsContent value="OVERVIEW" className="space-y-12 animate-in fade-in duration-500">
                {/* 1. SCORE MATRIX */}
                <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
                  <StatCard label="Net Score" val={`${metrics.score} / ${metrics.maxMarks}`} sub={`${metrics.percentage.toFixed(1)}%`} icon={<Zap className="text-primary" />} />
                  <StatCard label="Punjab Rank" val={`#${liveRank}`} sub={`of ${totalCandidates}`} icon={<Trophy className="text-amber-500" />} highlight />
                  <StatCard label="Percentile" val={`${metrics.percentile}%`} sub="Verified" icon={<TrendingUp className="text-blue-500" />} />
                  <StatCard label="Attempt Acc." val={`${metrics.attemptAccuracy.toFixed(1)}%`} sub="Question focus" icon={<Target className="text-emerald-500" />} />
                  <StatCard label="Overall Acc." val={`${metrics.overallAccuracy.toFixed(1)}%`} sub="Bank density" icon={<ShieldCheck className="text-indigo-500" />} />
                  <StatCard label="Grade" val={metrics.grade} sub="Institutional" icon={<Award className="text-purple-500" />} />
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                  {/* 2. TOPPER COMPARISON & READINESS */}
                  <div className="lg:col-span-8 space-y-10">
                      <Card className="border border-slate-100 shadow-xl rounded-[2.5rem] bg-white p-8 md:p-12 text-left">
                          <h3 className="text-xl md:text-2xl font-black text-[#0F172A] uppercase tracking-tighter mb-10 flex items-center gap-4">
                             <TrendingUp className="h-6 w-6 text-primary" /> Topper comparison
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                             <div className="space-y-8">
                                <ComparisonPill label="Your Score" val={metrics.score} color="bg-primary" />
                                <ComparisonPill label="Avg Score" val={Number(avgScore.toFixed(1))} color="bg-slate-200" />
                                <ComparisonPill label="Topper Score" val={topperScore} color="bg-amber-400" />
                             </div>
                             <div className="bg-slate-50 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center space-y-4 border border-slate-100">
                                <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-md">
                                   <Target className="h-6 w-6 text-rose-500" />
                                </div>
                                <div>
                                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Gap from topper</p>
                                   <p className="text-4xl font-black text-[#0F172A] tabular-nums mt-1">-{metrics.topperGap.toFixed(1)}</p>
                                </div>
                                <p className="text-xs font-bold text-slate-500 max-w-[200px] leading-relaxed">Focus on weak subjects to close this gap.</p>
                             </div>
                          </div>
                      </Card>

                      <Card className="border border-slate-100 shadow-xl rounded-[2.5rem] bg-white p-8 md:p-12 text-left">
                          <div className="flex justify-between items-center mb-10">
                             <h3 className="text-xl md:text-2xl font-black text-[#0F172A] uppercase tracking-tighter flex items-center gap-4">
                                <ShieldCheck className="h-6 w-6 text-emerald-500" /> Readiness score
                             </h3>
                             <Badge className={cn(
                                "border-none text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg uppercase",
                                metrics.readiness >= 80 ? "bg-emerald-50 text-white" :
                                metrics.readiness >= 60 ? "bg-blue-500 text-white" :
                                metrics.readiness >= 40 ? "bg-amber-500 text-white" : "bg-rose-50 text-white"
                             )}>
                                {metrics.readinessLevel}
                             </Badge>
                          </div>
                          
                          <div className="space-y-8">
                             <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner flex">
                                <div className="h-full bg-rose-500 w-[20%]" />
                                <div className="h-full bg-amber-500 w-[20%]" />
                                <div className="h-full bg-blue-500 w-[20%]" />
                                <div className="h-full bg-blue-600 w-[20%]" />
                                <div className="h-full bg-emerald-500 w-[20%]" />
                             </div>
                             <div className="relative pt-4">
                                <motion.div 
                                   initial={{ left: 0 }}
                                   animate={{ left: `${metrics.readiness}%` }}
                                   transition={{ duration: 2, ease: "easeOut" }}
                                   className="absolute -top-12 -translate-x-1/2 flex flex-col items-center gap-1"
                                >
                                   <div className="px-3 py-1 bg-[#0F172A] text-white text-[10px] font-black rounded-lg shadow-xl">{metrics.readiness.toFixed(1)}</div>
                                   <div className="w-1 h-12 bg-[#0F172A] rounded-full" />
                                </motion.div>
                                <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                   <span>Critical</span>
                                   <span>Weak</span>
                                   <span>Average</span>
                                   <span>Good</span>
                                   <span>Excellent</span>
                                </div>
                             </div>
                          </div>
                      </Card>
                  </div>

                  {/* 3. SIDEBAR INSIGHTS */}
                  <div className="lg:col-span-4 space-y-8">
                      <Card className="border-none shadow-xl rounded-[2.5rem] bg-[#0F172A] text-white p-8 md:p-10 space-y-8 relative overflow-hidden h-full">
                          <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Zap className="h-64 w-64 text-primary" /></div>
                          <div className="relative z-10 space-y-8 text-left">
                             <div className="space-y-1">
                                <h3 className="text-2xl font-black tracking-tight leading-tight uppercase">Smart Insights</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Performance Audit</p>
                             </div>
                             <div className="space-y-6">
                                <InsightItem text={`You attempted ${metrics.attemptRate.toFixed(1)}% questions. ${metrics.attemptRate < 50 ? 'Your attempt rate is very low. Focus on attempting more.' : 'Good attempt volume.'}`} />
                                <InsightItem text={`Attempt accuracy is ${metrics.attemptAccuracy.toFixed(1)}%. ${metrics.attemptAccuracy < 60 ? 'High error rate detected. Reduce guesswork.' : 'Strong precision.'}`} />
                                <InsightItem text={metrics.isQualified ? 'You have met the institutional cutoff. Maintain consistency.' : 'Performance is below cutoff. Intensive revision required.'} />
                             </div>
                             <div className="pt-8 border-t border-white/5">
                                <Button asChild variant="ghost" className="w-full text-primary hover:text-white hover:bg-white/5 font-black uppercase text-[10px] tracking-widest gap-2">
                                   <Link href="/leaderboard">Merit rankings <ArrowRight className="h-3.5 w-3.5" /></Link>
                                </Button>
                             </div>
                          </div>
                      </Card>
                  </div>
                </div>

                {/* 4. SUBJECT BREAKDOWN */}
                <section className="space-y-8">
                   <h3 className="text-xl md:text-3xl font-black text-[#0F172A] uppercase tracking-tighter px-1 flex items-center gap-4">
                      <Layers className="h-8 w-8 text-blue-500" /> Subject level audit
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                      {activeSession.subjectAnalysis?.map((sub: any, i: number) => (
                         <Card key={i} className="border border-slate-100 shadow-xl rounded-[2.5rem] bg-white p-8 flex flex-col gap-6 text-left group hover:-translate-y-1 transition-all">
                            <div className="flex justify-between items-start">
                               <h4 className="text-lg font-black text-[#0F172A] line-clamp-1">{sub.name}</h4>
                               <Badge className={cn(
                                  "border-none text-[8px] font-black uppercase",
                                  sub.accuracy >= 70 ? "bg-emerald-50 text-emerald-600" : sub.accuracy >= 40 ? "bg-blue-50 text-blue-600" : "bg-rose-50 text-rose-600"
                               )}>{sub.accuracy}% Mastery</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <SubjectMetric label="Correct" val={sub.correct} color="text-emerald-600" />
                               <SubjectMetric label="Wrong" val={sub.wrong} color="text-rose-600" />
                               <SubjectMetric label="Skipped" val={sub.total - (sub.correct + sub.wrong)} color="text-slate-400" />
                               <SubjectMetric label="Net Score" val={sub.score.toFixed(1)} color="text-primary" />
                            </div>
                            <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden mt-2">
                               <motion.div initial={{ width: 0 }} animate={{ width: `${sub.accuracy}%` }} className={cn("h-full", sub.accuracy >= 70 ? "bg-emerald-500" : "bg-blue-500")} />
                            </div>
                         </Card>
                      ))}
                   </div>
                </section>
            </TabsContent>

            <TabsContent value="REVIEW" className="space-y-10 animate-in fade-in duration-500">
                <div className="max-w-4xl mx-auto space-y-10">
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl shadow-xl border border-slate-100 w-fit mx-auto overflow-x-auto no-scrollbar">
                    <FilterButton active={activeReviewFilter === 'ALL'} label="All Items" onClick={() => setActiveReviewFilter('ALL')} />
                    <FilterButton active={activeReviewFilter === 'WRONG'} label={`Wrong (${reviewNodes.wrong.length})`} onClick={() => setActiveReviewFilter('WRONG')} color="rose" />
                    <FilterButton active={activeReviewFilter === 'CORRECT'} label="Correct" onClick={() => setActiveReviewFilter('CORRECT')} color="emerald" />
                    <FilterButton active={activeReviewFilter === 'SKIPPED'} label="Skipped" onClick={() => setActiveReviewFilter('SKIPPED')} color="slate" />
                </div>

                <div className="space-y-8">
                    {filteredQuestions.map((q) => {
                        const rawAns = activeSession.answers?.[q.originalIndex] ?? activeSession.answers?.[String(q.originalIndex)];
                        const isAttempted = rawAns !== null && rawAns !== undefined && String(rawAns) !== "";
                        return (
                            <Card key={q.id} className="border border-slate-100 shadow-2xl rounded-[2.5rem] md:rounded-[3rem] overflow-hidden bg-white text-left group">
                            <div className="p-8 md:p-14 space-y-8">
                                <Badge variant="outline" className="px-4 py-1 rounded-full border-slate-100 text-slate-400 font-black text-[9px] uppercase tracking-widest">
                                    Node #{q.originalIndex + 1}
                                </Badge>
                                <QuestionRenderer 
                                    question={q} 
                                    language={activeSession.languageMode || 'ENGLISH_PUNJABI'} 
                                    showSolution={true} 
                                    selectedAnswer={isAttempted ? Number(rawAns) : null} 
                                    className="p-0 shadow-none border-none bg-transparent" 
                                />
                            </div>
                            </Card>
                        )
                    })}
                </div>
                </div>
            </TabsContent>

            <TabsContent value="REPORT" className="animate-in zoom-in-95 duration-700 pb-20">
                <div className="flex flex-col items-center overflow-x-auto no-scrollbar">
                <div className="bg-white p-0 rounded-none shadow-5xl border border-slate-100 overflow-hidden min-w-[320px] max-w-full">
                    <ResultCard 
                        studentName={activeSession.userName || profile?.name || "Aspirant"} 
                        examTitle={activeSession.mockTitle || "Mock Test"} 
                        score={metrics.score.toFixed(1)} 
                        rank={liveRank} 
                        accuracy={metrics.overallAccuracy.toFixed(1)} 
                        timeTaken={formatTimeStr(activeSession.timeTaken)} 
                        correct={activeSession.correctCount} 
                        wrong={activeSession.wrongCount} 
                        total={questions.length} 
                        date={new Date(activeSession.timestamp).toLocaleDateString('en-GB')} 
                        resultId={activeSession.id || "REGISTRY_NODE"} 
                        percentile={metrics.percentile} 
                        branding={branding}
                        subjects={activeSession.subjectAnalysis}
                        grade={metrics.grade}
                    />
                </div>
                </div>
            </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}

function StatCard({ label, val, sub, icon, highlight }: any) {
  return (
    <Card className={cn(
       "border border-slate-100 shadow-md bg-white p-5 md:p-8 rounded-2xl md:rounded-[2rem] text-left relative overflow-hidden h-full flex flex-col justify-center transition-all hover:translate-y-[-4px]",
       highlight && "ring-4 ring-primary/5 border-primary/20"
    )}>
       <div className="absolute top-0 right-0 p-4 opacity-5">{icon}</div>
       <div className="space-y-1 relative z-10">
          <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
          <p className={cn("text-xl md:text-3xl font-black text-[#0F172A] tabular-nums tracking-tighter leading-none", highlight && "text-primary")}>{val}</p>
          {sub && <p className="text-[8px] md:text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tight">{sub}</p>}
       </div>
    </Card>
  )
}

function ComparisonPill({ label, val, color }: any) {
   return (
      <div className="space-y-3">
         <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest">
            <span>{label}</span>
            <span className="text-[#0F172A] tabular-nums">{val}</span>
         </div>
         <div className="h-3 w-full bg-slate-50 rounded-lg overflow-hidden border border-slate-100 shadow-inner">
            <motion.div initial={{ width: 0 }} whileInView={{ width: `${(val / 100) * 100}%` }} className={cn("h-full shadow-lg", color)} />
         </div>
      </div>
   )
}

function InsightItem({ text }: { text: string }) {
   return (
      <div className="flex items-start gap-4 group">
         <div className="h-6 w-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5 shadow-inner group-hover:bg-primary/20 transition-all">
            <Zap className="h-3 w-3 text-primary" />
         </div>
         <p className="text-[11px] md:text-[13px] font-medium text-slate-400 leading-relaxed group-hover:text-white transition-colors">{text}</p>
      </div>
   )
}

function SubjectMetric({ label, val, color }: any) {
   return (
      <div className="space-y-1">
         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
         <p className={cn("text-sm md:text-lg font-black tabular-nums leading-none", color)}>{val}</p>
      </div>
   )
}

function FilterButton({ active, label, onClick, color = "primary" }: any) {
   return (
      <button 
        onClick={onClick} 
        className={cn(
          "px-4 md:px-8 py-2.5 rounded-xl text-[9px] md:text-[11px] font-black tracking-widest transition-all active:scale-95 whitespace-nowrap border border-transparent uppercase",
          active 
            ? color === 'rose' ? "bg-rose-600 text-white shadow-lg" : 
              color === 'emerald' ? "bg-emerald-600 text-white shadow-lg" :
              "bg-[#0F172A] text-white shadow-lg"
            : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
        )}
      >
         {label}
      </button>
   )
}

function HubTab({ value, label }: { value: string, label: string }) {
   return (
      <TabsTrigger value={value} className="flex-1 rounded-lg px-2 md:px-8 font-black text-[9px] md:text-[11px] uppercase tracking-widest data-[state=active]:bg-[#0F172A] data-[state=active]:text-white data-[state=active]:shadow-xl transition-all h-full">
         {label}
      </TabsTrigger>
   )
}
