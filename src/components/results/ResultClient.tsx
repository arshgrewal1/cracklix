"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useCollection, useFirestore, useDoc } from "@/firebase"
import { collection, query, where, doc, getDoc, documentId, getDocs, limit, serverTimestamp, addDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
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
  X,
  Timer,
  FileSearch,
  BookOpen,
  ArrowUpRight,
  Flame,
  MessageCircle,
  Heart,
  Lightbulb,
  Landmark,
  Star,
  Bookmark,
  Check
} from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import { motion, AnimatePresence } from "framer-motion"
import { toPng } from "html-to-image"
import { jsPDF } from "jspdf"
import ResultCard from "./ResultCard"

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

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
              const [mcqSnap, legacySnap] = await Promise.all([
                 getDocs(query(collection(db, "mcqBank"), where(documentId(), "in", chunk))),
                 getDocs(query(collection(db, "questions"), where(documentId(), "in", chunk)))
              ]);

              mcqSnap.docs.forEach(d => fetchedQuestions.push({ ...d.data(), id: d.id }));
              legacySnap.docs.forEach(d => {
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

  useEffect(() => {
    setCurrentReviewIdx(0);
  }, [activeReviewFilter]);

  const performanceStatus = useMemo(() => {
     const acc = sessionData?.accuracy || 0;
     if (acc >= 90) return { label: "Outstanding", color: "text-emerald-600", bg: "bg-emerald-50", desc: "Top-tier analytical capability verified." };
     if (acc >= 75) return { label: "Excellent", color: "text-[#2563EB]", bg: "bg-blue-50", desc: "Institutional grade performance achieved." };
     if (acc >= 60) return { label: "Very Good", color: "text-blue-500", bg: "bg-blue-50/50", desc: "Consistently above average logic flow." };
     if (acc >= 50) return { label: "Good", color: "text-amber-600", bg: "bg-amber-50", desc: "Solid foundation, needs pattern practice." };
     if (acc >= 40) return { label: "Average", color: "text-orange-600", bg: "bg-orange-50", desc: "Moderate grasp, requires intensive review." };
     return { label: "Needs Work", color: "text-rose-600", bg: "bg-rose-50", desc: "Focus on subject nodes to improve accuracy." };
  }, [sessionData]);

  const analysis = useMemo(() => {
     if (!sessionData || !questions.length) return { subjects: [], difficulty: { easy: 0, medium: 0, hard: 0 } };
     
     const subMap: Record<string, any> = {};
     const difficultyCount = { easy: 0, medium: 0, hard: 0 };
     const difficultyCorrect = { easy: 0, medium: 0, hard: 0 };

     categorizedNodes.all.forEach((q) => {
        const sId = q.subjectId || 'General Hub';
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

  const achievements = useMemo(() => {
    if (!sessionData) return [];
    const pool = [];
    if (sessionData.accuracy >= 100) pool.push({ label: "Perfect Precision", icon: <Trophy className="text-amber-500" />, desc: "100% Accuracy Achieved" });
    if (sessionData.accuracy >= 90) pool.push({ label: "Accuracy Master", icon: <Target className="text-emerald-500" />, desc: "Top 90%+ Accuracy" });
    if ((sessionData.timeTaken / (questions.length || 1)) < 30) pool.push({ label: "Speed Demon", icon: <Zap className="text-orange-500" />, desc: "Lightning fast attempt" });
    if (sessionData.score > 80) pool.push({ label: "High Flyer", icon: <Award className="text-primary" />, desc: "Elite score threshold" });
    return pool;
  }, [sessionData, questions.length]);

  const formatTime = (seconds: any) => {
     const totalSecs = Number(seconds);
     if (isNaN(totalSecs) || totalSecs <= 0) return "0s";
     const h = Math.floor(totalSecs / 3600);
     const m = Math.floor((totalSecs % 3600) / 60);
     const s = Math.round(totalSecs % 60);
     return h > 0 ? `${h}h ${m}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const handleSharePdf = async () => {
    if (isGeneratingPdf || !sessionData) return;
    setIsGeneratingPdf(true);
    toast({ title: "Generating Report", description: "Synthesizing deep-dive analytics..." });

    try {
      const page1 = document.getElementById('cracklix-result-page-1');
      const page2 = document.getElementById('cracklix-result-page-2');
      if (!page1 || !page2) throw new Error("Canvas nodes missing");

      const img1 = await toPng(page1, { width: 1000, height: 1414, pixelRatio: 2 });
      const img2 = await toPng(page2, { width: 1000, height: 1414, pixelRatio: 2 });

      const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: [1000, 1414] });
      pdf.addImage(img1, 'PNG', 0, 0, 1000, 1414);
      pdf.addPage([1000, 1414], 'p');
      pdf.addImage(img2, 'PNG', 0, 0, 1000, 1414);

      const fileName = `Cracklix_Report_${mockData?.title?.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
      toast({ title: "Report Exported", description: "Assessment saved to device." });
    } catch (error) {
      toast({ variant: "destructive", title: "PDF Failure" });
    } finally { setIsGeneratingPdf(false); }
  };

  if (!mounted || (resultLoading && user) || (loadingQuestions && questions.length === 0)) return (
     <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-6">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Preparing Analysis...</p>
     </div>
  );

  const currentQuestion = filteredQuestions[currentReviewIdx];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-[#0F172A] selection:bg-primary/10 flex flex-col overflow-x-hidden">
      
      {/* HIDDEN A4 TEMPLATE FOR PDF */}
      <div className="fixed left-[-3000px] top-0 pointer-events-none">
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
                avg: `${Math.round((sessionData?.timeTaken || 0) / (categorizedNodes.all.length || 1))}s`,
                fastest: "4s",
                slowest: "124s"
             }}
           />
      </div>

      <Navbar />

      <main className="flex-1 w-full max-w-[1280px] mx-auto p-4 md:p-12 space-y-8 md:space-y-16 pb-40">
        
        {/* PREMIUM RESULT HERO */}
        <section className="animate-in fade-in slide-in-from-top-4 duration-700">
           <Card className="border-none shadow-[0_40px_100px_rgba(0,0,0,0.06)] rounded-[3rem] overflow-hidden bg-white relative border border-slate-100">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-blue-500 to-indigo-500" />
              
              <div className="p-8 md:p-16 flex flex-col lg:flex-row items-center gap-12 md:gap-20">
                 {/* LEFT: CIRCULAR PROGRESS HUB */}
                 <div className="relative shrink-0">
                    <div className="relative h-56 w-56 md:h-80 md:w-80 flex items-center justify-center">
                       <svg className="h-full w-full transform -rotate-90">
                          <circle cx="50%" cy="50%" r="46%" className="stroke-slate-100 fill-none" strokeWidth="14" />
                          <motion.circle 
                             cx="50%" cy="50%" r="46%" 
                             className="stroke-[#2563EB] fill-none" 
                             strokeWidth="14" 
                             strokeLinecap="round"
                             initial={{ strokeDashoffset: 289 }}
                             animate={{ strokeDashoffset: 289 - (289 * (sessionData?.accuracy || 0) / 100) }}
                             transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                             style={{ strokeDasharray: 289 }}
                          />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <motion.span 
                             initial={{ scale: 0.5, opacity: 0 }}
                             animate={{ scale: 1, opacity: 1 }}
                             transition={{ delay: 1, duration: 0.5 }}
                             className="text-6xl md:text-8xl font-black tracking-tighter tabular-nums"
                          >
                             {sessionData?.accuracy || 0}%
                          </motion.span>
                          <Badge className={cn("mt-2 border-none font-black text-[10px] md:text-sm uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg", performanceStatus.bg, performanceStatus.color)}>
                             {performanceStatus.label}
                          </Badge>
                       </div>
                    </div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#0F172A] text-white px-5 py-2 rounded-2xl shadow-2xl border border-white/10 whitespace-nowrap">
                       <ShieldCheck className="h-4 w-4 text-primary" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Assessment Verified</span>
                    </div>
                 </div>

                 {/* RIGHT: IDENTITY & ACTIONS */}
                 <div className="flex-1 space-y-8 text-center lg:text-left w-full">
                    <div className="space-y-4">
                       <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                          <Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-400 font-black text-[10px] px-3 py-1 uppercase tracking-widest">Official Registry Node</Badge>
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                             <Clock className="h-3.5 w-3.5" /> Synchronized: Just Now
                          </span>
                       </div>
                       <h1 className="text-3xl md:text-6xl font-black tracking-tighter leading-tight text-[#0F172A] uppercase">{mockData?.title}</h1>
                       <p className="text-slate-500 font-medium text-sm md:text-xl max-w-2xl leading-relaxed">{performanceStatus.desc}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                       <Button onClick={handleSharePdf} disabled={isGeneratingPdf} className="w-full sm:w-auto h-14 md:h-18 px-10 md:px-16 bg-[#2563EB] hover:bg-blue-700 text-white font-black uppercase text-[11px] tracking-widest rounded-2xl shadow-3xl gap-3 border-none transition-all active:scale-95">
                          {isGeneratingPdf ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />} 
                          Download Report
                       </Button>
                       <Button onClick={() => router.push(`/mocks/instructions?id=${mockId}`)} variant="outline" className="w-full sm:w-auto h-14 md:h-18 px-10 md:px-14 border-2 border-slate-200 text-[#0F172A] font-black uppercase text-[11px] tracking-widest rounded-2xl bg-white hover:bg-slate-50 gap-3 shadow-sm transition-all active:scale-95">
                          <RotateCcw className="h-5 w-5 text-primary" /> Retake Test
                       </Button>
                    </div>

                    <div className="pt-8 border-t border-slate-50 flex flex-wrap justify-center lg:justify-start items-center gap-8 md:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                       <Landmark className="h-6 w-6" />
                       <ShieldCheck className="h-6 w-6" />
                       <Star className="h-6 w-6" />
                       <Zap className="h-6 w-6" />
                    </div>
                 </div>
              </div>
           </Card>
        </section>

        {/* 2X4 PREMIUM STATS GRID */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
           <StatCard label="Final Score" val={(sessionData?.score || 0).toFixed(1)} sub="Registry Pts" icon={<Zap className="text-blue-500" />} />
           <StatCard label="State Rank" val={user ? `#${merit.rank}` : "---"} sub="Live Ranking" icon={<Trophy className="text-amber-500" />} highlight />
           <StatCard label="Accuracy" val={`${sessionData?.accuracy || 0}%`} sub="Mastery Index" icon={<Target className="text-emerald-500" />} />
           <StatCard label="Percentile" val={`${merit.percentile}%`} sub="Performance" icon={<Award className="text-purple-500" />} />
           <StatCard label="Correct" val={categorizedNodes.correct.length} sub="Verified Nodes" icon={<CheckCircle2 className="text-emerald-600" />} />
           <StatCard label="Incorrect" val={categorizedNodes.wrong.length} sub="Error Audit" icon={<XCircle className="text-rose-500" />} />
           <StatCard label="Skipped" val={categorizedNodes.skipped.length} sub="Stagnant Nodes" icon={<AlertCircle className="text-slate-400" />} />
           <StatCard label="Time Taken" val={formatTime(sessionData?.timeTaken || 0)} sub="Duration" icon={<Clock className="text-indigo-500" />} />
        </section>

        {/* ANALYTICS & ACHIEVEMENTS HUB */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
           <div className="lg:col-span-8 space-y-10">
              <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden border border-slate-100">
                 <CardHeader className="p-8 md:p-12 border-b border-slate-50 bg-slate-50/30 text-left">
                    <div className="flex items-center justify-between">
                       <div>
                          <CardTitle className="text-xl md:text-3xl font-black text-[#0F172A] tracking-tight">Subject Mastery</CardTitle>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Institutional category audit</p>
                       </div>
                       <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] uppercase px-4 py-1.5 rounded-full shadow-inner">Real-time Node</Badge>
                    </div>
                 </CardHeader>
                 <CardContent className="p-8 md:p-14 space-y-10">
                    {analysis.subjects.map((sub, i) => (
                       <div key={i} className="space-y-4">
                          <div className="flex justify-between items-end">
                             <div className="space-y-1">
                                <h4 className="text-sm md:text-xl font-bold text-[#0F172A]">{sub.name}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sub.correct} / {sub.total} Verified</p>
                             </div>
                             <div className="text-right">
                                <span className={cn("text-lg md:text-2xl font-black tabular-nums", sub.accuracy > 70 ? "text-emerald-600" : "text-amber-600")}>{sub.accuracy}%</span>
                             </div>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                             <motion.div 
                               initial={{ width: 0 }}
                               whileInView={{ width: `${sub.accuracy}%` }}
                               transition={{ duration: 1, ease: "easeOut" }}
                               className={cn("h-full shadow-lg", sub.accuracy > 70 ? "bg-emerald-500" : "bg-amber-500")} 
                             />
                          </div>
                       </div>
                    ))}
                 </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 md:p-12 space-y-8 text-left border border-slate-100 overflow-hidden">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-inner">
                          <BarChart3 className="h-6 w-6" />
                       </div>
                       <h3 className="text-lg md:text-2xl font-black text-[#0F172A] tracking-tight">Difficulty Matrix</h3>
                    </div>
                    <div className="space-y-6">
                       <DiffLevel label="Easy Nodes" val={analysis.difficulty.easy} color="bg-emerald-500" />
                       <DiffLevel label="Medium Nodes" val={analysis.difficulty.medium} color="bg-blue-500" />
                       <DiffLevel label="Expert Nodes" val={analysis.difficulty.hard} color="bg-rose-500" />
                    </div>
                 </Card>

                 <Card className="border-none shadow-xl rounded-[2.5rem] bg-[#0F172A] text-white p-8 md:p-12 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Zap className="h-44 w-44 text-primary" /></div>
                    <div className="relative z-10 space-y-8">
                       <div className="space-y-1">
                          <h3 className="text-2xl font-black tracking-tight">AI Insights</h3>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Logic Hub Recommendation</p>
                       </div>
                       <div className="space-y-5">
                          <RecommendationNode label="Consistency" text={sessionData?.accuracy > 60 ? "Strong mastery detected in core hubs." : "Review subject fundamentals to increase index."} />
                          <RecommendationNode label="Speed" text={sessionData?.timeTaken < (questions.length * 60) ? "Optimal processing speed verified." : "Optimize per-question ingestion rate."} />
                          <RecommendationNode label="Goal" text="Prepare for the next full-length mock to lock rankings." />
                       </div>
                    </div>
                 </Card>
              </div>
           </div>

           <div className="lg:col-span-4 space-y-10">
              <section className="space-y-6">
                 <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Unlocked Badges</h3>
                 <div className="grid grid-cols-1 gap-4">
                    {achievements.length > 0 ? achievements.map((a, i) => (
                       <Card key={i} className="border-none shadow-lg rounded-2xl bg-white p-6 flex items-center gap-5 group hover:shadow-xl transition-all hover:-translate-x-1 border border-slate-50">
                          <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                             {a.icon}
                          </div>
                          <div className="min-w-0 text-left">
                             <p className="font-black text-[#0F172A] text-sm leading-none uppercase">{a.label}</p>
                             <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tight">{a.desc}</p>
                          </div>
                       </Card>
                    )) : (
                       <div className="p-12 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 opacity-40">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Mastery locked</p>
                       </div>
                    )}
                 </div>
              </section>

              <Card className="border-none shadow-2xl rounded-[3rem] bg-white p-8 md:p-12 space-y-10 text-center border border-slate-100 overflow-hidden group">
                 <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary shadow-2xl group-hover:scale-110 transition-transform duration-700">
                    <Medal className="h-10 w-10 fill-current" />
                 </div>
                 <div className="space-y-3">
                    <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">State Ranking Hub</h3>
                    <p className="text-slate-500 font-medium text-sm">Your performance has been synchronized with the master merit registry across Punjab.</p>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <span>Total Competitors</span>
                       <span className="text-primary tabular-nums">{merit.total.toLocaleString()}</span>
                    </div>
                    <div className="h-1 w-full bg-white rounded-full overflow-hidden"><div className="h-full bg-primary w-3/4" /></div>
                 </div>
                 <Button asChild variant="ghost" className="w-full text-primary font-black uppercase text-[10px] tracking-widest gap-2 hover:bg-primary/5 rounded-xl transition-all">
                    <Link href="/leaderboard">Full Merit List <ChevronRight className="h-4 w-4" /></Link>
                 </Button>
              </Card>
           </div>
        </div>

        {/* QUESTION REVIEW SYSTEM */}
        <section className="space-y-10 pt-16 border-t border-slate-100">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 px-2">
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <FileSearch className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tighter">Detailed Audit</h2>
                 </div>
                 <p className="text-slate-500 font-medium text-sm md:text-xl">Examine every response node and official rationalization.</p>
              </div>
           </div>

           <div className="sticky top-[64px] z-[90] bg-[#F8FAFC]/90 backdrop-blur-xl py-6 -mx-4 px-4 border-b border-slate-200/50">
              <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                 <FilterNode active={activeReviewFilter === 'ALL'} onClick={() => setActiveReviewFilter('ALL')} label="All Items" count={categorizedNodes.all.length} icon={<LayoutGrid />} />
                 <FilterNode active={activeReviewFilter === 'CORRECT'} onClick={() => setActiveReviewFilter('CORRECT')} label="Correct" count={categorizedNodes.correct.length} icon={<CheckCircle2 />} activeColor="bg-emerald-600" />
                 <FilterNode active={activeReviewFilter === 'WRONG'} onClick={() => setActiveReviewFilter('WRONG')} label="Wrong" count={categorizedNodes.wrong.length} icon={<XCircle />} activeColor="bg-rose-600" />
                 <FilterNode active={activeReviewFilter === 'SKIPPED'} onClick={() => setActiveReviewFilter('SKIPPED')} label="Skipped" count={categorizedNodes.skipped.length} icon={<AlertCircle />} activeColor="bg-slate-500" />
              </div>
           </div>

           <div className="max-w-4xl mx-auto space-y-12">
              <AnimatePresence mode="wait">
                 {filteredQuestions.length > 0 ? (
                    <motion.div key={currentQuestion?.id + activeReviewFilter} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4, ease: "easeOut" }} className="space-y-10">
                       <Card className="border-none shadow-3xl rounded-2xl md:rounded-[3rem] bg-white overflow-hidden border border-slate-100 group transition-all duration-700">
                          <div className="p-8 md:p-14 space-y-10">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                   <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-black text-xs md:text-lg shadow-xl">
                                      {currentQuestion.originalIndex + 1}
                                   </div>
                                   <Badge variant="outline" className="bg-slate-50 text-slate-400 border-none font-black text-[9px] uppercase px-3 py-1 rounded-lg">{currentQuestion.difficulty || 'MEDIUM'}</Badge>
                                </div>
                                <ReviewStatus userAns={sessionData.answers?.[currentQuestion.originalIndex] ?? sessionData.answers?.[String(currentQuestion.originalIndex)]} correctAns={currentQuestion.correctAnswer} />
                             </div>

                             <div className="space-y-8">
                                <QuestionRenderer 
                                  question={currentQuestion} 
                                  language={mockData?.languageMode || 'ENGLISH_PUNJABI'} 
                                  showSolution={true} 
                                  selectedAnswer={sessionData.answers?.[currentQuestion.originalIndex] ?? sessionData.answers?.[String(currentQuestion.originalIndex)]} 
                                  className="p-0 shadow-none border-none bg-transparent" 
                                />
                             </div>

                             <div className="pt-10 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                   <button className="h-11 w-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-primary transition-all active:scale-90 shadow-inner"><Bookmark className="h-5 w-5" /></button>
                                   <button className="h-11 w-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-primary transition-all active:scale-90 shadow-inner"><Share2 className="h-5 w-5" /></button>
                                   <button className="h-11 w-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all active:scale-90 shadow-inner"><AlertCircle className="h-5 w-5" /></button>
                                </div>
                                <div className="flex items-center gap-3 bg-blue-50/50 px-6 py-2.5 rounded-full border border-blue-100">
                                   <Timer className="h-4 w-4 text-primary" />
                                   <span className="text-[10px] md:text-[11px] font-black uppercase text-primary tracking-widest tabular-nums">Attempt Time: 42s</span>
                                </div>
                             </div>
                          </div>
                       </Card>

                       <div className="bg-white border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-full px-4 md:px-10 h-16 md:h-24 flex items-center justify-between gap-4">
                          <button disabled={currentReviewIdx === 0} onClick={() => setCurrentReviewIdx(currentReviewIdx - 1)} className="h-10 md:h-16 px-6 md:px-10 rounded-full font-black uppercase text-[10px] md:text-xs tracking-widest text-[#0F172A] hover:bg-slate-50 disabled:opacity-20 transition-all flex items-center gap-3 active:scale-95"><ChevronLeft className="h-4 w-4" /> Previous</button>
                          <div className="flex flex-col items-center">
                             <span className="text-lg md:text-3xl font-black tabular-nums tracking-tighter">{currentReviewIdx + 1} / {filteredQuestions.length}</span>
                             <p className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Question Registry</p>
                          </div>
                          <button disabled={currentReviewIdx >= filteredQuestions.length - 1} onClick={() => setCurrentReviewIdx(currentReviewIdx + 1)} className="h-10 md:h-16 px-6 md:px-10 rounded-full font-black uppercase text-[10px] md:text-xs tracking-widest bg-[#0F172A] text-white hover:bg-black disabled:opacity-20 transition-all flex items-center gap-3 shadow-xl active:scale-95">Next <ChevronRight className="h-4 w-4 text-primary" /></button>
                       </div>
                    </motion.div>
                 ) : (
                    <div className="py-40 text-center opacity-30 animate-in fade-in duration-500">
                       <Search className="h-20 w-20 mx-auto text-slate-300" />
                       <p className="text-xl font-black uppercase tracking-[0.4em] mt-8 text-slate-400">Node Cluster Empty</p>
                    </div>
                 )}
              </AnimatePresence>
           </div>
        </section>

        {/* BOTTOM ACTION HUB */}
        <section className="pt-20">
           <Card className="border-none shadow-5xl rounded-[3rem] bg-[#0B1528] text-white p-10 md:p-24 relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-1000"><Star className="h-64 w-64 text-primary fill-primary" /></div>
              <div className="relative z-10 space-y-12 text-center lg:text-left">
                 <div className="space-y-6">
                    <h2 className="text-3xl md:text-7xl font-[900] tracking-tighter leading-none text-white uppercase">Your journey <br/> <span className="text-primary">continues.</span></h2>
                    <p className="text-slate-400 font-medium text-sm md:text-2xl max-w-2xl mx-auto lg:mx-0 leading-snug">The audit is complete. Now focus on your weak subjects to increase your institutional merit index.</p>
                 </div>
                 
                 <div className="flex flex-col sm:flex-row items-center gap-6">
                    <Button asChild className="w-full sm:w-auto h-16 md:h-20 px-12 md:px-20 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] md:text-sm tracking-widest rounded-2xl md:rounded-3xl shadow-4xl border-none transition-all active:scale-95 group/btn">
                       <Link href="/mocks" className="flex items-center gap-4">Continue Practice <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-2 transition-transform" /></Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full sm:w-auto h-16 md:h-20 px-12 md:px-16 border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-2xl md:rounded-3xl font-black uppercase text-[10px] md:text-sm tracking-widest transition-all active:scale-95 border-none">
                       <Link href="/dashboard">Return Dashboard</Link>
                    </Button>
                 </div>
              </div>
           </Card>
        </section>

      </main>

      <Footer />
    </div>
  )
}

function StatCard({ label, val, sub, icon, highlight }: any) {
  return (
    <Card className={cn(
      "border-none shadow-xl bg-white p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] relative overflow-hidden group border border-slate-50 transition-all hover:translate-y-[-4px]",
      highlight && "ring-4 ring-primary/5"
    )}>
       <div className="absolute top-0 right-0 p-4 md:p-6 opacity-5 group-hover:scale-110 transition-transform">{icon}</div>
       <div className="space-y-3 md:space-y-4 relative z-10 text-left">
          <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
          <p className="text-xl md:text-4xl font-black text-[#0F172A] tabular-nums leading-none tracking-tight">{val}</p>
          <p className="text-[8px] md:text-[9px] font-bold text-slate-300 uppercase tracking-widest">{sub}</p>
       </div>
    </Card>
  )
}

function DiffLevel({ label, val, color }: any) {
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

function RecommendationNode({ label, text }: any) {
   return (
      <div className="flex items-start gap-4 group">
         <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 border border-primary/20 shadow-inner">
            <CheckCircle2 className="h-3 w-3 text-primary stroke-[4px]" />
         </div>
         <div className="space-y-0.5">
            <p className="text-[8px] font-black uppercase text-primary tracking-widest">{label}</p>
            <p className="text-xs md:text-sm font-bold text-slate-300 leading-tight group-hover:text-white transition-colors">{text}</p>
         </div>
      </div>
   )
}

function FilterNode({ active, onClick, label, count, icon, activeColor = "bg-primary" }: any) {
   return (
      <button onClick={onClick} className={cn("flex items-center gap-3 px-6 py-3 rounded-2xl md:rounded-full font-black uppercase text-[10px] md:text-[11px] tracking-widest transition-all whitespace-nowrap border active:scale-95 shadow-sm group", active ? `${activeColor} text-white border-transparent shadow-xl` : "bg-white text-slate-400 border-slate-100 hover:border-slate-300")}>
         {React.cloneElement(icon as React.ReactElement, { className: "h-4 w-4" })}
         {label}
         <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black tabular-nums", active ? "bg-white/20 text-white" : "bg-slate-50 text-slate-400")}>{count}</span>
      </button>
   )
}

function ReviewStatus({ userAns, correctAns }: any) {
   const isAttempted = userAns !== null && userAns !== undefined && String(userAns) !== "";
   if (!isAttempted) return <Badge className="bg-slate-50 text-slate-400 border-none font-black text-[9px] px-4 py-1.5 rounded-full shadow-inner uppercase">SKIPPED</Badge>;
   const isCorrect = ['A','B','C','D'][Number(userAns)] === correctAns;
   return isCorrect 
     ? <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] px-4 py-1.5 rounded-full shadow-inner uppercase tracking-widest">CORRECT</Badge>
     : <Badge className="bg-rose-50 text-rose-600 border-none font-black text-[9px] px-4 py-1.5 rounded-full shadow-inner uppercase tracking-widest">INCORRECT</Badge>;
}