"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Zap, BarChart3, ShieldCheck, Target, CreditCard, Activity, Lock, Unlock } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection } from "firebase/firestore"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import type { Question, MockTest } from "@/types"

/**
 * @fileOverview Institutional Analytics Hub v16.8 (Hardened Build).
 * FIXED: Explicit typing for all reduction callbacks and chart data mapping to satisfy strict build requirements.
 */

interface MetricCardProps {
  label: string;
  value: string | number;
  trend: string;
  icon: React.ReactNode;
}

interface MetricChipProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

interface UsageProgressProps {
  label: string;
  value: number;
}

export default function AdminAnalytics() {
  const db = useFirestore()
  
  const usersQuery = useMemo(() => (db ? collection(db, "users") : null), [db]);
  const resultsQuery = useMemo(() => (db ? collection(db, "results") : null), [db]);
  const questionsQuery = useMemo(() => (db ? collection(db, "questions") : null), [db]);
  const mocksQuery = useMemo(() => (db ? collection(db, "mocks") : null), [db]);

  const { data: users, loading: usersLoading } = useCollection<any>(usersQuery)
  const { data: results, loading: resultsLoading } = useCollection<any>(resultsQuery)
  const { data: questions, loading: qLoading } = useCollection<Question>(questionsQuery as any)
  const { data: mocks, loading: mLoading } = useCollection<MockTest>(mocksQuery as any)

  const stats = useMemo(() => {
     if (!questions) return { used: 0, unused: 0, locked: 0, total: 0 };
     return {
        used: (questions as Question[]).filter((q: Question) => q.status === 'USED').length,
        unused: (questions as Question[]).filter((q: Question) => q.status === 'UNUSED' || !q.status).length,
        locked: (questions as Question[]).filter((q: Question) => q.status === 'LOCKED').length,
        total: questions.length
     }
  }, [questions]);

  const mockStats = useMemo(() => {
    if (!mocks) return { free: 0, premium: 0 };
    return {
      free: (mocks as MockTest[]).filter((m: MockTest) => (m.accessLevel || 'FREE') === 'FREE').length,
      premium: (mocks as MockTest[]).filter((m: MockTest) => m.accessLevel === 'PREMIUM').length
    };
  }, [mocks]);

  const proUsers = useMemo(() => (users as any[] || []).filter((u: any) => u.pass?.active === true), [users]);

  const avgAccuracy = useMemo(() => {
    if (!results || results.length === 0) return 0
    return Math.round((results as any[]).reduce((acc: number, r: any) => acc + (r.accuracy || 0), 0) / (results.length || 1))
  }, [results])

  const dynamicChartData = useMemo(() => {
     const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
     const base = users?.length || 0;
     const resultBase = results?.length || 0;
     
     return days.map((day: string, i: number) => ({
        day,
        users: Math.round((base * 0.1) + (resultBase * (0.05 * (i + 1)))) || 10 
     }));
  }, [users, results]);

  return (
    <div className="space-y-12 pb-20 text-left">
      <div className="flex justify-between items-center px-4">
        <div className="text-left">
           <div className="flex items-center gap-3 mb-2"><BarChart3 className="h-5 w-5 text-primary" /><span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Institutional Governance Monitor</span></div>
          <h1 className="text-5xl font-black font-headline text-primary uppercase tracking-tight">Ecosystem Insights</h1>
          <p className="text-[#0F172A] mt-2 text-lg font-medium">Tracking student growth and registry lifecycle metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4">
         <MetricCard label="Total Free Mocks" value={mLoading ? "..." : mockStats.free} trend="Public" icon={<Unlock className="text-emerald-500" />} />
         <MetricCard label="Total Premium Mocks" value={mLoading ? "..." : mockStats.premium} trend="Locked" icon={<Lock className="text-amber-500" />} />
         <MetricCard label="Active Aspirants" value={usersLoading ? "..." : (users?.length || "0")} trend="Live" icon={<Users className="text-blue-400" />} />
         <MetricCard label="Pro Pass Holders" value={usersLoading ? "..." : proUsers.length} trend="Elite" icon={<CreditCard className="text-emerald-400" />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4">
         <MetricChip label="Total MCQs" value={qLoading ? "..." : (questions?.length || 0)} icon={<Zap className="text-primary" />} />
         <MetricChip label="Audit Attempts" value={resultsLoading ? "..." : (results?.length || "0")} icon={<Activity className="text-blue-500" />} />
         <MetricChip label="Avg Accuracy" value={resultsLoading ? "..." : `${avgAccuracy}%`} icon={<Target className="text-rose-400" />} />
         <MetricChip label="Locked Nodes" value={qLoading ? "..." : stats.locked} icon={<Lock className="text-slate-400" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
         <Card className="lg:col-span-8 border-none shadow-3xl rounded-[3.5rem] bg-white overflow-hidden border border-slate-50">
            <CardHeader className="p-12 border-b border-slate-50 bg-slate-50/30 text-left">
               <CardTitle className="font-headline font-black text-3xl text-[#0F172A] uppercase">Engagement Flow</CardTitle>
               <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">Projected volume based on current registration nodes.</CardDescription>
            </CardHeader>
            <CardContent className="p-12">
               <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={dynamicChartData}>
                        <defs>
                           <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 700}} />
                        <YAxis hide />
                        <Tooltip content={({active, payload}) => {
                           if (active && payload && payload.length) {
                              return <div className="bg-[#0F172A] text-white p-6 rounded-[1.5rem] shadow-4xl text-sm font-bold uppercase tracking-tight"><span className="text-primary mr-3">{(payload[0].value as number)}</span> Activity Node</div>
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
               <UsageProgress label="Verified Unique Assets" value={qLoading ? 0 : Math.round((stats.unused / (stats.total || 1)) * 100)} />
               <UsageProgress label="Market Active (Used)" value={qLoading ? 0 : Math.round((stats.used / (stats.total || 1)) * 100)} />
               <UsageProgress label="Banned Assets" value={qLoading ? 0 : Math.round((stats.locked / (stats.total || 1)) * 100)} />
            </div>
            <div className="pt-10 border-t border-white/5 relative z-10">
               <div className="flex items-center gap-4 text-emerald-500 text-left"><Activity className="h-6 w-6" /><span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Registry Audit Online</span></div>
            </div>
         </Card>
      </div>
    </div>
  )
}

function MetricCard({ label, value, trend, icon }: MetricCardProps) {
  return (
    <Card className="border-none shadow-2xl rounded-[2.5rem] p-10 bg-white hover:translate-y-[-4px] transition-all group border border-slate-50 text-left">
       <div className="flex items-center justify-between mb-8">
          <div className="h-16 w-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">{icon}</div>
          <div className={`text-[10px] font-black px-3 py-1 rounded-xl bg-slate-50 text-slate-400 uppercase tracking-widest`}>{trend}</div>
       </div>
       <div className="text-5xl font-headline font-black text-[#0F172A] tracking-tighter leading-none tabular-nums">{value}</div>
       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-5">{label}</p>
    </Card>
  )
}

function MetricChip({ label, value, icon }: MetricChipProps) {
   return (
      <Card className="border-none shadow-xl bg-white rounded-3xl p-8 flex items-center gap-6 border border-slate-50 hover:bg-slate-50/50 transition-colors text-left">
         <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner">{icon}</div>
         <div className="text-left">
            <div className="text-3xl font-headline font-black text-[#0F172A] leading-none tabular-nums">{value}</div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">{label}</p>
         </div>
      </Card>
   )
}

function UsageProgress({ label, value }: UsageProgressProps) {
   return (
      <div className="space-y-3">
         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400"><span>{label}</span><span className="text-primary">{value}%</span></div>
         <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-primary shadow-3xl shadow-primary/40 transition-all duration-1000" style={{ width: `${value}%` }} />
         </div>
      </div>
   )
}
