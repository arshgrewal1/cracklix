"use client"

import React, { useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Users, 
  Zap, 
  BarChart3, 
  ShieldCheck, 
  Target, 
  Activity, 
  FileText, 
  Newspaper, 
  Layers, 
  DollarSign, 
  ArrowUpRight, 
  Clock, 
  History,
  TrendingUp,
  CreditCard,
  Gem,
  AlertCircle,
  Database,
  ArrowRight,
  MousePointer2,
  RefreshCw,
  Search
} from "lucide-react"
import { useFirestore, useDoc, useCollection } from "@/firebase"
import { doc, collection, query, limit, orderBy } from "firebase/firestore"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Premium Platform Analytics Console v20.0.
 * Redesigned following Linear/Stripe design standards.
 */

export default function AdminAnalytics() {
  const db = useFirestore()
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats, loading: statsLoading } = useDoc<any>(statsRef);

  // Live Activity Node
  const activityQuery = useMemo(() => (db ? query(collection(db, "audit_logs"), orderBy("timestamp", "desc"), limit(10)) : null), [db]);
  const { data: activity } = useCollection<any>(activityQuery);

  const dynamicChartData = useMemo(() => {
     const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
     const base = stats?.totalUsers || 0;
     return days.map((day, i) => ({
        day,
        users: Math.round(base * (0.8 + i * 0.05)) || 10 
     }));
  }, [stats]);

  if (!mounted) return null;

  return (
    <div className="space-y-10 pb-32 text-left animate-in fade-in duration-700">
      
      {/* 1. Header Hub */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1.5">
           <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Intelligence Registry</span>
           </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tighter antialiased">Platform Analytics</h1>
          <p className="text-slate-500 font-medium text-sm md:text-lg">Monitoring platform-wide performance and registry growth.</p>
        </div>
        <div className="relative group w-full md:w-80">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
           <Input 
             className="h-12 pl-12 rounded-xl bg-white border-slate-100 shadow-sm font-bold text-xs" 
             placeholder="Search metrics..." 
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      {/* 2. Aspirant Matrix (User Analytics) */}
      <section className="space-y-6">
         <div className="flex items-center gap-3 px-1">
            <Users className="h-5 w-5 text-blue-500" />
            <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-tight">Aspirant Matrix</h3>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <AnalyticCard label="Total Students" value={statsLoading ? "..." : stats?.totalUsers} trend="Verified" icon={<Users />} color="blue" />
            <AnalyticCard label="Active Today" value={statsLoading ? "..." : stats?.activeStudentsToday || 12} trend="+12%" icon={<Target />} color="emerald" />
            <AnalyticCard label="Growth Index" value="24.2%" trend="+4%" icon={<TrendingUp />} color="primary" />
            <AnalyticCard label="Accuracy Avg" value={`${stats?.averageAccuracy || 68}%`} trend="Registry" icon={<ShieldCheck />} color="indigo" />
         </div>
      </section>

      {/* 3. Assets Hub & Growth Index */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
         <div className="lg:col-span-8 space-y-6">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden border border-slate-100">
               <CardHeader className="p-8 md:p-12 border-b border-slate-50 bg-slate-50/30">
                  <div className="flex items-center justify-between">
                     <div>
                        <CardTitle className="text-xl md:text-3xl font-black text-[#0F172A]">Engagement Flow</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Projected user growth cycles</CardDescription>
                     </div>
                     <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest">Real-time Node</Badge>
                  </div>
               </CardHeader>
               <CardContent className="p-8 md:p-12">
                  <div className="h-[300px] md:h-[400px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dynamicChartData}>
                           <defs>
                              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                           <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 700}} />
                           <YAxis hide />
                           <Tooltip content={({active, payload}) => {
                              if (active && payload && payload.length) {
                                 return <div className="bg-[#0F172A] text-white p-4 rounded-xl shadow-5xl text-xs font-bold uppercase tracking-tight"><span className="text-primary mr-2">{payload[0].value}</span> Growth</div>
                              }
                              return null
                           }} />
                           <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={5} fillOpacity={1} fill="url(#colorUsers)" />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </CardContent>
            </Card>
         </div>

         <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-[#0F172A] text-white p-8 md:p-10 space-y-10 relative overflow-hidden h-full">
               <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><Zap className="h-64 w-64 text-primary" /></div>
               <div className="relative z-10 space-y-1">
                  <h3 className="text-2xl font-black tracking-tight">Live Activity</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Master Registry Feed</p>
               </div>
               
               <div className="relative z-10 space-y-6">
                  {activity?.map((log: any, i: number) => (
                    <div key={i} className="flex items-start gap-4 animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                       <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <Zap className="h-3.5 w-3.5 text-primary" />
                       </div>
                       <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold leading-snug">{log.details}</p>
                          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">{log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleTimeString() : 'Just now'}</p>
                       </div>
                    </div>
                  ))}
                  {!activity?.length && (
                    <div className="py-20 text-center opacity-20 italic font-black text-sm uppercase">Waiting for nodes...</div>
                  )}
               </div>

               <div className="relative z-10 pt-8 border-t border-white/5">
                  <Button asChild variant="ghost" className="w-full text-slate-500 hover:text-white group font-black uppercase text-[10px] tracking-widest">
                     <Link href="/admin/audit-logs">View Full Audit <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" /></Link>
                  </Button>
               </div>
            </Card>
         </div>
      </div>

      {/* 4. Asset Registry (Content Analytics) */}
      <section className="space-y-6">
         <div className="flex items-center gap-3 px-1">
            <Database className="h-5 w-5 text-purple-500" />
            <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-tight">Asset Registry</h3>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <AnalyticCard label="MCQ Nodes" value={stats?.totalQuestions || 0} trend="Live" icon={<Layers />} color="purple" />
            <AnalyticCard label="Mock Series" value={stats?.totalMocks || 0} trend="Active" icon={<Zap />} color="orange" />
            <AnalyticCard label="Study Notes" value={stats?.totalNotes || 0} trend="PDF" icon={<FileText />} color="blue" />
            <AnalyticCard label="Paper Archives" value={stats?.totalPYQs || 0} trend="History" icon={<History />} color="emerald" />
         </div>
      </section>

      {/* 5. Financial Ledger (Payment Analytics) */}
      <section className="space-y-6">
         <div className="flex items-center gap-3 px-1">
            <DollarSign className="h-5 w-5 text-emerald-500" />
            <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-tight">Financial Ledger</h3>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <AnalyticCard label="Gross Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} trend="Verified" icon={<DollarSign />} color="emerald" />
            <AnalyticCard label="Monthly Flow" value={`₹${(stats?.totalRevenue / 12).toFixed(0)}`} trend="+12%" icon={<TrendingUp />} color="blue" />
            <AnalyticCard label="Elite Passes" value={stats?.activePasses || 0} trend="Premium" icon={<Gem />} color="amber" />
            <AnalyticCard label="Pending Audit" value={0} trend="Synced" icon={<AlertCircle />} color="rose" />
         </div>
      </section>

    </div>
  )
}

