
"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useDoc, useFirestore, useUser, useCollection } from "@/firebase"
import { doc, getDoc, serverTimestamp, collection, addDoc } from "firebase/firestore"
import Timer from "@/components/mocks/Timer"
import QuestionPalette from "@/components/mocks/QuestionPalette"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import { Button } from "@/components/ui/button"
import { RadioGroup } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Loader2, Target, LayoutGrid, ChevronRight, ChevronLeft, ShieldCheck, Pause, Play, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"

type LangMode = 'en' | 'pa' | 'bilingual'

/**
 * @fileOverview Institutional High-Fidelity CBT Engine v26.0.
 * Redesign: Viewport-locked, Fixed Header/Footer, Slide-out Palette.
 * Fixed: Accessibility error (missing SheetTitle).
 */

export default function MockAttemptPage() {
  const params = useParams()
  const router = useRouter()
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  const mockId = params.id as string
  
  const { data: mock, loading: mockLoading } = useDoc<any>(useMemo(() => (db && mockId ? doc(db, "mocks", mockId) : null), [db, mockId]))
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))
  
  const [questions, setQuestions] = useState<any[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [flagged, setFlagged] = useState<number[]>([])
  const [visited, setVisited] = useState<number[]>([0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [language, setLanguage] = useState<LangMode>('bilingual')
  const [remainingTime, setRemainingTime] = useState(0)
  const [loadingQs, setLoadingQs] = useState(true)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    async function init() {
      if (!db || !mock?.questionIds) return
      setLoadingQs(true)
      try {
        const fetchPromises = mock.questionIds.map((id: string) => getDoc(doc(db, "questions", id)))
        const snapshots = await Promise.all(fetchPromises)
        const qData = snapshots.map(snap => snap.exists() ? { ...snap.data(), id: snap.id } : null).filter(Boolean)
        setQuestions(qData)
        setRemainingTime((mock.duration || 120) * 60)
      } catch (err) {
        toast({ variant: "destructive", title: "Audit Sync Error" })
      } finally {
        setLoadingQs(false)
      }
    }
    init()
  }, [db, mock, toast])

  const activeBoard = useMemo(() => {
     return boards?.find((b: any) => b.id === mock?.boardId);
  }, [boards, mock]);

  const activeSubject = useMemo(() => {
     const q = questions[currentIdx];
     if (!q || !subjects) return "General Hub";
     const sub = subjects.find((s: any) => s.id === q.subjectId);
     return sub?.name || "Preparation Node";
  }, [questions, currentIdx, subjects]);

  const submitMock = useCallback(async () => {
    if (isSubmitting || questions.length === 0 || !user || !db) return
    setIsSubmitting(true)
    const correctMap: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 }
    let score = 0
    const subjectStats: Record<string, any> = {}

    questions.forEach((q, idx) => {
      const subj = q.subjectId || 'general'
      if (!subjectStats[subj]) subjectStats[subj] = { correct: 0, total: 0, attempted: 0 }
      subjectStats[subj].total++
      if (answers[idx] !== undefined) {
        subjectStats[subj].attempted++
        if (answers[idx] === correctMap[q.correctAnswer]) {
          score++
          subjectStats[subj].correct++
        }
      }
    })

    const payload = {
      mockId, userId: user.uid, score, totalQuestions: questions.length,
      accuracy: Math.round((score / (Object.keys(answers).length || 1)) * 100),
      timestamp: new Date().toISOString(), answers, createdAt: serverTimestamp(),
      mockTitle: mock?.title || "Test Series",
      subjectStats,
      timeTaken: (mock.duration * 60) - remainingTime
    }

    try {
      await addDoc(collection(db, "results"), payload)
      router.push(`/results/${mockId}`)
    } catch (e) {
      toast({ variant: "destructive", title: "Submission Failed" })
      setIsSubmitting(false)
    }
  }, [isSubmitting, questions, answers, mock, user, db, router, mockId, toast, remainingTime])

  if (mockLoading || loadingQs) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
    </div>
  )

  const q = questions[currentIdx]

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white text-black font-body">
      {/* Viewport Anchored Header */}
      <header className="h-[60px] md:h-16 border-b flex items-center justify-between px-3 md:px-12 bg-[#0B1528] text-white shrink-0 z-[100] shadow-xl">
        <div className="flex items-center gap-1.5 md:gap-3 bg-white/5 p-0.5 md:p-1 rounded-lg md:rounded-xl border border-white/10 scale-90 md:scale-100 origin-left">
          <LangTab label="EN" active={language === 'en'} onClick={() => setLanguage('en')} />
          <LangTab label="PA" active={language === 'pa'} onClick={() => setLanguage('pa')} />
          <LangTab label="BI" active={language === 'bilingual'} onClick={() => setLanguage('bilingual')} />
        </div>

        <div className="flex items-center gap-2 md:gap-4 flex-1 justify-center">
          <Timer onTimeUp={submitMock} initialSeconds={remainingTime} onTick={setRemainingTime} isPaused={isPaused} />
          <Button variant="ghost" size="icon" onClick={() => setIsPaused(!isPaused)} className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-white/5 text-white hover:bg-white/10 shrink-0">
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
        </div>

        <Button onClick={submitMock} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[8px] md:text-[10px] tracking-widest h-8 md:h-10 px-3 md:px-6 rounded-lg md:rounded-xl shadow-lg transition-all shrink-0">
          FINISH
        </Button>
      </header>

      {/* Main Attempt Zone */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-[#F8FAFC]">
        {isPaused && (
           <div className="absolute inset-0 z-[200] bg-[#0B1528]/95 backdrop-blur-xl flex flex-col items-center justify-center text-white p-6">
              <Pause className="h-12 w-12 text-primary mb-6 animate-pulse" />
              <h2 className="text-3xl font-headline font-black uppercase mb-8 tracking-tighter text-center">Audit Paused</h2>
              <Button onClick={() => setIsPaused(false)} className="bg-primary text-white font-black h-14 px-12 rounded-2xl uppercase text-[10px] tracking-[0.3em] shadow-4xl">Resume Evaluation</Button>
           </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Section Info Bar */}
          <div className="px-4 py-3 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
             <div className="flex items-center gap-4 md:gap-10">
                <div className="text-left">
                   <p className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">SECTION</p>
                   <h2 className="text-[10px] md:text-sm font-black text-black uppercase flex items-center gap-1.5 truncate max-w-[120px] md:max-w-none">
                     <Target className="h-3 w-3 text-primary shrink-0" /> {activeSubject}
                   </h2>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div className="text-left">
                   <p className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">QUESTION</p>
                   <p className="text-[10px] md:text-sm font-black text-black">{currentIdx + 1} / {questions.length}</p>
                </div>
             </div>
             
             <Sheet>
               <SheetTrigger asChild>
                 <Button variant="outline" className="rounded-lg h-8 md:h-10 px-3 md:px-5 gap-2 font-black text-[9px] md:text-[11px] uppercase border-slate-200 bg-white shadow-sm hover:bg-slate-50">
                    <LayoutGrid className="h-3.5 w-3.5 text-primary" /> Palette
                 </Button>
               </SheetTrigger>
               <SheetContent side="right" className="p-0 border-none w-[280px] md:w-[340px]">
                   <SheetHeader className="sr-only">
                      <SheetTitle>Question Palette</SheetTitle>
                   </SheetHeader>
                   <div className="p-6 h-full overflow-y-auto bg-white pt-16">
                     <QuestionPalette 
                         questions={questions} 
                         currentIndex={currentIdx} 
                         answeredIndices={Object.keys(answers).map(Number)} 
                         flaggedIndices={flagged} visitedIndices={visited}
                         onSelect={(idx) => { setCurrentIdx(idx); if (!visited.includes(idx)) setVisited(p => [...p, idx]); }} 
                         examName={mock?.title}
                       />
                   </div>
               </SheetContent>
             </Sheet>
          </div>

          {/* Question & Option Body - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 md:p-12 custom-scrollbar bg-white">
             <div className="max-w-[900px] mx-auto space-y-6 md:space-y-10">
                <QuestionRenderer 
                   language={language}
                   question={q}
                   hideOptions={true}
                />
                
                <div className="space-y-2 md:space-y-3">
                   <RadioGroup 
                     value={answers[currentIdx]?.toString() || ""} 
                     onValueChange={(v) => setAnswers(prev => ({ ...prev, [currentIdx]: parseInt(v) }))} 
                     className="grid grid-cols-1 gap-2 md:gap-3"
                   >
                     {['A', 'B', 'C', 'D'].map((k, i) => {
                       const isSelected = answers[currentIdx] === i;
                       const enVal = q[`option${k}English`] || "";
                       const paVal = q[`option${k}Punjabi`] || "";

                       return (
                         <div key={i} className={cn(
                           "flex items-center space-x-3 md:space-x-6 p-3 md:p-4 border-2 rounded-xl md:rounded-2xl transition-all cursor-pointer shadow-sm min-h-[52px] md:min-h-[64px]",
                           isSelected ? 'border-primary bg-primary/5' : 'border-slate-100 bg-white hover:border-primary/20'
                         )} onClick={() => setAnswers(prev => ({ ...prev, [currentIdx]: i }))}>
                            <div className={cn(
                               "h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl border-2 flex items-center justify-center font-black text-xs md:text-sm shrink-0 transition-all",
                               isSelected ? "bg-primary border-primary text-white scale-105 shadow-md" : "border-slate-200 text-slate-300"
                            )}>
                               {k}
                            </div>
                            <Label className="flex-1 cursor-pointer select-none text-[14px] md:text-[18px] font-black text-[#0F172A] text-left leading-snug">
                                {language === 'en' ? enVal : 
                                 language === 'pa' ? (paVal || enVal) : 
                                 (
                                  <div className="inline">
                                    {enVal} {paVal && <span className="text-primary/30 mx-2">/</span>} {paVal}
                                  </div>
                                 )}
                            </Label>
                         </div>
                       )
                     })}
                   </RadioGroup>
                </div>
             </div>
          </div>

          {/* Sticky Nav Footer */}
          <footer className="h-[76px] md:h-24 border-t border-slate-100 bg-white px-3 md:px-12 flex items-center justify-between shrink-0 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
             <Button variant="ghost" className="h-10 md:h-14 px-3 md:px-8 text-[9px] md:text-[11px] font-black uppercase rounded-xl text-slate-500" onClick={() => currentIdx > 0 && setCurrentIdx(currentIdx - 1)} disabled={currentIdx === 0}>
                <ChevronLeft className="h-4 w-4 md:mr-2" /> <span className="hidden md:inline">Previous</span>
             </Button>
             
             <div className="flex gap-2 md:gap-4">
                <Button variant="outline" className={cn("h-10 md:h-14 px-3 md:px-8 text-[9px] md:text-[11px] font-black uppercase rounded-xl border-2 transition-all shadow-sm", flagged.includes(currentIdx) ? "bg-amber-500 border-amber-500 text-white" : "text-amber-500 border-amber-100 bg-white")} onClick={() => { if(!flagged.includes(currentIdx)) setFlagged(p=>[...p, currentIdx]); else setFlagged(p=>p.filter(idx=>idx!==currentIdx)); }}>
                   {flagged.includes(currentIdx) ? 'FLAGGED' : 'REVIEW'}
                </Button>
                <Button className="bg-[#0F172A] hover:bg-black text-white h-10 md:h-14 px-6 md:px-14 rounded-xl font-black uppercase text-[9px] md:text-[11px] tracking-widest shadow-2xl transition-all active:scale-95" onClick={() => { if(currentIdx < questions.length-1) { const next = currentIdx + 1; setCurrentIdx(next); if(!visited.includes(next)) setVisited(v=>[...v, next])} }}>
                   SAVE & NEXT <ChevronRight className="h-4 w-4 md:ml-2" />
                </Button>
             </div>
          </footer>
        </div>
      </main>
    </div>
  )
}

function LangTab({ label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={cn("px-2 md:px-4 py-1.5 md:py-2 rounded-md md:rounded-lg text-[8px] md:text-[10px] font-black tracking-widest transition-all", active ? "bg-[#F97316] text-white shadow-lg" : "text-white/40 hover:text-white hover:bg-white/5")}>{label}</button>
  )
}
