'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { doc, getDoc, serverTimestamp, collection, query, where, documentId, getDocs, setDoc, updateDoc, increment } from "firebase/firestore";
import { useExamStore } from "@/store/useExamStore";
import ExamHeader from "@/components/exam/ExamHeader";
import TacticalFooter from "@/components/exam/TacticalFooter";
import AntiCheat from "@/components/exam/AntiCheat";
import QuestionRenderer from "@/components/questions/QuestionRenderer";
import QuestionPalette from "@/components/mocks/QuestionPalette";
import SubjectTabs from "@/components/exam/SubjectTabs";
import { Button } from "@/components/ui/button";
import { Loader2, Play, ShieldCheck, Zap, AlertCircle, Save, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { useActiveSession } from "@/hooks/useStudyAnalytics";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { nanoid } from "nanoid";

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

/**
 * @fileOverview Official Mock Attempt Hub v15.0 [Critical Maintenance Hub].
 * FIXED: Implemented 'forceNew' detection to bypass resume logic during Retakes.
 */

export default function AttemptClient({ mockId: propMockId }: { mockId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const db = useFirestore();
  const { user, profile, loading: userLoading } = useUser();
  const { toast } = useToast();

  const mockId = useMemo(() => {
    if (propMockId) return propMockId;
    const queryId = searchParams?.get('id');
    if (queryId && queryId !== 'manual') return queryId;
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length >= 2) {
      const idIdx = segments.indexOf('mocks') + 1;
      if (idIdx > 0 && segments[idIdx] && segments[idIdx] !== 'attempt') return segments[idIdx];
    }
    return null;
  }, [pathname, searchParams, propMockId]);

  // CRITICAL: Detection of retake request to bypass resume logic
  const isRetakeRequested = searchParams?.get('retake') === 'true';

  const { startSession, stopSession } = useActiveSession('MOCK', mockId || undefined);

  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
  const [mockData, setMockData] = useState<any>(null);

  const touchStart = useRef({ x: 0, y: 0 });

  const {
    initExam,
    attemptId,
    tick,
    isPaused,
    setPaused,
    currentIdx,
    questions,
    answers,
    mockTitle,
    setAnswer,
    startTime,
    language,
    timeLeft,
    elapsedSeconds,
    setCurrentIdx,
    saveAndNext,
    resetStore
  } = useExamStore();

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchStart.current.x - touchEndX;
    const deltaY = touchStart.current.y - touchEndY;
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 80) {
      if (deltaX > 0 && currentIdx < questions.length - 1) setCurrentIdx(currentIdx + 1);
      else if (deltaX < 0 && currentIdx > 0) setCurrentIdx(currentIdx - 1);
    }
  };

  const loadExam = useCallback(async () => {
    if (!db || !mockId || userLoading) return;
    
    try {
      setIsInitializing(true);
      setInitError(null);
      
      const mockRef = doc(db, "mocks", mockId);
      const dailyRef = doc(db, "daily_quizzes", mockId);
      
      let targetSnap = await getDoc(mockRef);
      if (!targetSnap.exists()) targetSnap = await getDoc(dailyRef);
      if (!targetSnap.exists()) throw new Error("Test entry not found.");
      
      const mData = targetSnap.data();
      setMockData(mData);

      // Access Check
      const tier = (mData.accessLevel || 'FREE').toUpperCase();
      if (tier === 'PREMIUM') {
         if (!user && !userLoading) { router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`); return; }
         if (user && profile) {
            const userEmail = user.email?.toLowerCase();
            const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || (userEmail && SUPER_ADMIN_WHITELIST.includes(userEmail));
            const expiry = profile?.passExpiresAt ? new Date(profile.passExpiresAt) : null;
            if (!isAdmin && (!expiry || expiry <= new Date())) {
               router.replace('/pass');
               toast({ title: "Elite Pass Required" });
               return;
            }
         }
      }

      const questionIds: string[] = mData.questionIds || [];
      if (questionIds.length === 0) throw new Error("No questions configured.");
      
      const fetchedQuestions: any[] = [];
      const chunks = [];
      for (let i = 0; i < questionIds.length; i += 30) { chunks.push(questionIds.slice(i, i + 30)); }
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

      const sectionsConfig = mData.sections || [{ name: 'General', count: questionIds.length }];
      const enrichedQuestions: any[] = [];
      let qPointer = 0;
      sectionsConfig.forEach((sec: any) => {
        const count = Number(sec.count) || 0;
        const sectionQIds = questionIds.slice(qPointer, qPointer + count);
        qPointer += count;
        sectionQIds.forEach(id => {
          const qNode = fetchedQuestions.find(fq => fq.id === id);
          if (qNode) enrichedQuestions.push({ ...qNode, sectionId: sec.name });
        });
      });

      if (enrichedQuestions.length === 0) throw new Error("Question sync failure.");

      let resumeData = null;
      if (user && !isRetakeRequested) {
         const attemptSnap = await getDoc(doc(db, "attempts", `${user.uid}_${mockId}`));
         if (attemptSnap.exists()) {
           const aData = attemptSnap.data();
           if (aData.status === 'COMPLETED') { router.replace(`/results/view?id=${mockId}&attemptId=${aData.attemptId}`); return; }
           resumeData = aData;
         }
      }

      initExam(mockId, mData.title || "Cracklix Test", user?.uid || null, enrichedQuestions, mData.duration || 120, resumeData, mData.languageMode, isRetakeRequested);
      startSession(); 
      setIsInitializing(false);
    } catch (err: any) { 
      setInitError(err.message || "Sync failure."); 
      setIsInitializing(false);
    }
  }, [db, mockId, user, userLoading, profile, router, pathname, initExam, startSession, toast, isRetakeRequested]);

  useEffect(() => { loadExam(); }, [loadExam]);

  useEffect(() => {
    if (isInitializing || initError) return;
    const interval = setInterval(() => { tick(); }, 1000);
    return () => clearInterval(interval);
  }, [isInitializing, initError, tick]);

  const calculateGrade = (accuracy: number) => {
    if (accuracy >= 90) return 'A+';
    if (accuracy >= 80) return 'A';
    if (accuracy >= 70) return 'B+';
    if (accuracy >= 60) return 'B';
    if (accuracy >= 50) return 'C';
    if (accuracy >= 40) return 'D';
    return 'F';
  };

  const handleSubmitFinal = useCallback(async () => {
    if (!db || isSubmittingFinal || !mockData || !mockId || !attemptId) return;
    setIsSubmittingFinal(true);
    
    let correctCount = 0; 
    let wrongCount = 0;
    const attemptedCount = Object.keys(answers || {}).length;
    const posMarks = Number(mockData.positiveMarks) || 1;
    const negMarks = Number(mockData.negativeMarks) || 0.25;

    const subMap: Record<string, any> = {};
    const diffMap: Record<string, any> = { 
      easy: { name: 'Easy', total: 0, correct: 0, wrong: 0, accuracy: 0 }, 
      medium: { name: 'Medium', total: 0, correct: 0, wrong: 0, accuracy: 0 }, 
      hard: { name: 'Hard', total: 0, correct: 0, wrong: 0, accuracy: 0 },
      expert: { name: 'Expert', total: 0, correct: 0, wrong: 0, accuracy: 0 }
    };

    questions.forEach((q: any, idx: number) => {
      const studentAnsIdx = answers?.[idx];
      const correctOptIdx = ['A', 'B', 'C', 'D'].indexOf(q.correctAnswer);
      const isCorrect = studentAnsIdx !== undefined && studentAnsIdx === correctOptIdx;
      const isAttempted = studentAnsIdx !== undefined && studentAnsIdx !== null;

      const sId = q.subjectId || 'General';
      if (!subMap[sId]) subMap[sId] = { name: sId, total: 0, correct: 0, wrong: 0, score: 0 };
      subMap[sId].total++;
      
      const dKey = (q.difficulty || 'Medium').toLowerCase();
      if (diffMap[dKey]) diffMap[dKey].total++;

      if (isCorrect) { 
        subMap[sId].correct++; 
        subMap[sId].score += posMarks; 
        if (diffMap[dKey]) diffMap[dKey].correct++;
        correctCount++; 
      } else if (isAttempted) { 
        subMap[sId].wrong++;
        subMap[sId].score -= negMarks; 
        if (diffMap[dKey]) diffMap[dKey].wrong++;
        wrongCount++; 
      }
    });

    const finalScore = Number(parseFloat(((correctCount * posMarks) - (wrongCount * negMarks)).toFixed(2)));
    const timeTaken = Math.max(1, elapsedSeconds);
    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
    
    await stopSession({ completedQuestions: attemptedCount, correct: correctCount, wrong: wrongCount });

    try {
      if (user) {
        // 1. UPDATE LEADERBOARD (Best Attempt Protocol)
        const lbEntryRef = doc(db, "leaderboards", mockId, "entries", user.uid);
        const lbSnap = await getDoc(lbEntryRef);
        
        let isNewBest = true;
        let attemptCount = 1;

        if (lbSnap.exists()) {
           const existing = lbSnap.data();
           attemptCount = (existing.attemptCount || 0) + 1;
           
           const hasHigherScore = finalScore > existing.highestScore;
           const hasEqualScoreHigherAcc = (finalScore === existing.highestScore && accuracy > existing.accuracy);
           const hasEqualScoreAccLowerTime = (finalScore === existing.highestScore && accuracy === existing.accuracy && timeTaken < existing.timeTaken);
           
           isNewBest = hasHigherScore || hasEqualScoreHigherAcc || hasEqualScoreAccLowerTime;
        }

        if (isNewBest) {
           await setDoc(lbEntryRef, {
              userId: user.uid,
              userName: profile?.name || 'Aspirant',
              photoURL: profile?.photoURL || "",
              gender: profile?.gender || 'Other',
              mockId,
              highestScore: finalScore,
              accuracy,
              timeTaken,
              attemptCount,
              bestAttemptId: attemptId,
              submittedAt: serverTimestamp()
           }, { merge: true });
        } else {
           await updateDoc(lbEntryRef, {
              attemptCount: increment(1),
              updatedAt: serverTimestamp()
           });
        }

        // 2. CALCULATE LIVE RANK (Rank at Submission)
        const entriesSnap = await getDocs(query(collection(db, "leaderboards", mockId, "entries")));
        const allEntries = entriesSnap.docs.map(d => d.data());
        
        allEntries.sort((a: any, b: any) => {
           if (b.highestScore !== a.highestScore) return b.highestScore - a.highestScore;
           if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
           if (a.timeTaken !== b.timeTaken) return a.timeTaken - b.timeTaken;
           return (a.submittedAt?.seconds || 0) - (b.submittedAt?.seconds || 0);
        });

        const myRankIndex = allEntries.findIndex(e => e.userId === user.uid);
        const rankAtSubmission = myRankIndex + 1;
        const totalCandidates = allEntries.length;

        // 3. SAVE FINAL RESULT
        const resultPayload = {
           attemptId,
           mockId,
           mockTitle: mockData.title || mockTitle,
           userId: user.uid,
           userName: profile?.name || 'Aspirant',
           userEmail: user.email || "",
           score: finalScore,
           correctCount,
           wrongCount,
           skippedCount: questions.length - attemptedCount,
           attemptedCount,
           totalQuestions: questions.length,
           accuracy,
           grade: calculateGrade(accuracy),
           timeTaken,
           rankAtSubmission,
           totalCandidatesAtSubmission: totalCandidates,
           timestamp: new Date().toISOString(),
           createdAt: serverTimestamp(),
           languageMode: language,
           mockType: mockData.mockType || 'PRACTICE',
           positiveMarks: posMarks,
           negativeMarks: negMarks,
           subjectAnalysis: Object.values(subMap).map((s: any) => ({ ...s, accuracy: Math.round((s.correct / (s.total || 1)) * 100) })),
           complexityAnalysis: Object.values(diffMap).map((d: any) => ({ ...d, accuracy: Math.round((d.correct / (d.total || 1)) * 100) }))
        };

        await setDoc(doc(db, "results", `${user.uid}_${mockId}_${attemptId}`), resultPayload);
        
        // Update User Profile Aggregates
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
           totalTests: increment(1),
           updatedAt: serverTimestamp()
        });

        // 4. SYNC ATTEMPT STATUS
        await setDoc(doc(db, "attempts", `${user.uid}_${mockId}`), { 
           attemptId,
           status: 'COMPLETED', 
           updatedAt: serverTimestamp() 
        }, { merge: true });

        resetStore();
        router.replace(`/results/view?id=${mockId}&attemptId=${attemptId}`);
      } else {
        const guestResult = {
           attemptId,
           mockId,
           mockTitle: mockData.title || mockTitle,
           score: finalScore,
           accuracy,
           totalQuestions: questions.length,
           correctCount,
           wrongCount,
           timeTaken,
           timestamp: new Date().toISOString()
        };
        localStorage.setItem(`cracklix_guest_result_${mockId}`, JSON.stringify(guestResult));
        resetStore();
        router.replace(`/results/view?id=${mockId}&guest=true`);
      }
    } catch (e) {
      console.error("[SUBMISSION_FAILURE]:", e);
      setIsSubmittingFinal(false);
    }
  }, [db, user, profile, isSubmittingFinal, questions, answers, router, mockId, mockTitle, mockData, elapsedSeconds, stopSession, attemptId, resetStore, language]);

  useEffect(() => {
     if (!isInitializing && !initError && timeLeft === 0 && !isSubmittingFinal && questions.length > 0) {
        handleSubmitFinal();
     }
  }, [timeLeft, isInitializing, initError, isSubmittingFinal, handleSubmitFinal, questions.length]);

  if (isInitializing) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B1528] space-y-8">
       <Zap className="h-12 w-12 text-primary animate-pulse" />
       <div className="text-center space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Synchronizing Hub</p>
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Loading questions from registry...</p>
       </div>
    </div>
  );

  if (initError) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white p-10 text-center space-y-10">
       <div className="h-20 w-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto text-rose-500 shadow-xl border border-rose-100"><AlertCircle className="h-10 w-10" /></div>
       <div className="space-y-4 max-w-sm mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] uppercase tracking-tight">Sync failure</h2>
          <p className="text-slate-500 font-medium leading-relaxed">{initError}</p>
       </div>
       <Button onClick={() => window.location.reload()} className="h-14 bg-primary hover:bg-blue-700 text-white rounded-2xl font-bold gap-2"><RefreshCw className="h-4 w-4" /> Retry synchronization</Button>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-white font-body select-none overflow-x-hidden relative touch-pan-y w-full max-w-full">
      <AntiCheat />
      <ExamHeader onPaletteToggle={() => setIsPaletteOpen(true)} onExitRequest={() => setShowExitModal(true)} />
      <main className="flex-1 flex flex-col min-h-0 bg-slate-50/50 relative w-full max-w-full overflow-x-hidden">
        <AnimatePresence>
          {isPaused && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-[#0B1528]/95 backdrop-blur-xl flex items-center justify-center p-6">
              <div className="bg-white rounded-[2rem] p-8 space-y-6 text-center max-w-[280px] shadow-5xl border-none">
                <div className="h-12 w-12 bg-orange-50 rounded-xl flex items-center justify-center mx-auto text-primary shadow-xl"><Play className="h-6 w-6 fill-current" /></div>
                <h2 className="text-lg font-bold text-[#0F172A]">Test paused</h2>
                <Button onClick={() => setPaused(false)} className="w-full h-12 bg-primary text-white rounded-xl font-bold text-sm">Resume now</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex-1 flex flex-col min-h-0 w-full max-w-full overflow-x-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div className="w-full bg-white"><div className="max-w-4xl mx-auto"><SubjectTabs /></div></div>
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center px-4 md:px-10 pt-4 pb-12 w-full max-w-full">
            <div className="w-full max-w-4xl">
              {questions.length > 0 && questions[currentIdx] ? (
                <motion.div key={currentIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25, ease: "easeOut" }} className="w-full">
                  <QuestionRenderer 
                    language={language} 
                    question={{...questions[currentIdx], displayId: (currentIdx + 1).toString()}} 
                    selectedAnswer={answers?.[currentIdx] ?? null} 
                    onSelect={(idx: number) => setAnswer(currentIdx, idx, db)} 
                    className="shadow-md border-none p-6 md:p-10 lg:p-12 rounded-2xl md:rounded-[3rem] w-full" 
                  />
                </motion.div>
              ) : <div className="py-20 text-center opacity-20"><Loader2 className="h-10 w-10 mx-auto mb-4 animate-spin text-primary" /></div>}
            </div>
          </div>
        </div>
        <TacticalFooter onSubmit={() => currentIdx >= questions.length - 1 ? setShowSubmitModal(true) : saveAndNext(db)} />
      </main>

      <Sheet open={isPaletteOpen} onOpenChange={isPaletteOpen ? setIsPaletteOpen : undefined}>
        <SheetContent side="right" className="p-0 border-none w-[280px] md:w-[320px] shadow-5xl z-[1200]">
          <QuestionPalette onSelect={(idx: number) => { setCurrentIdx(idx); setIsPaletteOpen(false); }} onSubmit={() => { setIsPaletteOpen(false); setShowSubmitModal(true); }} />
        </SheetContent>
      </Sheet>

      <Dialog open={showExitModal} onOpenChange={setShowExitModal}>
        <DialogContent className="w-[90%] max-w-[420px] rounded-[24px] p-8 bg-white text-center shadow-5xl z-[1300]">
          <div className="flex flex-col items-center">
            <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center text-primary mb-6"><AlertCircle className="h-8 w-8" /></div>
            <DialogHeader><DialogTitle className="text-2xl font-black text-[#0F172A]">Finish test?</DialogTitle><DialogDescription className="text-slate-500 font-medium mt-2">You still have questions remaining. Would you like to submit now?</DialogDescription></DialogHeader>
            <div className="w-full flex flex-col gap-3 mt-8">
              <Button onClick={handleSubmitFinal} disabled={isSubmittingFinal} className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg">Submit test</Button>
              <Button variant="outline" onClick={() => { setPaused(false); setShowExitModal(false); router.replace('/'); }} className="h-12 border-slate-200 text-slate-500 font-bold rounded-xl"><Save className="h-4 w-4 mr-2" /> Save & Exit</Button>
              <Button variant="ghost" onClick={() => setShowExitModal(false)} className="h-12 text-[#0F172A] font-bold rounded-xl bg-slate-50">Continue</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSubmitModal} onOpenChange={!isSubmittingFinal ? setShowSubmitModal : undefined}>
        <DialogContent className="w-[90%] max-w-[420px] rounded-[24px] p-8 bg-[#0F172A] text-white text-center shadow-2xl z-[1300]">
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <div className="absolute -inset-2 rounded-full bg-blue-500/30 blur-xl"></div>
              <div className="relative h-16 w-16 bg-blue-600/20 rounded-full flex items-center justify-center text-blue-400 border border-blue-500/30 shadow-2xl"><ShieldCheck className="h-8 w-8" /></div>
            </div>
            <DialogHeader><DialogTitle className="text-white font-black text-3xl tracking-tight">Submit test</DialogTitle><DialogDescription className="text-slate-400 mt-2">Confirm your submission. Once committed, you cannot modify your answers.</DialogDescription></DialogHeader>
            <div className="w-full flex flex-col gap-3 mt-8">
              <Button onClick={handleSubmitFinal} disabled={isSubmittingFinal} className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-xl border-none">Confirm submission</Button>
              <Button variant="ghost" onClick={() => setShowSubmitModal(false)} disabled={isSubmittingFinal} className="w-full h-12 text-slate-400 hover:text-white font-bold">Return to test</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
