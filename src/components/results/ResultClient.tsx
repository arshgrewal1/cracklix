
'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase"
import { 
  collection, 
  query, 
  doc, 
  getDoc, 
  documentId, 
  getDocs, 
  where,
  limit,
  orderBy,
  getCountFromServer
} from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { 
  Zap, 
  Loader2, 
  ShieldCheck,
  Download,
  RotateCcw,
  ChevronRight,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Target,
  Award
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useExamStore } from "@/store/useExamStore"
import { AuthorityLogo } from "@/lib/exam-icons"
import ReportScreen from "./ReportScreen"
import ReportPDF from "./ReportPDF"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import { Card } from "@/components/ui/card"

/**
 * @fileOverview Institutional Result System v10.0 [Hardened PDF Engine].
 * FIXED: Separated PDF layout from Screen layout to resolve all overlapping and scaling issues.
 * FIXED: Implemented multi-page support and layout validation protocol.
 */

export default function ResultClient() {
  const db = useFirestore()
  const { user, profile, loading: userLoading } = useUser()
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
  const [activeMainTab, setActiveMainTab] = useState<string>("OVERVIEW")
  const [isExporting, setIsExporting] = useState(false)
  
  const [sessionData, setSessionData] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(true);
  const [errorNotFound, setErrorNotFound] = useState(false);
  
  const [liveRank, setLiveRank] = useState<number | string>("---")
  const [totalCandidates, setTotalCandidates] = useState<number>(0)
  const [topperScore, setTopperScore] = useState<number>(0)
  const [avgScore, setAvgScore] = useState<number>(0)

  useEffect(() => { setMounted(true) }, [])

  const mockId = searchParams.get('id')
  const attemptIdFromUrl = searchParams?.get('attemptId')

  const activeSession = useMemo(() => user ? sessionData : guestResult, [user, sessionData, guestResult]);

  // 1. Resolve Identity Hub
  useEffect(() => {
    if (userLoading || !db || !mockId || !mounted) return;
    
    async function resolveId() {
       setIsSearching(true);
       setErrorNotFound(false);

       if (!user) {
          const guestRes = localStorage.getItem(`cracklix_guest_result_${mockId}`);
          if (guestRes) { setGuestResult(JSON.parse(guestRes)); setIsSearching(false); }
          else { setErrorNotFound(true); setIsSearching(false); }
          return;
       }

       const targetId = attemptIdFromUrl ? `${user.uid}_${mockId}_${attemptIdFromUrl}` : `${user.uid}_${mockId}`;
       
       try {
          const docRef = doc(db, "results", targetId);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
             setSessionData({ ...snap.data(), id: snap.id });
             setIsSearching(false);
             return;
          }
          const resQuery = query(collection(db, "results"), where("userId", "==", user.uid), where("mockId", "==", mockId), limit(5));
          const querySnap = await getDocs(resQuery);
          if (!querySnap.empty) {
             const resultsList = querySnap.docs.map(d => ({ ...d.data(), id: d.id }));
             setSessionData(resultsList.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]);
             setIsSearching(false);
             return;
          }
          setErrorNotFound(true);
       } catch (e) { setErrorNotFound(true); } finally { setIsSearching(false); }
    }
    resolveId();
  }, [user, userLoading, db, mockId, attemptIdFromUrl, mounted]);

  // 2. Fetch Ranking Metrics
  useEffect(() => {
     if (!db || !mockId || !activeSession) return;
     async function fetchRankingMetrics() {
        try {
           const entriesRef = collection(db, "leaderboards", mockId, "entries");
           const countSnap = await getCountFromServer(entriesRef);
           const total = countSnap.data().count;
           setTotalCandidates(total);
           
           const superiorQuery = query(entriesRef, where("highestScore", ">", activeSession.score));
           const superiorCountSnap = await getCountFromServer(superiorQuery);
           let rankValue = superiorCountSnap.data().count + 1;
           if (user) {
              const myEntryRef = doc(db, "leaderboards", mockId, "entries", user.uid);
              const myEntrySnap = await getDoc(myEntryRef);
              if (myEntrySnap.exists() && myEntrySnap.data().highestScore > activeSession.score) rankValue = Math.max(1, rankValue - 1);
           }
           setLiveRank(Math.min(rankValue, total > 0 ? total : 1));
           const topperQuery = query(entriesRef, orderBy("highestScore", "desc"), limit(1));
           const topperSnap = await getDocs(topperQuery);
           if (!topperSnap.empty) setTopperScore(topperSnap.docs[0].data().highestScore);
        } catch (e) {}
     }
     fetchRankingMetrics();
  }, [db, mockId, activeSession, user]);

  // 3. Question Retrieval
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
    const attemptAccuracy = Number(activeSession.attemptAccuracy) || 0;
    const overallAccuracy = Number(activeSession.overallAccuracy) || 0;
    const attemptRate = Number(activeSession.attemptRate) || 0;
    const grade = activeSession.grade || "F";
    const isQualified = activeSession.isQualified || percentage >= 40;
    const percentile = totalCandidates > 1 ? Number(Math.max(0, ((totalCandidates - Number(liveRank)) / totalCandidates) * 100).toFixed(1)) : 100;
    return { score, maxMarks, percentage, attemptAccuracy, overallAccuracy, attemptRate, grade, isQualified, percentile, topperGap: Math.max(0, topperScore - score) };
  }, [activeSession, totalCandidates, liveRank, topperScore]);

  // 4. HARDENED EXPORT ENGINE
  const handleDownloadPDF = async () => {
    if (isExporting || !activeSession || !finalMetrics) return;
    setIsExporting(true);
    toast({ title: "Verifying report layout..." });

    try {
      // a. Handshake
      await document.fonts.ready;
      await new Promise(r => setTimeout(r, 1000));

      const container = document.getElementById('pdf-report-container');
      if (!container) throw new Error("Registry Match Failure.");

      // b. Audit Logic
      const checkMissingImages = () => {
        const imgs = container.querySelectorAll('img');
        for (let img of Array.from(imgs)) {
          if (!img.complete || img.naturalWidth === 0) return true;
        }
        return false;
      };

      if (checkMissingImages()) {
        toast({ variant: "destructive", title: "Assets Pending", description: "Wait for images to load and retry." });
        setIsExporting(false);
        return;
      }

      // c. High-Resolution Capture
      const canvas = await html2canvas(container, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 794,
        windowWidth: 794
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // d. Multi-page support
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = 297;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      pdf.save(`Cracklix_Report_${activeSession.userName || 'Student'}.pdf`);
      toast({ title: "Official Report Exported" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Export Interrupted", description: "Check connectivity and retry." });
    } finally { setIsExporting(false); }
  };

  const handleRetake = () => mockId && router.push(`/mocks/instructions?id=${mockId}`);

  const reviewNodes = useMemo(() => {
    if (!activeSession || !questions.length) return { all: [], correct: [], wrong: [], skipped: [] };
    const all = questions.map((q, i) => ({ ...q, originalIndex: i }));
    const correct: any[] = [], wrong: any[] = [], skipped: any[] = [];
    all.forEach((q) => {
      const ans = activeSession.answers?.[q.originalIndex] ?? activeSession.answers?.[String(q.originalIndex)];
      const isAttempted = ans !== null && ans !== undefined && String(ans) !== "";
      if (!isAttempted) skipped.push(q);
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

  if (userLoading || !mounted) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body">
      <Navbar />
      <main className="container mx-auto max-w-[1440px] px-4 md:px-10 py-6 md:py-10 space-y-8 pb-32">
        
        {!isSearching && !errorNotFound && activeSession && finalMetrics && (
           <>
              {/* TOP ACTIONS */}
              <div className="flex flex-col lg:flex-row justify-between items-center gap-6 px-1">
                 <div className="flex items-center gap-4 md:gap-8 w-full lg:w-auto">
                    <AuthorityLogo boardId={activeSession?.boardId || "GENERAL"} size="md" className="h-12 w-12 md:h-16 md:w-16 rounded-xl shadow-lg bg-white border-2 border-slate-50" />
                    <div className="space-y-1 flex-1 min-w-0">
                       <Badge className={cn("border-none text-[8px] font-bold px-2 py-0.5 rounded-full shadow-sm", finalMetrics?.isQualified ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                          {finalMetrics?.isQualified ? "Qualified" : "Attempted"}
                       </Badge>
                       <h1 className="text-sm md:text-2xl font-bold tracking-tight text-[#0F172A] truncate">
                         {activeSession?.mockTitle}
                       </h1>
                    </div>
                 </div>
                 
                 <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="bg-white border border-slate-100 p-1 rounded-xl shadow-sm">
                       <TabsList className="bg-transparent border-none h-10 flex gap-1">
                          <TabsTrigger value="OVERVIEW" className="flex-1 rounded-lg px-6 font-bold text-[10px] md:text-[11px] data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Overview</TabsTrigger>
                          <TabsTrigger value="REVIEW" className="flex-1 rounded-lg px-6 font-bold text-[10px] md:text-[11px] data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Review</TabsTrigger>
                          <TabsTrigger value="REPORT" className="flex-1 rounded-lg px-6 font-bold text-[10px] md:text-[11px] data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Report</TabsTrigger>
                       </TabsList>
                    </Tabs>
                    <div className="flex gap-2">
                       <Button variant="outline" onClick={handleRetake} className="flex-1 h-12 px-6 rounded-xl border-2 font-bold text-[10px] uppercase tracking-tight"><RotateCcw className="h-3 w-3 mr-2" /> Retake</Button>
                       <Button onClick={handleDownloadPDF} disabled={isExporting} className="flex-1 h-12 px-6 bg-primary text-white rounded-xl shadow-lg font-bold text-[10px] uppercase tracking-tight">
                          {isExporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3 mr-2" />} PDF
                       </Button>
                    </div>
                 </div>
              </div>

              {/* MAIN CONTENT */}
              <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
                  <TabsContent value="OVERVIEW" className="animate-in fade-in duration-500">
                      <ReportScreen 
                         {...activeSession} 
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
                         accuracy={finalMetrics.overallAccuracy}
                         attemptAccuracy={finalMetrics.attemptAccuracy}
                         attemptRate={finalMetrics.attemptRate}
                         isQualified={finalMetrics.isQualified}
                         grade={finalMetrics.grade}
                         subjects={activeSession.subjectAnalysis}
                         duration={mockData?.duration}
                      />
                  </TabsContent>

                  <TabsContent value="REVIEW" className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
                      <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-md border border-slate-100 w-fit mx-auto">
                          <FilterButton active={activeReviewFilter === 'ALL'} label="All" onClick={() => setActiveReviewFilter('ALL')} />
                          <FilterButton active={activeReviewFilter === 'WRONG'} label={`Wrong (${reviewNodes.wrong.length})`} onClick={() => setActiveReviewFilter('WRONG')} color="rose" />
                          <FilterButton active={activeReviewFilter === 'CORRECT'} label="Correct" onClick={() => setActiveReviewFilter('CORRECT')} color="emerald" />
                          <FilterButton active={activeReviewFilter === 'SKIPPED'} label="Skipped" onClick={() => setActiveReviewFilter('SKIPPED')} color="slate" />
                      </div>
                      <div className="space-y-6">
                          {filteredQuestions.map((q) => (
                              <Card key={q.id} className="border border-slate-100 shadow-lg rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-white text-left">
                                  <div className="p-6 md:p-10 space-y-6">
                                      <Badge variant="outline" className="px-3 py-0.5 rounded-lg border-slate-200 text-slate-400 font-bold text-[8px]">
                                          Question #{q.originalIndex + 1}
                                      </Badge>
                                      <QuestionRenderer 
                                          question={q} 
                                          language={activeSession.languageMode || 'ENGLISH_PUNJABI'} 
                                          showSolution={true} 
                                          selectedAnswer={activeSession.answers?.[q.originalIndex]} 
                                          className="p-0 shadow-none border-none bg-transparent" 
                                      />
                                  </div>
                              </Card>
                          ))}
                      </div>
                  </TabsContent>

                  <TabsContent value="REPORT" className="animate-in zoom-in-95 duration-700 overflow-x-auto no-scrollbar pb-20">
                      <div className="flex flex-col items-center pt-10">
                         <div className="bg-white p-0 shadow-5xl border border-slate-200 overflow-hidden w-full max-w-[210mm]">
                            <ReportPDF 
                               {...activeSession}
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
                               accuracy={finalMetrics.overallAccuracy}
                               attemptAccuracy={finalMetrics.attemptAccuracy}
                               attemptRate={finalMetrics.attemptRate}
                               isQualified={finalMetrics.isQualified}
                               grade={finalMetrics.grade}
                               subjects={activeSession.subjectAnalysis}
                               duration={mockData?.duration}
                            />
                         </div>
                      </div>
                  </TabsContent>
              </Tabs>
           </>
        )}

        {/* HIDDEN EXPORT NODE ( LOCKED TO 794PX ) */}
        <div className="fixed left-[-9999px] top-0 pointer-events-none opacity-0">
          <div id="pdf-report-container">
            {finalMetrics && activeSession && (
              <ReportPDF 
                 {...activeSession}
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
                 accuracy={finalMetrics.overallAccuracy}
                 attemptAccuracy={finalMetrics.attemptAccuracy}
                 attemptRate={finalMetrics.attemptRate}
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

function StatCard({ label, val, sub, icon, highlight }: any) {
  return (
    <Card className={cn("border border-slate-100 shadow-sm bg-white p-4 md:p-6 rounded-xl md:rounded-[1.5rem] text-left relative overflow-hidden h-full flex flex-col justify-center transition-all hover:translate-y-[-1px]", highlight && "ring-4 ring-primary/5 border-primary/10")}>
       <div className="absolute top-0 right-0 p-2 opacity-5">{icon}</div>
       <div className="space-y-0.5 relative z-10">
          <p className="text-[7px] md:text-[8px] font-bold text-slate-400 mb-0.5 uppercase tracking-tighter">{label}</p>
          <p className={cn("text-xs md:text-xl font-black tabular-nums tracking-tighter leading-none", highlight && "text-primary")}>{val}</p>
          {sub && <p className="text-[6px] md:text-[8px] font-bold text-slate-300 mt-1 uppercase tracking-widest">{sub}</p>}
       </div>
    </Card>
  )
}

function FilterButton({ active, label, onClick, color = "primary" }: any) {
  return (
    <button onClick={onClick} className={cn("px-4 md:px-6 py-2 rounded-lg text-[8px] md:text-[9px] font-black tracking-tight transition-all active:scale-95 whitespace-nowrap border border-transparent uppercase tracking-widest", active ? color === 'rose' ? "bg-rose-600 text-white shadow-lg" : color === 'emerald' ? "bg-emerald-600 text-white shadow-lg" : "bg-[#0F172A] text-white shadow-lg" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50")}>
       {label}
    </button>
  )
}

function formatTimeStr(seconds: number) {
  if (!seconds || isNaN(seconds)) return "0m 0s";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}
