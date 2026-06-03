
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
import { ChevronLeft, ChevronRight, Flag, ShieldCheck, Trash2, Languages, Loader2, AlertTriangle, MessageSquare, Bookmark } from "lucide-react"
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

/**
 * @fileOverview Institutional CBT Engine with Bookmark System (Phase 148).
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
  const [sessionRecovered, setSessionRecovered] = useState(false)

  // Bookmark Logic
  const [isBookmarking, setIsBookmarking] = useState(false)

  // Report Logic
  const [reportData, setReportData] = useState({ type: "WRONG_ANS", comment: "" })
  const [isReporting, setIsReporting] = useState(false)

  // 1. Load Question Data
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

  // 2. Resume Session Logic
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
          toast({ title: "Session Recovered", description: "Your progress has been synced from the cloud." })
        }
      }
    })
  }, [db, user, mockId, toast])

  // 3. Heartbeat Sync (Every 10s)
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
      id: bookmarkRef.id,
      userId: user.uid,
      questionId: q.id,
      questionText: q.questionEn,
      subjectId: q.subjectId,
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp()
    }).then(() => {
      toast({ title: "MCQ Saved", description: "This question has been added to your study repository." })
    }).finally(() => setIsBookmarking(false))
  }

  const handleReport = () => {
    if (!db || !user || !questions[currentIdx]) return
    setIsReporting(true)
    const reportRef = doc(collection(db, "reports"))
    setDoc(reportRef, {
      ...reportData,
      id: reportRef.id,
      userId: user.uid,
      questionId: questions[currentIdx].id,
      status: 'PENDING',
      timestamp: serverTimestamp()
    }).then(() => {
      toast({ title: "Feedback Logged", description: "Arsh Grewal Management will audit this question." })
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

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white text-slate-900">
      <header className="h-20 border-b flex items-center justify-between px-8 bg-[#0B1528] text-white shrink-0 z-50">
        <div className="flex items-center gap-4">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h1 className="font-bold text-sm uppercase tracking-tight truncate max-w-xs">{mockConfig?.title}</h1>
        </div>
        <div className="flex items-center gap-6">
          <Timer initialMinutes={mockConfig?.duration || 120} onTimeUp={submitMock} initialSeconds={remainingTime} onTick={setRemainingTime} />
          <Tabs value={language} onValueChange={(v: any) => setLanguage(v)} className="hidden md:block">
            <TabsList className="bg-white/5 border border-white/10 rounded-xl h-11 p-1">
              <TabsTrigger value="english" className="rounded-lg text-[10px] font-black uppercase">English</TabsTrigger>
              <TabsTrigger value="punjabi" className="rounded-lg text-[10px] font-black uppercase">ਪੰਜਾਬੀ</TabsTrigger>
            </TabsList>
          </Tabs>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs px-8 h-11 rounded-xl shadow-lg">Submit Test</Button></AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2.5rem] p-10">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-black uppercase">End Audit?</AlertDialogTitle>
                <AlertDialogDescription className="py-6">You have answered {Object.keys(answers).length} of {questions.length} questions. Are you sure you want to finish?</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex gap-4">
                <AlertDialogCancel className="rounded-xl font-bold h-12">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={submitMock} className="bg-primary hover:bg-primary/90 rounded-xl px-10 h-12 font-black uppercase text-xs">Confirm Finish</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 sm:p-20 bg-slate-50/30 custom-scrollbar relative">
          <div className="absolute top-0 left-0 h-1 bg-primary/20 w-full z-10">
             <div className="h-full bg-primary transition-all duration-500" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
          </div>

          <div className="max-w-4xl mx-auto space-y-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-lg font-black uppercase text-[10px]">MCQ {currentIdx + 1}</Badge>
                <Badge variant="outline" className="text-[10px] font-bold border-slate-200 uppercase">{q?.subjectId || "GK"}</Badge>
              </div>
              <div className="flex items-center gap-4">
                 <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-slate-400 hover:text-primary gap-2 text-[10px] font-black uppercase tracking-widest"
                    onClick={handleBookmark}
                    disabled={isBookmarking}
                 >
                    <Bookmark className="h-3.5 w-3.5" /> Save Question
                 </Button>
                 <Dialog>
                   <DialogTrigger asChild>
                     <Button variant="ghost" size="sm" className="text-slate-400 hover:text-rose-500 gap-2 text-[10px] font-black uppercase tracking-widest">
                       <AlertTriangle className="h-3.5 w-3.5" /> Report Issue
                     </Button>
                   </DialogTrigger>
                   <DialogContent className="rounded-[2rem] bg-[#0F172A] text-white border-white/10 p-10">
                     <DialogHeader>
                       <DialogTitle className="text-2xl font-black uppercase">Audit Feedback</DialogTitle>
                       <DialogDescription className="text-slate-400">Help us maintain institutional accuracy. What is wrong with this question?</DialogDescription>
                     </DialogHeader>
                     <div className="space-y-6 py-6">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-500">Issue Type</Label>
                          <Select value={reportData.type} onValueChange={(v) => setReportData({...reportData, type: v})}>
                            <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="WRONG_ANS">Incorrect Answer Key</SelectItem>
                              <SelectItem value="TYPO">Typo / Language Error</SelectItem>
                              <SelectItem value="MISSING_DATA">Missing Options/Images</SelectItem>
                              <SelectItem value="OTHER">Other Issue</SelectItem>
                            </SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-500">Comments</Label>
                          <Textarea value={reportData.comment} onChange={(e) => setReportData({...reportData, comment: e.target.value})} className="bg-white/5 border-white/10 rounded-xl min-h-[100px]" placeholder="Provide details..." />
                       </div>
                     </div>
                     <DialogFooter>
                       <Button onClick={handleReport} disabled={isReporting} className="w-full bg-primary hover:bg-primary/90 rounded-xl h-12 font-black uppercase text-xs">
                         Submit Audit Report
                       </Button>
                     </DialogFooter>
                   </DialogContent>
                 </Dialog>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold leading-relaxed text-[#0F172A]">
              {language === 'english' ? q?.questionEn : (q?.questionPa || q?.questionEn)}
            </h2>

            <RadioGroup value={answers[currentIdx]?.toString() || ""} onValueChange={(val) => setAnswers(prev => ({ ...prev, [currentIdx]: parseInt(val) }))} className="grid grid-cols-1 gap-5">
              {['A', 'B', 'C', 'D'].map((key, i) => {
                const isSelected = answers[currentIdx] === i
                const optText = language === 'english' ? q?.[`option${key}En`] : (q?.[`option${key}Pa`] || q?.[`option${key}En`]);
                return (
                  <div key={i} onClick={() => setAnswers(prev => ({ ...prev, [currentIdx]: i }))} className={`flex items-center space-x-6 p-6 border-2 rounded-2xl transition-all cursor-pointer bg-white ${isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:border-slate-200 shadow-sm'}`}>
                     <RadioGroupItem value={i.toString()} id={`opt-${i}`} className="text-primary border-slate-300" />
                     <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer text-lg font-bold select-none text-slate-700 flex items-center gap-6">
                        <span className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center text-xs font-black ${isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>{key}</span>
                        {optText}
                     </Label>
                  </div>
                )
              })}
            </RadioGroup>

            <div className="flex items-center justify-between pt-10 border-t border-slate-200">
               <div className="flex gap-4">
                  <Button variant="outline" className="rounded-xl h-12 px-8 font-bold border-slate-200" onClick={() => currentIdx > 0 && setCurrentIdx(currentIdx - 1)} disabled={currentIdx === 0}><ChevronLeft className="mr-2 h-4 w-4" /> Previous</Button>
                  <Button className="bg-[#0F172A] hover:bg-black text-white h-12 px-10 rounded-xl font-black uppercase text-[10px] tracking-widest" onClick={() => currentIdx < questions.length - 1 && setCurrentIdx(currentIdx + 1)} disabled={currentIdx === questions.length - 1}>Save & Next <ChevronRight className="ml-2 h-4 w-4" /></Button>
               </div>
               <div className="flex gap-3">
                  <Button variant="ghost" className="text-slate-400 hover:text-rose-500 font-bold" onClick={() => { const a = {...answers}; delete a[currentIdx]; setAnswers(a); }}>Clear</Button>
                  <Button variant="ghost" className={`font-black uppercase text-[10px] h-12 px-6 rounded-xl border-2 ${flagged.includes(currentIdx) ? "text-amber-600 bg-amber-50 border-amber-300" : "border-transparent text-slate-400"}`} onClick={() => setFlagged(prev => prev.includes(currentIdx) ? prev.filter(f => f !== currentIdx) : [...prev, currentIdx])}><Flag className="mr-2 h-4 w-4" /> Review</Button>
               </div>
            </div>
          </div>
        </div>
        <aside className="w-[400px] border-l bg-white p-10 hidden lg:block overflow-y-auto">
           <QuestionPalette totalQuestions={questions.length} currentIndex={currentIdx} answeredIndices={Object.keys(answers).map(Number)} flaggedIndices={flagged} onSelect={setCurrentIdx} />
        </aside>
      </main>
    </div>
  )
}
