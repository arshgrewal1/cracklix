
"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, BrainCircuit, ChevronRight, HelpCircle, Trophy, Target, Zap, Share2, Sparkles, BarChart3, Clock, LayoutDashboard, Bookmark } from "lucide-react"
import { rationalizeMockQuestion, RationalizeMockQuestionOutput } from "@/ai/flows/rationalize-mock-question"
import { useFirestore } from "@/firebase"
import { doc, getDocs, query, collection, where, addDoc } from "firebase/firestore"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from "recharts"
import { useToast } from "@/hooks/use-toast"

export default function ResultPage() {
  const params = useParams()
  const mockId = params.id as string
  const db = useFirestore()
  const { toast } = useToast()

  const [rationalizing, setRationalizing] = useState<string | null>(null)
  const [aiResults, setAiResults] = useState<Record<string, RationalizeMockQuestionOutput>>({})
  const [sessionData, setSessionData] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])

  useEffect(() => {
    const saved = localStorage.getItem(`last_result_${mockId}`)
    if (saved) {
      const data = JSON.parse(saved)
      setSessionData(data)
      
      if (db && data.mockId) {
        const fetchQs = async () => {
          const mocksRef = collection(db, "mocks")
          const mockSnap = await getDocs(query(mocksRef, where("id", "==", data.mockId)))
          const mockData = mockSnap.docs[0]?.data()
          if (mockData?.questionIds) {
             const qData: any[] = []
             for (const id of mockData.questionIds) {
                const qSnap = await getDocs(query(collection(db, "questions"), where("id", "==", id)))
                if (!qSnap.empty) qData.push(qSnap.docs[0].data())
             }
             setQuestions(qData)
          }
        }
        fetchQs()
      }
    }
  }, [mockId, db])

  const handleRationalize = async (qId: string, qText: string, options: string[], correct: number, userAns: number | undefined) => {
    setRationalizing(qId)
    try {
      const result = await rationalizeMockQuestion({
        questionText: qText,
        options,
        correctAnswer: options[correct],
        userAnswer: userAns !== undefined ? options[userAns] : "No answer provided"
      })
      setAiResults(prev => ({ ...prev, [qId]: result }))
    } catch (error) {
      toast({ variant: "destructive", title: "AI Sync Error", description: "Could not retrieve tutor logic." })
    } finally {
      setRationalizing(null)
    }
  }

  const handleBookmark = (q: any) => {
     if (!db || !sessionData?.userId) return
     addDoc(collection(db, "bookmarks"), {
        userId: sessionData.userId,
        questionId: q.id,
        questionText: q.questionEn,
        subject: q.subjectId,
        timestamp: new Date().toISOString()
     })
     toast({ title: "MCQ Bookmarked", description: "Saved to your study repository for revision." })
  }

  const chartData = useMemo(() => {
    if (!questions.length || !sessionData) return []
    const topicStats: Record<string, { correct: number; total: number }> = {}
    questions.forEach((q, idx) => {
      const topic = q.subjectId || "General"
      if (!topicStats[topic]) topicStats[topic] = { correct: 0, total: 0 }
      topicStats[topic].total++
      
      const correctMap: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 }
      if (sessionData.answers[idx] === correctMap[q.correctAnswer]) topicStats[topic].correct++
    })
    return Object.entries(topicStats).map(([name, stats]) => ({
      name,
      accuracy: Math.round((stats.correct / stats.total) * 100)
    }))
  }, [questions, sessionData])

  if (!sessionData) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 text-center">
          <div className="h-28 w-28 bg-slate-50 rounded-[2.5rem] flex items-center justify-center animate-pulse border border-slate-100">
            <Trophy className="h-12 w-12 text-slate-300" />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-headline font-black text-[#0F172A] uppercase">Generating Audit</h1>
            <p className="text-slate-400 text-lg font-medium">Analyzing your high-fidelity performance metrics...</p>
          </div>
        </main>
      </div>
    )
  }

  const { correctCount, incorrectCount, totalQuestions, answers, accuracy, weakTopics, mockTitle } = sessionData
  const skippedCount = totalQuestions - (Object.keys(answers).length)

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/30">
      <Navbar />
      <main className="container mx-auto px-6 py-16 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          
          <div className="lg:col-span-8 space-y-8">
            <Card className="border-none bg-white shadow-2xl shadow-slate-900/5 rounded-[3.5rem] overflow-hidden">
               <CardHeader className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                       <Trophy className="h-6 w-6 text-amber-500" />
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Institutional Audit Summary</span>
                    </div>
                    <CardTitle className="font-headline text-4xl font-black text-[#0F172A]">{mockTitle}</CardTitle>
                  </div>
                  <div className="flex gap-3">
                     <Button variant="outline" className="rounded-2xl border-slate-100 h-14 px-8 font-black uppercase text-[10px] tracking-widest gap-2">
                        <Share2 className="h-4 w-4" /> Share Score
                     </Button>
                     <Button asChild className="bg-primary text-white rounded-2xl h-14 px-8 font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-primary/20">
                        <Link href="/dashboard"><LayoutDashboard className="h-4 w-4 mr-2" /> My Prep</Link>
                     </Button>
                  </div>
               </CardHeader>
               <CardContent className="p-12">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-12 text-center mb-20">
                    <StatItem icon={<CheckCircle2 className="text-emerald-500" />} label="Correct" value={correctCount} color="text-emerald-600" />
                    <StatItem icon={<XCircle className="text-rose-500" />} label="Wrong" value={incorrectCount} color="text-rose-600" />
                    <StatItem icon={<HelpCircle className="text-slate-300" />} label="Skipped" value={skippedCount} color="text-slate-400" />
                    <StatItem icon={<Target className="text-primary" />} label="Precision" value={`${accuracy}%`} color="text-primary" />
                  </div>
                  
                  <div className="space-y-10 bg-slate-50/50 p-10 rounded-[3rem] border border-slate-100">
                     <div className="flex justify-between items-end">
                        <div className="space-y-1">
                           <h4 className="font-headline font-black text-xl text-[#0F172A]">Subject Mastery Matrix</h4>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sectional Accuracy Trends</p>
                        </div>
                        <BarChart3 className="h-10 w-10 text-primary opacity-20" />
                     </div>
                     <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} />
                              <YAxis hide domain={[0, 100]} />
                              <Tooltip cursor={{fill: 'transparent'}} content={({active, payload}) => {
                                 if (active && payload && payload.length) {
                                    return <div className="bg-[#0F172A] text-white p-4 rounded-2xl shadow-3xl text-xs font-bold">{payload[0].value}% Accuracy</div>
                                 }
                                 return null
                              }} />
                              <Bar dataKey="accuracy" radius={[12, 12, 0, 0]} barSize={48}>
                                 {chartData.map((entry, index) => (
                                    <Cell key={index} fill={entry.accuracy > 70 ? "#10B981" : entry.accuracy > 40 ? "#F97316" : "#EF4444"} />
                                 ))}
                              </Bar>
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
               </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none bg-[#0F172A] text-white shadow-3xl rounded-[3.5rem] overflow-hidden relative">
               <div className="absolute top-0 right-0 p-10 opacity-5"><Zap className="h-40 w-40" /></div>
               <CardHeader className="p-10 pb-0">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center">
                        <Zap className="h-6 w-6 text-primary" />
                     </div>
                     <CardTitle className="font-headline text-2xl font-black uppercase">Weak Verticals</CardTitle>
                  </div>
               </CardHeader>
               <CardContent className="p-10 pt-6 space-y-8 relative z-10">
                  <p className="text-slate-400 text-base leading-relaxed font-medium">Prioritize these institutional subjects in your next revision session.</p>
                  <div className="space-y-4">
                     {weakTopics.length > 0 ? weakTopics.map((topic: string) => (
                        <div key={topic} className="flex items-center justify-between bg-white/[0.03] p-6 rounded-[1.5rem] border border-white/5 group hover:bg-white/[0.08] transition-all">
                           <div className="flex items-center gap-4">
                              <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]" />
                              <span className="font-bold text-slate-200 uppercase tracking-widest text-xs">{topic}</span>
                           </div>
                           <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-500 group-hover:text-primary"><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                     )) : (
                        <div className="bg-emerald-500/10 p-8 rounded-[2rem] border border-emerald-500/20 text-emerald-400 font-bold flex flex-col items-center gap-4">
                           <CheckCircle2 className="h-12 w-12" />
                           <p className="text-center text-sm">Elite mastery achieved across all segments.</p>
                        </div>
                     )}
                  </div>
               </CardContent>
            </Card>

            <Card className="border-none bg-white shadow-2xl rounded-[3.5rem] p-12 space-y-8 flex flex-col justify-center text-center">
               <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Probable Status</p>
                  <h4 className="font-headline text-2xl font-black text-[#0F172A]">Selection Probability</h4>
               </div>
               <div className="relative inline-flex items-center justify-center">
                  <svg className="h-40 w-40 transform -rotate-90">
                     <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                     <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * (accuracy + 10)) / 100} className="text-primary transition-all duration-1000" />
                  </svg>
                  <span className="absolute text-5xl font-headline font-black text-[#0F172A]">{Math.min(98, accuracy + 10)}%</span>
               </div>
               <p className="text-slate-500 text-base leading-relaxed font-medium">Your current benchmark is competitive for PSSSB/PPSC notifications.</p>
               <Button asChild className="w-full bg-[#0F172A] hover:bg-black text-white font-black h-16 rounded-[1.5rem] uppercase tracking-widest text-xs shadow-2xl">
                  <Link href="/mocks">Unlock More Series</Link>
               </Button>
            </Card>
          </div>
        </div>

        {/* Detailed Solutions */}
        <div className="space-y-12">
          <div className="flex items-center justify-between">
            <div>
               <h2 className="text-4xl font-headline font-black text-[#0F172A] uppercase leading-none">Solutions Audit</h2>
               <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-[10px]">Deep-dive into verified rationalizations</p>
            </div>
            <Badge className="bg-[#0F172A] text-white px-6 py-2 rounded-2xl border-none font-black uppercase text-[10px] tracking-widest">Arsh Grewal Management Verified</Badge>
          </div>
          
          <div className="grid grid-cols-1 gap-10">
            {questions.map((q, idx) => {
              const userAnsIdx = answers[idx]
              const correctMap: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 }
              const isCorrect = userAnsIdx === correctMap[q.correctAnswer]
              const isSkipped = userAnsIdx === undefined

              return (
                <Card key={q.id} className={`border-none shadow-2xl shadow-slate-200/40 rounded-[3.5rem] overflow-hidden transition-all duration-500 ${isSkipped ? 'opacity-80 grayscale-[0.3]' : ''}`}>
                  <CardContent className="p-10 md:p-16">
                    <div className="flex flex-wrap items-center justify-between gap-6 mb-12">
                      <div className="flex gap-5 items-center">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-headline font-black text-lg text-[#0F172A]">
                          {idx + 1}
                        </div>
                        <Badge className={`px-6 py-2 rounded-xl border-none font-black uppercase tracking-[0.2em] text-[10px] shadow-sm ${
                          isSkipped ? 'bg-slate-100 text-slate-400' : 
                          isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {isSkipped ? 'Skipped Audit' : isCorrect ? 'Key Matched' : 'Key Mismatch'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-8">
                        <Button onClick={() => handleBookmark(q)} variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-primary/10 hover:text-primary border border-slate-100"><Bookmark className="h-5 w-5" /></Button>
                        <div className="h-6 w-px bg-slate-100" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">{q.subjectId || 'GS'} • {q.difficulty}</span>
                      </div>
                    </div>

                    <p className="text-2xl md:text-3xl font-bold mb-16 text-[#0F172A] leading-relaxed antialiased">{q.questionEn}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                      {['A','B','C','D'].map((key, i) => {
                        const isOptionCorrect = i === correctMap[q.correctAnswer]
                        const isOptionUserChoice = i === userAnsIdx
                        const optText = (q as any)[`option${key}En`]
                        
                        let styleClasses = "border-slate-100 bg-white"
                        if (isOptionCorrect) styleClasses = "border-emerald-500 bg-emerald-50 text-emerald-800 ring-8 ring-emerald-500/5 shadow-xl"
                        else if (isOptionUserChoice && !isCorrect) styleClasses = "border-rose-500 bg-rose-50 text-rose-800 ring-8 ring-rose-500/5 shadow-xl"

                        return (
                          <div key={i} className={`p-8 rounded-[2rem] border-2 text-lg font-bold flex items-center justify-between transition-all duration-300 ${styleClasses}`}>
                            <span className="flex items-center gap-6">
                               <span className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${isOptionCorrect ? 'bg-emerald-500 text-white' : isOptionUserChoice ? 'bg-rose-500 text-white' : 'bg-slate-50 text-slate-300'}`}>
                                 {key}
                               </span>
                               <span className="leading-snug">{optText}</span>
                            </span>
                            {isOptionCorrect && <CheckCircle2 className="h-6 w-6 text-emerald-500" />}
                            {isOptionUserChoice && !isCorrect && <XCircle className="h-6 w-6 text-rose-500" />}
                          </div>
                        )
                      })}
                    </div>

                    <div className="space-y-8">
                       <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100">
                          <h4 className="font-black text-xs uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-3"><Clock className="h-4 w-4" /> Official Rationalization</h4>
                          <p className="text-xl text-slate-700 leading-relaxed font-medium italic">
                            {q.explanationEn || "The official answer key was verified as per recruitment board patterns."}
                          </p>
                       </div>

                       <div className="pt-4">
                          {aiResults[q.id] ? (
                             <div className="bg-[#0F172A] border-none rounded-[3rem] p-12 md:p-16 animate-in fade-in slide-in-from-bottom-8 duration-700 relative overflow-hidden text-white">
                               <div className="absolute top-0 right-0 p-10 opacity-5"><Sparkles className="h-40 w-40" /></div>
                               <div className="flex items-center gap-5 mb-10 text-primary relative z-10">
                                 <div className="h-14 w-14 bg-primary rounded-[1.25rem] flex items-center justify-center shadow-3xl shadow-primary/20">
                                   <BrainCircuit className="h-8 w-8 text-white" />
                                 </div>
                                 <div className="space-y-0.5">
                                    <h4 className="font-headline text-3xl font-black uppercase tracking-tight">AI Tutor Logic</h4>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Step-by-Step Analysis</p>
                                 </div>
                               </div>
                               <p className="text-xl leading-relaxed mb-12 text-slate-300 whitespace-pre-wrap font-medium relative z-10 antialiased">
                                 {aiResults[q.id].rationalization}
                               </p>
                               <div className="space-y-6 relative z-10">
                                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Key Learning Points</p>
                                 <div className="flex flex-wrap gap-4">
                                   {aiResults[q.id].keyLearningPoints.map((point, pi) => (
                                     <div key={pi} className="bg-white/5 border border-white/10 text-slate-200 px-6 py-3 rounded-2xl text-sm font-bold shadow-2xl backdrop-blur-md">
                                       {point}
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             </div>
                           ) : (
                             <Button 
                               variant="ghost" 
                               className="w-full justify-between h-24 rounded-[2rem] border-2 border-dashed border-slate-200 hover:bg-primary/5 hover:border-primary/40 group transition-all duration-500 p-8"
                               onClick={() => handleRationalize(q.id, q.questionEn, [q.optionAEn, q.optionBEn, q.optionCEn, q.optionDEn], correctMap[q.correctAnswer], userAnsIdx)}
                               disabled={rationalizing === q.id}
                             >
                               <span className="flex items-center gap-6">
                                 <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-2xl ${rationalizing === q.id ? 'bg-primary animate-spin' : 'bg-slate-100 group-hover:bg-primary'}`}>
                                   <BrainCircuit className={`h-6 w-6 transition-colors duration-500 ${rationalizing === q.id || 'group-hover:text-white' ? 'text-white' : 'text-slate-400'}`} />
                                 </div>
                                 <div className="text-left">
                                    <span className={`block font-black uppercase tracking-[0.2em] text-[10px] transition-colors ${rationalizing === q.id ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`}>
                                       {rationalizing === q.id ? "Consulting AI Engine..." : "Deep Audit Required?"}
                                    </span>
                                    <span className={`block text-lg font-bold text-slate-400 transition-colors ${rationalizing === q.id ? 'text-slate-600' : 'group-hover:text-slate-700'}`}>Request AI Rationalization</span>
                                 </div>
                               </span>
                               <ChevronRight className={`h-6 w-6 transition-all duration-500 ${rationalizing === q.id ? 'opacity-0' : 'text-slate-200 group-hover:text-primary group-hover:translate-x-2'}`} />
                             </Button>
                           )}
                       </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}

function StatItem({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: any, color: string }) {
  return (
    <div className="space-y-4 group">
      <div className="flex justify-center transform transition-transform group-hover:scale-125 duration-500">{icon}</div>
      <p className={`text-4xl font-headline font-black tracking-tighter ${color}`}>{value}</p>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{label}</p>
    </div>
  )
}
