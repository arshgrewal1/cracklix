"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Trophy, 
  Target, 
  Zap, 
  Loader2, 
  ShieldCheck,
  RefreshCw,
  XCircle,
  AlertCircle,
  Clock,
  ChevronRight,
  ChevronLeft,
  Share2,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  BarChart3,
  BrainCircuit,
  Sparkles,
  Award,
  FileText,
  RotateCcw,
  LayoutGrid,
  X
} from "lucide-react"
import { useUser, useCollection, useFirestore, useDoc } from "@/firebase"
import { collection, query, where, doc, getDoc, documentId, getDocs, limit, deleteDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import { motion, AnimatePresence } from "framer-motion"
import { toPng } from "html-to-image"
import { jsPDF } from "jspdf"
import ResultCard from "./ResultCard"

/**
 * @fileOverview Official Result Hub v15.0 [Logic Audit Fixed].
 * FIXED: Mutually exclusive categorization for Correct, Wrong, and Skipped questions.
 * FIXED: Counters exactly match the filtered lists.
 * FIXED: Strict handling of null/undefined/empty answers.
 * ADDED: Console debugging for registry verification.
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
  const [currentReviewIdx, setCurrentReviewIdx] = useState(0)
  const [guestResult, setGuestResult] = useState<any>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  
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
            const fetched: any[] = []
            const chunks = []
            for (let i = 0; i < questionIds.length; i += 30) { chunks.push(questionIds.slice(i, i + 30)) }
            
            for (const chunk of chunks) {
              const [mcqSnap, legacySnap] = await Promise.all([
                 getDocs(query(collection(db, "mcqBank"), where(documentId(), "in", chunk))),
                 getDocs(query(collection(db, "questions"), where(documentId(), "in", chunk)))
              ]);

              mcqSnap.docs.forEach(d => fetched.push({ ...d.data(), id: d.id }));
              legacySnap.docs.forEach(d => {
                 if (!fetched.find(f => f.id === d.id)) {
                    fetched.push({ ...d.data(), id: d.id });
                 }
              });
            }

            const mappedQuestions = questionIds.map((id: string) => fetched.find((q: any) => q.id === id)).filter(Boolean);
            setQuestions(mappedQuestions);
          }
        }
      } catch (e) {
        console.error("[RESULT_LOAD_ERROR]:", e);
      } finally { setLoadingQuestions(false) }
    }
    loadQuestions()
  }, [db, mockId]);

  /**
   * REFACTORED CATEGORIZATION LOGIC
   * Every question is strictly assigned to one bucket (Correct, Wrong, or Skipped).
   */
  const categorizedNodes = useMemo(() => {
    if (!sessionData || !questions.length) return { all: [], correct: [], wrong: [], skipped: [] };
    
    const all = questions.map((q, i) => ({ ...q, originalIndex: i }));
    const correct: any[] = [];
    const wrong: any[] = [];
    const skipped: any[] = [];

    all.forEach((q) => {
      // Handles both integer index and string index from Firestore
      const ans = sessionData.answers?.[q.originalIndex] ?? sessionData.answers?.[String(q.originalIndex)];
      
      // Strict rule: null, undefined, or empty string -> Skipped
      const isAttempted = ans !== null && ans !== undefined && ans !== "";
      
      if (!isAttempted) {
        skipped.push(q);
      } else {
        const userSelectedLabel = ['A', 'B', 'C', 'D', 'E'][Number(ans)];
        if (userSelectedLabel === q.correctAnswer) {
          correct.push(q);
        } else {
          wrong.push(q);
        }
      }
    });

    // Console Debugging as requested
    const idSet = new Set();
    const duplicateIds = questions.filter(q => {
      if (idSet.has(q.id)) return true;
      idSet.add(q.id);
      return false;
    }).map(q => q.id);

    console.log("[RESULT_LOGIC_AUDIT]", {
      total: all.length,
      correct: correct.length,
      wrong: wrong.length,
      skipped: skipped.length,
      sum: correct.length + wrong.length + skipped.length,
      isBalanced: (correct.length + wrong.length + skipped.length) === all.length,
      duplicateIds
    });

    return { all, correct, wrong, skipped };
  }, [questions, sessionData]);

  const filteredQuestions = useMemo(() => {
    if (activeReviewFilter === 'CORRECT') return categorizedNodes.correct;
    if (activeReviewFilter === 'WRONG') return categorizedNodes.wrong;
    if (activeReviewFilter === 'SKIPPED') return categorizedNodes.skipped;
    return categorizedNodes.all;
  }, [categorizedNodes, activeReviewFilter]);

  const analysis = useMemo(() => {
     if (!sessionData || !questions.length) return { subjects: [], difficulty: { easy: 0, medium: 0, hard: 0 } };
     
     const subMap: Record<string, any> = {};
     const difficultyCount = { easy: 0, medium: 0, hard: 0 };
     const difficultyCorrect = { easy: 0, medium: 0, hard: 0 };

     categorizedNodes.all.forEach((q) => {
        const sId = q.subjectId || 'General Hub';
        const ans = sessionData.answers?.[q.originalIndex] ?? sessionData.answers?.[String(q.originalIndex)];
        const isAttempted = ans !== null && ans !== undefined && ans !== "";
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

  // RESET INDEX ON FILTER CHANGE
  useEffect(() => {
    setCurrentReviewIdx(0);
    setShowExplanation(false);
  }, [activeReviewFilter]);

  const handleSharePdf = async () => {
    if (isGeneratingPdf || !sessionData) return;
    setIsGeneratingPdf(true);
    toast({ title: "Generating Report", description: "Synthesizing deep-dive analytics..." });

    try {
      const page1 = document.getElementById('cracklix-result-page-1');
      const page2 = document.getElementById('cracklix-result-page-2');
      if (!page1 || !page2) throw new Error("Canvas nodes missing");

      const img1 = await toPng(page1, { width: 1000, height: 1414, pixelRatio: 1.5 });
      const img2 = await toPng(page2, { width: 1000, height: 1414, pixelRatio: 1.5 });

      const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: [1000, 1414] });
      pdf.addImage(img1, 'PNG', 0, 0, 1000, 1414);
      pdf.addPage([1000, 1414], 'p');
      pdf.addImage(img2, 'PNG', 0, 0, 1000, 1414);

      const pdfBlob = pdf.output('blob');
      const fileName = `Cracklix_Report_${mockData?.title?.replace(/\s+/g, '_')}.pdf`;
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'My Performance Report', text: `🎯 Assessment Result for ${mockData?.title}` });
      } else {
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url; link.download = fileName; link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      toast({ variant: "destructive", title: "PDF Failure" });
    } finally { setIsGeneratingPdf(false); }
  };

  const handleReattempt = () => {
     if (!mockId) return;
     router.push(`/mocks/instructions?id=${mockId}`);
  };

  const formatTime = (seconds: number) => {
     const m = Math.floor(seconds / 60);
     const s = seconds % 60;
     return `${m}m ${s}s`;
  };

  const performanceStatus = useMemo(() => {
     const acc = sessionData?.accuracy || 0;
     if (acc >= 90) return { label: "Outstanding", color: "text-emerald-600" };
     if (acc >= 75) return { label: "Excellent", color: "text-blue-600" };
     if (acc >= 60) return { label: "Very Good", color: "text-blue-500" };
     if (acc >= 50) return { label: "Good", color: "text-amber-600" };
     return { label: "Average", color: "text-orange-600" };
  }, [sessionData]);

  if (!mounted || (resultLoading && user) || (loadingQuestions && questions.length === 0)) return (
     <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Preparing Analysis...</p>
     </div>
  );

  const currentQuestion = filteredQuestions[currentReviewIdx];

  return (
    <div className="min-h-screen bg-white font-body text-[#0F172A] selection:bg-primary/10 flex flex-col overflow-x-hidden">
      
      {/* HIDDEN OFFSITE RENDER FOR MULTI-PAGE PDF CAPTURE */}
      <div className="fixed left-[-2000px] top-0 pointer-events-none">
           <ResultCard 
             studentName={profile?.name || "Aspirant"}
             examTitle={mockData?.title || "Mock Test"}
             score={(sessionData?.score || 0).toFixed(1)}
             rank={user ? merit.rank : 'Guest'}
             accuracy={sessionData?.accuracy || 0}
             timeTaken={formatTime(sessionData?.timeTaken || 0)}
             correct={categorizedNodes.correct.length}
             wrong={categorizedNodes.wrong.length}
             total={categorizedNodes.all.length}
             date={new Date(sessionData?.timestamp).toLocaleDateString('en-GB')}
             resultId={sessionData?.id || 'manual'}
             percentile={merit.percentile}
             subjects={analysis.subjects}
             difficulty={analysis.difficulty}
             timeMetrics={{
                avg: `${Math.round((sessionData?.timeTaken || 0) / (categorizedNodes.correct.length + categorizedNodes.wrong.length || 1))}s`,
                fastest: "4s",
                slowest: "84s"
             }}
           />
      </div>

      <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-slate-100 h-16 flex items-center px-4 md:px-8 justify-between">
        <div className="flex items-center gap-4">
           <button onClick={() => router.back()} className="p-2 hover:bg-slate-50 rounded-xl transition-all"><ChevronLeft className="h-6 w-6" /></button>
           <Link href="/"><img src="/logo/cracklix-logo-dark.png" alt="Cracklix" className="h-8 md:h-10 w-auto" /></Link>
        </div>
        <Button onClick={handleSharePdf} disabled={isGeneratingPdf} variant="ghost" size="icon" className="rounded-xl">
           {isGeneratingPdf ? <Loader2 className="h-5 w-5 animate-spin" /> : <Share2 className="h-5 w-5" />}
        </Button>
      </header>

      <main className="flex-1 w-full max-w-[1200px] mx-auto p-4 md:p-8 space-y-6 md:space-y-10 pb-40">
        
        <section className="animate-in fade-in slide-in-from-top-4 duration-500">
           <Card className="border-none shadow-[0_8px_40px_rgba(0,0,0,0.04)] rounded-[2rem] overflow-hidden bg-white p-6 md:p-12 text-center space-y-8 border border-slate-50">
              <div className="space-y-2">
                 <div className="flex items-center justify-center gap-2 text-emerald-500 font-bold text-sm uppercase tracking-widest">
                    <CheckCircle2 className="h-4 w-4" /> Mock Test Completed
                 </div>
                 <h1 className="text-xl md:text-4xl font-black tracking-tight">{mockData?.title}</h1>
              </div>

              <div className="relative h-48 w-48 md:h-64 md:w-64 mx-auto flex items-center justify-center">
                 <svg className="h-full w-full transform -rotate-90">
                    <circle cx="50%" cy="50%" r="45%" className="stroke-slate-50 fill-none" strokeWidth="12" />
                    <motion.circle 
                       cx="50%" cy="50%" r="45%" 
                       className="stroke-[#2563EB] fill-none" 
                       strokeWidth="12" 
                       strokeLinecap="round"
                       initial={{ strokeDashoffset: 282.6 }}
                       animate={{ strokeDashoffset: 282.6 - (282.6 * (sessionData?.accuracy || 0) / 100) }}
                       transition={{ duration: 1.5, ease: "easeOut" }}
                       style={{ strokeDasharray: 282.6 }}
                    />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl md:text-7xl font-black tracking-tighter tabular-nums">{sessionData?.accuracy || 0}%</span>
                    <span className={cn("text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mt-1", performanceStatus.color)}>{performanceStatus.label}</span>
                 </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                 <SummaryMetric label="Score" val={(sessionData?.score || 0).toFixed(1)} icon={<Zap className="text-blue-500" />} />
                 <SummaryMetric label="Accuracy" val={`${sessionData?.accuracy || 0}%`} icon={<Target className="text-emerald-500" />} />
                 <SummaryMetric label="Rank" val={user ? `#${merit.rank}` : "Guest"} icon={<Trophy className="text-amber-500" />} />
                 <SummaryMetric label="Time" val={formatTime(sessionData?.timeTaken || 0)} icon={<Clock className="text-slate-400" />} />
              </div>

              <div className="flex flex-col gap-3 pt-6 max-w-md mx-auto w-full">
                 <Button 
                   onClick={handleSharePdf} 
                   disabled={isGeneratingPdf} 
                   className="w-full h-14 md:h-16 bg-[#2563EB] hover:bg-blue-700 text-white font-[900] uppercase text-[12px] md:text-sm tracking-[0.1em] rounded-full shadow-[0_15px_30px_rgba(37,99,235,0.25)] gap-3 border-none transition-all active:scale-95"
                 >
                    {isGeneratingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-5 w-5" />} 
                    Share Detailed Report
                 </Button>
                 
                 <div className="grid grid-cols-2 gap-3 w-full">
                    <Button 
                      onClick={handleReattempt}
                      variant="outline" 
                      className="h-12 md:h-14 rounded-full border-2 border-slate-100 text-[#0F172A] font-black uppercase text-[10px] tracking-widest gap-2"
                    >
                       <RotateCcw className="h-4 w-4" /> Re-attempt
                    </Button>
                    <Button 
                      asChild
                      variant="outline" 
                      className="h-12 md:h-14 rounded-full border-2 border-slate-100 text-[#0F172A] font-black uppercase text-[10px] tracking-widest gap-2"
                    >
                       <Link href="/mocks"><LayoutGrid className="h-4 w-4" /> Practice Hub</Link>
                    </Button>
                 </div>
              </div>
           </Card>
        </section>

        {/* ANALYTICS SECTION */}
        <section className="space-y-6">
           <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 ml-2">Analytical Breakdown</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analysis.subjects.map((sub, i) => (
                 <Card key={i} className="p-6 rounded-[2rem] border border-slate-100 bg-white shadow-sm flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                       <h4 className="font-bold text-[#0F172A] truncate max-w-[70%]">{sub.name}</h4>
                       <Badge className={cn("border-none text-[9px] font-black", sub.accuracy > 70 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>{sub.accuracy}%</Badge>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-bold text-slate-400">
                          <span>Mastery Node</span>
                          <span className="tabular-nums">{sub.correct} / {sub.total} Correct</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                          <div className={cn("h-full", sub.accuracy > 70 ? "bg-emerald-500" : "bg-amber-500")} style={{ width: `${sub.accuracy}%` }} />
                       </div>
                    </div>
                 </Card>
              ))}
           </div>
        </section>

        <section className="sticky top-[64px] z-[90] bg-white/90 backdrop-blur-md py-4 border-b border-slate-50 -mx-4 px-4">
           <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <FilterBtn active={activeReviewFilter === 'ALL'} onClick={() => setActiveReviewFilter('ALL')} label="All" count={categorizedNodes.all.length} />
              <FilterBtn active={activeReviewFilter === 'CORRECT'} onClick={() => setActiveReviewFilter('CORRECT')} label="Correct" count={categorizedNodes.correct.length} color="bg-emerald-500" />
              <FilterBtn active={activeReviewFilter === 'WRONG'} onClick={() => setActiveReviewFilter('WRONG')} label="Wrong" count={categorizedNodes.wrong.length} color="bg-rose-500" />
              <FilterBtn active={activeReviewFilter === 'SKIPPED'} onClick={() => setActiveReviewFilter('SKIPPED')} label="Skipped" count={categorizedNodes.skipped.length} color="bg-slate-400" />
           </div>
        </section>

        <section className="pb-32">
           <AnimatePresence mode="wait">
              {filteredQuestions.length > 0 ? (
                 <motion.div key={currentQuestion?.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                    <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
                       <div className="p-6 md:p-10 space-y-6">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs">{currentQuestion.originalIndex + 1}</span>
                                <Badge className="bg-blue-50 text-blue-600 border-none text-[8px] font-black uppercase tracking-widest px-2">{currentQuestion.difficulty || 'MEDIUM'}</Badge>
                             </div>
                             <ReviewStatusBadge 
                                userAns={sessionData.answers?.[currentQuestion.originalIndex] ?? sessionData.answers?.[String(currentQuestion.originalIndex)]} 
                                correctAns={currentQuestion.correctAnswer} 
                             />
                          </div>
                          <QuestionRenderer 
                            question={currentQuestion} 
                            language={mockData?.languageMode || 'ENGLISH_PUNJABI'} 
                            showSolution={true} 
                            selectedAnswer={sessionData.answers?.[currentQuestion.originalIndex] ?? sessionData.answers?.[String(currentQuestion.originalIndex)]} 
                            className="p-0 shadow-none border-none bg-transparent" 
                          />
                          <div className="pt-6 border-t border-slate-50 flex flex-col gap-4">
                             <Button onClick={() => setShowExplanation(!showExplanation)} variant="ghost" className="justify-between h-12 text-slate-600 font-bold text-sm bg-slate-50 hover:bg-slate-100 px-6 rounded-xl">
                                {showExplanation ? "Hide Rationale" : "View Official Rationale"} {showExplanation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                             </Button>
                          </div>
                       </div>
                    </Card>
                 </motion.div>
              ) : (
                 <div className="py-32 text-center space-y-4 opacity-40 animate-in fade-in duration-500">
                    <AlertCircle className="h-16 w-16 mx-auto text-slate-200" />
                    <div className="space-y-1">
                       <p className="font-bold text-lg tracking-tight text-[#0F172A]">No nodes matched filter</p>
                       <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                          {activeReviewFilter === 'WRONG' ? 'You have zero incorrect answers in this test.' : 
                           activeReviewFilter === 'SKIPPED' ? 'You attempted every single question.' : 
                           'No questions found in this category.'}
                       </p>
                    </div>
                 </div>
              )}
           </AnimatePresence>
        </section>

      </main>

      <div className="fixed bottom-0 left-0 right-0 z-[110] bg-white border-t border-slate-100 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] px-4 py-4 md:py-6">
         <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
            <Button disabled={currentReviewIdx === 0} onClick={() => { setCurrentReviewIdx(currentReviewIdx - 1); setShowExplanation(false); }} variant="ghost" className="h-12 md:h-14 px-4 md:px-8 font-bold text-xs gap-2 rounded-xl"><ChevronLeft className="h-5 w-5" /> Previous</Button>
            <div className="flex flex-col items-center">
               <span className="text-lg md:text-xl font-black tabular-nums">{filteredQuestions.length > 0 ? currentReviewIdx + 1 : 0} / {filteredQuestions.length}</span>
               <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Nodes</span>
            </div>
            <Button disabled={currentReviewIdx >= filteredQuestions.length - 1} onClick={() => { setCurrentReviewIdx(currentReviewIdx + 1); setShowExplanation(false); }} className="h-12 md:h-14 px-4 md:px-8 font-bold text-xs gap-2 rounded-xl bg-slate-900 text-white hover:bg-black">Next <ChevronRight className="h-5 w-5" /></Button>
         </div>
      </div>
      
      <Footer />
    </div>
  )
}

function SummaryMetric({ label, val, icon }: any) {
  return (
    <div className="p-4 md:p-6 bg-slate-50/50 rounded-2xl border border-slate-50 flex flex-col items-center justify-center text-center gap-1.5 transition-all hover:bg-white hover:shadow-lg group">
       <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">{icon}</div>
       <div className="space-y-0.5">
          <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-sm md:text-lg font-black tracking-tight">{val}</p>
       </div>
    </div>
  )
}

function FilterBtn({ active, onClick, label, count, color = "bg-primary" }: any) {
   return (
      <button onClick={onClick} className={cn("flex items-center gap-3 px-6 py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest border transition-all whitespace-nowrap active:scale-95", active ? `${color} text-white border-transparent shadow-lg` : "bg-white text-slate-400 border-slate-100 hover:border-slate-300")}>
         {label} <span className={cn("px-2 py-0.5 rounded-md text-[9px]", active ? "bg-white/20" : "bg-slate-50")}>{count}</span>
      </button>
   )
}

function ReviewStatusBadge({ userAns, correctAns }: any) {
   // Strict rules for status badge logic
   const isAttempted = userAns !== null && userAns !== undefined && userAns !== "";
   if (!isAttempted) return <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg">Skipped</Badge>;
   
   const isCorrect = ['A','B','C','D','E'][Number(userAns)] === correctAns;
   if (isCorrect) return <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg">Correct</Badge>;
   
   return <Badge className="bg-rose-50 text-rose-600 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg">Wrong</Badge>;
}
