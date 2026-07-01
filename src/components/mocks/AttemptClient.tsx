'use client';

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, documentId, getDocs, setDoc } from "firebase/firestore";
import { useExamStore } from "@/store/useExamStore";
import { useStudyTracker } from "@/hooks/useStudyTracker"; // Import the hook
import ExamHeader from "@/components/exam/ExamHeader";
import TacticalFooter from "@/components/exam/TacticalFooter";
import AntiCheat from "@/components/exam/AntiCheat";
import QuestionRenderer from "@/components/questions/QuestionRenderer";
import QuestionPalette from "@/components/mocks/QuestionPalette";
import SubjectTabs from "@/components/exam/SubjectTabs";
import { Button } from "@/components/ui/button";
import { Loader2, Play, ShieldCheck, Zap, AlertCircle } from "lucide-react";
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
} from "@/components/ui/dialog";

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];


export default function AttemptClient({ mockId: propMockId }: { mockId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const db = useFirestore();
  const { user, profile } = useUser();
  const { toast } = useToast();

  const mockId = useMemo(() => {
    if (propMockId) return propMockId;
    const queryId = searchParams.get('id');
    if (queryId) return queryId;
    const pathSegments = pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 2]; 
    return lastSegment !== 'attempt' ? lastSegment : null;
  }, [pathname, searchParams, propMockId]);

  // Initialize the study tracker
  useStudyTracker(mockId, 'MOCK', true);

  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
  const [mockData, setMockData] = useState<any>(null);

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

  useEffect(() => {
    async function loadExam() {
      if (!db || !user || !mockId || !profile) {
         if (!mockId && !isInitializing) setInitError("Attempt identity node lost.");
         return;
      }
      
      try {
        const mockSnap = await getDoc(doc(db, "mocks", mockId));
        if (!mockSnap.exists()) {
           throw new Error("Test registry node not found.");
        }
        
        const mData = mockSnap.data();
        setMockData(mData);

        const tier = (mData.accessLevel || 'FREE').toUpperCase();
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

        if (tier === 'PREMIUM' && !hasActivePass) {
           toast({ variant: "destructive", title: "Access Blocked", description: "Premium Mock requires an active Elite Pass." });
           router.replace('/pass');
           return;
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
        
        if (sortedQs.length === 0) {
           throw new Error("Registry Mismatch: Questions could not be synced.");
        }

        const attemptSnap = await getDoc(doc(db, "attempts", `${user.uid}_${mockId}`));
        initExam(mockId, mData.title || "Elite Series", user.uid, sortedQs, mData.duration || 120, attemptSnap.exists() ? attemptSnap.data() : undefined, mData.languageMode);
      } catch (err: any) {
        setInitError(err.message);
      } finally { 
        setIsInitializing(false); 
      }
    }
    loadExam();
  }, [db, user, profile, mockId, initExam, router, toast]);

  useEffect(() => {
    if (isInitializing || initError) return;
    const interval = setInterval(() => { tick(); }, 1000);
    return () => clearInterval(interval);
  }, [isInitializing, initError, tick]);

  const handleSubmitFinal = useCallback(() => {
    if (!db || isSubmittingFinal || !user || !mockData || !mockId) return;
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

    const resultPayload = {
      userId: user.uid, 
      userName: profile?.name || 'Aspirant', 
      userEmail: user.email || "",
      mockId, 
      mockTitle: mockData.title || mockTitle,
      score: parseFloat(rawScore.toFixed(2)),
      correctCount, wrongCount, attemptedCount,
      totalQuestions: questions.length, 
      accuracy, timeTaken, answers: answers || {}, 
      timestamp: new Date().toISOString(), 
      createdAt: serverTimestamp(),
      accessLevel: (mockData.accessLevel || 'FREE').toUpperCase() 
    };

    const resultRef = doc(db, "results", `${user.uid}_${mockId}`);
    const attemptRef = doc(db, "attempts", `${user.uid}_${mockId}`);

    setDoc(resultRef, resultPayload, { merge: true })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: resultRef.path,
          operation: 'write',
          requestResourceData: resultPayload,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });

    updateDoc(attemptRef, { status: 'COMPLETED', updatedAt: serverTimestamp() })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: attemptRef.path,
          operation: 'update',
          requestResourceData: { status: 'COMPLETED' }
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
    
    router.replace(`/results/view?id=${mockId}`);
    
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
  const markedForReviewCount = 0; 

  useEffect(() => {
    if (showSubmitModal) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !isSubmittingFinal) {
          e.preventDefault();
          handleSubmitFinal();
        } else if (e.key === 'Escape' && !isSubmittingFinal) {
          e.preventDefault();
          setShowSubmitModal(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [showSubmitModal, isSubmittingFinal, handleSubmitFinal]);

  if (isInitializing) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B1528] space-y-8">
       <Zap className="h-12 w-12 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Synchronizing Hub...</p>
    </div>
  );

  if (initError || !mockId) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white p-10 text-center space-y-8">
       <div className="h-16 w-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-500 shadow-xl border border-rose-100">
          <AlertCircle className="h-8 w-8" />
       </div>
       <div className="space-y-2">
          <h2 className="text-2xl font-black text-[#0F172A] uppercase leading-tight">Sync Failure</h2>
          <p className="text-slate-500 font-medium max-w-sm mx-auto">{initError || "Mock context lost during resolution."}</p>
       </div>
       <Button onClick={() => router.replace('/dashboard')} className="h-14 px-10 bg-[#0F172A] text-white rounded-2xl font-black uppercase text-[10px]">Return to Dashboard</Button>
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
                <h2 className="text-lg font-black text-[#0F172A] uppercase">Test Paused</h2>
                <Button onClick={() => setPaused(false)} className="w-full h-12 bg-primary text-white rounded-xl font-black uppercase text-[9px]">Resume Now</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex-1 flex flex-col min-h-0 relative">
          <SubjectTabs />
          
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center px-4 pt-4 pb-40 md:pb-32">
            <div className="w-full max-w-4xl">
              {questions.length > 0 && questions[currentIdx] ? (
                <motion.div 
                  key={currentIdx} 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.2 }}
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
                   <p className="font-black uppercase tracking-widest text-xs">Registry Node Syncing...</p>
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
        <DialogContent className="max-w-[240px] rounded-[1.2rem] p-4 md:p-6 bg-white text-center shadow-5xl border-none z-[1300]">
          <div className="space-y-3">
            <DialogHeader className="sr-only">
               <DialogTitle>Save & Exit?</DialogTitle>
               <DialogDescription>Your attempt state is cached.</DialogDescription>
            </DialogHeader>
            <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center mx-auto text-blue-500 shadow-sm">
              <Zap className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-black uppercase text-[#0F172A] leading-tight">Save & Exit?</h2>
            <div className="flex gap-2 pt-1">
              <Button variant="ghost" onClick={() => setShowExitModal(false)} className="flex-1 h-8 font-black uppercase text-[7px] tracking-widest">Stay</Button>
              <Button onClick={() => { setPaused(false); setShowExitModal(false); router.replace('/dashboard'); }} className="flex-1 h-8 bg-primary text-white rounded-lg font-black uppercase text-[7px] border-none shadow-lg">Exit</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSubmitModal} onOpenChange={!isSubmittingFinal ? setShowSubmitModal : undefined}>
        <DialogContent className="w-[90%] max-w-[420px] rounded-[24px] p-8 bg-[#0F172A] text-white text-center border-none shadow-2xl z-[1300] scale-in-center">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="absolute -inset-2 rounded-full bg-blue-500/30 blur-xl"></div>
              <div className="relative h-[56px] w-[56px] bg-blue-600/20 rounded-full flex items-center justify-center text-blue-400">
                <ShieldCheck className="h-8 w-8" />
              </div>
            </div>

            <DialogHeader>
              <DialogTitle className="text-white font-bold text-[30px] tracking-tight">SUBMIT TEST</DialogTitle>
            </DialogHeader>
            
            <DialogDescription className="text-slate-400 mt-2 max-w-xs">
              Are you sure you want to submit your test? Once submitted, you cannot change your answers.
            </DialogDescription>

            <div className="flex justify-center gap-4 my-6 text-sm">
                <div><span className="font-bold text-white">{answeredCount}</span> <span className="text-slate-400">Answered</span></div>
                <div><span className="font-bold text-white">{notAnsweredCount}</span> <span className="text-slate-400">Not Answered</span></div>
                <div><span className="font-bold text-white">{markedForReviewCount}</span> <span className="text-slate-400">For Review</span></div>
            </div>

            <div className="w-full flex flex-col gap-3 mt-4">
              <Button
                onClick={handleSubmitFinal}
                disabled={isSubmittingFinal}
                className="w-full h-[56px] bg-[#2563EB] hover:bg-blue-500 text-white font-bold text-base rounded-full shadow-lg transition-all duration-300 ease-in-out disabled:opacity-50"
              >
                {isSubmittingFinal ? <Loader2 className="animate-spin" /> : 'SUBMIT TEST'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmittingFinal}
                className="w-full h-[56px] text-[#94A3B8] hover:text-white font-bold text-base rounded-full transition-colors duration-300 ease-in-out disabled:opacity-50"
              >
                CONTINUE TEST
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
