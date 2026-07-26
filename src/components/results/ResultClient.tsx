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
  Layers
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
 * @fileOverview Official Result Dashboard v6.0 [Attempt Isolated].
 * Rebuild: Consumes static analytical snapshot from the result document.
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
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [activeReviewFilter, setActiveReviewFilter] = useState<'ALL' | 'CORRECT' | 'WRONG' | 'SKIPPED'>('ALL')
  const [guestResult, setGuestResult] = useState<any>(null)
  const [activeMainTab, setActiveMainTab] = useState<string>("OVERVIEW")

  useEffect(() => { setMounted(true) }, [])

  const mockId = useMemo(() => {
    const queryId = searchParams.get('id');
    if (queryId) return queryId;
    const pathSegments = pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    return lastSegment !== 'view' ? lastSegment : null;
  }, [pathname, searchParams]);

  const attemptId = searchParams?.get('attemptId');
  const isGuestMode = !user || searchParams?.get('guest') === 'true';

  // SOURCE OF TRUTH: Attempt Registry Node
  const resultRef = useMemo(() => {
     if (!db || !mockId) return null;
     if (attemptId && user) return doc(db, "results", `${user.uid}_${mockId}_${attemptId}`);
     if (user) return doc(db, "results", `${user.uid}_${mockId}`);
     return null;
  }, [db, user, mockId, attemptId]);

  const { data: sessionData, loading: resultLoading } = useDoc<any>(resultRef);
  const { data: branding } = useDoc<BrandingSettings>(useMemo(() => (db ? doc(db, 'settings', 'branding') : null), [db]));

  useEffect(() => {
     if (isGuestMode && mockId) {
        const stored = localStorage.getItem(`cracklix_guest_result_${mockId}`);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (!attemptId || parsed.attemptId === attemptId) setGuestResult(parsed);
          } catch (e) {}
        }
     }
  }, [isGuestMode, mockId, attemptId]);

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

  const merit = useMemo(() => {
     if (!activeSession) return { rank: '?', total: 0, percentile: 0 };
     return { rank: 'Verified', total: 1, percentile: activeSession.accuracy || 0 };
  }, [activeSession]);

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

  if (!mounted || (resultLoading && user)) return <div className="h-screen w-full flex items-center justify-center bg-white"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>;

  if (!activeSession) return (
     <div className="h-screen flex flex-col items-center justify-center text-center p-6 space-y-6">
        <AlertCircle className="h-16 w-16 text-slate-200" />
        <h2 className="text-2xl font-black text-[#0F172A]">Result node missing</h2>
        <p className="text-slate-500 max-w-sm">This attempt record could not be synchronized. Retake the test if the issue persists.</p>
        <Button onClick={() => router.push('/mocks')} variant="outline">Browse Tests</Button>
     </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-[#0F172A] selection:bg-primary/10 flex flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-12 space-y-8 md:space-y-16 pb-40">
        
        {/* ACTION BAR HUB */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
           <div className="bg-white border border-slate-100 p-1 rounded-2xl flex items-center h-14 md:h-16 shadow-sm w-full lg:w-auto">
              <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
                 <TabsList className="bg-transparent border-none p-0 flex h-full w-full gap-1">
                    <HubTab value="OVERVIEW" label="Performance" />
                    <HubTab value="REVIEW" label="Review Test" />
                    <HubTab value="REPORT" label="Report Card" />
                 </TabsList>
              </Tabs>
           </div>
           <div className="flex items-center gap-3 w-full lg:w-auto">
              <Button onClick={() => router.push(`/mocks/instructions?id=${mockId}&retake=true`)} variant="outline" className="flex-1 lg:flex-none h-14 md:h-16 border-2 border-slate-200 rounded-2xl font-bold text-[#0F172A] gap-2 active:scale-95 transition-all">
                 <RotateCcw className="h-4 w-4" /> Retake Test
              </Button>
              <Button onClick={() => setActiveMainTab("REPORT")} className="flex-1 lg:flex-none h-14 md:h-16 px-10 bg-primary hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl border-none">Download PDF</Button>
           </div>
        </div>

        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full space-y-8 md:space-y-16">
           {/* OVERVIEW TAB */}
           <TabsContent value="OVERVIEW" className="space-y-12 animate-in fade-in duration-500">
              <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                 <StatCard label="Final score" val={activeSession.score.toFixed(1)} icon={<Zap className="text-primary" />} />
                 <StatCard label="Attempt grade" val={activeSession.grade || 'F'} icon={<Award className="text-amber-500" />} highlight />
                 <StatCard label="Accuracy" val={`${activeSession.accuracy}%`} icon={<Target className="text-emerald-500" />} />
                 <StatCard label="Time taken" val={`${Math.round(activeSession.timeTaken / 60)}m`} icon={<Timer className="text-blue-500" />} />
                 <StatCard label="Correct items" val={activeSession.correctCount} icon={<CheckCircle2 className="text-emerald-600" />} />
                 <StatCard label="Mistakes" val={activeSession.wrongCount} icon={<AlertCircle className="text-rose-500" />} />
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                 <div className="lg:col-span-8 space-y-12">
                    <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 md:p-12 border border-slate-100">
                       <h2 className="text-xl md:text-3xl font-black text-[#0F172A] mb-12 flex items-center gap-4">
                          <BarChart3 className="h-8 w-8 text-primary" /> Subject analysis
                       </h2>
                       <div className="space-y-10">
                          {activeSession.subjectAnalysis?.map((sub: any, i: number) => (
                             <div key={i} className="space-y-3">
                                <div className="flex justify-between items-center text-[10px] md:text-sm font-bold text-slate-500 uppercase tracking-widest">
                                   <span>{sub.name}</span>
                                   <span className="text-[#0F172A] tabular-nums">{sub.accuracy}% Accuracy</span>
                                </div>
                                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100">
                                   <motion.div initial={{ width: 0 }} animate={{ width: `${sub.accuracy}%` }} transition={{ duration: 1.2 }} className={cn("h-full", sub.accuracy > 70 ? "bg-emerald-500" : sub.accuracy > 40 ? "bg-amber-500" : "bg-rose-500")} />
                                </div>
                             </div>
                          ))}
                       </div>
                    </Card>
                 </div>
                 
                 <div className="lg:col-span-4 space-y-8">
                    <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 md:p-12 border border-slate-100 text-left space-y-8">
                       <div className="space-y-1">
                          <h3 className="text-xl font-bold flex items-center gap-3"><Layers className="h-6 w-6 text-primary" /> Complexity audit</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mastery by difficulty</p>
                       </div>
                       <div className="space-y-6">
                          <ComplexityNode label="Easy items" val={activeSession.complexityAnalysis?.easy || 0} color="bg-emerald-500" />
                          <ComplexityNode label="Medium items" val={activeSession.complexityAnalysis?.medium || 0} color="bg-blue-500" />
                          <ComplexityNode label="Hard items" val={activeSession.complexityAnalysis?.hard || 0} color="bg-rose-500" />
                       </div>
                    </Card>
                 </div>
              </div>
           </TabsContent>

           {/* REVIEW TAB */}
           <TabsContent value="REVIEW" className="space-y-10 animate-in fade-in duration-500">
              <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 w-fit mx-auto mb-12">
                 <FilterButton active={activeReviewFilter === 'ALL'} label="All" onClick={() => setActiveReviewFilter('ALL')} />
                 <FilterButton active={activeReviewFilter === 'WRONG'} label={`Mistakes (${reviewNodes.wrong.length})`} onClick={() => setActiveReviewFilter('WRONG')} color="rose" />
                 <FilterButton active={activeReviewFilter === 'CORRECT'} label="Correct" onClick={() => setActiveReviewFilter('CORRECT')} color="emerald" />
              </div>

              <div className="max-w-4xl mx-auto space-y-8">
                 {filteredQuestions.map((q) => (
                    <Card key={q.id} className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden border border-slate-100 text-left">
                       <div className="p-8 md:p-14 space-y-10">
                          <div className="flex justify-between items-center">
                             <Badge variant="outline" className="px-4 py-1.5 rounded-full border-slate-100 text-slate-300 font-black text-[9px] md:text-[10px] uppercase">Attempt item {q.originalIndex + 1}</Badge>
                          </div>
                          <QuestionRenderer 
                            question={q} 
                            language={mockData?.languageMode || 'ENGLISH_PUNJABI'} 
                            showSolution={true} 
                            selectedAnswer={activeSession.answers?.[q.originalIndex]} 
                            className="p-0 shadow-none border-none bg-transparent" 
                          />
                       </div>
                    </Card>
                 ))}
                 {filteredQuestions.length === 0 && (
                    <div className="py-32 text-center opacity-30 italic font-black uppercase text-xl">No items in this category</div>
                 )}
              </div>
           </TabsContent>

           {/* REPORT TAB */}
           <TabsContent value="REPORT" className="animate-in zoom-in-95 duration-700 pb-20">
              <div className="flex flex-col items-center">
                 <div className="transform scale-[0.38] sm:scale-[0.6] md:scale-[0.8] lg:scale-100 origin-top">
                    <ResultCard 
                       studentName={profile?.name || "Aspirant"} 
                       examTitle={activeSession.mockTitle || "Mock Test"} 
                       score={activeSession.score.toFixed(1)} 
                       rank={merit.rank} 
                       accuracy={activeSession.accuracy} 
                       timeTaken={formatTimeTaken(activeSession.timeTaken)} 
                       correct={activeSession.correctCount} 
                       wrong={activeSession.wrongCount} 
                       total={questions.length} 
                       date={new Date(activeSession.timestamp).toLocaleDateString('en-GB')} 
                       resultId={activeSession.attemptId || "REG"} 
                       percentile={merit.percentile} 
                       branding={branding}
                       subjects={activeSession.subjectAnalysis}
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
       "border-none shadow-xl bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 text-left relative overflow-hidden h-full flex flex-col justify-center transition-all hover:translate-y-[-4px]",
       highlight && "ring-2 ring-primary/10 bg-primary/5 shadow-primary/5"
    )}>
       <div className="absolute top-0 right-0 p-4 opacity-5">{icon}</div>
       <div className="space-y-1.5 relative z-10">
          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className={cn("text-xl md:text-4xl font-black text-[#0F172A] tabular-nums tracking-tighter leading-none", highlight && "text-primary")}>{val}</p>
       </div>
    </Card>
  )
}

