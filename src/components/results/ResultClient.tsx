
"use client"

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react"
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
} from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { 
  Zap, 
  Loader2, 
  Share2,
  ChevronRight,
  ShieldCheck,
  Clock,
  Users,
  CheckCircle2,
  RefreshCw,
  BarChart3,
  List,
  Timer as TimerIcon,
  Download,
  Calendar,
  Newspaper,
  TrendingUp,
  X
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
import html2canvas from 'html2canvas'

/**
 * @fileOverview Universal Result Hub Viewer v35.0 [Transmission Hardened].
 * FIXED: Optimized scale and implemented direct Blob sharing to prevent Transmission Errors.
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

  const [preGeneratedImage, setPreGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const generationAttempted = useRef(false);

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

  const prepareShareCard = useCallback(async () => {
    if (!mounted || !sessionData || liveRank === "---" || generationAttempted.current) return;
    
    generationAttempted.current = true;
    setIsGenerating(true);
    
    // Safety 15s timeout
    const timeoutId = setTimeout(() => {
       if (!preGeneratedImage) {
          setIsGenerating(false);
          generationAttempted.current = false;
       }
    }, 15000);

    try {
      // Allow 3s for all assets (Logo, QR, Fonts) to rasterize
      await new Promise(r => setTimeout(r, 3000));
      
      const node = document.getElementById('shareable-result-certificate');
      if (!node) throw new Error("Capture node not found");

      const canvas = await html2canvas(node, {
         useCORS: true,
         scale: 1, // High-fidelity at scale 1 (1080x1350). Scale 2 creates oversized files for mobile share.
         backgroundColor: "#0B5FFF",
         logging: false,
         width: 1080,
         height: 1350
      });

      const dataUrl = canvas.toDataURL('image/png', 0.9);
      setPreGeneratedImage(dataUrl);
      clearTimeout(timeoutId);
    } catch (e: any) {
      console.error("[SHARE_ERROR]:", e);
      generationAttempted.current = false;
      clearTimeout(timeoutId);
    } finally {
      setIsGenerating(false);
    }
  }, [mounted, sessionData, liveRank, preGeneratedImage]);

  useEffect(() => {
     if (sessionData && liveRank !== "---" && !preGeneratedImage && !isGenerating) {
        prepareShareCard();
     }
  }, [sessionData, liveRank, preGeneratedImage, isGenerating, prepareShareCard]);

  const handleShareResult = async () => {
    if (!sessionData) return;
    
    if (!preGeneratedImage) {
       toast({ title: "Synchronizing card", description: "Preparing HD certificate. Please wait 3 seconds." });
       if (!isGenerating) prepareShareCard();
       return;
    }

    try {
      // Manual Blob conversion for Native Share compatibility
      const base64Data = preGeneratedImage.split(',')[1];
      const binaryData = atob(base64Data);
      const uint8Array = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i);
      }
      const blob = new Blob([uint8Array], { type: 'image/png' });
      const file = new File([blob], `Cracklix_Result_${Date.now()}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
         await navigator.share({
            title: 'My Cracklix Result',
            text: `🎯 I scored ${sessionData.score}/${sessionData.totalQuestions} in ${sessionData.mockTitle}! Ranked #${liveRank} in Punjab.`,
            files: [file]
         });
      } else {
         // Direct Download Fallback for "Transmission Failed" scenarios
         const link = document.createElement('a');
         link.download = `Cracklix_Result_${Date.now()}.png`;
         link.href = preGeneratedImage;
         link.click();
         toast({ title: "Certificate Downloaded", description: "You can now share this from your gallery." });
      }
    } catch (e: any) { 
       if (e.name !== 'AbortError') {
          // Final fallback to direct download
          const link = document.createElement('a');
          link.download = `Cracklix_Result_Backup.png`;
          link.href = preGeneratedImage;
          link.click();
          toast({ title: "Sharing limited", description: "Image saved to gallery for manual sharing." });
       }
    }
  };

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
        
        {sessionData && (
           <>
              <Card className="border border-[#E5EAF2] shadow-sm rounded-[24px] bg-white overflow-hidden p-6 md:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                 <div className="flex items-center gap-6 md:gap-10">
                    <AuthorityLogo boardId={mockData?.boardId || "GENERAL"} size="lg" className="h-16 w-16 md:h-20 md:w-20 bg-white shadow-xl border border-slate-100" />
                    <div className="text-left space-y-2">
                       <div className="flex flex-wrap items-center gap-3">
                          <Badge className="bg-[#10B981] text-white border-none px-3 py-1 font-bold text-[9px]">Verified hub</Badge>
                          <Badge className="bg-[#1677FF] text-white border-none px-3 py-1 font-bold text-[9px]">Attempt #{profile?.totalTests || 1}</Badge>
                       </div>
                       <h1 className="text-xl md:text-3xl font-[800] text-[#071B4D] tracking-tight">{sessionData.mockTitle}</h1>
                       <div className="flex flex-wrap items-center gap-6 text-[10px] md:xs font-bold text-slate-400">
                          <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> <span>{new Date(sessionData.timestamp).toLocaleDateString('en-GB')}</span></div>
                          <div className="flex items-center gap-2"><TimerIcon className="h-3.5 w-3.5" /> <span>{mockData?.duration || 120}m</span></div>
                          <div className="flex items-center gap-2"><Users className="h-3.5 w-3.5" /> <span>{totalCandidates.toLocaleString()} Candidates</span></div>
                       </div>
                    </div>
                 </div>
                 <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                    <Button onClick={handleShareResult} disabled={isGenerating && !preGeneratedImage} className="flex-1 lg:flex-none h-12 px-8 bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white hover:brightness-110 font-bold rounded-xl gap-3 text-xs shadow-lg active:scale-95 transition-all border-none">
                       {isGenerating && !preGeneratedImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />} 
                       {preGeneratedImage ? "Direct share card" : isGenerating ? "Preparing card..." : "Generate share card"}
                    </Button>
                    <Button asChild className="flex-1 lg:flex-none h-12 px-6 bg-[#0F172A] hover:bg-black text-white font-bold rounded-xl gap-3 text-xs shadow-md">
                       <Link href={`/mocks/instructions?id=${mockId}&retake=true`}><RefreshCw className="h-4 w-4" /> Retake test</Link>
                    </Button>
                 </div>
              </Card>

              <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full space-y-6 md:space-y-10">
                  <div className="flex justify-center">
                     <TabsList className="bg-slate-100 p-1 rounded-3xl border border-[#E5EAF2] shadow-inner flex w-fit gap-1 h-auto">
                        <TabsTrigger value="OVERVIEW" className="rounded-2xl px-10 font-bold text-[11px] h-11 data-[state=active]:bg-white data-[state=active]:text-[#0F172A] transition-all">Analysis hub</TabsTrigger>
                        <TabsTrigger value="REVIEW" className="rounded-2xl px-10 font-bold text-[11px] h-11 data-[state=active]:bg-white data-[state=active]:text-[#0F172A] transition-all">Review portal</TabsTrigger>
                     </TabsList>
                  </div>

                  <TabsContent value="OVERVIEW" className="m-0 max-w-4xl mx-auto">
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
                      <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 flex items-center justify-between gap-6 shadow-sm">
                          <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar">
                             <FilterButton active={activeReviewFilter === 'ALL'} label="All questions" count={reviewNodes.all.length} onClick={() => setActiveReviewFilter('ALL')} />
                             <FilterButton active={activeReviewFilter === 'CORRECT'} label="Correct" count={reviewNodes.correct.length} onClick={() => setActiveReviewFilter('CORRECT')} color="emerald" />
                             <FilterButton active={activeReviewFilter === 'WRONG'} label="Wrong" count={reviewNodes.wrong.length} onClick={() => setActiveReviewFilter('WRONG')} color="rose" />
                             <FilterButton active={activeReviewFilter === 'SKIPPED'} label="Skipped" count={reviewNodes.skipped.length} onClick={() => setActiveReviewFilter('SKIPPED')} color="slate" />
                          </div>
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                          {filteredQuestions.map((q) => (
                              <Card key={q.id} className="border border-slate-100 shadow-sm rounded-[2.5rem] bg-white p-6 md:p-12 space-y-8 text-left">
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
              
              <div className="fixed top-[-9999px] left-[-9999px] pointer-events-none">
                 <ShareableResultCard data={sessionData} rank={liveRank} totalCandidates={totalCandidates} />
              </div>
           </>
        )}
      </main>
      <Footer />
    </div>
  )
}

function FilterButton({ active, label, count, onClick, color = "primary" }: any) {
  return (
    <button onClick={onClick} className={cn(
      "flex items-center gap-3 px-6 h-10 rounded-xl text-[10px] font-bold transition-all active:scale-95 border whitespace-nowrap",
      active ? "bg-[#0F172A] border-[#0F172A] text-white shadow-lg" : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100"
    )}>
       {label} <span className="opacity-40">{count}</span>
    </button>
  )
}
