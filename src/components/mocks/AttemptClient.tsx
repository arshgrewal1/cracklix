'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, documentId, getDocs, setDoc } from "firebase/firestore";
import { useExamStore } from "@/store/useExamStore";
import { useStudyAnalytics } from "@/hooks/use-study-analytics"; 
import ExamHeader from "@/components/exam/ExamHeader";
import TacticalFooter from "@/components/exam/TacticalFooter";
import AntiCheat from "@/components/exam/AntiCheat";
import QuestionRenderer from "@/components/questions/QuestionRenderer";
import QuestionPalette from "@/components/mocks/QuestionPalette";
import SubjectTabs from "@/components/exam/SubjectTabs";
import { Button } from "@/components/ui/button";
import { Loader2, Play, ShieldCheck, Zap, AlertCircle, Save, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
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
 * @fileOverview Official Mock Attempt Hub v5.2 (Swipe Navigation Enabled).
 * ADDED: Horizontal swipe gesture support for question navigation.
 * FIXED: Normalized typography and terminology across CBT components.
 */

export default function AttemptClient({ mockId: propMockId }: { mockId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const db = useFirestore();
  const { user, profile } = useUser();
  const { toast } = useToast();
  const { startTracking, stopTracking } = useStudyAnalytics('mock');

  const mockId = useMemo(() => {
    if (propMockId) return propMockId;
    const queryId = searchParams.get('id');
    if (queryId) return queryId;
    const pathSegments = pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 2]; 
    return lastSegment !== 'attempt' ? lastSegment : null;
  }, [pathname, searchParams, propMockId]);

  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
  const [mockData, setMockData] = useState<any>(null);

  // SWIPE NAVIGATION HANDLERS
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

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
    setCurrentIdx
  } = useExamStore();

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    
    const deltaX = touchStartX.current - touchEndX.current;
    const threshold = 80; // 80px swipe requirement

    if (deltaX > threshold && currentIdx < questions.length - 1) {
      // Swipe Left -> Next
      setCurrentIdx(currentIdx + 1);
    } else if (deltaX < -threshold && currentIdx > 0) {
      // Swipe Right -> Previous
      setCurrentIdx(currentIdx - 1);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  useEffect(() => {
    startTracking();
    return () => {
      stopTracking();
    };
  }, [startTracking, stopTracking]);

  useEffect(() => {
    async function loadExam() {
      if (!db || !mockId) return;
      
      try {
        const mockSnap = await getDoc(doc(db, "mocks", mockId));
        if (!mockSnap.exists()) throw new Error("Test registry node not found.");
        
        const mData = mockSnap.data();
        setMockData(mData);

        const tier = (mData.accessLevel || 'FREE').toUpperCase();
        
        // ACCESS AUDIT
        if (tier === 'PREMIUM') {
           if (!user || !profile) {
              router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
              return;
           }
           const userEmail = user.email?.toLowerCase();
           const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || (userEmail && SUPER_ADMIN_WHITELIST.includes(userEmail));
           
           let hasActivePass = false;
           if (isAdmin) {
             hasActivePass = true;
           } else if (profile?.passExpiresAt) {
             const expiryDate = new Date(profile.passExpiresAt);
             if (!isNaN(expiryDate.getTime()) && expiryDate > new Date() && profile.pass?.active !== false) {
               hasActivePass = true;
             }
           }

           if (!hasActivePass) {
              toast({ variant: "destructive", title: "Access Blocked", description: "Premium Mock requires an active Elite Pass." });
              router.replace('/pass');
              return;
           }
        }

        const questionIds: string[] = mData.questionIds || [];
        if (questionIds.length === 0) throw new Error("Question bank is empty for this test.");

        const fetchedQuestions: any[] = [];
        const chunks = [];
        for (let i = 0; i < questionIds.length; i += 30) { chunks.push(questionIds.slice(i, i + 30)); }
        
        for (const chunk of chunks) {
           const chunkSnap = await getDocs(query(collection(db, "questions"), where(documentId(), "in", chunk)));
           chunkSnap.docs.forEach(d => fetchedQuestions.push({ ...d.data(), id: d.id }));
        }
        
        const sortedQs = questionIds.map((id: string) => fetchedQuestions.find((q: any) => q.id === id)).filter(Boolean);
        if (sortedQs.length === 0) throw new Error("Registry Mismatch: Questions could not be synced.");

        let resumeData = undefined;
        if (user) {
           const attemptSnap = await getDoc(doc(db, "attempts", `${user.uid}_${mockId}`));
           if (attemptSnap.exists()) resumeData = attemptSnap.data();
        }

        initExam(mockId, mData.title || "Elite Series", user?.uid || null, sortedQs, mData.duration || 120, resumeData, mData.languageMode);
      } catch (err: any) {
        setInitError(err.message);
      } finally { 
        setIsInitializing(false); 
      }
    }
    loadExam();
  }, [db, user, profile, mockId, initExam, router, toast, pathname]);

  useEffect(() => {
    if (isInitializing || initError) return;
    const interval = setInterval(() => { tick(); }, 1000);
    return () => clearInterval(interval);
  }, [isInitializing, initError, tick]);

  const handleSubmitFinal = useCallback(() => {
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
      if (correctOptIdx === studentAnsIdx) correctCount++;
      else wrongCount++;
    });

    const rawScore = (correctCount * posMarks) - (wrongCount * negMarks);
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

    const resultPayload: any = {
      mockId, 
      mockTitle: mockData.title || mockTitle,
      score: parseFloat(rawScore.toFixed(2)),
      correctCount, wrongCount, attemptedCount,
      totalQuestions: questions.length, 
      accuracy, timeTaken, answers: answers || {}, 
      timestamp: new Date().toISOString(), 
      accessLevel: (mockData.accessLevel || 'FREE').toUpperCase() 
    };

    if (user) {
      resultPayload.userId = user.uid;
      resultPayload.userName = profile?.name || 'Aspirant';
      resultPayload.userEmail = user.email || "";
      resultPayload.createdAt = serverTimestamp();

      const resultRef = doc(db, "results", `${user.uid}_${mockId}`);
      const attemptRef = doc(db, "attempts", `${user.uid}_${mockId}`);

      setDoc(resultRef, resultPayload, { merge: true }).catch(async (serverError) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ path: resultRef.path, operation: 'write', requestResourceData: resultPayload }));
      });

      updateDoc(attemptRef, { status: 'COMPLETED', updatedAt: serverTimestamp() }).catch(async (serverError) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ path: attemptRef.path, operation: 'update', requestResourceData: { status: 'COMPLETED' } }));
      });
      
      localStorage.removeItem(`cracklix_guest_attempt_${mockId}`);
      router.replace(`/results/view?id=${mockId}`);
    } else {
      // GUEST SUBMISSION
      localStorage.setItem(`cracklix_guest_result_${mockId}`, JSON.stringify(resultPayload));
      localStorage.removeItem(`cracklix_guest_attempt_${mockId}`);
      router.replace(`/results/view?id=${mockId}&guest=true`);
    }
  }, [db, user, profile, isSubmittingFinal, questions, answers, router, mockId, mockTitle, mockData, startTime]);

  useEffect(() => {
     if (!isInitializing && !initError && timeLeft === 0 && !isSubmittingFinal) {
        handleSubmitFinal();
     }
  }, [timeLeft, isInitializing, initError, isSubmittingFinal, handleSubmitFinal]);

  const handleSaveAndNext = useCallback(() => {
    if (currentIdx === questions.length - 1) {
      setShowSubmitModal(true);
    } else {
      setCurrentIdx(currentIdx + 1);
    }
  }, [currentIdx, questions.length, setCurrentIdx]);

  const answeredCount = useMemo(() => Object.values(answers || {}).filter(a => a !== null && a !== undefined).length, [answers]);
  const notAnsweredCount = useMemo(() => questions.length - answeredCount, [questions.length, answeredCount]);

  if (isInitializing) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B1528] space-y-8">
       <Zap className="h-12 w-12 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Synchronizing Center...</p>
    </div>
  );

  if (initError || !mockId) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white p-10 text-center space-y-8">
       <div className="h-16 w-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-500 shadow-xl border border-rose-100">
          <AlertCircle className="h-8 w-8" />
       </div>
       <div className="space-y-2">
          <h2 className="text-2xl font-black text-[#0F172A] leading-tight">Sync Failure</h2>
          <p className="text-slate-500 font-medium max-w-sm mx-auto">{initError || "Mock context lost during resolution."}</p>
       </div>
       <Button onClick={() => router.replace('/dashboard')} className="h-14 px-10 bg-[#0F172A] text-white rounded-2xl font-bold text-sm">Return to Portal</Button>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-white font-body select-none overflow-hidden relative touch-pan-y">
      <AntiCheat />
      
      <ExamHeader onPaletteToggle={() => setIsPaletteOpen(true)} onExitRequest={() => setShowExitModal(true)} />
      
      <main className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
        <AnimatePresence>
          {isPaused && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-[#0B1528]/95 backdrop-blur-xl flex items-center justify-center p-6">
              <div className="bg-white rounded-[2rem] p-8 space-y-6 text-center max-w-[280px] shadow-5xl border-none">
                <div className="h-12 w-12 bg-orange-50 rounded-xl flex items-center justify-center mx-auto text-primary shadow-xl">
                  <Play className="h-6 w-6 fill-current" />
                </div>
                <h2 className="text-lg font-bold text-[#0F172A]">Test Paused</h2>
                <Button onClick={() => setPaused(false)} className="w-full h-12 bg-primary text-white rounded-xl font-bold text-sm">Resume Now</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div 
          className="flex-1 flex flex-col min-h-0 relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <SubjectTabs />
          
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center px-4 pt-4 pb-40 md:pb-32">
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
                    className="shadow-md border-none p-4 md:p-10 lg:p-12 rounded-2xl md:rounded-[3rem]" 
                  />
                </motion.div>
              ) : (
                <div className="py-20 text-center opacity-20">
                   <Zap className="h-10 w-10 mx-auto mb-4" />
                   <p className="font-bold text-slate-300">Syncing...</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none">
             <div className="max-w-4xl mx-auto pointer-events-auto">
                <TacticalFooter onSubmit={handleSaveAndNext} />
             </div>
          </div>
        </div>
      </main>

      <Sheet open={isPaletteOpen} onOpenChange={setIsPaletteOpen}>
        <SheetContent side="right" className="p-0 border-none w-[240px] md:w-[320px] h-full shadow-5xl z-[1200]">
          <SheetHeader className="sr-only">
             <SheetTitle>Navigation Palette</SheetTitle>
             <SheetDescription>Navigate through questions.</SheetDescription>
          </SheetHeader>
          <QuestionPalette onSelect={(idx: number) => { setCurrentIdx(idx); setIsPaletteOpen(false); }} onSubmit={() => { setIsPaletteOpen(false); setShowSubmitModal(true); }} />
        </SheetContent>
      </Sheet>

      <Dialog open={showExitModal} onOpenChange={setShowExitModal}>
        <DialogContent className="w-[90%] max-w-[420px] rounded-[24px] p-8 bg-white text-center border-none shadow-5xl z-[1300] animate-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center">
            <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center text-primary mb-6 shadow-inner">
               <AlertCircle className="h-8 w-8" />
            </div>

            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-[#0F172A] tracking-tight">Finish Test?</DialogTitle>
              <DialogDescription className="text-slate-500 font-medium mt-2 leading-relaxed">
                You still have questions remaining. Would you like to submit your answers now or continue your preparation?
              </DialogDescription>
            </DialogHeader>

            <div className="w-full flex flex-col gap-3 mt-8">
              <Button
                onClick={handleSubmitFinal}
                disabled={isSubmittingFinal}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                {isSubmittingFinal ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                Submit Test
              </Button>
              <div className="grid grid-cols-2 gap-3">
                 <Button
                    variant="outline"
                    onClick={() => { setPaused(false); setShowExitModal(false); router.replace('/'); }}
                    className="h-12 border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50"
                 >
                    <Save className="h-4 w-4 mr-2" /> Save & Exit
                 </Button>
                 <Button
                    variant="ghost"
                    onClick={() => setShowExitModal(false)}
                    className="h-12 text-[#0F172A] font-bold rounded-xl bg-slate-50 hover:bg-slate-100"
                 >
                    Continue
                 </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSubmitModal} onOpenChange={!isSubmittingFinal ? setShowSubmitModal : undefined}>
        <DialogContent className="w-[90%] max-w-[420px] rounded-[24px] p-8 bg-[#0F172A] text-white text-center border-none shadow-2xl z-[1300]">
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <div className="absolute -inset-2 rounded-full bg-blue-500/30 blur-xl"></div>
              <div className="relative h-16 w-16 bg-blue-600/20 rounded-full flex items-center justify-center text-blue-400 border border-blue-500/30 shadow-2xl">
                <ShieldCheck className="h-8 w-8" />
              </div>
            </div>

            <DialogHeader>
              <DialogTitle className="text-white font-black text-3xl tracking-tight">Submit Test</DialogTitle>
              <DialogDescription className="text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
                Confirm your submission. Once committed to the registry, you cannot modify your answers.
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-center gap-6 my-8 py-4 border-y border-white/5 w-full">
                <div className="text-center">
                   <p className="text-2xl font-black text-white tabular-nums">{answeredCount}</p>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Answered</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                   <p className="text-2xl font-black text-white tabular-nums">{notAnsweredCount}</p>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Remaining</p>
                </div>
            </div>

            <div className="w-full flex flex-col gap-3">
              <Button
                onClick={handleSubmitFinal}
                disabled={isSubmittingFinal}
                className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-xl transition-all active:scale-95 border-none"
              >
                {isSubmittingFinal ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm Submission'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmittingFinal}
                className="w-full h-12 text-slate-400 hover:text-white font-bold transition-colors"
              >
                Return to Test
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
