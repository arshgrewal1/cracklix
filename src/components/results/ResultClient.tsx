'use client';

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
} from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { 
  Zap, 
  Loader2, 
  Download,
  ChevronRight,
  ShieldCheck,
  Clock,
  Users,
  CheckCircle2,
  RefreshCw
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { pdf } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import QRCode from 'qrcode'
import { AuthorityLogo } from "@/lib/exam-icons"
import ReportScreen from "./ReportScreen"
import PerformancePDF from "./PerformancePDF"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import { Card } from "@/components/ui/card"
import Link from "next/link"

/**
 * @fileOverview Universal Result Hub Viewer v12.5.
 * FIXED: Header height offset handling and spacing gaps as per institutional rules.
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
  const [isExporting, setIsExporting] = useState(false)
  
  const [sessionData, setSessionData] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(true);
  
  const [liveRank, setLiveRank] = useState<number | string>("---")
  const [totalCandidates, setTotalCandidates] = useState<number>(0)
  const [topScore, setTopScore] = useState<number>(0)
  const [avgScore, setAvgScore] = useState<number>(0)
  const [avgAccuracy, setAvgAccuracy] = useState<number>(0)

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

  const handleDownloadPDF = async () => {
    if (isExporting || !sessionData) return;
    setIsExporting(true);
    toast({ title: "Syncing report registry" });
    
    try {
      const qrData = await QRCode.toDataURL(`https://cracklix.in/results/view?id=${sessionData.mockId}&attemptId=${sessionData.attemptId}`);
      
      const pdfData = {
        studentName: sessionData.userName || profile?.name || "Aspirant",
        examTitle: sessionData.mockTitle,
        score: sessionData.score.toFixed(1),
        rank: liveRank,
        totalCandidates,
        accuracy: sessionData.attemptAccuracy,
        correct: sessionData.correctCount,
        wrong: sessionData.wrongCount,
        skipped: sessionData.skippedCount,
        total: sessionData.totalQuestions,
        grade: sessionData.grade || "F",
        percentile: Math.max(0, Math.round(((totalCandidates - Number(liveRank)) / (totalCandidates || 1)) * 100)),
        topScore,
        avgScore,
        avgAccuracy,
        subjectAnalysis: sessionData.subjectAnalysis || [],
        date: new Date(sessionData.timestamp).toLocaleDateString('en-GB'),
        attemptId: sessionData.attemptId,
        duration: `${mockData?.duration || 120}m`
      };

      const blob = await pdf(<PerformancePDF data={pdfData} qrData={qrData} />).toBlob();
      saveAs(blob, `Report_${pdfData.studentName.replace(/\s+/g, '_')}.pdf`);
      toast({ title: "Report downloaded" });
    } catch (e) { 
       console.error(e);
       toast({ variant: "destructive", title: "Export failed" }); 
    } finally { setIsExporting(false); }
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

  if (isSearching) return <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F8FAFC] space-y-6"><Zap className="h-12 w-12 text-primary animate-pulse" /><p className="text-[10px] font-bold text-slate-300">Synchronizing Analysis Hub...</p></div>;

  const filteredQuestions = activeReviewFilter === 'CORRECT' ? reviewNodes.correct : 
                           activeReviewFilter === 'WRONG' ? reviewNodes.wrong : 
                           activeReviewFilter === 'SKIPPED' ? reviewNodes.skipped : reviewNodes.all;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-left">
      <Navbar />
      
      {/* 
        MAIN CONTENT: Offset by header height variable.
        Padding: Mobile 16px extra, Desktop 24px extra.
      */}
      <main 
        className="container mx-auto max-w-[1400px] px-4 md:px-12 pb-40 space-y-6 md:space-y-10"
        style={{ paddingTop: 'calc(var(--header-height, 104px) + 16px)' }}
      >
        
        {sessionData && (
           <div className="space-y-6 md:space-y-10">
              {/* SECTION 1: TEST HEADER CARD */}
              <Card className="border border-[#E5EAF2] shadow-sm rounded-[24px] bg-white overflow-hidden p-6 md:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                 <div className="flex items-center gap-6 md:gap-10">
                    <AuthorityLogo boardId={mockData?.boardId || "GENERAL"} size="lg" className="h-16 w-16 md:h-20 md:w-20 bg-white shadow-xl border border-slate-100" />
                    <div className="text-left space-y-2">
                       <div className="flex flex-wrap items-center gap-3">
                          <Badge className="bg-[#10B981] text-white border-none px-3 py-1 font-bold text-[9px] uppercase tracking-widest">Verified Hub</Badge>
                          <Badge className="bg-[#1677FF] text-white border-none px-3 py-1 font-bold text-[9px] uppercase tracking-widest">Attempt #{profile?.totalTests || 1}</Badge>
                       </div>
                       <h1 className="text-xl md:text-3xl font-black text-[#071B4D] tracking-tight">{sessionData.mockTitle}</h1>
                       <div className="flex items-center gap-6 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">
                          <HeaderMiniNode icon={<Clock className="h-3.5 w-3.5" />} label="Date" val={new Date(sessionData.timestamp).toLocaleDateString('en-GB')} />
                          <HeaderMiniNode icon={<Clock className="h-3.5 w-3.5" />} label="Duration" val={`${mockData?.duration || 120}m`} />
                          <HeaderMiniNode icon={<Users className="h-3.5 w-3.5" />} label="Candidates" val={totalCandidates.toLocaleString()} />
                       </div>
                    </div>
                 </div>
                 <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                    <Button onClick={handleDownloadPDF} disabled={isExporting} className="flex-1 lg:flex-none h-12 px-6 bg-white border border-slate-200 text-[#071B4D] hover:bg-slate-50 font-bold rounded-xl gap-3 text-xs shadow-sm">
                       {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Download PDF
                    </Button>
                    <Button asChild className="flex-1 lg:flex-none h-12 px-6 bg-[#0F172A] hover:bg-black text-white font-bold rounded-xl gap-3 text-xs shadow-md">
                       <Link href={`/mocks/instructions?id=${mockId}&retake=true`}><RefreshCw className="h-4 w-4" /> Retake Test</Link>
                    </Button>
                 </div>
              </Card>

              {/* SECTION 2: TABS & CONTENT */}
              <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full space-y-6 md:space-y-10">
                  <div className="flex justify-center">
                     <TabsList className="bg-slate-100 p-1 rounded-3xl border border-[#E5EAF2] shadow-inner flex w-fit gap-1 mx-auto lg:mx-0 h-auto">
                        <TabsTrigger value="OVERVIEW" className="rounded-2xl px-10 font-bold text-[11px] h-11 data-[state=active]:bg-white data-[state=active]:text-[#0F172A] transition-all">Analysis Hub</TabsTrigger>
                        <TabsTrigger value="REVIEW" className="rounded-2xl px-10 font-bold text-[11px] h-11 data-[state=active]:bg-white data-[state=active]:text-[#0F172A] transition-all">Review Portal</TabsTrigger>
                     </TabsList>
                  </div>

                  <TabsContent value="OVERVIEW" className="m-0 max-w-4xl mx-auto">
                      <ReportScreen 
                         {...sessionData} 
                         rank={liveRank} 
                         totalCandidates={totalCandidates}
                         timeTaken={`${Math.floor(sessionData.timeTaken / 60)}m ${sessionData.timeTaken % 60}s`}
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
                                        <Badge variant="outline" className="border-slate-100 text-slate-400 font-bold text-[9px] uppercase">{q.subjectId || 'General'}</Badge>
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
           </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

function HeaderMiniNode({ icon, label, val }: any) {
  return (
    <div className="flex items-center gap-2">
       <span className="shrink-0">{icon}</span>
       <span className="text-slate-400">{label}:</span>
       <span className="text-[#071B4D] font-bold">{val}</span>
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
