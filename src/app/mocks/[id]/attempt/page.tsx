
"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useDoc, useFirestore, useUser } from "@/firebase"
import { doc, collection, getDoc, addDoc, setDoc, serverTimestamp } from "firebase/firestore"
import Timer from "@/components/mocks/Timer"
import QuestionPalette from "@/components/mocks/QuestionPalette"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, Flag, ShieldCheck, Trash2, Languages, AlertTriangle, Loader2 } from "lucide-react"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

/**
 * @fileOverview Final Production-Ready CBT Attempt Engine.
 * Features: Timer, Palette, 10s Auto-Save, Session Recovery, Bilingual Toggles, Weak Topic Analysis.
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [language, setLanguage] = useState<'english' | 'punjabi'>('english')
  const [remainingTime, setRemainingTime] = useState(0)

  // 1. Fetch Questions for Mock
  useEffect(() => {
    async function fetchQuestions() {
      if (!db || !mockConfig?.questionIds || mockConfig.questionIds.length === 0) return
      setLoadingQuestions(true)
      try {
        const qData: any[] = []
        const fetchPromises = mockConfig.questionIds.map((id: string) => getDoc(doc(db, "questions", id)))
        const snapshots = await Promise.all(fetchPromises)
        snapshots.forEach(snap => {
          if (snap.exists()) qData.push(snap.data())
        })
        
        setQuestions(qData)
        if (remainingTime === 0) setRemainingTime((mockConfig.duration || 120) * 60)
      } catch (e) { 
        console.error("Critical: Failed to load question bank", e) 
      } finally { 
        setLoadingQuestions(false) 
      }
    }
    fetchQuestions()
  }, [db, mockConfig])

  // 2. Cloud Session Recovery (Arsh Grewal Management Logic)
  useEffect(() => {
    if (!db || !user || !mockId) return
    const sessionRef = doc(db, "test_sessions", `${user.uid}_${mockId}`)
    getDoc(sessionRef).then(snap => {
      if (snap.exists()) {
        const data = snap.data()
        if (data.status === 'IN_PROGRESS') {
          setAnswers(data.answers || {})
          setFlagged(data.flagged || [])
          setCurrentIdx(data.currentIdx || 0)
          if (data.remainingTime > 0) setRemainingTime(data.remainingTime)
          toast({ title: "Session Resumed", description: "Audit trail recovered from cloud." })
        }
      }
    })
  }, [db, user, mockId])

  // 3. Automated Checkpoint Sync (Every 10 seconds)
  useEffect(() => {
    if (!db || !user || questions.length === 0 || isSubmitting) return
    const interval = setInterval(() => {
      const sessionRef = doc(db, "test_sessions", `${user.uid}_${mockId}`)
      setDoc(sessionRef, {
        id: sessionRef.id, 
        userId: user.uid, 
        mockId, 
        currentIdx, 
        answers, 
        flagged, 
        remainingTime, 
        status: 'IN_PROGRESS', 
        updatedAt: serverTimestamp()
      }, { merge: true })
    }, 10000)
    return () => clearInterval(interval)
  }, [db, user, mockId, currentIdx, answers, flagged, remainingTime, questions, isSubmitting])

  const question = questions[currentIdx]

  const handleNext = () => { if (currentIdx < questions.length - 1) setCurrentIdx(currentIdx + 1) }
  const handlePrev = () => { if (currentIdx > 0) setCurrentIdx(currentIdx - 1) }
  const toggleFlag = () => setFlagged(prev => prev.includes(currentIdx) ? prev.filter(i => i !== currentIdx) : [...prev, currentIdx])
  const clearResponse = () => { const newAnswers = { ...answers }; delete newAnswers[currentIdx]; setAnswers(newAnswers) }

  const submitMock = useCallback(() => {
    if (isSubmitting || questions.length === 0) return
    setIsSubmitting(true)

    const correctCount = questions.reduce((acc, q, idx) => {
      const userAns = answers[idx]
      const correctMap: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 }
      return userAns === correctMap[q.correctAnswer] ? acc + 1 : acc
    }, 0)
    
    const topicStats: Record<string, { total: number; correct: number }> = {}
    questions.forEach((q, idx) => {
      const topic = q.subjectId || "General"
      if (!topicStats[topic]) topicStats[topic] = { total: 0, correct: 0 }
      topicStats[topic].total++
      if (answers[idx] !== undefined) {
         const correctMap: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 }
         if (answers[idx] === correctMap[q.correctAnswer]) topicStats[topic].correct++
      }
    })

    const weakTopics = Object.entries(topicStats)
      .filter(([topic, stats]) => (stats.correct / stats.total) < 0.6)
      .map(([topic]) => topic)

    const resultData = {
      mockId, 
      mockTitle: mockConfig?.title || "Mock Test", 
      userId: user?.uid || "guest",
      score: correctCount, 
      accuracy: Math.round((correctCount / (Object.keys(answers).length || 1)) * 100),
      correctCount, 
      incorrectCount: Object.keys(answers).length - correctCount, 
      skippedCount: questions.length - Object.keys(answers).length,
      totalQuestions: questions.length, 
      weakTopics, 
      timestamp: new Date().toISOString(), 
      answers
    }
    
    if (db) {
      addDoc(collection(db, "results"), { ...resultData, createdAt: serverTimestamp() }).then(() => {
        setDoc(doc(db, "test_sessions", `${user?.uid}_${mockId}`), { status: 'SUBMITTED' }, { merge: true })
        localStorage.setItem(`last_result_${mockId}`, JSON.stringify(resultData))
        router.push(`/results/${mockId}`)
      })
    }
  }, [isSubmitting, questions, answers, mockId, mockConfig, user, db, router])

  if (mockLoading || loadingQuestions) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-4">
      <Loader2 className="h-12 w-12 text-primary animate-spin" />
      <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Initialising High-Fidelity Engine...</p>
    </div>
  )

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white text-slate-900 font-body">
      <header className="h-20 border-b flex items-center justify-between px-8 bg-[#0B1528] text-white shrink-0 z-50 shadow-2xl relative">
        <div className="flex items-center gap-6">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-2xl shadow-primary/20"><ShieldCheck className="h-6 w-6 text-white" /></div>
          <div className="hidden sm:block">
             <h1 className="font-headline font-black text-sm tracking-tight truncate max-w-md uppercase">{mockConfig?.title}</h1>
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Official Pattern 2026 • CBT Protocol Active</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-8">
          <Timer initialMinutes={mockConfig?.duration || 120} onTimeUp={submitMock} initialSeconds={remainingTime} onTick={setRemainingTime} />
          <Tabs value={language} onValueChange={(v: any) => setLanguage(v)} className="hidden md:block">
            <TabsList className="bg-white/5 border border-white/10 rounded-2xl h-12 p-1">
              <TabsTrigger value="english" className="rounded-xl text-[10px] font-black uppercase px-6"><Languages className="h-4 w-4 mr-2" /> English</TabsTrigger>
              <TabsTrigger value="punjabi" className="rounded-xl text-[10px] font-black uppercase px-6"><Languages className="h-4 w-4 mr-2" /> ਪੰਜਾਬੀ</TabsTrigger>
            </TabsList>
          </Tabs>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs px-10 h-12 rounded-2xl shadow-xl">Submit Audit</Button></AlertDialogTrigger>
            <AlertDialogContent className="rounded-[3rem] bg-white border-none shadow-3xl p-10">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-headline text-3xl font-black text-[#0F172A] uppercase">Audit Summary</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-500 font-medium py-8 space-y-4">
                  <div className="flex justify-between items-center bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                    <span className="font-bold text-slate-700">Answered Statements:</span> 
                    <span className="font-black text-2xl text-emerald-600">{Object.keys(answers).length}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <span className="font-bold text-slate-400">Remaining / Skipped:</span> 
                    <span className="font-black text-2xl text-slate-400">{questions.length - Object.keys(answers).length}</span>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="pt-6 flex gap-4">
                <AlertDialogCancel className="rounded-2xl font-bold h-14 px-10">Back to Attempt</AlertDialogCancel>
                <AlertDialogAction onClick={submitMock} className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs rounded-2xl px-12 h-14">Confirm Submission</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-16 bg-slate-50/50 custom-scrollbar relative">
          <div className="absolute top-0 left-0 h-1.5 bg-primary/20 w-full z-10">
             <div className="h-full bg-primary transition-all duration-700 shadow-3xl" style={{ width: `${((currentIdx + 1) / (questions.length || 1)) * 100}%` }} />
          </div>

          <div className="max-w-4xl mx-auto space-y-12 pb-32">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <Badge className="text-[10px] font-black text-primary bg-primary/10 px-5 py-2 rounded-xl border border-primary/20 tracking-[0.2em] uppercase">Statement {currentIdx + 1}</Badge>
                 <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-slate-200 text-slate-400 px-4 py-1.5 rounded-xl">{question?.subjectId || "GK"}</Badge>
              </div>
            </div>

            <div className="space-y-12">
              <h2 className="text-2xl sm:text-4xl font-bold leading-relaxed text-[#0F172A] tracking-tight antialiased">
                {language === 'english' ? question?.questionEn : (question?.questionPa || question?.questionEn)}
              </h2>

              <RadioGroup value={answers[currentIdx]?.toString() || ""} onValueChange={(val) => setAnswers(prev => ({ ...prev, [currentIdx]: parseInt(val) }))} className="grid grid-cols-1 gap-6">
                {['A', 'B', 'C', 'D'].map((key, i) => {
                  const isSelected = answers[currentIdx] === i
                  const optionText = language === 'english' ? (question as any)[`option${key}En`] : ((question as any)[`option${key}Pa`] || (question as any)[`option${key}En`]);
                  return (
                    <div key={i} onClick={() => setAnswers(prev => ({ ...prev, [currentIdx]: i }))} className={`flex items-center space-x-8 p-8 border-2 rounded-[2rem] transition-all cursor-pointer shadow-sm ${isSelected ? 'border-primary bg-primary/5 ring-8 ring-primary/5' : 'border-white bg-white hover:border-slate-200 hover:shadow-xl'}`}>
                       <RadioGroupItem value={i.toString()} id={`opt-${i}`} className="text-primary border-slate-300 scale-150" />
                       <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer text-xl font-bold select-none text-slate-700 flex items-center gap-8">
                          <span className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-xs font-black uppercase transition-all ${isSelected ? 'bg-primary text-white shadow-xl' : 'bg-slate-100 text-slate-400'}`}>{key}</span>
                          <span className="leading-snug">{optionText}</span>
                       </Label>
                    </div>
                  )
                })}
              </RadioGroup>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-16 border-t border-slate-200">
              <div className="flex gap-6 w-full sm:w-auto">
                 <Button variant="outline" className="flex-1 sm:flex-none font-black uppercase text-[10px] tracking-widest rounded-2xl h-16 px-10 border-slate-200" onClick={handlePrev} disabled={currentIdx === 0}>
                    <ChevronLeft className="mr-3 h-5 w-5" /> Previous
                 </Button>
                 <Button className="flex-1 sm:flex-none bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-[0.2em] text-xs px-16 h-16 rounded-2xl shadow-3xl" onClick={handleNext} disabled={currentIdx === questions.length - 1}>
                    Save & Next <ChevronRight className="ml-3 h-5 w-5" />
                 </Button>
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                 <Button variant="ghost" className="text-slate-400 hover:text-rose-500 font-black uppercase text-[10px] h-16 rounded-2xl px-8" onClick={clearResponse} disabled={answers[currentIdx] === undefined}>
                    <Trash2 className="h-5 w-5 mr-2" /> Clear
                 </Button>
                 <Button variant="ghost" className={`font-black uppercase text-[10px] h-16 px-10 rounded-2xl border-2 transition-all ${flagged.includes(currentIdx) ? "text-amber-600 bg-amber-50 border-amber-300 shadow-xl" : "border-transparent text-slate-400"}`} onClick={toggleFlag}>
                    <Flag className={`mr-3 h-5 w-5 ${flagged.includes(currentIdx) ? "fill-current" : ""}`} />{flagged.includes(currentIdx) ? "Audit Required" : "Review Later"}
                 </Button>
              </div>
            </div>
          </div>
        </div>
        <aside className="w-[420px] border-l border-slate-200 bg-white overflow-y-auto hidden lg:block p-12 shadow-inner">
           <QuestionPalette totalQuestions={questions.length} currentIndex={currentIdx} answeredIndices={Object.keys(answers).map(Number)} flaggedIndices={flagged} onSelect={setCurrentIdx} />
           <div className="mt-20 p-8 rounded-[2rem] bg-[#0F172A] text-white space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck className="h-20 w-20" /></div>
              <h4 className="font-headline font-black uppercase text-xs text-primary">CBT Support</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">Auto-save has secured your trail. You can switch to Punjabi for the qualifying section at any time.</p>
           </div>
        </aside>
      </main>
    </div>
  )
}
