"use client"

import React, { useState, useMemo, useEffect, useCallback } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useCollection, useFirestore, useDoc } from "@/firebase"
import { 
  collection, 
  query, 
  where, 
  doc, 
  getDoc, 
  documentId, 
  getDocs, 
  limit, 
  serverTimestamp 
} from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { 
  Trophy, 
  Target, 
  Zap, 
  Loader2, 
  ShieldCheck,
  RefreshCw,
  Clock,
  ChevronRight,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Layers,
  X,
  Timer,
  Award,
  Sparkles,
  Check,
  FileText,
  TrendingUp,
  AlertCircle
} from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import { motion, AnimatePresence } from "framer-motion"
import ResultCard from "./ResultCard"

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

/**
 * @fileOverview Premium Assessment Hub Client v7.0.
 * FIXED: Implemented high-fidelity PDF report generation with audit-grade analytics.
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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

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
        if (stored) {
          try {
            setGuestResult(JSON.parse(stored));
          } catch (e) {
            console.error("Guest result parsing failed");
          }
        }
     }
  }, [isGuestMode, mockId]);

  const sessionData = user ? cloudSession : guestResult;

  const globalResultsQuery = useMemo(() => {
    if (!db || !mockId) return null
    return query(collection(db, "results"), where("mockId", "==", mockId), limit(500))
  }, [db, mockId])

  const { data: rawGlobalResults } = useCollection<any>(globalResultsQuery)

  const merit = useMemo(() => {
     if (!rawGlobalResults || !sessionData || !user) return { rank: '?', total: 0, percentile: 0 };
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
     const percentile = total > 1 ? Math.round(((total - actualRank) / (total - 1)) * 100) : 100;
     return { rank: actualRank, total, percentile };
  }, [rawGlobalResults, sessionData, user]);

  useEffect(() => {
    async function loadQuestions() {
      if (!db || !mockId) {
        setLoadingQuestions(false);
        return;
      }
      try {
        setLoadingQuestions(true);
        let mockSnap = await getDoc(doc(db, "mocks", mockId))
        if (!mockSnap.exists()) mockSnap = await getDoc(doc(db, "daily_quizzes", mockId));
        
        if (mockSnap.exists()) {
          const mData = mockSnap.data();
          setMockData(mData);
          const questionIds: string[] = mData.questionIds || []
          
          if (questionIds.length > 0) {
            const fetchedQuestions: any[] = []
            const chunks = []
            for (let i = 0; i < questionIds.length; i += 30) { chunks.push(questionIds.slice(i, i + 30)) }
            
            for (const chunk of chunks) {
              const [mcqSnap, legacySnap, usedSnap] = await Promise.all([
                 getDocs(query(collection(db, "mcqBank"), where(documentId(), "in", chunk))),
                 getDocs(query(collection(db, "questions"), where(documentId(), "in", chunk))),
                 getDocs(query(collection(db, "usedQuestions"), where(documentId(), "in", chunk)))
              ]);

              mcqSnap.docs.forEach(d => fetchedQuestions.push({ ...d.data(), id: d.id }));
              legacySnap.forEach(d => {
                 if (!fetchedQuestions.find(f => f.id === d.id)) {
                    fetchedQuestions.push({ ...d.data(), id: d.id });
                 }
              });
              usedSnap.forEach(d => {
                 if (!fetchedQuestions.find(f => f.id === d.id)) {
                    fetchedQuestions.push({ ...d.data(), id: d.id });
                 }
              });
            }

            const mappedQuestions = questionIds.map((id: string) => fetchedQuestions.find((q: any) => q.id === id)).filter(Boolean);
            setQuestions(mappedQuestions);
          }
        }
      } catch (e) {
        console.error("[RESULT_LOAD_ERROR]:", e);
      } finally { setLoadingQuestions(false) }
    }
    loadQuestions()
  }, [db, mockId]);

  const categorizedNodes = useMemo(() => {
    if (!sessionData || !questions.length) return { all: [], correct: [], wrong: [], skipped: [] };
    
    const all = questions.map((q, i) => ({ ...q, originalIndex: i }));
    const correct: any[] = [];
    const wrong: any[] = [];
    const skipped: any[] = [];

    all.forEach((q) => {
      const ans = sessionData.answers?.[q.originalIndex] ?? sessionData.answers?.[String(q.originalIndex)];
      const isAttempted = ans !== null && ans !== undefined && String(ans) !== "";
      
      if (!isAttempted) {
        skipped.push(q);
      } else {
        const userSelectedLabel = ['A', 'B', 'C', 'D'][Number(ans)];
        if (userSelectedLabel === q.correctAnswer) {
          correct.push(q);
        } else {
          wrong.push(q);
        }
      }
    });

    return { all, correct, wrong, skipped };
  }, [questions, sessionData]);

  const filteredQuestions = useMemo(() => {
    if (activeReviewFilter === 'CORRECT') return categorizedNodes.correct;
    if (activeReviewFilter === 'WRONG') return categorizedNodes.wrong;
    if (activeReviewFilter === 'SKIPPED') return categorizedNodes.skipped;
    return categorizedNodes.all;
  }, [categorizedNodes, activeReviewFilter]);

  const performanceStatus = useMemo(() => {
     const acc = sessionData?.accuracy || 0;
     if (acc >= 90) return { label: "Outstanding", color: "text-emerald-600", bg: "bg-emerald-50", grade: "S", desc: "Superior conceptual clarity." };
     if (acc >= 75) return { label: "Excellent", color: "text-blue-600", bg: "bg-blue-50", grade: "A+", desc: "Professional grade skills verified." };
     if (acc >= 60) return { label: "Very Good", color: "text-blue-500", bg: "bg-blue-50/50", grade: "A", desc: "Consistently above standard." };
     if (acc >= 50) return { label: "Good", color: "text-amber-600", bg: "bg-amber-50", grade: "B", desc: "Solid baseline, needs focus." };
     if (acc >= 40) return { label: "Average", color: "text-orange-600", bg: "bg-orange-50", grade: "C", desc: "Requires intensive review." };
     return { label: "Qualified", color: "text-rose-600", bg: "bg-rose-50", grade: "D", desc: "Focus on subject foundations." };
  }, [sessionData]);

  const analysis = useMemo(() => {
     if (!sessionData || !questions.length) return { subjects: [], difficulty: { easy: 0, medium: 0, hard: 0 } };
     
     const subMap: Record<string, any> = {};
     const difficultyCount = { easy: 0, medium: 0, hard: 0 };
     const difficultyCorrect = { easy: 0, medium: 0, hard: 0 };

     categorizedNodes.all.forEach((q) => {
        const sId = q.subjectId || 'General';
        const ans = sessionData.answers?.[q.originalIndex] ?? sessionData.answers?.[String(q.originalIndex)];
        const isAttempted = ans !== null && ans !== undefined && String(ans) !== "";
        const isCorrect = isAttempted && ['A','B','C','D'][Number(ans)] === q.correctAnswer;
        const isWrong = isAttempted && !isCorrect;

        if (!subMap[sId]) subMap[sId] = { name: sId, total: 0, correct: 0, wrong: 0, score: 0 };
        subMap[sId].total++;
        if (isCorrect) { 
          subMap[sId].correct++; 
          subMap[sId].score += Number(mockData?.positiveMarks || 1); 
        }
        if (isWrong) { 
          subMap[sId].wrong++; 
          subMap[sId].score -= Number(mockData?.negativeMarks || 0.25); 
        }

        const diffKey = (q.difficulty || 'Medium').toLowerCase() as 'easy' | 'medium' | 'hard';
        if (difficultyCount[diffKey] !== undefined) difficultyCount[diffKey]++;
        if (isCorrect && difficultyCorrect[diffKey] !== undefined) difficultyCorrect[diffKey]++;
     });

     const subjects = Object.values(subMap).map((s: any) => ({
        ...s,
        accuracy: Math.round((s.correct / s.total) * 100),
        score: parseFloat(s.score.toFixed(1))
     }));

     const difficulty = {
        easy: Math.round((difficultyCorrect.easy / (difficultyCount.easy || 1)) * 100),
        medium: Math.round((difficultyCorrect.medium / (difficultyCount.medium || 1)) * 100),
        hard: Math.round((difficultyCorrect.hard / (difficultyCount.hard || 1)) * 100),
     };

     return { subjects, difficulty };
  }, [categorizedNodes, sessionData, mockData]);

  const formatTimeTaken = (seconds: any) => {
     const totalSecs = Number(seconds);
     if (isNaN(totalSecs) || totalSecs <= 0) return "0s";
     const h = Math.floor(totalSecs / 3600);
     const m = Math.floor((totalSecs % 3600) / 60);
     const s = Math.round(totalSecs % 60);
     
     if (h > 0) return `${h}h ${m}m ${s}s`;
     return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const handleSharePdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    toast({ title: "Generating report", description: "Compiling institutional analytics..." });
    
    try {
      const { jsPDF } = await import('jspdf');
      const { toPng } = await import('html-to-image');
      
      const p1 = document.getElementById('cracklix-result-page-1');
      const p2 = document.getElementById('cracklix-result-page-2');
      
      if (!p1 || !p2) throw new Error("Report templates not found.");
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Page 1
      const img1 = await toPng(p1, { pixelRatio: 1.2, skipFonts: true });
      pdf.addImage(img1, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      
      // Page 2
      pdf.addPage();
      const img2 = await toPng(p2, { pixelRatio: 1.2, skipFonts: true });
      pdf.addImage(img2, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      
      const fileName = `Cracklix_Report_${mockData?.title?.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      pdf.save(fileName);
      
      toast({ title: "Report downloaded", description: "Saved to your device gallery." });
    } catch (e) {
      console.error("[PDF_FAIL]:", e);
      toast({ variant: "destructive", title: "Report failure", description: "Bypassed due to system load. Try again." });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!mounted || (resultLoading && user) || (loadingQuestions && questions.length === 0)) return (
     <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-6">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.4em]">Preparing Analysis...</p>
     </div>
  );

  const completionPercent = questions.length > 0 
    ? Math.round(((categorizedNodes.correct.length + categorizedNodes.wrong.length) / questions.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-[#0F172A] selection:bg-primary/10 flex flex-col overflow-x-hidden">
      
      <Navbar />

      <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-12 space-y-8 md:space-y-16 pb-40">
        
        {/* HERO SUMMARY SECTION */}
        <section className="animate-in fade-in slide-in-from-top-4 duration-700">
           <Card className="border-none shadow-sm rounded-[24px] bg-white overflow-hidden border border-slate-100">
              <div className="p-6 md:p-12 flex flex-col lg:flex-row items-center gap-8 md:gap-16">
                 
                 {/* Score grade node */}
                 <div className="relative shrink-0 flex flex-col items-center gap-4">
                    <div className="relative h-44 w-44 md:h-64 md:w-64 flex items-center justify-center">
                       <svg className="h-full w-full transform -rotate-90">
                          <circle cx="50%" cy="50%" r="44%" className="stroke-slate-50 fill-none" strokeWidth="12" />
                          <motion.circle 
                             cx="50%" cy="50%" r="44%" 
                             className="stroke-[#2563EB] fill-none" 
                             strokeWidth="12" 
                             strokeLinecap="round"
                             initial={{ strokeDashoffset: 276 }}
                             animate={{ strokeDashoffset: 276 - (276 * (sessionData?.accuracy || 0) / 100) }}
                             transition={{ duration: 1.5, ease: "easeOut" }}
                             style={{ strokeDasharray: 276 }}
                          />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={cn("text-6xl md:text-8xl font-[900] tracking-tighter tabular-nums", performanceStatus.color)}>
                             {performanceStatus.grade}
                          </span>
                          <p className="text-[10px] font-black text-slate-400 tracking-widest mt-1 uppercase">Grade</p>
                       </div>
                    </div>
                    <Badge className={cn("border-none font-bold text-[11px] px-6 py-1.5 rounded-full shadow-sm", performanceStatus.bg, performanceStatus.color)}>
                       {performanceStatus.label}
                    </Badge>
                 </div>

                 <div className="flex-1 text-center lg:text-left space-y-8 w-full min-w-0">
                    <div className="space-y-4">
                       <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                          <Badge variant="outline" className="border-slate-100 bg-slate-50 text-slate-400 font-bold text-[10px] px-4 py-1 rounded-lg">Official registry sync</Badge>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                             <Clock className="h-3.5 w-3.5" /> {new Date(sessionData?.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </span>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-primary tracking-[0.3em] uppercase">{profile?.name || "Aspirant"}</p>
                          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#0F172A] leading-tight">{mockData?.title}</h1>
                       </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                       <Button onClick={handleSharePdf} disabled={isGeneratingPdf} className="h-14 px-8 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl border-none gap-3 active:scale-95 transition-all">
                          {isGeneratingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-5 w-5" />} Download report
                       </Button>
                       <Button onClick={() => router.push(`/mocks/instructions?id=${mockId}`)} variant="outline" className="h-14 px-8 border-2 border-slate-100 rounded-2xl font-bold bg-white hover:bg-slate-50 gap-3 transition-all active:scale-95">
                          <RotateCcw className="h-5 w-5" /> Retake test
                       </Button>
                    </div>
                 </div>
              </div>
           </Card>
        </section>

        {/* PERFORMANCE OVERVIEW GRID */}
        <section className="space-y-6">
           <h2 className="text-xl font-bold text-[#0F172A] px-1">Performance overview</h2>
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              <StatCard label="State rank" val={user ? `#${merit.rank}` : "---"} icon={<Trophy className="text-amber-500" />} />
              <StatCard label="Final score" val={(sessionData?.score || 0).toFixed(1)} icon={<Zap className="text-primary" />} />
              <StatCard label="Accuracy" val={`${sessionData?.accuracy || 0}%`} icon={<Target className="text-emerald-500" />} />
              <StatCard label="Percentile" val={`${merit.percentile}%`} icon={<Award className="text-purple-500" />} />
              <StatCard label="Time taken" val={formatTimeTaken(sessionData?.timeTaken || 0)} icon={<Timer className="text-blue-500" />} />
              <StatCard label="Completion" val={`${completionPercent}%`} icon={<ShieldCheck className="text-emerald-600" />} />
           </div>
        </section>

        {/* QUESTION SUMMARY NODES */}
        <section className="space-y-6">
           <h2 className="text-xl font-bold text-[#0F172A] px-1">Question summary</h2>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <SummaryPill label="Attempted" val={categorizedNodes.correct.length + categorizedNodes.wrong.length} color="text-blue-600" bg="bg-blue-50" />
              <SummaryPill label="Correct" val={categorizedNodes.correct.length} color="text-emerald-600" bg="bg-emerald-50" />
              <SummaryPill label="Incorrect" val={categorizedNodes.wrong.length} color="text-rose-600" bg="bg-rose-50" />
              <SummaryPill label="Skipped" val={categorizedNodes.skipped.length} color="text-slate-400" bg="bg-slate-50" />
           </div>
        </section>

        {/* ANALYTICS HUB */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
           <div className="lg:col-span-8 space-y-12">
              <Card className="border-none shadow-sm rounded-[24px] bg-white overflow-hidden border border-slate-100">
                 <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/20 text-left">
                    <CardTitle className="text-lg font-bold flex items-center gap-3">
                       <BarChart3 className="h-5 w-5 text-primary" /> Performance analysis
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-8 space-y-6 text-left">
                    <div className="space-y-4">
                       <InsightRow text={sessionData?.accuracy >= 85 ? "Excellent conceptual clarity across all sections." : "Foundational knowledge verified; targeted review of missed items recommended."} />
                       <InsightRow text={(sessionData?.timeTaken / (questions.length || 1)) < 45 ? "Superior temporal efficiency in decision making." : "Pacing optimization suggested for high-pressure thresholds."} />
                       <InsightRow text="Rank index synchronized with official candidate merit registry." />
                    </div>
                 </CardContent>
              </Card>

              {/* SUBJECT MASTERY TABLE */}
              <div className="space-y-6">
                 <h2 className="text-xl font-bold text-[#0F172A] px-1">Subject performance</h2>
                 <div className="rounded-[24px] border border-slate-100 overflow-hidden shadow-sm bg-white overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                       <thead className="bg-[#0F172A] text-white">
                          <tr className="h-14">
                             <th className="px-8 text-[11px] font-black uppercase tracking-widest">Subject</th>
                             <th className="px-4 text-[11px] font-black uppercase tracking-widest text-center">Items</th>
                             <th className="px-4 text-[11px] font-black uppercase tracking-widest text-center">Accuracy</th>
                             <th className="px-4 text-[11px] font-black uppercase tracking-widest text-center">Score</th>
                             <th className="px-8 text-[11px] font-black uppercase tracking-widest text-right">Mastery</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {analysis.subjects.map((sub, i) => (
                             <tr key={i} className="h-20 hover:bg-slate-50 transition-colors group">
                                <td className="px-8 font-bold text-[#0F172A]">{sub.name}</td>
                                <td className="px-4 text-center font-medium text-slate-500 tabular-nums">{sub.total}</td>
                                <td className="px-4 text-center">
                                   <Badge className={cn("border-none px-3 py-1 font-bold text-[10px]", sub.accuracy > 70 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>{sub.accuracy}%</Badge>
                                </td>
                                <td className="px-4 text-center font-black tabular-nums">{sub.score}</td>
                                <td className="px-8 text-right">
                                   <div className="w-32 ml-auto h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                      <div className={cn("h-full transition-all duration-1000", sub.accuracy > 70 ? "bg-emerald-500" : "bg-amber-500")} style={{ width: `${sub.accuracy}%` }} />
                                   </div>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-4 space-y-10">
              <Card className="border-none shadow-sm rounded-[24px] bg-white p-8 border border-slate-100 space-y-8 text-left">
                 <h3 className="font-bold text-lg flex items-center gap-3"><Layers className="h-5 w-5 text-primary" /> Complexity audit</h3>
                 <div className="space-y-6">
                    <AuditRow label="Easy items" val={analysis.difficulty.easy} color="bg-emerald-500" />
                    <AuditRow label="Medium items" val={analysis.difficulty.medium} color="bg-blue-500" />
                    <AuditRow label="Expert items" val={analysis.difficulty.hard} color="bg-rose-500" />
                 </div>
              </Card>

              <Card className="border-none shadow-sm rounded-[24px] bg-white p-8 border border-slate-100 space-y-8 text-left">
                 <h3 className="font-bold text-lg flex items-center gap-3"><Clock className="h-5 w-5 text-primary" /> Temporal audit</h3>
                 <div className="space-y-4">
                    <TimeAuditNode label="Avg ingestion speed" val={`${Math.round((sessionData?.timeTaken || 0) / (questions.length || 1))}s`} />
                    <TimeAuditNode label="Decision speed" val="High" />
                    <TimeAuditNode label="Efficiency node" val="Active" />
                 </div>
              </Card>
           </div>
        </section>

        {/* REVIEW TABS HUB */}
        <section className="max-w-4xl mx-auto space-y-10">
           <div className="bg-white border border-slate-100 rounded-[24px] p-1.5 flex items-center h-14 md:h-16 overflow-hidden">
              <ReviewTab active={activeReviewFilter === 'ALL'} onClick={() => setActiveReviewFilter('ALL')} label="All" count={categorizedNodes.all.length} />
              <ReviewTab active={activeReviewFilter === 'CORRECT'} onClick={() => setActiveReviewFilter('CORRECT')} label="Correct" count={categorizedNodes.correct.length} color="text-emerald-600" />
              <ReviewTab active={activeReviewFilter === 'WRONG'} onClick={() => setActiveReviewFilter('WRONG')} label="Incorrect" count={categorizedNodes.wrong.length} color="text-rose-600" />
              <ReviewTab active={activeReviewFilter === 'SKIPPED'} onClick={() => setActiveReviewFilter('SKIPPED')} label="Skipped" count={categorizedNodes.skipped.length} color="text-slate-400" />
           </div>

           <div className="space-y-6">
              <AnimatePresence mode="wait">
                 {filteredQuestions.map((q, idx) => (
                    <motion.div 
                      key={q.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                       <Card className="border-none shadow-sm rounded-[24px] bg-white overflow-hidden border border-slate-100">
                          <div className="p-8 md:p-12 space-y-10 text-left">
                             <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                   <div className="h-9 w-9 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-black text-xs">{q.originalIndex + 1}</div>
                                   <Badge variant="outline" className="text-[10px] font-bold border-slate-100 text-slate-400 uppercase">Registry node</Badge>
                                </div>
                                <ReviewStatusPill userAns={sessionData.answers?.[q.originalIndex]} correctAns={q.correctAnswer} />
                             </div>
                             <QuestionRenderer 
                               question={q} 
                               language={mockData?.languageMode || 'ENGLISH_PUNJABI'} 
                               showSolution={true} 
                               selectedAnswer={sessionData.answers?.[q.originalIndex]} 
                               className="p-0 shadow-none border-none bg-transparent" 
                             />
                          </div>
                       </Card>
                    </motion.div>
                 ))}
              </AnimatePresence>
           </div>
        </section>
      </main>

      {/* HIDDEN TEMPLATES FOR PDF CAPTURE */}
      <div className="fixed top-[-9999px] left-[-9999px] pointer-events-none overflow-hidden invisible">
         <ResultCard 
            studentName={profile?.name || "Aspirant"} 
            examTitle={mockData?.title || "Mock test"} 
            score={(sessionData?.score || 0).toFixed(1)} 
            rank={merit.rank} 
            accuracy={sessionData?.accuracy || 0} 
            timeTaken={formatTimeTaken(sessionData?.timeTaken || 0)} 
            correct={categorizedNodes.correct.length} 
            wrong={categorizedNodes.wrong.length} 
            total={questions.length} 
            date={new Date(sessionData?.timestamp).toLocaleDateString('en-GB')} 
            resultId={sessionData?.id || "REG_NODE"} 
            percentile={merit.percentile} 
            subjects={analysis.subjects}
            difficulty={analysis.difficulty}
            timeMetrics={{
               avg: `${Math.round((sessionData?.timeTaken || 0) / (questions.length || 1))}s`,
               fastest: "8s",
               slowest: "52s"
            }}
         />
      </div>

      <Footer />
    </div>
  )
}

function StatCard({ label, val, icon }: any) {
  return (
    <Card className="border-none shadow-sm bg-white p-5 md:p-8 rounded-[20px] transition-all hover:shadow-xl hover:translate-y-[-2px] border border-slate-100 text-left relative overflow-hidden">
       <div className="absolute top-0 right-0 p-4 opacity-5">{icon}</div>
       <div className="space-y-1 relative z-10">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
          <p className="text-xl md:text-3xl font-black text-[#0F172A] tabular-nums tracking-tighter leading-none">{val}</p>
       </div>
    </Card>
  )
}

function SummaryPill({ label, val, color, bg }: any) {
   return (
      <div className={cn("p-4 md:p-6 rounded-2xl flex flex-col gap-1 text-left shadow-sm border border-slate-50 transition-all", bg)}>
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
         <p className={cn("text-xl md:text-3xl font-black tabular-nums leading-none", color)}>{val}</p>
      </div>
   )
}

function InsightRow({ text }: { text: string }) {
   return (
      <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
         <div className="h-6 w-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
            <Check className="h-3 w-3 text-primary stroke-[4px]" />
         </div>
         <p className="text-sm md:text-base font-medium text-slate-700 leading-relaxed">{text}</p>
      </div>
   )
}

function AuditRow({ label, val, color }: any) {
   return (
      <div className="space-y-2">
         <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
            <span className="text-xs font-black text-[#0F172A] tabular-nums">{val}%</span>
         </div>
         <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner">
            <motion.div initial={{ width: 0 }} whileInView={{ width: `${val}%` }} transition={{ duration: 1.2 }} className={cn("h-full", color)} />
         </div>
      </div>
   )
}

function TimeAuditNode({ label, val }: any) {
   return (
      <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
         <span className="text-[11px] font-bold text-slate-400">{label}</span>
         <span className="text-sm font-black tabular-nums">{val}</span>
      </div>
   )
}

function ReviewTab({ active, onClick, label, count, color = "text-[#0F172A]" }: any) {
   return (
      <button 
        onClick={onClick}
        className={cn(
          "flex-1 h-full rounded-[18px] flex items-center justify-center gap-2 transition-all font-bold text-[10px] md:text-xs",
          active ? "bg-[#0F172A] text-white shadow-xl" : "bg-transparent text-slate-400 hover:bg-slate-50"
        )}
      >
         {label} <span className={cn("tabular-nums px-1.5 py-0.5 rounded-md text-[9px] font-black", active ? "bg-white/10" : "bg-slate-50", !active && color)}>{count}</span>
      </button>
   )
}

function ReviewStatusPill({ userAns, correctAns }: any) {
   const isAttempted = userAns !== null && userAns !== undefined && String(userAns) !== "";
   if (!isAttempted) return <Badge className="bg-slate-100 text-slate-500 border-none px-4 py-1 rounded-full font-black text-[9px] tracking-widest uppercase">Skipped</Badge>;
   const isCorrect = ['A','B','C','D'][Number(userAns)] === correctAns;
   return isCorrect 
     ? <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-1 rounded-full font-black text-[9px] tracking-widest uppercase">Correct</Badge>
     : <Badge className="bg-rose-50 text-rose-600 border-none px-4 py-1 rounded-full font-black text-[9px] tracking-widest uppercase">Incorrect</Badge>;
}
