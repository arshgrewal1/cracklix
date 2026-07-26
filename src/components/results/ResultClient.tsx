"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useFirestore } from "@/firebase"
import { 
  collection, 
  query, 
  doc, 
  getDoc, 
  documentId, 
  getDocs, 
  where,
  limit
} from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { 
  Zap, 
  Loader2, 
  Share2,
  ChevronRight,
  RefreshCw,
  BarChart3,
  Timer as TimerIcon,
  ShieldCheck,
  Target,
  FileText,
  Calendar
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AuthorityLogo } from "@/lib/exam-icons"
import ReportScreen from "./ReportScreen"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import { Card } from "@/components/ui/card"
import Link from "next/link"

/**
 * @fileOverview Universal Result Hub Engine v95.0 [Strict Sync].
 * FIXED: Implemented polling logic for report generation.
 */

export default function ResultClient() {
  const db = useFirestore()
  const { user, profile, loading: userLoading } = useUser()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [questions, setQuestions] = useState<any[]>([])
  const [mockData, setMockData] = useState<any>(null)
  const [activeReviewFilter, setActiveReviewFilter] = useState<'ALL' | 'WRONG' | 'CORRECT' | 'SKIPPED'>('ALL')
  const [activeMainTab, setActiveMainTab] = useState<string>("OVERVIEW")
  
  const [sessionData, setSessionData] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(true);
  
  const [liveRank, setLiveRank] = useState<number | string>("---")
  const [totalCandidates, setTotalCandidates] = useState<number>(0)
  const [topScore, setTopScore] = useState<number>(0)
  const [avgScore, setAvgScore] = useState<number>(0)
  const [avgAccuracy, setAvgAccuracy] = useState<number>(0)

  const mockId = searchParams.get('id')
  const attemptId = searchParams.get('attemptId')

  // DATA POLLING: Strict search for the NEW attempt node
  useEffect(() => {
    if (userLoading || !db || !mockId) return;
    
    let pollCount = 0;
    const maxPolls = 15;

    async function fetchLatestResult() {
       try {
          const targetId = attemptId ? `${user?.uid || 'guest'}_${mockId}_${attemptId}` : null;
          let snap = null;

          if (targetId) {
             snap = await getDoc(doc(db, "results", targetId));
          } else {
             // Fallback search for latest if no attemptId in URL
             const q = query(collection(db, "results"), where("userId", "==", user?.uid || 'guest'), where("mockId", "==", mockId), limit(1));
             const qSnap = await getDocs(q);
             if (!qSnap.empty) snap = qSnap.docs[0];
          }
          
          if (snap?.exists()) {
             setSessionData({ ...snap.data(), id: snap.id });
             setIsSearching(false);
             return true;
          }
          return false;
       } catch (e) { return false; }
    }

    const interval = setInterval(async () => {
       const found = await fetchLatestResult();
       pollCount++;
       if (found || pollCount >= maxPolls) {
          clearInterval(interval);
          setIsSearching(false);
       }
    }, 1000);

    fetchLatestResult();
    return () => clearInterval(interval);
  }, [user, userLoading, db, mockId, attemptId]);

  // Ranking & Questions Loading (Parallel)
  useEffect(() => {
     if (!db || !mockId || !sessionData) return;
     
     const loadMetrics = async () => {
        const lbRef = collection(db, "leaderboards", mockId, "entries");
        const lbSnap = await getDocs(query(lbRef, orderBy("highestScore", "desc")));
        const entries = lbSnap.docs.map(d => d.data());
        const myRank = entries.findIndex(e => e.userId === sessionData.userId) + 1;
        setLiveRank(myRank || "---");
        setTotalCandidates(lbSnap.size);
        setTopScore(entries[0]?.highestScore || 0);
        setAvgScore(entries.length ? entries.reduce((a,e) => a+(e.highestScore||0),0)/entries.length : 0);
     };

     const loadQuestions = async () => {
        const mSnap = await getDoc(doc(db, "mocks", mockId));
        if (mSnap.exists()) {
           const mData = mSnap.data();
           setMockData(mData);
           const chunks = [];
           const qIds = mData.questionIds || [];
           for (let i=0; i<qIds.length; i+=30) chunks.push(qIds.slice(i, i+30));
           const promises = chunks.map(async c => (await getDocs(query(collection(db, "mcqBank"), where(documentId(), "in", c)))).docs.map(d => d.data()));
           const all = (await Promise.all(promises)).flat();
           setQuestions(qIds.map(id => all.find((q:any) => q.id === id)).filter(Boolean));
        }
     };

     loadMetrics(); loadQuestions();
  }, [db, mockId, sessionData]);

  const reviewNodes = useMemo(() => {
    if (!sessionData || !questions.length) return { all: [], correct: [], wrong: [], skipped: [] };
    const all = questions.map((q, i) => ({ ...q, originalIndex: i }));
    const correct: any[] = [], wrong: any[] = [], skipped: any[] = [];
    all.forEach((q) => {
      const ans = sessionData.answers?.[q.originalIndex];
      if (ans === undefined || ans === null) skipped.push(q);
      else {
        const label = ['A', 'B', 'C', 'D'][Number(ans)];
        if (label === q.correctAnswer) correct.push(q); else wrong.push(q);
      }
    });
    return { all, correct, wrong, skipped };
  }, [questions, sessionData]);

  const filtered = activeReviewFilter === 'CORRECT' ? reviewNodes.correct : 
                 activeReviewFilter === 'WRONG' ? reviewNodes.wrong : 
                 activeReviewFilter === 'SKIPPED' ? reviewNodes.skipped : reviewNodes.all;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] font-body text-left">
      <Navbar />
      <main className="container mx-auto max-w-[1440px] px-4 md:px-12 py-8 md:py-16 space-y-10">
        
        {isSearching ? (
           <div className="py-40 flex flex-col items-center justify-center space-y-6">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <div className="text-center space-y-1">
                 <p className="font-black uppercase tracking-[0.4em] text-primary text-xs">Generating your report</p>
                 <p className="text-slate-400 font-bold text-[10px] uppercase">Registry nodes are synchronizing...</p>
              </div>
           </div>
        ) : sessionData ? (
           <>
              <Card className="border border-[#E5EAF2] shadow-sm rounded-[24px] bg-white p-6 md:p-12 flex flex-col lg:flex-row justify-between items-center gap-6">
                 <div className="flex items-center gap-6 md:gap-10 w-full min-w-0">
                    <AuthorityLogo boardId={mockData?.boardId || "GENERAL"} size="sm" className="h-12 w-12 md:h-24 md:w-24 shadow-xl border border-slate-100 rounded-2xl" />
                    <div className="text-left space-y-2 flex-1 min-w-0">
                       <div className="flex flex-wrap items-center gap-2">
                          <Badge className="bg-[#E6F9F3] text-[#10B981] border-none px-3 font-bold text-[9px] rounded-lg">Official result</Badge>
                          <Badge className="bg-[#EBF2FF] text-[#2563EB] border-none px-3 font-bold text-[9px] rounded-lg">ID: {sessionData.attemptId?.slice(0,8)}</Badge>
                       </div>
                       <h1 className="text-xl md:text-4xl font-bold text-[#0F172A] tracking-tight truncate">{sessionData.mockTitle}</h1>
                       <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                          <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(sessionData.timestamp).toLocaleDateString('en-GB')}</span>
                          <span className="flex items-center gap-1.5"><TimerIcon className="h-4 w-4" /> {Math.round(sessionData.timeTaken / 60)}m</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 w-full lg:w-auto">
                    <Button onClick={() => router.refresh()} className="flex-1 lg:flex-none h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full gap-2 text-xs">
                       <RefreshCw className="h-4 w-4" /> Sync Report
                    </Button>
                    <Button asChild variant="outline" className="flex-1 lg:flex-none h-12 px-8 border-slate-200 text-[#0F172A] font-bold rounded-full text-xs">
                       <Link href={`/mocks/instructions?id=${mockId}&retake=true`}>Retake Test</Link>
                    </Button>
                 </div>
              </Card>

              <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full space-y-10">
                  <div className="flex justify-center">
                     <TabsList className="bg-slate-100 p-1 rounded-full border border-slate-200 flex w-fit h-auto">
                        <TabsTrigger value="OVERVIEW" className="rounded-full px-8 md:px-12 font-bold text-[11px] h-11 data-[state=active]:bg-white data-[state=active]:text-primary shadow-sm">Analysis hub</TabsTrigger>
                        <TabsTrigger value="REVIEW" className="rounded-full px-8 md:px-12 font-bold text-[11px] h-11 data-[state=active]:bg-white data-[state=active]:text-primary shadow-sm">Review portal</TabsTrigger>
                     </TabsList>
                  </div>

                  <TabsContent value="OVERVIEW" className="m-0"><ReportScreen {...sessionData} rank={liveRank} totalCandidates={totalCandidates} topScore={topScore} avgScore={avgScore} percentile={Math.max(0, Math.round(((totalCandidates-Number(liveRank))/(totalCandidates||1))*100))} /></TabsContent>
                  <TabsContent value="REVIEW" className="m-0 space-y-10">
                      <div className="bg-white p-2 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                          <div className="grid grid-cols-4 gap-2">
                             <FilterNode active={activeReviewFilter === 'ALL'} label="All" count={reviewNodes.all.length} onClick={() => setActiveReviewFilter('ALL')} />
                             <FilterNode active={activeReviewFilter === 'CORRECT'} label="Correct" count={reviewNodes.correct.length} onClick={() => setActiveReviewFilter('CORRECT')} color="emerald" />
                             <FilterNode active={activeReviewFilter === 'WRONG'} label="Wrong" count={reviewNodes.wrong.length} onClick={() => setActiveReviewFilter('WRONG')} color="rose" />
                             <FilterNode active={activeReviewFilter === 'SKIPPED'} label="Skip" count={reviewNodes.skipped.length} onClick={() => setActiveReviewFilter('SKIPPED')} color="slate" />
                          </div>
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                          {filtered.map(q => (
                              <Card key={q.id} className="border border-slate-100 shadow-sm rounded-[2rem] bg-white p-6 md:p-12 space-y-8 text-left">
                                  <div className="flex items-center gap-3 border-b border-slate-50 pb-6"><div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center font-black">#{q.originalIndex+1}</div><Badge variant="outline" className="text-[9px] font-bold">Subject: {q.subjectId}</Badge></div>
                                  <QuestionRenderer question={q} language={sessionData.languageMode || 'ENGLISH_PUNJABI'} showSolution={true} selectedAnswer={sessionData.answers?.[q.originalIndex]} className="p-0 shadow-none border-none bg-transparent" />
                              </Card>
                          ))}
                      </div>
                  </TabsContent>
              </Tabs>
           </>
        ) : (
           <div className="py-40 text-center space-y-6">
              <AlertCircle className="h-16 w-16 mx-auto text-slate-200" />
              <h2 className="text-2xl font-black text-[#0F172A]">Result audit not found</h2>
              <Button asChild className="rounded-full px-10"><Link href="/mocks">Back to hub</Link></Button>
           </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

function FilterNode({ active, label, count, onClick, color }: any) {
  return (
    <button onClick={onClick} className={cn("flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 h-12 md:h-14 rounded-xl transition-all border", active ? "bg-[#0F172A] border-[#0F172A] text-white" : "bg-white border-transparent text-slate-400 hover:bg-slate-50")}>
       <span className="text-[9px] md:text-[11px] font-bold">{label}</span>
       <span className="text-[9px] md:text-xs font-bold opacity-40 tabular-nums">{count}</span>
    </button>
  )
}