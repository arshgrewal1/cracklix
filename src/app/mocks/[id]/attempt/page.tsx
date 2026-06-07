'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFirestore, useUser } from "@/firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, documentId, getDocs } from "firebase/firestore";
import { useExamStore } from "@/store/useExamStore";
import ExamHeader from "@/components/exam/ExamHeader";
import SubjectTabs from "@/components/exam/SubjectTabs";
import TacticalFooter from "@/components/exam/TacticalFooter";
import AntiCheat from "@/components/exam/AntiCheat";
import QuestionRenderer from "@/components/questions/QuestionRenderer";
import QuestionPalette from "@/components/mocks/QuestionPalette";
import { Button } from "@/components/ui/button";
import { Loader2, Play, ShieldCheck, CheckCircle2, Trophy, AlertTriangle, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function MockAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const mockId = params.id as string;

  const [isInitializing, setIsInitializing] = useState(true);
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);

  const examStore = useExamStore();

  useEffect(() => {
    async function loadExam() {
      if (!db || typeof db !== 'object' || !user || !mockId) return;
      try {
        const mockSnap = await getDoc(doc(db, "mocks", mockId));
        if (!mockSnap.exists()) throw new Error("Mock series not found.");
        const mockData = mockSnap.data();

        const questionIds = mockData.questionIds || [];
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

        const questions = questionIds.map(id => fetchedQuestions.find(q => q.id === id)).filter(Boolean);

        if (mockData.sections && mockData.sections.length > 0) {
           let currentIndex = 0;
           mockData.sections.forEach((sec: any) => {
              for (let i = 0; i < sec.count; i++) {
                 if (questions[currentIndex]) {
                    questions[currentIndex].sectionId = sec.name;
                 }
                 currentIndex++;
              }
           });
        }

        if (questions.length === 0) throw new Error("Question bank node empty.");

        const attemptRef = doc(db, "attempts", `${user.uid}_${mockId}`);
        const attemptSnap = await getDoc(attemptRef);
        const savedState = attemptSnap.exists() ? attemptSnap.data() : undefined;

        examStore.initExam(mockId, mockData.title || "Evaluation Series", user.uid, questions, mockData.duration || 120, savedState);
      } catch (err: any) {
        toast({ variant: "destructive", title: "Sync Failure", description: err.message });
        router.push(`/mocks/${mockId}`);
      } finally {
        setIsInitializing(false);
      }
    }
    loadExam();
  }, [db, user, mockId, router, toast]);

  useEffect(() => {
    if (isInitializing) return;
    const interval = setInterval(() => {
      examStore.tick();
    }, 1000);
    return () => clearInterval(interval);
  }, [isInitializing, examStore]);

  const stats = useMemo(() => {
    const s = { answered: 0, marked: 0, notAnswered: 0, notVisited: 0, ansMarked: 0 };
    examStore.questions.forEach((_, i) => {
      const st = examStore.status[i];
      if (st === 'answered') s.answered++;
      else if (st === 'marked') s.marked++;
      else if (st === 'answered-marked') s.ansMarked++;
      else if (examStore.visited.includes(i)) s.notAnswered++;
      else s.notVisited++;
    });
    return s;
  }, [examStore.questions, examStore.status, examStore.visited]);

  const handleSubmitFinal = useCallback(async () => {
    if (!db || isSubmittingFinal || !user) return;
    setIsSubmittingFinal(true);
    
    let score = 0;
    examStore.questions.forEach((q, idx) => {
      const studentAnsIdx = examStore.answers[idx];
      const correctAnsIdx = ['A', 'B', 'C', 'D'].indexOf(q.correctAnswer);
      if (studentAnsIdx === correctAnsIdx) score += 1;
      else if (studentAnsIdx !== undefined) score -= 0.25;
    });

    const attempted = Object.keys(examStore.answers).length;
    const accuracy = attempted > 0 ? Math.round((score / attempted) * 100) : 0;

    const resultPayload = {
      userId: user.uid,
      mockId: examStore.mockId,
      mockTitle: examStore.mockTitle,
      score,
      totalQuestions: examStore.questions.length,
      accuracy,
      answers: examStore.answers,
      timestamp: new Date().toISOString(),
      timeTaken: (examStore.questions.length * 60) - examStore.timeLeft,
      createdAt: serverTimestamp()
    };

    const resultRef = doc(db, "results", `${user.uid}_${mockId}`);
    setDoc(resultRef, resultPayload).catch(() => {});
    updateDoc(doc(db, "attempts", `${user.uid}_${mockId}`), { status: 'COMPLETED', updatedAt: serverTimestamp() }).catch(() => {});
    
    toast({ title: "Assessment Synced" });
    router.push(`/results/${mockId}`);
  }, [db, user, isSubmittingFinal, examStore, router, toast, mockId]);

  if (isInitializing) return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-white space-y-4">
       <Loader2 className="h-8 w-8 text-primary animate-spin" />
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Synchronizing Hub...</p>
    </div>
  );

  const q = examStore.questions[examStore.currentIdx];
  const selectedAnswer = examStore.answers[examStore.currentIdx];

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 font-body select-none overflow-hidden relative">
      <AntiCheat />
      <ExamHeader 
        onPaletteToggle={() => setIsMobilePaletteOpen(true)} 
        onExitRequest={() => setShowExitModal(true)}
      />
      <SubjectTabs />

      <main className="flex-1 flex overflow-hidden relative">
        <AnimatePresence>
          {examStore.isPaused && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-md flex items-center justify-center p-4"
            >
              <div className="mobile-app-shell bg-white rounded-[2rem] shadow-2xl p-8 space-y-6 text-center">
                 <div className="h-14 w-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto text-primary">
                    <Play className="h-7 w-7 fill-current" />
                 </div>
                 <h2 className="text-xl font-headline font-black text-[#0F172A] uppercase">Test Paused</h2>
                 <div className="grid grid-cols-2 gap-3">
                    <ResumeStat label="Ans." val={stats.answered} color="text-blue-600 bg-blue-50" />
                    <ResumeStat label="Marked" val={stats.marked} color="text-violet-600 bg-violet-50" />
                 </div>
                 <Button onClick={() => examStore.setPaused(false)} className="w-full h-14 bg-primary text-white rounded-xl font-black uppercase tracking-widest">Resume Attempt</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 flex flex-col items-center">
           <div className="mobile-app-shell p-2 space-y-2">
              {q && (
                <>
                  <QuestionRenderer 
                    language={examStore.language} 
                    question={{...q, displayId: (examStore.currentIdx + 1).toString()}} 
                    selectedAnswer={selectedAnswer}
                    onSelect={(idx) => examStore.setAnswer(examStore.currentIdx, idx, db)}
                  />
                  <TacticalFooter onSubmit={() => setShowSubmitModal(true)} />
                </>
              )}
           </div>
        </div>

        <aside className="hidden lg:block w-[320px] bg-white border-l h-full">
           <QuestionPalette onSelect={(idx) => examStore.setCurrentIdx(idx)} onSubmit={() => setShowSubmitModal(true)} />
        </aside>
      </main>
      
      <Sheet open={isMobilePaletteOpen} onOpenChange={setIsMobilePaletteOpen}>
        <SheetContent side="bottom" className="h-[65dvh] p-0 border-none rounded-t-[2.5rem] overflow-hidden">
          <QuestionPalette onSelect={(idx) => { examStore.setCurrentIdx(idx); setIsMobilePaletteOpen(false); }} onSubmit={() => setShowSubmitModal(true)} />
        </SheetContent>
      </Sheet>

      <Dialog open={showExitModal} onOpenChange={setShowExitModal}>
         <DialogContent className="mobile-app-shell rounded-3xl p-8 bg-white text-center border-none">
            <DialogHeader className="space-y-4">
               <div className="h-16 w-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-500"><AlertTriangle className="h-8 w-8" /></div>
               <DialogTitle className="text-xl font-headline font-black text-[#0F172A] uppercase">Terminate Session?</DialogTitle>
               <p className="text-slate-500 text-sm font-medium">Timer continues in cloud. Re-entry allowed until expiration.</p>
            </DialogHeader>
            <DialogFooter className="flex flex-col gap-3 mt-6">
               <Button onClick={() => setShowExitModal(false)} className="w-full h-12 bg-slate-100 text-slate-600 rounded-xl font-bold uppercase">Stay in Test</Button>
               <Button variant="ghost" onClick={() => router.push('/dashboard')} className="w-full h-10 text-rose-500 font-bold uppercase tracking-widest">Confirm Exit</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}

function ResumeStat({ label, val, color }: any) {
   return (
      <div className={cn("p-3 rounded-xl flex flex-col items-center", color)}>
         <span className="text-[8px] font-black uppercase tracking-widest opacity-60">{label}</span>
         <span className="text-lg font-headline font-black">{val}</span>
      </div>
   )
}