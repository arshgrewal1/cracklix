'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';
import { Clock } from 'lucide-react';

const formatLiveDuration = (seconds: number): string => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}h ${m}m ${s}s`;
};

export default function LiveStudyTimer() {
    const { user } = useUser();
    const db = useFirestore();
    const [totalToday, setTotalToday] = useState(0);
    const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

    const todayStr = new Date().toISOString().split('T')[0];
    const dailyStatsRef = user ? doc(db, 'users', user.uid, 'study_daily', todayStr) : null;
    const [dailyStats, loadingDaily] = useDocumentData(dailyStatsRef);

    // Listen for the start of a new session from anywhere in the app
    useEffect(() => {
        const handleSessionStart = (event: CustomEvent) => {
            setSessionStartTime(event.detail.startTime);
        };
        const handleSessionEnd = () => {
            setSessionStartTime(null);
        };

        window.addEventListener('studySessionStart', handleSessionStart as EventListener);
        window.addEventListener('studySessionEnd', handleSessionEnd as EventListener);

        return () => {
            window.removeEventListener('studySessionStart', handleSessionStart as EventListener);
            window.removeEventListener('studySessionEnd', handleSessionEnd as EventListener);
        };
    }, []);

    // Update total time and live timer
    useEffect(() => {
        if (dailyStats) {
            setTotalToday(dailyStats.totalDuration || 0);
        }

        if (sessionStartTime) {
            const interval = setInterval(() => {
                const liveDuration = Math.round((Date.now() - sessionStartTime) / 1000);
                setTotalToday((dailyStats?.totalDuration || 0) + liveDuration);
            }, 1000);

            return () => clearInterval(interval);
        } 
    }, [dailyStats, sessionStartTime]);

    return (
        <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Today&apos;s Live Study</h3>
                {sessionStartTime && <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>}
            </div>
            {loadingDaily ? (
                <div className="h-12 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
            ) : (
                <p className="text-4xl font-bold text-slate-900 dark:text-white">{formatLiveDuration(totalToday)}</p>
            )}
        </div>
    );
}
