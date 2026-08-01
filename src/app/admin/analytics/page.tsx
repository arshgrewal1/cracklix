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
  Search,
  Globe,
  Youtube,
  Instagram,
  Linkedin,
  Facebook,
  Twitter,
  Send,
  Link as LinkIcon
} from "lucide-react"
import { useFirestore, useDoc, useCollection } from "@/firebase"
import { doc, collection, query, limit, orderBy, onSnapshot, where } from "firebase/firestore"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Premium Real-Time Community Analytics v1.0.
 * FIXED: Strictly uses real Firestore snapshots for all metrics.
 */

export default function CommunityAnalyticsPage() {
  const db = useFirestore()
  const [mounted, setMounted] = useState(false);
  const [lastSync, setLastSync] = useState<string>("");

  // Live Metric States
  const [liveMetrics, setLiveMetrics] = useState({
    totalUsers: 0,
    onlineUsers: 0,
    emailUsers: 0,
    googleUsers: 0,
    proUsers: 0,
    totalAttempts: 0,
    totalResults: 0,
    totalMocks: 0,
    totalPYQs: 0,
    newToday: 0,
    activeToday: 0
  });

  useEffect(() => {
    setMounted(true);
    if (!db) return;

    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);

    // 1. Live Users Listener (Total, Providers, Pro, New Today)
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
       const docs = snap.docs.map(d => d.data());
       const now = Date.now();
       
       setLiveMetrics(prev => ({
          ...prev,
          totalUsers: snap.size,
          onlineUsers: docs.filter(u => u.online === true || (u.lastSeen?.seconds && u.lastSeen.seconds * 1000 > now - 300000)).length,
          googleUsers: docs.filter(u => u.providerId === 'google.com' || u.email?.includes('google')).length, // Approximation if provider field missing
          emailUsers: docs.filter(u => !u.providerId || u.providerId === 'password').length,
          proUsers: docs.filter(u => u.passStatus === 'active').length,
          newToday: docs.filter(u => {
             const created = u.createdAt?.seconds ? new Date(u.createdAt.seconds * 1000) : new Date(u.createdAt);
             return created >= todayStart;
          }).length,
          activeToday: docs.filter(u => {
             const seen = u.lastSeen?.seconds ? new Date(u.lastSeen.seconds * 1000) : new Date(u.lastSeen);
             return seen >= todayStart;
          }).length
       }));
       setLastSync(new Date().toLocaleTimeString());
    });

    // 2. Mock Attempts Listener
    const unsubAttempts = onSnapshot(collection(db, "attempts"), (snap) => {
       setLiveMetrics(prev => ({ ...prev, totalAttempts: snap.size }));
    });

    // 3. Results Listener
    const unsubResults = onSnapshot(collection(db, "results"), (snap) => {
       setLiveMetrics(prev => ({ ...prev, totalResults: snap.size }));
    });

    // 4. Content Listeners
    const unsubMocks = onSnapshot(collection(db, "mocks"), (snap) => {
       setLiveMetrics(prev => ({ ...prev, totalMocks: snap.size }));
    });
    const unsubPYQs = onSnapshot(collection(db, "pyqs"), (snap) => {
       setLiveMetrics(prev => ({ ...prev, totalPYQs: snap.size }));
    });

    return () => {
       unsubUsers(); unsubAttempts(); unsubResults(); unsubMocks(); unsubPYQs();
    };
  }, [db]);

  if (!mounted) return null;

  return (
    <div className="space-y-10 pb-32 text-left animate-in fade-in duration-700">
      
      {/* 1. Header Hub */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1.5">
           <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Live Community Intelligence</span>
           </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tighter antialiased">Real-Time Analytics</h1>
          <p className="text-slate-500 font-medium text-sm md:text-lg">Monitoring institutional growth and aspirant engagement live from the database.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
           <div className="text-right">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Database Sync</p>
              <p className="text-xs font-bold text-emerald-600 tabular-nums">Active • {lastSync}</p>
           </div>
           <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
              <RefreshCw className="h-5 w-5 animate-spin-slow" />
           </div>
        </div>
      </div>

      {/* 2. Aspirant Matrix */}
      <section className="space-y-6">
         <div className="flex items-center gap-3 px-1">
            <Users className="h-5 w-5 text-blue-500" />
            <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-tight">Aspirant Matrix</h3>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <AnalyticCard label="Registered Users" value={liveMetrics.totalUsers} trend="Live" icon={<Users />} color="blue" />
            <AnalyticCard label="Online Now" value={liveMetrics.onlineUsers} trend="Pulse" icon={<Activity />} color="emerald" highlight={liveMetrics.onlineUsers > 0} />
            <AnalyticCard label="Elite Members" value={liveMetrics.proUsers} trend="Premium" icon={<Gem />} color="amber" />
            <AnalyticCard label="Active Today" value={liveMetrics.activeToday} trend="24h" icon={<Target />} color="indigo" />
         </div>
      </section>

      {/* 3. Authentication Hub */}
      <section className="space-y-6">
         <div className="flex items-center gap-3 px-1">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-tight">Authentication Nodes</h3>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <AnalyticCard label="Google Login" value={liveMetrics.googleUsers} trend="Sync" icon={<Globe />} color="blue" />
            <AnalyticCard label="Email Login" value={liveMetrics.emailUsers} trend="Vault" icon={<Send />} color="slate" />
            <AnalyticCard label="New Today" value={liveMetrics.newToday} trend="Growth" icon={<TrendingUp />} color="emerald" />
            <AnalyticCard label="Retention Rate" value="---" trend="Alpha" icon={<RefreshCw />} color="rose" />
         </div>
      </section>

      {/* 4. Asset Engagement */}
      <section className="space-y-6">
         <div className="flex items-center gap-3 px-1">
            <Zap className="h-5 w-5 text-orange-500" />
            <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-tight">System Velocity</h3>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <AnalyticCard label="Mock Attempts" value={liveMetrics.totalAttempts} trend="Active" icon={<Layers />} color="orange" />
            <AnalyticCard label="Reports Generated" value={liveMetrics.totalResults} trend="Sync" icon={<FileText />} color="blue" />
            <AnalyticCard label="Mock Assets" value={liveMetrics.totalMocks} trend="Bank" icon={<Database />} color="purple" />
            <AnalyticCard label="Paper Archives" value={liveMetrics.totalPYQs} trend="History" icon={<History />} color="emerald" />
         </div>
      </section>

      {/* 5. Social Community */}
      <section className="space-y-8 pt-10">
         <div className="flex items-center justify-between px-1 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3">
               <Globe className="h-5 w-5 text-blue-400" />
               <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-tight">Social Community</h3>
            </div>
            <Badge variant="outline" className="bg-slate-50 text-slate-400 font-black uppercase text-[8px] tracking-widest">External Nodes</Badge>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <SocialNode icon={<Youtube className="text-rose-600" />} label="YouTube" />
            <SocialNode icon={<Send className="text-blue-500" />} label="Telegram" />
            <SocialNode icon={<Instagram className="text-rose-500" />} label="Instagram" />
            <SocialNode icon={<Facebook className="text-blue-700" />} label="Facebook" />
            <SocialNode icon={<Twitter className="text-sky-500" />} label="X Portal" />
            <SocialNode icon={<Linkedin className="text-blue-800" />} label="LinkedIn" />
         </div>
      </section>

    </div>
  )
}

