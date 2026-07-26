
'use client';

import React, { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  orderBy,
  deleteDoc,
  where,
  limit,
  increment,
  updateDoc,
  getCountFromServer
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
import { cn } from "@/lib/utils"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import { motion, AnimatePresence } from "framer-motion"
import ResultCard from "./ResultCard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BrandingSettings } from "@/types"
import { AuthorityLogo } from "@/lib/exam-icons"
import { useExamStore } from "@/store/useExamStore"
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

/**
 * @fileOverview Premium Result Analysis Hub v19.0.
 * FIXED: Added missing AlertCircle icon import.
 * FIXED: Normalized typography to Title Case for PWA optimization.
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
  const [resolvedResultId, setResolvedResultId] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  
  const [liveRank, setLiveRank] = useState<number | string>("---")
  const [totalCandidates, setTotalCandidates] = useState<number>(0)

  useEffect(() => { setMounted(true) }, [])

  const mockId = searchParams.get('id')
  const attemptIdFromUrl = searchParams?.get('attemptId')

  // Immediate ID Resolution
  useEffect(() => {
    if (userLoading || !db || !mockId) return;
    
    async function resolveId() {
       if (!user) {
          const guestRes = localStorage.getItem(`cracklix_guest_result_${mockId}`);
          if (guestRes) {
             setGuestResult(JSON.parse(guestRes));
             setResolvedResultId(`guest_${mockId}`);
             return;
          }
       }

       let targetId = attemptIdFromUrl;
       if (!targetId && user) {
          const trackerSnap = await getDoc(doc(db, "attempts", `${user.uid}_${mockId}`));
          if (trackerSnap.exists()) {
              targetId = trackerSnap.data().attemptId;
          }
       }
       
       const finalId = user 
          ? (targetId ? `${user.uid}_${mockId}_${targetId}` : `${user.uid}_${mockId}`)
          : `guest_${mockId}`;
          
       setResolvedResultId(finalId);
    }
    resolveId();
  }, [user, userLoading, db, mockId, attemptIdFromUrl]);

  const resultRef = useMemo(() => (db && user && resolvedResultId ? doc(db, "results", resolvedResultId) : null), [db, user, resolvedResultId]);
  const { data: sessionData, loading: resultLoading } = useDoc<any>(resultRef);
  const { data: branding } = useDoc<BrandingSettings>(useMemo(() => (db ? doc(db, 'settings', 'branding') : null), [db]));

  useEffect(() => {
     if (!db || !mockId || !activeSession) return;
     
     async function fetchRankingMetrics() {
        try {
           const entriesRef = collection(db, "leaderboards", mockId, "entries");
           const countSnap = await getCountFromServer(entriesRef);
           setTotalCandidates(countSnap.data().count);

           const q = query(entriesRef, orderBy("highestScore", "desc"), limit(500));
           const snap = await getDocs(q);
           
           if (isMounted) {
              const entries = snap.docs.map(d => ({ ...d.data(), id: d.id }));
              const sorted = entries.sort((a: any, b: any) => {
                 if (b.highestScore !== a.highestScore) return b.highestScore - a.highestScore;
                 if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
                 if (a.timeTaken !== b.timeTaken) return a.timeTaken - b.timeTaken;
                 return (a.submittedAt?.seconds || 0) - (b.submittedAt?.seconds || 0);
              });

              const myIndex = sorted.findIndex(d => d.id === user?.uid);
              if (myIndex !== -1) {
                 setLiveRank(myIndex + 1);
              } else if (countSnap.data().count > 500) {
                 const superiorQuery = query(entriesRef, where("highestScore", ">", activeSession.score));
                 const superiorCountSnap = await getCountFromServer(superiorQuery);
                 setLiveRank(superiorCountSnap.data().count + 1);
              } else {
                 setLiveRank("---");
              }
           }
        } catch (e) { console.error("[RANKING_AUDIT_FAILURE]:", e); }
     }
     let isMounted = true;
     fetchRankingMetrics();
     return () => { isMounted = false; };
  }, [db, mockId, sessionData, guestResult, user?.uid, mounted]);

  const activeSession = useMemo(() => user ? sessionData : guestResult, [user, sessionData, guestResult]);

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

  const handleRetake = () => {
    if (!db || isSyncing || !mockId) return;
    if (user) {
      deleteDoc(doc(db, "attempts", `${user.uid}_${mockId}`)).catch(() => {});
    }
    resetStore();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`cracklix_guest_attempt_${mockId}`);
      localStorage.removeItem(`cracklix_guest_result_${mockId}`);
    }
    router.replace(`/mocks/attempt?id=${mockId}&retake=true`);
  };

  const handleDownloadPDF = async () => { 
    if (isExporting) return;
    setIsExporting(true);
    try {
      setActiveMainTab("REPORT"); 
      toast({ title: "Generating Report", description: "Capturing institutional document..." });
      await new Promise(r => setTimeout(r, 1000));
      const element = document.getElementById('cracklix-result-card');
      if (!element) throw new Error("Capture node not found.");
      const dataUrl = await toPng(element, { quality: 1, pixelRatio: 2, backgroundColor: '#ffffff' });
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
      pdf.save(`Cracklix_${activeSession.mockTitle.replace(/\s+/g, '_')}.pdf`);
      toast({ title: "Report Downloaded" });
    } catch (e) {
      toast({ variant: "destructive", title: "PDF Export failed." });
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
     const m = Math.floor(secs / 60);
     const s = secs % 60;
     return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  if (!mounted || (resultLoading && user && !activeSession)) {
     return <div className="h-screen w-full flex items-center justify-center bg-white"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>;
  }

  if (!activeSession) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center p-6 space-y-6">
        <AlertCircle className="h-12 w-12 text-rose-500" />
        <h2 className="text-xl font-bold text-[#0F172A]">Entry not found</h2>
        <Button onClick={() => router.push('/dashboard')} className="rounded-xl">Back to dashboard</Button>
      </div>
    );
  }

  const percentile = totalCandidates > 1 
    ? Number(Math.max(0, ((totalCandidates - Number(liveRank)) / totalCandidates) * 100).toFixed(1))
    : 100;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-[#0F172A] selection:bg-primary/10 flex flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-12 space-y-8 md:space-y-10 pb-40">
        
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8 px-1 print:hidden">
           <div className="flex items-center gap-5 md:gap-10 text-left w-full lg:w-auto">
              <AuthorityLogo boardId={activeSession?.boardId || "GENERAL"} size="lg" className="h-14 w-14 md:h-24 md:w-24 rounded-2xl" />
              <div className="space-y-1 flex-1 min-w-0">
                 <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span className="text-[9px] font-bold text-slate-400 tracking-widest">Analysis hub</span>
                 </div>
                 <h1 className="text-xl md:text-3xl font-black tracking-tight text-[#0F172A] leading-tight truncate">
                   {activeSession.mockTitle}
                 </h1>
                 <div className="flex flex-wrap items-center justify-start gap-2 md:gap-3 font-bold text-[9px] md:text-xs">
                    <div className="flex items-center gap-1.5 bg-white border border-slate-100 px-3 py-1.5 rounded-lg text-slate-500 shadow-sm">
                       <Clock className="h-3.5 w-3.5 text-slate-400" /> 
                       <span>{new Date(activeSession.timestamp).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-lg text-primary shadow-sm">
                       <Trophy className="h-3.5 w-3.5" /> 
                       <span>Rank #{liveRank} of {totalCandidates || 1} candidates</span>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="flex flex-col gap-3 w-full lg:w-auto shrink-0">
              <div className="flex bg-white border border-slate-100 p-1 rounded-xl shadow-sm w-full lg:w-auto overflow-x-auto no-scrollbar">
                 <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
                    <TabsList className="bg-transparent border-none p-0 flex h-10 w-full gap-1">
                       <HubTab value="OVERVIEW" label="Summary" />
                       <HubTab value="REVIEW" label="Review" />
                       <HubTab value="REPORT" label="Report" />
                    </TabsList>
                 </Tabs>
              </div>
              <div className="flex gap-2">
                 <button 
                   onClick={handleRetake} 
                   disabled={isSyncing} 
                   className="flex-1 h-11 rounded-xl font-bold uppercase border-2 border-slate-200 bg-white text-[#0F172A] gap-2 text-[10px] tracking-tight hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                 >
                    <RotateCcw className="h-3.5 w-3.5" /> 
                    Retake
                 </button>
                 <Button 
                   onClick={handleDownloadPDF} 
                   disabled={isExporting}
                   className="flex-1 h-11 rounded-xl font-bold uppercase bg-[#0F172A] hover:bg-black text-white gap-2 text-[10px] tracking-tight"
                 >
                    {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} 
                    Download
                 </Button>
              </div>
           </div>
        </div>

        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full space-y-8 md:space-y-12">
           <TabsContent value="OVERVIEW" className="space-y-10 animate-in fade-in duration-500">
              <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
                 <StatCard label="Final Score" val={activeSession.score.toFixed(1)} icon={<Zap className="text-primary" />} />
                 <StatCard label="Punjab Rank" val={`#${liveRank}`} icon={<Trophy className="text-amber-500" />} highlight />
                 <StatCard label="Percentile" val={`${percentile}%`} icon={<TrendingUp className="text-blue-500" />} />
                 <StatCard label="Accuracy" val={`${activeSession.accuracy}%`} icon={<Target className="text-emerald-500" />} />
                 <StatCard label="Wrong" val={activeSession.wrongCount} icon={<XCircle className="text-rose-500" />} />
                 <StatCard label="Time Taken" val={formatTimeStr(activeSession.timeTaken)} icon={<Clock className="text-blue-500" />} />
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
                 <div className="lg:col-span-8">
                    <Card className="border border-slate-100 shadow-xl rounded-[2rem] bg-white p-6 md:p-10 text-left">
                       <h2 className="text-lg md:text-2xl font-bold text-[#0F172A] tracking-tight mb-8">Subject performance audit</h2>
                       <div className="space-y-8">
                          {Array.isArray(activeSession.subjectAnalysis) && activeSession.subjectAnalysis.map((sub: any, i: number) => (
                             <div key={i} className="space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                   <div className="flex items-center gap-2"><BookOpen className="h-3.5 w-3.5 text-primary" /> {sub.name}</div>
                                   <span className="text-[#0F172A] tabular-nums font-black">{sub.accuracy}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100">
                                   <motion.div 
                                      initial={{ width: 0 }} 
                                      animate={{ width: `${sub.accuracy}%` }} 
                                      transition={{ duration: 1, delay: i * 0.05 }} 
                                      className={cn("h-full", sub.accuracy > 70 ? "bg-emerald-500" : sub.accuracy > 40 ? "bg-blue-500" : "bg-rose-500")} 
                                   />
                                </div>
                             </div>
                          ))}
                       </div>
                    </Card>
                 </div>

                 <div className="lg:col-span-4">
                    <Card className="border border-slate-100 shadow-xl rounded-[2rem] bg-[#0F172A] text-white p-6 md:p-8 space-y-6 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000"><Trophy className="h-40 w-40 text-primary" /></div>
                       <div className="relative z-10 space-y-6 text-left">
                          <div className="space-y-1">
                             <h3 className="text-xl font-bold tracking-tight uppercase">Leaderboard</h3>
                             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global standing</p>
                          </div>
                          <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-1">
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">My Standing</p>
                             <p className="text-2xl font-black text-primary tabular-nums tracking-tighter">#{liveRank} of {totalCandidates}</p>
                          </div>
                          <Button asChild className="w-full h-11 bg-primary hover:bg-blue-700 text-white font-bold rounded-lg shadow-xl border-none active:scale-95 transition-all text-xs">
                             <Link href={`/leaderboard?id=${mockId}`}>Full rankings <ArrowRight className="ml-2 h-4 w-4" /></Link>
                          </Button>
                       </div>
                    </Card>
                 </div>
              </div>
           </TabsContent>

           <TabsContent value="REVIEW" className="space-y-8 animate-in fade-in duration-500">
              <div className="max-w-4xl mx-auto space-y-8">
                 <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl shadow-sm border border-slate-100 w-fit mx-auto overflow-x-auto no-scrollbar">
                    <FilterButton active={activeReviewFilter === 'ALL'} label="All" onClick={() => setActiveReviewFilter('ALL')} />
                    <FilterButton active={activeReviewFilter === 'WRONG'} label={`Wrong (${reviewNodes.wrong.length})`} onClick={() => setActiveReviewFilter('WRONG')} color="rose" />
                    <FilterButton active={activeReviewFilter === 'CORRECT'} label="Correct" onClick={() => setActiveReviewFilter('CORRECT')} color="emerald" />
                    <FilterButton active={activeReviewFilter === 'SKIPPED'} label="Skipped" onClick={() => setActiveReviewFilter('SKIPPED')} color="slate" />
                 </div>

                 <div className="space-y-6">
                    {filteredQuestions.map((q) => {
                       const rawAns = activeSession.answers?.[q.originalIndex] ?? activeSession.answers?.[String(q.originalIndex)];
                       const isAttempted = rawAns !== null && rawAns !== undefined && String(rawAns) !== "";
                       const userSelectedLabel = isAttempted ? ['A', 'B', 'C', 'D'][Number(rawAns)] : null;
                       return (
                          <Card key={q.id} className="border border-slate-100 shadow-xl rounded-1.5rem md:rounded-[2rem] overflow-hidden bg-white text-left group">
                             <div className="p-6 md:p-10 space-y-6">
                                <Badge variant="outline" className="px-3 py-0.5 rounded-full border-slate-100 text-slate-400 font-bold text-[9px] uppercase tracking-widest">
                                   Question {q.originalIndex + 1}
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
                       score={activeSession.score.toFixed(1)} 
                       rank={liveRank} 
                       accuracy={activeSession.accuracy} 
                       timeTaken={formatTimeStr(activeSession.timeTaken)} 
                       correct={activeSession.correctCount} 
                       wrong={activeSession.wrongCount} 
                       total={questions.length} 
                       date={new Date(activeSession.timestamp).toLocaleDateString('en-GB')} 
                       resultId={resolvedResultId || "REGISTRY_NODE"} 
                       percentile={percentile} 
                       branding={branding}
                       subjects={activeSession.subjectAnalysis}
                       grade={activeSession.grade}
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

function StatCard({ label, val, icon, highlight }: any) {
  return (
    <Card className={cn(
       "border border-slate-100 shadow-md bg-white p-4 md:p-6 rounded-xl md:rounded-[1.5rem] text-left relative overflow-hidden h-full flex flex-col justify-center transition-all hover:translate-y-[-2px]",
       highlight && "ring-2 ring-primary/5 bg-primary/[0.01]"
    )}>
       <div className="absolute top-0 right-0 p-3 opacity-5">{icon}</div>
       <div className="space-y-0.5 relative z-10">
          <p className="text-[8px] md:text-[10px] font-bold text-slate-400 truncate">{label}</p>
          <p className={cn("text-lg md:text-2xl font-black text-[#0F172A] tabular-nums tracking-tighter leading-none", highlight && "text-primary")}>{val}</p>
       </div>
    </Card>
  )
}

function HubTab({ value, label }: { value: string, label: string }) {
   return (
      <TabsTrigger value={value} className="flex-1 rounded-lg px-2 md:px-8 font-bold text-[9px] md:text-[11px] tracking-tight data-[state=active]:bg-[#0F172A] data-[state=active]:text-white data-[state=active]:shadow-xl transition-all h-full">
         {label}
      </TabsTrigger>
   )
}

function FilterButton({ active, label, onClick, color = "primary" }: any) {
   return (
      <button 
        onClick={onClick} 
        className={cn(
          "px-3 md:px-6 py-2 rounded-lg text-[9px] md:text-[10px] font-bold tracking-tight transition-all active:scale-95 whitespace-nowrap border border-transparent uppercase",
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
