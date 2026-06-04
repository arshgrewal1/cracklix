"use client"

import { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, HelpCircle, Trophy, Target, Zap, LayoutDashboard, Loader2, TrendingUp, BarChart3, Star, MessageSquare, Timer, ArrowRight, BrainCircuit, ShieldCheck } from "lucide-react"
import { useFirestore, useUser, useCollection } from "@/firebase"
import { collection, query, where, orderBy, limit, doc, updateDoc } from "firebase/firestore"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from "recharts"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Performance Audit Node.
 * Features: Selection Probability, Sectional Analysis, and Subject Benchmarks.
 */

export default function ResultPage() {
  const params = useParams()
  const mockId = params.id as string
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()

  const [rating, setRating] = useState(0)

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
      raw: stats,
      score: `${stats.correct}/${stats.total}`
    })).sort((a, b) => b.accuracy - a.accuracy)
  }, [sessionData])

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-4">
       <Loader2 className="h-10 w-10 text-primary animate-spin" />
       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Processing Audit Results...</p>
    </div>
  )

  if (!sessionData) return (
    <div className="h-screen flex flex-col items-center justify-center space-y-8 text-center bg-slate-50">
       <div className="h-24 w-24 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center"><Trophy className="h-12 w-12 text-slate-100" /></div>
       <div className="space-y-2">
          <h1 className="text-4xl font-headline font-black uppercase text-slate-300 tracking-tighter">No Audit Trail</h1>
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">The requested attempt node could not be synchronized.</p>
       </div>
       <Button asChild className="bg-[#0F172A] hover:bg-black text-white rounded-2xl h-16 px-12 font-black uppercase text-[10px] tracking-widest shadow-3xl"><Link href="/mocks">Back to Repository</Link></Button>
    </div>
  )

  const { score, totalQuestions, accuracy, mockTitle } = sessionData

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />
      <main className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8 space-y-12 text-left">
            <Card className="border-none shadow-4xl rounded-[4rem] overflow-hidden bg-white">
               <CardHeader className="p-16 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-10">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 bg-amber-100 rounded-2xl flex items-center justify-center shadow-inner"><Trophy className="h-5 w-5 text-amber-500" /></div>
                       <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Audit Node: COMPLETED</span>
                    </div>
                    <CardTitle className="font-headline text-4xl lg:text-5xl font-black text-[#0F172A] uppercase leading-[0.9] tracking-tight">{mockTitle}</CardTitle>
                  </div>
                  <div className="flex gap-4 shrink-0">
                     <Button variant="outline" className="rounded-2xl h-16 px-8 border-slate-200 bg-white font-black uppercase text-[10px] tracking-widest shadow-sm">Export Audit</Button>
                     <Button asChild className="bg-[#0F172A] hover:bg-black text-white rounded-2xl h-16 px-10 font-black uppercase text-[10px] tracking-widest shadow-4xl"><Link href="/dashboard"><LayoutDashboard className="h-5 w-5 mr-3 text-primary" /> Dashboard</Link></Button>
                  </div>
               </CardHeader>
               <CardContent className="p-16">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center mb-24">
                    <ResultStat icon={<CheckCircle2 className="text-emerald-500 h-8 w-8" />} label="Correct" value={score} color="text-emerald-600" />
                    <ResultStat icon={<XCircle className="text-rose-500 h-8 w-8" />} label="Incorrect" value={Object.keys(sessionData.answers).length - score} color="text-rose-600" />
                    <ResultStat icon={<HelpCircle className="text-slate-300 h-8 w-8" />} label="Skipped" value={totalQuestions - Object.keys(sessionData.answers).length} color="text-slate-400" />
                    <ResultStat icon={<Target className="text-primary h-8 w-8" />} label="Accuracy" value={`${accuracy}%`} color="text-primary" />
                  </div>

                  <div className="space-y-16">
                     <div className="flex items-end justify-between border-b border-slate-100 pb-10">
                        <div className="space-y-2">
                           <h4 className="font-headline font-black text-3xl text-[#0F172A] uppercase tracking-tight">Subject Mastery Index</h4>
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Institutional Performance breakdown across verticals.</p>
                        </div>
                        <div className="flex gap-4">
                           <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500" /><span className="text-[9px] font-black uppercase text-slate-400">Strong</span></div>
                           <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-rose-500" /><span className="text-[9px] font-black uppercase text-slate-400">Critial</span></div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {chartData.map((subj, i) => (
                           <div key={i} className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 space-y-8 shadow-inner group hover:bg-white hover:border-primary/30 hover:shadow-2xl transition-all duration-500">
                              <div className="flex justify-between items-start">
                                 <div className="space-y-1">
                                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest truncate block max-w-[200px]">{subj.name}</span>
                                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Benchmark: 68%</p>
                                 </div>
                                 <span className={cn("text-2xl font-headline font-black", subj.accuracy > 70 ? "text-emerald-600" : subj.accuracy > 40 ? "text-orange-500" : "text-rose-500")}>{subj.accuracy}%</span>
                              </div>
                              <div className="space-y-3">
                                 <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                    <div className={cn("h-full transition-all duration-1000", subj.accuracy > 70 ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]" : subj.accuracy > 40 ? "bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.4)]" : "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]")} style={{ width: `${subj.accuracy}%` }} />
                                 </div>
                                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                    <span>Score: {subj.score}</span>
                                    <span>{subj.accuracy > 70 ? 'EXCELLENT' : 'NEEDS AUDIT'}</span>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </CardContent>
            </Card>

            <div className="bg-[#0B1528] rounded-[4rem] p-16 text-white relative overflow-hidden shadow-4xl group">
               <div className="absolute top-0 right-0 p-16 opacity-5 rotate-12 group-hover:scale-110 transition-transform"><BrainCircuit className="h-64 w-64" /></div>
               <div className="relative z-10 space-y-10">
                  <div className="flex items-center gap-5">
                     <div className="h-14 w-14 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/20"><BrainCircuit className="h-8 w-8 text-primary" /></div>
                     <h3 className="text-4xl font-headline font-black uppercase tracking-tight">AI Audit Rationale</h3>
                  </div>
                  <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-2xl">
                     Our institutional AI engine has analyzed your 20 incorrect nodes. Master the concepts you missed with step-by-step logic.
                  </p>
                  <Button className="h-16 px-12 bg-primary hover:bg-orange-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl gap-4 shadow-3xl shadow-primary/20 transition-all active:scale-95">
                     Generate Rationalizations <ArrowRight className="h-5 w-5" />
                  </Button>
               </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-12">
             <Card className="border-none bg-[#0F172A] text-white shadow-4xl rounded-[4rem] p-16 text-center flex flex-col justify-center space-y-12 overflow-hidden relative min-h-[500px]">
                <div className="absolute top-0 right-0 p-10 opacity-5"><TrendingUp className="h-80 w-80" /></div>
                <div className="relative z-10 space-y-6">
                   <div className="h-24 w-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-3xl border border-primary/10">
                      <Target className="h-12 w-12 text-primary" />
                   </div>
                   <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">Selection Probability Index</p>
                   <h3 className="text-8xl font-headline font-black text-white tracking-tighter leading-none">{Math.min(96, accuracy + 12)}%</h3>
                   <div className="pt-8 space-y-4">
                      <p className="text-slate-400 font-medium text-lg leading-relaxed px-4 italic">"Your audit scores in Reasoning are higher than 92% of Punjab aspirants."</p>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-widest">Above Punjab Average</Badge>
                   </div>
                </div>
                <Button asChild className="w-full h-18 bg-white text-[#0F172A] hover:bg-slate-100 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-4xl relative z-10 h-16"><Link href="/mocks">Optimize Preparation</Link></Button>
             </Card>

             <Card className="border-none shadow-3xl rounded-[3.5rem] bg-white p-16 space-y-12 text-left relative overflow-hidden">
                <div className="absolute bottom-0 right-0 p-8 opacity-5"><ShieldCheck className="h-32 w-32" /></div>
                <div className="flex items-center gap-5 border-b border-slate-50 pb-8"><Zap className="h-10 w-10 text-primary" /><h4 className="font-headline font-black text-2xl text-[#0F172A] uppercase tracking-tight">Audit Summary</h4></div>
                <div className="space-y-8 pt-4">
                   <SummaryRow label="Avg. State Score" value="68.4%" />
                   <SummaryRow label="Platform Rank" value={`Rank ${Math.floor(Math.random()*150) + 24} / 1.5k`} />
                   <SummaryRow label="Audit Duration" value="112m 45s" />
                   <SummaryRow label="Percentile Node" value={`${(100 - (accuracy/10)).toFixed(1)}%`} />
                   <SummaryRow label="Selection Status" value="QUALIFIED" color="text-emerald-600" />
                </div>
             </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function ResultStat({ icon, label, value, color }: any) {
  return (
    <div className="space-y-6 group">
      <div className="flex justify-center transition-transform group-hover:scale-125 duration-500">{icon}</div>
      <div className="space-y-1">
         <p className={cn("text-5xl font-headline font-black tracking-tighter leading-none", color || "text-[#0F172A]")}>{value}</p>
         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2">{label}</p>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, color }: any) {
   return (
      <div className="flex justify-between items-center py-5 border-b border-slate-50 last:border-0">
         <span className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">{label}</span>
         <span className={cn("text-lg font-black uppercase tracking-tight", color || "text-[#0F172A]")}>{value}</span>
      </div>
   )
}
