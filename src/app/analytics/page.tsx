'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useUser, useFirestore } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Zap, Clock, Calendar, TrendingUp, BarChart2, Star, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import LiveStudyTimer from '@/components/analytics/LiveStudyTimer';
import { useStudyTracker } from '@/hooks/useStudyTracker';
import { cn } from '@/lib/utils';

const formatFullDuration = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return "00h 00m 00s";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

const formatConciseDuration = (seconds: number) => {
  if (isNaN(seconds) || seconds <= 0) return "0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function AnalyticsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  const [baseStats, setBaseStats] = useState({ today: 0, lifetime: 0, totalSessions: 0 });

  const { elapsedSeconds } = useStudyTracker('analytics', 'OTHER');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!db || !user || !mounted) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const dailyRef = doc(db, 'users', user.uid, 'study_daily', todayStr);
    const statsRef = doc(db, 'users', user.uid, 'study_statistics', 'all_time');

    const unsubDaily = onSnapshot(dailyRef, (snap) => {
      if (snap.exists()) setBaseStats(prev => ({ ...prev, today: snap.data().totalDuration || 0 }));
    });

    const unsubStats = onSnapshot(statsRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setBaseStats(prev => ({ 
          ...prev, 
          lifetime: data.totalStudyTime || 0,
          totalSessions: data.totalSessions || 0 
        }));
      }
    });

    return () => {
      unsubDaily();
      unsubStats();
    };
  }, [db, user, mounted]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-body text-left">
      <Navbar />
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        <header className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] dark:text-white tracking-tight leading-none">Study Analytics</h1>
          <p className="mt-4 text-lg text-slate-500 font-medium">Your learning journey, synchronized in real-time.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          
          <div className="lg:col-span-2 xl:col-span-2">
            <LiveStudyTimer />
          </div>

          <div className="lg:col-span-1">
            <StatCard 
              title="🔥 Lifetime study" 
              value={formatFullDuration(baseStats.lifetime + elapsedSeconds)}
              icon={Activity} 
              color="indigo" 
              loading={!mounted}
            />
           </div>

          <StatCard 
            title="Total sessions" 
            value={baseStats.totalSessions}
            icon={TrendingUp} 
            color="amber"
            loading={!mounted}
          />

          <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 mt-4">
             <Card className="p-6 md:p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Today</p>
                   <p className="text-2xl md:text-3xl font-black text-[#0F172A]">{formatConciseDuration(baseStats.today + elapsedSeconds)}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner">
                   <Clock className="h-6 w-6" />
                </div>
             </Card>
             <Card className="p-6 md:p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Week</p>
                   <p className="text-2xl md:text-3xl font-black text-[#0F172A]">{formatConciseDuration(baseStats.today + elapsedSeconds)}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shadow-inner">
                   <Calendar className="h-6 w-6" />
                </div>
             </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
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