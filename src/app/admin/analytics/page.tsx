"use client"

import React, { useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Zap, BarChart3, ShieldCheck, Target, Activity, FileText, Newspaper, Layers } from "lucide-react"
import { useFirestore, useDoc } from "@/firebase"
import { doc, DocumentData, FirestoreDataConverter } from "firebase/firestore"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Stats } from "@/types"

const statsConverter: FirestoreDataConverter<Stats> = {
    toFirestore: (data: Stats): DocumentData => data,
    fromFirestore: (snap): Stats => snap.data() as Stats
};

/**
 * @fileOverview Institutional Platform Stats v17.2.
 * FIXED: Added mounted check for Recharts to prevent hydration errors.
 */

const formatCompact = (num: number) => {
   if (!num) return "0";
   if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
   if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
   return num.toString();
};

export default function AdminAnalytics() {
  const db = useFirestore()
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats").withConverter(statsConverter) : null), [db]);
  const { data: stats, loading } = useDoc<Stats>(statsRef);

  const dynamicChartData = useMemo(() => {
     const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
     const base = stats?.totalUsers || 0;
     const resultBase = stats?.totalAttempts || 0;
     
     return days.map((day: string, i: number) => ({
        day,
        users: Math.round((base * (0.8 + i * 0.05)) + (resultBase * 0.1)) || 10 
     }));
  }, [stats]);

  if (!mounted) return (
     <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
     </div>
  );

  return (
    <div className="space-y-6 md:space-y-12 pb-20 text-left animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-1">
        <div className="text-left space-y-1">
           <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Performance Engine</span>
           </div>
          <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight">Platform Stats</h1>
          <p className="text-slate-500 text-[11px] md:text-lg font-medium">Real-time database counts from synchronized registry nodes.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-1">
         <MetricCard label="Registered Users" value={loading ? "..." : formatCompact(stats?.totalUsers || 0)} trend="Active" icon={<Users className="text-blue-400" />} />
         <MetricCard label="Live Mock Tests" value={loading ? "..." : formatCompact(stats?.totalMocks || 0)} trend="Published" icon={<Zap className="text-primary" />} />
         <MetricCard label="Study Materials" value={loading ? "..." : formatCompact(stats?.totalNotes || 0)} trend="Public" icon={<FileText className="text-emerald-500" />} />
         <MetricCard label="Previous Papers" value={loading ? "..." : formatCompact(stats?.totalPYQs || 0)} trend="Archive" icon={<Newspaper className="text-amber-500" />} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-1">
         <MetricChip label="Total Questions" value={loading ? "..." : formatCompact(stats?.totalQuestions || 0)} icon={<Layers className="text-indigo-400" />} />
         <MetricChip label="Test Attempts" value={loading ? "..." : formatCompact(stats?.totalAttempts || 0)} icon={<Activity className="text-rose-500" />} />
         <MetricChip label="Active Today" value={loading ? "..." : formatCompact(stats?.activeStudentsToday || 0)} icon={<Target className="text-emerald-400" />} />
         <MetricChip label="Avg Accuracy" value={loading ? "..." : `${stats?.averageAccuracy || 0}%`} icon={<ShieldCheck className="text-blue-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 px-1">
         <Card className="lg:col-span-8 border-none shadow-xl rounded-2xl md:rounded-[3rem] bg-white overflow-hidden border border-slate-50">
            <CardHeader className="p-6 md:p-12 border-b border-slate-50 bg-slate-50/30 text-left">
               <CardTitle className="text-lg md:text-3xl font-black text-[#0F172A]">User Growth Index</CardTitle>
               <CardDescription className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Projection based on live registration nodes.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-12">
               <div className="h-[250px] md:h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={dynamicChartData}>
                        <defs>
                           <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} />
                        <YAxis hide />
                        <Tooltip content={({active, payload}) => {
                           if (active && payload && payload.length) {
                              return <div className="bg-[#0F172A] text-white p-4 rounded-xl shadow-4xl text-xs font-bold uppercase tracking-tight"><span className="text-primary mr-2">{(payload[0].value as number)}</span> Growth</div>
                           }
                           return null
                        }} />
                        <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={5} fillOpacity={1} fill="url(#colorUsers)" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </CardContent>
         </Card>

         <Card className="lg:col-span-4 border-none shadow-xl rounded-2xl md:rounded-[3rem] bg-[#0F172A] text-white p-6 md:p-12 space-y-6 md:space-y-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><ShieldCheck className="h-44 md:h-64 w-44 md:w-64" /></div>
            <div className="space-y-1 relative z-10 text-left"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Operational Matrix</p><h3 className="text-xl md:text-3xl font-black leading-none">Content Health</h3></div>
            <div className="space-y-6 md:space-y-8 relative z-10">
               <UsageProgress label="Mock Coverage" value={loading ? 0 : Math.min(100, Math.round((stats?.totalMocks || 0) / 5))} />
               <UsageProgress label="Material Saturation" value={loading ? 0 : Math.min(100, Math.round((stats?.totalNotes || 0) / 2))} />
               <UsageProgress label="Paper Archiving" value={loading ? 0 : Math.min(100, Math.round((stats?.totalPYQs || 0) / 1))} />
            </div>
            <div className="pt-6 md:pt-10 border-t border-white/5 relative z-10">
               <div className="flex items-center gap-3 text-emerald-500 text-left"><Activity className="h-4 w-4" /><span className="text-[8px] font-black uppercase tracking-[0.1em]">Live Audit Online</span></div>
            </div>
         </Card>
      </div>
    </div>
  )
}

