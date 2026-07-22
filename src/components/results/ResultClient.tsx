"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
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
  BarChart3,
  List,
  Award,
  Timer,
  FileText,
  AlertCircle,
  ChevronRight,
  RotateCcw
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

/**
 * @fileOverview Universal Result Hub Viewer v4.2.
 * FIXED: Accurate state rank calculation with latest submission node inclusion.
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
  const [activeMainTab, setActiveMainTab] = useState<string>("OVERVIEW")

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
  const brandRef = useMemo(() => (db ? doc(db, 'settings', 'branding') : null), [db]);

  const { data: cloudSession, loading: resultLoading } = useDoc<any>(resultRef);
  const { data: branding } = useDoc<BrandingSettings>(brandRef);

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
     if (!sessionData) return { rank: '?', total: 0, percentile: 0 };
     
     const uniqueMap = new Map<string, any>();
     
     // CRITICAL: Inject current session into map to ensure immediate rank update
     if (user?.uid) {
       uniqueMap.set(user.uid, { ...sessionData, userId: user.uid });
     }

     if (rawGlobalResults) {
       [...rawGlobalResults].forEach((r: any) => {
          if (!uniqueMap.has(r.userId) || uniqueMap.get(r.userId).score < r.score) {
             uniqueMap.set(r.userId, r);
          }
       });
     }

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
     const m = Math.floor((seconds % 3600) / 60);
     const s = Math.round(totalSecs % 60);
     
     if (h > 0) return `${h}h ${m}m ${s}s`;
     return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const handleSharePdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    toast({ title: "Generating report", description: "Audit sync in progress..." });
    
    setActiveMainTab("REPORT");

    try {
      await new Promise(resolve => setTimeout(resolve, 800)); 
      
      const { jsPDF } = await import('jspdf');
      const { toCanvas } = await import('html-to-image');
      
      await document.fonts.ready;

      const p1 = document.getElementById('cracklix-result-page-1');
      const p2 = document.getElementById('cracklix-result-page-2');
      
      if (!p1 || !p2) {
         throw new Error("Report rendering failed. Target items not found.");
      }

      const captureOptions = {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#ffffff',
        style: { transform: 'scale(1)' }
      };

      const waitForImages = async (el: HTMLElement) => {
         const imgs = Array.from(el.querySelectorAll('img'));
         await Promise.all(imgs.map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
               img.onload = resolve;
               img.onerror = resolve;
            });
         }));
      };

      await waitForImages(p1);
      await waitForImages(p2);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const canvas1 = await toCanvas(p1, captureOptions);
      const img1 = canvas1.toDataURL('image/jpeg', 1.0);
      pdf.addImage(img1, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      
      const canvas2 = await toCanvas(p2, captureOptions);
      const img2 = canvas2.toDataURL('image/jpeg', 1.0);
      pdf.addPage();
      pdf.addImage(img2, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      
      const fileName = `Report_${mockData?.title?.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      pdf.save(fileName);
      
      toast({ title: "Report downloaded", description: "Verified document saved successfully." });
    } catch (e: any) {
      console.error("[PDF_FAIL]:", e);
      toast({ variant: "destructive", title: "Export blocked", description: "Failed to render report components." });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!mounted || (resultLoading && user) || (loadingQuestions && questions.length === 0)) return (
     <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-6">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-[10px] font-bold text-slate-300 tracking-tight">Preparing analysis...</p>
     </div>
  );

  const completionPercent = questions.length > 0 
    ? Math.round(((categorizedNodes.correct.length + categorizedNodes.wrong.length) / questions.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-[#0F172A] selection:bg-primary/10 flex flex-col overflow-x-hidden">
      
      <Navbar />

      <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-12 space-y-8 md:space-y-16 pb-40">
        
        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full space-y-6 md:space-y-12">
           <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <div className="bg-white border border-slate-100 p-1 rounded-xl flex items-center h-12 md:h-14 shadow-sm w-full lg:w-auto overflow-hidden">
                 <TabsList className="bg-transparent border-none p-0 flex h-full w-full justify-between gap-0.5">
                    <TabsTrigger value="OVERVIEW" className="flex-1 rounded-lg px-3 md:px-6 font-bold text-[9px] md:text-xs tracking-tight gap-2 data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all h-full whitespace-nowrap">
                       <BarChart3 className="h-3.5 w-3.5" /> Performance
                    </TabsTrigger>
                    <TabsTrigger value="REVIEW" className="flex-1 rounded-lg px-3 md:px-6 font-bold text-[9px] md:text-xs tracking-tight gap-2 data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all h-full whitespace-nowrap">
                       <List className="h-3.5 w-3.5" /> Review test
                    </TabsTrigger>
                    <TabsTrigger value="REPORT" className="flex-1 rounded-lg px-3 md:px-6 font-bold text-[9px] md:text-xs tracking-tight gap-2 data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all h-full whitespace-nowrap">
                       <ShieldCheck className="h-3.5 w-3.5" /> Report
                    </TabsTrigger>
                 </TabsList>
              </div>

              <div className="flex items-center gap-2 w-full lg:w-auto">
                 <Button 
                   onClick={handleSharePdf} 
                   disabled={isGeneratingPdf} 
                   className="flex-1 lg:flex-none h-12 md:h-14 px-5 md:px-8 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-[9px] md:text-[11px] tracking-tight rounded-xl shadow-lg border-none gap-2 transition-all active:scale-95"
                 >
                    {isGeneratingPdf ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />} 
                    PDF
                 </Button>
                 <Button 
                   onClick={() => router.push(`/mocks/instructions?id=${mockId}`)} 
                   variant="outline" 
                   className="flex-1 lg:flex-none h-12 md:h-14 px-5 md:px-8 border-2 border-slate-200 rounded-xl font-bold text-[9px] md:text-[11px] tracking-tight bg-white hover:bg-slate-50 text-[#0F172A] gap-2 transition-all active:scale-95"
                 >
                    <RotateCcw className="h-3.5 w-3.5" /> Retake
                 </Button>
              </div>
           </div>

           <TabsContent value="OVERVIEW" className="space-y-8 md:space-y-12 animate-in fade-in duration-500">
              <section>
                 <Card className="border-none shadow-sm rounded-[24px] bg-white overflow-hidden border border-slate-100">
                    <div className="p-5 md:p-12 flex flex-col lg:flex-row items-center gap-6 md:gap-16">
                       <div className="relative shrink-0 flex flex-col items-center gap-4">
                          <div className="relative h-40 w-44 md:h-64 md:w-64 flex items-center justify-center">
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
                                <span className={cn("text-5xl md:text-8xl font-[900] tracking-tighter tabular-nums", performanceStatus.color)}>
                                   {performanceStatus.grade}
                                </span>
                                <p className="text-[9px] font-black text-slate-400 tracking-widest mt-0.5">Grade</p>
                             </div>
                          </div>
                          <Badge className={cn("border-none font-bold text-[10px] md:text-[11px] px-5 py-1.5 rounded-full shadow-sm", performanceStatus.bg, performanceStatus.color)}>
                             {performanceStatus.label}
                          </Badge>
                       </div>

                       <div className="flex-1 text-center lg:text-left space-y-6 w-full min-w-0">
                          <div className="space-y-3">
                             <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                                <Badge variant="outline" className="border-slate-100 bg-slate-50 text-slate-400 font-bold text-[9px] px-3 py-1 rounded-lg">Verified hub</Badge>
                                <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1.5">
                                   <Clock className="h-3 w-3" /> {new Date(sessionData?.timestamp).toLocaleDateString('en-GB')}
                                </span>
                             </div>
                             <div className="space-y-1">
                                <p className="text-[9px] font-black text-primary tracking-[0.2em]">{profile?.name || "Aspirant"}</p>
                                <h1 className="text-2xl md:text-5xl font-black tracking-tight text-[#0F172A] leading-tight">{mockData?.title}</h1>
                             </div>
                          </div>
                          <div className="p-5 md:p-8 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                             <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                             <p className="text-xs md:text-lg font-medium text-slate-600 leading-relaxed text-left">
                                {performanceStatus.desc} View the detailed official report in the next tab for depth analysis.
                             </p>
                          </div>
                       </div>
                    </div>
                 </Card>
              </section>

              <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6">
                 <StatCard label="State rank" val={user ? `#${merit.rank}` : "---"} icon={<Trophy className="text-amber-500" />} />
                 <StatCard label="Final score" val={(sessionData?.score || 0).toFixed(1)} icon={<Zap className="text-primary" />} />
                 <StatCard label="Accuracy" val={`${sessionData?.accuracy || 0}%`} icon={<Target className="text-emerald-500" />} />
                 <StatCard label="Percentile" val={`${merit.percentile}%`} icon={<Award className="text-purple-500" />} />
                 <StatCard label="Time taken" val={formatTimeTaken(sessionData?.timeTaken || 0)} icon={<Timer className="text-blue-500" />} />
                 <StatCard label="Completion" val={`${completionPercent}%`} icon={<ShieldCheck className="text-emerald-600" />} />
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12">
                 <div className="lg:col-span-8 space-y-8">
                    <div className="space-y-5">
                       <h2 className="text-lg md:text-xl font-bold text-[#0F172A] px-1">Subject performance</h2>
                       <div className="rounded-[20px] border border-slate-100 overflow-hidden shadow-sm bg-white overflow-x-auto">
                          <table className="w-full text-left border-collapse min-w-[500px]">
                             <thead className="bg-[#0F172A] text-white">
                                <tr className="h-12">
                                   <th className="px-6 text-[10px] font-black tracking-widest">Subject</th>
                                   <th className="px-3 text-[10px] font-black tracking-widest text-center">Items</th>
                                   <th className="px-3 text-[10px] font-black tracking-widest text-center">Accuracy</th>
                                   <th className="px-3 text-[10px] font-black tracking-widest text-center">Score</th>
                                   <th className="px-6 text-[10px] font-black tracking-widest text-right">Mastery</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-50">
                                {analysis.subjects.map((sub, i) => (
                                   <tr key={i} className="h-16 hover:bg-slate-50/50 transition-colors">
                                      <td className="px-6 font-bold text-[#0F172A] text-sm">{sub.name}</td>
                                      <td className="px-3 text-center font-medium text-slate-500 tabular-nums text-xs">{sub.total}</td>
                                      <td className="px-3 text-center">
                                         <Badge className={cn("border-none px-2 py-0.5 font-bold text-[9px]", sub.accuracy > 70 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>{sub.accuracy}%</Badge>
                                      </td>
                                      <td className="px-3 text-center font-black tabular-nums text-xs">{sub.score.toFixed(1)}</td>
                                      <td className="px-6 text-right">
                                         <div className="w-24 ml-auto h-1 bg-slate-100 rounded-full overflow-hidden shadow-inner">
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

                 <div className="lg:col-span-4 space-y-6">
                    <Card className="border-none shadow-sm rounded-[20px] bg-white p-6 border border-slate-100 space-y-6 text-left">
                       <h3 className="font-bold text-base flex items-center gap-2.5"><Layers className="h-4 w-4 text-primary" /> Complexity audit</h3>
                       <div className="space-y-5">
                          <AuditRow label="Easy items" val={analysis.difficulty.easy} color="bg-emerald-500" />
                          <AuditRow label="Medium items" val={analysis.difficulty.medium} color="bg-blue-500" />
                          <AuditRow label="Expert items" val={analysis.difficulty.hard} color="bg-rose-500" />
                       </div>
                    </Card>

                    <Card className="border-none shadow-sm rounded-[20px] bg-white p-6 border border-slate-100 space-y-6 text-left">
                       <h3 className="font-bold text-base flex items-center gap-2.5"><Clock className="h-4 w-4 text-primary" /> Temporal audit</h3>
                       <div className="space-y-3.5">
                          <TimeAuditNode label="Avg ingestion speed" val={`${Math.round((sessionData?.timeTaken || 0) / (questions.length || 1))}s`} />
                          <TimeAuditNode label="Decision speed" val="High" />
                          <TimeAuditNode label="Efficiency hub" val="Active" />
                       </div>
                    </Card>
                 </div>
              </div>
           </TabsContent>

           <TabsContent value="REVIEW" className="space-y-8 animate-in fade-in duration-500">
              <div className="max-w-4xl mx-auto space-y-8">
                 <div className="bg-white border border-slate-100 rounded-2xl p-1.5 flex flex-row items-center justify-between shadow-md h-14 md:h-16 overflow-hidden">
                    <ReviewTab active={activeReviewFilter === 'ALL'} onClick={() => setActiveReviewFilter('ALL')} label="All" count={categorizedNodes.all.length} />
                    <ReviewTab active={activeReviewFilter === 'CORRECT'} onClick={() => setActiveReviewFilter('CORRECT')} label="Correct" count={categorizedNodes.correct.length} color="text-emerald-600" />
                    <ReviewTab active={activeReviewFilter === 'WRONG'} onClick={() => setActiveReviewFilter('WRONG')} label="Incorrect" count={categorizedNodes.wrong.length} color="text-rose-600" />
                    <ReviewTab active={activeReviewFilter === 'SKIPPED'} onClick={() => setActiveReviewFilter('SKIPPED')} label="Skipped" count={categorizedNodes.skipped.length} color="text-slate-400" />
                 </div>

                 <div className="space-y-5">
                    <AnimatePresence mode="wait">
                       {filteredQuestions.map((q, idx) => (
                          <motion.div 
                            key={q.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ delay: idx * 0.02 }}
                          >
                             <Card className="border-none shadow-sm rounded-[20px] bg-white overflow-hidden border border-slate-100 text-left">
                                <div className="p-6 md:p-12 space-y-8">
                                   <div className="flex justify-between items-center">
                                      <div className="flex items-center gap-3">
                                         <div className="h-8 w-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center font-black text-[10px]">{q.originalIndex + 1}</div>
                                         <Badge variant="outline" className="text-[9px] font-bold border-slate-100 text-slate-400">Registry entry</Badge>
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
              </div>
           </TabsContent>

           <TabsContent value="REPORT" className="animate-in fade-in zoom-in-95 duration-700">
              <div className="flex flex-col items-center">
                 <div className="w-full flex justify-center bg-slate-100 p-2 md:p-10 rounded-[2rem] border-2 border-dashed border-slate-200 shadow-inner overflow-hidden">
                    <div className="transform scale-[0.35] sm:scale-[0.6] md:scale-[0.8] lg:scale-100 origin-top">
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
                          resultId={sessionData?.id || "REG_ENTRY"} 
                          percentile={merit.percentile} 
                          branding={branding}
                          subjects={analysis.subjects}
                          difficulty={analysis.difficulty}
                          timeMetrics={{
                             avg: `${Math.round((sessionData?.timeTaken || 0) / (questions.length || 1))}s`,
                             fastest: "8s",
                             slowest: "52s"
                          }}
                          isForPdf={true}
                       />
                    </div>
                 </div>
              </div>
           </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}

function StatCard({ label, val, icon }: any) {
  return (
    <Card className="border-none shadow-sm bg-white p-4 md:p-8 rounded-[18px] transition-all hover:shadow-xl hover:translate-y-[-2px] border border-slate-100 text-left relative overflow-hidden">
       <div className="absolute top-0 right-0 p-3 opacity-5">{icon}</div>
       <div className="space-y-0.5 relative z-10">
          <p className="text-[8px] md:text-[9px] font-black text-slate-400 tracking-widest leading-none">{label}</p>
          <p className="text-lg md:text-3xl font-black text-[#0F172A] tabular-nums tracking-tighter leading-none">{val}</p>
       </div>
    </Card>
  )
}

function AuditRow({ label, val, color }: any) {
   return (
      <div className="space-y-1.5">
         <div className="flex justify-between items-center px-1">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
            <span className="text-[11px] font-black text-[#0F172A] tabular-nums">{val}%</span>
         </div>
         <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner">
            <motion.div initial={{ width: 0 }} whileInView={{ width: `${val}%` }} transition={{ duration: 1.2 }} className={cn("h-full", color)} />
         </div>
      </div>
   )
}

function TimeAuditNode({ label, val }: any) {
   return (
      <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
         <span className="text-[10px] font-bold text-slate-400">{label}</span>
         <span className="text-xs font-black tabular-nums">{val}</span>
      </div>
   )
}

function ReviewTab({ active, onClick, label, count, color = "text-[#0F172A]" }: any) {
   return (
      <button 
        onClick={() => onClick()}
        className={cn(
          "flex-1 h-full rounded-xl flex items-center justify-center gap-1.5 transition-all font-[800] text-[9px] md:text-[11px] tracking-tight px-1",
          active ? "bg-[#0F172A] text-white shadow-xl scale-[1.03] z-10" : "bg-transparent text-slate-400 hover:text-slate-600"
        )}
      >
         <span className="truncate">{label}</span>
         <span className={cn("tabular-nums px-1.5 py-0.5 rounded-lg text-[8px] font-black", active ? "bg-white/10" : "bg-slate-50", !active && color)}>{count}</span>
      </button>
   )
}

function ReviewStatusPill({ userAns, correctAns }: any) {
   const isAttempted = userAns !== null && userAns !== undefined && String(userAns) !== "";
   if (!isAttempted) return <Badge className="bg-slate-100 text-slate-500 border-none px-3 py-1 rounded-full font-black text-[8px] tracking-widest uppercase">Skipped</Badge>;
   const isCorrect = ['A','B','C','D'][Number(userAns)] === correctAns;
   return isCorrect 
     ? <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1 rounded-full font-black text-[8px] tracking-widest uppercase">Correct</Badge>
     : <Badge className="bg-rose-50 text-rose-600 border-none px-3 py-1 rounded-full font-black text-[8px] tracking-widest uppercase">Incorrect</Badge>;
}