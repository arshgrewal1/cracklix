
"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useDoc, useFirestore, useUser, useCollection } from "@/firebase"
import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc } from "firebase/firestore"
import Timer from "@/components/mocks/Timer"
import QuestionPalette from "@/components/mocks/QuestionPalette"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import { Button } from "@/components/ui/button"
import { RadioGroup } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Loader2, Target, LayoutGrid, ChevronRight, ChevronLeft, ShieldCheck, Pause, Play } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"

type LangMode = 'en' | 'pa' | 'bilingual'

/**
 * @fileOverview Testbook-Style Ultra-Compressed CBT Engine.
 * Optimized for zero-scroll on small screens with absolute black text.
 */

export default function MockAttemptPage() {
  const params = useParams()
  const router = useRouter()
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  const mockId = params.id as string
  
  const { data: mock, loading: mockLoading } = useDoc<any>(useMemo(() => (db ? doc(db, "mocks", mockId) : null), [db, mockId]))
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
        toast({ variant: "destructive", title: "Audit Sync Error", description: "Could not fetch nodes." })
      } finally {
        setLoadingQs(false)
      }
    }
    init()
  }, [db, mock, toast])

  const currentSection = useMemo(() => {
    const currentQ = questions[currentIdx];
    if (currentQ?.subjectId) {
       const sub = subjects?.find(s => s.id === currentQ.subjectId);
       if (sub) {
          return { 
             name: sub.name.toUpperCase(), 
             paper: currentQ.subjectId === 'punjabi-qualifying' ? "PAPER A" : "PAPER B" 
          };
       }
    }
    return { name: "GENERAL KNOWLEDGE", paper: "CORE" }
  }, [currentIdx, questions, subjects])

  const submitMock = useCallback(async () => {
    if (isSubmitting || questions.length === 0 || !user || !db) return
    setIsSubmitting(true)
    const correctMap: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 }
    let score = 0
    const subjectStats: Record<string, { correct: number; total: number; attempted: number }> = {}

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
      toast({ variant: "destructive", title: "Submission Failed", description: "Database rejection." })
      setIsSubmitting(false)
    }
  }, [isSubmitting, questions, answers, mock, user, db, router, mockId, toast, remainingTime])

  if (mockLoading || loadingQs) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-2">
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
      <p className="font-black uppercase text-[8px] tracking-widest text-slate-400">Loading Nodes...</p>
    </div>
  )

  const q = questions[currentIdx]

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white text-black">
      <header className="h-10 md:h-12 border-b flex items-center justify-between px-2 md:px-4 bg-[#0B1528] text-white shrink-0 z-[100]">
        <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
           <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
           <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest truncate max-w-[100px] md:max-w-none">
              {mock?.title || "Audit Gate"}
           </span>
           <div className="hidden sm:flex items-center gap-0.5 bg-white/5 p-0.5 rounded-lg">
              <LangTab label="EN" active={language === 'en'} onClick={() => setLanguage('en')} />
              <LangTab label="PA" active={language === 'pa'} onClick={() => setLanguage('pa')} />
              <LangTab label="BI" active={language === 'bilingual'} onClick={() => setLanguage('bilingual')} />
           </div>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <Timer onTimeUp={submitMock} initialSeconds={remainingTime} onTick={setRemainingTime} isPaused={isPaused} />
          <Button variant="ghost" size="icon" onClick={() => setIsPaused(!isPaused)} className="h-7 w-7 rounded-lg bg-white/5 text-white">
            {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </Button>
          <Button onClick={submitMock} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[8px] tracking-widest h-7 px-2 rounded-lg">
             SUBMIT
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {isPaused && (
           <div className="absolute inset-0 z-[200] bg-[#0B1528]/95 backdrop-blur-md flex flex-col items-center justify-center text-white">
              <Pause className="h-8 w-8 text-primary mb-2" />
              <h2 className="text-lg font-black uppercase mb-4">Audit Paused</h2>
              <Button onClick={() => setIsPaused(false)} className="bg-primary text-white font-black h-10 px-8 rounded-xl uppercase text-[9px]">Resume</Button>
           </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="px-3 py-1 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-3">
                <div className="text-left">
                   <p className="text-[6px] font-black text-primary uppercase tracking-widest leading-none">{currentSection.paper}</p>
                   <h2 className="text-[9px] font-black text-black uppercase flex items-center gap-1 mt-0.5 truncate max-w-[120px]">
                     <Target className="h-2.5 w-2.5 text-primary" /> {currentSection.name}
                   </h2>
                </div>
                <div className="h-4 w-px bg-slate-200" />
                <div className="space-y-0 text-center">
                   <span className="text-[9px] font-black text-black leading-none">{currentIdx + 1}/{questions.length}</span>
                </div>
             </div>
             <Sheet>
               <SheetTrigger asChild>
                 <Button variant="outline" className="lg:hidden rounded-lg h-6 px-2 gap-1 font-black text-[7px] uppercase border-slate-200 bg-white">
                    <LayoutGrid className="h-2.5 w-2.5" /> Map
                 </Button>
               </SheetTrigger>
               <SheetContent side="right" className="p-0 border-none w-[260px]">
                  <div className="p-4 h-full overflow-y-auto bg-white pt-12">
                     <QuestionPalette 
                        totalQuestions={questions.length} currentIndex={currentIdx} 
                        answeredIndices={Object.keys(answers).map(Number)} 
                        flaggedIndices={flagged} visitedIndices={visited}
                        onSelect={(idx) => { setCurrentIdx(idx); if (!visited.includes(idx)) setVisited(p => [...p, idx]); }} 
                      />
                  </div>
               </SheetContent>
             </Sheet>
          </div>

          <div className="flex-1 overflow-y-auto p-3 md:p-8 custom-scrollbar">
             <div className="max-w-2xl mx-auto pb-10">
                <QuestionRenderer 
                   language={q?.subjectId === "punjabi-qualifying" ? 'pa' : language}
                   question={q}
                />
                
                <div className="mt-4 space-y-1.5">
                   <RadioGroup 
                     value={answers[currentIdx]?.toString() || ""} 
                     onValueChange={(v) => setAnswers(prev => ({ ...prev, [currentIdx]: parseInt(v) }))} 
                     className="grid grid-cols-1 gap-1.5"
                   >
                     {['A', 'B', 'C', 'D'].map((k, i) => {
                       const isSelected = answers[currentIdx] === i;
                       const optEn = q?.[`option${k}En`] || "";
                       const optPa = q?.[`option${k}Pa`] || "";
                       const displayVal = (language === 'en' || (language === 'bilingual' && optEn && !optPa)) ? optEn : optPa;

                       return (
                         <div key={i} className={cn(
                           "flex items-center space-x-3 p-2.5 md:p-4 border-[1.5px] rounded-lg transition-all cursor-pointer",
                           isSelected ? 'border-primary bg-primary/5' : 'border-slate-100 bg-white'
                         )} onClick={() => setAnswers(prev => ({ ...prev, [currentIdx]: i }))}>
                            <div className={cn(
                               "h-5 w-5 md:h-7 md:w-7 rounded-full border-[1.5px] flex items-center justify-center font-black text-[8px] md:text-xs shrink-0 transition-all",
                               isSelected ? "bg-primary border-primary text-white" : "border-slate-200 text-slate-300"
                            )}>
                               {k}
                            </div>
                            <Label className="flex-1 cursor-pointer select-none text-[14px] md:text-[16px] font-bold text-[#000000] text-left leading-tight">
                               {displayVal || optEn}
                            </Label>
                         </div>
                       )
                     })}
                   </RadioGroup>
                </div>
             </div>
          </div>

          <footer className="h-12 md:h-16 border-t border-slate-100 bg-white px-2 md:px-4 flex items-center justify-between shrink-0 shadow-sm">
             <div className="flex gap-1.5">
                <Button variant="outline" className="h-8 md:h-10 px-3 text-[8px] md:text-[10px] font-black uppercase rounded-lg" onClick={() => currentIdx > 0 && setCurrentIdx(currentIdx - 1)} disabled={currentIdx === 0}>
                   <ChevronLeft className="h-3 w-3 mr-1" /> Prev
                </Button>
                <Button variant="ghost" className="h-8 md:h-10 px-2 text-[8px] font-black uppercase text-slate-300 rounded-lg hidden sm:flex" onClick={() => setAnswers(p => { const n={...p}; delete n[currentIdx]; return n; })}>Clear</Button>
             </div>
             <div className="flex gap-1.5">
                <Button variant="outline" className={cn("h-8 md:h-10 px-3 text-[8px] font-black uppercase rounded-lg", flagged.includes(currentIdx) ? "bg-amber-500 border-amber-500 text-white" : "text-amber-500 border-amber-100")} onClick={() => { if(!flagged.includes(currentIdx)) setFlagged(p=>[...p, currentIdx]); else setFlagged(p=>p.filter(idx=>idx!==currentIdx)); }}>
                   Review
                </Button>
                <Button className="bg-black hover:bg-slate-900 text-white h-8 md:h-10 px-6 rounded-lg font-black uppercase text-[8px] md:text-[10px] tracking-widest shadow-lg" onClick={() => { if(currentIdx < questions.length-1) { const next = currentIdx + 1; setCurrentIdx(next); if(!visited.includes(next)) setVisited(v=>[...v, next])} }}>
                   Next <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
             </div>
          </footer>
        </div>

        <aside className="w-[280px] border-l border-slate-50 bg-white hidden lg:flex flex-col shrink-0 overflow-hidden">
           <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <QuestionPalette 
                totalQuestions={questions.length} currentIndex={currentIdx} 
                answeredIndices={Object.keys(answers).map(Number)} 
                flaggedIndices={flagged} visitedIndices={visited}
                onSelect={(idx) => { setCurrentIdx(idx); if (!visited.includes(idx)) setVisited(p => [...p, idx]); }} 
              />
           </div>
        </aside>
      </main>
    </div>
  )
}

function LangTab({ label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={cn("px-2 py-0.5 rounded-md text-[7px] font-black tracking-widest transition-all", active ? "bg-white text-black shadow-sm" : "text-white/30 hover:text-white")}>{label}</button>
  )
}
