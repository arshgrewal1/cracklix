
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
import { Loader2, ChevronRight, ChevronLeft, ShieldCheck, Pause, Play, LayoutGrid, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"

type LangMode = 'en' | 'pa' | 'bilingual'

/**
 * @fileOverview Institutional CBT Evaluation Engine v70.0.
 * Mobile-First: Optimized two-row header with full access to Lang/Pause/Finish.
 */

export default function MockAttemptPage() {
  const params = useParams()
  const router = useRouter()
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  const mockId = params.id as string
  
  const { data: mock, loading: mockLoading } = useDoc<any>(useMemo(() => (db && mockId ? doc(db, "mocks", mockId) : null), [db, mockId]))
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
        toast({ variant: "destructive", title: "CBT Sync Error" })
      } finally {
        setLoadingQs(false)
      }
    }
    init()
  }, [db, mock, toast])

  const activeSubject = useMemo(() => {
     const q = questions[currentIdx];
     if (!q || !subjects) return "General Intelligence";
     const sub = subjects.find((s: any) => s.id === q.subjectId);
     return sub?.name || "Mock Section";
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
      toast({ variant: "destructive", title: "Audit Failed" })
      setIsSubmitting(false)
    }
  }, [isSubmitting, questions, answers, mock, user, db, router, mockId, toast, remainingTime])

  if (mockLoading || loadingQs) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-4">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
      <p className="font-black uppercase text-[10px] tracking-widest text-slate-400">Initializing CBT Hub...</p>
    </div>
  )

  const q = questions[currentIdx]

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8FAFC] text-[#0F172A] font-body select-none">
      
      {/* 1. INSTITUTIONAL CBT HEADER (2-ROW FOR MOBILE) */}
      <header className="bg-[#0F172A] text-white shrink-0 z-[100] shadow-xl border-b border-white/10">
        {/* Row 1: High Priority Controls */}
        <div className="h-14 md:h-20 flex items-center justify-between px-4 md:px-10 border-b border-white/5">
           {/* Left: Language Toggle */}
           <div className="flex items-center bg-white/5 p-0.5 rounded-lg border border-white/10">
             <LangToggle active={language === 'en'} label="EN" onClick={() => setLanguage('en')} />
             <LangToggle active={language === 'pa'} label="PA" onClick={() => setLanguage('pa')} />
             <LangToggle active={language === 'bilingual'} label="BI" onClick={() => setLanguage('bilingual')} />
           </div>

           {/* Center: Timer & Pause */}
           <div className="flex items-center gap-2 md:gap-4">
              <Timer onTimeUp={submitMock} initialSeconds={remainingTime} onTick={setRemainingTime} isPaused={isPaused} />
              <Button variant="ghost" size="icon" onClick={() => setIsPaused(!isPaused)} className="h-9 w-9 md:h-12 md:w-12 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                {isPaused ? <Play className="h-4 w-4 md:h-5 md:w-5 fill-current" /> : <Pause className="h-4 w-4 md:h-5 md:w-5 fill-current" />}
              </Button>
           </div>

           {/* Right: Finish Button */}
           <Button onClick={submitMock} disabled={isSubmitting} className="bg-[#F97316] hover:bg-orange-600 text-white font-black uppercase text-[8px] md:text-[10px] tracking-widest h-8 md:h-12 px-3 md:px-8 rounded-lg shadow-2xl transition-all active:scale-95">
             FINISH
           </Button>
        </div>

        {/* Row 2: Secondary Context Hub */}
        <div className="h-12 md:h-14 flex items-center justify-between px-4 md:px-10 bg-black/20">
           <div className="flex items-center gap-4 text-[10px] md:text-sm">
              <div className="flex flex-col text-left">
                 <p className="text-[7px] md:text-[8px] font-black text-primary uppercase tracking-widest leading-none">Exam Name</p>
                 <h1 className="font-black uppercase tracking-tight truncate max-w-[120px] md:max-w-md text-white/90">{mock?.title}</h1>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div className="flex flex-col text-left">
                 <p className="text-[7px] md:text-[8px] font-black text-primary uppercase tracking-widest leading-none">Section</p>
                 <p className="font-black uppercase text-white truncate max-w-[100px] md:max-w-none">{activeSubject}</p>
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="flex flex-col items-center">
                 <p className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Question</p>
                 <p className="font-black text-sm md:text-lg">{currentIdx + 1} OF {questions.length}</p>
              </div>
              {/* Mobile Palette Trigger */}
              <div className="lg:hidden">
                 <Sheet>
                    <SheetTrigger asChild>
                       <Button variant="outline" size="sm" className="rounded-lg font-black text-[9px] uppercase h-8 px-3 gap-2 border-white/20 bg-white/5 text-white">
                          <LayoutGrid className="h-3 w-3" /> Palette
                       </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="p-0 border-none w-80">
                       <SheetHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
                          <SheetTitle className="text-sm font-black uppercase tracking-widest">Question Palette</SheetTitle>
                       </SheetHeader>
                       <div className="p-6 h-full bg-white overflow-y-auto">
                          <QuestionPalette 
                             questions={questions} 
                             currentIndex={currentIdx} 
                             answeredIndices={Object.keys(answers).map(Number)} 
                             flaggedIndices={flagged} 
                             visitedIndices={visited} 
                             onSelect={(idx) => { setCurrentIdx(idx); if (!visited.includes(idx)) setVisited(p => [...p, idx]); }} 
                          />
                       </div>
                    </SheetContent>
                 </Sheet>
              </div>
           </div>
        </div>
      </header>

      {/* 2. MAIN EVALUATION ZONE */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Pause Screen Overlay */}
        {isPaused && (
           <div className="absolute inset-0 z-[200] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
              <div className="h-20 w-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary mb-6 animate-pulse shadow-2xl">
                 <Pause className="h-10 w-10 fill-current" />
              </div>
              <h2 className="text-3xl font-headline font-black text-[#0F172A] uppercase tracking-tighter mb-2">Test Paused</h2>
              <p className="text-slate-500 font-medium mb-10 max-w-sm">Registry time is frozen. Your progress is safe.</p>
              <Button onClick={() => setIsPaused(false)} className="bg-[#0F172A] text-white h-14 px-16 rounded-xl font-black uppercase tracking-[0.3em] text-[10px] shadow-4xl active:scale-95 transition-all">Resume Test</Button>
           </div>
        )}

        {/* LEFT: QUESTION HUB */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="flex-1 overflow-y-auto no-scrollbar">
             <div className="max-w-[1000px] mx-auto p-4 md:p-12 lg:p-14 space-y-6">
                <div className="animate-in fade-in slide-in-from-bottom-1 duration-500 min-h-0 h-auto">
                  <QuestionRenderer 
                     language={language}
                     question={q}
                     hideOptions={true}
                  />
                </div>
                
                <div className="space-y-3">
                   <RadioGroup 
                     value={answers[currentIdx]?.toString() || ""} 
                     onValueChange={(v) => setAnswers(prev => ({ ...prev, [currentIdx]: parseInt(v) }))} 
                     className="grid grid-cols-1 gap-3"
                   >
                     {['A', 'B', 'C', 'D'].map((k, i) => {
                       const isSelected = answers[currentIdx] === i;
                       const enVal = q[`option${k}English`] || "";
                       const paVal = q[`option${k}Punjabi`] || "";

                       return (
                         <div key={i} className={cn(
                           "flex items-center space-x-4 md:space-x-6 px-4 md:px-6 h-[64px] md:h-[72px] border-2 rounded-2xl transition-all cursor-pointer shadow-sm group",
                           isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary/10' : 'border-slate-100 bg-white hover:border-slate-200'
                         )} onClick={() => setAnswers(prev => ({ ...prev, [currentIdx]: i }))}>
                            <div className={cn(
                               "h-8 w-8 md:h-10 md:w-10 rounded-lg border-2 flex items-center justify-center font-black text-xs md:text-sm shrink-0 transition-all",
                               isSelected ? "bg-primary border-primary text-white shadow-lg" : "border-slate-100 bg-slate-50 text-slate-400"
                            )}>
                               {k}
                            </div>
                            <div className="flex-1 select-none text-left overflow-hidden">
                                {language === 'en' ? (
                                  <p className="font-bold text-sm md:text-base text-[#111827] truncate">{enVal}</p>
                                ) : language === 'pa' ? (
                                  <p className="font-bold text-sm md:text-base text-[#111827] truncate">{paVal || enVal}</p>
                                ) : (
                                  <div className="flex flex-col justify-center leading-tight">
                                    <p className="font-bold text-[13px] md:text-sm text-[#111827] truncate">{enVal}</p>
                                    <p className="font-bold text-[13px] md:text-sm text-[#111827] truncate">{paVal}</p>
                                  </div>
                                 )}
                            </div>
                         </div>
                       )
                     })}
                   </RadioGroup>
                </div>
             </div>
          </div>

          {/* TACTICAL NAVIGATION FOOTER */}
          <footer className="h-16 md:h-20 border-t bg-white px-4 md:px-12 flex items-center justify-between shrink-0 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
             <Button variant="outline" className="h-10 md:h-12 px-4 md:px-8 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest gap-2 border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => currentIdx > 0 && setCurrentIdx(currentIdx - 1)} disabled={currentIdx === 0}>
                <ChevronLeft className="h-4 w-4" /> PREV
             </Button>
             
             <div className="flex gap-2 md:gap-4">
                <Button variant="outline" className={cn("h-10 md:h-12 px-4 md:px-10 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest transition-all", flagged.includes(currentIdx) ? "bg-purple-600 border-purple-600 text-white shadow-lg" : "text-amber-600 border-amber-200 bg-amber-50")} onClick={() => { if(!flagged.includes(currentIdx)) setFlagged(p=>[...p, currentIdx]); else setFlagged(p=>p.filter(idx=>idx!==currentIdx)); }}>
                   {flagged.includes(currentIdx) ? 'MARKED' : 'REVIEW'}
                </Button>
                <Button className="bg-[#0B1528] hover:bg-black text-white h-10 md:h-12 px-5 md:px-14 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] shadow-xl shadow-slate-900/20 transition-all active:scale-95" onClick={() => { if(currentIdx < questions.length-1) { const next = currentIdx + 1; setCurrentIdx(next); if(!visited.includes(next)) setVisited(v=>[...v, next])} }}>
                   SAVE & NEXT <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
             </div>
          </footer>
        </div>

        {/* RIGHT: QUESTION PALETTE (DESKTOP ONLY) */}
        <aside className="hidden lg:block w-[320px] bg-white overflow-hidden shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.02)] border-l">
           <div className="p-6 h-full flex flex-col">
              <QuestionPalette 
                questions={questions} 
                currentIndex={currentIdx} 
                answeredIndices={Object.keys(answers).map(Number)} 
                flaggedIndices={flagged} 
                visitedIndices={visited}
                onSelect={(idx) => { setCurrentIdx(idx); if (!visited.includes(idx)) setVisited(p => [...p, idx]); }} 
                examName={mock?.title}
              />
           </div>
        </aside>
      </main>
    </div>
  )
}

function LangToggle({ active, label, onClick }: any) {
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "px-2 md:px-4 py-1.5 rounded-md md:rounded-lg text-[8px] md:text-[10px] font-black tracking-widest transition-all duration-200", 
        active ? "bg-[#F97316] text-white shadow-md scale-105" : "text-[#7A8B9E] hover:text-white"
      )}
    >
      {label}
    </button>
  )
}
