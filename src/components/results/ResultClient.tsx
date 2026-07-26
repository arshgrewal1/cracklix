
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
  FileText
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
import { toBlob } from 'html-to-image'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * @fileOverview Universal Result Hub Viewer v60.0.
 * FIXED: Implemented professional PNG share and A4 PDF download.
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

  useEffect(() => { setMounted(true) }, [])

  const mockId = searchParams.get('id')
  const attemptIdFromUrl = searchParams?.get('attemptId')

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

  const handleShareResult = async () => {
    if (!sessionData || isGenerating) return;
    setIsGenerating(true);

    try {
      const node = document.getElementById('cracklix-result-card-canvas');
      if (!node) throw new Error("Capture node not found");

      const blob = await toBlob(node, {
        pixelRatio: 2,
        cacheBust: true,
      });

      if (!blob) throw new Error("Blob generation failed");

      const file = new File(
        [blob],
        `Cracklix_Result_${sessionData.mockTitle.replace(/\s+/g, '_')}.png`,
        { type: "image/png" }
      );

      if (navigator.share) {
        await navigator.share({
          title: "My Cracklix Result",
          text: `Check my verified result for ${sessionData.mockTitle} on Cracklix!`,
          files: [file]
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = file.name;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast({ title: "Result Downloaded" });
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        toast({ variant: "destructive", title: "Share Failed", description: "Could not generate share image." });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!sessionData || isGenerating) return;
    setIsGenerating(true);

    try {
      const node = document.getElementById('cracklix-result-card-canvas');
      if (!node) throw new Error("Capture node not found");

      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Cracklix_Scorecard_${sessionData.mockTitle.replace(/\s+/g, '_')}.pdf`);
      toast({ title: "PDF Generated" });
    } catch (e: any) {
       toast({ variant: "destructive", title: "PDF Failed", description: "Could not generate document." });
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
      
      <main className="container mx-auto max-w-[1440px] px-4 md:px-12 py-8 md:py-16 space-y-6 md:space-y-10">
        
        {sessionData ? (
           <>
              <Card className="border border-[#E5EAF2] shadow-sm rounded-[24px] bg-white overflow-hidden p-6 md:p-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                 <div className="flex items-center gap-6 md:gap-10">
                    <AuthorityLogo boardId={mockData?.boardId || "GENERAL"} size="lg" className="h-20 w-20 md:h-28 md:w-28 bg-white shadow-xl border border-slate-100 rounded-3xl" />
                    <div className="text-left space-y-3">
                       <div className="flex flex-wrap items-center gap-3">
                          <Badge className="bg-[#E6F9F3] text-[#10B981] border-none px-4 py-1 font-bold text-[10px] rounded-lg">VERIFIED HUB</Badge>
                          <Badge className="bg-[#EBF2FF] text-[#2563EB] border-none px-4 py-1 font-bold text-[10px] rounded-lg uppercase">ATTEMPT #{results?.length || 1}</Badge>
                       </div>
                       <h1 className="text-2xl md:text-5xl font-bold text-[#0F172A] tracking-tight leading-none">{sessionData.mockTitle}</h1>
                       <div className="flex flex-wrap items-center gap-6 text-[12px] md:text-lg font-semibold text-slate-400">
                          <div className="flex items-center gap-2"><Calendar className="h-5 w-5 text-slate-300" /> <span>{new Date(sessionData.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span></div>
                          <div className="flex items-center gap-2"><TimerIcon className="h-5 w-5 text-slate-300" /> <span>Duration: {mockData?.duration || 120}:00</span></div>
                       </div>
                    </div>
                 </div>
                 <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                    <Button onClick={handleDownloadPDF} disabled={isGenerating} className="flex-1 lg:flex-none h-14 px-8 bg-white border-2 border-slate-100 text-slate-600 font-bold rounded-2xl gap-3 text-sm shadow-sm active:scale-95 transition-all">
                       {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />} Download PDF
                    </Button>
                    <Button onClick={handleShareResult} disabled={isGenerating} className="flex-1 lg:flex-none h-14 px-8 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-2xl gap-3 text-sm shadow-lg active:scale-95 transition-all border-none">
                       {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Share2 className="h-5 w-5" />} Share Result
                    </Button>
                    <Button asChild className="flex-1 lg:flex-none h-14 px-8 bg-[#0F172A] hover:bg-black text-white font-bold rounded-2xl gap-3 text-sm shadow-md">
                       <Link href={`/mocks/instructions?id=${mockId}&retake=true`}><RefreshCw className="h-4 w-4" /> Retake Test</Link>
                    </Button>
                 </div>
              </Card>

              <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full space-y-6 md:space-y-10">
                  <div className="flex justify-center">
                     <TabsList className="bg-slate-100 p-1 rounded-3xl border border-[#E5EAF2] shadow-inner flex w-fit gap-1 h-auto">
                        <TabsTrigger value="OVERVIEW" className="rounded-2xl px-12 font-bold text-[12px] h-12 data-[state=active]:bg-white data-[state=active]:text-[#0F172A] transition-all">Analysis Hub</TabsTrigger>
                        <TabsTrigger value="REVIEW" className="rounded-2xl px-12 font-bold text-[12px] h-12 data-[state=active]:bg-white data-[state=active]:text-[#0F172A] transition-all">Review Portal</TabsTrigger>
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
                      <div className="bg-white p-4 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                          <div className="grid grid-cols-4 gap-1.5 md:gap-4 w-full">
                             <FilterButton active={activeReviewFilter === 'ALL'} label="All" count={reviewNodes.all.length} onClick={() => setActiveReviewFilter('ALL')} />
                             <FilterButton active={activeReviewFilter === 'CORRECT'} label="Correct" count={reviewNodes.correct.length} onClick={() => setActiveReviewFilter('CORRECT')} color="emerald" />
                             <FilterButton active={activeReviewFilter === 'WRONG'} label="Wrong" count={reviewNodes.wrong.length} onClick={() => setActiveReviewFilter('WRONG')} color="rose" />
                             <FilterButton active={activeReviewFilter === 'SKIPPED'} label="Skip" count={reviewNodes.skipped.length} onClick={() => setActiveReviewFilter('SKIPPED')} color="slate" />
                          </div>
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                          {filteredQuestions.map((q) => (
                              <Card key={q.id} className="border border-[#E5EAF2] shadow-sm rounded-[2.5rem] bg-white p-6 md:p-12 space-y-8 text-left">
                                  <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                                     <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-[#0F172A] shadow-inner">#{q.originalIndex + 1}</div>
                                        <Badge variant="outline" className="border-slate-100 text-slate-400 font-bold text-[9px]">{q.subjectId || 'General'}</Badge>
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
              
              {/* HIDDEN CAPTURE NODE */}
              <div className="fixed top-[-9999px] left-[-9999px] pointer-events-none opacity-0">
                 <ShareableResultCard 
                   data={sessionData} 
                   rank={liveRank} 
                   totalCandidates={totalCandidates} 
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

function FilterButton({ active, label, count, onClick, color }: any) {
  return (
    <button onClick={onClick} className={cn(
      "flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 px-1 md:px-6 h-12 md:h-12 rounded-xl transition-all active:scale-95 border",
      active ? "bg-[#0F172A] border-[#0F172A] text-white shadow-lg" : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100"
    )}>
       <span className="text-[9px] md:text-[11px] font-black uppercase tracking-tight">{label}</span>
       <span className={cn("text-[10px] md:text-xs font-bold opacity-40 tabular-nums")}>{count}</span>
    </button>
  )
}
