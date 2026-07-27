"use client"

import React, { useState, useMemo, useEffect, useRef } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useFirestore } from "@/firebase"
import { 
  collection, 
  query, 
  doc, 
  onSnapshot,
  getDocs, 
  where,
  limit,
  orderBy,
  getDoc,
  documentId
} from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { 
  Zap, 
  Loader2, 
  ChevronRight,
  RefreshCw,
  BarChart3,
  Timer as TimerIcon,
  ShieldCheck,
  Target,
  FileText,
  Calendar,
  AlertCircle,
  RotateCcw,
  X,
  Share2,
  Download
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
import ShareableResultCard from "./ShareableResultCard"
import { toPng } from "html-to-image"

/**
 * @fileOverview Universal Result Hub Engine v112.0 [Live Analysis Overhaul].
 * FIXED: Removed manual refresh button.
 * FIXED: Implemented real-time onSnapshot for rankings and percentile.
 */

export default function ResultClient() {
  const db = useFirestore()
  const { user, profile, loading: userLoading } = useUser()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  
  const [questions, setQuestions] = useState<any[]>([])
  const [mockData, setMockData] = useState<any>(null)
  const [activeReviewFilter, setActiveReviewFilter] = useState<'ALL' | 'WRONG' | 'CORRECT' | 'SKIPPED'>('ALL')
  const [activeMainTab, setActiveMainTab] = useState<string>("OVERVIEW")
  
  const [sessionData, setSessionData] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  
  const [liveRank, setLiveRank] = useState<number | string>("---")
  const [totalCandidates, setTotalCandidates] = useState<number>(0)
  const [topScore, setTopScore] = useState<number>(0)
  const [avgScore, setAvgScore] = useState<number>(0)

  const shareRef = useRef<HTMLDivElement>(null);

  const mockIdFromUrl = searchParams.get('id')
  const attemptIdFromUrl = searchParams.get('attemptId')

  const formatTimeTaken = (totalSeconds: number) => {
    if (!totalSeconds || totalSeconds <= 0) return "0s";
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  // 1. Session & Question Loader
  useEffect(() => {
    if (userLoading || !db) return;

    let unsubscribe: () => void = () => {};

    const initialize = async () => {
      if (attemptIdFromUrl) {
        const guestKey = `cracklix_guest_result_${attemptIdFromUrl}`;
        const local = localStorage.getItem(guestKey);
        if (local) {
          setSessionData({ ...JSON.parse(local), isGuestNode: true });
          setIsSearching(false);
          return;
        }

        unsubscribe = onSnapshot(doc(db, "results", attemptIdFromUrl), (snap) => {
          if (snap.exists()) {
            setSessionData({ ...snap.data(), id: snap.id });
            setIsSearching(false);
          }
        }, () => {
           setIsSearching(false);
        });
        
        const timer = setTimeout(() => setIsSearching(false), 5000);
        return () => { clearTimeout(timer); unsubscribe(); };
      }

      if (user && mockIdFromUrl) {
        const q = query(
          collection(db, "results"), 
          where("userId", "==", user.uid), 
          where("mockId", "==", mockIdFromUrl),
          limit(10)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const latest = snap.docs.map(d => ({ ...d.data(), id: d.id }))
            .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
          setSessionData(latest);
        }
        setIsSearching(false);
      } else if (!user && mockIdFromUrl) {
         const guestKey = `cracklix_guest_result_${mockIdFromUrl}`;
         const local = localStorage.getItem(guestKey);
         if (local) setSessionData({ ...JSON.parse(local), isGuestNode: true });
         setIsSearching(false);
      } else {
         setIsSearching(false);
      }
    };

    initialize();
    return () => unsubscribe();
  }, [db, user, userLoading, mockIdFromUrl, attemptIdFromUrl]);

  // 2. LIVE METRICS & QUESTIONS
  useEffect(() => {
     if (!db || !sessionData) return;
     const mId = mockIdFromUrl || sessionData.mockId;
     if (!mId) return;
     
     // LIVE METRICS: Leaderboard onSnapshot for real-time ranking/percentile
     let unsubscribeMetrics: () => void = () => {};
     
     if (!sessionData.isGuestNode) {
        const lbRef = collection(db, "leaderboards", mId, "entries");
        const q = query(lbRef, orderBy("highestScore", "desc"));
        
        unsubscribeMetrics = onSnapshot(q, (lbSnap) => {
           const entries = lbSnap.docs.map(d => ({ ...d.data(), userId: d.id }));
           const myRank = entries.findIndex(e => e.userId === sessionData.userId) + 1;
           
           setLiveRank(myRank || "---");
           setTotalCandidates(lbSnap.size);
           setTopScore(entries[0]?.highestScore || 0);
           
           const total = entries.reduce((acc, e: any) => acc + (Number(e.highestScore) || 0), 0);
           setAvgScore(entries.length ? total / entries.length : 0);
        });
     }

     const loadQuestions = async () => {
        try {
           const mRef = doc(db, "mocks", mId);
           const dRef = doc(db, "daily_quizzes", mId);
           const [mSnap, dSnap] = await Promise.all([getDoc(mRef), getDoc(dRef)]);
           const targetSnap = mSnap.exists() ? mSnap : dSnap;

           if (targetSnap?.exists()) {
              const mData = targetSnap.data();
              setMockData(mData);
              const qIds = mData.questionIds || [];
              if (qIds.length === 0) return;

              const fetched: any[] = [];
              const chunks = [];
              for (let i=0; i<qIds.length; i+=30) chunks.push(qIds.slice(i, i+30));
              
              for (const c of chunks) {
                const [qSnap, uSnap, lSnap] = await Promise.all([
                   getDocs(query(collection(db, "mcqBank"), where(documentId(), "in", c))),
                   getDocs(query(collection(db, "usedQuestions"), where(documentId(), "in", c))),
                   getDocs(query(collection(db, "questions"), where(documentId(), "in", c)))
                ]);
                qSnap.docs.forEach(d => fetched.push({...d.data(), id: d.id}));
                uSnap.forEach(d => { if(!fetched.find(f => f.id === d.id)) fetched.push({...d.data(), id: d.id})});
                lSnap.forEach(d => { if(!fetched.find(f => f.id === d.id)) fetched.push({...d.data(), id: d.id})});
              }
              const finalSorted = qIds.map(id => fetched.find((q:any) => q.id === id)).filter(Boolean);
              setQuestions(finalSorted);
           }
        } catch (e) {}
     };

     loadQuestions();
     return () => unsubscribeMetrics();
  }, [db, mockIdFromUrl, sessionData]);

  const reviewNodes = useMemo(() => {
    if (!sessionData || !questions.length) return { all: [], correct: [], wrong: [], skipped: [] };
    const all = questions.map((q, i) => ({ ...q, originalIndex: i }));
    const correct: any[] = [], wrong: any[] = [], skipped: any[] = [];
    
    all.forEach((q) => {
      const ans = sessionData.answers?.[q.originalIndex] ?? sessionData.answers?.[q.originalIndex.toString()];
      if (ans === undefined || ans === null) {
         skipped.push(q);
      } else {
        const label = ['A', 'B', 'C', 'D'][Number(ans)];
        if (label === q.correctAnswer) correct.push(q); else wrong.push(q);
      }
    });
    return { all, correct, wrong, skipped };
  }, [questions, sessionData]);

  const filtered = activeReviewFilter === 'CORRECT' ? reviewNodes.correct : 
                 activeReviewFilter === 'WRONG' ? reviewNodes.wrong : 
                 activeReviewFilter === 'SKIPPED' ? reviewNodes.skipped : reviewNodes.all;

  const handleShare = async () => {
    if (!shareRef.current || isSharing) return;
    setIsSharing(true);
    try {
      const dataUrl = await toPng(shareRef.current, { quality: 0.95, pixelRatio: 2, cacheBust: true });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `report-${sessionData.attemptId}.png`, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'My report', text: `Score: ${sessionData.score} on ${sessionData.mockTitle}!` });
      } else {
        const link = document.createElement('a');
        link.download = `report-${sessionData.attemptId}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Share failed" });
    } finally { setIsSharing(false); }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] font-body text-left">
      <Navbar />
      <main className="container mx-auto max-w-[1440px] px-3 md:px-12 py-4 md:py-12 space-y-6 md:space-y-12">
        
        {isSearching ? (
           <div className="py-40 flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                 <Loader2 className="h-14 w-14 text-primary animate-spin" />
                 <Zap className="absolute inset-0 m-auto h-5 w-5 text-primary animate-pulse" />
              </div>
              <div className="text-center space-y-1">
                 <p className="font-bold text-[#0F172A] text-sm">Generating report</p>
                 <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Loading results...</p>
              </div>
           </div>
        ) : sessionData ? (
           <>
              <Card className="border border-slate-100 shadow-sm rounded-[24px] bg-white p-4 md:p-8 flex flex-col lg:flex-row justify-between items-center gap-6">
                 <div className="flex items-center gap-3 md:gap-8 w-full min-w-0 text-left">
                    <AuthorityLogo boardId={mockData?.boardId || "GENERAL"} size="sm" className="h-10 w-10 md:h-16 md:w-16 shadow-lg border border-slate-100 rounded-xl shrink-0" />
                    <div className="text-left space-y-0.5 flex-1 min-w-0">
                       <div className="flex flex-wrap items-center gap-2">
                          <Badge className="bg-emerald-50 text-emerald-600 border-none px-2 py-0.5 rounded-lg font-bold text-[8px] md:text-[9px]">Verified result</Badge>
                          {sessionData.isGuestNode && <Badge className="bg-amber-50 text-amber-600 border-none px-2 py-0.5 rounded-lg font-bold text-[8px] md:text-[9px]">Guest</Badge>}
                       </div>
                       <h1 className="text-[13px] md:text-2xl font-[800] text-[#0F172A] tracking-tight leading-tight break-words">{sessionData.mockTitle}</h1>
                       <div className="flex items-center gap-3 text-[9px] md:text-xs font-semibold text-slate-400 tracking-tight">
                          <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {new Date(sessionData.timestamp).toLocaleDateString('en-GB')}</span>
                          <span className="flex items-center gap-1.5"><TimerIcon className="h-3 w-3" /> {formatTimeTaken(sessionData.timeTaken || 0)}</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 w-full lg:w-auto">
                    <Button onClick={handleShare} disabled={isSharing} className="flex-1 lg:flex-none h-10 md:h-11 px-6 md:px-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full gap-2 text-[10px] md:text-[11px] border-none shadow-lg">
                       {isSharing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Share2 className="h-3.5 w-3.5" />} Share
                    </Button>
                    <Button asChild variant="outline" className="flex-1 lg:flex-none h-10 md:h-11 px-6 md:px-10 border-2 border-slate-200 text-[#0F172A] font-bold rounded-full text-[10px] md:text-[11px] shadow-sm">
                       <Link href={`/mocks/instructions?id=${mockIdFromUrl || sessionData.mockId}&retake=true`}>Retake</Link>
                    </Button>
                 </div>
              </Card>

              <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full space-y-8">
                  <div className="flex justify-center">
                     <TabsList className="bg-slate-100 p-1 rounded-full border border-slate-200 flex w-fit h-auto shadow-inner">
                        <TabsTrigger value="OVERVIEW" className="rounded-full px-6 md:px-12 font-bold text-[10px] md:text-[11px] h-10 md:h-11 data-[state=active]:bg-white data-[state=active]:text-primary shadow-sm uppercase tracking-tight">Analysis hub</TabsTrigger>
                        <TabsTrigger value="REVIEW" className="rounded-full px-6 md:px-12 font-bold text-[10px] md:text-[11px] h-10 md:h-11 data-[state=active]:bg-white data-[state=active]:text-primary shadow-sm uppercase tracking-tight">Review portal</TabsTrigger>
                     </TabsList>
                  </div>

                  <TabsContent value="OVERVIEW" className="m-0">
                    <ReportScreen 
                      {...sessionData} 
                      rank={liveRank} 
                      totalCandidates={totalCandidates} 
                      topScore={topScore} 
                      avgScore={avgScore} 
                      percentile={totalCandidates > 0 ? Math.max(0, Math.round(((totalCandidates-Number(liveRank))/(totalCandidates||1))*100)) : 0} 
                    />
                  </TabsContent>
                  <TabsContent value="REVIEW" className="m-0 space-y-6 md:space-y-10">
                      <div className="bg-white p-1.5 md:p-8 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                          <div className="grid grid-cols-4 gap-1.5">
                             <FilterNode active={activeReviewFilter === 'ALL'} label="All" count={reviewNodes.all.length} onClick={() => setActiveReviewFilter('ALL')} />
                             <FilterNode active={activeReviewFilter === 'CORRECT'} label="Correct" count={reviewNodes.correct.length} onClick={() => setActiveReviewFilter('CORRECT')} color="emerald" />
                             <FilterNode active={activeReviewFilter === 'WRONG'} label="Wrong" count={reviewNodes.wrong.length} onClick={() => setActiveReviewFilter('WRONG')} color="rose" />
                             <FilterNode active={activeReviewFilter === 'SKIPPED'} label="Skip" count={reviewNodes.skipped.length} onClick={() => setActiveReviewFilter('SKIPPED')} color="slate" />
                          </div>
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                          {filtered.map(q => (
                              <Card key={q.id} className="border border-slate-100 shadow-sm rounded-[2rem] bg-white p-6 md:p-12 space-y-6 md:space-y-8 text-left group hover:border-primary/20 transition-all">
                                  <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                                     <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center font-black group-hover:bg-primary group-hover:text-white transition-all shadow-inner">#{q.originalIndex+1}</div>
                                     <Badge variant="outline" className="text-[9px] font-bold tracking-widest border-slate-200">Subject: {q.subjectId}</Badge>
                                  </div>
                                  <QuestionRenderer 
                                    question={q} 
                                    language={sessionData.languageMode || 'ENGLISH_PUNJABI'} 
                                    showSolution={true} 
                                    selectedAnswer={sessionData.answers?.[q.originalIndex] ?? sessionData.answers?.[q.originalIndex.toString()]} 
                                    className="p-0 shadow-none border-none bg-transparent" 
                                  />
                              </Card>
                          ))}
                      </div>
                  </TabsContent>
              </Tabs>
           </>
        ) : (
           <div className="py-40 text-center space-y-8">
              <AlertCircle className="h-16 w-16 mx-auto text-slate-200" />
              <div className="space-y-2 px-4">
                 <h2 className="text-xl md:text-2xl font-black text-[#0F172A]">Report not found</h2>
                 <p className="text-slate-500 font-medium max-w-sm mx-auto text-sm">No attempt records were found. Try refreshing or return to the bank.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-6">
                 <Button onClick={() => window.location.reload()} className="h-14 px-10 bg-primary hover:bg-blue-700 text-white font-bold rounded-2xl gap-3 shadow-xl border-none active:scale-95 transition-all">
                    <RefreshCw className="h-4 w-4" /> Refresh hub
                 </Button>
              </div>
           </div>
        )}

        <div className="fixed left-[-9999px] top-0 pointer-events-none">
           <div ref={shareRef}>
              <ShareableResultCard 
                data={sessionData} 
                rank={liveRank} 
                totalCandidates={totalCandidates} 
                topScore={topScore}
                avgScore={avgScore}
                duration={mockData?.duration}
              />
           </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function FilterNode({ active, label, count, onClick, color }: any) {
  return (
    <button onClick={onClick} className={cn("flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 h-12 md:h-14 rounded-xl transition-all border group cursor-pointer", active ? "bg-[#0F172A] border-[#0F172A] text-white shadow-lg" : "bg-white border-transparent text-slate-400 hover:bg-slate-50")}>
       <span className="text-[9px] md:text-[10px] font-bold tracking-tight uppercase">{label}</span>
       <span className={cn("text-[9px] md:text-xs font-bold opacity-40 tabular-nums", active && "opacity-60")}>{count}</span>
    </button>
  )
}
