'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, writeBatch, serverTimestamp, increment, onSnapshot } from 'firebase/firestore';
import { nanoid } from 'nanoid';

export type StudyContentType = 'MOCK' | 'PRACTICE' | 'SUBJECT' | 'PDF' | 'VIDEO' | 'OTHER' | 'DASHBOARD' | 'CA' | 'PYQ';

const INACTIVITY_THRESHOLD = 60 * 1000; // 60 seconds
const SYNC_INTERVAL = 30 * 1000; // 30 seconds

/**
 * Helper to calculate period identifiers for tracking resets.
 */
const getPeriodIds = (date: Date) => {
  const d = new Date(date);
  
  // Today: YYYY-MM-DD
  const today = d.toISOString().split('T')[0];
  
  // Week: Find the most recent Monday
  const day = d.getDay(); 
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  const week = monday.toISOString().split('T')[0];
  
  // Month: YYYY-MM
  const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  
  // Year: YYYY
  const year = `${date.getFullYear()}`;
  
  return { today, week, month, year };
};

/**
 * @fileOverview Institutional Real-Time Study Tracker v4.1.
 * FIXED: Implemented resilient multi-period sync using real-time cache to prevent overwriting stats.
 */
export function useStudyTracker(contentId: string | null, contentType: StudyContentType, enabled: boolean = true) {
  const { user } = useUser();
  const db = useFirestore();
  
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [unSyncedSeconds, setUnSyncedSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [remoteStats, setRemoteStats] = useState<any>(null);
  
  const sessionRef = useRef<{ sessionId: string | null; startTime: number | null; lastSyncTime: number; }>({
    sessionId: null,
    startTime: null,
    lastSyncTime: 0
  });

  const lastActivityRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Real-time stats listener to ensure we have the latest period markers before syncing
  useEffect(() => {
    if (!user || !db) return;
    const statsRef = doc(db, 'users', user.uid, 'study_statistics', 'all_time');
    return onSnapshot(statsRef, (snap) => {
      if (snap.exists()) setRemoteStats(snap.data());
    });
  }, [user, db]);

  const saveProgress = useCallback(async (durationToSync: number, isFinal = false) => {
    if (!db || !user || !sessionRef.current.sessionId || durationToSync <= 0) return;

    const { sessionId } = sessionRef.current;
    const now = new Date();
    const periods = getPeriodIds(now);

    try {
      const batch = writeBatch(db);
      const sessionDocRef = doc(db, 'users', user.uid, 'study_sessions', sessionId);
      const dailyAggRef = doc(db, 'users', user.uid, 'study_daily', periods.today);
      const userStatsRef = doc(db, 'users', user.uid, 'study_statistics', 'all_time');

      // 1. Log Session Activity
      batch.set(sessionDocRef, {
        sessionId,
        userId: user.uid,
        contentId: contentId || 'portal',
        contentType,
        duration: increment(durationToSync),
        updatedAt: serverTimestamp(),
        ...(isFinal ? { endTime: Date.now(), status: 'COMPLETED' } : { status: 'ACTIVE' })
      }, { merge: true });

      // 2. Log Daily Aggregate
      batch.set(dailyAggRef, {
        userId: user.uid,
        date: periods.today,
        totalDuration: increment(durationToSync),
        lastUpdated: serverTimestamp(),
      }, { merge: true });

      // 3. Multi-Period Statistical Hub
      const statsUpdate: any = {
        totalStudyTime: increment(durationToSync),
        lastSessionDate: serverTimestamp(),
        totalSessions: isFinal ? increment(1) : increment(0)
      };

      // Week Logic - Only reset if we are CERTAIN we have loaded the existing state and it differs
      if (remoteStats && remoteStats.lastWeekId && remoteStats.lastWeekId !== periods.week) {
        statsUpdate.thisWeekTime = durationToSync;
        statsUpdate.lastWeekId = periods.week;
      } else {
        statsUpdate.thisWeekTime = increment(durationToSync);
        if (!remoteStats?.lastWeekId) statsUpdate.lastWeekId = periods.week;
      }

      // Month Logic
      if (remoteStats && remoteStats.lastMonthId && remoteStats.lastMonthId !== periods.month) {
        statsUpdate.thisMonthTime = durationToSync;
        statsUpdate.lastMonthId = periods.month;
      } else {
        statsUpdate.thisMonthTime = increment(durationToSync);
        if (!remoteStats?.lastMonthId) statsUpdate.lastMonthId = periods.month;
      }

      // Year Logic
      if (remoteStats && remoteStats.lastYearId && remoteStats.lastYearId !== periods.year) {
        statsUpdate.thisYearTime = durationToSync;
        statsUpdate.lastYearId = periods.year;
      } else {
        statsUpdate.thisYearTime = increment(durationToSync);
        if (!remoteStats?.lastYearId) statsUpdate.lastYearId = periods.year;
      }

      batch.set(userStatsRef, statsUpdate, { merge: true });

      await batch.commit();
      
      setUnSyncedSeconds(0);
      window.dispatchEvent(new CustomEvent('study_progress_sync', { 
        detail: { duration: durationToSync, dayStr: periods.today } 
      }));

    } catch (error) {
      console.error('[StudyTracker] Period sync failure:', error);
    }
  }, [db, user, contentId, contentType, remoteStats]);

  const startSession = useCallback(async () => {
    if (!user || sessionRef.current.sessionId || !enabled || !db) return;

    const sid = nanoid();
    sessionRef.current = {
      sessionId: sid,
      startTime: Date.now(),
      lastSyncTime: Date.now()
    };
    setIsActive(true);
    setElapsedSeconds(0);
    setUnSyncedSeconds(0);
    lastActivityRef.current = Date.now();

    window.dispatchEvent(new CustomEvent('study_session_start', { 
      detail: { sessionId: sid, contentType } 
    }));
  }, [user, enabled, db, contentType]);

  const endSession = useCallback(async () => {
    if (!sessionRef.current.sessionId) return;
    
    const now = Date.now();
    const unSyncedDuration = Math.round((now - sessionRef.current.lastSyncTime) / 1000);

    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (unSyncedDuration > 0) {
      await saveProgress(unSyncedDuration, true);
    }
    
    sessionRef.current = { sessionId: null, startTime: null, lastSyncTime: 0 };
    setElapsedSeconds(0);
    setUnSyncedSeconds(0);
    
    window.dispatchEvent(new CustomEvent('study_session_end'));
  }, [saveProgress]);

  useEffect(() => {
    if (!enabled || !user || !db) return;

    startSession();

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivityRef.current;

      if (timeSinceActivity > INACTIVITY_THRESHOLD) {
        if (isActive) setIsActive(false);
        return;
      }

      if (!isActive) setIsActive(true);

      setElapsedSeconds(prev => prev + 1);
      setUnSyncedSeconds(prev => {
        const next = prev + 1;
        
        // Sync triggers every 30s
        if (next > 0 && next % 30 === 0) {
          const nowSync = Date.now();
          const duration = Math.round((nowSync - sessionRef.current.lastSyncTime) / 1000);
          if (duration > 0) {
            saveProgress(duration);
            sessionRef.current.lastSyncTime = nowSync;
          }
        }
        return next;
      });
    }, 1000);

    const activityHandler = () => {
      lastActivityRef.current = Date.now();
      if (!isActive) setIsActive(true);
    };

    const handleVisibility = () => {
       if (document.hidden) {
          setIsActive(false);
       } else {
          lastActivityRef.current = Date.now();
          setIsActive(true);
       }
    };

    window.addEventListener('mousemove', activityHandler);
    window.addEventListener('keydown', activityHandler);
    window.addEventListener('scroll', activityHandler);
    window.addEventListener('touchstart', activityHandler);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('mousemove', activityHandler);
      window.removeEventListener('keydown', activityHandler);
      window.removeEventListener('scroll', activityHandler);
      window.removeEventListener('touchstart', activityHandler);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (intervalRef.current) clearInterval(intervalRef.current);
      endSession();
    };
  }, [enabled, user, db, isActive, startSession, endSession, saveProgress]);

  return { elapsedSeconds, unSyncedSeconds, isActive };
}
