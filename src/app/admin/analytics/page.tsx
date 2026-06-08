
"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Zap, BarChart3, ShieldCheck, Target, CreditCard, Activity, Database, Lock, Layers, Unlock } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, limit } from "firebase/firestore"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

const chartData = [
  { day: "Mon", users: 420 }, { day: "Tue", users: 580 }, { day: "Wed", users: 890 }, { day: "Thu", users: 760 },
  { day: "Fri", users: 1200 }, { day: "Sat", users: 950 }, { day: "Sun", users: 1400 },
]

/**
 * @fileOverview Final Administrative Control Center v3.2.
 * UPDATED: Added Access Level distribution report.
 */

export default function AdminAnalytics() {
  const db = useFirestore()
  
  // STABILIZED LISTENERS
  const usersQuery = useMemo(() => (db ? query(collection(db, "users"), limit(200)) : null), [db]);
  const resultsQuery = useMemo(() => (db ? query(collection(db, "results"), limit(200)) : null), [db]);
  const questionsQuery = useMemo(() => (db ? query(collection(db, "questions"), limit(200)) : null), [db]);
  const mocksQuery = useMemo(() => (db ? collection(db, "mocks") : null), [db]);

  const { data: users } = useCollection<any>(usersQuery)
  const { data: results } = useCollection<any>(resultsQuery)
  const { data: questions } = useCollection<any>(questionsQuery)
  const { data: mocks } = useCollection<any>(mocksQuery)

  const stats = useMemo(() => {
     if (!questions) return { used: 0, unused: 0, locked: 0, repeated: 0, total: 0 };
     return {
        used: questions.filter(q => q.status === 'USED').length,
        unused: questions.filter(q => q.status === 'UNUSED' || !q.status).length,
        locked: questions.filter(q => q.status === 'LOCKED').length,
        repeated: questions.filter(q => (q.usedCount || 0) > 1).length,
        total: questions.length
     }
  }, [questions]);

  const mockStats = useMemo(() => {
    if (!mocks) return { free: 0, premium: 0 };
    return {
      free: mocks.filter(m => (m.accessType || 'FREE') === 'FREE').length,
      premium: mocks.filter(m => m.accessType === 'PREMIUM').length
    };
  }, [mocks]);

  const proUsers = useMemo(() => users?.filter((u: any) => u.status && u.status !== 'Free') || [], [users]);

  const avgAccuracy = useMemo(() => {
    if (!results || results.length === 0) return 0
    return Math.round(results.reduce((acc, r: any) => acc + (r.accuracy || 0), 0) / results.length)
  }, [results])

  return (
    <div className="space-y-12 pb-20 text-left">
      <div className="flex justify-between items-center">
        <div>
           <div className="flex items-center gap-3 mb-2"><BarChart3 className="h-5 w-5 text-primary" /><span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Institutional Governance Monitor</span></div>
          <h1 className="text-5xl font-black font-headline text-primary uppercase tracking-tight">Ecosystem Insights</h1>
          <p className="text-[#0F172A] mt-2 text-lg font-medium">Tracking student growth and registry lifecycle metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <MetricCard label="Total Free Mocks" value={mockStats.free} trend="Public" icon={<Unlock className="text-emerald-500" />} />
         <MetricCard label="Total Premium Mocks" value={mockStats.premium} trend="Locked" icon={<Lock className="text-amber-500" />} />
         <MetricCard label="Active Aspirants" value={users?.length || "0"} trend="+24%" icon={<Users className="text-blue-400" />} />
         <MetricCard label="Pro Pass Holders" value={proUsers.length} trend="+12%" icon={<CreditCard className="text-emerald-400" />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <MetricChip label="Used MCQs" value={stats.used} icon={<Zap className="text-primary" />} />
         <MetricChip label="Audit Attempts" value={results?.length || "0"} icon={<Activity className="text-blue-500" />} />
         <MetricChip label="Avg Accuracy" value={`${avgAccuracy}%`} icon={<Target className="text-rose-400" />} />
         <MetricChip label="Banned Assets" value={stats.locked} icon={<Lock className="text-slate-400" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <Card className="lg:col-span-8 border-none shadow-3xl rounded-[3.5rem] bg-white overflow-hidden border border-slate-50">
            <CardHeader className="p-12 border-b border-slate-50 bg-slate-50/30">
               <CardTitle className="font-headline font-black text-3xl text-[#0F172A] uppercase">Engagement Flow</CardTitle>
               <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">Daily active sessions across the hub.</CardDescription>
            </CardHeader>
            <CardContent className="p-12">
               <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={chartData}>
                        <defs>
                           <linearGradient id="colorUsers" x1="0" x2="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 700}} />
                        <YAxis hide />
                        <Tooltip content={({active, payload}) => {
                           if (active && payload && payload.length) {
                              return <div className="bg-[#0F172A] text-white p-6 rounded-[1.5rem] shadow-4xl text-sm font-bold uppercase tracking-tight"><span className="text-primary mr-3">{payload[0].value}</span> Sessions</div>
                           }
                           return null
                        }} />
                        <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={5} fillOpacity={1} fill="url(#colorUsers)" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </CardContent>
         </Card>

         <Card className="lg:col-span-4 border-none shadow-3xl rounded-[3.5rem] bg-[#0F172A] text-white p-12 space-y-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><ShieldCheck className="h-64 w-64" /></div>
            <div className="space-y-2 relative z-10 text-left"><p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Content Lifecycle</p><h3 className="font-headline font-black text-3xl uppercase leading-none">Usage Audit</h3></div>
            <div className="space-y-8 relative z-10">
               <UsageProgress label="Verified Unique Assets" value={Math.round((stats.unused / (stats.total || 1)) * 100)} />
               <UsageProgress label="Market Active (Used)" value={Math.round((stats.used / (stats.total || 1)) * 100)} />
               <UsageProgress label="Banned Assets" value={Math.round((stats.locked / (stats.total || 1)) * 100)} />
            </div>
            <div className="pt-10 border-t border-white/5 relative z-10">
               <div className="flex items-center gap-4 text-emerald-500"><Activity className="h-6 w-6" /><span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Registry Audit Online</span></div>
            </div>
         </Card>
      </div>
    </div>
  )
}

function MetricCard({ label, value, trend, icon }: any) {
  return (
    <Card className="border-none shadow-2xl rounded-[2.5rem] p-10 bg-white hover:translate-y-[-4px] transition-all group border border-slate-50">
       <div className="flex items-center justify-between mb-8">
          <div className="h-16 w-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">{icon}</div>
          <div className={`text-[10px] font-black px-3 py-1 rounded-xl ${trend?.includes('+') ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'} uppercase tracking-widest`}>{trend}</div>
       </div>
       <p className="text-5xl font-headline font-black text-[#0F172A] tracking-tighter leading-none">{value}</p>
       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-5">{label}</p>
    </Card>
  )
}

function MetricChip({ label, value, icon }: any) {
   return (
      <Card className="border-none shadow-xl bg-white rounded-3xl p-8 flex items-center gap-6 border border-slate-50 hover:bg-slate-50/50 transition-colors">
         <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner">{icon}</div>
         <div className="text-left">
            <p className="text-3xl font-headline font-black text-[#0F172A] leading-none tabular-nums">{value}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">{label}</p>
         </div>
      </Card>
   )
}

function UsageProgress({ label, value }: any) {
   return (
      <div className="space-y-3">
         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400"><span>{label}</span><span className="text-primary">{value}%</span></div>
         <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-primary shadow-3xl shadow-primary/40 transition-all duration-1000" style={{ width: `${value}%` }} />
         </div>
      </div>
   )
}
