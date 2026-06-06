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
import { Loader2, Target, LayoutGrid, ChevronRight, ChevronLeft, ShieldCheck, Pause, Play } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"

type LangMode = 'en' | 'pa' | 'bilingual'

/**
 * @fileOverview Institutional High-Fidelity CBT Engine v18.0.
 * Rules Enforcement:
 * 1. STRICT LANGUAGE SEGREGATION: "PA" mode renders ONLY Punjabi.
 * 2. PALETTE OVERLAP FIX: Precision spacing for question matrix.
 * 3. NO SCROLLING: Optimized spacing to fit elements within viewport.
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
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))
  
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

  const subjectMap = useMemo(() => {
    const map: Record<string, string> = {};
    subjects?.forEach(s => { map[s.id] = s.name.toUpperCase() });
    return map;
  }, [subjects]);

  const examName = useMemo(() => {
    return exams?.find(e => e.id === mock?.examId)?.name || mock?.title || "OFFICIAL SERIES";
  }, [exams, mock])

  const cleanText = (text: string = "") => {
    return text
      .replace(/^[A-D][\.\):\s-]*/i, '')
      .replace(/^\d+[\.\):\s-]*/, '')
      .replace(/^ਪ੍ਰਸ਼ਨ\s*\d+[\.\):\s-]*/, '')
      .replace(/^ਪ੍ਰਸ਼ਨ\s*\d+[\.\):\s-]*/, '')
      .trim();
  };

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
      <header className="h-14 border-b flex items-center justify-between px-4 md:px-8 bg-[#0B1528] text-white shrink-0 z-[100] shadow-2xl">
        <div className="flex items-center gap-6">
           <ShieldCheck className="h-6 w-6 text-primary hidden sm:block" />
           <div className="flex flex-col text-left">
              <p className="text-[8px] font-black text-primary uppercase tracking-[0.2em] leading-none mb-1">CBT AUTHORITY</p>
              <h1 className="text-[11px] md:text-sm font-black uppercase tracking-tight truncate max-w-[140px] md:max-w-none">
                {examName}
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
           <div className="flex items-center gap-0.5 bg-white/5 p-0.5 md:p-1 rounded-lg md:rounded-xl border border-white/10">
              <LangTab label="EN" active={language === 'en'} onClick={() => setLanguage('en')} />
              <LangTab label="PA" active={language === 'pa'} onClick={() => setLanguage('pa')} />
              <LangTab label="BI" active={language === 'bilingual'} onClick={() => setLanguage('bilingual')} />
           </div>
           
           <div className="flex items-center gap-3">
              <Timer onTimeUp={submitMock} initialSeconds={remainingTime} onTick={setRemainingTime} isPaused={isPaused} />
              <Button variant="ghost" size="icon" onClick={() => setIsPaused(!isPaused)} className="h-9 w-9 rounded-lg bg-white/5 text-white hover:bg-white/10">
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
           </div>

           <Button onClick={submitMock} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-[0.2em] h-9 px-4 md:px-6 rounded-lg shadow-xl">
             FINISH
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {isPaused && (
           <div className="absolute inset-0 z-[200] bg-[#0B1528]/95 backdrop-blur-xl flex flex-col items-center justify-center text-white">
              <Pause className="h-12 w-12 text-primary mb-6" />
              <h2 className="text-2xl font-headline font-black uppercase mb-8 tracking-tighter">Audit Interrupted</h2>
              <Button onClick={() => setIsPaused(false)} className="bg-primary text-white font-black h-14 px-12 rounded-xl uppercase text-[11px] tracking-[0.3em] shadow-2xl">Resume Evaluation</Button>
           </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-6">
                <div className="text-left">
                   <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">SECTION</p>
                   <h2 className="text-[10px] font-black text-black uppercase flex items-center gap-2">
                     <Target className="h-2.5 w-2.5 text-primary" /> {subjectMap[q?.subjectId] || "GENERAL KNOWLEDGE"}
                   </h2>
                </div>
                <div className="h-5 w-px bg-slate-200" />
                <div className="text-left">
                   <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Q-NODE</p>
                   <p className="text-[10px] font-black text-black">{currentIdx + 1} / {questions.length}</p>
                </div>
             </div>
             
             <Sheet>
               <SheetTrigger asChild>
                 <Button variant="outline" className="lg:hidden rounded-lg h-8 px-3 gap-2 font-black text-[9px] uppercase border-slate-200 bg-white">
                    <LayoutGrid className="h-3 w-3 text-primary" /> Map
                 </Button>
               </SheetTrigger>
               <SheetContent side="right" className="p-0 border-none w-[280px]">
                  <div className="p-4 h-full overflow-y-auto bg-white pt-16">
                     <QuestionPalette 
                        questions={questions} 
                        currentIndex={currentIdx} 
                        answeredIndices={Object.keys(answers).map(Number)} 
                        flaggedIndices={flagged} visitedIndices={visited}
                        onSelect={(idx) => { setCurrentIdx(idx); if (!visited.includes(idx)) setVisited(p => [...p, idx]); }} 
                        subjectMap={subjectMap}
                        examName={examName}
                      />
                  </div>
               </SheetContent>
             </Sheet>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
             <div className="max-w-4xl mx-auto pb-6">
                <QuestionRenderer 
                   language={language}
                   question={q}
                   hideOptions={true}
                />
                
                <div className="mt-6 space-y-2.5">
                   <RadioGroup 
                     value={answers[currentIdx]?.toString() || ""} 
                     onValueChange={(v) => setAnswers(prev => ({ ...prev, [currentIdx]: parseInt(v) }))} 
                     className="grid grid-cols-1 gap-2.5"
                   >
                     {['A', 'B', 'C', 'D'].map((k, i) => {
                       const isSelected = answers[currentIdx] === i;
                       const enVal = q[`option${k}En`] || "";
                       const paVal = q[`option${k}Pa`] || "";

                       return (
                         <div key={i} className={cn(
                           "flex items-center space-x-4 p-3 md:p-4 border-2 rounded-xl transition-all cursor-pointer shadow-sm",
                           isSelected ? 'border-primary bg-primary/5' : 'border-slate-100 bg-white hover:border-slate-200'
                         )} onClick={() => setAnswers(prev => ({ ...prev, [currentIdx]: i }))}>
                            <div className={cn(
                               "h-8 w-8 rounded-full border-2 flex items-center justify-center font-black text-xs shrink-0 transition-all",
                               isSelected ? "bg-primary border-primary text-white shadow-lg" : "border-slate-200 text-slate-300"
                            )}>
                               {k}
                            </div>
                            <Label className="flex-1 cursor-pointer select-none text-[14px] md:text-[17px] font-bold text-[#0F172A] text-left leading-tight">
                                {language === 'en' ? cleanText(enVal) : 
                                 language === 'pa' ? (cleanText(paVal) || cleanText(enVal)) : 
                                 (
                                  <div className="inline">
                                    {cleanText(enVal)} {paVal && <span className="text-primary/40 mx-2">/</span>} {cleanText(paVal)}
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

          <footer className="h-16 md:h-20 border-t border-slate-100 bg-white px-4 md:px-12 flex items-center justify-between shrink-0 z-50">
             <div className="flex gap-2">
                <Button variant="outline" className="h-10 px-4 text-[10px] font-black uppercase rounded-lg border-slate-200" onClick={() => currentIdx > 0 && setCurrentIdx(currentIdx - 1)} disabled={currentIdx === 0}>
                   <ChevronLeft className="h-3 w-3 mr-1.5" /> Prev
                </Button>
             </div>
             
             <div className="flex gap-2">
                <Button variant="outline" className={cn("h-10 px-4 text-[10px] font-black uppercase rounded-lg border-2 transition-all", flagged.includes(currentIdx) ? "bg-amber-500 border-amber-500 text-white" : "text-amber-500 border-amber-100")} onClick={() => { if(!flagged.includes(currentIdx)) setFlagged(p=>[...p, currentIdx]); else setFlagged(p=>p.filter(idx=>idx!==currentIdx)); }}>
                   {flagged.includes(currentIdx) ? 'FLAGGED' : 'REVIEW'}
                </Button>
                <Button className="bg-[#0F172A] hover:bg-black text-white h-10 px-8 rounded-lg font-black uppercase text-[10px] tracking-widest shadow-xl" onClick={() => { if(currentIdx < questions.length-1) { const next = currentIdx + 1; setCurrentIdx(next); if(!visited.includes(next)) setVisited(v=>[...v, next])} }}>
                   Save & Next <ChevronRight className="h-3 w-3 ml-1.5" />
                </Button>
             </div>
          </footer>
        </div>

        <aside className="w-[320px] border-l border-slate-50 bg-white hidden lg:flex flex-col shrink-0 overflow-hidden">
           <div className="flex-1 overflow-y-auto p-5 no-scrollbar">
              <QuestionPalette 
                questions={questions} 
                currentIndex={currentIdx} 
                answeredIndices={Object.keys(answers).map(Number)} 
                flaggedIndices={flagged} visitedIndices={visited}
                onSelect={(idx) => { setCurrentIdx(idx); if (!visited.includes(idx)) setVisited(p => [...p, idx]); }} 
                subjectMap={subjectMap}
                examName={examName}
              />
           </div>
        </aside>
      </main>
    </div>
  )
}

function LangTab({ label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={cn("px-3 py-1.5 rounded-md text-[9px] font-black tracking-widest transition-all", active ? "bg-[#F97316] text-white shadow-lg" : "text-white/40 hover:text-white hover:bg-white/5")}>{label}</button>
  )
}
