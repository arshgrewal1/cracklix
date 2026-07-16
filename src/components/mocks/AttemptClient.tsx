'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useUser, useAuth } from "@/firebase";
import { doc, getDoc, serverTimestamp, collection, query, where, documentId, getDocs, setDoc } from "firebase/firestore";
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

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

/**
 * @fileOverview Official Mock Attempt Hub v8.0.
 * FIXED: Universal ID extraction and hardened question retrieval to prevent "Sync Failure".
 */

export default function AttemptClient({ mockId: propMockId }: { mockId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const db = useFirestore();
  const { user, profile, loading: userLoading } = useUser();
  const { toast } = useToast();

  // Unified ID extraction with fallback logic
  const mockId = useMemo(() => {
    if (propMockId) return propMockId;
    
    const queryId = searchParams?.get('id');
    if (queryId && queryId !== 'manual') return queryId;
    
    const segments = pathname.split('/').filter(Boolean);
    // Handle format: /mocks/[id]/attempt
    if (segments.length >= 2) {
      const idIdx = segments.indexOf('mocks') + 1;
      if (idIdx > 0 && segments[idIdx] && segments[idIdx] !== 'attempt') {
        return segments[idIdx];
      }
    }
    return null;
  }, [pathname, searchParams, propMockId]);

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

  const loadExam = useCallback(async () => {
    if (!db || !mockId || userLoading) return;
    
    try {
      setIsInitializing(true);
      setInitError(null);
      
      console.log(`[ATTEMPT] Initializing sync for Test ID: ${mockId}`);

      // 1. Fetch Mock Metadata
      const mockRef = doc(db, "mocks", mockId);
      const dailyRef = doc(db, "daily_quizzes", mockId);
      
      let targetSnap = await getDoc(mockRef);
      if (!targetSnap.exists()) {
        targetSnap = await getDoc(dailyRef);
      }
      
      if (!targetSnap.exists()) {
         throw new Error("The requested test entry was not found in our database.");
      }
      
      const mData = targetSnap.data();
      setMockData(mData);

      // 2. Security & Access Audit
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
               toast({ title: "Elite Pass Required", description: "This is a premium mock test hub." });
               return;
            }
         }
      }

      // 3. Question Retrieval Hub
      const questionIds: string[] = mData.questionIds || [];
      if (questionIds.length === 0) throw new Error("This test entry has no questions configured.");
      
      const fetchedQuestions: any[] = [];
      const chunks = [];
      for (let i = 0; i < questionIds.length; i += 30) {
        chunks.push(questionIds.slice(i, i + 30));
      }
      
      for (const chunk of chunks) {
         // Query both main and legacy banks for robustness
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

      // 4. Integrity Check & Store Initialization
      const sortedQs = questionIds.map((id: string) => fetchedQuestions.find((q: any) => q.id === id)).filter(Boolean);
      if (sortedQs.length === 0) throw new Error("Could not synchronize question content. Please contact support.");

      let resumeData = null;
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
      
      // 5. Start Study Session
      startSession(); 
      setIsInitializing(false);
      
    } catch (err: any) { 
      console.error("[ATTEMPT_SYNC_ERROR]:", err);
      setInitError(err.message || "An unexpected error occurred during test sync."); 
      setIsInitializing(false);
    }
  }, [db, mockId, user, userLoading, profile, router, pathname, initExam, startSession, toast, isRetakeRequested]);

  useEffect(() => {
    loadExam();
  }, [loadExam]);

  useEffect(() => {
    if (isInitializing || initError) return;
    const interval = setInterval(() => {
      tick();
    }, 1000);
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
     if (!isInitializing && !initError && timeLeft === 0 && !isSubmittingFinal && questions.length > 0) {
        handleSubmitFinal();
     }
  }, [timeLeft, isInitializing, initError, isSubmittingFinal, handleSubmitFinal, questions.length]);

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
       <div className="relative">
          <Zap className="h-12 w-12 text-primary animate-pulse" />
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
       </div>
       <div className="text-center space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Synchronizing Hub</p>
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Loading questions from registry...</p>
       </div>
    </div>
  );

  if (initError) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white p-10 text-center space-y-10">
       <div className="h-20 w-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto text-rose-500 shadow-xl border border-rose-100">
          <AlertCircle className="h-10 w-10" />
       </div>
       <div className="space-y-4 max-w-sm mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] uppercase tracking-tight">Sync failure</h2>
          <p className="text-slate-500 font-medium leading-relaxed">{initError}</p>
       </div>
       <div className="flex flex-col gap-4 w-full max-w-xs">
          <Button onClick={() => window.location.reload()} className="h-14 bg-primary hover:bg-blue-700 text-white rounded-2xl font-bold gap-2">
             <RefreshCw className="h-4 w-4" /> Retry synchronization
          </Button>
          <Button onClick={() => router.replace('/dashboard')} variant="ghost" className="h-12 text-slate-400 font-bold uppercase text-[10px]">Return to portal</Button>
       </div>
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
              ) : <div className="py-20 text-center opacity-20"><Loader2 className="h-10 w-10 mx-auto mb-4 animate-spin text-primary" /><p className="font-bold text-slate-300">Syncing node...</p></div>}
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

