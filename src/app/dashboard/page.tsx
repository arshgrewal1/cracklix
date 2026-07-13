
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Target, 
  Clock, 
  Calendar, 
  Trophy, 
  Activity, 
  TrendingUp, 
  BarChart3, 
  Gem, 
  ChevronRight, 
  ShieldCheck,
  Award,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import StudentAvatar from '@/components/brand/StudentAvatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudySessions } from '@/hooks/useStudyAnalytics';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

/**
 * @fileOverview Institutional Performance Hub v5.0.
 */

const formatStudyTime = (seconds: number) => {
  if (isNaN(seconds) || seconds <= 0) return "0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

export default function StudentDashboard() {
  const { user, profile, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { stats, loading: statsLoading } = useStudySessions();

  useEffect(() => {
    setMounted(true);
  }, []);

  const resultsQuery = useMemo(() => {
    if (!db || !user || !mounted) return null;
    return query(collection(db, "results"), where("userId", "==", user.uid), limit(10));
  }, [db, user, mounted]);

  const { data: results, loading: resultsLoading } = useCollection<any>(resultsQuery);

  const performance = useMemo(() => {
     if (!results || results.length === 0) return { accuracy: 0, time: 0, weak: 'Registry Sync', strong: 'Initialising' };
     const totalAcc = results.reduce((acc: number, r: any) => acc + (r.accuracy || 0), 0);
     return {
        accuracy: Math.round(totalAcc / results.length),
        time: Math.round(results.reduce((acc: number, r: any) => acc + (r.timeTaken || 0), 0) / results.length),
        weak: 'Mathematics',
        strong: 'Punjab GK'
     }
  }, [results]);

  const chartData = useMemo(() => {
     const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
     return days.map(d => ({ day: d, progress: Math.floor(Math.random() * 80) + 20 }));
  }, []);

  if (!mounted || authLoading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50/50 font-body text-left">
      <Navbar />
      <main className="container mx-auto px-4 md:px-8 py-8 md:py-16 max-w-7xl space-y-10 md:space-y-16">
        
        {/* TOP IDENTITY HUB */}
        <section className="bg-white p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-8 md:gap-12">
           <div className="relative shrink-0">
              <StudentAvatar profile={profile} className="h-20 w-20 md:h-40 md:w-40 rounded-[2rem] md:rounded-[3rem] border-4 border-slate-50 shadow-2xl" />
              <div className="absolute -bottom-2 -right-2 bg-primary h-8 w-8 md:h-12 md:w-12 rounded-xl flex items-center justify-center text-white shadow-xl border-4 border-white">
                 <ShieldCheck className="h-4 w-4 md:h-6 md:w-6" />
              </div>
           </div>
           <div className="flex-1 text-center md:text-left space-y-4 min-w-0">
              <div className="space-y-1">
                 <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight truncate leading-tight">{profile?.name || "Aspirant"}</h1>
                 <p className="text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-widest">{profile?.email}</p>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                 <Badge className="bg-primary text-white border-none font-bold text-[10px] px-4 py-1.5 rounded-full shadow-lg">{profile?.pass?.plan || 'Free'} Member</Badge>
                 <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-500 font-bold text-[10px] px-4 py-1.5 rounded-full">{stats.currentStreak} Day Streak 🔥</Badge>
                 <Badge variant="outline" className="bg-emerald-50 border-emerald-100 text-emerald-600 font-bold text-[10px] px-4 py-1.5 rounded-full">XP: 2,450</Badge>
              </div>
           </div>
           <Button asChild className="h-16 px-10 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[11px] tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 border-none">
              <Link href="/profile">Edit Profile <ChevronRight className="h-4 w-4 ml-2" /></Link>
           </Button>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-14">
           
           {/* PROGRESS ANALYTICS */}
           <div className="lg:col-span-8 space-y-8 md:space-y-14">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                 <MiniMetric label="Accuracy" val={`${performance.accuracy}%`} icon={<Target />} color="text-primary" bg="bg-blue-50" />
                 <MiniMetric label="Avg Time" val={`${Math.floor(performance.time / 60)}m`} icon={<Clock />} color="text-orange-500" bg="bg-orange-50" />
                 <MiniMetric label="Today's Time" val={formatStudyTime(stats.today)} icon={<Zap />} color="text-emerald-500" bg="bg-emerald-50" />
                 <MiniMetric label="Rank" val="#242" icon={<Trophy />} color="text-amber-500" bg="bg-amber-50" />
              </div>

              <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden border border-slate-100">
                 <CardHeader className="p-8 md:p-12 border-b border-slate-50 bg-slate-50/30 flex flex-row items-center justify-between">
                    <div>
                       <CardTitle className="text-xl md:text-2xl font-black text-[#0F172A]">Weekly Progress</CardTitle>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Study time distribution</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase px-3 py-1 rounded-lg">Real-time sync</Badge>
                 </CardHeader>
                 <CardContent className="p-8 md:p-12">
                    <div className="h-64 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                             <defs>
                                <linearGradient id="colorProg" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#1479FF" stopOpacity={0.1}/>
                                   <stop offset="95%" stopColor="#1479FF" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                             <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 700}} />
                             <YAxis hide />
                             <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                             <Area type="monotone" dataKey="progress" stroke="#1479FF" strokeWidth={4} fillOpacity={1} fill="url(#colorProg)" />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <PerformanceNode label="Strong Subjects" value={performance.strong} icon={<CheckCircle2 className="text-emerald-500" />} />
                 <PerformanceNode label="Weak Subjects" value={performance.weak} icon={<AlertCircle className="text-rose-500" />} />
              </div>
           </div>

           {/* SIDEBAR NODES */}
           <div className="lg:col-span-4 space-y-8 md:space-y-12">
              <Card className="border-none shadow-xl rounded-[2.5rem] bg-[#0F172A] text-white p-8 md:p-10 space-y-8 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:scale-110 transition-transform"><Activity className="h-64 w-64 text-primary" /></div>
                 <div className="relative z-10 space-y-8">
                    <div className="space-y-1">
                       <h3 className="text-2xl font-black tracking-tight">Milestones</h3>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Achieve for platform XP</p>
                    </div>
                    
                    <div className="space-y-4">
                       <MilestoneItem label="7 Day Streak" progress={Math.min(100, (stats.currentStreak / 7) * 100)} target="7 Days" />
                       <MilestoneItem label="10 Tests Taken" progress={Math.min(100, ((results?.length || 0) / 10) * 100)} target="10 Full" />
                       <MilestoneItem label="Master Punjab GK" progress={45} target="80% Accuracy" />
                    </div>
                    
                    <div className="pt-8 border-t border-white/5">
                       <Button asChild className="w-full h-14 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-2xl border-none active:scale-95">
                          <Link href="/leaderboard">View Leaderboard <ChevronRight className="ml-2 h-4 w-4" /></Link>
                       </Button>
                    </div>
                 </div>
              </Card>

              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
                 <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Certificates</h4>
                 <div className="h-40 flex flex-col items-center justify-center text-center opacity-30 italic">
                    <Award className="h-10 w-10 mb-4" />
                    <p className="text-[11px] font-bold">Complete a full series to unlock your first certificate.</p>
                 </div>
              </div>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function MiniMetric({ label, val, icon, color, bg }: any) {
   return (
      <div className="p-4 md:p-6 bg-white rounded-2xl md:rounded-[2rem] shadow-md border border-slate-50 flex flex-col gap-3 group hover:translate-y-[-4px] transition-all duration-300">
         <div className={cn("h-8 w-8 md:h-12 md:w-12 rounded-xl flex items-center justify-center shadow-inner", bg, color)}>
            {React.cloneElement(icon as React.ReactElement, { className: "h-4 w-4 md:h-5 md:w-5" })}
         </div>
         <div className="space-y-0.5">
            <p className="text-xl md:text-2xl font-black text-[#0F172A] tabular-nums">{val}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
         </div>
      </div>
   )
}

function PerformanceNode({ label, value, icon }: any) {
   return (
      <div className="p-6 md:p-10 bg-white rounded-[2.5rem] shadow-lg border border-slate-100 flex items-center gap-6 group hover:translate-x-1 transition-all duration-300">
         <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-slate-50 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-110 transition-transform">
            {icon}
         </div>
         <div className="min-w-0">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-2">{label}</p>
            <p className="text-lg md:text-xl font-bold text-[#0F172A] truncate">{value}</p>
         </div>
      </div>
   )
}

function MilestoneItem({ label, progress, target }: any) {
   return (
      <div className="space-y-2">
         <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
            <span className="text-slate-300">{label}</span>
            <span className="text-primary">{target}</span>
         </div>
         <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progress}%` }} />
         </div>
      </div>
   )
}
