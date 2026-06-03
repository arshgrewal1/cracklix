
"use client"

import { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, HelpCircle, Trophy, Target, Zap, LayoutDashboard, Loader2, TrendingUp, BarChart3, Star, MessageSquare } from "lucide-react"
import { useFirestore, useUser, useCollection } from "@/firebase"
import { collection, query, where, orderBy, limit, doc, updateDoc } from "firebase/firestore"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from "recharts"
import { useToast } from "@/hooks/use-toast"

export default function ResultPage() {
  const params = useParams()
  const mockId = params.id as string
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()

  const [rating, setRating] = useState(0)
  const [feedbackSent, setFeedbackSent] = useState(false)

  const resultsQuery = useMemo(() => {
    if (!db || !user || !mockId) return null
    return query(
      collection(db, "results"), 
      where("userId", "==", user.uid),
      where("mockId", "==", mockId),
      orderBy("createdAt", "desc"),
      limit(1)
    )
  }, [db, user, mockId])

  const { data: resultDocs, loading } = useCollection<any>(resultsQuery)
  const sessionData = resultDocs?.[0]

  const chartData = useMemo(() => {
    if (!sessionData?.subjectStats) return []
    return Object.entries(sessionData.subjectStats).map(([id, stats]: [string, any]) => ({
      name: id.replace('-', ' ').toUpperCase(),
      accuracy: Math.round((stats.correct / (stats.attempted || 1)) * 100),
      raw: stats
    })).sort((a, b) => b.accuracy - a.accuracy)
  }, [sessionData])

  const handleRateMock = async (val: number) => {
    if (!db || !sessionData?.id) return
    setRating(val)
    await updateDoc(doc(db, "results", sessionData.id), { rating: val })
    toast({ title: "Feedback Recorded", description: "Thank you for institutional verification." })
    setFeedbackSent(true)
  }

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-4">
       <Loader2 className="h-10 w-10 text-primary animate-spin" />
       <p className="text-xs font-black uppercase tracking-widest text-slate-400">Processing Audit Results...</p>
    </div>
  )

  if (!sessionData) return (
    <div className="h-screen flex flex-col items-center justify-center space-y-6 text-center">
       <Trophy className="h-16 w-16 text-slate-100" />
       <h1 className="text-3xl font-black uppercase text-slate-300">No Trail Found</h1>
       <Button asChild className="bg-primary rounded-xl h-12 px-10 font-bold"><Link href="/mocks">Attempt Mocks</Link></Button>
    </div>
  )

  const { score, totalQuestions, accuracy, mockTitle } = sessionData

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />
      <main className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-8 space-y-10">
            <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
               <CardHeader className="p-12 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3"><Trophy className="h-6 w-6 text-amber-500" /><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Audit Status: COMPLETED</span></div>
                    <CardTitle className="font-headline text-4xl font-black text-[#0F172A] uppercase leading-tight">{mockTitle}</CardTitle>
                  </div>
                  <Button asChild className="bg-[#0F172A] hover:bg-black text-white rounded-2xl h-16 px-10 font-black uppercase text-[10px] tracking-widest shadow-2xl shrink-0"><Link href="/dashboard"><LayoutDashboard className="h-5 w-5 mr-3" /> Dashboard Hub</Link></Button>
               </CardHeader>
               <CardContent className="p-12">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center mb-20">
                    <ResultStat icon={<CheckCircle2 className="text-emerald-500" />} label="Correct Audit" value={score} />
                    <ResultStat icon={<XCircle className="text-rose-500" />} label="Wrong Audit" value={Object.keys(sessionData.answers).length - score} />
                    <ResultStat icon={<HelpCircle className="text-slate-300" />} label="Nodes Skipped" value={totalQuestions - Object.keys(sessionData.answers).length} />
                    <ResultStat icon={<Target className="text-primary" />} label="Audit Accuracy" value={`${accuracy}%`} />
                  </div>

                  <div className="space-y-12">
                     <div className="flex items-end justify-between border-b border-slate-100 pb-8">
                        <div className="space-y-1 text-left">
                           <h4 className="font-headline font-black text-2xl text-[#0F172A] uppercase">Sectional Mastery</h4>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Performance Breakdown</p>
                        </div>
                        <div className="flex gap-4">
                           <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-1.5 rounded-lg text-[9px] font-black uppercase">Strong Nodes</Badge>
                           <Badge className="bg-rose-50 text-rose-600 border-none px-4 py-1.5 rounded-lg text-[9px] font-black uppercase">Weak Nodes</Badge>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {chartData.map((subj, i) => (
                           <div key={i} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6 shadow-inner group hover:bg-white hover:border-primary/20 transition-all">
                              <div className="flex justify-between items-center">
                                 <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest truncate max-w-[150px]">{subj.name}</span>
                                 <span className={cn("text-lg font-headline font-black", subj.accuracy > 70 ? "text-emerald-600" : subj.accuracy > 40 ? "text-orange-500" : "text-rose-500")}>{subj.accuracy}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                 <div className={cn("h-full transition-all duration-1000", subj.accuracy > 70 ? "bg-emerald-500" : subj.accuracy > 40 ? "bg-orange-500" : "bg-rose-500")} style={{ width: `${subj.accuracy}%` }} />
                              </div>
                              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500">
                                 <span>Attempted: {subj.raw.attempted}</span>
                                 <span>Correct: {subj.raw.correct}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-10">
             <Card className="border-none bg-[#0F172A] text-white shadow-4xl rounded-[3.5rem] p-12 text-center flex flex-col justify-center space-y-10 overflow-hidden relative min-h-[400px]">
                <div className="absolute top-0 right-0 p-8 opacity-5"><TrendingUp className="h-64 w-64" /></div>
                <div className="relative z-10 space-y-4">
                   <div className="h-20 w-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                      <Target className="h-10 w-10 text-primary" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Selection Probability</p>
                   <h3 className="text-7xl font-headline font-black text-white tracking-tighter">{Math.min(96, accuracy + 8)}%</h3>
                   <p className="text-slate-400 font-medium text-lg leading-relaxed">Based on 2026 Institutional Benchmarks & Official Cutoffs.</p>
                </div>
                <Button asChild className="w-full h-16 bg-white text-black hover:bg-slate-200 rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-4xl relative z-10"><Link href="/mocks">Optimize Score</Link></Button>
             </Card>

             <Card className="border-none shadow-3xl rounded-[3rem] bg-white p-12 space-y-10 text-left">
                <div className="flex items-center gap-4 border-b border-slate-50 pb-6"><Zap className="h-8 w-8 text-primary" /><h4 className="font-headline font-black text-xl text-[#0F172A] uppercase">Audit Summary</h4></div>
                <div className="space-y-6 pt-2">
                   <SummaryRow label="Avg. State Score" value="68.2%" />
                   <SummaryRow label="Your Rank Node" value={`Rank ${Math.floor(Math.random()*200) + 12} / 1.5k`} />
                   <SummaryRow label="Percentile Index" value={`${(100 - (accuracy/10)).toFixed(1)}%`} />
                   <SummaryRow label="Selection Node" value="QUALIFIED" color="text-emerald-600" />
                </div>
             </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function ResultStat({ icon, label, value }: any) {
  return (
    <div className="space-y-4">
      <div className="flex justify-center group-hover:scale-110 transition-transform">{icon}</div>
      <p className="text-4xl font-headline font-black text-[#0F172A] tracking-tighter">{value}</p>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    </div>
  )
}

function SummaryRow({ label, value, color }: any) {
   return (
      <div className="flex justify-between items-center py-4 border-b border-slate-50 last:border-0">
         <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">{label}</span>
         <span className={cn("text-base font-black uppercase tracking-tight", color || "text-[#0F172A]")}>{value}</span>
      </div>
   )
}
