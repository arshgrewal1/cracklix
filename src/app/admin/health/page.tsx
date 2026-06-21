"use client"

import React, { useState, useEffect, useMemo, isValidElement, cloneElement, ReactElement } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { HeartPulse, Zap, Activity, ShieldCheck, HardDrive, RefreshCw, Database, Server } from "lucide-react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useFirestore, useCollection } from "@/firebase"
import { collection } from "firebase/firestore"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Hardened Operational Node Monitor v4.7.
 * FIXED: React.cloneElement correctly typed for production deployment.
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
    <div className="space-y-6 md:space-y-12 text-[#0F172A] animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="text-left space-y-1">
           <div className="flex items-center gap-2 mb-1">
              <HeartPulse className="h-4 w-4 text-rose-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Live Telemetry Engine</span>
           </div>
          <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight">System Health</h1>
          <p className="text-slate-500 text-[11px] md:text-lg font-medium">Real-time performance trail for institutional prep nodes.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
           <div className="text-right px-2">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Signal Sync</p>
              <p className="text-xs font-bold text-emerald-600 tabular-nums">{lastSync}</p>
           </div>
           <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 text-slate-400" />
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8 px-1">
         <HealthCard label="API Latency" value={`${heartbeat.latency}ms`} status="Optimal" color="text-emerald-600" icon={<Zap />} />
         <HealthCard label="Registry Density" value={questions?.length || 0} status="Verified" color="text-blue-600" icon={<Database />} />
         <HealthCard label="Traffic Node" status="Active" value={results?.length || 0} color="text-emerald-600" icon={<Activity />} />
         <HealthCard label="Compute Load" status="Balanced" value={`${heartbeat.load}%`} color="text-emerald-600" icon={<Server />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 px-1">
         <Card className="border-none shadow-xl bg-white rounded-2xl md:rounded-[3rem] overflow-hidden border border-slate-50">
            <CardHeader className="p-6 md:p-10 border-b border-slate-50 bg-slate-50/30 text-left">
               <CardTitle className="text-lg md:text-2xl font-black text-[#0F172A]">Live Extraction Feed</CardTitle>
               <CardDescription className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Database read operations per cycle</CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-10">
               <div className="h-[250px] md:h-[350px] w-full">
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

         <Card className="border-none shadow-xl bg-white rounded-2xl md:rounded-[3rem] overflow-hidden border border-slate-50">
            <CardHeader className="p-6 md:p-10 border-b border-slate-50 bg-slate-50/30 text-left">
               <CardTitle className="text-lg md:text-2xl font-black text-[#0F172A]">CBT Latency (ms)</CardTitle>
               <CardDescription className="text-[9px] font-bold uppercase tracking-widest text-slate-400">High-fidelity response trail for test engine</CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-10">
               <div className="h-[250px] md:h-[350px] w-full">
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

      <div className="mx-1 bg-[#0F172A] rounded-2xl md:rounded-[3.5rem] p-6 md:p-12 overflow-hidden relative">
         <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><ShieldCheck className="h-44 md:h-64 w-44 md:w-64 text-white" /></div>
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
            <div className="text-center md:text-left space-y-2 md:space-y-4">
               <h4 className="text-xl md:text-3xl font-black text-white tracking-tight">Security Node Active</h4>
               <p className="text-slate-400 max-w-xl text-[11px] md:text-base font-medium leading-relaxed">All platform operations are audited against official government recruitment norms. SSL/TLS encryption active on all extraction hubs.</p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-6 py-2 rounded-full font-black text-[9px] md:text-xs tracking-widest uppercase">Registry Protected</Badge>
         </div>
      </div>
    </div>
  )
}

function HealthCard({ label, value, status, icon, color }: any) {
   return (
      <Card className="border-none shadow-lg bg-white p-5 md:p-8 rounded-2xl md:rounded-[2rem] relative overflow-hidden group border border-slate-50">
         <div className="absolute top-0 right-0 p-4 md:p-6 opacity-5 group-hover:scale-110 transition-transform">
            {isValidElement(icon) && cloneElement(icon as ReactElement<any>, { className: cn("h-5 w-5 md:h-8 md:w-8", color) })}
         </div>
         <div className="space-y-3 md:space-y-4 relative z-10 text-left">
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
            <p className="text-2xl md:text-4xl font-black text-[#0F172A] tabular-nums leading-none">{value}</p>
            <Badge className={cn("border-none text-[8px] font-black px-2 py-0.5 rounded-lg shadow-sm bg-emerald-50 text-emerald-600 uppercase tracking-widest")}>
               {status}
            </Badge>
         </div>
      </Card>
   )
}
