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
    return { name: "GENERAL AUDIT", paper: "CORE" }
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
      <p className="font-black uppercase text-[10px] tracking-widest text-slate-400">Syncing Question Bank...</p>
    </div>
  )

  const q = questions[currentIdx]
  const isPunjabiOnlyNode = q?.subjectId === "punjabi-qualifying";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white text-[#0F172A]">
      <header className="h-16 border-b flex items-center justify-between px-4 md:px-6 bg-[#0B1528] text-white shrink-0 z-[100] shadow-xl">
        <div className="flex items-center gap-4 md:gap-6">
           <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                 <ShieldCheck className="h-4 w-4 text-primary" />
                 <span className="text-[10px] md:text-xs font-black uppercase tracking-widest truncate max-w-[120px] md:max-w-none">
                    {mock?.title || "Audit Gate"}
                 </span>
              </div>
           </div>
           <div className="h-6 w-px bg-white/10 hidden sm:block" />
           <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
              <LangTab label="EN" active={language === 'en'} onClick={() => setLanguage('en')} />
              <LangTab label="ਪੰਜਾਬੀ" active={language === 'pa'} onClick={() => setLanguage('pa')} />
              <LangTab label="BI" active={language === 'bilingual'} onClick={() => setLanguage('bilingual')} />
           </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Timer onTimeUp={submitMock} initialSeconds={remainingTime} onTick={setRemainingTime} isPaused={isPaused} />
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsPaused(!isPaused)} 
            className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10"
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>

          <Button onClick={submitMock} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[9px] md:text-[10px] tracking-widest h-10 px-4 md:px-8 rounded-xl shadow-2xl transition-all active:scale-95">
             {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Test"}
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Pause Overlay */}
        {isPaused && (
           <div className="absolute inset-0 z-[200] bg-[#0B1528]/95 backdrop-blur-xl flex flex-col items-center justify-center text-white p-6">
              <div className="h-20 w-20 rounded-[2.5rem] bg-primary/20 flex items-center justify-center text-primary mb-8 shadow-2xl">
                 <Pause className="h-10 w-10 fill-current" />
              </div>
              <h2 className="text-3xl font-headline font-black uppercase tracking-tight mb-2">Test Paused</h2>
              <p className="text-slate-400 font-medium mb-10">Institutional integrity active. Question content is hidden.</p>
              <Button onClick={() => setIsPaused(false)} className="bg-primary hover:bg-orange-600 text-white font-black h-16 px-12 rounded-2xl uppercase tracking-widest gap-3 shadow-xl">
                 <Play className="h-5 w-5" /> Resume Audit
              </Button>
           </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC]">
          <div className="px-6 md:px-8 py-3 md:py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-sm">
             <div className="flex items-center gap-4 md:gap-6">
                <div className="text-left">
                   <p className="text-[8px] md:text-[9px] font-black text-primary uppercase tracking-widest leading-none">{currentSection.paper}</p>
                   <h2 className="text-xs md:text-sm font-black text-[#0F172A] uppercase flex items-center gap-2 mt-1">
                     <Target className="h-3 w-3 md:h-4 md:w-4 text-primary" /> {currentSection.name}
                   </h2>
                </div>
                <div className="h-8 md:h-10 w-px bg-slate-100" />
                <div className="space-y-0.5 md:space-y-1">
                   <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question Matrix</p>
                   <span className="text-[10px] md:text-xs font-black text-slate-800">Q {currentIdx + 1} of {questions.length}</span>
                </div>
             </div>
             <Sheet>
               <SheetTrigger asChild>
                 <Button variant="outline" className="lg:hidden rounded-xl h-9 px-3 gap-2 font-black text-[9px] uppercase border-slate-200 bg-white shadow-sm">
                    <LayoutGrid className="h-3.5 w-3.5" /> View Map
                 </Button>
               </SheetTrigger>
               <SheetContent side="right" className="p-0 border-none w-[320px] max-w-[85vw]">
                  <SheetHeader className="sr-only"><SheetTitle>Audit Map</SheetTitle></SheetHeader>
                  <div className="p-8 h-full overflow-y-auto bg-white pt-20">
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

          <div className="flex-1 overflow-y-auto p-4 md:p-12 custom-scrollbar">
             <div className="max-w-4xl mx-auto space-y-8 md:space-y-16 pb-20">
                <QuestionRenderer 
                   language={isPunjabiOnlyNode ? 'pa' : language}
                   question={q}
                />
                
                <div className="space-y-4 md:space-y-6">
                   <div className="flex items-center gap-2 border-b border-slate-100 pb-2 md:pb-4 mb-4 md:mb-6">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Select Audit Response</span>
                   </div>
                   <RadioGroup 
                     value={answers[currentIdx]?.toString() || ""} 
                     onValueChange={(v) => setAnswers(prev => ({ ...prev, [currentIdx]: parseInt(v) }))} 
                     className="grid grid-cols-1 gap-3 md:gap-4"
                   >
                     {['A', 'B', 'C', 'D'].map((k, i) => {
                       const isSelected = answers[currentIdx] === i;
                       const optEn = q?.[`option${k}En`] || "";
                       const optPa = q?.[`option${k}Pa`] || "";
                       
                       const showOptEn = !isPunjabiOnlyNode && (language === 'en' || language === 'bilingual');
                       const showOptPa = isPunjabiOnlyNode || (language === 'pa' || language === 'bilingual');

                       return (
                         <div key={i} className={cn(
                           "flex items-center space-x-3 md:space-x-5 p-4 md:p-8 border-2 rounded-2xl md:rounded-[2rem] transition-all cursor-pointer group relative overflow-hidden",
                           isSelected ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-slate-100 bg-white hover:border-slate-200'
                         )} onClick={() => setAnswers(prev => ({ ...prev, [currentIdx]: i }))}>
                            <div className={cn(
                               "h-6 w-6 md:h-8 md:w-8 rounded-full border-2 flex items-center justify-center font-black text-[10px] md:text-xs transition-all",
                               isSelected ? "bg-primary border-primary text-white" : "border-slate-200 text-slate-300 group-hover:border-slate-300"
                            )}>
                               {k}
                            </div>
                            <Label className="flex-1 cursor-pointer select-none text-base md:text-xl font-black text-[#0B1528] flex flex-col gap-1 text-left">
                               {showOptEn && <span className="leading-snug">{optEn}</span>}
                               {showOptPa && <span className={cn("leading-snug", (showOptEn && language === 'bilingual') ? "border-t border-slate-100 pt-2 mt-1" : "")}>{optPa || optEn}</span>}
                            </Label>
                            {isSelected && <CheckCircle2 className="h-5 w-5 text-primary shrink-0 animate-in zoom-in" />}
                         </div>
                       )
                     })}
                   </RadioGroup>
                </div>
             </div>
          </div>

          <footer className="h-20 md:h-24 border-t border-slate-200 bg-white px-4 md:px-10 flex items-center justify-between shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
             <div className="flex gap-2 md:gap-4">
                <Button variant="outline" className="h-10 md:h-14 px-3 md:px-8 text-[9px] md:text-[11px] font-black uppercase tracking-widest rounded-xl md:rounded-2xl border-slate-200 hover:bg-slate-50 shadow-sm" onClick={() => currentIdx > 0 && setCurrentIdx(currentIdx - 1)} disabled={currentIdx === 0}>
                   <ChevronLeft className="mr-1 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" /> Prev
                </Button>
                <Button variant="ghost" className="h-10 md:h-14 px-3 md:px-8 text-[9px] md:text-[11px] font-black uppercase tracking-widest text-slate-400 rounded-xl md:rounded-2xl hover:bg-slate-50 hidden sm:flex" onClick={() => setAnswers(p => { const n={...p}; delete n[currentIdx]; return n; })}>
                   Clear
                </Button>
             </div>
             <div className="flex gap-2 md:gap-4">
                <Button variant="outline" className={cn("h-10 md:h-14 px-3 md:px-8 text-[9px] md:text-[11px] font-black uppercase tracking-widest rounded-xl md:rounded-2xl shadow-sm transition-all", flagged.includes(currentIdx) ? "bg-amber-500 border-amber-500 text-white shadow-amber-200" : "text-amber-600 border-amber-200 hover:bg-amber-50")} onClick={() => { if(!flagged.includes(currentIdx)) setFlagged(p=>[...p, currentIdx]); else setFlagged(p=>p.filter(idx=>idx!==currentIdx)); }}>
                   Review
                </Button>
                <Button className="bg-[#0B1528] hover:bg-black text-white h-10 md:h-14 px-4 md:px-12 rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[11px] tracking-[0.1em] md:tracking-[0.2em] shadow-2xl transition-all active:scale-95 group" onClick={() => { if(currentIdx < questions.length-1) { const next = currentIdx + 1; setCurrentIdx(next); if(!visited.includes(next)) setVisited(v=>[...v, next])} else { toast({ title: "Audit Terminus", description: "Review and submit your final results." }) } }}>
                   Next <ChevronRight className="ml-1 md:ml-2 h-3.5 w-3.5 md:h-4 md:w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
             </div>
          </footer>
        </div>

        <aside className="w-[360px] border-l border-slate-200 bg-white hidden lg:flex flex-col shrink-0 overflow-hidden">
           <div className="flex-1 overflow-y-auto p-8 custom-scrollbar text-left">
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
    <button onClick={onClick} className={cn("px-2 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black tracking-widest transition-all", active ? "bg-white text-[#0B1528] shadow-2xl" : "text-white/40 hover:text-white")}>{label}</button>
  )
}
