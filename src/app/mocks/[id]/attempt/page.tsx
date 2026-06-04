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
import { 
  Languages,
  Loader2,
  Target,
  LayoutGrid,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  CheckCircle2,
  Pause,
  Play
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"

type LangMode = 'en' | 'pa' | 'bilingual'

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
        toast({ variant: "destructive", title: "Audit Sync Error", description: "Could not fetch question nodes." })
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
      await setDoc(doc(db, "test_sessions", `${user.uid}_${mockId}`), { status: 'SUBMITTED', updatedAt: serverTimestamp() }, { merge: true })
      toast({ title: "Audit Finalized", description: "Result data successfully synced." })
      router.push(`/results/${mockId}`)
    } catch (e) {
      toast({ variant: "destructive", title: "Submission Failed", description: "Database transaction rejected." })
      setIsSubmitting(false)
    }
  }, [isSubmitting, questions, answers, mock, user, db, router, mockId, toast, remainingTime])

  if (mockLoading || loadingQs) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-4">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
      <p className="font-black uppercase text-[10px] tracking-widest text-slate-400">Syncing Bank...</p>
    </div>
  )

  const q = questions[currentIdx]
  const isPunjabiOnlyNode = q?.subjectId === "punjabi-qualifying";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white text-black">
      <header className="h-14 border-b flex items-center justify-between px-4 bg-[#0B1528] text-white shrink-0 z-[100] shadow-md">
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[150px] md:max-w-none">
                 {mock?.title || "Audit Gate"}
              </span>
           </div>
           <div className="h-4 w-px bg-white/10 hidden sm:block" />
           <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg">
              <LangTab label="EN" active={language === 'en'} onClick={() => setLanguage('en')} />
              <LangTab label="ਪੰਜਾਬੀ" active={language === 'pa'} onClick={() => setLanguage('pa')} />
              <LangTab label="BI" active={language === 'bilingual'} onClick={() => setLanguage('bilingual')} />
           </div>
        </div>
        <div className="flex items-center gap-2">
          <Timer onTimeUp={submitMock} initialSeconds={remainingTime} onTick={setRemainingTime} isPaused={isPaused} />
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsPaused(!isPaused)} 
            className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 text-white"
          >
            {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </Button>

          <Button onClick={submitMock} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[9px] tracking-widest h-8 px-4 rounded-lg shadow-lg">
             {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Submit Test"}
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Pause Overlay */}
        {isPaused && (
           <div className="absolute inset-0 z-[200] bg-[#0B1528]/95 backdrop-blur-md flex flex-col items-center justify-center text-white p-6">
              <Pause className="h-10 w-10 text-primary mb-4" />
              <h2 className="text-xl font-black uppercase tracking-tight mb-2">Audit Paused</h2>
              <Button onClick={() => setIsPaused(false)} className="bg-primary text-white font-black h-12 px-10 rounded-xl uppercase text-[10px]">
                 Resume Test
              </Button>
           </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-4">
                <div className="text-left">
                   <p className="text-[7px] font-black text-primary uppercase tracking-widest leading-none">{currentSection.paper}</p>
                   <h2 className="text-[11px] font-black text-black uppercase flex items-center gap-1.5 mt-0.5">
                     <Target className="h-3 w-3 text-primary" /> {currentSection.name}
                   </h2>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div className="space-y-0">
                   <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Question</p>
                   <span className="text-[11px] font-black text-black leading-none">{currentIdx + 1} / {questions.length}</span>
                </div>
             </div>
             <Sheet>
               <SheetTrigger asChild>
                 <Button variant="outline" className="lg:hidden rounded-lg h-7 px-2 gap-1 font-black text-[8px] uppercase border-slate-200 bg-white">
                    <LayoutGrid className="h-3 w-3" /> Map
                 </Button>
               </SheetTrigger>
               <SheetContent side="right" className="p-0 border-none w-[280px]">
                  <SheetHeader className="sr-only"><SheetTitle>Map</SheetTitle></SheetHeader>
                  <div className="p-6 h-full overflow-y-auto bg-white pt-16">
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

          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
             <div className="max-w-3xl mx-auto space-y-6 md:space-y-10 pb-20">
                <QuestionRenderer 
                   language={isPunjabiOnlyNode ? 'pa' : language}
                   question={q}
                />
                
                <div className="space-y-3 md:space-y-4">
                   <div className="flex items-center gap-1.5 border-b border-slate-50 pb-1.5 mb-2">
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Options</span>
                   </div>
                   <RadioGroup 
                     value={answers[currentIdx]?.toString() || ""} 
                     onValueChange={(v) => setAnswers(prev => ({ ...prev, [currentIdx]: parseInt(v) }))} 
                     className="grid grid-cols-1 gap-2 md:gap-3"
                   >
                     {['A', 'B', 'C', 'D'].map((k, i) => {
                       const isSelected = answers[currentIdx] === i;
                       const optEn = q?.[`option${k}En`] || "";
                       const optPa = q?.[`option${k}Pa`] || "";
                       
                       // Single language logic in attempt view
                       const displayVal = (language === 'en' || (language === 'bilingual' && optEn)) ? optEn : optPa;

                       return (
                         <div key={i} className={cn(
                           "flex items-center space-x-3 p-3 md:p-5 border-2 rounded-xl md:rounded-2xl transition-all cursor-pointer group relative",
                           isSelected ? 'border-primary bg-primary/5' : 'border-slate-50 bg-white hover:border-slate-100'
                         )} onClick={() => setAnswers(prev => ({ ...prev, [currentIdx]: i }))}>
                            <div className={cn(
                               "h-6 w-6 md:h-7 md:w-7 rounded-full border-2 flex items-center justify-center font-black text-[9px] md:text-xs transition-all",
                               isSelected ? "bg-primary border-primary text-white" : "border-slate-200 text-slate-300"
                            )}>
                               {k}
                            </div>
                            <Label className="flex-1 cursor-pointer select-none text-sm md:text-lg font-bold text-black text-left leading-snug">
                               {displayVal || optEn}
                            </Label>
                         </div>
                       )
                     })}
                   </RadioGroup>
                </div>
             </div>
          </div>

          <footer className="h-16 md:h-20 border-t border-slate-100 bg-white px-4 md:px-8 flex items-center justify-between shrink-0 shadow-sm">
             <div className="flex gap-2">
                <Button variant="outline" className="h-9 md:h-12 px-3 md:px-6 text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-lg md:rounded-xl" onClick={() => currentIdx > 0 && setCurrentIdx(currentIdx - 1)} disabled={currentIdx === 0}>
                   <ChevronLeft className="h-3 w-3 mr-1" /> Prev
                </Button>
                <Button variant="ghost" className="h-9 md:h-12 px-3 md:px-6 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 rounded-lg md:rounded-xl hidden sm:flex" onClick={() => setAnswers(p => { const n={...p}; delete n[currentIdx]; return n; })}>
                   Clear
                </Button>
             </div>
             <div className="flex gap-2">
                <Button variant="outline" className={cn("h-9 md:h-12 px-3 md:px-6 text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-lg md:rounded-xl shadow-sm", flagged.includes(currentIdx) ? "bg-amber-500 border-amber-500 text-white" : "text-amber-600 border-amber-200")} onClick={() => { if(!flagged.includes(currentIdx)) setFlagged(p=>[...p, currentIdx]); else setFlagged(p=>p.filter(idx=>idx!==currentIdx)); }}>
                   Review
                </Button>
                <Button className="bg-black hover:bg-slate-900 text-white h-9 md:h-12 px-4 md:px-10 rounded-lg md:rounded-xl font-black uppercase text-[8px] md:text-[10px] tracking-widest shadow-lg" onClick={() => { if(currentIdx < questions.length-1) { const next = currentIdx + 1; setCurrentIdx(next); if(!visited.includes(next)) setVisited(v=>[...v, next])} }}>
                   Next <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
             </div>
          </footer>
        </div>

        <aside className="w-[300px] border-l border-slate-100 bg-white hidden lg:flex flex-col shrink-0 overflow-hidden">
           <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
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
    <button onClick={onClick} className={cn("px-2 md:px-3 py-1 rounded-md text-[8px] md:text-[9px] font-black tracking-widest transition-all", active ? "bg-white text-black shadow-sm" : "text-white/40 hover:text-white")}>{label}</button>
  )
}
