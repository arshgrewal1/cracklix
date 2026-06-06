
'use client';

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFirestore, useUser } from "@/firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useExamStore } from "@/store/useExamStore";
import ExamHeader from "@/components/exam/ExamHeader";
import SubjectTabs from "@/components/exam/SubjectTabs";
import TacticalFooter from "@/components/exam/TacticalFooter";
import AntiCheat from "@/components/exam/AntiCheat";
import QuestionRenderer from "@/components/questions/QuestionRenderer";
import QuestionPalette from "@/components/mocks/QuestionPalette";
import { Button } from "@/components/ui/button";
import { Loader2, Play, ShieldCheck, CheckCircle2, History, Zap, Trophy, TrendingUp, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

/**
 * @fileOverview Final Production-Grade CBT Evaluation Hub.
 * Strictly implements Auto-Save, Resume, and High-Density professional layout.
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
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);

  const examStore = useExamStore();

  useEffect(() => {
    async function loadExam() {
      if (!db || !user || !mockId) return;
      try {
        const mockSnap = await getDoc(doc(db, "mocks", mockId));
        if (!mockSnap.exists()) throw new Error("Mock series not found in registry.");
        const mockData = mockSnap.data();

        const qSnaps = await Promise.all(
          mockData.questionIds.map((id: string) => getDoc(doc(db, "questions", id)))
        );
        const questions = qSnaps.map(s => ({ ...s.data(), id: s.id })).filter(Boolean) as any[];

        // RESUME LOGIC HUB
        const attemptSnap = await getDoc(doc(db, "attempts", `${user.uid}_${mockId}`));
        const savedState = attemptSnap.exists() ? attemptSnap.data() : undefined;

        if (!attemptSnap.exists()) {
           const startTime = Date.now();
           const endTime = startTime + (mockData.duration * 60 * 1000);
           
           await setDoc(doc(db, 'attempts', `${user.uid}_${mockId}`), {
              userId: user.uid,
              mockId,
              mockTitle: mockData.title,
              status: 'IN_PROGRESS',
              startedAt: serverTimestamp(),
              answers: {},
              status: {},
              visited: [0],
              currentIdx: 0,
              startTime,
              endTime,
              violations: 0
           });
        }

        examStore.initExam(mockId, mockTitle, user.uid, questions, mockData.duration, savedState);
      } catch (err: any) {
        toast({ variant: "destructive", title: "CBT Sync Failure", description: err.message });
        router.push(`/mocks/${mockId}`);
      } finally {
        setIsInitializing(false);
      }
    }
    loadExam();
  }, [db, user, mockId]);

  // Global Timer Tick
  useEffect(() => {
    if (isInitializing) return;
    const interval = setInterval(() => {
      examStore.tick();
      if (examStore.timeLeft <= 0 && !isSubmittingFinal) {
         handleSubmitFinal();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isInitializing, examStore.timeLeft]);

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

  const handleSubmitFinal = async () => {
    if (!db || !user) return;
    setIsSubmittingFinal(true);
    
    try {
      let score = 0;
      examStore.questions.forEach((q, idx) => {
        const studentAnsIdx = examStore.answers[idx];
        const correctAnsIdx = ['A', 'B', 'C', 'D'].indexOf(q.correctAnswer);
        if (studentAnsIdx === correctAnsIdx) score += 1;
        else if (studentAnsIdx !== undefined) score -= 0.25;
      });

      const accuracy = Math.round((score / (Object.keys(examStore.answers).length || 1)) * 100);

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
      };

      await setDoc(doc(db, "results", `${user.uid}_${mockId}`), resultPayload);
      await updateDoc(doc(db, "attempts", `${user.uid}_${mockId}`), { status: 'COMPLETED', updatedAt: serverTimestamp() });
      
      toast({ title: "Audit Synchronized" });
      router.push(`/results/${mockId}`);
    } catch (e) {
      toast({ variant: "destructive", title: "Cloud Registry Sync Error" });
    } finally {
      setIsSubmittingFinal(false);
      setShowSubmitModal(false);
    }
  };

  if (isInitializing) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-6">
       <Loader2 className="h-10 w-10 text-[#F97316] animate-spin" />
       <div className="text-center">
          <p className="font-black uppercase text-[10px] tracking-[0.4em] text-[#F97316]">Institutional Node</p>
          <p className="text-sm font-bold text-slate-400 mt-2">Syncing Evaluation Engine...</p>
       </div>
    </div>
  );

  const q = examStore.questions[examStore.currentIdx];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 font-body select-none">
      <AntiCheat />
      <ExamHeader onPaletteToggle={() => setIsPaletteOpen(true)} />
      <SubjectTabs />

      <main className="flex-1 flex overflow-hidden relative">
        {/* RESUME INTERFACE */}
        {examStore.isPaused && (
           <div className="absolute inset-0 z-[100] bg-[#0B1528]/95 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-300 p-6">
              <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-5xl overflow-hidden">
                 <div className="bg-slate-50 p-12 border-b border-slate-100 text-center space-y-6 text-left">
                    <div className="h-20 w-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto text-[#F97316] shadow-2xl">
                       <Play className="h-10 w-10 fill-current" />
                    </div>
                    <div>
                       <h2 className="text-4xl font-headline font-black text-[#0F172A] uppercase tracking-tight text-center">TEST PAUSED</h2>
                       <p className="text-slate-500 font-medium uppercase text-[10px] tracking-widest mt-2 text-center">Institutional Progress Audit</p>
                    </div>
                 </div>
                 <div className="p-12 space-y-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       <ResumeStat label="Answered" val={stats.answered} color="bg-blue-600" />
                       <ResumeStat label="Not Answered" val={stats.notAnswered} color="bg-slate-400" />
                       <ResumeStat label="Marked" val={stats.marked} color="bg-pink-500" />
                       <ResumeStat label="Remaining" val={stats.notVisited} color="bg-slate-50" textColor="text-slate-300" />
                    </div>
                    <div className="flex flex-col gap-4">
                       <Button onClick={() => examStore.setPaused(false)} className="w-full h-20 bg-[#F97316] hover:bg-orange-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-3xl gap-4">
                          <Play className="h-6 w-6 fill-current" /> RESUME EVALUATION
                       </Button>
                    </div>
                 </div>
              </div>
           </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
           <div className="max-w-[900px] mx-auto pb-24">
              <QuestionRenderer 
                 language={examStore.language} 
                 question={{...q, displayId: (examStore.currentIdx + 1).toString()}} 
              />
           </div>
        </div>

        <aside className="hidden lg:block w-[350px] shrink-0">
           <QuestionPalette onSelect={(idx) => examStore.setCurrentIdx(idx)} />
        </aside>
      </main>

      <TacticalFooter onSubmit={() => setShowSubmitModal(true)} />
      
      <Sheet open={isPaletteOpen} onOpenChange={setIsPaletteOpen}>
        <SheetContent side="right" className="w-[300px] p-0 border-none">
          <QuestionPalette onSelect={(idx) => { examStore.setCurrentIdx(idx); setIsPaletteOpen(false); }} />
        </SheetContent>
      </Sheet>

      <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
         <DialogContent className="max-w-xl rounded-[3rem] p-12 bg-white border-none shadow-5xl text-left">
            <DialogHeader className="text-center space-y-6">
               <div className="h-20 w-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto text-emerald-600 shadow-2xl">
                  <ShieldCheck className="h-10 w-10" />
               </div>
               <div>
                  <DialogTitle className="text-4xl font-headline font-black text-[#0F172A] uppercase tracking-tight">COMMIT ASSESSMENT</DialogTitle>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Audit Registry for {examStore.mockTitle}</p>
               </div>
            </DialogHeader>

            <div className="py-10 grid grid-cols-2 gap-4">
               <SubmissionNode label="Attempted Nodes" val={stats.answered + stats.ansMarked} color="text-emerald-600" icon={<CheckCircle2 className="h-4 w-4" />} />
               <SubmissionNode label="Logic Review" val={stats.marked + stats.ansMarked} color="text-violet-600" icon={<Zap className="h-4 w-4" />} />
               <SubmissionNode label="Total Atomic Qs" val={examStore.questions.length} color="text-[#0F172A]" icon={<Trophy className="h-4 w-4" />} />
               <SubmissionNode label="Registry Time" val={`${Math.floor(examStore.timeLeft / 60)}m`} color="text-[#F97316]" icon={<History className="h-4 w-4" />} />
            </div>

            <DialogFooter className="flex flex-col gap-4">
               <Button onClick={handleSubmitFinal} disabled={isSubmittingFinal} className="w-full h-20 bg-[#F97316] hover:bg-orange-600 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-[1.5rem] shadow-3xl">
                  {isSubmittingFinal ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <ShieldCheck className="h-6 w-6 mr-3" />}
                  FINALIZE & SYNC REGISTRY
               </Button>
               <Button variant="ghost" onClick={() => setShowSubmitModal(false)} className="w-full text-slate-400 font-black uppercase text-[10px] tracking-widest">RE-AUDIT QUESTIONS</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}

function ResumeStat({ label, val, color, textColor = "text-white" }: any) {
   return (
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
         <span className="text-[9px] font-black uppercase text-slate-400 mb-2 tracking-tighter">{label}</span>
         <div className={cn("h-10 w-14 rounded-xl flex items-center justify-center text-lg font-black shadow-lg", color, textColor)}>
            {val}
         </div>
      </div>
   )
}

function SubmissionNode({ label, val, color, icon }: any) {
   return (
      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-left space-y-4">
         <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center bg-white shadow-sm", color)}>
            {icon}
         </div>
         <div className="space-y-0.5">
            <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
            <p className={cn("text-3xl font-headline font-black", color)}>{val}</p>
         </div>
      </div>
   )
}
