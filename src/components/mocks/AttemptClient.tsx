'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { 
  doc, 
  getDoc, 
  serverTimestamp, 
  collection, 
  query, 
  where, 
  documentId, 
  getDocs, 
  setDoc, 
  increment
} from "firebase/firestore";
import { useExamStore } from "@/store/useExamStore";
import ExamHeader from "@/components/exam/ExamHeader";
import TacticalFooter from "@/components/exam/TacticalFooter";
import AntiCheat from "@/components/exam/AntiCheat";
import QuestionRenderer from "@/components/questions/QuestionRenderer";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import QuestionPalette from "@/components/mocks/QuestionPalette";
import SubjectTabs from "@/components/exam/SubjectTabs";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, AlertCircle, Play, ChevronRight, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useActiveSession } from "@/hooks/useStudyAnalytics";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { nanoid } from "nanoid";

/**
 * @fileOverview Official Attempt Hub v112.1 [Reference Fix].
 * FIXED: Added missing ShieldCheck import.
 */

export default function AttemptClient({ mockId: propMockId }: { mockId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const db = useFirestore();
  const { user, profile, loading: userLoading } = useUser();
  const { toast } = useToast();

  const mockId = useMemo(() => {
    if (propMockId) return propMockId;
    return searchParams?.get('id') || null;
  }, [searchParams, propMockId]);

  const isRetakeRequested = searchParams?.get('retake') === 'true';

  const { startSession, stopSession } = useActiveSession('MOCK', mockId || undefined);

  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
  const [mockData, setMockData] = useState<any>(null);

  const loadStarted = useRef(false);

  const {
    initExam,
    attemptId: storeAttemptId,
    tick,
    isPaused,
    setPaused,
    currentIdx,
    questions,
    answers,
    setAnswer,
    language,
    timeLeft,
    elapsedSeconds,
    setCurrentIdx,
    resetStore,
  } = useExamStore();

  const loadExam = useCallback(async () => {
    if (!db || !mockId || userLoading || loadStarted.current) return;
    loadStarted.current = true;
    
    try {
      setIsInitializing(true);
      setInitError(null);
      
      const mockRef = doc(db, "mocks", mockId);
      const dailyRef = doc(db, "daily_quizzes", mockId);
      
      const mSnap = await getDoc(mockRef);
      let targetSnap = mSnap;
      if (!mSnap.exists()) {
        targetSnap = await getDoc(dailyRef);
      }
      
      if (!targetSnap.exists()) throw new Error("Test registry node not found.");
      
      const mData = targetSnap.data();
      setMockData(mData);

      const questionIds: string[] = mData.questionIds || [];
      if (questionIds.length === 0) throw new Error("This test series has no questions.");
      
      const chunks = [];
      for (let i = 0; i < questionIds.length; i += 30) { chunks.push(questionIds.slice(i, i + 30)); }
      
      const chunkPromises = chunks.map(async (chunk) => {
        const [mcqSnap, usedSnap, legacySnap] = await Promise.all([
          getDocs(query(collection(db, "mcqBank"), where(documentId(), "in", chunk))),
          getDocs(query(collection(db, "usedQuestions"), where(documentId(), "in", chunk))),
          getDocs(query(collection(db, "questions"), where(documentId(), "in", chunk)))
        ]);
        
        const local: any[] = [];
        mcqSnap.docs.forEach(d => local.push({ ...d.data(), id: d.id }));
        usedSnap.forEach(d => { if (!local.find(f => f.id === d.id)) local.push({ ...d.data(), id: d.id }); });
        legacySnap.forEach(d => { if (!local.find(f => f.id === d.id)) local.push({ ...d.data(), id: d.id }); });
        return local;
      });

      const allFetched = (await Promise.all(chunkPromises)).flat();
      const finalQuestions = questionIds.map(id => allFetched.find(fq => fq.id === id)).filter(Boolean);
      
      if (finalQuestions.length === 0) throw new Error("Data integrity error: Questions missing.");

      let resumeData = null;
      if (user && !isRetakeRequested) {
         const attemptSnap = await getDoc(doc(db, "attempts", `${user.uid}_${mockId}`));
         if (attemptSnap.exists() && attemptSnap.data().status === 'IN_PROGRESS') {
           resumeData = attemptSnap.data();
         }
      }

      initExam(mockId, mData.title, user?.uid || null, finalQuestions, mData.duration || 120, resumeData, mData.languageMode, isRetakeRequested);
      
      if (user) {
         setDoc(doc(db, "attempts", `${user.uid}_${mockId}`), {
            mockId,
            status: 'IN_PROGRESS',
            updatedAt: serverTimestamp()
         }, { merge: true });
      }

      startSession(); 
      setIsInitializing(false);
    } catch (err: any) { 
      setInitError(err.message); 
      setIsInitializing(false);
      loadStarted.current = false;
    }
  }, [db, mockId, user, userLoading, initExam, startSession, isRetakeRequested]);

  useEffect(() => {
    if (!mockId || userLoading || loadStarted.current) return;
    loadExam();
  }, [mockId, userLoading, loadExam]);

  useEffect(() => {
    if (isInitializing || initError) return;
    const interval = setInterval(() => { tick(); }, 1000);
    return () => clearInterval(interval);
  }, [isInitializing, initError, tick]);

  const handleSubmitFinal = useCallback(async () => {
    if (!db || isSubmittingFinal || !mockData || !mockId) return;
    
    const finalAttemptId = storeAttemptId || `at_${nanoid(12)}`;
    setShowSubmitModal(false);
    setIsSubmittingFinal(true);
    
    let correctCount = 0; 
    let wrongCount = 0;
    const totalQuestions = questions.length;
    const studentAnswers = answers || {};
    const attemptedCount = Object.keys(studentAnswers).length;

    const posMarks = Number(mockData.positiveMarks) || 1;
    const negMarks = Number(mockData.negativeMarks) || 0.25;

    const subjectMap: Record<string, any> = {};
    const complexityMap: Record<string, any> = { 
      easy: { name: 'Easy', total: 0, correct: 0, wrong: 0, score: 0 }, 
      medium: { name: 'Medium', total: 0, correct: 0, wrong: 0, score: 0 }, 
      hard: { name: 'Hard', total: 0, correct: 0, wrong: 0, score: 0 },
      expert: { name: 'Expert', total: 0, correct: 0, wrong: 0, score: 0 }
    };

    questions.forEach((q: any, idx: number) => {
      const studentAnsIdx = studentAnswers[idx];
      const correctKey = (q.correctAnswer || "A").trim().toUpperCase();
      const correctOptIdx = ['A', 'B', 'C', 'D'].indexOf(correctKey);
      
      const isAttempted = studentAnsIdx !== undefined && studentAnsIdx !== null;
      const isCorrect = isAttempted && Number(studentAnsIdx) === correctOptIdx;

      const sId = q.subjectId || 'General';
      if (!subjectMap[sId]) subjectMap[sId] = { name: sId, total: 0, correct: 0, wrong: 0, score: 0 };
      subjectMap[sId].total++;
      
      const dKey = (q.difficulty || 'Medium').toLowerCase();
      if (complexityMap[dKey]) complexityMap[dKey].total++;

      if (isCorrect) { 
        correctCount++; 
        subjectMap[sId].correct++; 
        subjectMap[sId].score += posMarks; 
        if (complexityMap[dKey]) complexityMap[dKey].correct++;
      } else if (isAttempted) { 
        wrongCount++; 
        subjectMap[sId].wrong++;
        subjectMap[sId].score -= negMarks; 
        if (complexityMap[dKey]) complexityMap[dKey].wrong++;
      }
    });

    const score = Number(parseFloat(((correctCount * posMarks) - (wrongCount * negMarks)).toFixed(2)));
    const maxMarks = totalQuestions * posMarks;
    const percentage = Number(((score / (maxMarks || 1)) * 100).toFixed(1));
    const timeTaken = Math.max(1, elapsedSeconds);
    const attemptAccuracy = attemptedCount > 0 ? Number(((correctCount / attemptedCount) * 100).toFixed(1)) : 0;
    
    const resultPayload = {
       id: finalAttemptId,
       attemptId: finalAttemptId, 
       mockId, 
       mockTitle: mockData.title, 
       userId: user?.uid || "guest",
       userName: profile?.name || 'Aspirant', 
       userEmail: user?.email || "", 
       score, 
       maxMarks, 
       percentage, 
       correctCount, 
       wrongCount, 
       skippedCount: totalQuestions - attemptedCount, 
       attemptedCount, 
       totalQuestions,
       attemptAccuracy, 
       accuracy: attemptAccuracy,
       timeTaken, 
       timestamp: new Date().toISOString(), 
       updatedAt: serverTimestamp(),
       createdAt: serverTimestamp(), 
       languageMode: language,
       subjectAnalysis: Object.values(subjectMap).map((s: any) => ({ ...s, accuracy: Math.round((s.correct / (s.total || 1)) * 100) })),
       complexityAnalysis: Object.values(complexityMap).map((d: any) => ({ ...d, accuracy: Math.round((d.correct / (d.total || 1)) * 100) })),
       answers: studentAnswers 
    };

    if (user) {
      try {
        const resultRef = doc(db, "results", finalAttemptId);
        const attemptPtrRef = doc(db, "attempts", `${user.uid}_${mockId}`);
        const lbEntryRef = doc(db, "leaderboards", mockId, "entries", user.uid);
        const globalMeritRef = doc(db, "leaderboard", user.uid);
        const statsRef = doc(db, "settings", "stats");

        await Promise.all([
           setDoc(resultRef, resultPayload),
           setDoc(attemptPtrRef, { attemptId: finalAttemptId, status: 'COMPLETED', updatedAt: serverTimestamp() }, { merge: true }),
           setDoc(lbEntryRef, { 
              userId: user.uid, 
              userName: profile?.name || 'Aspirant', 
              highestScore: score, 
              accuracy: attemptAccuracy, 
              timeTaken, 
              submittedAt: serverTimestamp(),
              updatedAt: serverTimestamp()
           }, { merge: true }),
           setDoc(globalMeritRef, { 
              uid: user.uid, 
              displayName: profile?.name || 'Aspirant', 
              totalTests: increment(1), 
              highestScore: score,
              updatedAt: serverTimestamp(), 
              recentMockTitle: mockData.title 
           }, { merge: true }),
           updateDoc(statsRef, { 
              totalAttempts: increment(1), 
              updatedAt: serverTimestamp() 
           }).catch(() => {}) 
        ]);

        stopSession({ completedQuestions: attemptedCount, correct: correctCount, wrong: wrongCount });
      } catch (e: any) {
         toast({ variant: "destructive", title: "Sync failure", description: "Audit node lost connection." });
         setIsSubmittingFinal(false);
         return;
      }
    } else {
       localStorage.setItem(`cracklix_guest_result_${finalAttemptId}`, JSON.stringify({ ...resultPayload, isGuestNode: true }));
    }

    router.replace(`/results/view?id=${mockId}&attemptId=${finalAttemptId}`);
    setTimeout(() => resetStore(), 1000);
  }, [db, user, profile, isSubmittingFinal, questions, answers, router, mockId, mockData, elapsedSeconds, stopSession, storeAttemptId, resetStore, language, toast]);

  if (isInitializing || isSubmittingFinal) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B1528] space-y-8 z-[2000] fixed inset-0">
       <div className="relative">
          <Zap className="h-12 w-12 text-primary animate-pulse" />
          <Loader2 className="absolute -bottom-2 -right-2 h-6 w-6 text-blue-500 animate-spin" />
       </div>
       <div className="text-center space-y-2 px-6">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">
             {isSubmittingFinal ? "Finalizing report" : "Synchronizing test hub"}
          </p>
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
             {isSubmittingFinal ? "Generating analysis" : "Loading verified patterns"}
          </p>
       </div>
    </div>
  );

  if (initError) return (
     <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6">
        <AlertCircle className="h-16 w-16 text-rose-500" />
        <h2 className="text-2xl font-black text-[#0F172A]">Initialization failed</h2>
        <p className="text-slate-500">{initError}</p>
        <Button onClick={() => window.location.reload()} className="rounded-xl h-12 px-8">Retry sync</Button>
     </div>
  );

  return (
    <div className="flex flex-col h-screen bg-white font-body select-none overflow-hidden relative">
      <AntiCheat />
      <ExamHeader onPaletteToggle={() => setIsPaletteOpen(true)} onExitRequest={() => setShowExitModal(true)} />
      <main className="flex-1 flex flex-col min-h-0 bg-slate-50/50 relative overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
          <div className="w-full bg-white"><div className="max-w-4xl mx-auto"><SubjectTabs /></div></div>
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-10 pt-4 pb-12 w-full">
            <div className="max-w-4xl mx-auto">
              {questions.length > 0 && questions[currentIdx] ? (
                <motion.div key={currentIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="w-full">
                  <QuestionRenderer 
                    language={language} 
                    question={{...questions[currentIdx], displayId: (currentIdx + 1).toString()}} 
                    selectedAnswer={answers?.[currentIdx] ?? null} 
                    onSelect={(idx: number) => !isSubmittingFinal && setAnswer(currentIdx, idx, db)} 
                    className="shadow-md border-none p-6 md:p-12 rounded-[2.5rem]" 
                  />
                </motion.div>
              ) : <div className="py-20 text-center opacity-20"><Loader2 className="h-10 w-10 mx-auto mb-4 animate-spin text-primary" /></div>}
            </div>
          </div>
        </div>
        <TacticalFooter onSubmit={() => !isSubmittingFinal && setShowSubmitModal(true)} />
      </main>

      <Sheet open={isPaletteOpen} onOpenChange={setIsPaletteOpen}>
        <SheetContent side="right" className="p-0 border-none w-[320px] shadow-5xl z-[1200] [&>button]:hidden">
          <QuestionPalette onSelect={(idx: number) => { setCurrentIdx(idx); setIsPaletteOpen(false); }} onSubmit={() => { setIsPaletteOpen(false); setShowSubmitModal(true); }} />
        </SheetContent>
      </Sheet>

      <Dialog open={showSubmitModal} onOpenChange={!isSubmittingFinal ? setShowSubmitModal : undefined}>
        <DialogContent className="w-[90%] max-w-[420px] rounded-[24px] p-8 bg-[#0F172A] text-white text-center shadow-2xl z-[1300] border-none">
          <div className="flex flex-col items-center justify-center text-center">
            <ShieldCheck className="h-16 w-16 text-primary mb-6" />
            <DialogHeader className="text-center w-full">
              <DialogTitle className="text-white font-black text-3xl text-center">Submit test</DialogTitle>
              <DialogDescription className="text-slate-400 mt-2 text-center w-full uppercase tracking-widest text-[10px] font-bold">Finish attempt and generate report</DialogDescription>
            </DialogHeader>
            <div className="w-full flex flex-col gap-3 mt-8">
              <Button onClick={handleSubmitFinal} disabled={isSubmittingFinal} className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-xl border-none flex items-center justify-center uppercase tracking-widest text-[11px]">Finish attempt</Button>
              <Button variant="ghost" onClick={() => setShowSubmitModal(false)} disabled={isSubmittingFinal} className="w-full h-12 text-slate-400 hover:text-white font-bold flex items-center justify-center uppercase tracking-widest text-[10px]">Return to test</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
