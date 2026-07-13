'use client';

import React, { useState, useEffect } from 'react';
import { useUser, useStudySessions } from '@/hooks/useStudyAnalytics';
import { Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * @fileOverview High-Fidelity Study Timer v3.0.
 * Consumes data from the production Study Analytics Engine for absolute precision.
 */

const formatFullDuration = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return "00h 00m 00s";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

export default function LiveStudyTimer() {
    const { user } = useUser();
    const { stats, loading } = useStudySessions();
    const [liveSeconds, setLiveSeconds] = useState(0);

    // Local tick to provide instant feedback between Firestore syncs
    useEffect(() => {
       if (loading) return;
       setLiveSeconds(stats.today);

       const interval = setInterval(() => {
          setLiveSeconds(prev => prev + 1);
       }, 1000);

       return () => clearInterval(interval);
    }, [stats.today, loading]);

    if (!user) return null;

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 md:p-8 rounded-[2rem] shadow-xl text-left relative overflow-hidden group h-full flex flex-col justify-center transition-all hover:shadow-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 group-hover:scale-110 transition-transform">
                <Clock className="h-24 w-24" />
            </div>
            
            <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner animate-pulse">
                            <Zap className="h-5 w-5 fill-current" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Today's study</p>
                            <p className="text-xs font-bold text-emerald-600">Active Registry Node</p>
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    {loading ? (
                        <Skeleton className="h-12 w-48 bg-slate-50 rounded-xl" />
                    ) : (
                        <h2 className="text-4xl md:text-5xl font-black text-[#0F172A] dark:text-white tracking-tighter tabular-nums antialiased leading-none">
                            {formatFullDuration(liveSeconds)}
                        </h2>
                    )}
                </div>
            </div>
        </div>
    );
}
