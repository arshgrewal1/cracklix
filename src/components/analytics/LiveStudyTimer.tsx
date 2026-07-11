'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';
import { Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Real-Time Study Stopwatch v2.1 (Full Detail).
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
    const db = useFirestore();
    
    const [liveIncrement, setLiveIncrement] = useState(0);
    const [todayBase, setTodayBase] = useState(0);
    const [isTracking, setIsTracking] = useState(false);

    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
    const dailyStatsRef = (user && db) ? doc(db, 'users', user.uid, 'study_daily', todayStr) : null;
    const [dailyStats, loadingDaily] = useDocumentData(dailyStatsRef);

    useEffect(() => {
        if (dailyStats) {
            setTodayBase(dailyStats.totalDuration || 0);
            setLiveIncrement(0);
        }
    }, [dailyStats]);

    useEffect(() => {
        const handleSync = (e: any) => {
            if (e.detail.dayStr === todayStr) {
                // Progress synced via dailyStats hook
            }
        };

        const handleStart = () => setIsTracking(true);
        const handleEnd = () => {
            setIsTracking(false);
            setLiveIncrement(0);
        };

        window.addEventListener('study_progress_sync', handleSync);
        window.addEventListener('study_session_start', handleStart);
        window.addEventListener('study_session_end', handleEnd);

        let ticker: NodeJS.Timeout;
        if (isTracking) {
            ticker = setInterval(() => {
                setLiveIncrement(prev => prev + 1);
            }, 1000);
        }

        return () => {
            window.removeEventListener('study_progress_sync', handleSync);
            window.removeEventListener('study_session_start', handleStart);
            window.removeEventListener('study_session_end', handleEnd);
            if (ticker) clearInterval(ticker);
        };
    }, [isTracking, todayStr]);

    const displayTotal = todayBase + liveIncrement;

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 md:p-8 rounded-[2rem] shadow-xl text-left relative overflow-hidden group h-full flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 group-hover:scale-110 transition-transform">
                <Clock className="h-24 w-24" />
            </div>
            
            <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                            isTracking ? "bg-emerald-50 text-emerald-500 animate-pulse" : "bg-slate-50 text-slate-300"
                        )}>
                            <Zap className="h-5 w-5 fill-current" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Today's study</p>
                            <p className="text-xs font-bold text-slate-500">{isTracking ? 'Active Session' : 'Registry Standby'}</p>
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    {loadingDaily && todayBase === 0 ? (
                        <div className="h-12 w-48 bg-slate-50 animate-pulse rounded-xl" />
                    ) : (
                        <h2 className="text-4xl md:text-5xl font-black text-[#0F172A] dark:text-white tracking-tighter tabular-nums antialiased leading-none">
                            {formatFullDuration(displayTotal)}
                        </h2>
                    )}
                </div>
            </div>
        </div>
    );
}
