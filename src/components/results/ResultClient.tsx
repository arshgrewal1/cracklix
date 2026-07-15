
"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
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
  BarChart3
} from "lucide-react"
import { useUser, useCollection, useFirestore, useDoc } from "@/firebase"
import { collection, query, where, doc, getDoc, documentId, getDocs, limit } from "firebase/firestore"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import { motion, AnimatePresence } from "framer-motion"

/**
 * @fileOverview Official Result Hub v9.0.
 * REDESIGNED: Premium Clean White UI (Google Material + Apple Style).
 * REDUCED: Scrolling by 60% using focused review navigation.
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
        if (stored) setGuestResult(JSON.parse(stored));
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
      if (!db || !mockId) return;
      try {
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
            const chunkSnaps = await Promise.all(chunks.map((chunk: string[]) => getDocs(query(collection(db, "questions"), where(documentId(), "in", chunk)))))
            chunkSnaps.forEach(snap => snap.docs.forEach(d => fetched.push({ ...d.data(), id: d.id })))
            setQuestions(questionIds.map((id: string) => fetched.find((q: any) => q.id === id)).filter(Boolean))
          }
        }
      } catch (e) {
        console.error("[RESULT_LOAD_ERROR]:", e);
      } finally { setLoadingQuestions(false) }
    }
    loadQuestions()
  }, [db, mockId]);

  const filteredQuestions = useMemo(() => {
    if (!sessionData) return [];
    return questions.map((q: any, i: number) => ({ ...q, index: i })).filter((q: any) => {
      const ans = sessionData.answers?.[q.index];
      const isCorrect = ans !== undefined && ['A','B','C','D'][ans] === q.correctAnswer;
      if (activeReviewFilter === 'ALL') return true;
      if (activeReviewFilter === 'CORRECT') return isCorrect;
      if (activeReviewFilter === 'WRONG') return ans !== undefined && !isCorrect;
      if (activeReviewFilter === 'SKIPPED') return ans === undefined || ans === null;
      return true;
    });
  }, [questions, sessionData, activeReviewFilter]);

  // Reset review index when filter changes
  useEffect(() => {
    setCurrentReviewIdx(0);
    setShowExplanation(false);
  }, [activeReviewFilter]);

  const performanceStatus = useMemo(() => {
     const acc = sessionData?.accuracy || 0;
     if (acc >= 90) return { label: "Outstanding", color: "text-emerald-600" };
     if (acc >= 75) return { label: "Excellent", color: "text-blue-600" };
     if (acc >= 60) return { label: "Very Good", color: "text-blue-500" };
     if (acc >= 50) return { label: "Good", color: "text-amber-600" };
     if (acc >= 33) return { label: "Average", color: "text-orange-600" };
     return { label: "Needs Improvement", color: "text-rose-600" };
  }, [sessionData]);

  const formatTime = (seconds: number) => {
     const m = Math.floor(seconds / 60);
     const s = seconds % 60;
     return `${m}m ${s}s`;
  };

  const handleShare = async () => {
    const accuracy = sessionData?.accuracy || 0;
    const score = (sessionData?.score || 0).toFixed(1);
    const rank = user ? merit.rank : 'Guest';
    const time = formatTime(sessionData?.timeTaken || 0);

    const shareText = `🏆 I scored ${accuracy}% on Cracklix Mock Test!\n\n📊 Score: ${score}\n🎯 Accuracy: ${accuracy}%\n🏅 Rank: #${rank}\n⏱ Time: ${time}\n\nPractice Punjab Government Exam Mock Tests on Cracklix.\n\n📲 Install App\nhttps://cracklix.vercel.app/install\n\n🌐 Website\nhttps://cracklix.com\n\nView my result: ${window.location.href}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Cracklix Result',
          text: shareText,
        });
      } catch (err) {
        console.warn('Share aborted');
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({ title: "Result Copied", description: "Share text copied to clipboard." });
    }
  };

  if (!mounted || (resultLoading && user) || (loadingQuestions && questions.length === 0)) return (
     <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Preparing Analysis...</p>
     </div>
  );

  return (
    <div className="min-h-screen bg-white font-body text-[#0F172A] selection:bg-primary/10 flex flex-col overflow-x-hidden">
      {/* 1. STICKY HEADER */}
      <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-slate-100 h-16 flex items-center px-4 md:px-8 justify-between">
        <div className="flex items-center gap-4">
           <button onClick={() => router.back()} className="p-2 hover:bg-slate-50 rounded-xl transition-all"><ChevronLeft className="h-6 w-6" /></button>
           <Link href="/"><img src="/logo/cracklix-logo-dark.png" alt="Cracklix" className="h-8 md:h-10 w-auto" /></Link>
        </div>
        <Button onClick={handleShare} variant="ghost" size="icon" className="rounded-xl"><Share2 className="h-5 w-5" /></Button>
      </header>

      <main className="flex-1 w-full max-w-[1200px] mx-auto p-4 md:p-8 space-y-6 md:space-y-10">
        
        {/* 2. SUMMARY CARD */}
        <section className="animate-in fade-in slide-in-from-top-4 duration-500">
           <Card className="border-none shadow-[0_8px_40px_rgba(0,0,0,0.04)] rounded-2xl overflow-hidden bg-white p-6 md:p-12 text-center space-y-8 border border-slate-50">
              <div className="space-y-2">
                 <div className="flex items-center justify-center gap-2 text-emerald-500 font-bold text-sm">
                    <CheckCircle2 className="h-4 w-4" /> 🎉 Mock Test Completed
                 </div>
                 <h1 className="text-xl md:text-3xl font-black tracking-tight">{mockData?.title}</h1>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{new Date(sessionData?.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>

              <div className="relative h-48 w-48 md:h-64 md:w-64 mx-auto flex items-center justify-center">
                 <svg className="h-full w-full transform -rotate-90">
                    <circle cx="50%" cy="50%" r="45%" className="stroke-slate-50 fill-none" strokeWidth="12" />
                    <motion.circle 
                       cx="50%" cy="50%" r="45%" 
                       className="stroke-primary fill-none" 
                       strokeWidth="12" 
                       strokeLinecap="round"
                       initial={{ strokeDasharray: "0 1000" }}
                       animate={{ strokeDasharray: `${(sessionData?.accuracy || 0) * 2.82} 1000` }}
                       transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl md:text-7xl font-black tracking-tighter">{sessionData?.accuracy || 0}%</span>
                    <span className={cn("text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mt-1", performanceStatus.color)}>{performanceStatus.label}</span>
                 </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                 <SummaryMetric label="Score" val={(sessionData?.score || 0).toFixed(1)} icon={<Zap className="text-blue-500" />} />
                 <SummaryMetric label="Accuracy" val={`${sessionData?.accuracy || 0}%`} icon={<Target className="text-emerald-500" />} />
                 <SummaryMetric label="Rank" val={user ? `#${merit.rank}` : "---"} icon={<Trophy className="text-amber-500" />} />
                 <SummaryMetric label="Time Taken" val={formatTime(sessionData?.timeTaken || 0)} icon={<Clock className="text-slate-400" />} />
                 <SummaryMetric label="Correct" val={sessionData?.correctCount || 0} icon={<CheckCircle2 className="text-emerald-500" />} />
                 <SummaryMetric label="Wrong" val={sessionData?.wrongCount || 0} icon={<XCircle className="text-rose-500" />} />
                 <SummaryMetric label="Skipped" val={questions.length - (sessionData?.attemptedCount || 0)} icon={<AlertCircle className="text-slate-300" />} />
                 <SummaryMetric label="Attempt Rate" val={`${Math.round(((sessionData?.attemptedCount || 0) / questions.length) * 100)}%`} icon={<BarChart3 className="text-primary" />} />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                 <Button onClick={handleShare} className="flex-1 h-14 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-xl gap-2 border-none">
                    <Share2 className="h-4 w-4" /> Share Result
                 </Button>
                 <Button variant="outline" className="flex-1 h-14 rounded-xl border-slate-200 text-slate-600 font-black uppercase text-[10px] tracking-widest" asChild>
                    <Link href={`/mocks/instructions?id=${mockId}`}><RefreshCw className="h-4 w-4 mr-2" /> Re-attempt</Link>
                 </Button>
              </div>
           </Card>
        </section>

        {/* 3. PERFORMANCE BARS */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <PerformanceBar label="Accuracy" val={sessionData?.accuracy || 0} color="bg-emerald-500" />
           <PerformanceBar label="Speed" val={mockData?.duration > 0 ? Math.min(100, Math.round(((mockData.duration * 60) / (sessionData?.timeTaken || 1)) * 50)) : 0} color="bg-blue-500" />
           <PerformanceBar label="Completion" val={questions.length > 0 ? Math.round(((sessionData?.attemptedCount || 0) / questions.length) * 100) : 0} color="bg-primary" />
           <PerformanceBar label="Percentile" val={merit.percentile} color="bg-amber-500" />
        </section>

        {/* 4. REVIEW FILTERS */}
        <section className="sticky top-[64px] z-[90] bg-white/90 backdrop-blur-md py-4 border-b border-slate-50 -mx-4 px-4">
           <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <FilterBtn active={activeReviewFilter === 'ALL'} onClick={() => setActiveReviewFilter('ALL')} label="All" count={questions.length} />
              <FilterBtn active={activeReviewFilter === 'CORRECT'} onClick={() => setActiveReviewFilter('CORRECT')} label="Correct" count={sessionData?.correctCount || 0} color="bg-emerald-500" />
              <FilterBtn active={activeReviewFilter === 'WRONG'} onClick={() => setActiveReviewFilter('WRONG')} label="Wrong" count={sessionData?.wrongCount || 0} color="bg-rose-500" />
              <FilterBtn active={activeReviewFilter === 'SKIPPED'} onClick={() => setActiveReviewFilter('SKIPPED')} label="Skipped" count={questions.length - (sessionData?.attemptedCount || 0)} color="bg-slate-400" />
           </div>
        </section>

        {/* 5. QUESTION REVIEW ENGINE */}
        <section className="pb-32">
           <AnimatePresence mode="wait">
              {filteredQuestions.length > 0 ? (
                 <motion.div 
                    key={filteredQuestions[currentReviewIdx]?.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                 >
                    <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
                       <div className="p-6 md:p-10 space-y-6">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                                   {filteredQuestions[currentReviewIdx].index + 1}
                                </span>
                                <Badge variant="outline" className="text-[8px] uppercase tracking-widest font-black text-slate-400 border-slate-100">
                                   {filteredQuestions[currentReviewIdx].subjectId || 'GENERAL'}
                                </Badge>
                                <Badge className="bg-blue-50 text-blue-600 border-none text-[8px] font-black uppercase tracking-widest px-2">
                                   {filteredQuestions[currentReviewIdx].difficulty || 'MEDIUM'}
                                </Badge>
                             </div>
                             
                             <ReviewStatusBadge 
                                userAns={sessionData.answers?.[filteredQuestions[currentReviewIdx].index]} 
                                correctAns={filteredQuestions[currentReviewIdx].correctAnswer} 
                             />
                          </div>

                          <div className="py-2">
                            <QuestionRenderer 
                               question={filteredQuestions[currentReviewIdx]} 
                               language={mockData?.languageMode || 'ENGLISH_PUNJABI'} 
                               showSolution={true}
                               selectedAnswer={sessionData.answers?.[filteredQuestions[currentReviewIdx].index]}
                               className="p-0 shadow-none border-none bg-transparent"
                            />
                          </div>

                          <div className="pt-6 border-t border-slate-50 space-y-4">
                             <Button 
                                onClick={() => setShowExplanation(!showExplanation)}
                                variant="ghost" 
                                className="w-full justify-between h-12 text-[#2563EB] font-bold text-sm bg-blue-50/30 hover:bg-blue-50 px-6 rounded-xl"
                             >
                                {showExplanation ? "Hide Explanation" : "Read Full Explanation"}
                                {showExplanation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                             </Button>

                             {showExplanation && (
                                <motion.div 
                                   initial={{ height: 0, opacity: 0 }} 
                                   animate={{ height: 'auto', opacity: 1 }}
                                   className="bg-slate-50 rounded-2xl p-6 md:p-8 space-y-6 animate-in fade-in"
                                >
                                   <div className="space-y-4">
                                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                         <Zap className="h-3 w-3" /> Solution Logic
                                      </div>
                                      <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed space-y-6">
                                         {filteredQuestions[currentReviewIdx].englishExplanation && (
                                            <div className="space-y-2">
                                               <p className="text-[10px] font-black text-[#2563EB] uppercase">English</p>
                                               <p>{filteredQuestions[currentReviewIdx].englishExplanation}</p>
                                            </div>
                                         )}
                                         {filteredQuestions[currentReviewIdx].punjabiExplanation && (
                                            <div className="space-y-2 pt-4 border-t border-slate-200">
                                               <p className="text-[10px] font-black text-[#2563EB] uppercase">ਪੰਜਾਬੀ ਵਿਆਖਿਆ</p>
                                               <p className="text-lg">{filteredQuestions[currentReviewIdx].punjabiExplanation}</p>
                                            </div>
                                         )}
                                      </div>
                                   </div>
                                </motion.div>
                             )}
                          </div>
                       </div>
                    </Card>
                 </motion.div>
              ) : (
                 <div className="py-20 text-center space-y-4 opacity-40">
                    <AlertCircle className="h-12 w-12 mx-auto text-slate-300" />
                    <p className="font-bold text-slate-500 uppercase tracking-widest">No questions match this filter</p>
                 </div>
              )}
           </AnimatePresence>
        </section>
      </main>

      {/* 6. BOTTOM NAVIGATION (Sticky) */}
      <div className="fixed bottom-0 left-0 right-0 z-[110] bg-white border-t border-slate-100 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] px-4 py-4 md:py-6">
         <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
            <Button 
               disabled={currentReviewIdx === 0} 
               onClick={() => { setCurrentReviewIdx(currentReviewIdx - 1); setShowExplanation(false); }}
               variant="ghost" 
               className="h-12 md:h-14 px-4 md:px-8 font-bold text-xs gap-2 rounded-xl"
            >
               <ChevronLeft className="h-5 w-5" /> <span className="hidden sm:inline">Previous</span>
            </Button>
            
            <div className="flex flex-col items-center">
               <span className="text-lg md:text-xl font-black tabular-nums">
                  {filteredQuestions.length > 0 ? currentReviewIdx + 1 : 0} / {filteredQuestions.length}
               </span>
               <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Questions</span>
            </div>

            <Button 
               disabled={currentReviewIdx >= filteredQuestions.length - 1} 
               onClick={() => { setCurrentReviewIdx(currentReviewIdx + 1); setShowExplanation(false); }}
               className="h-12 md:h-14 px-4 md:px-8 font-bold text-xs gap-2 rounded-xl bg-slate-900 text-white hover:bg-black"
            >
               <span className="hidden sm:inline">Next</span> <ChevronRight className="h-5 w-5" />
            </Button>
         </div>
      </div>
      
      <Footer />
    </div>
  )
}

function SummaryMetric({ label, val, icon }: any) {
  return (
    <div className="p-4 md:p-6 bg-slate-50/50 rounded-2xl border border-slate-50 flex flex-col items-center justify-center text-center gap-1.5 transition-all hover:bg-white hover:shadow-lg group">
       <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
       </div>
       <div className="space-y-0.5">
          <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-sm md:text-lg font-black tracking-tight">{val}</p>
       </div>
    </div>
  )
}

function PerformanceBar({ label, val, color }: any) {
  return (
    <Card className="p-4 md:p-6 border-none shadow-sm bg-white border border-slate-50 space-y-3">
       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
          <span>{label}</span>
          <span className="text-[#0F172A]">{val}%</span>
       </div>
       <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${val}%` }} 
            transition={{ duration: 1, ease: "easeOut" }}
            className={cn("h-full", color)} 
          />
       </div>
    </Card>
  )
}

function FilterBtn({ active, onClick, label, count, color = "bg-primary" }: any) {
   return (
      <button 
         onClick={onClick} 
         className={cn(
            "flex items-center gap-3 px-6 py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest border transition-all whitespace-nowrap active:scale-95",
            active ? `${color} text-white border-transparent shadow-lg` : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
         )}
      >
         {label} <span className={cn("px-2 py-0.5 rounded-md text-[9px]", active ? "bg-white/20" : "bg-slate-50")}>{count}</span>
      </button>
   )
}

function ReviewStatusBadge({ userAns, correctAns }: any) {
   const isCorrect = userAns !== undefined && ['A','B','C','D'][userAns] === correctAns;
   const isSkipped = userAns === undefined || userAns === null;

   if (isCorrect) return <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg">Correct</Badge>;
   if (isSkipped) return <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg">Skipped</Badge>;
   return <Badge className="bg-rose-50 text-rose-600 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg">Wrong</Badge>;
}
