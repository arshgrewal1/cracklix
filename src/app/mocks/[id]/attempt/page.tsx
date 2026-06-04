"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useDoc, useFirestore, useUser, useCollection } from "@/firebase"
import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc } from "firebase/firestore"
import Timer from "@/components/mocks/Timer"
import QuestionPalette from "@/components/mocks/QuestionPalette"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { 
  PauseCircle, 
  PlayCircle,
  Languages,
  Loader2,
  Trash2,
  Target,
  LayoutGrid,
  ChevronRight,
  ChevronLeft
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
  const [isPaused, setIsPaused] = useState(false)
  const [loadingQs, setLoadingQs] = useState(true)

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
        toast({ variant: "destructive", title: "Sync Failure", description: "Could not fetch question nodes." })
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
    return { name: "GENERAL ASSESSMENT", paper: "PAPER B" }
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
      mockTitle: mock?.title || "Mock Test",
      subjectStats
    }

    try {
      await addDoc(collection(db, "results"), payload)
      await setDoc(doc(db, "test_sessions", `${user.uid}_${mockId}`), { status: 'SUBMITTED', updatedAt: serverTimestamp() }, { merge: true })
      toast({ title: "Audit Success", description: "Exam results finalized." })
      router.push(`/results/${mockId}`)
    } catch (e) {
      toast({ variant: "destructive", title: "Submission Failed", description: "Audit trail interrupted." })
      setIsSubmitting(false)
    }
  }, [isSubmitting, questions, answers, mock, user, db, router, mockId, toast])

  if (mockLoading || loadingQs) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-4">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
      <p className="font-black uppercase text-[10px] tracking-widest text-slate-400">Institutional Sync...</p>
    </div>
  )

  const q = questions[currentIdx]
  const isPunjabiOnlyNode = q?.subjectId === "punjabi-qualifying";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white text-[#0F172A]">
      <header className="h-14 border-b flex items-center justify-between px-4 bg-[#0B1528] text-white shrink-0 z-[60]">
        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-lg">
           <LangTab label="EN" active={language === 'en'} onClick={() => setLanguage('en')} />
           <LangTab label="ਪੰਜਾਬੀ" active={language === 'pa'} onClick={() => setLanguage('pa')} />
           <LangTab label="BI" active={language === 'bilingual'} onClick={() => setLanguage('bilingual')} />
        </div>
        <div className="flex items-center gap-3">
          <Timer onTimeUp={submitMock} initialSeconds={remainingTime || (mock?.duration || 120) * 60} onTick={setRemainingTime} isPaused={isPaused} />
          <Button onClick={submitMock} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] h-9 px-6 rounded-xl shadow-lg">
             Finish Audit
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC] h-full">
          <div className="px-6 py-3 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
             <div className="flex items-center gap-4 text-left">
                <div className="space-y-0.5">
                   <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest">{currentSection.paper}</p>
                   <h2 className="text-[11px] sm:text-xs font-black text-slate-800 uppercase flex items-center gap-2">
                     <Target className="h-3 w-3 text-primary" /> {currentSection.name}
                   </h2>
                </div>
                <div className="h-8 w-px bg-slate-100" />
                <span className="text-[10px] font-black text-slate-400 uppercase">Q {currentIdx + 1} / {questions.length}</span>
             </div>
             <Sheet>
               <SheetTrigger asChild>
                 <Button variant="outline" size="sm" className="lg:hidden rounded-lg h-9 px-3 gap-2 font-black text-[10px] uppercase border-slate-200">
                    <LayoutGrid className="h-3.5 w-3.5" /> Map
                 </Button>
               </SheetTrigger>
               <SheetContent side="right" className="p-0 border-none w-[300px]">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Question Audit Map</SheetTitle>
                  </SheetHeader>
                  <div className="p-6 h-full overflow-y-auto bg-white pt-16 text-left">
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

          <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
             <div className="max-w-4xl mx-auto space-y-12">
                <QuestionRenderer 
                   language={isPunjabiOnlyNode ? 'pa' : language}
                   question={q}
                />
                <RadioGroup 
                  value={answers[currentIdx]?.toString() || ""} 
                  onValueChange={(v) => setAnswers(prev => ({ ...prev, [currentIdx]: parseInt(v) }))} 
                  className="grid grid-cols-1 gap-3"
                >
                  {['A', 'B', 'C', 'D'].map((k, i) => {
                    const isSelected = answers[currentIdx] === i
                    const optEn = q?.[`option${k}En`] || ""
                    const optPa = q?.[`option${k}Pa`] || ""
                    return (
                      <div key={i} className={cn(
                        "flex items-center space-x-4 p-4 md:p-6 border rounded-2xl transition-all cursor-pointer bg-white",
                        isSelected ? 'border-primary ring-2 ring-primary/10' : 'border-slate-200'
                      )}>
                         <RadioGroupItem value={i.toString()} id={`opt-${i}`} />
                         <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer select-none text-base md:text-lg font-bold text-[#0B1528] flex flex-col gap-1 text-left">
                            {isPunjabiOnlyNode ? (
                               <span className="leading-tight">{optPa || optEn}</span>
                            ) : (
                               <>
                                  {language === 'bilingual' ? (
                                    <>
                                        <span className="leading-tight">{optEn}</span>
                                        {optPa && optPa !== optEn && <span className="leading-tight opacity-70 border-t border-slate-50 pt-1 mt-1 text-sm md:text-base font-medium">{optPa}</span>}
                                    </>
                                  ) : (
                                    <span>{language === 'en' ? optEn : (optPa || optEn)}</span>
                                  )}
                               </>
                            )}
                         </Label>
                      </div>
                    )
                  })}
                </RadioGroup>
             </div>
          </div>

          <footer className="h-20 border-t border-slate-200 bg-white px-8 flex items-center justify-between shrink-0">
             <div className="flex gap-3">
                <Button variant="outline" className="h-12 px-6 text-[10px] font-black uppercase tracking-widest rounded-xl" onClick={() => currentIdx > 0 && setCurrentIdx(currentIdx - 1)} disabled={currentIdx === 0}>
                   Previous
                </Button>
                <Button variant="ghost" className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 rounded-xl" onClick={() => setAnswers(p => { const n={...p}; delete n[currentIdx]; return n; })}>
                   Clear
                </Button>
             </div>
             <div className="flex gap-3">
                <Button variant="outline" className={cn("h-12 px-6 text-[10px] font-black uppercase tracking-widest rounded-xl", flagged.includes(currentIdx) ? "bg-amber-500 border-amber-500 text-white" : "text-amber-600")} onClick={() => { if(!flagged.includes(currentIdx)) setFlagged(p=>[...p, currentIdx]); if(currentIdx < questions.length-1) { const next = currentIdx + 1; setCurrentIdx(next); if(!visited.includes(next)) setVisited(v=>[...v, next])} }}>
                   Review & Next
                </Button>
                <Button className="bg-[#0B1528] hover:bg-black text-white h-12 px-10 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl" onClick={() => { if(currentIdx < questions.length-1) { const next = currentIdx + 1; setCurrentIdx(next); if(!visited.includes(next)) setVisited(v=>[...v, next])} else { toast({ title: "End of Series", description: "Review and finish audit." }) } }}>
                   Save & Next
                </Button>
             </div>
          </footer>
        </div>

        <aside className="w-[320px] border-l border-slate-200 bg-white hidden lg:flex flex-col shrink-0">
           <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-left">
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
    <button onClick={onClick} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all", active ? "bg-white text-[#0B1528] shadow-lg" : "text-white/40 hover:text-white")}>{label}</button>
  )
}
