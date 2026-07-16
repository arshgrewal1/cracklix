'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, documentId, getDocs, setDoc, deleteDoc, addDoc } from "firebase/firestore";
import { useExamStore } from "@/store/useExamStore";
import ExamHeader from "@/components/exam/ExamHeader";
import TacticalFooter from "@/components/exam/TacticalFooter";
import AntiCheat from "@/components/exam/AntiCheat";
import QuestionRenderer from "@/components/questions/QuestionRenderer";
import QuestionPalette from "@/components/mocks/QuestionPalette";
import SubjectTabs from "@/components/exam/SubjectTabs";
import { Button } from "@/components/ui/button";
import { Loader2, Play, ShieldCheck, Zap, AlertCircle, Save, LogOut, RefreshCw } from "lucide-react";
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

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

/**
 * @fileOverview Official Mock Attempt Hub v7.8.
 * FIXED: Reliable ID extraction from all URL formats.
 * FIXED: Sync failure handled with fallbacks and improved logging.
 */

export default function AttemptClient({ mockId: propMockId }: { mockId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const db = useFirestore();
  const { user, profile, loading: userLoading } = useUser();
  const { toast } = useToast();

  // Unified ID extraction
  const mockId = useMemo(() => {
    if (propMockId) return propMockId;
    const queryId = searchParams.get('id');
    if (queryId && queryId !== 'manual') return queryId;
    
    const segments = pathname.split('/').filter(Boolean);
    // Path: /mocks/[id]/attempt
    if (segments.length >= 3 && segments[segments.length-1] === 'attempt') {
      return segments[segments.length - 2];
    }
    // Path: /mocks/attempt (likely query id used above)
    return null;
  }, [pathname, searchParams, propMockId]);

  const isRetakeRequested = searchParams.get('retake') === 'true';

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
    setCurrentIdx,
    saveAndNext
  } = useExamStore();

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchStart.current.x - touchEndX;
    const deltaY = touchStart.current.y - touchEndY;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 80) {
      if (deltaX > 0 && currentIdx < questions.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else if (deltaX < 0 && currentIdx > 0) {
        setCurrentIdx(currentIdx - 1);
      }
    }
  };

  useEffect(() => {
    async function loadExam() {
      if (!db || !mockId || userLoading) return;
      try {
        setIsInitializing(true);
        setInitError(null);
        
        const mockSnap = await getDoc(doc(db, "mocks", mockId));
        const dailySnap = !mockSnap.exists() ? await getDoc(doc(db, "daily_quizzes", mockId)) : null;
        
        const targetSnap = (mockSnap.exists() ? mockSnap : dailySnap);
        if (!targetSnap || !targetSnap.exists()) {
           throw new Error("Test not found in registry.");
        }
        
        const mData = targetSnap.data();
        setMockData(mData);

        const tier = (mData.accessLevel || 'FREE').toUpperCase();
        if (tier === 'PREMIUM') {
           if (!user && !userLoading) { 
              router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`); 
              return; 
           }
           if (user && profile) {
              const userEmail = user.email?.toLowerCase();
              const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || (userEmail && SUPER_ADMIN_WHITELIST.includes(userEmail));
              const expiry = profile?.passExpiresAt ? new Date(profile.passExpiresAt) : null;
              const hasActivePass = isAdmin || (expiry && expiry > new Date());
              
              if (!hasActivePass) {
                 router.replace('/pass');
                 toast({ title: "Pass Required", description: "This is a premium mock test." });
                 return;
              }
           }
        }

        const questionIds: string[] = mData.questionIds || [];
        if (questionIds.length === 0) throw new Error("Test configuration error: 0 questions.");
        
        const fetchedQuestions: any[] = [];
        const chunks = [];
        for (let i = 0; i < questionIds.length; i += 30) { chunks.push(questionIds.slice(i, i + 30)); }
        
        for (const chunk of chunks) {
           const [mcqSnap, legacySnap] = await Promise.all([
             getDocs(query(collection(db, "mcqBank"), where(documentId(), "in", chunk))),
             getDocs(query(collection(db, "questions"), where(documentId(), "in", chunk)))
           ]);

           mcqSnap.docs.forEach(d => fetchedQuestions.push({ ...d.data(), id: d.id }));
           legacySnap.docs.forEach(d => {
              if (!fetchedQuestions.find(f => f.id === d.id)) {
                 fetchedQuestions.push({ ...d.data(), id: d.id });
              }
           });
        }

        const sortedQs = questionIds.map((id: string) => fetchedQuestions.find((q: any) => q.id === id)).filter(Boolean);
        if (sortedQs.length === 0) throw new Error("Question database sync failure.");

        let resumeData = undefined;
        if (user && !isRetakeRequested) {
           const attemptSnap = await getDoc(doc(db, "attempts", `${user.uid}_${mockId}`));
           if (attemptSnap.exists()) {
             const aData = attemptSnap.data();
             if (aData.status === 'COMPLETED') {
                router.replace(`/results/view?id=${mockId}`);
                return;
             }
             resumeData = aData;
           }
        }

        initExam(mockId, mData.title || "Cracklix Test", user?.uid || null, sortedQs, mData.duration || 120, resumeData, mData.languageMode);
        startSession(); 
      } catch (err: any) { 
        console.error("[ATTEMPT_SYNC_ERROR]:", err);
        setInitError(err.message); 
      } finally { setIsInitializing(false); }
    }
    loadExam();
  }, [db, user, profile, userLoading, mockId, initExam, router, toast, pathname, startSession, isRetakeRequested]);

  useEffect(() => {
    if (isInitializing || initError) return;
    const interval = setInterval(() => { tick(); }, 1000);
    return () => clearInterval(interval);
  }, [isInitializing, initError, tick]);

  const handleSubmitFinal = useCallback(async () => {
    if (!db || isSubmittingFinal || !mockData || !mockId) return;
    setIsSubmittingFinal(true);
    
    let correctCount = 0; 
    let wrongCount = 0;
    const attemptedCount = Object.keys(answers || {}).length;
    const posMarks = Number(mockData.positiveMarks) || 1;
    const negMarks = Number(mockData.negativeMarks) || 0.25;

    questions.forEach((q: any, idx: number) => {
      const studentAnsIdx = answers?.[idx];
      if (studentAnsIdx === undefined || studentAnsIdx === null) return;
      const correctOptIdx = ['A', 'B', 'C', 'D'].indexOf(q.correctAnswer);
      if (correctOptIdx === studentAnsIdx) correctCount++; else wrongCount++;
    });

    const rawScore = (correctCount * posMarks) - (wrongCount * negMarks);
    const endTime = Date.now();
    const durationMs = endTime - startTime;
    const timeTaken = Math.round(durationMs / 1000);
    
    await stopSession({
      completedQuestions: attemptedCount,
      correct: correctCount,
      wrong: wrongCount
    });

    const resultPayload: any = {
      mockId, 
      mockTitle: mockData.title || mockTitle, 
      score: parseFloat(rawScore.toFixed(2)),
      correctCount, 
      wrongCount, 
      attemptedCount, 
      totalQuestions: questions.length,
      accuracy: attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0,
      timeTaken: Math.max(1, timeTaken), 
      answers: answers || {}, 
      timestamp: new Date().toISOString(),
      accessLevel: (mockData.accessLevel || 'FREE').toUpperCase(),
      mockType: mockData.mockType || 'PRACTICE'
    };

    try {
      if (user) {
        resultPayload.userId = user.uid; 
        resultPayload.userName = profile?.name || 'Aspirant';
        resultPayload.userEmail = user.email || ""; 
        resultPayload.createdAt = serverTimestamp();
        
        await setDoc(doc(db, "results", `${user.uid}_${mockId}`), resultPayload, { merge: true });
        await setDoc(doc(db, "attempts", `${user.uid}_${mockId}`), { status: 'COMPLETED', updatedAt: serverTimestamp() }, { merge: true });
        
        router.replace(`/results/view?id=${mockId}`);
      } else {
        localStorage.setItem(`cracklix_guest_result_${mockId}`, JSON.stringify(resultPayload));
        router.replace(`/results/view?id=${mockId}&guest=true`);
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Submission failed" });
      setIsSubmittingFinal(false);
    }
  }, [db, user, profile, isSubmittingFinal, questions, answers, router, mockId, mockTitle, mockData, startTime, stopSession, toast]);

  useEffect(() => {
     if (!isInitializing && !initError && timeLeft === 0 && !isSubmittingFinal) handleSubmitFinal();
  }, [timeLeft, isInitializing, initError, isSubmittingFinal, handleSubmitFinal]);

  const handleSaveAndNext = useCallback(() => {
    if (!questions || questions.length === 0) return;
    if (currentIdx >= questions.length - 1) {
      setShowSubmitModal(true);
    } else {
      saveAndNext(db);
    }
  }, [currentIdx, questions, saveAndNext, db]);

  if (isInitializing) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B1528] space-y-8">
       <Zap className="h-12 w-12 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Loading Environment...</p>
    </div>
  );

  if (initError) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white p-10 text-center space-y-8">
       <div className="h-16 w-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-500 shadow-xl border border-rose-100"><AlertCircle className="h-8 w-8" /></div>
       <div className="space-y-2"><h2 className="text-2xl font-black text-[#0F172A]">Sync failure</h2><p className="text-slate-500 font-medium max-sm:px-4 max-w-sm mx-auto">{initError}</p></div>
       <Button onClick={() => router.replace('/dashboard')} className="h-14 px-10 bg-[#0F172A] text-white rounded-2xl font-bold">Return to portal</Button>
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
        
        <div 
          className="flex-1 flex flex-col min-h-0 w-full max-w-full overflow-x-hidden" 
          onTouchStart={handleTouchStart} 
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-full bg-white">
             <div className="max-w-4xl mx-auto">
                <SubjectTabs />
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center px-4 md:px-10 pt-4 pb-12 w-full max-w-full overflow-x-hidden">
            <div className="w-full max-w-4xl">
              {questions.length > 0 && questions[currentIdx] ? (
                <motion.div 
                  key={currentIdx} 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }} 
                  transition={{ duration: 0.25, ease: "easeOut" }} 
                  className="w-full"
                >
                  <QuestionRenderer 
                    language={language} 
                    question={{...questions[currentIdx], displayId: (currentIdx + 1).toString()}} 
                    selectedAnswer={answers?.[currentIdx] ?? null} 
                    onSelect={(idx: number) => setAnswer(currentIdx, idx, db)} 
                    className="shadow-md border-none p-6 md:p-10 lg:p-12 rounded-2xl md:rounded-[3rem] w-full" 
                  />
                </motion.div>
              ) : <div className="py-20 text-center opacity-20"><Zap className="h-10 w-10 mx-auto mb-4" /><p className="font-bold text-slate-300">Syncing...</p></div>}
            </div>
          </div>
        </div>

        <div className="shrink-0 w-full">
           <TacticalFooter onSubmit={handleSaveAndNext} />
        </div>
      </main>

      <Sheet open={isPaletteOpen} onOpenChange={isPaletteOpen ? setIsPaletteOpen : undefined}>
        <SheetContent side="right" className="p-0 border-none w-[280px] md:w-[320px] h-full shadow-5xl z-[1200]">
          <SheetHeader className="sr-only"><SheetTitle>Navigation Palette</SheetTitle><SheetDescription>Navigate through questions.</SheetDescription></SheetHeader>
          <QuestionPalette onSelect={(idx: number) => { setCurrentIdx(idx); setIsPaletteOpen(false); }} onSubmit={() => { setIsPaletteOpen(false); setShowSubmitModal(true); }} />
        </SheetContent>
      </Sheet>

      <Dialog open={showExitModal} onOpenChange={setShowExitModal}>
        <DialogContent className="w-[90%] max-w-[420px] rounded-[24px] p-8 bg-white text-center border-none shadow-5xl z-[1300]">
          <div className="flex flex-col items-center">
            <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center text-primary mb-6 shadow-inner"><AlertCircle className="h-8 w-8" /></div>
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
        <DialogContent className="w-[90%] max-w-[420px] rounded-[24px] p-8 bg-[#0F172A] text-white text-center border-none shadow-2xl z-[1300]">
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
