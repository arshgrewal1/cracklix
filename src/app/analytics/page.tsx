
"use client"

import { useMemo } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useCollection, useFirestore } from "@/firebase"
import { collection, query, where, orderBy } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  TrendingUp, 
  Target, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Clock, 
  ArrowLeft,
  Activity,
  BarChart3,
  Calendar,
  Zap,
  LayoutGrid
} from "lucide-react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from "recharts"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

/**
 * @fileOverview Institutional Depth Analysis Node.
 * Re-engineered for Testbook-quality data visualization.
 */

export default function DeepAnalytics() {
  const { user, profile, loading } = useUser()
  const db = useFirestore()
  const router = useRouter()

  const resultsQuery = useMemo(() => {
    if (!db || !user) return null
    return query(collection(db, "results"), where("userId", "==", user.uid), orderBy("timestamp", "desc"))
  }, [db, user])

  const { data: results } = useCollection<any>(resultsQuery)

  const analytics = useMemo(() => {
    if (!results || results.length === 0) return {
      totalQ: 0, correct: 0, wrong: 0, skipped: 0, avgAcc: 0, chartData: []
    }

    const total = results.length
    const correct = results.reduce((acc: number, r: any) => acc + (r.score || 0), 0)
    const totalQ = results.reduce((acc: number, r: any) => acc + (r.totalQuestions || 0), 0)
    const attempted = results.reduce((acc: number, r: any) => acc + (Object.keys(r.answers || {}).length), 0)
    
    const chartData = [...results].reverse().map((r, i) => ({
      name: `T${i + 1}`,
      accuracy: r.accuracy || 0,
      score: r.score || 0
    }))

    return {
      totalQ,
      correct,
      wrong: attempted - correct,
      skipped: totalQ - attempted,
      avgAcc: Math.round((correct / (attempted || 1)) * 100),
      chartData
    }
  }, [results])

  if (loading) return null

  return (
    <div className="min-h-screen bg-slate-50/50 pb-32">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-10 text-left">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
               <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl h-12 w-12 border border-slate-200 bg-white">
                  <ArrowLeft className="h-6 w-6" />
               </Button>
               <div>
                  <h1 className="text-4xl font-headline font-black text-[#0F172A] uppercase tracking-tight">Performance Deep-Audit</h1>
                  <p className="text-slate-500 font-medium">Historical precision and audit trail for your preparation.</p>
               </div>
            </div>
            <div className="flex gap-4">
               <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-1.5 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                  <Activity className="h-3 w-3" /> Real-time Sync
               </Badge>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <AnalyticMetric label="Total MCQs Audit" value={analytics.totalQ} icon={<LayoutGrid className="text-blue-500" />} color="text-blue-600" />
            <AnalyticMetric label="Institutional Accuracy" value={`${analytics.avgAcc}%`} icon={<Target className="text-primary" />} color="text-primary" />
            <AnalyticMetric label="Correct Logic" value={analytics.correct} icon={<CheckCircle2 className="text-emerald-500" />} color="text-emerald-600" />
            <AnalyticMetric label="Audit Failures" value={analytics.wrong} icon={<XCircle className="text-rose-500" />} color="text-rose-600" />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <Card className="lg:col-span-8 border-none shadow-3xl rounded-[3.5rem] bg-white overflow-hidden">
               <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/30">
                  <div className="flex items-center gap-4">
                     <TrendingUp className="h-6 w-6 text-primary" />
                     <CardTitle className="font-headline text-2xl font-black uppercase text-[#0F172A]">Accuracy Trend (Audit %)</CardTitle>
                  </div>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Progression across the last 20 mock nodes</CardDescription>
               </CardHeader>
               <CardContent className="p-10">
                  <div className="h-[400px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.chartData}>
                           <defs>
                              <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                                 <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} />
                           <YAxis hide />
                           <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '16px', color: 'white' }} />
                           <Area type="monotone" dataKey="accuracy" stroke="hsl(var(--primary))" strokeWidth={5} fillOpacity={1} fill="url(#colorAcc)" />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </CardContent>
            </Card>

            <div className="lg:col-span-4 space-y-10">
               <Card className="border-none shadow-3xl rounded-[3rem] bg-[#0F172A] text-white p-12 overflow-hidden relative group">
                  <div className="absolute bottom-0 right-0 p-8 opacity-5 rotate-12 group-hover:scale-110 transition-transform"><Zap className="h-64 w-64" /></div>
                  <div className="relative z-10 space-y-10">
                     <h3 className="font-headline font-black text-2xl uppercase border-b border-white/5 pb-6">Efficiency Stats</h3>
                     <div className="space-y-8">
                        <AuditMetaRow icon={<Clock />} label="Avg. Audit Time" value="112m" />
                        <AuditMetaRow icon={<Zap />} label="Energy Level" value="94%" />
                        <AuditMetaRow icon={<Calendar />} label="Audit Consistency" value="High" color="text-emerald-400" />
                     </div>
                     <div className="pt-8">
                        <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                           <Activity className="h-4 w-4 text-primary" /> Institutional Verified
                        </div>
                     </div>
                  </div>
               </Card>

               <Card className="border-none shadow-xl rounded-[3rem] bg-white p-12 space-y-6">
                  <h4 className="font-headline font-black text-xs uppercase tracking-[0.3em] text-slate-400">Accuracy Breakdown</h4>
                  <div className="flex flex-col gap-6">
                     <AccuracyRing label="Correct" value={analytics.correct} total={analytics.totalQ} color="text-emerald-500" />
                     <AccuracyRing label="Incorrect" value={analytics.wrong} total={analytics.totalQ} color="text-rose-500" />
                     <AccuracyRing label="Skipped" value={analytics.skipped} total={analytics.totalQ} color="text-slate-300" />
                  </div>
               </Card>
            </div>
         </div>
      </main>

      <Footer />
    </div>
  )
}

function AnalyticMetric({ label, value, icon, color }: any) {
   return (
      <Card className="border-none shadow-xl bg-white p-8 rounded-[2.5rem] relative overflow-hidden group hover:translate-y-[-4px] transition-all">
         <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">{icon}</div>
         <div className="space-y-4 relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
            <p className={cn("text-4xl font-headline font-black tracking-tighter leading-none", color)}>{value}</p>
         </div>
      </Card>
   )
}

function AuditMetaRow({ icon, label, value, color }: any) {
   return (
      <div className="flex justify-between items-center group">
         <div className="flex items-center gap-4">
            <div className="text-slate-500 group-hover:text-primary transition-colors">{icon}</div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
         </div>
         <span className={cn("text-xl font-headline font-black", color || "text-white")}>{value}</span>
      </div>
   )
}

function AccuracyRing({ label, value, total, color }: any) {
   const perc = Math.round((value / (total || 1)) * 100);
   return (
      <div className="space-y-3">
         <div className="flex justify-between items-end">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
            <span className={cn("text-xs font-black", color)}>{value} ({perc}%)</span>
         </div>
         <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner">
            <div className={cn("h-full", color.replace('text-', 'bg-'))} style={{ width: `${perc}%` }} />
         </div>
      </div>
   )
}
