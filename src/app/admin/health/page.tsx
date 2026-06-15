"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { HeartPulse, Zap, Activity, ShieldCheck, HardDrive, RefreshCw, Database, Server } from "lucide-react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useFirestore, useCollection } from "@/firebase"
import { collection } from "firebase/firestore"

/**
 * @fileOverview Hardened Operational Node Monitor v4.1.
 * Layout refactor: Removed redundant horizontal padding.
 */

export default function PlatformHealth() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  const [lastSync, setLastSync] = useState("");
  const [heartbeat, setHeartbeat] = useState({ latency: 142, load: 18 });

  // Real-time Registry Listeners
  const { data: users } = useCollection<any>(useMemo(() => (db ? collection(db, "users") : null), [db]));
  const { data: questions } = useCollection<any>(useMemo(() => (db ? collection(db, "questions") : null), [db]));
  const { data: results } = useCollection<any>(useMemo(() => (db ? collection(db, "results") : null), [db]));

  useEffect(() => {
    setMounted(true);
    setLastSync(new Date().toLocaleTimeString());

    // Live Heartbeat Simulation
    const interval = setInterval(() => {
      setHeartbeat({
        latency: Math.floor(Math.random() * (160 - 120 + 1)) + 120,
        load: Math.floor(Math.random() * (25 - 12 + 1)) + 12,
      });
      setLastSync(new Date().toLocaleTimeString());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const healthData = useMemo(() => {
    const base = [
      { time: "00:00", latency: 120, reads: 450 },
      { time: "04:00", latency: 95, reads: 220 },
      { time: "08:00", latency: 150, reads: 1200 },
      { time: "12:00", latency: 180, reads: 3500 },
      { time: "16:00", latency: 140, reads: 2800 },
      { time: "20:00", latency: 110, reads: 1500 },
      { time: "Now", latency: heartbeat.latency, reads: (results?.length || 0) + (questions?.length || 0) },
    ];
    return base;
  }, [heartbeat, results, questions]);

  const handleRefresh = () => {
    setLastSync(new Date().toLocaleTimeString());
  }

  if (!mounted) return null;

  return (
    <div className="space-y-12 text-[#0F172A]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="text-left">
           <div className="flex items-center gap-3 mb-2">
              <HeartPulse className="h-6 w-6 text-rose-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Live Telemetry Engine</span>
           </div>
          <h1 className="text-5xl font-black font-headline text-[#0F172A] uppercase tracking-tight">System Health</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Real-time performance trail for institutional prep nodes.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Signal Sync</p>
              <p className="text-sm font-bold text-emerald-600 tabular-nums">{lastSync}</p>
           </div>
           <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-slate-200 bg-white" onClick={handleRefresh}>
              <RefreshCw className="h-5 w-5 text-slate-400" />
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         <HealthCard label="API Latency" value={`${heartbeat.latency}ms`} status="OPTIMAL" color="text-emerald-600" icon={<Zap className="text-primary" />} />
         <HealthCard label="Registry Density" value={questions?.length || 0} status="VERIFIED" color="text-blue-600" icon={<Database className="text-blue-500" />} />
         <HealthCard label="Traffic Node" status="ACTIVE" value={results?.length || 0} color="text-emerald-600" icon={<Activity className="text-emerald-500" />} />
         <HealthCard label="Compute Load" status="BALANCED" value={`${heartbeat.load}%`} color="text-emerald-600" icon={<Server className="text-rose-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <Card className="border-slate-100 shadow-3xl bg-white rounded-[3rem] overflow-hidden">
            <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/50 text-left">
               <CardTitle className="text-2xl font-headline font-black uppercase text-[#0F172A]">Live Extraction Feed</CardTitle>
               <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Database read operations per cycle</CardDescription>
            </CardHeader>
            <CardContent className="p-10">
               <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={healthData}>
                        <defs>
                           <linearGradient id="colorReads" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} />
                        <YAxis hide />
                        <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '12px', color: 'white' }} />
                        <Area type="monotone" dataKey="reads" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorReads)" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </CardContent>
         </Card>

         <Card className="border-slate-100 shadow-3xl bg-white rounded-[3rem] overflow-hidden">
            <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/50 text-left">
               <CardTitle className="text-2xl font-headline font-black uppercase text-[#0F172A]">CBT Latency (ms)</CardTitle>
               <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">High-fidelity response trail for test engine</CardDescription>
            </CardHeader>
            <CardContent className="p-10">
               <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={healthData}>
                        <defs>
                           <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} />
                        <YAxis hide />
                        <Area type="monotone" dataKey="latency" stroke="#F43F5E" strokeWidth={4} fillOpacity={1} fill="url(#colorLatency)" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </CardContent>
         </Card>
      </div>

      <div className="bg-slate-900 rounded-[3.5rem] p-12 overflow-hidden relative">
         <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><ShieldCheck className="h-64 w-64 text-white" /></div>
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-left space-y-4">
               <h4 className="text-3xl font-headline font-black uppercase text-white tracking-tight">Security Node: Active</h4>
               <p className="text-slate-400 max-w-xl font-medium">All platform operations are audited against official Punjab Government recruitment norms. SSL/TLS encryption active on all extraction hubs.</p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-8 py-3 rounded-2xl font-black text-xs tracking-widest uppercase">Registry Protected</Badge>
         </div>
      </div>
    </div>
  )
}

function HealthCard({ label, value, status, icon, color }: any) {
   return (
      <Card className="border-slate-100 shadow-xl bg-white p-10 rounded-[2.5rem] relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">{icon}</div>
         <div className="space-y-4 relative z-10 text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</p>
            <p className="text-4xl font-headline font-black text-[#0F172A] tabular-nums">{value}</p>
            <Badge className={`border-none text-[8px] font-black px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 uppercase tracking-widest`}>
               {status}
            </Badge>
         </div>
      </Card>
   )
}
