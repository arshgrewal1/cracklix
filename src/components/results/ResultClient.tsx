
'use client';

import React, { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useFirestore, useDoc } from "@/firebase"
import { 
  collection, 
  query, 
  where, 
  doc, 
  getDoc, 
  documentId, 
  getDocs, 
  limit, 
  serverTimestamp,
  increment,
  runTransaction,
  deleteDoc
} from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { 
  Trophy, 
  Target, 
  Zap, 
  Loader2, 
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Clock,
  BarChart3,
  List,
  Award,
  Timer,
  FileText,
  AlertCircle,
  ChevronRight,
  RotateCcw,
  Layers,
  XCircle,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Search,
  Download,
  X
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
 * @fileOverview Official Result Hub 2.3 [Rank Reintegrated].
 */
export default function ResultClient() {
  const db = useFirestore()
  const { user, profile, loading: userLoading } = useUser()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  
  const [mounted, setMounted] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [activeReviewFilter, setActiveReviewFilter] = useState<'ALL' | 'CORRECT' | 'WRONG' | 'SKIPPED'>('ALL')
  const [guestResult, setGuestResult] = useState<any>(null)
  const [activeMainTab, setActiveMainTab] = useState<string>("OVERVIEW")
  const [resolvedResultId, setResolvedResultId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => { setMounted(true) }, [])

  const mockId = useMemo(() => {
    const queryId = searchParams.get('id');
    if (queryId) return queryId;
    return null;
  }, [searchParams]);

  const attemptIdFromUrl = searchParams?.get('attemptId');

  useEffect(() => {
    if (userLoading || !db || !mockId) return;

    async function resolveId() {
       let targetId = attemptIdFromUrl;
       if (!targetId && user) {
          const trackerSnap = await getDoc(doc(db, "attempts", `${user.uid}_${mockId}`));
          if (trackerSnap.exists()) {
             targetId = trackerSnap.data().attemptId;
          }
       }

       if (user && targetId) setResolvedResultId(`${user.uid}_${mockId}_${targetId}`);
       else if (user) setResolvedResultId(`${user.uid}_${mockId}`);
    }
    resolveId();
  }, [user, userLoading, db, mockId, attemptIdFromUrl]);

  const resultRef = useMemo(() => (db && resolvedResultId ? doc(db, "results", resolvedResultId) : null), [db, resolvedResultId]);
  const { data: sessionData, loading: resultLoading } = useDoc<any>(resultRef);
  const { data: branding } = useDoc<BrandingSettings>(useMemo(() => (db ? doc(db, 'settings', 'branding') : null), [db]));

  useEffect(() => {
     if (!user && !userLoading && mockId) {
        const stored = localStorage.getItem(`cracklix_guest_result_${mockId}`);
        if (stored) { try { setGuestResult(JSON.parse(stored)); } catch (e) {} }
     }
  }, [user, userLoading, mockId]);

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
      } catch (e) { console.error(e); } finally { setLoadingQuestions(false) }
    }
    loadQuestions()
  }, [db, mockId]);

  const handleRetake = async () => {
    if (!db || isSyncing || !mockId || !user) return;
    if (!confirm("Are you sure you want to retake? Previous progress will be archived.")) return;
    
    setIsSyncing(true);
    try {
      await deleteDoc(doc(db, "attempts", `${user.uid}_${mockId}`));
      toast({ title: "Test reset" });
      router.push(`/mocks/instructions?id=${mockId}&retake=true`);
    } catch (e) {
      toast({ variant: "destructive", title: "Action failed" });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadPDF = () => {
     setActiveMainTab("REPORT");
     setTimeout(() => {
        window.print();
     }, 300);
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
     return m > 0 ? `${m} min ${s} sec` : `${s} sec`;
  };

  if (!mounted || (resultLoading && user)) return <div className="h-screen w-full flex items-center justify-center bg-white"><Zap className="h-10 w-10 text-primary animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-[#0F172A] selection:bg-primary/10 flex flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-12 space-y-8 md:space-y-16 pb-40">
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 px-1 print:hidden">
           <div className="flex items-center gap-6 md:gap-10 text-left w-full md:w-auto">
              <AuthorityLogo boardId={activeSession?.boardId || "GENERAL"} size="lg" className="h-20 w-20 md:h-32 md:w-32 rounded-3xl" />
              <div className="space-y-2 flex-1 min-w-0">
                 <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Performance Report</span>
                 </div>
                 <h1 className="text-2xl md:text-5xl font-black tracking-tighter text-[#0F172A] leading-tight truncate">
                   {activeSession.mockTitle}
                 </h1>
                 <div className="flex flex-wrap items-center gap-4 text-slate-500 font-bold text-[10px] md:sm uppercase tracking-tight">
                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {new Date(activeSession.timestamp).toLocaleDateString('en-GB')}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                    <span className="flex items-center gap-1.5 text-primary"><Trophy className="h-4 w-4" /> Score: {activeSession.score.toFixed(1)}</span>
                 </div>
              </div>
           </div>
           
           <div className="flex flex-col gap-4 w-full md:w-auto shrink-0">
              <div className="flex bg-white border border-slate-100 p-1.5 rounded-2xl shadow-sm w-full md:w-auto overflow-hidden">
                 <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
                    <TabsList className="bg-transparent border-none p-0 flex h-12 w-full gap-1">
                       <HubTab value="OVERVIEW" label="Summary" />
                       <HubTab value="REVIEW" label="Review" />
                       <HubTab value="REPORT" label="Report" />
                    </TabsList>
                 </Tabs>
              </div>
              <div className="flex gap-3">
                 <Button onClick={handleRetake} disabled={isSyncing} variant="outline" className="flex-1 h-12 rounded-xl font-bold border-slate-200 bg-white gap-2">
                    {isSyncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />} Retake
                 </Button>
                 <Button onClick={handleDownloadPDF} className="flex-1 h-12 rounded-xl font-bold bg-[#0F172A] text-white gap-2">
                    <Download className="h-3.5 w-3.5" /> Download PDF
                 </Button>
              </div>
           </div>
        </div>

        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full space-y-8 md:space-y-16">
           
           <TabsContent value="OVERVIEW" className="space-y-12 animate-in fade-in duration-500">
              <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                 <StatCard label="Final Score" val={activeSession.score.toFixed(1)} icon={<Zap className="text-primary" />} />
                 <StatCard label="Grade" val={activeSession.grade || 'F'} icon={<Award className="text-amber-500" />} highlight />
                 <StatCard label="Accuracy" val={`${activeSession.accuracy}%`} icon={<Target className="text-emerald-500" />} />
                 <StatCard label="Correct" val={activeSession.correctCount} icon={<CheckCircle2 className="text-emerald-600" />} />
                 <StatCard label="Mistakes" val={activeSession.wrongCount} icon={<XCircle className="text-rose-500" />} />
                 <StatCard label="Time Taken" val={formatTimeStr(activeSession.timeTaken)} icon={<Clock className="text-blue-500" />} />
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 <div className="lg:col-span-8 space-y-8">
                    <Card className="border border-slate-100 shadow-xl rounded-[2.5rem] bg-white p-8 md:p-12 text-left">
                       <h2 className="text-xl md:text-3xl font-black text-[#0F172A] tracking-tight mb-12">Subject Performance</h2>
                       <div className="space-y-12">
                          {Array.isArray(activeSession.subjectAnalysis) && activeSession.subjectAnalysis.map((sub: any, i: number) => (
                             <div key={i} className="space-y-3">
                                <div className="flex justify-between items-center text-[10px] md:text-sm font-bold text-slate-500 uppercase tracking-widest">
                                   <div className="flex items-center gap-3"><BookOpen className="h-4 w-4 text-primary" /> {sub.name}</div>
                                   <span className="text-[#0F172A] tabular-nums font-black">{sub.accuracy}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100">
                                   <motion.div 
                                      initial={{ width: 0 }} 
                                      animate={{ width: `${sub.accuracy}%` }} 
                                      transition={{ duration: 1.2, delay: i * 0.1 }} 
                                      className={cn("h-full", sub.accuracy > 70 ? "bg-emerald-500" : sub.accuracy > 40 ? "bg-blue-500" : "bg-rose-500")} 
                                   />
                                </div>
                                <div className="flex justify-between items-center text-[9px] font-bold text-slate-300">
                                   <span>Correct: {sub.correct} / {sub.total}</span>
                                   <span>Score: {sub.score.toFixed(1)}</span>
                                </div>
                             </div>
                          ))}
                       </div>
                    </Card>

                    <Card className="border border-slate-100 shadow-xl rounded-[2.5rem] bg-white p-8 md:p-12 text-left">
                       <h2 className="text-xl md:text-3xl font-black text-[#0F172A] mb-8 flex items-center gap-4">
                          <Zap className="h-6 w-6 text-primary fill-current" /> Mastery Insights
                       </h2>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(activeSession.insights || []).map((ins: string, i: number) => (
                             <div key={i} className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 flex items-start gap-4">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                                <p className="text-[13px] font-bold text-slate-600 leading-snug">{ins}</p>
                             </div>
                          ))}
                       </div>
                    </Card>
                 </div>

                 <div className="lg:col-span-4 space-y-8">
                    <Card className="border border-slate-100 shadow-xl rounded-[2.5rem] bg-white p-8 md:p-12 text-left space-y-8">
                       <div className="space-y-1">
                          <h3 className="text-xl font-bold flex items-center gap-3"><Layers className="h-5 w-5 text-primary" /> Complexity Audit</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Performance by difficulty</p>
                       </div>
                       <div className="space-y-8">
                          {Array.isArray(activeSession.complexityAnalysis) && activeSession.complexityAnalysis.map((diff: any, i: number) => (
                             <div key={i} className="space-y-2.5">
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                                   <span>{diff.name} items</span>
                                   <span className="text-[#0F172A] font-black">{diff.accuracy}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100">
                                   <motion.div 
                                      initial={{ width: 0 }} 
                                      animate={{ width: `${diff.accuracy}%` }} 
                                      transition={{ duration: 1 }} 
                                      className={cn("h-full", i === 0 ? "bg-emerald-500" : i === 1 ? "bg-blue-500" : "bg-rose-500")} 
                                   />
                                </div>
                                <p className="text-[9px] font-bold text-slate-300 px-1">Verified: {diff.correct} / {diff.total}</p>
                             </div>
                          ))}
                       </div>
                    </Card>

                    <Card className="border border-slate-100 shadow-xl rounded-[2.5rem] bg-[#0F172A] text-white p-8 md:p-10 space-y-8 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000"><Trophy className="h-48 w-48 text-primary" /></div>
                       <div className="relative z-10 space-y-6">
                          <div className="space-y-1">
                             <h3 className="text-xl md:text-2xl font-black tracking-tight leading-tight uppercase text-white">Merit Status</h3>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Ranking Node</p>
                          </div>
                          <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-2">
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Accuracy Percentile</p>
                             <p className="text-4xl font-black text-primary tabular-nums">{activeSession.accuracy}%</p>
                          </div>
                          <Button asChild className="w-full h-14 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl shadow-2xl border-none">
                             <Link href="/leaderboard">View Leaderboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
                          </Button>
                       </div>
                    </Card>
                 </div>
              </div>
           </TabsContent>

           <TabsContent value="REVIEW" className="space-y-12 animate-in fade-in duration-500">
              <div className="max-w-4xl mx-auto space-y-10">
                 <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 w-fit mx-auto overflow-x-auto no-scrollbar">
                    <FilterButton active={activeReviewFilter === 'ALL'} label="All Questions" onClick={() => setActiveReviewFilter('ALL')} />
                    <FilterButton active={activeReviewFilter === 'WRONG'} label={`Mistakes (${reviewNodes.wrong.length})`} onClick={() => setActiveReviewFilter('WRONG')} color="rose" />
                    <FilterButton active={activeReviewFilter === 'CORRECT'} label="Correct" onClick={() => setActiveReviewFilter('CORRECT')} color="emerald" />
                    <FilterButton active={activeReviewFilter === 'SKIPPED'} label="Skipped" onClick={() => setActiveReviewFilter('SKIPPED')} color="slate" />
                 </div>

                 <div className="space-y-8">
                    {filteredQuestions.map((q) => {
                       const rawAns = activeSession.answers?.[q.originalIndex] ?? activeSession.answers?.[String(q.originalIndex)];
                       const isAttempted = rawAns !== null && rawAns !== undefined && String(rawAns) !== "";
                       const userSelectedLabel = isAttempted ? ['A', 'B', 'C', 'D'][Number(rawAns)] : null;
                       const isCorrect = userSelectedLabel === q.correctAnswer;
                       
                       return (
                          <Card key={q.id} className="border border-slate-100 shadow-xl rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden bg-white text-left group">
                             <div className="p-8 md:p-14 space-y-8 md:space-y-12">
                                <div className="flex justify-between items-center">
                                   <Badge variant="outline" className="px-5 py-1.5 rounded-full border-slate-100 text-slate-400 font-bold text-[9px] uppercase tracking-widest">
                                      Question {q.originalIndex + 1}
                                   </Badge>
                                   <div className="flex items-center gap-3">
                                      {!isAttempted ? (
                                         <Badge className="bg-slate-100 text-slate-500 border-none px-4 py-1 font-bold text-[9px] uppercase">Skipped</Badge>
                                      ) : isCorrect ? (
                                         <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-1 font-bold text-[9px] uppercase">Correct</Badge>
                                      ) : (
                                         <Badge className="bg-rose-50 text-rose-600 border-none px-4 py-1 font-bold text-[9px] uppercase">Incorrect</Badge>
                                      )}
                                   </div>
                                </div>
                                
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
              <div className="flex flex-col items-center">
                 <div className="transform scale-[0.4] sm:scale-[0.6] md:scale-[0.8] lg:scale-100 origin-top bg-white p-4 md:p-20 rounded-[3rem] shadow-5xl">
                    <ResultCard 
                       studentName={activeSession.userName || profile?.name || "Aspirant"} 
                       examTitle={activeSession.mockTitle || "Mock Test"} 
                       score={activeSession.score.toFixed(1)} 
                       rank="---" 
                       accuracy={activeSession.accuracy} 
                       timeTaken={formatTimeStr(activeSession.timeTaken)} 
                       correct={activeSession.correctCount} 
                       wrong={activeSession.wrongCount} 
                       total={questions.length} 
                       date={new Date(activeSession.timestamp).toLocaleDateString('en-GB')} 
                       resultId={activeSession.attemptId || "REG"} 
                       percentile={activeSession.accuracy} 
                       branding={branding}
                       subjects={activeSession.subjectAnalysis}
                       grade={activeSession.grade}
                    />
                 </div>
                 <div className="mt-12 text-center space-y-4 print:hidden">
                    <p className="text-slate-400 font-bold text-sm tracking-tight">Print or share your verified report card (PDF).</p>
                    <Button onClick={() => window.print()} className="h-16 px-12 bg-[#0F172A] hover:bg-black text-white font-bold rounded-2xl shadow-xl border-none">Print / Download PDF</Button>
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
       "border border-slate-100 shadow-md bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] text-left relative overflow-hidden h-full flex flex-col justify-center transition-all hover:translate-y-[-4px]",
       highlight && "ring-2 ring-primary/5 bg-primary/[0.02]"
    )}>
       <div className="absolute top-0 right-0 p-4 opacity-5">{icon}</div>
       <div className="space-y-1 relative z-10">
          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
          <p className={cn("text-xl md:text-3xl font-black text-[#0F172A] tabular-nums tracking-tighter leading-none", highlight && "text-primary")}>{val}</p>
       </div>
    </Card>
  )
}

function HubTab({ value, label }: { value: string, label: string }) {
   return (
      <TabsTrigger value={value} className="flex-1 rounded-xl px-4 md:px-10 font-bold text-[10px] md:text-[12px] tracking-tight data-[state=active]:bg-[#0F172A] data-[state=active]:text-white data-[state=active]:shadow-xl transition-all h-full">
         {label}
      </TabsTrigger>
   )
}

function FilterButton({ active, label, onClick, color = "primary" }: any) {
   return (
      <button 
        onClick={onClick} 
        className={cn(
          "px-5 md:px-8 py-2.5 rounded-xl text-[10px] md:text-[11px] font-bold tracking-tight transition-all active:scale-95 whitespace-nowrap border border-transparent",
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
