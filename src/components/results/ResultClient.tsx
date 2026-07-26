
'use client';

import React, { useState, useMemo, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useFirestore, useDoc } from "@/firebase"
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
  getCountFromServer,
  serverTimestamp,
  increment,
  runTransaction
} from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { 
  Zap, 
  Loader2, 
  Download,
  RotateCcw,
  ChevronRight,
  AlertCircle,
  BarChart3,
  History,
  TrendingUp,
  Target,
  Award,
  Clock,
  BookOpen
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
import Link from "next/link"

/**
 * @fileOverview Institutional Result Hub v27.0.
 * FIXED: Reduced html2canvas scale to 2.0 to significantly optimize PDF export speed.
 * FIXED: Standardized Wrong terminology and shrunken sub-filter vertical spacing.
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
  const [previewScale, setPreviewScale] = useState(1);

  useEffect(() => { setMounted(true) }, [])

  const mockId = searchParams.get('id')
  const attemptIdFromUrl = searchParams?.get('attemptId')

  const activeSession = useMemo(() => user ? sessionData : guestResult, [user, sessionData, guestResult]);

  useEffect(() => {
    if (activeMainTab === 'REPORT') {
      const calculateScale = () => {
        if (typeof window === 'undefined') return;
        const screenWidth = window.innerWidth;
        const targetWidth = 794; 
        const padding = 2; 
        const available = screenWidth - padding;
        if (available < targetWidth) {
          setPreviewScale(available / targetWidth);
        } else {
          setPreviewScale(1);
        }
      };
      calculateScale();
      window.addEventListener('resize', calculateScale);
      return () => window.removeEventListener('resize', calculateScale);
    }
  }, [activeMainTab]);

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

  useEffect(() => {
     if (!db || !mockId || !activeSession) return;
     async function fetchRankingMetrics() {
        try {
           const entriesRef = collection(db, "leaderboards", mockId, "entries");
           const countSnap = await getCountFromServer(entriesRef);
           const displayTotal = countSnap.data().count;
           setTotalCandidates(displayTotal);
           
           const superiorQuery = query(entriesRef, where("highestScore", ">", activeSession.score));
           const superiorCountSnap = await getCountFromServer(superiorQuery);
           let superiorCount = superiorCountSnap.data().count;

           if (user) {
              const myEntryRef = doc(db, "leaderboards", mockId, "entries", user.uid);
              const myEntrySnap = await getDoc(myEntryRef);
              if (myEntrySnap.exists()) {
                 const myBest = myEntrySnap.data().highestScore;
                 if (myBest > activeSession.score) {
                    superiorCount = Math.max(0, superiorCount - 1);
                 }
              }
           }

           const calculatedRank = superiorCount + 1;
           setLiveRank(Math.max(1, Math.min(calculatedRank, displayTotal)));
        } catch (e) {}
     }
     fetchRankingMetrics();
  }, [db, mockId, activeSession, user]);

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
    const grade = activeSession.grade || "F";
    const isQualified = activeSession.isQualified || percentage >= 40;
    const percentile = totalCandidates > 1 ? Number(Math.max(0, ((totalCandidates - Number(liveRank)) / totalCandidates) * 100).toFixed(1)) : 100;
    return { score, maxMarks, percentage, attemptAccuracy, grade, isQualified, percentile };
  }, [activeSession, totalCandidates, liveRank]);

  const handleDownloadPDF = async () => {
    if (isExporting || !activeSession || !finalMetrics) return;
    setIsExporting(true);
    toast({ title: "Optimizing Download" });

    try {
      await document.fonts.ready;
      await new Promise(r => setTimeout(r, 500));

      const container = document.getElementById('pdf-report-container');
      if (!container) throw new Error("Capture Node Missing");

      const canvas = await html2canvas(container, {
        scale: 2, // Scale 2.0 provides excellent clarity with fast processing
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 794,
        windowWidth: 794
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.85); // JPEG is faster to embed
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      pdf.save(`Cracklix_Report_${activeSession.userName?.replace(/\s+/g, '_') || 'Student'}.pdf`);
      toast({ title: "Report Ready" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Export Error" });
    } finally { setIsExporting(false); }
  };

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

  const handleRetake = () => mockId && router.push(`/mocks/instructions?id=${mockId}`);

  if (userLoading || !mounted) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body">
      <Navbar />
      <main className="container mx-auto max-w-7xl px-0 md:px-8 py-6 md:py-12 space-y-4 md:space-y-10 pb-32">
        
        {!isSearching && !errorNotFound && activeSession && finalMetrics && (
           <div className="space-y-4 md:space-y-8 animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-4 md:px-0">
                 <div className="flex items-center gap-6 text-left w-full md:w-auto">
                    <AuthorityLogo boardId={activeSession?.boardId || "GENERAL"} size="sm" className="h-14 w-14 md:h-18 md:w-18 rounded-2xl shadow-xl bg-white" />
                    <div className="space-y-1 flex-1 min-w-0">
                       <h1 className="text-xl md:text-4xl font-black tracking-tight text-[#0F172A] truncate">
                         {activeSession?.mockTitle}
                       </h1>
                       <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] md:text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">Verified Attempt</Badge>
                    </div>
                 </div>
                 
                 <div className="flex gap-4 w-full md:w-auto">
                    <Button variant="outline" onClick={handleRetake} className="flex-1 h-14 px-8 rounded-2xl border-2 font-bold text-[11px] uppercase tracking-widest bg-white">Retake</Button>
                    <Button onClick={handleDownloadPDF} disabled={isExporting} className="flex-[2] h-14 px-10 bg-[#0F172A] hover:bg-black text-white rounded-2xl shadow-2xl font-bold text-[11px] uppercase tracking-widest">
                       {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 mr-2" />} Download PDF
                    </Button>
                 </div>
              </div>

              <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
                  <div className="py-1.5 -mx-4 px-4 border-b border-slate-100 bg-transparent">
                     <div className="flex justify-center w-full max-w-2xl mx-auto">
                        <TabsList className="bg-white border border-slate-100 p-1 rounded-2xl shadow-xl h-14 md:h-16 w-full flex items-center overflow-x-auto no-scrollbar">
                           <TabsTrigger value="OVERVIEW" className="flex-1 rounded-xl px-6 md:px-12 font-bold text-[10px] md:text-[11px] h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Analysis</TabsTrigger>
                           <TabsTrigger value="REVIEW" className="flex-1 rounded-xl px-6 md:px-12 font-bold text-[10px] md:text-[11px] h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Review</TabsTrigger>
                           <TabsTrigger value="REPORT" className="flex-1 rounded-xl px-6 md:px-12 font-bold text-[10px] md:text-[11px] h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Report</TabsTrigger>
                        </TabsList>
                     </div>
                  </div>

                  <TabsContent value="OVERVIEW" className="px-0 pt-4">
                      <ReportScreen 
                         {...activeSession} 
                         resultId={activeSession.id || activeSession.attemptId || "REF-GUEST"}
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
                         attemptRate={activeSession.attemptRate}
                         isQualified={finalMetrics.isQualified}
                         grade={finalMetrics.grade}
                         subjects={activeSession.subjectAnalysis}
                         duration={mockData?.duration}
                         boardId={activeSession?.boardId}
                      />
                  </TabsContent>

                  <TabsContent value="REVIEW" className="space-y-4 max-w-5xl mx-auto px-4 pt-2">
                      <div className="py-1 -mx-4 px-4 mb-2 bg-transparent">
                         <div className="flex items-center gap-1 bg-white p-1 rounded-2xl shadow-lg border border-slate-100 w-full max-w-2xl mx-auto h-12 md:h-14">
                             <FilterButton active={activeReviewFilter === 'ALL'} label="All Questions" onClick={() => setActiveReviewFilter('ALL')} />
                             <FilterButton active={activeReviewFilter === 'WRONG'} label={`Wrong (${reviewNodes.wrong.length})`} onClick={() => setActiveReviewFilter('WRONG')} color="rose" />
                             <FilterButton active={activeReviewFilter === 'CORRECT'} label="Correct" onClick={() => setActiveReviewFilter('CORRECT')} color="emerald" />
                         </div>
                      </div>
                      
                      <div className="space-y-6 md:space-y-8">
                          {filteredQuestions.map((q) => (
                              <Card key={q.id} className="border border-slate-100 shadow-xl rounded-[2.5rem] md:rounded-[3rem] overflow-hidden bg-white text-left">
                                  <div className="p-8 md:p-12 space-y-6 md:space-y-8">
                                      <div className="flex items-center justify-between">
                                         <Badge variant="outline" className="px-3 py-1 rounded-xl border-slate-200 text-slate-400 font-bold text-[9px]">
                                             Question #{q.originalIndex + 1}
                                         </Badge>
                                         <Badge className="bg-primary/5 text-primary border-none text-[8px] font-bold">{q.subjectId || 'General Hub'}</Badge>
                                      </div>
                                      <QuestionRenderer 
                                          question={q} 
                                          language={activeSession.languageMode || 'ENGLISH_PUNJABI'} 
                                          showSolution={true} 
                                          selectedAnswer={activeSession.answers?.[q.originalIndex] ?? activeSession.answers?.[String(q.originalIndex)]} 
                                          className="p-0 shadow-none border-none bg-transparent" 
                                      />
                                  </div>
                              </Card>
                          ))}
                      </div>
                  </TabsContent>

                  <TabsContent value="REPORT" className="px-0 pb-40 pt-4 flex flex-col items-center">
                      <div 
                        style={{ 
                          width: '794px',
                          transform: `scale(${previewScale})`,
                          transformOrigin: 'top center',
                          marginBottom: `${(1123 * previewScale) - 1123}px`
                        }}
                        className="bg-white p-0 shadow-4xl border border-slate-200 origin-top rounded-lg overflow-hidden"
                      >
                         <ReportPDF 
                            {...activeSession}
                            resultId={activeSession.id || activeSession.attemptId || "REF-GUEST"}
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
                      </div>
                  </TabsContent>
              </Tabs>
           </div>
        )}

        {/* HIDDEN CAPTURE NODE */}
        <div className="fixed left-[-9999px] top-0 pointer-events-none opacity-0">
          <div id="pdf-report-container">
            {finalMetrics && activeSession && (
              <ReportPDF 
                 {...activeSession}
                 resultId={activeSession.id || activeSession.attemptId || "REF-GUEST"}
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

function FilterButton({ active, label, onClick, color = "primary" }: any) {
  return (
    <button onClick={onClick} className={cn("flex-1 px-3 h-full rounded-xl text-[9px] md:text-[11px] font-bold transition-all active:scale-95 whitespace-nowrap border border-transparent", active ? color === 'rose' ? "bg-rose-600 text-white shadow-xl" : color === 'emerald' ? "bg-emerald-600 text-white shadow-xl" : "bg-[#0F172A] text-white shadow-xl" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50")}>
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
