'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudyTracker } from '@/hooks/useStudyTracker';

/**
 * @fileOverview Real-Time Study Stopwatch v2.2 (Full Detail).
 * FIXED: Combined with useStudyTracker for consistent live updates.
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
    const [todayBase, setTodayBase] = useState(0);
    const [loading, setLoading] = useState(true);

    const { unSyncedSeconds, isActive } = useStudyTracker('timer-hub', 'OTHER');

    useEffect(() => {
        if (!db || !user) return;

        const todayStr = new Date().toISOString().split('T')[0];
        const dailyRef = doc(db, 'users', user.uid, 'study_daily', todayStr);

        const unsub = onSnapshot(dailyRef, (snap) => {
            if (snap.exists()) {
                setTodayBase(snap.data().totalDuration || 0);
            }
            setLoading(false);
        });

        return () => unsub();
    }, [db, user]);

    const displayTotal = todayBase + unSyncedSeconds;

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
                            isActive ? "bg-emerald-50 text-emerald-500 animate-pulse" : "bg-slate-50 text-slate-300"
                        )}>
                            <Zap className="h-5 w-5 fill-current" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Today's study</p>
                            <p className="text-xs font-bold text-slate-500">{isActive ? 'Active Session' : 'Registry Standby'}</p>
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    {loading && todayBase === 0 ? (
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
