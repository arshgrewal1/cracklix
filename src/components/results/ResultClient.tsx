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
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { AuthorityLogo } from "@/lib/exam-icons"
import ReportScreen from "./ReportScreen"
import ReportPDF from "./ReportPDF"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import { Card } from "@/components/ui/card"
import Link from "next/link"

/**
 * @fileOverview Institutional Result Hub v6.2.
 * FIXED: Syntax error corrected on line 326.
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
  const [guestResult, setGuestResult] = useState<any>(null)
  const [activeMainTab, setActiveMainTab] = useState<string>("OVERVIEW")
  const [isExporting, setIsExporting] = useState(false)
  
  const [sessionData, setSessionData] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(true);
  const [errorNotFound, setErrorNotFound] = useState(false);
  
  const [liveRank, setLiveRank] = useState<number | string>("---")
  const [totalCandidates, setTotalCandidates] = useState<number>(0)
  const [topScore, setTopScore] = useState<number>(0)
  const [avgScore, setAvgScore] = useState<number>(0)
  const [avgAccuracy, setAvgAccuracy] = useState<number>(0)

  useEffect(() => { setMounted(true) }, [])

  const mockId = searchParams.get('id')
  const attemptIdFromUrl = searchParams?.get('attemptId')

  const activeSession = useMemo(() => user ? sessionData : guestResult, [user, sessionData, guestResult]);

  useEffect(() => {
    if (userLoading || !db || !mockId || !mounted) return;
    
    async function resolveId() {
       setIsSearching(true);
       setErrorNotFound(false);

       if (!user) {
          const guestRes = localStorage.getItem(`cracklix_guest_result_${mockId}`);
          if (guestRes) { 
             setGuestResult(JSON.parse(guestRes)); 
             setIsSearching(false); 
          } else { 
             setErrorNotFound(true); 
             setIsSearching(false); 
          }
          return;
       }

       try {
          const resultsRef = collection(db, "results");
          let q = query(resultsRef, where("userId", "==", user.uid), where("mockId", "==", mockId));
          const querySnap = await getDocs(q);
          
          if (querySnap.empty) {
             setErrorNotFound(true);
             setIsSearching(false);
             return;
          }

          const resultsList = querySnap.docs.map(d => ({ ...d.data(), id: d.id }));
          
          if (attemptIdFromUrl) {
             const target = resultsList.find(r => r.attemptId === attemptIdFromUrl || r.id.endsWith(attemptIdFromUrl));
             if (target) {
                setSessionData(target);
                setIsSearching(false);
                return;
             }
          }

          const sortedResults = resultsList.sort((a, b) => {
             const tA = a.createdAt?.seconds || new Date(a.timestamp || 0).getTime() / 1000;
             const tB = b.createdAt?.seconds || new Date(b.timestamp || 0).getTime() / 1000;
             return tB - tA;
          });

          setSessionData(sortedResults[0]);
          setIsSearching(false);

       } catch (e) { 
          setErrorNotFound(true); 
       } finally { 
          setIsSearching(false); 
       }
    }
    resolveId();
  }, [user, userLoading, db, mockId, attemptIdFromUrl, mounted]);

  useEffect(() => {
     if (!db || !mockId || !activeSession) return;
     async function fetchRankingMetrics() {
        try {
           const entriesRef = collection(db, "leaderboards", mockId, "entries");
           const snap = await getDocs(query(entriesRef, where("mockId", "==", mockId)));
           
           const entries = snap.docs.map(d => d.data());
           const sorted = [...entries].sort((a: any, b: any) => {
              if (b.highestScore !== a.highestScore) return b.highestScore - a.highestScore;
              if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
              return a.timeTaken - b.timeTaken;
           });

           const totalCount = sorted.length;
           const myIndex = sorted.findIndex(e => e.userId === activeSession.userId || e.uid === activeSession.userId);
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
  }, [db, mockId, activeSession]);

  useEffect(() => {
    async function loadQuestions() {
      if (!db || !mockId) return;
      try {
        setLoadingQuestions(true);
        const mockRef = doc(db, "mocks", mockId);
        const dailyRef = doc(db, "daily_quizzes", mockId);
        const [mSnap, dSnap] = await Promise.all([getDoc(mockRef), getDoc(dailyRef)]);
        const mockSnap = mSnap.exists() ? mSnap : dSnap;

        if (mockSnap.exists()) {
          const mData = mockSnap.data();
          setMockData(mData);
          const questionIds = mData.questionIds || [];
          if (questionIds.length > 0) {
            const chunks = [];
            for (let i = 0; i < questionIds.length; i += 30) { chunks.push(questionIds.slice(i, i + 30)) }
            const chunkPromises = chunks.map(async (chunk) => {
              const mcqSnap = await getDocs(query(collection(db, "mcqBank"), where(documentId(), "in", chunk)));
              const usedSnap = await getDocs(query(collection(db, "usedQuestions"), where(documentId(), "in", chunk)));
              const legacySnap = await getDocs(query(collection(db, "questions"), where(documentId(), "in", chunk)));
              const localResults: any[] = [];
              mcqSnap.docs.forEach(d => localResults.push({ ...d.data(), id: d.id }));
              usedSnap.forEach(d => { if (!localResults.find(f => f.id === d.id)) localResults.push({ ...d.data(), id: d.id }); });
              legacySnap.forEach(d => { if (!localResults.find(f => f.id === d.id)) localResults.push({ ...d.data(), id: d.id }); });
              return localResults;
            });
            const allBatches = await Promise.all(chunkPromises);
            const fetchedQuestions = allBatches.flat();
            setQuestions(questionIds.map((id: string) => fetchedQuestions.find((q: any) => q.id === id)).filter(Boolean));
          }
        }
      } catch (e) {} finally { setLoadingQuestions(false) }
    }
    loadQuestions()
  }, [db, mockId]);

  const finalMetrics = useMemo(() => {
    if (!activeSession) return null;
    const score = Number(activeSession.score) || 0;
    const totalQ = Number(activeSession.totalQuestions) || 0;
    const maxMarks = Number(activeSession.maxMarks) || totalQ;
    const percentage = Number(((score / maxMarks) * 100).toFixed(1));
    const isQualified = activeSession.isQualified || percentage >= 40;
    
    const belowCount = Math.max(0, totalCandidates - Number(liveRank));
    const percentile = totalCandidates > 1 ? Number(((belowCount / totalCandidates) * 100).toFixed(1)) : 100;
    
    let grade = "F";
    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B+";
    else if (percentage >= 60) grade = "B";
    else if (percentage >= 50) grade = "C";
    else if (percentage >= 40) grade = "D";

    return { score, maxMarks, percentage, attemptAccuracy: Number(activeSession.attemptAccuracy) || 0, grade, isQualified, percentile };
  }, [activeSession, totalCandidates, liveRank]);

  const handleDownloadPDF = async () => {
    if (isExporting || !activeSession || !finalMetrics) return;
    setIsExporting(true);
    toast({ title: "Syncing report registry" });
    
    try {
      const container = document.getElementById('pdf-export-buffer');
      if (!container) throw new Error("Capture node missing");
      
      const canvas = await html2canvas(container, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: 794,
        onclone: (clonedDoc) => {
           const el = clonedDoc.getElementById('pdf-export-buffer');
           if (el) el.style.display = 'block';
        }
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      pdf.save(`Report_${activeSession.userName || 'Student'}_${mockId}.pdf`);
      toast({ title: "Analysis downloaded" });
    } catch (e) { 
       console.error(e);
       toast({ variant: "destructive", title: "Export failed" }); 
    } finally { 
       setIsExporting(false); 
    }
  };

  const reviewNodes = useMemo(() => {
    if (!activeSession || !questions.length) return { all: [], correct: [], wrong: [], skipped: [] };
    const all = questions.map((q, i) => ({ ...q, originalIndex: i }));
    const correct: any[] = [], wrong: any[] = [], skipped: any[] = [];
    all.forEach((q) => {
      const ans = activeSession.answers?.[q.originalIndex] ?? activeSession.answers?.[String(q.originalIndex)];
      if (ans === null || ans === undefined || String(ans) === "") skipped.push(q);
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

  if (isSearching) return (
     <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F8FAFC] space-y-6">
        <Zap className="h-12 w-12 text-primary animate-pulse" />
        <p className="text-[10px] font-bold text-slate-300 tracking-tight">Syncing Analysis Registry...</p>
     </div>
  );

  if (errorNotFound) return (
     <div className="h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <Card className="max-w-md w-full bg-white rounded-[2rem] p-10 md:p-14 shadow-5xl border border-slate-100 space-y-10">
           <div className="h-20 w-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto text-rose-500 shadow-xl border border-rose-100">
              <AlertCircle className="h-10 w-10" />
           </div>
           <h2 className="text-2xl font-black text-[#0F172A]">Report Node Not Found</h2>
           <Button asChild className="w-full h-14 bg-[#0F172A] hover:bg-black text-white rounded-2xl font-bold"><Link href="/dashboard">Return to Dashboard</Link></Button>
        </Card>
     </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-left">
      <Navbar />
      <main className="container mx-auto max-w-[480px] px-4 py-6 space-y-6 pb-40">
        
        {activeSession && finalMetrics && (
           <div className="space-y-6 animate-in fade-in duration-500">
              <Card className="border-none shadow-sm rounded-[32px] bg-white p-6 space-y-6">
                 <div className="flex flex-col items-center gap-4">
                    <img src="/logo/cracklix-logo-dark.png" alt="Logo" className="h-14 w-auto object-contain" />
                    <div className="text-center space-y-1.5">
                       <h1 className="text-xl font-[800] text-[#071B4D] leading-tight">{activeSession.mockTitle}</h1>
                       <div className="flex flex-wrap justify-center items-center gap-2">
                          <Badge className="bg-primary/5 text-primary border-none text-[9px] font-bold px-3 py-1 rounded-full">Verified Attempt #{profile?.totalTests || 1}</Badge>
                       </div>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-50">
                    <HeaderMiniNode label="Date" val={new Date(activeSession.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} />
                    <HeaderMiniNode label="Duration" val={`${mockData?.duration || 120}m`} />
                    <HeaderMiniNode label="Candidates" val={totalCandidates.toLocaleString()} />
                 </div>
              </Card>

              <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
                  <div className="flex justify-center mb-6">
                     <TabsList className="bg-slate-100 p-1 rounded-2xl h-12 w-full flex items-center shadow-inner">
                        <TabsTrigger value="OVERVIEW" className="flex-1 rounded-xl font-bold text-[11px] h-full data-[state=active]:bg-white data-[state=active]:text-[#071B4D] transition-all">Overview</TabsTrigger>
                        <TabsTrigger value="REVIEW" className="flex-1 rounded-xl font-bold text-[11px] h-full data-[state=active]:bg-white data-[state=active]:text-[#071B4D] transition-all">Review</TabsTrigger>
                        <TabsTrigger value="REPORT" className="flex-1 rounded-xl font-bold text-[11px] h-full data-[state=active]:bg-white data-[state=active]:text-[#071B4D] transition-all">Report</TabsTrigger>
                     </TabsList>
                  </div>

                  <TabsContent value="OVERVIEW" className="space-y-6 m-0">
                      <ReportScreen 
                         {...activeSession} 
                         resultId={activeSession.id || activeSession.attemptId || "GUEST"}
                         studentName={activeSession.userName || profile?.name || "Aspirant"}
                         rank={liveRank} 
                         totalCandidates={totalCandidates}
                         timeTaken={formatTimeStr(activeSession.timeTaken)}
                         correct={activeSession.correctCount}
                         wrong={activeSession.wrongCount}
                         skipped={activeSession.skippedCount}
                         total={activeSession.totalQuestions}
                         date={new Date(activeSession.timestamp).toLocaleDateString('en-GB')}
                         percentile={finalMetrics.percentile}
                         score={finalMetrics.score.toFixed(2)}
                         accuracy={finalMetrics.percentage}
                         attemptAccuracy={finalMetrics.attemptAccuracy}
                         isQualified={finalMetrics.isQualified}
                         grade={finalMetrics.grade}
                         subjects={activeSession.subjectAnalysis}
                         duration={mockData?.duration}
                         boardId={activeSession?.boardId}
                         topScore={topScore}
                         avgScore={avgScore}
                         avgAccuracy={avgAccuracy}
                      />
                  </TabsContent>

                  <TabsContent value="REVIEW" className="space-y-4 m-0">
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl h-11 w-full shadow-inner mb-4 overflow-x-auto no-scrollbar">
                          <FilterButton active={activeReviewFilter === 'ALL'} label="All questions" onClick={() => setActiveReviewFilter('ALL')} />
                          <FilterButton active={activeReviewFilter === 'WRONG'} label={`Wrong (${reviewNodes.wrong.length})`} onClick={() => setActiveReviewFilter('WRONG')} color="rose" />
                          <FilterButton active={activeReviewFilter === 'CORRECT'} label="Correct" onClick={() => setActiveReviewFilter('CORRECT')} color="emerald" />
                      </div>
                      <div className="space-y-4 pt-2">
                          {filteredQuestions.map((q) => (
                              <Card key={q.id} className="border-none shadow-sm rounded-[24px] bg-white p-6 space-y-6">
                                  <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                                     <Badge variant="outline" className="px-3 py-1 rounded-lg border-slate-100 text-slate-400 font-bold text-[9px]">Question #{q.originalIndex + 1}</Badge>
                                     <Badge className="bg-primary/5 text-primary border-none text-[8px] font-bold">{q.subjectId || 'General'}</Badge>
                                  </div>
                                  <QuestionRenderer 
                                      question={q} 
                                      language={activeSession.languageMode || 'ENGLISH_PUNJABI'} 
                                      showSolution={true} 
                                      selectedAnswer={activeSession.answers?.[q.originalIndex] ?? activeSession.answers?.[String(q.originalIndex)]} 
                                      className="p-0 shadow-none border-none bg-transparent" 
                                  />
                              </Card>
                          ))}
                      </div>
                  </TabsContent>

                  <TabsContent value="REPORT" className="space-y-6 m-0">
                      <Card className="border-none shadow-lg rounded-[32px] bg-white p-6 text-center space-y-8">
                         <div className="space-y-2">
                            <h3 className="text-xl font-[800] text-[#071B4D]">Performance Report</h3>
                            <p className="text-sm text-slate-500 font-medium">Download your verified assessment certificate.</p>
                         </div>
                         <Button onClick={handleDownloadPDF} disabled={isExporting} className="w-full h-16 bg-[#071B4D] hover:bg-black text-white rounded-2xl shadow-xl font-bold gap-3">
                            {isExporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />} Download PDF Report
                         </Button>
                      </Card>
                  </TabsContent>
              </Tabs>

              <div className="flex gap-4">
                 <Button asChild variant="outline" className="flex-1 h-14 rounded-2xl border-slate-200 font-bold text-sm bg-white shadow-sm">
                    <Link href={`/mocks/instructions?id=${mockId}&retake=true`}>Retake Test</Link>
                 </Button>
                 <Button asChild className="flex-1 h-14 bg-primary hover:bg-blue-700 text-white rounded-2xl shadow-lg font-bold text-sm">
                    <Link href="/dashboard">Exit Hub</Link>
                 </Button>
              </div>
           </div>
        )}

        {/* HIDDEN PDF BUFFER - FIXED WIDTH 794px */}
        <div className="fixed left-[-9999px] top-0 pointer-events-none opacity-0">
          <div id="pdf-export-buffer" style={{ width: '794px', backgroundColor: '#ffffff' }}>
            {finalMetrics && activeSession && (
              <ReportPDF 
                 {...activeSession}
                 resultId={activeSession.id || activeSession.attemptId || "GUEST"}
                 studentName={activeSession.userName || profile?.name || "Aspirant"}
                 rank={liveRank} 
                 totalCandidates={totalCandidates}
                 timeTaken={formatTimeStr(activeSession.timeTaken)}
                 correct={activeSession.correctCount}
                 wrong={activeSession.wrongCount}
                 skipped={activeSession.skippedCount}
                 total={activeSession.totalQuestions}
                 date={new Date(activeSession.timestamp).toLocaleDateString('en-GB')}
                 percentile={finalMetrics.percentile}
                 score={finalMetrics.score.toFixed(2)}
                 accuracy={finalMetrics.percentage}
                 attemptAccuracy={finalMetrics.attemptAccuracy}
                 isQualified={finalMetrics.isQualified}
                 grade={finalMetrics.grade}
                 subjects={activeSession.subjectAnalysis}
                 duration={mockData?.duration}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function HeaderMiniNode({ label, val }: { label: string, val: string }) {
   return (
      <div className="text-center space-y-0.5">
         <p className="text-[8px] font-black text-slate-400 uppercase tracking-tight">{label}</p>
         <p className="text-[13px] font-bold text-[#071B4D] tabular-nums">{val}</p>
      </div>
   )
}

function FilterButton({ active, label, onClick, color = "primary" }: any) {
  return (
    <button onClick={onClick} className={cn("flex-1 px-4 h-full rounded-lg text-[10px] font-bold transition-all active:scale-95 whitespace-nowrap border border-transparent", active ? color === 'rose' ? "bg-rose-50 text-rose-600 shadow-sm" : color === 'emerald' ? "bg-emerald-50 text-emerald-600 shadow-sm" : "bg-white text-[#071B4D] shadow-sm" : "text-slate-400 hover:text-slate-600")}>
       {label}
    </button>
  )
}

function formatTimeStr(seconds: number) {
  if (!seconds || isNaN(seconds)) return "0m 0s";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${s}s`;
}
