
"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Users, 
  Zap, 
  Calendar, 
  BarChart3, 
  ShieldCheck, 
  Target,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  Activity
} from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, limit } from "firebase/firestore"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from "recharts"

const chartData = [
  { day: "Mon", users: 420 },
  { day: "Tue", users: 580 },
  { day: "Wed", users: 890 },
  { day: "Thu", users: 760 },
  { day: "Fri", users: 1200 },
  { day: "Sat", users: 950 },
  { day: "Sun", users: 1400 },
]

/**
 * @fileOverview Final Administrative Control Center.
 * Features growth metrics, pass distribution, and institutional performance monitoring.
 */

export default function AdminAnalytics() {
  const db = useFirestore()
  
  const { data: users } = useCollection<any>(useMemo(() => (db ? collection(db, "users") : null), [db]))
  const { data: mocks } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]))
  const { data: results } = useCollection<any>(useMemo(() => (db ? collection(db, "results") : null), [db]))

  const proUsers = useMemo(() => users?.filter((u: any) => u.status && u.status !== 'Free') || [], [users]);

  const avgAccuracy = useMemo(() => {
    if (!results || results.length === 0) return 64
    return Math.round(results.reduce((acc, r: any) => acc + (r.accuracy || 0), 0) / results.length)
  }, [results])

  return (
    <div className="space-y-12 pb-20 text-left">
      <div className="flex justify-between items-center">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Institutional Governance Monitor</span>
           </div>
          <h1 className="text-5xl font-black font-headline text-primary uppercase tracking-tight">Ecosystem Insights</h1>
          <p className="text-[#0F172A] mt-2 text-lg font-medium">Tracking student growth and preparation precision across all Punjab verticals.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <MetricCard label="Total Aspirants" value={users?.length || "0"} trend="+24%" icon={<Users className="text-blue-400" />} />
         <MetricCard label="Pro Pass Holders" value={proUsers.length} trend="+12%" icon={<CreditCard className="text-emerald-400" />} />
         <MetricCard label="Audit Attempts" value={results?.length || "0"} trend="+15%" icon={<Zap className="text-primary" />} />
         <MetricCard label="Avg. Accuracy" value={`${avgAccuracy}%`} trend="Target 70%" icon={<Target className="text-rose-400" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <Card className="lg:col-span-8 border-none shadow-3xl shadow-slate-900/10 rounded-[3.5rem] bg-white overflow-hidden">
            <CardHeader className="p-12 border-b border-slate-50">
               <CardTitle className="font-headline font-black text-3xl text-[#0F172A] uppercase">Active User Flow</CardTitle>
               <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">Daily active nodes across the Cracklix ecosystem.</CardDescription>
            </CardHeader>
            <CardContent className="p-12">
               <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={chartData}>
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
                              return <div className="bg-[#0F172A] text-white p-6 rounded-[1.5rem] shadow-4xl text-sm font-bold uppercase tracking-tight">
                                <span className="text-primary mr-3">{payload[0].value}</span> Sessions
                              </div>
                           }
                           return null
                        }} />
                        <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={5} fillOpacity={1} fill="url(#colorUsers)" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </CardContent>
         </Card>

         <Card className="lg:col-span-4 border-none shadow-3xl shadow-slate-900/10 rounded-[3.5rem] bg-[#0F172A] text-white p-12 space-y-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><ShieldCheck className="h-64 w-64" /></div>
            <div className="space-y-2 relative z-10">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Authority Distribution</p>
               <h3 className="font-headline font-black text-3xl uppercase leading-none">Exam Popularity</h3>
            </div>
            <div className="space-y-8 relative z-10">
               <BoardProgress label="PSSSB Verticals" value={78} />
               <BoardProgress label="Punjab Police" value={92} />
               <BoardProgress label="PPSC Gazetted" value={45} />
               <BoardProgress label="High Court Clerk" value={32} />
            </div>
            <div className="pt-10 border-t border-white/5 relative z-10">
               <div className="flex items-center gap-4 text-emerald-500">
                  <Activity className="h-6 w-6" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Institutional Engine Online</span>
               </div>
            </div>
         </Card>
      </div>
    </div>
  )
}

function MetricCard({ label, value, trend, icon }: any) {
  return (
    <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] p-10 bg-white hover:translate-y-[-6px] transition-all group">
       <div className="flex items-center justify-between mb-8">
          <div className="h-16 w-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
             {icon}
          </div>
          <div className={`text-[10px] font-black px-3 py-1 rounded-xl ${trend.includes('+') ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'} uppercase tracking-widest`}>
             {trend}
          </div>
       </div>
       <p className="text-5xl font-headline font-black text-[#0F172A] tracking-tighter leading-none">{value}</p>
       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-5">{label}</p>
    </Card>
  )
}

function BoardProgress({ label, value }: any) {
   return (
      <div className="space-y-3">
         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>{label}</span>
            <span className="text-primary">{value}%</span>
         </div>
         <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-primary shadow-3xl shadow-primary/40 transition-all duration-1000" style={{ width: `${value}%` }} />
         </div>
      </div>
   )
}
