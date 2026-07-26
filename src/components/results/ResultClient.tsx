
"use client"

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
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
  limit,
  orderBy
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
 * @fileOverview Universal Result Hub Engine v102.0.
 * FIXED: Replaced "Registry" with "Database" and "Node" with "Item".
 * RESTORED: Share Performance functionality.
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
  const [pollCount, setPollCount] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  
  const [liveRank, setLiveRank] = useState<number | string>("---")
  const [totalCandidates, setTotalCandidates] = useState<number>(0)
  const [topScore, setTopScore] = useState<number>(0)
  const [avgScore, setAvgScore] = useState<number>(0)

  const shareRef = useRef<HTMLDivElement>(null);

  const mockId = searchParams.get('id')
  const attemptIdFromUrl = searchParams.get('attemptId')

  const formatTimeTaken = (totalSeconds: number) => {
    if (!totalSeconds || totalSeconds <= 0) return "0s";
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const fetchResultNode = useCallback(async () => {
    if (!db) return false;

    try {
       if (attemptIdFromUrl) {
          const snap = await getDoc(doc(db, "results", attemptIdFromUrl));
          if (snap.exists()) {
             setSessionData({ ...snap.data(), id: snap.id });
             setIsSearching(false);
             return true;
          }
       }

       if (user && mockId && !attemptIdFromUrl) {
          const resultsRef = collection(db, "results");
          const q = query(
            resultsRef, 
            where("userId", "==", user.uid), 
            where("mockId", "==", mockId)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
             const allAttempts = snap.docs.map(d => ({ ...d.data(), id: d.id }));
             const latest = allAttempts.sort((a: any, b: any) => {
                const tA = new Date(a.timestamp).getTime();
                const tB = new Date(b.timestamp).getTime();
                return tB - tA;
             })[0];

             setSessionData(latest);
             setIsSearching(false);
             return true;
          }
       }

       if (typeof window !== 'undefined' && mockId) {
          const lookupId = attemptIdFromUrl || mockId;
          const guestKey = `cracklix_guest_result_${lookupId}`;
          const localData = localStorage.getItem(guestKey);
          if (localData) {
             const parsed = JSON.parse(localData);
             setSessionData({ ...parsed, isGuestNode: true });
             setIsSearching(false);
             return true;
          }
       }
       
       return false;
    } catch (e: any) {
       console.error("[Result_Hub_Error]:", e.message);
       return false;
    }
  }, [db, attemptIdFromUrl, user, mockId]);

  useEffect(() => {
    if (userLoading) return;

    let isSubscribed = true;
    let timer: NodeJS.Timeout;

    const runPoll = async () => {
       const found = await fetchResultNode();
       if (!found && isSubscribed) {
          setPollCount(prev => {
             if (prev < 15) {
                timer = setTimeout(runPoll, 1500);
                return prev + 1;
             } else {
                setIsSearching(false);
                return prev;
             }
          });
       }
    };

    runPoll();

    return () => {
       isSubscribed = false;
       clearTimeout(timer);
    };
  }, [fetchResultNode, userLoading]);

  useEffect(() => {
     if (!db || !sessionData) return;
     const mId = mockId || sessionData.mockId;
     if (!mId) return;
     
     const loadMetrics = async () => {
        if (sessionData.isGuestNode) return;
        try {
           const lbRef = collection(db, "leaderboards", mId, "entries");
           const lbSnap = await getDocs(query(lbRef, orderBy("highestScore", "desc")));
           const entries = lbSnap.docs.map(d => d.data());
           const myRank = entries.findIndex(e => e.userId === sessionData.userId) + 1;
           setLiveRank(myRank || "---");
           setTotalCandidates(lbSnap.size);
           setTopScore(entries[0]?.highestScore || 0);
           setAvgScore(entries.length ? entries.reduce((a,e) => a+(e.highestScore||0),0)/entries.length : 0);
        } catch (e) {}
     };

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

              const chunks = [];
              for (let i=0; i<qIds.length; i+=30) chunks.push(qIds.slice(i, i+30));
              
              const promises = chunks.map(async c => {
                const [qSnap, uSnap, lSnap] = await Promise.all([
                   getDocs(query(collection(db, "mcqBank"), where(documentId(), "in", c))),
                   getDocs(query(collection(db, "usedQuestions"), where(documentId(), "in", c))),
                   getDocs(query(collection(db, "questions"), where(documentId(), "in", c)))
                ]);
                const qDocs = qSnap.docs.map(d => d.data());
                const uDocs = uSnap.docs.map(d => d.data());
                const lDocs = lSnap.docs.map(d => d.data());
                return [...qDocs, ...uDocs, ...lDocs];
              });

              const all = (await Promise.all(promises)).flat();
              setQuestions(qIds.map(id => all.find((q:any) => q.id === id)).filter(Boolean));
           }
        } catch (e) {}
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

  const handleManualSync = () => {
     setIsSearching(true);
     setPollCount(0);
     fetchResultNode().then(found => {
        if (found) toast({ title: "Sync successful" });
        else toast({ variant: "destructive", title: "Record not found", description: "The database has not updated yet." });
     });
  };

  const handleShare = async () => {
    if (!shareRef.current || isSharing) return;
    setIsSharing(true);
    try {
      const dataUrl = await toPng(shareRef.current, { quality: 0.95, pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `cracklix-report-${sessionData.attemptId}.png`, { type: 'image/png' });
      
      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'My Cracklix Performance',
          text: `Check out my score on ${sessionData.mockTitle}!`
        });
      } else {
        const link = document.createElement('a');
        link.download = `cracklix-result.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Share failed" });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] font-body text-left">
      <Navbar />
      <main className="container mx-auto max-w-[1440px] px-4 md:px-12 py-8 md:py-16 space-y-10">
        
        {isSearching ? (
           <div className="py-40 flex flex-col items-center justify-center space-y-8">
              <div className="relative">
                 <Loader2 className="h-16 w-16 text-primary animate-spin" />
                 <Zap className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                 <p className="font-black tracking-[0.4em] text-[#0F172A] text-sm uppercase">Generating your report</p>
                 <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Database synchronization in progress...</p>
              </div>
           </div>
        ) : sessionData ? (
           <>
              <Card className="border border-[#E5EAF2] shadow-sm rounded-[24px] bg-white p-6 md:p-12 flex flex-col lg:flex-row justify-between items-center gap-6">
                 <div className="flex items-center gap-6 md:gap-10 w-full min-w-0 text-left">
                    <AuthorityLogo boardId={mockData?.boardId || "GENERAL"} size="sm" className="h-12 w-12 md:h-24 md:w-24 shadow-xl border border-slate-100 rounded-2xl" />
                    <div className="text-left space-y-2 flex-1 min-w-0">
                       <div className="flex flex-wrap items-center gap-2">
                          <Badge className="bg-[#E6F9F3] text-[#10B981] border-none px-3 font-bold text-[9px] rounded-lg shadow-sm">Verified result</Badge>
                          {sessionData.isGuestNode && <Badge className="bg-amber-50 text-amber-600 border-none px-3 font-bold text-[9px] rounded-lg shadow-sm">Guest mode</Badge>}
                       </div>
                       <h1 className="text-xl md:text-3xl font-bold text-[#0F172A] tracking-tight truncate">{sessionData.mockTitle}</h1>
                       <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 tracking-tight">
                          <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(sessionData.timestamp).toLocaleDateString('en-GB')}</span>
                          <span className="flex items-center gap-1.5"><TimerIcon className="h-4 w-4" /> {formatTimeTaken(sessionData.timeTaken || 0)}</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 w-full lg:w-auto">
                    <Button onClick={handleShare} disabled={isSharing} className="flex-1 lg:flex-none h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full gap-2 text-xs border-none shadow-lg">
                       {isSharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />} Share result
                    </Button>
                    <Button onClick={() => router.refresh()} className="flex-1 lg:flex-none h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full gap-2 text-xs border-none shadow-lg">
                       <RefreshCw className="h-4 w-4" /> Refresh
                    </Button>
                    <Button asChild variant="outline" className="flex-1 lg:flex-none h-12 px-6 border-2 border-slate-200 text-[#0F172A] font-bold rounded-full text-xs shadow-sm">
                       <Link href={`/mocks/instructions?id=${mockId || sessionData.mockId}&retake=true`}>Retake test</Link>
                    </Button>
                 </div>
              </Card>

              <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full space-y-10">
                  <div className="flex justify-center">
                     <TabsList className="bg-slate-100 p-1 rounded-full border border-slate-200 flex w-fit h-auto shadow-inner">
                        <TabsTrigger value="OVERVIEW" className="rounded-full px-8 md:px-12 font-bold text-[11px] h-11 data-[state=active]:bg-white data-[state=active]:text-primary shadow-sm tracking-tight">Analysis hub</TabsTrigger>
                        <TabsTrigger value="REVIEW" className="rounded-full px-8 md:px-12 font-bold text-[11px] h-11 data-[state=active]:bg-white data-[state=active]:text-primary shadow-sm tracking-tight">Review portal</TabsTrigger>
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
                              <Card key={q.id} className="border border-slate-100 shadow-sm rounded-[2rem] bg-white p-6 md:p-12 space-y-8 text-left group hover:border-primary/20 transition-all">
                                  <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                                     <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center font-black group-hover:bg-primary group-hover:text-white transition-all shadow-inner">#{q.originalIndex+1}</div>
                                     <Badge variant="outline" className="text-[9px] font-bold tracking-widest border-slate-200">Subject: {q.subjectId}</Badge>
                                  </div>
                                  <QuestionRenderer 
                                    question={q} 
                                    language={sessionData.languageMode || 'ENGLISH_PUNJABI'} 
                                    showSolution={true} 
                                    selectedAnswer={sessionData.answers?.[q.originalIndex]} 
                                    className="p-0 shadow-none border-none bg-transparent" 
                                  />
                              </Card>
                          ))}
                      </div>
                  </TabsContent>
              </Tabs>
           </>
        ) : (
           <div className="py-40 text-center space-y-10">
              <div className="relative mx-auto w-24 h-24">
                 <div className="h-24 w-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 shadow-inner">
                    <AlertCircle className="h-12 w-12" />
                 </div>
              </div>
              <div className="space-y-3 px-4">
                 <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tighter">Result record not found</h2>
                 <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">No synchronized attempt records were found for this ID in the database. Try refreshing or return to the bank.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-6">
                 <Button onClick={handleManualSync} className="w-full sm:w-auto h-14 px-10 bg-primary hover:bg-blue-700 text-white font-bold rounded-2xl gap-3 shadow-xl border-none active:scale-95 transition-all">
                    <RotateCcw className="h-4 w-4" /> Force sync
                 </Button>
                 <Button asChild variant="outline" className="w-full sm:w-auto h-14 px-10 rounded-2xl border-2 border-slate-200 font-bold active:scale-95 transition-all">
                    <Link href="/mocks">Explore tests</Link>
                 </Button>
              </div>
           </div>
        )}

        {/* Hidden Share Card for Export */}
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
       <span className="text-[9px] md:text-[11px] font-bold tracking-tight">{label}</span>
       <span className={cn("text-[9px] md:text-xs font-bold opacity-40 tabular-nums", active && "opacity-60")}>{count}</span>
    </button>
  )
}
