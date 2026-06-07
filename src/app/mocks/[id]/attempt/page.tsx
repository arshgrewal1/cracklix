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

/**
 * @fileOverview Final CBT Attempt Node v20.1.
 * Optimized: High-speed loading and robust session reset.
 */

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
        if (!mockSnap.exists()) throw new Error("Mock series not found in registry.");
        const mockData = mockSnap.data();

        const questionIds = mockData.questionIds || [];
        const fetchedQuestions: any[] = [];
        
        // High-velocity chunked hydration
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

        if (questions.length === 0) throw new Error("This mock has no questions available.");

        // Fast session retrieval
        const attemptRef = doc(db, "attempts", `${user.uid}_${mockId}`);
        const attemptSnap = await getDoc(attemptRef);
        const savedState = attemptSnap.exists() ? attemptSnap.data() : undefined;

        examStore.initExam(mockId, mockData.title || "Evaluation Series", user.uid, questions, mockData.duration || 120, savedState);
      } catch (err: any) {
        toast({ variant: "destructive", title: "CBT Sync Failure", description: err.message });
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
      if (examStore.timeLeft <= 0 && !isSubmittingFinal && examStore.endTime > 0) {
         handleSubmitFinal();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isInitializing, examStore.timeLeft, isSubmittingFinal, examStore.endTime]);

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
    if (!db || typeof db !== 'object' || !user || isSubmittingFinal) return;
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
    
    // Non-blocking submission
    setDoc(resultRef, resultPayload).catch(async (err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: resultRef.path,
        operation: 'write',
        requestResourceData: resultPayload
      }));
    });

    updateDoc(doc(db, "attempts", `${user.uid}_${mockId}`), { 
      status: 'COMPLETED', 
      updatedAt: serverTimestamp() 
    }).catch(() => {});
    
    toast({ title: "Assessment Synced" });
    router.push(`/results/${mockId}`);
  }, [db, user, isSubmittingFinal, examStore, router, toast, mockId]);

  if (isInitializing) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-6">
       <Loader2 className="h-10 w-10 text-primary animate-spin" />
       <div className="text-center">
          <p className="font-black uppercase text-[10px] tracking-[0.4em] text-primary">Institutional Node</p>
          <p className="text-sm font-bold text-slate-400 mt-2">Syncing Evaluation Engine...</p>
       </div>
    </div>
  );

  const q = examStore.questions[examStore.currentIdx];
  const selectedAnswer = examStore.answers[examStore.currentIdx];

  return (
    <div className="flex flex-col h-screen bg-black font-body select-none overflow-hidden">
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            >
              <div className="max-w-md w-full bg-white rounded-[2rem] shadow-5xl overflow-hidden">
                 <div className="bg-slate-50 p-6 border-b border-slate-100 text-center space-y-3">
                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
                       <Play className="h-6 w-6 fill-current" />
                    </div>
                    <div>
                       <h2 className="text-xl md:text-2xl font-headline font-black text-[#0F172A] uppercase tracking-tight">TEST PAUSED</h2>
                       <p className="text-slate-500 font-medium uppercase text-[8px] tracking-widest mt-1">Institutional Progress Audit</p>
                    </div>
                 </div>
                 <div className="p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                       <ResumeStat label="Answered" val={stats.answered + stats.ansMarked} color="bg-blue-600" />
                       <ResumeStat label="Not Ans." val={stats.notAnswered} color="bg-slate-400" />
                       <ResumeStat label="Marked" val={stats.marked + stats.ansMarked} color="bg-pink-500" />
                       <ResumeStat label="Remaining" val={stats.notVisited} color="bg-slate-50" textColor="text-slate-300" />
                    </div>
                    <Button onClick={() => examStore.setPaused(false)} className="w-full h-14 bg-primary hover:bg-orange-600 text-white rounded-[1rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-3xl gap-4">
                       <Play className="h-4 w-4 fill-current" /> RESUME EVALUATION
                    </Button>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black flex flex-col items-center">
           <div className="w-full max-w-[920px] p-2 md:p-6 lg:p-8 space-y-2">
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

        <AnimatePresence>
          {examStore.isPaletteVisible && (
            <motion.aside 
              initial={{ x: 380 }}
              animate={{ x: 0 }}
              exit={{ x: 380 }}
              className="hidden lg:block w-[320px] shrink-0 h-full border-l border-white/5 bg-white"
            >
               <QuestionPalette onSelect={(idx) => examStore.setCurrentIdx(idx)} onSubmit={() => setShowSubmitModal(true)} />
            </motion.aside>
          )}
        </AnimatePresence>
      </main>
      
      <Sheet open={isMobilePaletteOpen} onOpenChange={setIsMobilePaletteOpen}>
        <SheetContent side="bottom" className="h-[65vh] p-0 border-none rounded-t-[3rem] overflow-hidden">
          <SheetHeader className="p-4 md:p-6 border-b shrink-0 bg-slate-50">
             <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-2 opacity-50" />
             <SheetTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">CBT Navigation Palette</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            <QuestionPalette onSelect={(idx) => { examStore.setCurrentIdx(idx); setIsMobilePaletteOpen(false); }} onSubmit={() => setShowSubmitModal(true)} />
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
         <DialogContent className="max-w-[420px] w-[95vw] rounded-[2rem] p-6 md:p-8 bg-white border-none shadow-5xl text-left">
            <DialogHeader className="text-center space-y-3">
               <div className="h-12 w-12 bg-emerald-50 rounded-[1.25rem] flex items-center justify-center mx-auto text-emerald-600">
                  <ShieldCheck className="h-7 w-7" />
               </div>
               <div>
                  <DialogTitle className="text-xl md:text-2xl font-headline font-black text-[#0F172A] uppercase tracking-tight">COMMIT ASSESSMENT</DialogTitle>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px] mt-1 text-center">Audit Registry for {examStore.mockTitle}</p>
               </div>
            </DialogHeader>

            <div className="py-6 grid grid-cols-2 gap-2.5">
               <SubmissionNode label="Attempted Nodes" val={stats.answered + stats.ansMarked} color="text-emerald-600" icon={<CheckCircle2 className="h-3 w-3" />} />
               <SubmissionNode label="Logic Review" val={stats.marked + stats.ansMarked} color="text-violet-600" />
               <SubmissionNode label="Total Atomic Qs" val={examStore.questions.length} color="text-[#0F172A]" icon={<Trophy className="h-3 w-3" />} />
            </div>

            <DialogFooter className="flex flex-col gap-2.5 pt-2">
               <Button onClick={handleSubmitFinal} disabled={isSubmittingFinal} className="w-full h-14 bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-[0.2em] text-[9px] rounded-xl shadow-2xl transition-all active:scale-95">
                  {isSubmittingFinal ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                  FINALIZE & SYNC REGISTRY
               </Button>
               <Button variant="ghost" onClick={() => setShowSubmitModal(false)} className="w-full h-8 text-slate-400 font-black uppercase text-[9px] tracking-widest hover:text-[#0F172A]">RE-AUDIT QUESTIONS</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      <Dialog open={showExitModal} onOpenChange={setShowExitModal}>
         <DialogContent className="max-w-[400px] w-[90vw] rounded-[2rem] p-8 bg-white border-none shadow-5xl text-center">
            <DialogHeader className="space-y-4">
               <div className="h-16 w-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
                  <AlertTriangle className="h-8 w-8" />
               </div>
               <DialogTitle className="text-2xl font-headline font-black text-[#0F172A] uppercase">Leave Evaluation?</DialogTitle>
               <p className="text-slate-500 font-medium text-sm leading-relaxed">
                  Your progress is auto-saved, but the timer will continue to run in the background. Are you sure you want to exit the CBT node?
               </p>
            </DialogHeader>
            <DialogFooter className="flex flex-col gap-3 mt-8">
               <Button onClick={() => setShowExitModal(false)} className="w-full h-14 bg-[#0F172A] text-white rounded-xl font-black uppercase text-[10px] tracking-widest">
                  Continue Evaluation
               </Button>
               <Button variant="ghost" onClick={() => router.push('/dashboard')} className="w-full h-10 text-rose-500 hover:bg-rose-50 font-black uppercase text-[10px] tracking-widest gap-2">
                  <LogOut className="h-4 w-4" /> Leave Assessment
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}

function ResumeStat({ label, val, color, textColor = "text-white" }: any) {
   return (
      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center">
         <span className="text-[7px] font-black uppercase text-slate-400 mb-1 tracking-tighter text-center">{label}</span>
         <div className={cn("h-7 w-9 rounded-lg flex items-center justify-center text-xs font-black shadow-md", color, textColor)}>
            {val}
         </div>
      </div>
   )
}

function SubmissionNode({ label, val, color, icon }: any) {
   return (
      <div className="p-4 md:p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 text-left space-y-2.5">
         {icon && <div className={cn("h-6 w-6 rounded-lg flex items-center justify-center bg-white shadow-sm", color)}>{icon}</div>}
         <div className="space-y-0.5">
            <p className="text-[7px] md:text-[8px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
            <p className={cn("text-xl md:text-2xl font-headline font-black", color)}>{val}</p>
         </div>
      </div>
   )
}