function Loader2({ className }: any) {
  return <RefreshCw className={cn("animate-spin", className)} />
}

function MetricCard({ label, value, trend, icon }: { label: string, value: string | number, trend: string, icon: React.ReactNode }) {
  return (
    <Card className="border-none shadow-lg rounded-2xl md:rounded-[2.5rem] p-5 md:p-10 bg-white hover:translate-y-[-4px] transition-all group border border-slate-50 text-left">
       <div className="flex items-center justify-between mb-4 md:mb-8">
          <div className="h-10 w-10 md:h-16 md:w-16 rounded-xl md:rounded-[1.5rem] bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">{icon}</div>
          <div className={`text-[8px] md:text-[10px] font-black px-2 md:px-3 py-0.5 md:py-1 rounded-lg bg-slate-50 text-slate-400 uppercase tracking-widest`}>{trend}</div>
       </div>
       <div className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tighter leading-none tabular-nums">{value}</div>
       <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 mt-3 md:mt-5">{label}</p>
    </Card>
  )
}

function MetricChip({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) {
   return (
      <Card className="border-none shadow-md bg-white rounded-xl md:rounded-3xl p-4 md:p-8 flex items-center gap-4 md:gap-6 border border-slate-50 hover:bg-slate-50/50 transition-colors text-left">
         <div className="h-8 w-8 md:h-12 md:w-12 bg-slate-50 rounded-lg md:rounded-2xl flex items-center justify-center shadow-inner">{icon}</div>
         <div className="text-left min-w-0">
            <div className="text-lg md:text-3xl font-black text-[#0F172A] leading-none tabular-nums truncate">{value}</div>
            <p className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 md:mt-2 truncate">{label}</p>
         </div>
      </Card>
   )
}

function UsageProgress({ label, value }: { label: string, value: number }) {
   return (
      <div className="space-y-2 md:space-y-3">
         <div className="flex justify-between items-center text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400"><span>{label}</span><span className="text-primary">{value}%</span></div>
         <div className="h-1 md:h-1.5 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-primary shadow-3xl shadow-primary/40 transition-all duration-1000" style={{ width: `${value}%` }} />
         </div>
      </div>
   )
}