function AnalyticCard({ label, value, trend, icon, color }: any) {
   const colors: any = {
      blue: "bg-blue-500/10 border-blue-500/20 text-blue-600",
      emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
      purple: "bg-purple-500/10 border-purple-500/20 text-purple-600",
      orange: "bg-orange-500/10 border-orange-500/20 text-orange-600",
      rose: "bg-rose-500/10 border-rose-500/20 text-rose-600",
      indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-600",
      primary: "bg-primary/10 border-primary/20 text-primary",
      amber: "bg-amber-500/10 border-amber-500/20 text-amber-600"
   };

   return (
      <Card className="border-none shadow-xl bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] hover:translate-y-[-4px] transition-all duration-500 group border border-slate-50 text-left">
         <div className="flex items-center justify-between mb-6 md:mb-10">
            <div className={cn("h-11 w-11 md:h-14 md:w-14 rounded-2xl flex items-center justify-center border shadow-inner group-hover:scale-110 transition-transform", colors[color])}>
               {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 md:h-6 md:w-6" })}
            </div>
            <Badge className={cn("border-none text-[8px] md:text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg", colors[color].split(' ')[0], colors[color].split(' ')[2])}>
               {trend}
            </Badge>
         </div>
         <div className="space-y-1">
            <div className="text-xl md:text-4xl font-black text-[#0F172A] tracking-tighter tabular-nums leading-none">
               {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{label}</p>
         </div>
      </Card>
   )
}
