'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useUser, useFirestore } from '@/firebase';
import { Zap, Clock, Calendar, TrendingUp, BarChart2, Star, Activity, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useStudySessions } from '@/hooks/useStudyAnalytics';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Official Study Analytics Center v3.0.
 * Rebuilt to use the session-based Study Analytics Engine.
 */

const formatStudyTime = (seconds: number) => {
  if (isNaN(seconds) || seconds <= 0) return "0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const formatFullDuration = (seconds: number) => {
  if (isNaN(seconds) || seconds <= 0) return "00h 00m 00s";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

export default function AnalyticsPage() {
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const { stats, loading } = useStudySessions();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-body text-left">
      <Navbar />
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        <header className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] dark:text-white tracking-tight leading-none">Study Analytics</h1>
          <p className="mt-4 text-lg text-slate-500 font-medium">Your learning journey, synchronized in real-time.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          
          <Card className="lg:col-span-2 xl:col-span-2 p-6 md:p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl flex flex-col justify-center">
             <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                   <Clock className="h-6 w-6" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Today's study</p>
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Active Ingestion</p>
                </div>
             </div>
             {loading ? (
                <Skeleton className="h-12 w-48 bg-slate-50 rounded-xl" />
             ) : (
                <h2 className="text-4xl md:text-6xl font-black text-[#0F172A] tracking-tighter tabular-nums">
                   {formatFullDuration(stats.today)}
                </h2>
             )}
          </Card>

          <div className="lg:col-span-1">
            <StatCard 
              title="🔥 Lifetime study" 
              value={`${Math.floor(stats.lifetime / 3600)}h ${Math.floor((stats.lifetime % 3600) / 60)}m`}
              icon={Activity} 
              color="indigo" 
              loading={loading}
            />
           </div>

          <StatCard 
            title="Total sessions" 
            value={stats.totalSessions}
            icon={TrendingUp} 
            color="amber"
            loading={loading}
          />

          <div className="col-span-full grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 mt-4">
             <PeriodCard label="This Week" val={stats.week} icon={Calendar} color="blue" loading={loading} />
             <PeriodCard label="This Month" val={stats.month} icon={Clock} color="emerald" loading={loading} />
             <PeriodCard label="This Year" val={stats.year} icon={Zap} color="purple" loading={loading} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function PeriodCard({ label, val, icon: Icon, color, loading }: any) {
  return (
    <Card className="p-6 md:p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl flex items-center justify-between">
      <div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
          {loading ? (
             <Skeleton className="h-8 w-24 bg-slate-50 mt-1" />
          ) : (
             <p className="text-2xl md:text-3xl font-black text-[#0F172A]">{formatStudyTime(val)}</p>
          )}
      </div>
      <div className={cn(
        "h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner",
        color === 'blue' ? "bg-blue-50 text-blue-500" :
        color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
        "bg-purple-50 text-purple-500"
      )}>
          <Icon className="h-6 w-6" />
      </div>
    </Card>
  )
}

function StatCard({ title, value, icon: Icon, color, loading }: any) {
  return (
    <div className="bg-white dark:bg-slate-800/50 p-6 md:p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between group h-full">
      <div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-inner transition-all group-hover:scale-110",
          color === 'indigo' ? "bg-indigo-50 text-indigo-500" : 
          color === 'amber' ? "bg-amber-50 text-amber-500" : "bg-rose-50 text-rose-500"
        )}>
          <Icon className="w-6 h-6" />
        </div>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{title}</p>
        {loading ? (
          <div className="h-8 w-3/4 bg-slate-50 animate-pulse rounded-lg mt-2" />
        ) : (
          <p className="text-xl md:text-2xl font-black text-[#0F172A] dark:text-white tabular-nums tracking-tighter">{value}</p>
        )}
      </div>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-muted rounded", className)} />;
}
