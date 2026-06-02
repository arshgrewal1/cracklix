
"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, BrainCircuit, ChevronRight, HelpCircle, Trophy, Target, Zap, Share2, Sparkles, BarChart3 } from "lucide-react"
import { rationalizeMockQuestion, RationalizeMockQuestionOutput } from "@/ai/flows/rationalize-mock-question"
import { useDoc, useFirestore } from "@/firebase"
import { doc, getDocs, query, collection, where } from "firebase/firestore"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts"

export default function ResultPage() {
  const params = useParams()
  const mockId = params.id as string
  const db = useFirestore()

  const [rationalizing, setRationalizing] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, RationalizeMockQuestionOutput>>({})
  const [sessionData, setSessionData] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])

  useEffect(() => {
    const saved = localStorage.getItem(`last_result_${mockId}`)
    if (saved) {
      const data = JSON.parse(saved)
      setSessionData(data)
      
      if (db && data.mockId) {
        const fetchQs = async () => {
          const mockSnap = await getDocs(query(collection(db, "mocks"), where("id", "==", data.mockId)))
          const mockData = mockSnap.docs[0]?.data()
          if (mockData?.questionIds) {
             const qRefs = mockData.questionIds.map((id: string) => doc(db, "questions", id))
             const qSnaps = await Promise.all(qRefs.map((ref: any) => getDocs(query(collection(db, "questions"), where("id", "==", ref.id)))))
             setQuestions(qSnaps.map(snap => snap.docs[0]?.data()).filter(Boolean))
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
      setResults(prev => ({ ...prev, [qId]: result }))
    } catch (error) {
      console.error("Rationalization failed", error)
    } finally {
      setRationalizing(null)
    }
  }

  const chartData = useMemo(() => {
    if (!questions.length || !sessionData) return []
    const topicStats: Record<string, { correct: number; total: number }> = {}
    questions.forEach((q, idx) => {
      const topic = q.topic || "General"
      if (!topicStats[topic]) topicStats[topic] = { correct: 0, total: 0 }
      topicStats[topic].total++
      if (sessionData.answers[idx] === q.correctAnswer) topicStats[topic].correct++
    })
    return Object.entries(topicStats).map(([name, stats]) => ({
      name,
      accuracy: Math.round((stats.correct / stats.total) * 100)
    }))
  }, [questions, sessionData])

  if (!sessionData) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 text-center">
          <div className="h-20 w-20 bg-slate-200 rounded-3xl flex items-center justify-center animate-pulse">
            <Trophy className="h-10 w-10 text-slate-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-headline font-black text-[#0F172A]">Result Processing</h1>
            <p className="text-slate-500 max-w-md">Retrieving your high-fidelity performance metrics...</p>
          </div>
        </main>
      </div>
    )
  }

  const { correctCount, incorrectCount, totalQuestions, answers, accuracy, weakTopics, mockTitle } = sessionData
  const score = sessionData.score || 0
  const skippedCount = totalQuestions - (Object.keys(answers).length)
  const scorePercent = Math.round((score / totalQuestions) * 100)

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />
      <main className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <Card className="lg:col-span-2 border-none bg-white shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="font-headline text-3xl font-black text-[#0F172A] flex items-center gap-3">
                  <div className="h-10 w-10 bg-orange-50 rounded-xl flex items-center justify-center">
                    <Trophy className="text-[#F97316] h-6 w-6" />
                  </div>
                  Performance Summary
                </CardTitle>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{mockTitle}</p>
              </div>
              <Button variant="outline" size="icon" className="rounded-xl border-slate-100">
                <Share2 className="h-4 w-4 text-slate-400" />
              </Button>
            </CardHeader>
            <CardContent className="p-10">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center mb-16">
                <Stat icon={<CheckCircle2 className="text-emerald-500" />} label="Correct" value={correctCount} />
                <Stat icon={<XCircle className="text-rose-500" />} label="Incorrect" value={incorrectCount} />
                <Stat icon={<HelpCircle className="text-slate-400" />} label="Skipped" value={skippedCount} />
                <Stat icon={<Target className="text-blue-600" />} label="Accuracy" value={`${accuracy}%`} />
              </div>
              
              <div className="space-y-8 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                 <div className="flex justify-between items-end mb-4">
                    <div className="flex items-center gap-2">
                       <BarChart3 className="h-4 w-4 text-primary" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sectional Mastery</span>
                    </div>
                 </div>
                 <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="name" hide />
                          <YAxis hide domain={[0, 100]} />
                          <Bar dataKey="accuracy" radius={[8, 8, 0, 0]} barSize={40}>
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

          <div className="space-y-6">
            <Card className="border-none bg-[#0B1528] text-white shadow-2xl shadow-slate-900/10 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8">
                <CardTitle className="font-headline text-xl font-black flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <Zap className="h-5 w-5 text-blue-400" />
                  </div>
                  Weak Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-6">
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  Prioritize these areas in your next study session for {mockTitle}.
                </p>
                <div className="space-y-3">
                  {weakTopics.length > 0 ? (
                    weakTopics.map((topic: string) => (
                      <div key={topic} className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                        <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                        <span className="text-sm font-bold text-slate-200">{topic}</span>
                      </div>
                    ))
                  ) : (
                    <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 text-emerald-400 text-sm font-bold flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4" /> Mastery achieved.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-white shadow-xl shadow-slate-200/50 rounded-[2.5rem] p-8">
              <div className="flex flex-col gap-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Next Step</p>
                <h4 className="font-headline text-xl font-black text-[#0F172A]">Selection Probability</h4>
                <div className="flex items-end gap-2">
                   <span className="text-4xl font-black text-primary">84%</span>
                   <span className="text-xs font-bold text-emerald-500 mb-1">+4% Up</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">Your performance is in the top 5% of aspirants this month.</p>
                <Button asChild className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold h-14 rounded-2xl mt-4">
                  <Link href="/mocks">Start Next Mock</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-12">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-headline font-black text-[#0F172A]">Answer Key & Explanations</h2>
            <Badge className="bg-slate-900 text-white px-4 py-1.5 rounded-xl border-none font-bold">Deep Audit Mode</Badge>
          </div>
          
          <div className="grid grid-cols-1 gap-8">
            {questions.map((q, idx) => {
              const userAnsIdx = answers[idx]
              const isCorrect = userAnsIdx === q.correctAnswer
              const isSkipped = userAnsIdx === undefined

              return (
                <Card key={q.id} className={`border-none shadow-xl shadow-slate-200/30 rounded-[2.5rem] overflow-hidden transition-all duration-300 ${isSkipped ? 'opacity-80' : ''}`}>
                  <CardContent className="p-8 md:p-12">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                      <div className="flex gap-4 items-center">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-headline font-black text-sm text-[#0F172A]">
                          {idx + 1}
                        </div>
                        <Badge className={`px-4 py-1.5 rounded-xl border-none font-black uppercase tracking-widest text-[10px] ${
                          isSkipped ? 'bg-slate-100 text-slate-400' : 
                          isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {isSkipped ? 'Skipped' : isCorrect ? 'Correct' : 'Incorrect'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">{q.topic}</span>
                        <div className="h-4 w-px bg-slate-100" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">{q.difficulty}</span>
                      </div>
                    </div>

                    <p className="text-xl md:text-2xl font-bold mb-12 text-[#0F172A] leading-relaxed">{q.text}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                      {q.options?.map((opt: string, i: number) => {
                        const isOptionCorrect = i === q.correctAnswer
                        const isOptionUserChoice = i === userAnsIdx
                        
                        let styleClasses = "border-slate-100 bg-white"
                        if (isOptionCorrect) styleClasses = "border-emerald-500 bg-emerald-50 text-emerald-700 ring-4 ring-emerald-500/5"
                        else if (isOptionUserChoice && !isCorrect) styleClasses = "border-rose-500 bg-rose-50 text-rose-700 ring-4 ring-rose-500/5"

                        return (
                          <div key={i} className={`p-5 rounded-2xl border-2 text-base font-bold flex items-center justify-between transition-all ${styleClasses}`}>
                            <span className="flex items-center gap-4">
                               <span className={`font-headline font-black text-xs transition-colors ${isOptionCorrect ? 'text-emerald-500' : isOptionUserChoice ? 'text-rose-500' : 'text-slate-300'}`}>
                                 {String.fromCharCode(65 + i)}
                               </span>
                               {opt}
                            </span>
                            {isOptionCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                            {isOptionUserChoice && !isCorrect && <XCircle className="h-5 w-5 text-rose-500" />}
                          </div>
                        )
                      })}
                    </div>

                    <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
                        <h4 className="font-bold text-sm uppercase tracking-widest text-slate-400 mb-4">Official Explanation</h4>
                        <p className="text-lg text-slate-700 leading-relaxed font-medium">
                          {q.explanation}
                        </p>
                    </div>

                    <div className="mt-8">
                       {results[q.id] ? (
                          <div className="bg-orange-50/50 border-2 border-orange-100 rounded-[2rem] p-8 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-3 mb-8 text-[#F97316]">
                              <div className="h-10 w-10 bg-[#F97316] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <BrainCircuit className="h-5 w-5 text-white" />
                              </div>
                              <h4 className="font-headline text-2xl font-black">AI Tutor Logic</h4>
                            </div>
                            <p className="text-lg leading-relaxed mb-8 text-slate-700 whitespace-pre-wrap font-medium">
                              {results[q.id].rationalization}
                            </p>
                            <div className="space-y-4">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F97316]/60">Mastery Points</p>
                              <div className="flex flex-wrap gap-3">
                                {results[q.id].keyLearningPoints.map((point, pi) => (
                                  <div key={pi} className="bg-white border border-orange-100 text-slate-700 px-5 py-2 rounded-xl text-sm font-bold shadow-sm">
                                    {point}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Button 
                            variant="ghost" 
                            className="w-full justify-between h-20 rounded-2xl border-2 border-dashed border-slate-200 hover:bg-orange-50 hover:border-orange-200 group transition-all duration-300"
                            onClick={() => handleRationalize(q.id, q.text, q.options, q.correctAnswer, userAnsIdx)}
                            disabled={rationalizing === q.id}
                          >
                            <span className="flex items-center gap-5 px-4">
                              <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${rationalizing === q.id ? 'bg-orange-500 animate-spin' : 'bg-slate-100 group-hover:bg-orange-500'}`}>
                                <BrainCircuit className={`h-5 w-5 transition-colors ${rationalizing === q.id || 'group-hover:text-white' ? 'text-white' : 'text-slate-400'}`} />
                              </div>
                              <span className={`font-black uppercase tracking-widest text-xs transition-colors ${rationalizing === q.id ? 'text-[#F97316]' : 'text-slate-400 group-hover:text-[#F97316]'}`}>
                                {rationalizing === q.id ? "Consulting AI Tutor..." : "Get Step-by-Step AI Logic"}
                              </span>
                            </span>
                            <ChevronRight className={`h-5 w-5 mr-4 transition-all ${rationalizing === q.id ? 'opacity-0' : 'text-slate-300 group-hover:text-[#F97316] group-hover:translate-x-1'}`} />
                          </Button>
                        )}
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

function Stat({ icon, label, value }: { icon: React.ReactNode, label: string, value: any }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-center transform transition-transform hover:scale-110 duration-300">{icon}</div>
      <p className="text-3xl font-headline font-black text-[#0F172A] tracking-tighter">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
    </div>
  )
}
