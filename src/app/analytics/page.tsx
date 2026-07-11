'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useUser, useFirestore } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Zap, Clock, Calendar, TrendingUp, BarChart2, Star } from 'lucide-react';
import LiveStudyTimer from '@/components/analytics/LiveStudyTimer';
import { useStudyTracker } from '@/hooks/useStudyTracker';

const formatDuration = (seconds: number): string => {
    if (typeof seconds !== 'number' || seconds < 0) return '0m 00s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
    if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`;
    return `0m ${String(s).padStart(2, '0')}s`;
};

/**
 * @fileOverview Institutional Analytics Hub v2.0 (Live Updates).
 */
export default function AnalyticsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  const [baseStats, setBaseStats] = useState({ today: 0, lifetime: 0, totalSessions: 0 });

  // Page tracking
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
              title="Lifetime study" 
              value={formatDuration(baseStats.lifetime + elapsedSeconds)}
              icon={BarChart2} 
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

          <StatCard title="Current streak" value="--" icon={Star} color="rose" loading={true} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, loading }: any) {
  return (
    <div className="bg-white dark:bg-slate-800/50 p-6 md:p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between group">
      <div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-inner transition-transform group-hover:scale-110",
          color === 'indigo' ? "bg-indigo-50 text-indigo-500" : 
          color === 'amber' ? "bg-amber-50 text-amber-500" : "bg-rose-50 text-rose-500"
        )}>
          <Icon className="w-6 h-6" />
        </div>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{title}</p>
        {loading ? (
          <div className="h-8 w-3/4 bg-slate-50 animate-pulse rounded-lg mt-2" />
        ) : (
          <p className="text-3xl font-black text-[#0F172A] dark:text-white tabular-nums">{value}</p>
        )}
      </div>
    </div>
  );
}
