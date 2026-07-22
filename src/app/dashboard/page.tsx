
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
  Loader2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import StudentAvatar from '@/components/brand/StudentAvatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudySessions } from '@/hooks/useStudyAnalytics';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

/**
 * @fileOverview Institutional performance hub v7.7 [Data Hardened].
 * FIXED: Removed random noise from chart data.
 */

// Formatting Utilities
const formatTime = (seconds: number) => {
  if (!seconds || seconds <= 0 || isNaN(seconds)) return "0m";
  if (seconds > 86400) return "0m";
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
    return query(collection(db, "results"), where("userId", "==", user.uid));
  }, [db, user, mounted]);

  const { data: results, loading: resultsLoading } = useCollection<any>(resultsQuery);

  const performance = useMemo(() => {
    if (!results || results.length === 0) {
      return { accuracy: 0, time: 0, totalCorrect: 0, totalAttempted: 0, rank: "0" };
    }

    let totalCorrect = 0;
    let totalAttempted = 0;
    let totalTime = 0;
    let validTimeEntries = 0;

    results.forEach((r: any) => {
      totalCorrect += (r.correctCount || 0);
      totalAttempted += (r.attemptedCount || 0);
      const t = Number(r.timeTaken);
      if (!isNaN(t) && t > 0 && t < 43200) {
        totalTime += t;
        validTimeEntries++;
      }
    });

    const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
    const avgTime = validTimeEntries > 0 ? totalTime / validTimeEntries : 0;

    return {
      accuracy,
      time: avgTime,
      totalCorrect,
      totalAttempted,
      rank: results.length.toString()
    };
  }, [results]);

  const chartData = useMemo(() => {
    if (!results || results.length === 0) return [];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((d, i) => ({ day: d, progress: 0 })); // Initialized to zero
  }, [results]);

  if (!mounted || authLoading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-left selection:bg-primary/10">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-8 py-8 md:py-16 max-w-7xl space-y-8 md:space-y-12">
        
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col md:flex-row items-center gap-8 md:gap-12"
        >
          <div className="relative shrink-0">
            <StudentAvatar profile={profile} className="h-24 w-24 md:h-44 md:w-44 rounded-[2.5rem] md:rounded-[3.5rem] border-4 border-slate-50 shadow-2xl" />
            <div className="absolute -bottom-2 -right-2 bg-primary h-8 w-8 md:h-12 md:w-12 rounded-xl flex items-center justify-center text-white shadow-xl border-4 border-white">
              <ShieldCheck className="h-4 w-4 md:h-6 md:w-6" />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4 min-w-0">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-6xl font-black text-[#0F172A] tracking-tighter leading-none antialiased">
                {profile?.name || "Aspirant"}
              </h1>
              <p className="text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-[0.3em]">{profile?.email}</p>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <Badge className="bg-primary/10 text-primary border-none font-bold text-[10px] px-4 py-1.5 rounded-full">
                {profile?.pass?.plan || 'Free'} member
              </Badge>
              <Badge variant="outline" className="bg-white border-slate-100 text-slate-500 font-bold text-[10px] px-4 py-1.5 rounded-full shadow-sm">
                🔥 {stats.currentStreak} day streak
              </Badge>
              <Badge variant="outline" className="bg-emerald-50 border-emerald-100 text-emerald-600 font-bold text-[10px] px-4 py-1.5 rounded-full">
                Total tests: {results?.length || 0}
              </Badge>
            </div>
          </div>

          <Button asChild className="h-14 md:h-16 px-10 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[10px] md:text-xs tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 border-none">
            <Link href="/profile">Edit profile <ChevronRight className="h-4 w-4 ml-2" /></Link>
          </Button>
        </motion.section>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
          <MetricPill 
            label="Accuracy" 
            val={`${performance.accuracy}%`} 
            icon={<Target />} 
            color="text-primary" 
            bg="bg-blue-50" 
            progress={performance.accuracy}
          />
          <MetricPill 
            label="Avg time" 
            val={formatTime(performance.time)} 
            icon={<Clock />} 
            color="text-orange-500" 
            bg="bg-orange-50" 
          />
          <MetricPill 
            label="Today's study" 
            val={formatTime(stats.today)} 
            icon={<Zap />} 
            color="text-emerald-500" 
            bg="bg-emerald-50" 
          />
          <MetricPill 
            label="Solved questions" 
            val={performance.totalCorrect.toLocaleString()} 
            icon={<Trophy />} 
            color="text-amber-500" 
            bg="bg-amber-50" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
          <div className="lg:col-span-8 space-y-8 md:space-y-12">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden border border-slate-100">
              <CardHeader className="p-8 md:p-12 border-b border-slate-50 bg-slate-50/30 flex flex-row items-center justify-between">
                <div className="text-left">
                  <CardTitle className="text-xl md:text-3xl font-black text-[#0F172A] tracking-tight">Performance Flow</CardTitle>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Practice consistency index</p>
                </div>
                <Badge className="bg-primary text-white border-none text-[9px] font-black uppercase px-3 py-1 rounded-lg shadow-lg">Live sync</Badge>
              </CardHeader>
              <CardContent className="p-8 md:p-12">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorProg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 700}} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                      <Area type="monotone" dataKey="progress" stroke="#2563EB" strokeWidth={4} fillOpacity={1} fill="url(#colorProg)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <InsightNode label="Activity hub" value={`${results?.length || 0} tests taken`} icon={<CheckCircle2 className="text-emerald-500" />} />
              <InsightNode label="Mastery level" value={performance.accuracy > 70 ? "Advanced" : "Learner"} icon={<AlertCircle className="text-blue-500" />} />
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 md:space-y-10">
            <Card className="border-none shadow-2xl rounded-[2.5rem] bg-[#0F172A] text-white p-8 md:p-10 space-y-8 relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000">
                <Activity className="h-64 w-64 text-primary" />
              </div>
              <div className="relative z-10 space-y-8 text-left">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black tracking-tight leading-none uppercase">Milestones</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Platform rewards</p>
                </div>
                
                <div className="space-y-6">
                  <MilestoneItem label="7 day streak" progress={Math.min(100, (stats.currentStreak / 7) * 100)} target={`${stats.currentStreak}/7`} />
                  <MilestoneItem label="Overall accuracy" progress={performance.accuracy} target={`${performance.accuracy}%`} />
                  <MilestoneItem label="Exam consistency" progress={Math.min(100, (results?.length || 0) * 10)} target={`${results?.length || 0}/10`} />
                </div>
                
                <div className="pt-6 border-t border-white/5">
                  <Button asChild className="w-full h-14 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-2xl border-none active:scale-95 transition-all">
                    <Link href="/leaderboard">Merit rankings <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </div>
            </Card>

            <div className="p-8 md:p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6 text-left group hover:translate-y-[-4px] transition-all duration-500">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Certificates</h4>
              <div className="h-40 flex flex-col items-center justify-center text-center opacity-30 italic">
                <Award className="h-10 w-10 mb-4" />
                <p className="text-[11px] font-bold uppercase tracking-tight">Syncing milestones...</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function MetricPill({ label, val, icon, color, bg, progress }: any) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="p-5 md:p-8 bg-white rounded-[2rem] shadow-lg border border-slate-50 flex flex-col gap-4 text-left group transition-all duration-300"
    >
      <div className={cn("h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center shadow-inner", bg, color)}>
        {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 md:h-6 md:w-6" })}
      </div>
      
      <div className="space-y-0.5">
        <p className="text-xl md:text-3xl font-black text-[#0F172A] tabular-nums tracking-tighter leading-none">{val}</p>
        <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</p>
      </div>

      {progress !== undefined && (
        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
          <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
      )}
    </motion.div>
  );
}

function InsightNode({ label, value, icon }: any) {
  return (
    <Card className="p-6 md:p-10 rounded-[2.5rem] shadow-xl bg-white border border-slate-100 flex items-center gap-6 group hover:translate-x-1 transition-all duration-300">
      <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-slate-50 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="min-w-0 text-left">
        <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] leading-none mb-2">{label}</p>
        <p className="text-lg md:text-xl font-bold text-[#0F172A] truncate tracking-tight">{value}</p>
      </div>
    </Card>
  );
}

function MilestoneItem({ label, progress, target }: any) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
        <span className="text-slate-400">{label}</span>
        <span className="text-primary">{target}</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="h-full bg-primary shadow-[0_0_15px_rgba(37,99,235,0.5)]"
        />
      </div>
    </div>
  );
}
