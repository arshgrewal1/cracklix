
'use client';

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFirestore, useUser } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useExamStore } from "@/store/useExamStore";
import ExamHeader from "@/components/exam/ExamHeader";
import SubjectTabs from "@/components/exam/SubjectTabs";
import TacticalFooter from "@/components/exam/TacticalFooter";
import AntiCheat from "@/components/exam/AntiCheat";
import QuestionRenderer from "@/components/questions/QuestionRenderer";
import QuestionPalette from "@/components/mocks/QuestionPalette";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, CheckCircle2, AlertCircle, HelpCircle, Eye, ShieldCheck, Play, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

/**
 * @fileOverview Professional CBT Engine v3.0.
 * Features: Viewport Locked, High-Fidelity Testbook-style layout.
 * Updated: Professional Resume Test Hub with Progress Audit.
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

        examStore.initExam(mockId, mockData.title, user.uid, questions, mockData.duration, savedState);
      } catch (err: any) {
        toast({ variant: "destructive", title: "CBT Initialization Error", description: err.message });
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
      if (Math.floor(Date.now() / 1000) % 30 === 0) {
        examStore.syncToFirestore(db!);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isInitializing, db]);

  const handleSubmitTest = async () => {
    if (!db || !user) return;
    if (!confirm("Are you sure you want to submit your test?")) return;
    
    examStore.setPaused(true);
    await examStore.syncToFirestore(db);
    toast({ title: "Test Submitted", description: "Your results are being processed." });
    router.push(`/results/${mockId}`);
  };

  const progressStats = useMemo(() => {
    const s = { answered: 0, marked: 0, notAnswered: 0, notVisited: 0 };
    examStore.questions.forEach((_, i) => {
      const st = examStore.status[i];
      if (st === 'answered' || st === 'answered-marked') s.answered++;
      else if (st === 'marked') s.marked++;
      else if (examStore.visited.includes(i)) s.notAnswered++;
      else s.notVisited++;
    });
    return s;
  }, [examStore.questions, examStore.status, examStore.visited]);

  if (isInitializing) return (
    <div className="h-svh flex flex-col items-center justify-center bg-white space-y-6">
       <Loader2 className="h-12 w-12 text-primary animate-spin" />
       <p className="font-black uppercase text-[10px] tracking-[0.4em] text-slate-400">Loading CBT Engine...</p>
    </div>
  );

  const q = examStore.questions[examStore.currentIdx];
  const selectedOption = examStore.answers[examStore.currentIdx];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8FAFC] text-[#0F172A] font-body select-none relative">
      <AntiCheat />
      
      <ExamHeader 
        title={examStore.mockTitle} 
        onPaletteToggle={() => setIsPaletteOpen(true)} 
      />
      
      <SubjectTabs />

      <main className="flex-1 flex overflow-hidden bg-white">
        
        {/* LEFT ZONE: QUESTION CONTENT */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
           
           {/* PROFESSIONAL RESUME HUB */}
           {examStore.isPaused && (
             <div className="absolute inset-0 z-50 bg-[#0B1528]/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
                <div className="max-w-md w-full bg-white rounded-[3rem] shadow-5xl overflow-hidden text-left flex flex-col">
                   <div className="bg-[#F8FAFC] p-8 md:p-10 border-b border-slate-100 flex flex-col items-center text-center space-y-4">
                      <div className="h-16 w-16 bg-[#0F172A] rounded-2xl flex items-center justify-center text-white shadow-xl animate-bounce">
                         <Play className="h-8 w-8 text-primary fill-current" />
                      </div>
                      <div className="space-y-1">
                         <h2 className="text-3xl font-headline font-black text-[#0F172A] uppercase tracking-tight">Test Paused</h2>
                         <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Progress Audit Registered</p>
                      </div>
                   </div>

                   <div className="p-8 md:p-10 space-y-8">
                      <div className="grid grid-cols-2 gap-4">
                         <SummaryCard label="Answered" val={progressStats.answered} color="bg-emerald-500" />
                         <SummaryCard label="Marked" val={progressStats.marked} color="bg-purple-600" />
                         <SummaryCard label="Unanswered" val={progressStats.notAnswered} color="bg-rose-500" />
                         <SummaryCard label="Not Visited" val={progressStats.notVisited} color="bg-slate-200" textColor="text-slate-400" />
                      </div>

                      <div className="space-y-4 pt-4">
                         <Button 
                            onClick={() => examStore.setPaused(false)} 
                            className="w-full h-16 bg-primary hover:bg-orange-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-3xl flex items-center justify-center gap-3 transition-all active:scale-95"
                         >
                            <Play className="h-5 w-5 fill-current" /> Resume Test Now
                         </Button>
                         <Button 
                            onClick={handleSubmitTest}
                            variant="ghost"
                            className="w-full h-14 text-slate-400 hover:text-rose-500 font-bold uppercase tracking-widest text-[9px] gap-2"
                         >
                            <ShieldCheck className="h-4 w-4" /> Submit Assessment
                         </Button>
                      </div>
                   </div>

                   <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">Official Institutional Engine v3.0</p>
                   </div>
                </div>
             </div>
           )}

           <div className="max-w-[1200px] mx-auto p-4 md:p-14 space-y-6 h-auto min-h-0">
              <QuestionRenderer 
                 language={examStore.language} 
                 question={q} 
                 hideOptions={true}
              />

              <div className="grid grid-cols-1 gap-4 pb-12">
                 {['A', 'B', 'C', 'D'].map((key, i) => {
                    const isSelected = selectedOption === i;
                    const enVal = (q as any)[`option${key}English`];
                    const paVal = (q as any)[`option${key}Punjabi`];
                    
                    return (
                       <button
                         key={i}
                         onClick={() => examStore.setAnswer(examStore.currentIdx, i)}
                         className={cn(
                           "flex items-center gap-6 p-5 md:p-6 rounded-[16px] border-2 transition-all text-left shadow-sm min-h-[68px] group",
                           isSelected 
                             ? "border-primary bg-primary/5 ring-4 ring-primary/10" 
                             : "border-slate-100 bg-white hover:border-slate-300 hover:shadow-md"
                         )}
                       >
                          <div className={cn(
                             "h-10 w-10 rounded-lg flex items-center justify-center font-black text-sm shrink-0 transition-all",
                             isSelected ? "bg-primary text-white shadow-xl" : "bg-[#0F172A] text-white"
                          )}>
                             {key}
                          </div>
                          <div className="flex-1 overflow-hidden">
                             {examStore.language === 'en' && <p className="font-[600] text-[18px] md:text-[20px] text-[#111111] leading-tight">{enVal}</p>}
                             {examStore.language === 'pa' && <p className="font-[600] text-[18px] md:text-[20px] text-[#111111] leading-tight">{paVal || enVal}</p>}
                             {examStore.language === 'bi' && (
                                <div className="space-y-1">
                                   <p className="font-[600] text-[18px] md:text-[20px] text-[#111111] leading-tight">{enVal}</p>
                                   <p className="font-[600] text-[18px] md:text-[20px] text-[#111111] leading-tight">{paVal}</p>
                                </div>
                             )}
                          </div>
                       </button>
                    )
                 })}
              </div>
           </div>
        </div>

        {/* RIGHT ZONE: QUESTION PALETTE */}
        <aside className="hidden lg:block w-[320px] shrink-0 border-l border-slate-200 bg-white">
           <QuestionPalette onSelect={(idx) => examStore.setCurrentIdx(idx)} />
        </aside>
      </main>

      <TacticalFooter onSubmit={handleSubmitTest} />
      
      {/* MOBILE PALETTE DRAWER */}
      <Sheet open={isPaletteOpen} onOpenChange={setIsPaletteOpen}>
        <SheetContent side="right" className="w-[320px] p-0 border-none">
          <SheetHeader className="p-6 border-b border-slate-100">
             <SheetTitle className="text-sm font-black uppercase tracking-widest">Question Palette</SheetTitle>
          </SheetHeader>
          <QuestionPalette onSelect={(idx) => { examStore.setCurrentIdx(idx); setIsPaletteOpen(false); }} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SummaryCard({ label, val, color, textColor = "text-white" }: any) {
   return (
      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
         <span className="text-[10px] font-black uppercase text-slate-400 tracking-tight">{label}</span>
         <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center text-xs font-black shadow-lg", color, textColor)}>
            {val}
         </div>
      </div>
   )
}
