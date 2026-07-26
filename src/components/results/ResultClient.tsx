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
 * @fileOverview Hardened Result Engine v5.0 [Strict source-of-truth].
 * FIXED: Metrics are strictly derived from the unique Attempt/Result document.
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

  // SOURCE OF TRUTH Registry Node
  const resultRef = useMemo(() => {
     if (!db || !mockId) return null;
     // Priority 1: Specific attemptId from URL (Immutable source)
     if (attemptId && user) return doc(db, "results", `${user.uid}_${mockId}_${attemptId}`);
     // Priority 2: Latest attempt for this user/mock (Backward compatibility/fallback)
     if (user) return doc(db, "results", `${user.uid}_${mockId}`);
     return null;
  }, [db, user, mockId, attemptId]);

  const { data: cloudSession, loading: resultLoading } = useDoc<any>(resultRef);
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

  const sessionData = useMemo(() => user ? cloudSession : guestResult, [user, cloudSession, guestResult]);

  const merit = useMemo(() => {
     if (!sessionData) return { rank: '?', total: 0, percentile: 0 };
     return { rank: 'Verified', total: 1, percentile: sessionData.accuracy || 0 };
  }, [sessionData]);

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
      } catch (e) { console.error(e); } finally { setLoadingQuestions(false) }
    }
    loadQuestions()
  }, [db, mockId]);

  const categorizedNodes = useMemo(() => {
    if (!sessionData || !questions.length) return { all: [], correct: [], wrong: [], skipped: [] };
    const all = questions.map((q, i) => ({ ...q, originalIndex: i }));
    const correct: any[] = [], wrong: any[] = [], skipped: any[] = [];

    all.forEach((q) => {
      const ans = sessionData.answers?.[q.originalIndex] ?? sessionData.answers?.[String(q.originalIndex)];
      const isAttempted = ans !== null && ans !== undefined && String(ans) !== "";
      if (!isAttempted) skipped.push(q);
      else {
        const userSelectedLabel = ['A', 'B', 'C', 'D'][Number(ans)];
        if (userSelectedLabel === q.correctAnswer) correct.push(q); else wrong.push(q);
      }
    });
    return { all, correct, wrong, skipped };
  }, [questions, sessionData]);

  const analysis = useMemo(() => {
     if (!sessionData || !questions.length) return { subjects: [], difficulty: { easy: 0, medium: 0, hard: 0 } };
     const subMap: Record<string, any> = {};
     const diffCount = { easy: 0, medium: 0, hard: 0 }, diffCorrect = { easy: 0, medium: 0, hard: 0 };

     categorizedNodes.all.forEach((q) => {
        const sId = q.subjectId || 'General';
        const ans = sessionData.answers?.[q.originalIndex] ?? sessionData.answers?.[String(q.originalIndex)];
        const isAttempted = ans !== null && ans !== undefined && String(ans) !== "";
        const isCorrect = isAttempted && ['A','B','C','D'][Number(ans)] === q.correctAnswer;

        if (!subMap[sId]) subMap[sId] = { name: sId, total: 0, correct: 0, score: 0 };
        subMap[sId].total++;
        if (isCorrect) { 
           subMap[sId].correct++; 
           subMap[sId].score += Number(mockData?.positiveMarks || 1); 
        } else if (isAttempted) {
           subMap[sId].score -= Number(mockData?.negativeMarks || 0.25);
        }

        const dKey = (q.difficulty || 'Medium').toLowerCase() as keyof typeof diffCount;
        if (diffCount[dKey] !== undefined) diffCount[dKey]++;
        if (isCorrect && diffCorrect[dKey] !== undefined) diffCorrect[dKey]++;
     });

     return { 
        subjects: Object.values(subMap).map((s: any) => ({ ...s, accuracy: Math.round((s.correct / s.total) * 100), score: parseFloat(s.score.toFixed(1)) })),
        difficulty: { 
           easy: Math.round((diffCorrect.easy / (diffCount.easy || 1)) * 100),
           medium: Math.round((diffCorrect.medium / (diffCount.medium || 1)) * 100),
           hard: Math.round((diffCorrect.hard / (diffCount.hard || 1)) * 100)
        }
     };
  }, [categorizedNodes, sessionData, mockData]);

  if (!mounted || (resultLoading && user)) return <div className="h-screen w-full flex items-center justify-center bg-white"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>;

  if (!sessionData) return (
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
        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full space-y-6 md:space-y-12">
           <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <div className="bg-white border border-slate-100 p-1 rounded-xl flex items-center h-12 md:h-14 shadow-sm w-full lg:w-auto">
                 <TabsList className="bg-transparent border-none p-0 flex h-full w-full gap-0.5">
                    <TabsTrigger value="OVERVIEW" className="flex-1 rounded-lg px-6 font-bold text-[9px] md:text-xs tracking-tight gap-2 data-[state=active]:bg-[#0F172A] data-[state=active]:text-white h-full">Performance</TabsTrigger>
                    <TabsTrigger value="REVIEW" className="flex-1 rounded-lg px-6 font-bold text-[9px] md:text-xs tracking-tight gap-2 data-[state=active]:bg-[#0F172A] data-[state=active]:text-white h-full">Review Test</TabsTrigger>
                    <TabsTrigger value="REPORT" className="flex-1 rounded-lg px-6 font-bold text-[9px] md:text-xs tracking-tight gap-2 data-[state=active]:bg-[#0F172A] data-[state=active]:text-white h-full">Report Card</TabsTrigger>
                 </TabsList>
              </div>
              <div className="flex items-center gap-2 w-full lg:w-auto">
                 <Button onClick={() => setActiveMainTab("REPORT")} className="flex-1 lg:flex-none h-12 md:h-14 px-8 bg-[#2563EB] text-white font-bold rounded-xl shadow-lg border-none">Download PDF</Button>
                 <Button onClick={() => router.push(`/mocks/instructions?id=${mockId}&retake=true`)} variant="outline" className="flex-1 lg:flex-none h-12 md:h-14 px-8 border-2 border-slate-200 rounded-xl font-bold text-[#0F172A]">Retake</Button>
              </div>
           </div>

           <TabsContent value="OVERVIEW" className="space-y-8 md:space-y-12 animate-in fade-in duration-500">
              <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6">
                 <StatCard label="Final score" val={sessionData.score.toFixed(1)} icon={<Zap className="text-primary" />} />
                 <StatCard label="Accuracy" val={`${sessionData.accuracy}%`} icon={<Target className="text-emerald-500" />} />
                 <StatCard label="Correct" val={sessionData.correctCount} icon={<CheckCircle2 className="text-emerald-600" />} />
                 <StatCard label="Incorrect" val={sessionData.wrongCount} icon={<AlertCircle className="text-rose-500" />} />
                 <StatCard label="Time taken" val={`${Math.round(sessionData.timeTaken / 60)}m`} icon={<Timer className="text-blue-500" />} />
                 <StatCard label="Attempt ID" val={sessionData.attemptId?.slice(0,6) || "REG"} icon={<ShieldCheck className="text-slate-400" />} />
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                 <div className="lg:col-span-8 space-y-8">
                    <Card className="border-none shadow-sm rounded-[24px] bg-white p-6 md:p-10 border border-slate-100">
                       <h2 className="text-xl font-bold mb-8">Subject Analysis</h2>
                       <div className="space-y-8">
                          {analysis.subjects.map((sub, i) => (
                             <div key={i} className="space-y-3">
                                <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
                                   <span>{sub.name}</span>
                                   <span>{sub.accuracy}% Accuracy</span>
                                </div>
                                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                                   <motion.div initial={{ width: 0 }} animate={{ width: `${sub.accuracy}%` }} transition={{ duration: 1 }} className={cn("h-full", sub.accuracy > 70 ? "bg-emerald-500" : "bg-amber-500")} />
                                </div>
                             </div>
                          ))}
                       </div>
                    </Card>
                 </div>
                 <div className="lg:col-span-4 space-y-8">
                    <Card className="border-none shadow-sm rounded-[24px] bg-white p-8 border border-slate-100 text-left space-y-6">
                       <h3 className="font-bold text-lg">Complexity Audit</h3>
                       <div className="space-y-4">
                          <ComplexityNode label="Easy items" val={analysis.difficulty.easy} color="bg-emerald-500" />
                          <ComplexityNode label="Medium items" val={analysis.difficulty.medium} color="bg-blue-500" />
                          <ComplexityNode label="Hard items" val={analysis.difficulty.hard} color="bg-rose-500" />
                       </div>
                    </Card>
                 </div>
              </div>
           </TabsContent>

           <TabsContent value="REVIEW" className="space-y-6 animate-in fade-in duration-500">
              <div className="flex items-center gap-3 bg-white p-1 rounded-xl shadow-sm border border-slate-100 w-fit mx-auto mb-8">
                 <button onClick={() => setActiveReviewFilter('ALL')} className={cn("px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", activeReviewFilter === 'ALL' ? "bg-[#0F172A] text-white shadow-md" : "text-slate-400 hover:text-slate-600")}>All</button>
                 <button onClick={() => setActiveReviewFilter('WRONG')} className={cn("px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", activeReviewFilter === 'WRONG' ? "bg-rose-600 text-white shadow-md" : "text-slate-400 hover:text-rose-500")}>Mistakes ({categorizedNodes.wrong.length})</button>
              </div>
              <div className="max-w-4xl mx-auto space-y-6">
                 {filteredQuestions.map((q, idx) => (
                    <Card key={q.id} className="border-none shadow-sm rounded-[32px] bg-white overflow-hidden border border-slate-100 text-left">
                       <div className="p-8 md:p-14 space-y-10">
                          <div className="flex justify-between items-center">
                             <Badge variant="outline" className="px-4 py-1.5 rounded-full border-slate-200 text-slate-400 font-black text-[10px] uppercase">Node {q.originalIndex + 1}</Badge>
                          </div>
                          <QuestionRenderer question={q} language={mockData?.languageMode || 'ENGLISH_PUNJABI'} showSolution={true} selectedAnswer={sessionData.answers?.[q.originalIndex]} className="p-0 shadow-none border-none bg-transparent" />
                       </div>
                    </Card>
                 ))}
              </div>
           </TabsContent>

           <TabsContent value="REPORT" className="animate-in zoom-in-95 duration-700">
              <div className="flex flex-col items-center">
                 <div className="transform scale-[0.35] sm:scale-[0.6] md:scale-[0.8] lg:scale-100 origin-top">
                    <ResultCard 
                       studentName={profile?.name || "Aspirant"} 
                       examTitle={mockData?.title || "Mock Test"} 
                       score={sessionData.score.toFixed(1)} 
                       rank={merit.rank} 
                       accuracy={sessionData.accuracy} 
                       timeTaken={formatTimeTaken(sessionData.timeTaken)} 
                       correct={categorizedNodes.correct.length} 
                       wrong={categorizedNodes.wrong.length} 
                       total={questions.length} 
                       date={new Date(sessionData.timestamp).toLocaleDateString('en-GB')} 
                       resultId={sessionData.attemptId || "REG"} 
                       percentile={merit.percentile} 
                       branding={branding}
                       subjects={analysis.subjects}
                       difficulty={analysis.difficulty}
                       isForPdf={true}
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

function StatCard({ label, val, icon }: any) {
  return (
    <Card className="border-none shadow-sm bg-white p-5 rounded-2xl border border-slate-100 text-left relative overflow-hidden h-full flex flex-col justify-center">
       <div className="absolute top-0 right-0 p-3 opacity-5">{icon}</div>
       <div className="space-y-0.5">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-xl md:text-3xl font-black text-[#0F172A] tabular-nums tracking-tighter">{val}</p>
       </div>
    </Card>
  )
}

function ComplexityNode({ label, val, color }: any) {
   return (
      <div className="space-y-1.5">
         <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">
            <span>{label}</span>
            <span>{val}%</span>
         </div>
         <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100">
            <div className={cn("h-full transition-all duration-1000", color)} style={{ width: `${val}%` }} />
         </div>
      </div>
   )
}

function TimeAuditNode({ label, val }: any) {
   return (
      <div className="flex items-center justify-between py-2 border-b border-slate-50">
         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
         <span className="text-xs font-black tabular-nums">{val}</span>
      </div>
   )
}

function formatTimeTaken(seconds: any) {
   const totalSecs = Number(seconds);
   if (isNaN(totalSecs) || totalSecs <= 0) return "0s";
   const m = Math.floor((seconds % 3600) / 60);
   const s = Math.round(totalSecs % 60);
   return m > 0 ? `${m}m ${s}s` : `${s}s`;
}