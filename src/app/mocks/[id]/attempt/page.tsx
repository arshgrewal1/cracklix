
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
import { Loader2, Play, ShieldCheck, CheckCircle2, Zap, LogOut, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * @fileOverview Elite CBT Attempt Engine v16.0.
 * HARDENED: Strict entrance gate for Premium content. Even direct URL access is blocked.
 */

export default function MockAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { user, profile } = useUser();
  const { toast } = useToast();
  const mockId = params.id as string;

  const [isInitializing, setIsInitializing] = useState(true);
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

  useEffect(() => {
    async function loadExam() {
      if (!db || !user || !mockId) return;
      try {
        const mockSnap = await getDoc(doc(db, "mocks", mockId));
        if (!mockSnap.exists()) throw new Error("Test series not found.");
        const mData = mockSnap.data();
        setMockData(mData);

        // STABILIZED ACCESS FIREWALL
        const tier = (mData.accessLevel || mData.accessType || 'FREE').trim().toUpperCase();
        const isPremium = tier === 'PREMIUM';
        const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN';
        
        let hasActivePass = false;
        if (isAdmin) {
          hasActivePass = true;
        } else if (profile?.pass && profile.pass.active === true) {
          const expiry = new Date(profile.pass.expiryDate);
          if (expiry > new Date()) hasActivePass = true;
        }

        if (isPremium && !hasActivePass) {
           toast({ variant: "destructive", title: "Access Denied", description: "Premium pass required for this series." });
           router.push('/pass');
           return;
        }

        const questionIds = mData.questionIds || [];
        const fetchedQuestions: any[] = [];
        const chunks = [];
        for (let i = 0; i < questionIds.length; i += 30) { chunks.push(questionIds.slice(i, i + 30)); }
        const chunkSnaps = await Promise.all(chunks.map(chunk => getDocs(query(collection(db, "questions"), where(documentId(), "in", chunk)))));
        chunkSnaps.forEach(snap => snap.docs.forEach(d => fetchedQuestions.push({ ...d.data(), id: d.id })));
        const sortedQs = questionIds.map(id => fetchedQuestions.find(q => q.id === id)).filter(Boolean);
        if (sortedQs.length === 0) throw new Error("Question bank is empty.");

        const attemptSnap = await getDoc(doc(db, "attempts", `${user.uid}_${mockId}`));
        initExam(mockId, mData.title || "Elite Series", user.uid, sortedQs, mData.duration || 120, attemptSnap.exists() ? attemptSnap.data() : undefined, mData.languageMode);
      } catch (err: any) {
        toast({ variant: "destructive", title: "Test Blocked", description: err.message });
        router.push(`/mocks/${mockId}`);
      } finally { setIsInitializing(false); }
    }
    loadExam();
  }, [db, user?.uid, profile, mockId, initExam, router, toast]);

  useEffect(() => {
    if (isInitializing) return;
    const interval = setInterval(() => { tick(); }, 1000);
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
      if (['A', 'B', 'C', 'D'].indexOf(q.correctAnswer) === studentAnsIdx) score += positiveMarks;
      else score -= negativeMarks;
    });
    const resultPayload = {
      userId: user.uid, userName: user.displayName || 'Aspirant', mockId, mockTitle,
      score: Math.max(0, score), totalQuestions: questions.length, accuracy: Math.max(0, Math.round((score / (Object.keys(answers).length * positiveMarks || 1)) * 100)),
      timeTaken: Math.round((Date.now() - startTime) / 1000), answers, timestamp: new Date().toISOString(), createdAt: serverTimestamp()
    };
    await setDoc(doc(db, "results", `${user.uid}_${mockId}`), resultPayload);
    await updateDoc(doc(db, "attempts", `${user.uid}_${mockId}`), { status: 'COMPLETED', updatedAt: serverTimestamp() });
    router.push(`/results/${mockId}`);
  }, [db, user, isSubmittingFinal, questions, answers, router, mockId, mockTitle, mockData, startTime]);

  const handleManualExit = () => {
    setPaused(false);
    setShowExitModal(false);
    window.location.href = '/dashboard';
  };

  if (isInitializing) return <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B1528] space-y-8"><Zap className="h-16 w-16 text-primary animate-pulse" /><p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">Loading Questions...</p></div>;

  return (
    <div className="flex flex-col h-[100dvh] bg-white font-body select-none overflow-hidden relative">
      <AntiCheat />
      <ExamHeader onPaletteToggle={() => setIsPaletteOpen(true)} onExitRequest={() => setShowExitModal(true)} />
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50/30">
        <AnimatePresence>{isPaused && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] bg-[#0B1528]/95 backdrop-blur-xl flex items-center justify-center p-6"><div className="bg-white rounded-[3rem] p-12 space-y-8 text-center max-w-sm"><div className="h-20 w-20 bg-orange-50 rounded-[2rem] flex items-center justify-center mx-auto text-primary shadow-2xl"><Play className="h-10 w-10 fill-current" /></div><h2 className="text-2xl font-headline font-black text-[#0F172A] uppercase">Test Paused</h2><Button onClick={() => setPaused(false)} className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase text-[10px]">Resume Test</Button></div></motion.div>)}</AnimatePresence>
        <div className="flex-1 flex flex-col overflow-hidden"><SubjectTabs /><div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center"><div className="w-full max-w-5xl p-2 md:p-6 space-y-4">{questions[currentIdx] && <motion.div key={currentIdx} initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }}><QuestionRenderer language={language} question={{...questions[currentIdx], displayId: (currentIdx + 1).toString()}} selectedAnswer={answers[currentIdx]} onSelect={(idx) => setAnswer(currentIdx, idx, db)} className="shadow-md border-none p-4 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem]" /></motion.div>}<TacticalFooter onSubmit={() => setShowSubmitModal(true)} /></div></div></div>
      </main>
      <Sheet open={isPaletteOpen} onOpenChange={setIsPaletteOpen}><SheetContent side="right" className="p-0 border-none w-[85vw] md:w-[400px] h-full"><SheetHeader className="sr-only"><SheetTitle>Question Map</SheetTitle></SheetHeader><QuestionPalette onSelect={(idx) => { useExamStore.getState().setCurrentIdx(idx); setIsPaletteOpen(false); }} onSubmit={() => setShowSubmitModal(true)} /></SheetContent></Sheet>
      <Dialog open={showExitModal} onOpenChange={setShowExitModal}><DialogContent className="max-w-[440px] rounded-[2.5rem] p-12 bg-white text-center"><div className="space-y-10"><div className="h-16 w-16 bg-blue-50/50 rounded-2xl flex items-center justify-center mx-auto text-blue-500"><LogOut className="h-8 w-8" /></div><DialogTitle className="text-3xl font-headline font-black uppercase text-[#0F172A]">Pause Test?</DialogTitle><p className="text-sm font-bold text-slate-400 uppercase">Your progress will be saved. You can resume later.</p><div className="flex gap-4 pt-4"><Button variant="ghost" onClick={() => setShowExitModal(false)} className="flex-1 h-16 font-black uppercase text-[11px]">Cancel</Button><Button onClick={handleManualExit} className="flex-1 h-16 bg-[#F97316] text-white rounded-xl font-black uppercase text-[11px] shadow-xl border-none">Save & Exit</Button></div></div></DialogContent></Dialog>
      <Dialog open={showSubmitModal} onOpenChange={show => !isSubmittingFinal && setShowSubmitModal(show)}><DialogContent className="max-w-[440px] rounded-[3rem] p-12 bg-[#0F172A] text-white text-center"><div className="space-y-10"><div className="h-24 w-24 bg-primary/20 rounded-[3rem] flex items-center justify-center mx-auto text-primary shadow-3xl"><ShieldCheck className="h-12 w-12" /></div><DialogTitle className="text-3xl font-headline font-black uppercase text-white">Finish Test</DialogTitle><p className="text-slate-400 font-medium">Are you sure you want to submit?</p><div className="flex gap-4 pt-4"><Button variant="ghost" onClick={() => setShowSubmitModal(false)} disabled={isSubmittingFinal} className="flex-1 h-16 text-slate-500 font-black uppercase text-[10px]">Go Back</Button><Button onClick={handleSubmitFinal} disabled={isSubmittingFinal} className="flex-1 h-16 bg-primary text-white font-black uppercase text-[10px] rounded-2xl shadow-3xl border-none">{isSubmittingFinal ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Submit Hub</Button></div></div></DialogContent></Dialog>
    </div>
  );
}
