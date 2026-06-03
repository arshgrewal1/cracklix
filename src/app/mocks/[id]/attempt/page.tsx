
"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useDoc, useFirestore, useUser } from "@/firebase"
import { doc, getDoc, addDoc, setDoc, serverTimestamp } from "firebase/firestore"
import Timer from "@/components/mocks/Timer"
import QuestionPalette from "@/components/mocks/QuestionPalette"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  Loader2, 
  Maximize, 
  PauseCircle, 
  PlayCircle,
  LayoutGrid,
  RotateCcw,
  Monitor,
  CheckCircle2,
  Bookmark
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type LangMode = 'en' | 'pa' | 'bilingual'

/**
 * @fileOverview Final Testbook-Style CBT Engine.
 * Optimized for trilingual stacking (EN/PA/HI) and zero-scroll visibility.
 */

export default function MockAttemptPage() {
  const params = useParams()
  const router = useRouter()
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  const mockId = params.id as string
  
  const { data: mockConfig, loading: mockLoading } = useDoc<any>(useMemo(() => (db ? doc(db, "mocks", mockId) : null), [db, mockId]))
  
  const [questions, setQuestions] = useState<any[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [flagged, setFlagged] = useState<number[]>([])
  const [visited, setVisited] = useState<Set<number>>(new Set([0]))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [language, setLanguage] = useState<LangMode>('en') 
  const [remainingTime, setRemainingTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [sessionRecovered, setSessionRecovered] = useState(false)

  // Fetch Questions
  useEffect(() => {
    async function fetchQuestions() {
      if (!db || !mockConfig?.questionIds) return
      setLoadingQuestions(true)
      try {
        const qData: any[] = []
        // High-speed parallel fetch
        const fetchPromises = mockConfig.questionIds.map((id: string) => getDoc(doc(db, "questions", id)))
        const snapshots = await Promise.all(fetchPromises)
        snapshots.forEach(snap => { if (snap.exists()) qData.push({ ...snap.data(), id: snap.id }) })
        setQuestions(qData)
        if (!sessionRecovered) setRemainingTime((mockConfig.duration || 120) * 60)
      } catch (e) {
        console.error("CBT Engine Failure", e)
      } finally {
        setLoadingQuestions(false)
      }
    }
    fetchQuestions()
  }, [db, mockConfig, sessionRecovered])

  // Session Recovery
  useEffect(() => {
    if (!db || !user || !mockId) return
    const sessionRef = doc(db, "test_sessions", `${user.uid}_${mockId}`)
    getDoc(sessionRef).then(snap => {
      if (snap.exists()) {
        const data = snap.data()
        if (data.status === 'IN_PROGRESS') {
          setAnswers(data.answers || {})
          setFlagged(data.flagged || [])
          setVisited(new Set(data.visited || [0]))
          setCurrentIdx(data.currentIdx || 0)
          if (data.remainingTime > 0) setRemainingTime(data.remainingTime)
          setSessionRecovered(true)
        }
      }
    })
  }, [db, user, mockId])

  // Auto-Save Node
  useEffect(() => {
    if (!db || !user || questions.length === 0 || isSubmitting || isPaused) return
    const interval = setInterval(() => {
      const sessionRef = doc(db, "test_sessions", `${user.uid}_${mockId}`)
      setDoc(sessionRef, {
        userId: user.uid, mockId, currentIdx, answers, flagged, remainingTime,
        visited: Array.from(visited),
        status: 'IN_PROGRESS', updatedAt: serverTimestamp()
      }, { merge: true })
    }, 15000)
    return () => clearInterval(interval)
  }, [db, user, mockId, currentIdx, answers, flagged, remainingTime, questions, isSubmitting, isPaused, visited])

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      const nextIdx = currentIdx + 1
      setCurrentIdx(nextIdx)
      setVisited(prev => new Set([...Array.from(prev), nextIdx]))
    }
  }

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1)
  }

  const handleSelectIdx = (idx: number) => {
    setCurrentIdx(idx)
    setVisited(prev => new Set([...Array.from(prev), idx]))
  }

  const clearResponse = () => {
    const newAnswers = { ...answers }
    delete newAnswers[currentIdx]
    setAnswers(newAnswers)
  }

  const markForReview = () => {
    if (!flagged.includes(currentIdx)) {
      setFlagged([...flagged, currentIdx])
    }
    handleNext()
  }

  // Keyboard Shortcuts (Phase 150)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused || isSubmitting) return;
      if (e.key === "ArrowRight") handleNext()
      else if (e.key === "ArrowLeft") handlePrev()
      else if (['1', '2', '3', '4'].includes(e.key)) setAnswers(prev => ({ ...prev, [currentIdx]: parseInt(e.key) - 1 }));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIdx, questions.length, isPaused, isSubmitting, answers]);

  const submitMock = useCallback(() => {
    if (isSubmitting || questions.length === 0) return
    setIsSubmitting(true)

    const correctMap: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 }
    const subjectStats: Record<string, any> = {}
    let correctCount = 0

    questions.forEach((q, idx) => {
      const subj = q.subjectId || "General Awareness"
      if (!subjectStats[subj]) subjectStats[subj] = { total: 0, correct: 0, attempted: 0 }
      subjectStats[subj].total++
      if (answers[idx] !== undefined) {
        subjectStats[subj].attempted++
        if (answers[idx] === correctMap[q.correctAnswer]) {
          subjectStats[subj].correct++; correctCount++
        }
      }
    })

    const resultData = {
      mockId, mockTitle: mockConfig?.title, userId: user?.uid,
      score: correctCount, totalQuestions: questions.length,
      accuracy: Math.round((correctCount / (Object.keys(answers).length || 1)) * 100),
      timestamp: new Date().toISOString(), subjectStats, answers
    }

    addDoc(collection(db, "results"), { ...resultData, createdAt: serverTimestamp() }).then(() => {
      setDoc(doc(db, "test_sessions", `${user?.uid}_${mockId}`), { status: 'SUBMITTED' }, { merge: true })
      router.push(`/results/${mockId}`)
    })
  }, [isSubmitting, questions, answers, mockId, mockConfig, user, db, router])

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  }

  if (mockLoading || loadingQuestions) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-6">
       <Loader2 className="h-10 w-10 text-primary animate-spin" />
       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Initializing Secure Hub...</p>
    </div>
  )

  const q = questions[currentIdx]
  const currentPaper = (currentIdx + 1) <= 50 ? "PAPER A: PUNJABI QUALIFYING" : "PAPER B: MAIN EXAM";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white text-[#0F172A] font-body selection:bg-primary/20">
      {/* Testbook Style Compact Header */}
      <header className="h-14 border-b flex items-center justify-between px-4 md:px-6 bg-[#0B1528] text-white shrink-0 z-[60] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10 scale-90 origin-left">
             <LangTab label="ENGLISH" active={language === 'en'} onClick={() => setLanguage('en')} />
             <LangTab label="ਪੰਜਾਬੀ" active={language === 'pa'} onClick={() => setLanguage('pa')} />
             <LangTab label="BILINGUAL" active={language === 'bilingual'} onClick={() => setLanguage('bilingual')} />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Timer onTimeUp={submitMock} initialSeconds={remainingTime} onTick={setRemainingTime} isPaused={isPaused} />

          <div className="flex items-center gap-2">
             <Button variant="ghost" size="sm" onClick={() => setIsPaused(!isPaused)} className="h-9 px-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 font-black uppercase text-[9px] tracking-widest gap-2">
                {isPaused ? <PlayCircle className="h-3.5 w-3.5" /> : <PauseCircle className="h-3.5 w-3.5" />} {isPaused ? 'Resume' : 'Pause'}
             </Button>
             <Button variant="ghost" size="icon" onClick={toggleFullScreen} className="h-9 w-9 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 hidden md:flex">
                <Maximize className="h-3.5 w-3.5" />
             </Button>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" className="bg-emerald-600 h-9 hover:bg-emerald-700 text-white font-black uppercase text-[9px] px-5 rounded-lg shadow-lg ml-2">Submit</Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl p-8 max-w-md">
                  <AlertDialogHeader className="text-left space-y-3">
                    <AlertDialogTitle className="text-xl font-black uppercase">Finish Audit?</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm font-medium text-slate-500">
                      You've attempted {Object.keys(answers).length} questions. Are you ready to generate your high-fidelity report?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex gap-2 pt-4">
                    <AlertDialogCancel className="rounded-lg font-bold h-11 flex-1">Review</AlertDialogCancel>
                    <AlertDialogAction onClick={submitMock} className="bg-[#0F172A] hover:bg-black text-white rounded-lg h-11 font-bold flex-1">Confirm</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
             </AlertDialog>
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        {isPaused && (
           <div className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-300">
              <PauseCircle className="h-16 w-16 text-primary" />
              <div className="text-center">
                 <h2 className="text-2xl font-black uppercase">Audit Interrupted</h2>
                 <p className="text-slate-500 text-sm">Your state is secured on the Cracklix cloud node.</p>
              </div>
              <Button onClick={() => setIsPaused(false)} className="h-12 px-8 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-xs tracking-widest rounded-lg shadow-xl">
                 Resume Now
              </Button>
           </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC]">
          <div className="px-6 py-3 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
             <div className="flex items-center gap-4">
                <div className="flex flex-col">
                   <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{currentPaper}</span>
                   <p className="text-[11px] font-bold text-slate-500 uppercase truncate max-w-[300px]">{q?.subjectId || 'General Awareness'}</p>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <span className="text-xs font-black text-[#0F172A] uppercase tracking-tight">Question {currentIdx + 1} <span className="text-slate-300 font-medium mx-1">of</span> {questions.length}</span>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
             <div className="max-w-4xl mx-auto space-y-10">
                <div className="space-y-8 text-left">
                   {(language === 'en' || language === 'bilingual') && (
                      <p className="text-[20px] md:text-[24px] lg:text-[28px] font-bold leading-relaxed text-[#0F172A] antialiased whitespace-pre-line">
                         {q.questionEn}
                      </p>
                   )}
                   {(language === 'pa' || language === 'bilingual') && (
                      <p className="text-[20px] md:text-[24px] lg:text-[28px] font-bold leading-relaxed text-[#0F172A] antialiased whitespace-pre-line">
                         {q.questionPa}
                      </p>
                   )}
                </div>

                <RadioGroup 
                  value={answers[currentIdx]?.toString() || ""} 
                  onValueChange={(val) => setAnswers(prev => ({ ...prev, [currentIdx]: parseInt(val) }))} 
                  className="grid grid-cols-1 gap-3 pt-6"
                >
                  {['A', 'B', 'C', 'D'].map((key, i) => {
                    const isSelected = answers[currentIdx] === i
                    return (
                      <div key={i} onClick={() => setAnswers(prev => ({ ...prev, [currentIdx]: i }))} className={cn(
                        "flex items-center space-x-4 p-4 border rounded-xl transition-all cursor-pointer bg-white shadow-sm",
                        isSelected ? 'border-primary ring-1 ring-primary/50' : 'border-slate-200 hover:border-slate-300'
                      )}>
                         <RadioGroupItem value={i.toString()} id={`opt-${i}`} className="text-primary border-slate-300 shrink-0 h-4 w-4" />
                         <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer select-none text-[#0F172A] space-y-1.5 py-1">
                            {(language === 'en' || language === 'bilingual') && (
                               <p className="text-[14px] md:text-[16px] lg:text-[18px] font-medium text-slate-500">{q[`option${key}En`]}</p>
                            )}
                            {(language === 'pa' || language === 'bilingual') && (
                               <p className="text-[16px] md:text-[18px] lg:text-[20px] font-bold">{q[`option${key}Pa`] || q[`option${key}En`]}</p>
                            )}
                         </Label>
                         <div className={cn(
                          "h-8 w-8 shrink-0 rounded-lg flex items-center justify-center text-[10px] font-black transition-all",
                          isSelected ? 'bg-primary text-white shadow-lg' : 'bg-slate-50 text-slate-400'
                        )}>{key}</div>
                      </div>
                    )
                  })}
                </RadioGroup>
             </div>
          </div>

          <footer className="h-16 border-t border-slate-200 bg-white px-4 md:px-6 flex items-center justify-between shrink-0 z-50 shadow-inner">
             <div className="flex gap-2">
                <Button variant="outline" className="rounded-lg h-10 px-4 font-black uppercase text-[10px] tracking-widest border-slate-200 hidden md:flex" onClick={handlePrev} disabled={currentIdx === 0}>Previous</Button>
                <Button variant="outline" className="rounded-lg h-10 px-4 font-black uppercase text-[10px] tracking-widest border-slate-200 text-slate-400" onClick={clearResponse}>Clear</Button>
                <Button variant="outline" className={cn("rounded-lg h-10 px-4 font-black uppercase text-[10px] tracking-widest transition-all", flagged.includes(currentIdx) ? "bg-amber-500 border-amber-500 text-white" : "border-slate-200 text-amber-600")} onClick={markForReview}>
                   Mark for Review
                </Button>
             </div>
             
             <div className="flex items-center gap-2">
                <Sheet>
                   <SheetTrigger asChild>
                      <Button variant="ghost" className="h-10 px-3 rounded-lg text-slate-400 font-black uppercase text-[10px] tracking-widest gap-2 hover:bg-slate-50 lg:hidden">
                         <LayoutGrid className="h-4 w-4" /> Palette
                      </Button>
                   </SheetTrigger>
                   <SheetContent side="bottom" className="h-[80vh] p-6 flex flex-col rounded-t-[2rem]">
                      <SheetHeader className="mb-4">
                         <SheetTitle className="text-lg font-black uppercase text-left">Exam Palette</SheetTitle>
                      </SheetHeader>
                      <div className="flex-1 overflow-y-auto custom-scrollbar">
                         <QuestionPalette 
                            totalQuestions={questions.length} 
                            currentIndex={currentIdx} 
                            answeredIndices={Object.keys(answers).map(Number)} 
                            flaggedIndices={flagged} 
                            visitedIndices={Array.from(visited)}
                            onSelect={handleSelectIdx} 
                            questions={questions}
                         />
                      </div>
                   </SheetContent>
                </Sheet>
                <Button className="bg-[#0F172A] hover:bg-black text-white h-10 px-8 rounded-lg font-black uppercase text-[10px] tracking-widest shadow-lg" onClick={handleNext}>
                  {currentIdx === questions.length - 1 ? 'Finish' : 'Save & Next'}
                </Button>
             </div>
          </footer>
        </div>

        <aside className="w-[320px] border-l border-slate-200 bg-white p-6 hidden lg:flex flex-col overflow-hidden">
           <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <QuestionPalette 
                totalQuestions={questions.length} 
                currentIndex={currentIdx} 
                answeredIndices={Object.keys(answers).map(Number)} 
                flaggedIndices={flagged} 
                visitedIndices={Array.from(visited)}
                onSelect={handleSelectIdx}
                questions={questions}
              />
           </div>
        </aside>
      </main>
    </div>
  )
}

function LangTab({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
   return (
      <button 
        onClick={onClick}
        className={cn(
          "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300",
          active ? "bg-white text-[#0B1528] shadow-md" : "text-white/40 hover:text-white"
        )}
      >
        {label}
      </button>
   )
}
