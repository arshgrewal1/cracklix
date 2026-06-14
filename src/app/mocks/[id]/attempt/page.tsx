'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFirestore, useUser } from "@/firebase";
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, documentId, getDocs, setDoc } from "firebase/firestore";
import { useExamStore } from "@/store/useExamStore";
import ExamHeader from "@/components/exam/ExamHeader";
import TacticalFooter from "@/components/exam/TacticalFooter";
import AntiCheat from "@/components/exam/AntiCheat";
import QuestionRenderer from "@/components/questions/QuestionRenderer";
import QuestionPalette from "@/components/mocks/QuestionPalette";
import SubjectTabs from "@/components/exam/SubjectTabs";
import { Button } from "@/components/ui/button";
import { Loader2, Play, ShieldCheck, CheckCircle2, Zap, LogOut, Cloud, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Hardened CBT Engine v47.0 (Production Verified).
 * STABILITY: Enhanced null guards for answers and section data.
 * UPDATED: Minimized mobile palette width for better ergonomics.
 */

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

export default function MockAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { user, profile } = useUser();
  const { toast } = useToast();
  const mockId = params.id as string;

  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
  const [mockData, setMockData] = useState<any>(null);

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
  const language = useExamStore(s => s.language); 
  const timeLeft = useExamStore(s => s.timeLeft);

  useEffect(() => {
    async function loadExam() {
      if (!db || !user || !mockId) return;
      try {
        const mockSnap = await getDoc(doc(db, "mocks", mockId));
        if (!mockSnap.exists()) throw new Error("Test registry node not found.");
        const mData = mockSnap.data();
        setMockData(mData);

        const tier = (mData.accessLevel || 'FREE').toUpperCase();
        const userEmail = user.email?.toLowerCase();
        const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || (userEmail && SUPER_ADMIN_WHITELIST.includes(userEmail));
        const hasActivePass = isAdmin || (profile?.pass?.active === true && new Date(profile.pass.expiryDate) > new Date());

        if (tier === 'PREMIUM' && !hasActivePass) {
           router.replace('/pass');
           return;
        }

        const questionIds = mData.questionIds || [];
        if (questionIds.length === 0) throw new Error("Question bank is empty.");

        const fetchedQuestions: any[] = [];
        const chunks = [];
        for (let i = 0; i < questionIds.length; i += 30) { chunks.push(questionIds.slice(i, i + 30)); }
        
        const chunkSnaps = await Promise.all(chunks.map(chunk => getDocs(query(collection(db, "questions"), where(documentId(), "in", chunk)))));
        chunkSnaps.forEach(snap => snap.docs.forEach(d => fetchedQuestions.push({ ...d.data(), id: d.id })));
        
        const sortedQs = questionIds.map(id => fetchedQuestions.find(q => q.id === id)).filter(Boolean);
        if (sortedQs.length === 0) throw new Error("Could not sync preparation nodes.");

        const attemptSnap = await getDoc(doc(db, "attempts", `${user.uid}_${mockId}`));
        initExam(mockId, mData.title || "Elite Series", user.uid, sortedQs, mData.duration || 120, attemptSnap.exists() ? attemptSnap.data() : undefined, mData.languageMode);
      } catch (err: any) {
        console.error("[CBT_INIT_FAIL]:", err);
        setInitError(err.message);
      } finally { 
        setIsInitializing(false); 
      }
    }
    loadExam();
  }, [db, user, profile, mockId, initExam, router]);

  useEffect(() => {
    if (isInitializing || initError) return;
    const interval = setInterval(() => { tick(); }, 1000);
    return () => clearInterval(interval);
  }, [isInitializing, initError, tick]);

  const handleSubmitFinal = useCallback(async () => {
    if (!db || isSubmittingFinal || !user || !mockData) return;
    setIsSubmittingFinal(true);
    
    try {
      let correctCount = 0;
      let wrongCount = 0;
      const attemptedCount = Object.keys(answers || {}).length;

      const posMarks = Number(mockData.positiveMarks) || 1;
      const negMarks = Number(mockData.negativeMarks) || 0.25;

      questions.forEach((q, idx) => {
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

      await setDoc(doc(db, "results", `${user.uid}_${mockId}`), resultPayload);
      await updateDoc(doc(db, "attempts", `${user.uid}_${mockId}`), { status: 'COMPLETED', updatedAt: serverTimestamp() });
      
      router.replace(`/results/${mockId}`);
    } catch (e) {
      console.error("[CBT_SUBMIT_FAIL]:", e);
      toast({ variant: "destructive", title: "Submit Failed", description: "Cloud registry sync interrupted." });
      setIsSubmittingFinal(false);
    }
  }, [db, user, profile, isSubmittingFinal, questions, answers, router, mockId, mockTitle, mockData, startTime, toast]);

  useEffect(() => {
     if (!isInitializing && !initError && timeLeft === 0 && !isSubmittingFinal) {
        handleSubmitFinal();
     }
  }, [timeLeft, isInitializing, initError, isSubmittingFinal, handleSubmitFinal]);

  if (isInitializing) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B1528] space-y-8">
       <Zap className="h-12 w-12 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Synchronizing Hub...</p>
    </div>
  );

  if (initError) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white p-10 text-center space-y-8">
       <AlertCircle className="h-16 w-16 text-rose-500" />
       <div className="space-y-2">
          <h2 className="text-2xl font-headline font-black uppercase text-[#0F172A]">CBT Sync Failure</h2>
          <p className="text-slate-500 font-medium max-w-xs mx-auto">{initError}</p>
       </div>
       <Button onClick={() => router.replace('/mocks')} className="h-14 px-10 bg-[#0F172A] text-white rounded-2xl font-black uppercase text-[10px]">Return to Hub</Button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white font-body select-none overflow-hidden relative touch-pan-y">
      <AntiCheat />
      <ExamHeader onPaletteToggle={() => setIsPaletteOpen(true)} onExitRequest={() => setShowExitModal(true)} />
      
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
        <AnimatePresence>
          {isPaused && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-[#0B1528]/95 backdrop-blur-xl flex items-center justify-center p-6">
              <div className="bg-white rounded-[2.5rem] p-10 space-y-8 text-center max-w-xs shadow-5xl border-none">
                <div className="h-16 w-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto text-primary shadow-xl">
                  <Play className="h-8 w-8 fill-current" />
                </div>
                <h2 className="text-xl font-headline font-black text-[#0F172A] uppercase">Test Paused</h2>
                <Button onClick={() => setPaused(false)} className="w-full h-14 bg-primary text-white rounded-xl font-black uppercase text-[10px]">Resume Now</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <SubjectTabs />
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center px-4 pt-4 pb-32">
            <div className="w-full max-w-4xl space-y-4">
              {questions[currentIdx] ? (
                <motion.div key={currentIdx} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                  <QuestionRenderer 
                    language={language} 
                    question={{...questions[currentIdx], displayId: (currentIdx + 1).toString()}} 
                    selectedAnswer={answers?.[currentIdx]} 
                    onSelect={(idx) => setAnswer(currentIdx, idx, db)} 
                    className="shadow-xl border-none p-6 md:p-10 rounded-2xl md:rounded-[3rem]" 
                  />
                </motion.div>
              ) : (
                <div className="py-20 text-center opacity-20">
                   <Zap className="h-10 w-10 mx-auto mb-4" />
                   <p className="font-black uppercase tracking-widest text-xs">Awaiting question node...</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none">
             <div className="max-w-4xl mx-auto pointer-events-auto">
                <TacticalFooter onSubmit={() => setShowSubmitModal(true)} />
             </div>
          </div>
        </div>
      </main>

      <Sheet open={isPaletteOpen} onOpenChange={setIsPaletteOpen}>
        <SheetContent side="right" className="p-0 border-none w-[260px] md:w-[400px] h-full shadow-5xl z-[1200]">
          <SheetHeader className="sr-only">
             <SheetTitle>Navigation Palette</SheetTitle>
             <SheetDescription>View and navigate through all questions in the current mock test.</SheetDescription>
          </SheetHeader>
          <QuestionPalette onSelect={(idx) => { useExamStore.getState().setCurrentIdx(idx); setIsPaletteOpen(false); }} onSubmit={() => { setIsPaletteOpen(false); setShowSubmitModal(true); }} />
        </SheetContent>
      </Sheet>

      <Dialog open={showExitModal} onOpenChange={setShowExitModal}>
        <DialogContent className="max-w-[360px] rounded-[2.5rem] p-8 bg-white text-center shadow-5xl border-none z-[1300]">
          <div className="space-y-8">
            <DialogHeader className="sr-only">
               <DialogTitle>Save & Exit?</DialogTitle>
               <DialogDescription>Your current attempt state is safely cached in the cloud.</DialogDescription>
            </DialogHeader>
            <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto text-blue-500 shadow-inner">
              <LogOut className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-headline font-black uppercase text-[#0F172A]">Save & Exit?</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Your current attempt state is safely cached in the cloud registry node.</p>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowExitModal(false)} className="flex-1 h-12 font-black uppercase text-[10px] tracking-widest">Stay</Button>
              <Button onClick={() => { setPaused(false); setShowExitModal(false); router.replace('/dashboard'); }} className="flex-1 h-12 bg-primary text-white rounded-xl font-black uppercase text-[10px] shadow-lg border-none">Exit</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSubmitModal} onOpenChange={showSubmitModal && !isSubmittingFinal ? setShowSubmitModal : undefined}>
        <DialogContent className="max-w-[360px] rounded-[3rem] p-10 bg-[#0F172A] text-white text-center border-none shadow-5xl z-[1300]">
          <div className="space-y-8">
            <DialogHeader className="sr-only">
               <DialogTitle>Final Submission</DialogTitle>
               <DialogDescription>Finish and score your test to commit it to the state merit list.</DialogDescription>
            </DialogHeader>
            <div className="h-20 w-20 bg-primary/20 rounded-[2rem] flex items-center justify-center mx-auto text-primary shadow-2xl">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-headline font-black uppercase text-white tracking-tight">Final Submission</h2>
            <p className="text-slate-400 text-xs font-medium px-2 leading-relaxed uppercase">Ensure all sections have been reviewed. Once submitted, your scores will be committed to the state merit list.</p>
            <div className="flex flex-col gap-3 pt-4">
              <Button onClick={handleSubmitFinal} disabled={isSubmittingFinal} className="w-full h-14 bg-primary hover:bg-orange-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-2xl border-none">
                {isSubmittingFinal ? <Loader2 className="h-4 w-4 animate-spin" /> : "Finish & Score Test"}
              </Button>
              <button onClick={() => setShowSubmitModal(false)} disabled={isSubmittingFinal} className="h-10 text-slate-500 font-bold uppercase text-[9px] tracking-widest hover:text-white transition-colors cursor-pointer">Back to Questions</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
