'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, writeBatch, serverTimestamp, increment, onSnapshot, getDoc } from 'firebase/firestore';
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
 * @fileOverview Institutional Real-Time Study Tracker v4.2.
 * FIXED: Resilient multi-period sync using internal Refs to prevent effect churn.
 * FIXED: Atomic initialization of periodic counters to prevent zero-value bugs.
 */
export function useStudyTracker(contentId: string | null, contentType: StudyContentType, enabled: boolean = true) {
  const { user } = useUser();
  const db = useFirestore();
  
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [unSyncedSeconds, setUnSyncedSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  // Use Refs for state that shouldn't trigger effect re-runs but is needed for sync
  const remoteStatsRef = useRef<any>(null);
  const sessionRef = useRef<{ sessionId: string | null; startTime: number | null; lastSyncTime: number; }>({
    sessionId: null,
    startTime: null,
    lastSyncTime: 0
  });

  const lastActivityRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Real-time stats listener (Stable background sync)
  useEffect(() => {
    if (!user || !db) return;
    const statsRef = doc(db, 'users', user.uid, 'study_statistics', 'all_time');
    const unsub = onSnapshot(statsRef, (snap) => {
      if (snap.exists()) {
        remoteStatsRef.current = snap.data();
      }
    });
    return () => unsub();
  }, [user, db]);

  const saveProgress = useCallback(async (durationToSync: number, isFinal = false) => {
    if (!db || !user || !sessionRef.current.sessionId || durationToSync <= 0) return;

    const { sessionId } = sessionRef.current;
    const now = new Date();
    const periods = getPeriodIds(now);
    const remote = remoteStatsRef.current;

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

      // Week Reset/Sync Logic
      if (remote && remote.lastWeekId && remote.lastWeekId !== periods.week) {
        statsUpdate.thisWeekTime = durationToSync;
        statsUpdate.lastWeekId = periods.week;
      } else {
        statsUpdate.thisWeekTime = increment(durationToSync);
        if (!remote?.lastWeekId) statsUpdate.lastWeekId = periods.week;
      }

      // Month Reset/Sync Logic
      if (remote && remote.lastMonthId && remote.lastMonthId !== periods.month) {
        statsUpdate.thisMonthTime = durationToSync;
        statsUpdate.lastMonthId = periods.month;
      } else {
        statsUpdate.thisMonthTime = increment(durationToSync);
        if (!remote?.lastMonthId) statsUpdate.lastMonthId = periods.month;
      }

      // Year Reset/Sync Logic
      if (remote && remote.lastYearId && remote.lastYearId !== periods.year) {
        statsUpdate.thisYearTime = durationToSync;
        statsUpdate.lastYearId = periods.year;
      } else {
        statsUpdate.thisYearTime = increment(durationToSync);
        if (!remote?.lastYearId) statsUpdate.lastYearId = periods.year;
      }

      batch.set(userStatsRef, statsUpdate, { merge: true });

      await batch.commit();
      setUnSyncedSeconds(0);
      
    } catch (error) {
      console.error('[StudyTracker] Atomic sync failure:', error);
    }
  }, [db, user, contentId, contentType]);

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
  }, [user, enabled, db]);

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
        
        // Internal auto-sync every 30 seconds
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
  }, [enabled, user, db]); // Removed complex dependencies to stabilize interval

  return { elapsedSeconds, unSyncedSeconds, isActive };
}
