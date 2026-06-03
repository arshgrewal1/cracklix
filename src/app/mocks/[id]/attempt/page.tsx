
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
import { ChevronLeft, ChevronRight, Flag, ShieldCheck, Trash2, Languages, Loader2, AlertTriangle, MessageSquare, Bookmark, MonitorCheck } from "lucide-react"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional CBT Engine (Phase 155).
 * Features: side-by-side Bilingual Mode (EN/PA/HI) and Trilingual toggles.
 */

type LangMode = 'english' | 'punjabi' | 'hindi' | 'bilingual'

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
  const [language, setLanguage] = useState<LangMode>('english')
  const [remainingTime, setRemainingTime] = useState(0)
  const [sessionRecovered, setSessionRecovered] = useState(false)

  const [isBookmarking, setIsBookmarking] = useState(false)
  const [reportData, setReportData] = useState({ type: "WRONG_ANS", comment: "" })
  const [isReporting, setIsReporting] = useState(false)

  useEffect(() => {
    async function fetchQuestions() {
      if (!db || !mockConfig?.questionIds) return
      setLoadingQuestions(true)
      try {
        const qData: any[] = []
        const fetchPromises = mockConfig.questionIds.map((id: string) => getDoc(doc(db, "questions", id)))
        const snapshots = await Promise.all(fetchPromises)
        snapshots.forEach(snap => { if (snap.exists()) qData.push({ ...snap.data(), id: snap.id }) })
        setQuestions(qData)
        if (!sessionRecovered) setRemainingTime((mockConfig.duration || 120) * 60)
      } catch (e) {
        console.error("CBT Engine Critical Failure", e)
      } finally {
        setLoadingQuestions(false)
      }
    }
    fetchQuestions()
  }, [db, mockConfig, sessionRecovered])

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
          setSessionRecovered(true)
          toast({ title: "Session Recovered", description: "Progress synced from cloud." })
        }
      }
    })
  }, [db, user, mockId, toast])

  useEffect(() => {
    if (!db || !user || questions.length === 0 || isSubmitting) return
    const interval = setInterval(() => {
      const sessionRef = doc(db, "test_sessions", `${user.uid}_${mockId}`)
      setDoc(sessionRef, {
        userId: user.uid, mockId, currentIdx, answers, flagged, remainingTime,
        status: 'IN_PROGRESS', updatedAt: serverTimestamp()
      }, { merge: true })
    }, 10000)
    return () => clearInterval(interval)
  }, [db, user, mockId, currentIdx, answers, flagged, remainingTime, questions, isSubmitting])

  const submitMock = useCallback(() => {
    if (isSubmitting || questions.length === 0) return
    setIsSubmitting(true)

    const correctMap: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 }
    const subjectStats: Record<string, any> = {}
    let correctCount = 0

    questions.forEach((q, idx) => {
      const subj = q.subjectId || "GK"
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

  const handleBookmark = () => {
    if (!db || !user || !questions[currentIdx]) return
    setIsBookmarking(true)
    const q = questions[currentIdx]
    const bookmarkRef = doc(collection(db, "bookmarks"))
    
    setDoc(bookmarkRef, {
      id: bookmarkRef.id, userId: user.uid, questionId: q.id,
      questionText: q.questionEn, subjectId: q.subjectId,
      timestamp: new Date().toISOString(), createdAt: serverTimestamp()
    }).then(() => {
      toast({ title: "MCQ Saved", description: "Added to study repository." })
    }).finally(() => setIsBookmarking(false))
  }

  const handleReport = () => {
    if (!db || !user || !questions[currentIdx]) return
    setIsReporting(true)
    const reportRef = doc(collection(db, "reports"))
    setDoc(reportRef, {
      ...reportData, id: reportRef.id, userId: user.uid,
      questionId: questions[currentIdx].id, status: 'PENDING',
      timestamp: serverTimestamp()
    }).then(() => {
      toast({ title: "Feedback Logged", description: "Audit initiated." })
      setReportData({ type: "WRONG_ANS", comment: "" })
    }).finally(() => setIsReporting(false))
  }

  if (mockLoading || loadingQuestions) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-6">
       <Loader2 className="h-12 w-12 text-primary animate-spin" />
       <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Secure Environment...</p>
    </div>
  )

  const q = questions[currentIdx]

  // Translation Helpers
  const getQuestionText = (lang: LangMode) => {
    if (lang === 'english') return q.questionEn
    if (lang === 'punjabi') return q.questionPa || q.questionEn
    if (lang === 'hindi') return q.questionHi || q.questionEn
    return q.questionEn
  }

  const getOptionText = (opt: 'A'|'B'|'C'|'D', lang: LangMode) => {
    if (lang === 'english') return q[`option${opt}En`]
    if (lang === 'punjabi') return q[`option${opt}Pa`] || q[`option${opt}En`]
    if (lang === 'hindi') return q[`option${opt}Hi`] || q[`option${opt}En`]
    return q[`option${opt}En`]
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white text-slate-900">
      <header className="h-20 border-b flex items-center justify-between px-8 bg-[#0B1528] text-white shrink-0 z-[1000]">
        <div className="flex items-center gap-4">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h1 className="font-bold text-sm uppercase tracking-tight truncate max-w-xs">{mockConfig?.title}</h1>
        </div>
        <div className="flex items-center gap-6">
          <Timer initialMinutes={mockConfig?.duration || 120} onTimeUp={submitMock} initialSeconds={remainingTime} onTick={setRemainingTime} />
          
          <Tabs value={language} onValueChange={(v: any) => setLanguage(v)} className="hidden lg:block">
            <TabsList className="bg-white/5 border border-white/10 rounded-2xl h-12 p-1.5 shadow-2xl">
              <TabsTrigger value="english" className="rounded-xl text-[9px] font-black uppercase px-5">English</TabsTrigger>
              <TabsTrigger value="punjabi" className="rounded-xl text-[9px] font-black uppercase px-5">ਪੰਜਾਬੀ</TabsTrigger>
              <TabsTrigger value="hindi" className="rounded-xl text-[9px] font-black uppercase px-5">हिन्दी</TabsTrigger>
              <TabsTrigger value="bilingual" className="rounded-xl text-[9px] font-black uppercase px-5 bg-primary/20 text-primary data-[state=active]:bg-primary">Bilingual</TabsTrigger>
            </TabsList>
          </Tabs>

          <AlertDialog>
            <AlertDialogTrigger asChild><Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs px-10 h-12 rounded-[1.5rem] shadow-xl">End Audit</Button></AlertDialogTrigger>
            <AlertDialogContent className="rounded-[3rem] p-12">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-3xl font-black font-headline uppercase text-[#0F172A]">Final Submission</AlertDialogTitle>
                <AlertDialogDescription className="py-6 text-lg font-medium text-slate-500">You have answered {Object.keys(answers).length} of {questions.length} questions. Once submitted, your trail cannot be modified.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex gap-4">
                <AlertDialogCancel className="rounded-2xl font-black uppercase text-[10px] h-14 px-8 border-slate-100">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={submitMock} className="bg-[#0F172A] hover:bg-black text-white rounded-2xl px-12 h-14 font-black uppercase text-[10px] tracking-widest shadow-2xl">Confirm & Submit</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 lg:p-20 bg-slate-50/30 custom-scrollbar relative">
          <div className="absolute top-0 left-0 h-1 bg-primary/10 w-full z-10">
             <div className="h-full bg-primary transition-all duration-500" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
          </div>

          <div className={cn("mx-auto space-y-12", language === 'bilingual' ? 'max-w-7xl' : 'max-w-4xl')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-primary/10 text-primary border-none px-5 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest">Question {currentIdx + 1}</Badge>
                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-slate-200 text-slate-400">{q?.subjectId || "GK"}</Badge>
              </div>
              <div className="flex items-center gap-6">
                 <Button variant="ghost" size="sm" className="text-slate-400 hover:text-primary gap-3 text-[10px] font-black uppercase tracking-widest" onClick={handleBookmark} disabled={isBookmarking}>
                    <Bookmark className="h-4 w-4" /> Save MCQ
                 </Button>
                 <Dialog>
                   <DialogTrigger asChild>
                     <Button variant="ghost" size="sm" className="text-slate-400 hover:text-rose-500 gap-3 text-[10px] font-black uppercase tracking-widest">
                       <AlertTriangle className="h-4 w-4" /> Audit Flag
                     </Button>
                   </DialogTrigger>
                   <DialogContent className="rounded-[3rem] bg-[#0F172A] text-white border-white/10 p-12">
                     <DialogHeader className="text-left space-y-4">
                       <DialogTitle className="text-3xl font-black font-headline uppercase">Audit Feedback</DialogTitle>
                       <DialogDescription className="text-slate-400 font-medium">Help us maintain institutional accuracy. What is the nature of the logic gap?</DialogDescription>
                     </DialogHeader>
                     <div className="space-y-8 py-8 text-left">
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase text-primary tracking-[0.2em] ml-1">Issue Type</Label>
                          <Select value={reportData.type} onValueChange={(v) => setReportData({...reportData, type: v})}>
                            <SelectTrigger className="bg-white/5 border-white/10 rounded-2xl h-14 font-bold"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="WRONG_ANS">Logic / Answer Key Error</SelectItem>
                              <SelectItem value="TYPO">Trilingual Translation Error</SelectItem>
                              <SelectItem value="MISSING_DATA">Media / Content Missing</SelectItem>
                              <SelectItem value="OTHER">Pattern Mismatch</SelectItem>
                            </SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase text-primary tracking-[0.2em] ml-1">Details</Label>
                          <Textarea value={reportData.comment} onChange={(e) => setReportData({...reportData, comment: e.target.value})} className="bg-white/5 border-white/10 rounded-3xl min-h-[120px] p-6 leading-relaxed" placeholder="Describe the audit finding..." />
                       </div>
                     </div>
                     <DialogFooter>
                       <Button onClick={handleReport} disabled={isReporting} className="w-full bg-primary hover:bg-primary/90 rounded-2xl h-16 font-black uppercase tracking-widest text-xs shadow-2xl">
                         Commit Audit Report
                       </Button>
                     </DialogFooter>
                   </DialogContent>
                 </Dialog>
              </div>
            </div>

            {language === 'bilingual' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                 <div className="space-y-8">
                    <Badge variant="outline" className="border-slate-100 text-slate-300 font-black text-[9px] uppercase">Primary: English</Badge>
                    <h2 className="text-2xl font-bold leading-relaxed text-[#0F172A]">{getQuestionText('english')}</h2>
                 </div>
                 <div className="space-y-8 border-l border-slate-100 pl-16">
                    <Badge variant="outline" className="border-slate-100 text-slate-300 font-black text-[9px] uppercase">Secondary: Punjabi</Badge>
                    <h2 className="text-2xl font-bold leading-relaxed text-[#0F172A]">{getQuestionText('punjabi')}</h2>
                 </div>
              </div>
            ) : (
              <h2 className="text-3xl font-bold leading-relaxed text-[#0F172A] text-left">
                {getQuestionText(language)}
              </h2>
            )}

            <RadioGroup value={answers[currentIdx]?.toString() || ""} onValueChange={(val) => setAnswers(prev => ({ ...prev, [currentIdx]: parseInt(val) }))} className="grid grid-cols-1 gap-6">
              {['A', 'B', 'C', 'D'].map((key, i) => {
                const isSelected = answers[currentIdx] === i
                return (
                  <div key={i} onClick={() => setAnswers(prev => ({ ...prev, [currentIdx]: i }))} className={cn(
                    "flex items-center space-x-8 p-8 border-2 rounded-[2rem] transition-all cursor-pointer bg-white group",
                    isSelected ? 'border-primary bg-primary/5 shadow-xl shadow-primary/5' : 'border-transparent hover:border-slate-200 shadow-lg shadow-slate-200/40'
                  )}>
                     <RadioGroupItem value={i.toString()} id={`opt-${i}`} className="text-primary border-slate-300 scale-125" />
                     <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer text-xl font-bold select-none text-slate-700 flex flex-col md:flex-row md:items-center gap-8 text-left">
                        <span className={cn(
                          "h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center text-sm font-black transition-all",
                          isSelected ? 'bg-primary text-white' : 'bg-slate-50 text-slate-300 group-hover:bg-slate-100'
                        )}>{key}</span>
                        
                        {language === 'bilingual' ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                             <span>{getOptionText(key as any, 'english')}</span>
                             <span className="text-slate-400 font-medium border-l border-slate-100 pl-8">{getOptionText(key as any, 'punjabi')}</span>
                          </div>
                        ) : (
                          <span>{getOptionText(key as any, language)}</span>
                        )}
                     </Label>
                  </div>
                )
              })}
            </RadioGroup>

            <div className="flex flex-col md:flex-row items-center justify-between pt-16 border-t border-slate-100 gap-8">
               <div className="flex gap-4 w-full md:w-auto">
                  <Button variant="outline" className="rounded-2xl h-16 px-10 font-black uppercase text-[10px] tracking-widest border-slate-100" onClick={() => currentIdx > 0 && setCurrentIdx(currentIdx - 1)} disabled={currentIdx === 0}><ChevronLeft className="mr-3 h-5 w-5" /> Previous</Button>
                  <Button className="flex-1 md:flex-none bg-[#0F172A] hover:bg-black text-white h-16 px-12 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl" onClick={() => currentIdx < questions.length - 1 && setCurrentIdx(currentIdx + 1)} disabled={currentIdx === questions.length - 1}>Save & Next <ChevronRight className="ml-3 h-5 w-5" /></Button>
               </div>
               <div className="flex gap-4 w-full md:w-auto justify-end">
                  <Button variant="ghost" className="text-slate-400 hover:text-rose-500 font-black uppercase text-[10px] h-16 px-6" onClick={() => { const a = {...answers}; delete a[currentIdx]; setAnswers(a); }}>Clear Audit</Button>
                  <Button variant="ghost" className={cn(
                    "font-black uppercase text-[10px] h-16 px-10 rounded-2xl border-2 transition-all",
                    flagged.includes(currentIdx) ? "text-amber-600 bg-amber-50 border-amber-300" : "border-transparent text-slate-300 hover:text-primary"
                  )} onClick={() => setFlagged(prev => prev.includes(currentIdx) ? prev.filter(f => f !== currentIdx) : [...prev, currentIdx])}>
                    <Flag className="mr-3 h-5 w-5" /> Review Later
                  </Button>
               </div>
            </div>
          </div>
        </div>
        <aside className="w-[420px] border-l border-slate-100 bg-white p-12 hidden xl:block overflow-y-auto custom-scrollbar">
           <QuestionPalette totalQuestions={questions.length} currentIndex={currentIdx} answeredIndices={Object.keys(answers).map(Number)} flaggedIndices={flagged} onSelect={setCurrentIdx} />
           
           <div className="mt-20 p-10 bg-slate-50 rounded-[3rem] border border-slate-100 space-y-6 text-left">
              <div className="flex items-center gap-4">
                 <MonitorCheck className="h-6 w-6 text-primary" />
                 <h4 className="font-headline font-black text-lg text-[#0F172A] uppercase">CBT Logic</h4>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Aspirant nodes are synchronized with the central repository every 10 seconds. Institutional integrity monitors active attempt trails.
              </p>
           </div>
        </aside>
      </main>
    </div>
  )
}
