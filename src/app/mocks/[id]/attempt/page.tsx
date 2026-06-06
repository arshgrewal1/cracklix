
'use client';

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFirestore, useUser, useDoc } from "@/firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, getDocs, query, where } from "firebase/firestore";
import { useExamStore } from "@/store/useExamStore";
import ExamHeader from "@/components/exam/ExamHeader";
import TacticalFooter from "@/components/exam/TacticalFooter";
import AntiCheat from "@/components/exam/AntiCheat";
import QuestionRenderer from "@/components/questions/QuestionRenderer";
import QuestionPalette from "@/components/mocks/QuestionPalette";
import { Button } from "@/components/ui/button";
import { Loader2, Play, ShieldCheck, CheckCircle2, Bookmark, AlertTriangle, Flag } from "lucide-react";
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
        if (!mockSnap.exists()) throw new Error("Mock test not found.");
        const mockData = mockSnap.data();

        const qSnaps = await Promise.all(
          mockData.questionIds.map((id: string) => getDoc(doc(db, "questions", id)))
        );
        const questions = qSnaps.map(s => ({ ...s.data(), id: s.id })).filter(Boolean) as any[];

        const attemptSnap = await getDoc(doc(db, "attempts", `${user.uid}_${mockId}`));
        const savedState = attemptSnap.exists() ? attemptSnap.data() : undefined;

        if (!attemptSnap.exists()) {
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
              timeLeft: mockData.duration * 60,
              endTime: Date.now() + (mockData.duration * 60 * 1000)
           });
        }

        examStore.initExam(mockId, mockData.title, user.uid, questions, mockData.duration, savedState);
      } catch (err: any) {
        toast({ variant: "destructive", title: "Sync Error", description: err.message });
        router.push(`/mocks/${mockId}`);
      } finally {
        setIsInitializing(false);
      }
    }
    loadExam();
  }, [db, user, mockId]);

  useEffect(() => {
    if (isInitializing) return;
    const interval = setInterval(() => {
      examStore.tick();
    }, 1000);
    return () => clearInterval(interval);
  }, [isInitializing]);

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
        if (studentAnsIdx === correctAnsIdx) score++;
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
      
      toast({ title: "Evaluation Complete" });
      router.push(`/results/${mockId}`);
    } catch (e) {
      toast({ variant: "destructive", title: "Cloud Sync Failed" });
    } finally {
      setIsSubmittingFinal(false);
      setShowSubmitModal(false);
    }
  };

  if (isInitializing) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-6">
       <Loader2 className="h-10 w-10 text-primary animate-spin" />
       <p className="font-black uppercase text-[10px] tracking-[0.4em] text-slate-400">Syncing Registry Node...</p>
    </div>
  );

  const q = examStore.questions[examStore.currentIdx];
  const selectedOption = examStore.answers[examStore.currentIdx];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 font-body select-none">
      <AntiCheat />
      <ExamHeader onPaletteToggle={() => setIsPaletteOpen(true)} />
      
      {/* SECTION NAVIGATION */}
      <div className="h-12 bg-white border-b border-slate-200 flex items-center px-6 overflow-x-auto no-scrollbar gap-2 shrink-0">
         {Array.from(new Set(examStore.questions.map(q => q.sectionId))).map(sid => (
           <button
             key={sid}
             onClick={() => {
                const firstIdx = examStore.questions.findIndex(question => question.sectionId === sid);
                examStore.setCurrentIdx(firstIdx);
             }}
             className={cn(
               "px-6 h-full flex items-center justify-center text-[11px] font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap",
               examStore.currentSectionId === sid ? "border-primary text-primary bg-primary/5" : "border-transparent text-slate-400 hover:text-slate-600"
             )}
           >
             {sid.replace(/-/g, ' ')}
           </button>
         ))}
      </div>

      <main className="flex-1 flex overflow-hidden relative">
        {examStore.isPaused && (
           <div className="absolute inset-0 z-[100] bg-[#0B1528]/95 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-300 p-6">
              <div className="max-w-md w-full bg-white rounded-[3rem] shadow-5xl overflow-hidden text-center">
                 <div className="bg-slate-50 p-10 border-b flex flex-col items-center space-y-4">
                    <div className="h-20 w-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary shadow-2xl">
                       <Play className="h-10 w-10 fill-current" />
                    </div>
                    <h2 className="text-3xl font-headline font-black text-[#0F172A] uppercase">TEST PAUSED</h2>
                 </div>
                 <div className="p-10 space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                       <StatBox label="Answered" val={stats.answered} color="bg-emerald-500" />
                       <StatBox label="Marked" val={stats.marked} color="bg-purple-600" />
                       <StatBox label="Time Left" val={`${Math.floor(examStore.timeLeft / 60)}m`} color="bg-[#0F172A]" />
                       <StatBox label="Total Qs" val={examStore.questions.length} color="bg-slate-200" textColor="text-slate-600" />
                    </div>
                    <Button onClick={() => examStore.setPaused(false)} className="w-full h-16 bg-primary hover:bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-3xl gap-3">
                       <Play className="h-5 w-5 fill-current" /> RESUME EVALUATION
                    </Button>
                 </div>
              </div>
           </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
           <div className="max-w-[900px] mx-auto space-y-10">
              
              {/* Q-META */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                 <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center text-xl font-black shadow-lg">
                       {examStore.currentIdx + 1}
                    </div>
                    <div className="flex gap-2">
                       <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 font-black uppercase text-[9px]">+1.0 Marks</Badge>
                       <Badge className="bg-rose-50 text-rose-600 border-none px-3 font-black uppercase text-[9px]">-0.25 Negative</Badge>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <button 
                      onClick={() => examStore.toggleBookmark(examStore.currentIdx, db!)}
                      className={cn("h-12 w-12 rounded-xl flex items-center justify-center transition-all", examStore.bookmarks.includes(examStore.currentIdx) ? "bg-primary text-white shadow-xl" : "bg-white text-slate-300 hover:text-primary")}
                    >
                       <Bookmark className="h-6 w-6" />
                    </button>
                    <button className="h-12 w-12 rounded-xl bg-white text-slate-300 hover:text-rose-500 flex items-center justify-center"><Flag className="h-6 w-6" /></button>
                 </div>
              </div>

              {/* QUESTION TEXT */}
              <div className="space-y-6">
                 {(examStore.language === 'en' || examStore.language === 'bi') && (
                    <div className="text-[22px] md:text-[28px] font-[700] text-[#111111] leading-tight">
                       {q.englishQuestion}
                    </div>
                 )}
                 {(examStore.language === 'pa' || examStore.language === 'bi') && (
                    <div className="text-[22px] md:text-[28px] font-[700] text-[#111111] leading-tight pt-2 border-t-2 border-dashed border-slate-100">
                       {q.punjabiQuestion}
                    </div>
                 )}
              </div>

              {/* OPTIONS MATRIX */}
              <div className="grid grid-cols-1 gap-3 pt-6">
                 {['A', 'B', 'C', 'D'].map((key, i) => {
                    const isSelected = selectedOption === i;
                    const enVal = (q as any)[`option${key}English`];
                    const paVal = (q as any)[`option${key}Punjabi`];
                    
                    return (
                       <button
                         key={i}
                         onClick={() => examStore.setAnswer(examStore.currentIdx, i, db!)}
                         className={cn(
                           "flex items-center gap-6 p-5 rounded-2xl border-2 transition-all text-left shadow-sm min-h-[80px] group",
                           isSelected 
                             ? "border-primary bg-primary/5 ring-4 ring-primary/5" 
                             : "border-slate-100 bg-white hover:border-slate-200"
                         )}
                       >
                          <div className={cn(
                             "h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-all",
                             isSelected ? "bg-primary text-white shadow-lg" : "bg-slate-50 text-slate-400 group-hover:bg-[#0F172A] group-hover:text-white"
                          )}>
                             {key}
                          </div>
                          <div className="flex-1 space-y-1">
                             {(examStore.language === 'en' || examStore.language === 'bi') && <p className="font-bold text-[18px] text-[#111111] leading-snug">{enVal}</p>}
                             {(examStore.language === 'pa' || examStore.language === 'bi') && <p className="font-bold text-[18px] text-[#111111] leading-snug">{paVal || enVal}</p>}
                          </div>
                       </button>
                    )
                 })}
              </div>
           </div>
        </div>

        <aside className="hidden lg:block w-[350px] shrink-0 border-l border-slate-200">
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
         <DialogContent className="max-w-md rounded-[3rem] p-10 bg-white border-none shadow-5xl">
            <DialogHeader className="text-center space-y-4">
               <div className="h-20 w-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto text-emerald-600 shadow-2xl">
                  <ShieldCheck className="h-10 w-10" />
               </div>
               <DialogTitle className="text-3xl font-headline font-black text-[#0F172A] uppercase">FINAL SUBMISSION</DialogTitle>
            </DialogHeader>

            <div className="py-8 grid grid-cols-2 gap-4">
               <SubmissionNode label="Attempted" val={stats.answered + stats.ansMarked} color="text-emerald-600" />
               <SubmissionNode label="Marked" val={stats.marked + stats.ansMarked} color="text-purple-600" />
               <SubmissionNode label="Total Qs" val={examStore.questions.length} color="text-[#0F172A]" />
               <SubmissionNode label="Remaining" val={`${Math.floor(examStore.timeLeft / 60)}m`} color="text-primary" />
            </div>

            <DialogFooter className="flex flex-col gap-3">
               <Button onClick={handleSubmitFinal} disabled={isSubmittingFinal} className="w-full h-16 bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl">
                  {isSubmittingFinal ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                  COMMIT ASSESSMENT
               </Button>
               <Button variant="ghost" onClick={() => setShowSubmitModal(false)} className="w-full text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">CANCEL & REVIEW</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}

function StatBox({ label, val, color, textColor = "text-white" }: any) {
   return (
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
         <span className="text-[10px] font-black uppercase text-slate-400 mb-2">{label}</span>
         <div className={cn("h-10 w-12 rounded-xl flex items-center justify-center text-lg font-black shadow-lg", color, textColor)}>
            {val}
         </div>
      </div>
   )
}

function SubmissionNode({ label, val, color }: any) {
   return (
      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
         <p className="text-[9px] font-black uppercase text-slate-400 mb-2">{label}</p>
         <p className={cn("text-2xl font-headline font-black", color)}>{val}</p>
      </div>
   )
}
