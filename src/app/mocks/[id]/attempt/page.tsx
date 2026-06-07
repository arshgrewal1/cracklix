
'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFirestore, useUser } from "@/firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, documentId, getDocs } from "firebase/firestore";
import { useExamStore } from "@/store/useExamStore";
import ExamHeader from "@/components/exam/ExamHeader";
import TacticalFooter from "@/components/exam/TacticalFooter";
import AntiCheat from "@/components/exam/AntiCheat";
import QuestionRenderer from "@/components/questions/QuestionRenderer";
import QuestionPalette from "@/components/mocks/QuestionPalette";
import SubjectTabs from "@/components/exam/SubjectTabs";
import { Button } from "@/components/ui/button";
import { Loader2, Play, ShieldCheck, CheckCircle2, Zap, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

/**
 * @fileOverview Production Hardened CBT Attempt Engine v28.0.
 * UPDATED: Sheet width set to 85vw to match user screenshot exactly.
 */

export default function MockAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const mockId = params.id as string;

  const [isInitializing, setIsInitializing] = useState(true);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
  const [mockData, setMockData] = useState<any>(null);

  // Granular Selectors
  const initExam = useExamStore(s => s.initExam);
  const tick = useExamStore(s => s.tick);
  const isPaused = useExamStore(s => s.isPaused);
  const setPaused = useExamStore(s => s.setPaused);
  const currentIdx = useExamStore(s => s.currentIdx);
  const questions = useExamStore(s => s.questions);
  const answers = useExamStore(s => s.answers);
  const mockTitle = useExamStore(s => s.mockTitle);
  const setAnswer = useExamStore(s => s.setAnswer);
  const startTime = useExamStore(s => s.startTime);

  useEffect(() => {
    async function loadExam() {
      if (!db || !user || !mockId) return;
      try {
        const mockSnap = await getDoc(doc(db, "mocks", mockId));
        if (!mockSnap.exists()) throw new Error("Mock series not found in registry.");
        const mData = mockSnap.data();
        setMockData(mData);

        const questionIds = mData.questionIds || [];
        const fetchedQuestions: any[] = [];
        
        const chunks = [];
        for (let i = 0; i < questionIds.length; i += 30) {
          chunks.push(questionIds.slice(i, i + 30));
        }

        const chunkSnaps = await Promise.all(
          chunks.map(chunk => getDocs(query(collection(db, "questions"), where(documentId(), "in", chunk))))
        );

        chunkSnaps.forEach(snap => {
          snap.docs.forEach(d => fetchedQuestions.push({ ...d.data(), id: d.id }));
        });

        const sortedQs = questionIds.map(id => fetchedQuestions.find(q => q.id === id)).filter(Boolean);

        if (mData.sections && mData.sections.length > 0) {
           let currentIndex = 0;
           mData.sections.forEach((sec: any) => {
              for (let i = 0; i < sec.count; i++) {
                 if (sortedQs[currentIndex]) {
                    sortedQs[currentIndex].sectionId = sec.name;
                 }
                 currentIndex++;
              }
           });
        }

        if (sortedQs.length === 0) throw new Error("Question bank nodes empty.");

        const attemptRef = doc(db, "attempts", `${user.uid}_${mockId}`);
        const attemptSnap = await getDoc(attemptRef);
        const savedState = attemptSnap.exists() ? attemptSnap.data() : undefined;

        initExam(mockId, mData.title || "Elite Series", user.uid, sortedQs, mData.duration || 120, savedState, mData.languageMode);
      } catch (err: any) {
        toast({ variant: "destructive", title: "Assessment Blocked", description: err.message });
        router.push(`/mocks/${mockId}`);
      } finally {
        setIsInitializing(false);
      }
    }
    loadExam();
  }, [db, user?.uid, mockId, initExam]);

  useEffect(() => {
    if (isInitializing) return;
    const interval = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(interval);
  }, [isInitializing, tick]);

  const handleSubmitFinal = useCallback(async () => {
    if (!db || isSubmittingFinal || !user) return;
    setIsSubmittingFinal(true);
    
    let score = 0;
    const positiveMarks = mockData?.positiveMarks || 1;
    const negativeMarks = mockData?.negativeMarks || 0.25;

    questions.forEach((q, idx) => {
      const studentAnsIdx = answers[idx];
      if (studentAnsIdx === undefined || studentAnsIdx === null) return;

      const correctAnsIdx = ['A', 'B', 'C', 'D'].indexOf(q.correctAnswer);
      if (studentAnsIdx === correctAnsIdx) {
        score += positiveMarks;
      } else {
        score -= negativeMarks;
      }
    });

    const now = Date.now();
    const timeTakenSeconds = Math.round((now - startTime) / 1000);
    const attempted = Object.keys(answers).length;
    const accuracy = attempted > 0 ? Math.max(0, Math.round((score / (attempted * positiveMarks)) * 100)) : 0;

    const resultPayload = {
      userId: user.uid,
      userName: user.displayName || 'Aspirant',
      mockId: mockId,
      mockTitle: mockTitle,
      score: Math.max(0, score),
      totalQuestions: questions.length,
      accuracy,
      timeTaken: timeTakenSeconds,
      answers: answers,
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp()
    };

    const resultRef = doc(db, "results", `${user.uid}_${mockId}`);
    const attemptRef = doc(db, "attempts", `${user.uid}_${mockId}`);

    try {
      await setDoc(resultRef, resultPayload);
      await updateDoc(attemptRef, { status: 'COMPLETED', updatedAt: serverTimestamp() });
      toast({ title: "Assessment Synchronized", description: "Your results have been securely recorded." });
      router.push(`/results/${mockId}`);
    } catch (err: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: resultRef.path, operation: 'create' }));
      setIsSubmittingFinal(false);
    }
  }, [db, user, isSubmittingFinal, questions, answers, router, toast, mockId, mockTitle, mockData, startTime]);

  if (isInitializing) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B1528] space-y-8">
       <Zap className="h-16 w-16 text-primary animate-pulse" />
       <p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">Synchronizing Nodes...</p>
    </div>
  );

  const q = questions[currentIdx];
  const selectedAnswer = answers[currentIdx];

  return (
    <div className="flex flex-col h-[100dvh] bg-white font-body select-none overflow-hidden relative">
      <AntiCheat />
      <ExamHeader 
        onPaletteToggle={() => setIsPaletteOpen(true)} 
        onExitRequest={() => setShowExitModal(true)}
      />

      <main className="flex-1 flex flex-col overflow-hidden relative bg-slate-50/30">
        <AnimatePresence>
          {isPaused && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-[#0B1528]/95 backdrop-blur-xl flex items-center justify-center p-6"
            >
              <div className="bg-white rounded-[3rem] shadow-5xl p-12 space-y-8 text-center max-w-sm w-full">
                 <div className="h-20 w-20 bg-orange-50 rounded-[2rem] flex items-center justify-center mx-auto text-primary shadow-2xl">
                    <Play className="h-10 w-10 fill-current" />
                 </div>
                 <div className="space-y-2">
                    <h2 className="text-2xl font-headline font-black text-[#0F172A] uppercase tracking-tight">Attempt Paused</h2>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Time Node Locked</p>
                 </div>
                 <Button onClick={() => setPaused(false)} className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-3xl">Resume Assessment</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col overflow-hidden">
           <SubjectTabs />
           <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center">
              <div className="w-full max-w-5xl p-2 md:p-6 space-y-3 md:space-y-4">
                 {q ? (
                   <motion.div 
                      key={currentIdx}
                      initial={{ opacity: 0, x: 5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.15 }}
                   >
                     <QuestionRenderer 
                       language={useExamStore.getState().language as any} 
                       question={{...q, displayId: (currentIdx + 1).toString()}} 
                       selectedAnswer={selectedAnswer}
                       onSelect={(idx) => setAnswer(currentIdx, idx, db)}
                       className="shadow-md border-none p-4 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem]"
                     />
                   </motion.div>
                 ) : (
                   <div className="p-20 text-center opacity-20">
                      <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
                      <p className="text-[10px] font-black uppercase">Loading node...</p>
                   </div>
                 )}
                 <TacticalFooter onSubmit={() => setShowSubmitModal(true)} />
              </div>
           </div>
        </div>
      </main>
      
      <Sheet open={isPaletteOpen} onOpenChange={setIsPaletteOpen}>
        <SheetContent 
          side="right" 
          className="p-0 border-none overflow-hidden shadow-5xl w-[85vw] md:w-[400px] h-full"
        >
          <SheetHeader className="sr-only">
             <SheetTitle>Registry Palette</SheetTitle>
          </SheetHeader>
          <QuestionPalette onSelect={(idx) => { useExamStore.getState().setCurrentIdx(idx); setIsPaletteOpen(false); }} onSubmit={() => setShowSubmitModal(true)} />
        </SheetContent>
      </Sheet>

      <Dialog open={showExitModal} onOpenChange={setShowExitModal}>
         <DialogContent className="max-w-[440px] rounded-[2.5rem] p-10 md:p-12 bg-white border-none shadow-5xl text-center">
            <div className="space-y-10">
               <div className="h-16 w-16 bg-blue-50/50 rounded-2xl flex items-center justify-center mx-auto text-blue-500 shadow-inner">
                  <LogOut className="h-8 w-8" />
               </div>
               <div className="space-y-3">
                  <DialogTitle className="text-3xl font-headline font-black uppercase text-[#0F172A] tracking-tight">Pause Assessment?</DialogTitle>
                  <p className="text-sm font-bold text-slate-400 leading-relaxed uppercase tracking-tight">Your current state will be safely cached. You can resume later.</p>
               </div>
               <div className="flex gap-4 pt-4">
                  <Button variant="ghost" onClick={() => setShowExitModal(false)} className="flex-1 h-16 rounded-xl font-black uppercase text-[11px] text-[#0F172A] tracking-widest hover:bg-slate-50">Cancel</Button>
                  <Button 
                    onClick={() => {
                       setShowExitModal(false);
                       router.push('/dashboard');
                    }}
                    className="flex-1 h-16 bg-primary hover:bg-orange-600 text-white rounded-xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-orange-500/20 transition-all border-none"
                  >
                     Yes, Pause
                  </Button>
               </div>
            </div>
         </DialogContent>
      </Dialog>

      <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
         <DialogContent className="max-w-[440px] rounded-[3rem] p-12 bg-[#0F172A] text-white border-none shadow-5xl text-center">
            <div className="space-y-10">
               <div className="h-24 w-24 bg-primary/20 rounded-[3rem] flex items-center justify-center mx-auto text-primary shadow-3xl">
                  <ShieldCheck className="h-12 w-12" />
               </div>
               <div className="space-y-3">
                  <DialogTitle className="text-3xl font-headline font-black uppercase text-white tracking-tight">Submit Test</DialogTitle>
                  <p className="text-slate-400 font-medium leading-relaxed">Are you sure you want to commit your answers? This node will be locked for evaluation.</p>
               </div>
               <div className="flex gap-4 pt-4">
                  <Button variant="ghost" onClick={() => setShowSubmitModal(false)} className="flex-1 h-16 rounded-2xl text-slate-500 hover:text-white font-black uppercase text-[10px] tracking-widest">Cancel</Button>
                  <Button 
                     onClick={handleSubmitFinal}
                     disabled={isSubmittingFinal}
                     className="flex-1 h-16 bg-primary hover:bg-orange-600 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl shadow-3xl shadow-primary/20 gap-3"
                  >
                     {isSubmittingFinal ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                     Submit Hub
                  </Button>
               </div>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}