function AnalyticCard({ label, value, trend, icon, color, highlight }: any) {
   const colors: any = {
      blue: "bg-blue-500/10 border-blue-500/20 text-blue-600",
      emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
      purple: "bg-purple-500/10 border-purple-500/20 text-purple-600",
      orange: "bg-orange-500/10 border-orange-500/20 text-orange-600",
      rose: "bg-rose-500/10 border-rose-500/20 text-rose-600",
      indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-600",
      primary: "bg-primary/10 border-primary/20 text-primary",
      amber: "bg-amber-500/10 border-amber-500/20 text-amber-600",
      slate: "bg-slate-500/10 border-slate-500/20 text-slate-600"
   };

   return (
      <Card className={cn(
         "border-none shadow-xl bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] hover:translate-y-[-4px] transition-all duration-500 group border border-slate-50 text-left",
         highlight && "ring-2 ring-emerald-500/20"
      )}>
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

function SocialNode({ icon, label }: any) {
   return (
      <Card className="border border-slate-100 bg-white p-6 rounded-2xl text-center space-y-4 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
         <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
            {icon}
         </div>
         <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-[#0F172A]">{label}</p>
            <p className="text-[8px] font-bold text-rose-500 uppercase tracking-widest">Not Connected</p>
         </div>
         <button className="w-full h-8 bg-slate-50 hover:bg-primary hover:text-white rounded-lg font-black uppercase text-[8px] tracking-tight transition-all active:scale-95 border-none shadow-sm flex items-center justify-center gap-2">
            <LinkIcon className="h-2.5 w-2.5" /> Connect API
         </button>
      </Card>
   )
}
