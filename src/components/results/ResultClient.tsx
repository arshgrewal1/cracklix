
"use client"

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useFirestore, useCollection } from "@/firebase"
import { 
  collection, 
  query, 
  doc, 
  getDoc, 
  documentId, 
  getDocs, 
  where,
} from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { 
  Zap, 
  Loader2, 
  Share2,
  ChevronRight,
  Clock,
  CheckCircle2,
  RefreshCw,
  BarChart3,
  Timer as TimerIcon,
  Download,
  ShieldCheck,
  Target,
  X,
  FileText,
  Calendar,
  ArrowLeft
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
import { toJpeg } from 'html-to-image'
import jsPDF from 'jspdf'

/**
 * @fileOverview Universal Result Hub Viewer v76.0.
 * FIXED: Actual test duration and real-time competition stats (Top/Avg).
 * FIXED: Bottom clipping in share image by re-balancing vertical spacing.
 */

export default function ResultClient() {
  const db = useFirestore()
  const { user, profile, loading: userLoading } = useUser()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [mounted, setMounted] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])
  const [mockData, setMockData] = useState<any>(null)
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [activeReviewFilter, setActiveReviewFilter] = useState<'ALL' | 'WRONG' | 'CORRECT' | 'SKIPPED'>('ALL')
  const [activeMainTab, setActiveMainTab] = useState<string>("OVERVIEW")
  
  const [sessionData, setSessionData] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(true);
  
  const [liveRank, setLiveRank] = useState<number | string>("---")
  const [totalCandidates, setTotalCandidates] = useState<number>(0)
  const [topScore, setTopScore] = useState<number>(0)
  const [avgScore, setAvgScore] = useState<number>(0)
  const [avgAccuracy, setAvgAccuracy] = useState<number>(0)

  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true) }, [])

  const mockId = searchParams.get('id')
  const attemptIdFromUrl = searchParams?.get('attemptId')

  // Real data listeners for the user's specific attempts
  const resultsQuery = useMemo(() => {
    if (!db || !user || !mockId) return null;
    return query(collection(db, "results"), where("mockId", "==", mockId), where("userId", "==", user.uid));
  }, [db, user, mockId]);

  const { data: userResults } = useCollection<any>(resultsQuery);

  useEffect(() => {
    if (userLoading || !db || !mockId || !mounted) return;
    
    async function resolveAttempt() {
       setIsSearching(true);
       try {
          const resultsRef = collection(db, "results");
          let q = query(resultsRef, where("mockId", "==", mockId));
          if (user) q = query(q, where("userId", "==", user.uid));
          
          const querySnap = await getDocs(q);
          if (querySnap.empty) {
             setIsSearching(false);
             return;
          }

          const resultsList = querySnap.docs.map(d => ({ ...d.data(), id: d.id }));
          const sortedResults = resultsList.sort((a, b) => {
             const tA = a.createdAt?.seconds || new Date(a.timestamp || 0).getTime() / 1000;
             const tB = b.createdAt?.seconds || new Date(b.timestamp || 0).getTime() / 1000;
             return tB - tA;
          });

          setSessionData(attemptIdFromUrl ? resultsList.find(r => r.attemptId === attemptIdFromUrl) || sortedResults[0] : sortedResults[0]);
          setIsSearching(false);
       } catch (e) { 
          setIsSearching(false);
       }
    }
    resolveAttempt();
  }, [user, userLoading, db, mockId, attemptIdFromUrl, mounted]);

  useEffect(() => {
     if (!db || !mockId || !sessionData) return;
     async function fetchRankingMetrics() {
        try {
           const entriesRef = collection(db, "leaderboards", mockId, "entries");
           const snap = await getDocs(entriesRef);
           
           if (snap.empty) return;

           const entries = snap.docs.map(d => d.data());
           const sorted = [...entries].sort((a: any, b: any) => {
              if (b.highestScore !== a.highestScore) return b.highestScore - a.highestScore;
              if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
              return a.timeTaken - b.timeTaken;
           });

           const totalCount = sorted.length;
           const myIndex = sorted.findIndex(e => e.userId === sessionData.userId);
           const rank = myIndex === -1 ? totalCount : myIndex + 1;

           const totalS = entries.reduce((acc, e) => acc + (e.highestScore || 0), 0);
           const totalAcc = entries.reduce((acc, e) => acc + (e.accuracy || 0), 0);

           setTotalCandidates(totalCount);
           setLiveRank(rank);
           setTopScore(sorted[0]?.highestScore || 0);
           setAvgScore(totalCount > 0 ? totalS / totalCount : 0);
           setAvgAccuracy(totalCount > 0 ? totalAcc / totalCount : 0);
        } catch (e) {}
     }
     fetchRankingMetrics();
  }, [db, mockId, sessionData]);

  const handleShareOfficialReport = async () => {
    if (!sessionData || isGenerating) return;
    setIsGenerating(true);

    try {
      const node = reportRef.current;
      if (!node) throw new Error("Report node not ready.");

      const dataUrl = await toJpeg(node, {
        quality: 0.75,
        pixelRatio: 1.5,
        cacheBust: true,
        backgroundColor: '#ffffff'
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();

      const file = new File(
        [blob],
        `Cracklix_Report_${sessionData.userId}_${Date.now()}.jpg`,
        { type: "image/jpeg" }
      );

      if (navigator.share) {
        await navigator.share({
          title: "Official Cracklix Report",
          text: `My verified exam report for ${sessionData.mockTitle}.`,
          files: [file]
        });
      } else {
        const link = document.createElement('a');
        link.download = file.name;
        link.href = dataUrl;
        link.click();
        toast({ title: "Report saved to device" });
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        toast({ variant: "destructive", title: "Share failed" });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!sessionData || isGenerating) return;
    setIsGenerating(true);
    
    try {
      const node = reportRef.current;
      if (!node) throw new Error("Node missing.");

      const imgData = await toJpeg(node, { quality: 0.7, pixelRatio: 1.5, backgroundColor: '#ffffff' });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`Cracklix_Report_${sessionData.attemptId}.pdf`);
      toast({ title: "PDF Synced" });
    } catch (e) {
      toast({ variant: "destructive", title: "PDF Failure" });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    async function loadQuestions() {
      if (!db || !mockId) return;
      try {
        setLoadingQuestions(true);
        const [mSnap, dSnap] = await Promise.all([getDoc(doc(db, "mocks", mockId)), getDoc(doc(db, "daily_quizzes", mockId))]);
        const mockSnap = mSnap.exists() ? mSnap : dSnap;

        if (mockSnap.exists()) {
          const mData = mockSnap.data();
          setMockData(mData);
          const questionIds = mData.questionIds || [];
          if (questionIds.length > 0) {
            const chunks = [];
            for (let i = 0; i < questionIds.length; i += 30) { chunks.push(questionIds.slice(i, i + 30)) }
            const chunkPromises = chunks.map(async (chunk) => {
              const [mcqSnap, usedSnap, legacySnap] = await Promise.all([
                getDocs(query(collection(db, "mcqBank"), where(documentId(), "in", chunk))),
                getDocs(query(collection(db, "usedQuestions"), where(documentId(), "in", chunk))),
                getDocs(query(collection(db, "questions"), where(documentId(), "in", chunk)))
              ]);
              const batch: any[] = [];
              mcqSnap.docs.forEach(d => batch.push({ ...d.data(), id: d.id }));
              usedSnap.forEach(d => { if (!batch.find(f => f.id === d.id)) batch.push({ ...d.data(), id: d.id }); });
              legacySnap.forEach(d => { if (!batch.find(f => f.id === d.id)) batch.push({ ...d.data(), id: d.id }); });
              return batch;
            });
            const all = (await Promise.all(chunkPromises)).flat();
            setQuestions(questionIds.map((id: string) => all.find((q: any) => q.id === id)).filter(Boolean));
          }
        }
      } finally { setLoadingQuestions(false) }
    }
    loadQuestions()
  }, [db, mockId]);

  const reviewNodes = useMemo(() => {
    if (!sessionData || !questions.length) return { all: [], correct: [], wrong: [], skipped: [] };
    const all = questions.map((q, i) => ({ ...q, originalIndex: i }));
    const correct: any[] = [], wrong: any[] = [], skipped: any[] = [];
    all.forEach((q) => {
      const ans = sessionData.answers?.[q.originalIndex] ?? sessionData.answers?.[String(q.originalIndex)];
      if (ans === null || ans === undefined || String(ans) === "") skipped.push(q);
      else {
        const userSelectedLabel = ['A', 'B', 'C', 'D'][Number(ans)];
        if (userSelectedLabel === q.correctAnswer) correct.push(q); else wrong.push(q);
      }
    });
    return { all, correct, wrong, skipped };
  }, [questions, sessionData]);

  const filteredQuestions = activeReviewFilter === 'CORRECT' ? reviewNodes.correct : 
                           activeReviewFilter === 'WRONG' ? reviewNodes.wrong : 
                           activeReviewFilter === 'SKIPPED' ? reviewNodes.skipped : reviewNodes.all;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] font-body text-left relative">
      <Navbar />
      
      <main className="container mx-auto max-w-[1440px] px-4 md:px-12 py-6 md:py-16 space-y-6 md:space-y-10">
        
        {sessionData ? (
           <>
              <Card className="border border-[#E5EAF2] shadow-sm rounded-[24px] bg-white overflow-hidden p-5 md:p-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                 <div className="flex items-center gap-4 md:gap-10 w-full min-w-0">
                    <button onClick={() => router.back()} className="h-10 w-10 md:h-12 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-90 shrink-0">
                       <ArrowLeft className="h-5 w-5" />
                    </button>
                    <AuthorityLogo boardId={mockData?.boardId || "GENERAL"} size="sm" className="h-12 w-12 md:h-24 md:w-24 bg-white shadow-xl border border-slate-100 rounded-2xl md:rounded-3xl" />
                    <div className="text-left space-y-2 flex-1 min-w-0">
                       <div className="flex flex-wrap items-center gap-2">
                          <Badge className="bg-[#E6F9F3] text-[#10B981] border-none px-3 py-0.5 font-bold text-[9px] rounded-lg">Verified report</Badge>
                          <Badge className="bg-[#EBF2FF] text-[#2563EB] border-none px-3 py-0.5 font-bold text-[9px] rounded-lg">Attempt #{userResults?.length || 1}</Badge>
                       </div>
                       <h1 className="text-lg md:text-4xl font-bold text-[#0F172A] tracking-tight leading-tight truncate">{sessionData.mockTitle}</h1>
                       <div className="flex flex-wrap items-center gap-4 text-[10px] md:text-base font-semibold text-slate-400">
                          <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-slate-300" /> <span>{new Date(sessionData.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
                          <div className="flex items-center gap-1.5"><TimerIcon className="h-4 w-4 text-slate-300" /> <span>{mockData?.duration || 120}:00</span></div>
                       </div>
                    </div>
                 </div>

                 <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto mt-2">
                    <Button onClick={handleShareOfficialReport} disabled={isGenerating} className="flex-[2] lg:flex-none h-12 px-4 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-full gap-2 text-[11px] md:text-sm shadow-lg active:scale-95 border-none">
                       {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />} 
                       <span className="whitespace-nowrap">Share report</span>
                    </Button>
                    <Button onClick={handleDownloadPDF} disabled={isGenerating} variant="outline" className="flex-1 lg:flex-none h-12 px-2 border-2 border-slate-100 rounded-full gap-1 font-bold text-slate-400 hover:text-primary active:scale-95 transition-all text-[11px] md:text-sm">
                       {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-3.5 w-3.5" />} 
                       <span>PDF</span>
                    </Button>
                    <Button asChild className="flex-[1.5] lg:flex-none h-12 px-4 bg-[#0F172A] hover:bg-black text-white font-bold rounded-full gap-2 text-[11px] md:text-sm shadow-md transition-all active:scale-95 border-none">
                       <Link href={`/mocks/instructions?id=${mockId}&retake=true`} className="flex items-center justify-center gap-2">
                          <RefreshCw className="h-4 w-4" /> 
                          <span className="whitespace-nowrap">Retake</span>
                       </Link>
                    </Button>
                 </div>
              </Card>

              <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full space-y-6 md:space-y-10">
                  <div className="flex justify-center">
                     <TabsList className="bg-slate-100 p-1 rounded-3xl border border-[#E5EAF2] shadow-inner flex w-fit gap-1 h-auto">
                        <TabsTrigger value="OVERVIEW" className="rounded-2xl px-8 md:px-12 font-bold text-[11px] md:text-[12px] h-11 data-[state=active]:bg-white data-[state=active]:text-[#0F172A] transition-all">Analysis hub</TabsTrigger>
                        <TabsTrigger value="REVIEW" className="rounded-2xl px-8 md:px-12 font-bold text-[11px] md:text-[12px] h-11 data-[state=active]:bg-white data-[state=active]:text-[#0F172A] transition-all">Review portal</TabsTrigger>
                     </TabsList>
                  </div>

                  <TabsContent value="OVERVIEW" className="m-0 max-w-5xl mx-auto">
                      <ReportScreen 
                         {...sessionData} 
                         rank={liveRank} 
                         totalCandidates={totalCandidates}
                         percentile={Math.max(0, Math.round(((totalCandidates - Number(liveRank)) / (totalCandidates || 1)) * 100))}
                         topScore={topScore}
                         avgScore={avgScore}
                         avgAccuracy={avgAccuracy}
                      />
                  </TabsContent>

                  <TabsContent value="REVIEW" className="m-0 max-w-5xl mx-auto space-y-6 md:space-y-10">
                      <div className="bg-white p-2 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                          <div className="grid grid-cols-4 gap-1 md:gap-4 w-full">
                             <FilterButton active={activeReviewFilter === 'ALL'} label="All" count={reviewNodes.all.length} onClick={() => setActiveReviewFilter('ALL')} />
                             <FilterButton active={activeReviewFilter === 'CORRECT'} label="Correct" count={reviewNodes.correct.length} onClick={() => setActiveReviewFilter('CORRECT')} color="emerald" />
                             <FilterButton active={activeReviewFilter === 'WRONG'} label="Wrong" count={reviewNodes.wrong.length} onClick={() => setActiveReviewFilter('WRONG')} color="rose" />
                             <FilterButton active={activeReviewFilter === 'SKIPPED'} label="Skip" count={reviewNodes.skipped.length} onClick={() => setActiveReviewFilter('SKIPPED')} color="slate" />
                          </div>
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                          {filteredQuestions.map((q) => (
                              <Card key={q.id} className="border border-[#E5EAF2] shadow-sm rounded-[2rem] bg-white p-6 md:p-12 space-y-8 text-left">
                                  <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                                     <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-[#0F172A] shadow-inner">#{q.originalIndex + 1}</div>
                                        <Badge variant="outline" className="border-slate-100 text-slate-400 font-bold text-[9px]">Subject: {q.subjectId || 'General'}</Badge>
                                     </div>
                                  </div>
                                  <QuestionRenderer 
                                      question={q} 
                                      language={sessionData.languageMode || 'ENGLISH_PUNJABI'} 
                                      showSolution={true} 
                                      selectedAnswer={sessionData.answers?.[q.originalIndex] ?? sessionData.answers?.[String(q.originalIndex)]} 
                                      className="p-0 shadow-none border-none bg-transparent" 
                                  />
                              </Card>
                          ))}
                      </div>
                  </TabsContent>
              </Tabs>
              
              <div className="fixed top-[-9999px] left-[-9999px] pointer-events-none opacity-0">
                 <ShareableResultCard 
                   ref={reportRef}
                   data={sessionData} 
                   rank={liveRank} 
                   totalCandidates={totalCandidates}
                   topScore={topScore}
                   avgScore={avgScore}
                   avgAccuracy={avgAccuracy}
                   duration={mockData?.duration || 120}
                 />
              </div>
           </>
        ) : isSearching ? (
           <div className="py-40 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Searching registry nodes...</p>
           </div>
        ) : (
           <div className="py-40 flex flex-col items-center justify-center space-y-6 text-center">
              <div className="h-20 w-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 shadow-inner">
                 <ShieldCheck className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                 <h2 className="text-2xl font-black text-[#0F172A]">Result audit not found</h2>
                 <p className="text-slate-500 font-medium max-w-sm">No synchronized attempt records were found for this test vertical.</p>
              </div>
              <Button asChild className="rounded-full px-10">
                 <Link href="/mocks">Explore test bank</Link>
              </Button>
           </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

function FilterButton({ active, label, count, onClick }: any) {
  return (
    <button onClick={onClick} className={cn(
      "flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-3 px-1 md:px-6 h-12 rounded-xl transition-all active:scale-95 border",
      active ? "bg-[#0F172A] border-[#0F172A] text-white shadow-lg" : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100"
    )}>
       <span className="text-[9px] md:text-[11px] font-bold tracking-tight">{label}</span>
       <span className={cn("text-[9px] md:text-xs font-bold opacity-40 tabular-nums")}>{count}</span>
    </button>
  )
}