function ComplexityNode({ label, val, color }: any) {
   return (
      <div className="space-y-2">
         <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">
            <span>{label}</span>
            <span className="text-[#0F172A]">{val}%</span>
         </div>
         <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100">
            <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 1 }} className={cn("h-full", color)} />
         </div>
      </div>
   )
}

function HubTab({ value, label }: { value: string, label: string }) {
   return (
      <TabsTrigger value={value} className="flex-1 rounded-xl px-4 md:px-10 font-black uppercase text-[8px] md:text-[11px] tracking-widest data-[state=active]:bg-[#0F172A] data-[state=active]:text-white data-[state=active]:shadow-xl transition-all h-full">
         {label}
      </TabsTrigger>
   )
}

function FilterButton({ active, label, onClick, color = "primary" }: any) {
   return (
      <button 
        onClick={onClick} 
        className={cn(
          "px-5 md:px-8 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
          active 
            ? color === 'rose' ? "bg-rose-600 text-white shadow-lg" : 
              color === 'emerald' ? "bg-emerald-600 text-white shadow-lg" :
              "bg-[#0F172A] text-white shadow-lg"
            : "text-slate-400 hover:text-slate-600"
        )}
      >
         {label}
      </button>
   )
}

function formatTimeTaken(seconds: any) {
   const totalSecs = Number(seconds);
   if (isNaN(totalSecs) || totalSecs <= 0) return "0s";
   const m = Math.floor(totalSecs / 60);
   const s = Math.round(totalSecs % 60);
   return m > 0 ? `${m}m ${s}s` : `${s}s`;
}