
"use client"

import React, { useState, useMemo, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase"
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
  serverTimestamp,
  orderBy
} from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { 
  Zap, 
  Loader2, 
  ShieldCheck,
  Clock,
  BarChart3,
  Download,
  RotateCcw,
  Layers,
  ArrowRight,
  X,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Trophy,
  Target,
  History
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
import { useExamStore } from "@/store/useExamStore"
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * @fileOverview Institutional Result Hub V4.
 * FIXED: Terminology normalized to "Questions".
 * FIXED: Reliable high-fidelity PDF capture with 100% asset synchronization.
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
  const [mockData, setMockData] = useState<any>(null)
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
                const resultsList = querySnap.docs.map(d => ({ ...d.data(), id: d.id }));
                const latest = resultsList.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
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
           if (!topperSnap.empty) setTopperScore(topperSnap.docs[0].data().highestScore);

           const allQuery = query(entriesRef, limit(100));
           const allSnap = await getDocs(allQuery);
           const scores = allSnap.docs.map(d => d.data().highestScore);
           setAvgScore(scores.reduce((a, b) => a + b, 0) / (scores.length || 1));
        } catch (e) {}
     }
     fetchRankingMetrics();
  }, [db, mockId, activeSession]);

  const finalMetrics = useMemo(() => {
    if (!activeSession) return null;
    const score = Number(activeSession.score) || 0;
    const totalQ = Number(activeSession.totalQuestions) || 0;
    const maxMarks = Number(activeSession.maxMarks) || totalQ;
    const percentage = Number(activeSession.percentage) || ((score / maxMarks) * 100);
    const attemptAccuracy = Number(activeSession.attemptAccuracy) || 0;
    const overallAccuracy = Number(activeSession.overallAccuracy) || 0;
    const attemptRate = Number(activeSession.attemptRate) || 0;
    const readiness = Number(activeSession.readiness) || 0;
    const grade = activeSession.grade || "F";
    const isQualified = activeSession.isQualified || percentage >= 40;
    
    let readinessLevel = "Critical";
    if (readiness >= 80) readinessLevel = "Excellent";
    else if (readiness >= 60) readinessLevel = "Good";
    else if (readiness >= 40) readinessLevel = "Average";
    else if (readiness >= 20) readinessLevel = "Weak";

    const percentile = totalCandidates > 1 
      ? Number(Math.max(0, ((totalCandidates - Number(liveRank)) / totalCandidates) * 100).toFixed(1)) 
      : 0;

    return { 
      score, maxMarks, percentage, attemptAccuracy, overallAccuracy, 
      attemptRate, readiness, readinessLevel, 
      grade, isQualified, percentile, topperGap: Math.max(0, topperScore - score) 
    };
  }, [activeSession, totalCandidates, liveRank, topperScore]);

  useEffect(() => {
    async function loadQuestions() {
      if (!db || !mockId) { setLoadingQuestions(false); return; }
      try {
        setLoadingQuestions(true);
        let mockSnap = await getDoc(doc(db, "mocks", mockId));
        if (!mockSnap.exists()) mockSnap = await getDoc(doc(db, "daily_quizzes", mockId));
        
        if (mockSnap.exists()) {
          const mData = mockSnap.data();
          setMockData(mData);
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
      toast({ title: "Preparing high-fidelity report..." });
      
      await new Promise(r => setTimeout(r, 1500));
      if (typeof window !== 'undefined' && 'fonts' in document) await (document as any).fonts.ready;
      
      const element = document.getElementById('cracklix-result-card');
      if (!element) throw new Error("Report node not found.");

      const canvas = await html2canvas(element, { 
        scale: 4, 
        useCORS: true, 
        backgroundColor: "#FFFFFF", 
        logging: false, 
        foreignObjectRendering: true,
        allowTaint: true,
        imageTimeout: 20000
      });

      if (!canvas || canvas.width === 0) throw new Error("Capture failed.");

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
      pdf.save(`Cracklix_Report_${activeSession.userName || 'Aspirant'}.pdf`);
      
      toast({ title: "Report downloaded" });
    } catch (e: any) { 
       toast({ variant: "destructive", title: "Export Failed", description: "Please retry." }); 
    } finally { setIsExporting(false); }
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
     const m = Math.floor(secs / 60); const s = secs % 60;
     return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  if (!mounted || isSearching) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4">
      <Zap className="h-8 w-8 text-primary animate-spin" />
      <p className="text-[10px] font-bold text-slate-400">Syncing analysis...</p>
    </div>
  );

  if (errorNotFound) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
       <Card className="max-w-md w-full bg-white rounded-[3rem] p-10 md:p-14 shadow-5xl border-none space-y-10 animate-in fade-in zoom-in-95">
          <div className="h-20 w-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto text-rose-500 shadow-inner border border-rose-100">
             <AlertCircle className="h-10 w-10" />
          </div>
          <div className="space-y-3 text-left">
             <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight">Record Not Found</h2>
             <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed">Could not synchronize your attempt node. Try refreshing.</p>
          </div>
          <Button onClick={() => window.location.reload()} className="w-full h-14 bg-primary text-white rounded-2xl font-bold shadow-xl border-none active:scale-95"><RefreshCw className="h-4 w-4 mr-2" /> Re-sync</Button>
       </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-[#0F172A] selection:bg-primary/10 flex flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-10 space-y-6 md:space-y-10 pb-40">
        
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 px-1 print:hidden">
           <div className="flex items-center gap-4 md:gap-8 text-left w-full lg:w-auto">
              <AuthorityLogo boardId={activeSession?.boardId || "GENERAL"} size="md" className="h-12 w-12 md:h-14 md:w-14 rounded-xl shadow-lg bg-white border-2 border-slate-50" />
              <div className="space-y-1 flex-1 min-w-0">
                 <div className="flex items-center gap-2">
                    <Badge className={cn("border-none text-[8px] font-bold px-2 py-0.5 rounded-full shadow-sm", finalMetrics?.isQualified ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                       {finalMetrics?.isQualified ? "Qualified" : "Failed"}
                    </Badge>
                 </div>
                 <h1 className="text-base md:text-xl font-[800] tracking-tight text-[#0F172A] leading-tight truncate">
                   {activeSession?.mockTitle}
                 </h1>
                 <div className="flex flex-wrap items-center justify-start gap-2 md:gap-3 font-bold text-[9px] text-slate-400">
                    <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {new Date(activeSession.timestamp).toLocaleDateString('en-GB')}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-200" />
                    <span>ID: {activeSession.attemptId?.slice(0, 8)}</span>
                 </div>
              </div>
           </div>
           
           <div className="flex flex-col gap-2 w-full lg:w-auto shrink-0">
              <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="bg-white border border-slate-100 p-1 rounded-xl shadow-sm">
                 <TabsList className="bg-transparent border-none p-0 flex h-9 w-full gap-1">
                    <TabsTrigger value="OVERVIEW" className="flex-1 rounded-lg px-4 font-bold text-[10px] data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all">Overview</TabsTrigger>
                    <TabsTrigger value="REVIEW" className="flex-1 rounded-lg px-4 font-bold text-[10px] data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all">Review</TabsTrigger>
                    <TabsTrigger value="REPORT" className="flex-1 rounded-lg px-4 font-bold text-[10px] data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all">Report</TabsTrigger>
                 </TabsList>
              </Tabs>
              <div className="flex gap-2">
                 <Button variant="outline" onClick={handleRetake} className="flex-1 h-10 border-2 font-bold text-[9px] rounded-xl active:scale-95"><RotateCcw className="h-3 w-3 mr-2" /> Retake</Button>
                 <Button onClick={handleDownloadPDF} disabled={isExporting} className="flex-1 h-10 bg-primary text-white font-bold text-[9px] rounded-xl shadow-md active:scale-95">
                    {isExporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3 mr-2" />} PDF Report
                 </Button>
              </div>
           </div>
        </div>

        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full space-y-10">
            <TabsContent value="OVERVIEW" className="space-y-10 animate-in fade-in duration-500">
                <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                  <StatCard label="Net Score" val={`${finalMetrics?.score} / ${finalMetrics?.maxMarks}`} sub={`${finalMetrics?.percentage.toFixed(1)}%`} icon={<Zap className="text-primary" />} />
                  <StatCard label="Punjab Rank" val={`#${liveRank}`} sub={`of ${totalCandidates}`} icon={<Trophy className="text-amber-500" />} highlight />
                  <StatCard label="Percentile" val={`${finalMetrics?.percentile}%`} sub="Verified" icon={<TrendingUp className="text-blue-500" />} />
                  <StatCard label="Accuracy" val={`${finalMetrics?.attemptAccuracy.toFixed(1)}%`} sub="Precision" icon={<Target className="text-emerald-500" />} />
                  <StatCard label="Attempt Rate" val={`${finalMetrics?.attemptRate.toFixed(1)}%`} sub="Volume" icon={<Activity className="text-indigo-500" />} />
                  <StatCard label="Grade" val={finalMetrics?.grade} sub="Audit" icon={<Award className="text-purple-500" />} />
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
                  <div className="lg:col-span-8 space-y-6 md:space-y-10">
                      <Card className="border border-slate-100 shadow-xl rounded-[2.5rem] bg-white p-6 md:p-10 text-left">
                          <h3 className="text-sm md:text-xl font-bold text-[#0F172A] mb-8 flex items-center gap-3">
                             <TrendingUp className="h-4 w-4 text-primary" /> Competition Audit
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                             <div className="space-y-6">
                                <ComparisonPill label="Your Score" val={finalMetrics?.score || 0} max={finalMetrics?.maxMarks || 1} color="bg-primary" />
                                <ComparisonPill label="Average Score" val={Number(avgScore.toFixed(1))} max={finalMetrics?.maxMarks || 1} color="bg-slate-200" />
                                <ComparisonPill label="Topper Score" val={topperScore} max={finalMetrics?.maxMarks || 1} color="bg-amber-400" />
                             </div>
                             <div className="bg-slate-50 rounded-[1.5rem] p-6 flex flex-col items-center justify-center text-center space-y-3 border border-slate-100 shadow-inner">
                                <Target className="h-6 w-6 text-rose-500" />
                                <div>
                                   <p className="text-[9px] font-bold text-slate-400">Topper Gap</p>
                                   <p className="text-2xl font-black text-[#0F172A] tabular-nums mt-1">-{finalMetrics?.topperGap.toFixed(1)}</p>
                                </div>
                                <p className="text-[10px] font-medium text-slate-500 max-w-[160px] leading-relaxed">Closing this gap requires targeted subject focus.</p>
                             </div>
                          </div>
                      </Card>

                      <Card className="border border-slate-100 shadow-xl rounded-[2rem] bg-white p-6 md:p-10 text-left">
                          <div className="flex justify-between items-center mb-8">
                             <h3 className="text-sm md:text-xl font-bold text-[#0F172A] flex items-center gap-3">
                                <ShieldCheck className="h-4 w-4 text-emerald-500" /> Readiness Index
                             </h3>
                             <Badge className={cn(
                                "border-none text-[8px] font-black px-3 py-1 rounded-full shadow-lg",
                                finalMetrics?.readiness && finalMetrics.readiness >= 80 ? "bg-emerald-50 text-emerald-600" :
                                finalMetrics?.readiness && finalMetrics.readiness >= 60 ? "bg-blue-500 text-white" :
                                finalMetrics?.readiness && finalMetrics.readiness >= 40 ? "bg-amber-500 text-white" : "bg-rose-50 text-rose-600"
                             )}>
                                {finalMetrics?.readinessLevel}
                             </Badge>
                          </div>
                          <div className="space-y-6">
                             <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner flex">
                                <div className="h-full bg-rose-500 w-[20%]" />
                                <div className="h-full bg-amber-500 w-[20%]" />
                                <div className="h-full bg-blue-500 w-[20%]" />
                                <div className="h-full bg-blue-600 w-[20%]" />
                                <div className="h-full bg-emerald-500 w-[20%]" />
                             </div>
                             <div className="relative pt-4">
                                <motion.div initial={{ left: 0 }} animate={{ left: `${finalMetrics?.readiness || 0}%` }} transition={{ duration: 2, ease: "easeOut" }} className="absolute -top-10 -translate-x-1/2 flex flex-col items-center gap-0.5">
                                   <div className="px-2 py-0.5 bg-[#0F172A] text-white text-[9px] font-bold rounded shadow-xl">{finalMetrics?.readiness.toFixed(1)}</div>
                                   <div className="w-0.5 h-8 bg-[#0F172A] rounded-full" />
                                </motion.div>
                                <div className="flex justify-between text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                                   <span>Critical</span> <span>Weak</span> <span>Average</span> <span>Good</span> <span>Excellent</span>
                                </div>
                             </div>
                          </div>
                      </Card>
                  </div>

                  <div className="lg:col-span-4 space-y-6 md:space-y-10">
                      <Card className="border-none shadow-xl rounded-[2.5rem] bg-[#0F172A] text-white p-8 md:p-10 space-y-8 relative overflow-hidden h-full">
                          <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Zap className="h-48 w-48 text-primary" /></div>
                          <div className="relative z-10 space-y-8 text-left">
                             <div className="space-y-1">
                                <h3 className="text-xl font-bold tracking-tight leading-tight uppercase">Smart Insights</h3>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Analytics audit</p>
                             </div>
                             <div className="space-y-6">
                                <InsightItem text={`Attempt rate is ${finalMetrics?.attemptRate.toFixed(1)}%. ${finalMetrics && finalMetrics.attemptRate < 50 ? 'Lower than standard.' : 'Consistent volume.'}`} />
                                <InsightItem text={`Precision is ${finalMetrics?.attemptAccuracy.toFixed(1)}%. ${finalMetrics && finalMetrics.attemptAccuracy < 60 ? 'Reduce guesswork.' : 'Strong accuracy.'}`} />
                                <InsightItem text={finalMetrics?.isQualified ? 'Meets recruitment cutoff.' : 'Below qualification threshold.'} />
                             </div>
                             <div className="pt-8 border-t border-white/5">
                                <Button asChild variant="ghost" className="w-full text-primary hover:text-white hover:bg-white/5 font-bold text-[10px] tracking-tight gap-2 border-none">
                                   <Link href={`/leaderboard?id=${mockId}`}>Full Rankings Hub <ArrowRight className="h-3" /></Link>
                                </Button>
                             </div>
                          </div>
                      </Card>
                  </div>
                </div>

                <section className="space-y-6 md:space-y-8">
                   <h3 className="text-sm md:text-xl font-bold text-[#0F172A] px-1 flex items-center gap-3">
                      <Layers className="h-5 w-5 text-blue-500" /> Subject Mastery Hub
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {activeSession?.subjectAnalysis?.map((sub: any, i: number) => (
                         <Card key={i} className="border border-slate-100 shadow-md rounded-[1.5rem] md:rounded-[2rem] bg-white p-6 flex flex-col gap-4 text-left group hover:-translate-y-1 transition-all">
                            <div className="flex justify-between items-start">
                               <h4 className="text-sm font-bold text-[#0F172A] line-clamp-1 truncate">{sub.name}</h4>
                               <Badge className={cn("border-none text-[8px] font-bold", sub.accuracy >= 70 ? "bg-emerald-50 text-emerald-600" : sub.accuracy >= 40 ? "bg-blue-50 text-blue-600" : "bg-rose-50 text-rose-600")}>{sub.accuracy}%</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                               <SubjectMetric label="Correct" val={sub.correct} color="text-emerald-600" />
                               <SubjectMetric label="Wrong" val={sub.wrong} color="text-rose-600" />
                               <SubjectMetric label="Skipped" val={sub.total - (sub.correct + sub.wrong)} color="text-slate-400" />
                               <SubjectMetric label="Score" val={sub.score.toFixed(1)} color="text-primary" />
                            </div>
                            <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden mt-1">
                               <motion.div initial={{ width: 0 }} animate={{ width: `${sub.accuracy}%` }} className={cn("h-full", sub.accuracy >= 70 ? "bg-emerald-500" : "bg-blue-500")} />
                            </div>
                         </Card>
                      ))}
                   </div>
                </section>
            </TabsContent>

            <TabsContent value="REVIEW" className="space-y-8 animate-in fade-in duration-500">
                <div className="max-w-3xl mx-auto space-y-8">
                   <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-md border border-slate-100 w-fit mx-auto overflow-x-auto no-scrollbar">
                       <FilterButton active={activeReviewFilter === 'ALL'} label="All" onClick={() => setActiveReviewFilter('ALL')} />
                       <FilterButton active={activeReviewFilter === 'WRONG'} label={`Wrong (${reviewNodes.wrong.length})`} onClick={() => setActiveReviewFilter('WRONG')} color="rose" />
                       <FilterButton active={activeReviewFilter === 'CORRECT'} label="Correct" onClick={() => setActiveReviewFilter('CORRECT')} color="emerald" />
                       <FilterButton active={activeReviewFilter === 'SKIPPED'} label="Skipped" onClick={() => setActiveReviewFilter('SKIPPED')} color="slate" />
                   </div>
                   <div className="space-y-6">
                       {filteredQuestions.map((q) => {
                           const rawAns = activeSession.answers?.[q.originalIndex] ?? activeSession.answers?.[String(q.originalIndex)];
                           const isAttempted = rawAns !== null && rawAns !== undefined && String(rawAns) !== "";
                           return (
                               <Card key={q.id} className="border border-slate-100 shadow-lg rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-white text-left">
                               <div className="p-6 md:p-10 space-y-6">
                                   <Badge variant="outline" className="px-3 py-0.5 rounded-lg border-slate-200 text-slate-400 font-bold text-[8px]">
                                       Question #{q.originalIndex + 1}
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
                <div className="flex flex-col items-center overflow-x-auto no-scrollbar pt-10">
                   <div className="bg-white p-0 rounded-none shadow-5xl border border-slate-200 overflow-hidden min-w-[840px]">
                       {finalMetrics && (
                          <ResultCard 
                              studentName={activeSession.userName || profile?.name || "Aspirant"} 
                              examTitle={activeSession.mockTitle || "Mock Test"} 
                              score={finalMetrics.score.toFixed(2)} 
                              rank={liveRank} 
                              totalCandidates={totalCandidates}
                              accuracy={finalMetrics.overallAccuracy.toFixed(1)} 
                              attemptAccuracy={finalMetrics.attemptAccuracy.toFixed(1)}
                              attemptRate={finalMetrics.attemptRate.toFixed(1)}
                              timeTaken={formatTimeStr(activeSession.timeTaken)} 
                              correct={activeSession.correctCount} 
                              wrong={activeSession.wrongCount} 
                              skipped={activeSession.skippedCount}
                              total={activeSession.totalQuestions} 
                              date={new Date(activeSession.timestamp).toLocaleDateString('en-GB')} 
                              resultId={activeSession.attemptId || activeSession.id} 
                              percentile={finalMetrics.percentile} 
                              branding={branding}
                              subjects={activeSession.subjectAnalysis}
                              grade={finalMetrics.grade}
                              isQualified={finalMetrics.isQualified}
                              readiness={finalMetrics.readiness}
                              readinessLevel={finalMetrics.readinessLevel}
                              topperScore={topperScore}
                              avgScore={avgScore}
                              duration={activeSession.duration || mockData?.duration}
                          />
                       )}
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
    <Card className={cn("border border-slate-100 shadow-sm bg-white p-4 md:p-6 rounded-xl md:rounded-[1.5rem] text-left relative overflow-hidden h-full flex flex-col justify-center transition-all hover:translate-y-[-2px]", highlight && "ring-4 ring-primary/5 border-primary/20")}>
       <div className="absolute top-0 right-0 p-2 opacity-5">{icon}</div>
       <div className="space-y-0.5 relative z-10">
          <p className="text-[8px] md:text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-tight">{label}</p>
          <p className={cn("text-base md:text-xl font-black tabular-nums tracking-tighter leading-none", highlight && "text-primary")}>{val}</p>
          {sub && <p className="text-[7px] md:text-[8px] font-bold text-slate-300 mt-1 uppercase tracking-widest">{sub}</p>}
       </div>
    </Card>
  )
}

function ComparisonPill({ label, val, max, color }: any) {
  const safeVal = Number(val) || 0;
  const safeMax = Number(max) || 1;
  const progress = Math.min(100, Math.max(0, (safeVal / safeMax) * 100));
  
  return (
    <div className="space-y-2">
       <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
          <span>{label}</span> <span className="text-[#0F172A] tabular-nums">{safeVal}</span>
       </div>
       <div className="h-2 w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-inner">
          <motion.div initial={{ width: 0 }} whileInView={{ width: `${progress}%` }} transition={{ duration: 1.5 }} className={cn("h-full shadow-lg", color)} />
       </div>
    </div>
  )
}

function InsightItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-4 group">
       <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0 shadow-[0_0_8px_#2563EB]" />
       <p className="text-[11px] md:text-[14px] font-bold text-slate-300 leading-snug group-hover:text-white transition-colors">{text}</p>
    </div>
  )
}

function SubjectMetric({ label, val, color }: any) {
  return (
    <div className="space-y-0.5">
       <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tight">{label}</p>
       <p className={cn("text-sm md:text-base font-black tabular-nums leading-none", color)}>{val}</p>
    </div>
  )
}

function FilterButton({ active, label, onClick, color = "primary" }: any) {
  return (
    <button onClick={onClick} className={cn("px-4 md:px-6 py-2 rounded-lg text-[9px] font-bold tracking-tight transition-all active:scale-95 whitespace-nowrap border border-transparent uppercase tracking-widest", active ? color === 'rose' ? "bg-rose-600 text-white shadow-lg" : color === 'emerald' ? "bg-emerald-600 text-white shadow-lg" : "bg-[#0F172A] text-white shadow-lg" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50")}>
       {label}
    </button>
  )
}
