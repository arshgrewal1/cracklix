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
 * Uses local time components to align with user expectations.
 */
const getPeriodIds = (date: Date) => {
  const d = new Date(date);
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  
  // Weekly reset (Monday)
  const day = d.getDay(); 
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  const week = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
  
  const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  const year = `${d.getFullYear()}`;
  return { today, week, month, year };
};

/**
 * @fileOverview Institutional Real-Time Study Tracker v5.0.
 * FIXED: isServerSynced guard prevents cache-induced resets.
 * FIXED: Local time period IDs align with user's clock.
 */
export function useStudyTracker(contentId: string | null, contentType: StudyContentType, enabled: boolean = true) {
  const { user } = useUser();
  const db = useFirestore();
  
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [unSyncedSeconds, setUnSyncedSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  const isServerSynced = useRef(false);
  const remoteStatsRef = useRef<any>(null);
  const sessionRef = useRef<{ sessionId: string | null; startTime: number | null; lastSyncTime: number; }>({
    sessionId: null,
    startTime: null,
    lastSyncTime: 0
  });

  const lastActivityRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Real-time stats listener with Cache Guard
  useEffect(() => {
    if (!user || !db) return;
    const statsRef = doc(db, 'users', user.uid, 'study_statistics', 'all_time');
    
    const unsub = onSnapshot(statsRef, { includeMetadataChanges: true }, (snap) => {
      if (snap.exists()) {
        const fromCache = snap.metadata.fromCache;
        if (!fromCache) {
          isServerSynced.current = true;
          remoteStatsRef.current = snap.data();
        } else if (!remoteStatsRef.current) {
          // Allow initial cache load for UI but don't mark as server synced
          remoteStatsRef.current = snap.data();
        }
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
    const serverReady = isServerSynced.current;

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

      // 3. Statistical Hub Updates
      const statsUpdate: any = {
        totalStudyTime: increment(durationToSync),
        lastSessionDate: serverTimestamp(),
        totalSessions: isFinal ? increment(1) : increment(0)
      };

      // PERIODIC RESET LOGIC - ONLY TRIGGER IF SERVER VERIFIED
      if (serverReady && remote) {
        // Week Check
        if (remote.lastWeekId && remote.lastWeekId !== periods.week) {
          statsUpdate.thisWeekTime = durationToSync;
          statsUpdate.lastWeekId = periods.week;
        } else {
          statsUpdate.thisWeekTime = increment(durationToSync);
          if (!remote.lastWeekId) statsUpdate.lastWeekId = periods.week;
        }

        // Month Check
        if (remote.lastMonthId && remote.lastMonthId !== periods.month) {
          statsUpdate.thisMonthTime = durationToSync;
          statsUpdate.lastMonthId = periods.month;
        } else {
          statsUpdate.thisMonthTime = increment(durationToSync);
          if (!remote.lastMonthId) statsUpdate.lastMonthId = periods.month;
        }

        // Year Check
        if (remote.lastYearId && remote.lastYearId !== periods.year) {
          statsUpdate.thisYearTime = durationToSync;
          statsUpdate.lastYearId = periods.year;
        } else {
          statsUpdate.thisYearTime = increment(durationToSync);
          if (!remote.lastYearId) statsUpdate.lastYearId = periods.year;
        }
      } else {
        // Fallback to safe incremental updates if server data is pending
        statsUpdate.thisWeekTime = increment(durationToSync);
        statsUpdate.thisMonthTime = increment(durationToSync);
        statsUpdate.thisYearTime = increment(durationToSync);
      }

      batch.set(userStatsRef, statsUpdate, { merge: true });

      await batch.commit();
      setUnSyncedSeconds(0);
      
    } catch (error) {
      console.error('[StudyTracker] Sync failure:', error);
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
    const duration = Math.round((now - sessionRef.current.lastSyncTime) / 1000);
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (duration > 0) await saveProgress(duration, true);
    sessionRef.current = { sessionId: null, startTime: null, lastSyncTime: 0 };
  }, [saveProgress]);

  useEffect(() => {
    if (!enabled || !user || !db) return;
    startSession();

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      if (now - lastActivityRef.current > INACTIVITY_THRESHOLD) {
        if (isActive) setIsActive(false);
        return;
      }

      if (!isActive) setIsActive(true);
      setElapsedSeconds(prev => prev + 1);
      setUnSyncedSeconds(prev => {
        const next = prev + 1;
        if (next > 0 && next % 30 === 0) {
          const syncNow = Date.now();
          const dur = Math.round((syncNow - sessionRef.current.lastSyncTime) / 1000);
          if (dur > 0) {
            saveProgress(dur);
            sessionRef.current.lastSyncTime = syncNow;
          }
        }
        return next;
      });
    }, 1000);

    const activity = () => { lastActivityRef.current = Date.now(); if (!isActive) setIsActive(true); };
    window.addEventListener('mousemove', activity);
    window.addEventListener('keydown', activity);
    window.addEventListener('scroll', activity);
    window.addEventListener('touchstart', activity);

    return () => {
      window.removeEventListener('mousemove', activity);
      window.removeEventListener('keydown', activity);
      window.removeEventListener('scroll', activity);
      window.removeEventListener('touchstart', activity);
      if (intervalRef.current) clearInterval(intervalRef.current);
      endSession();
    };
  }, [enabled, user, db, startSession, endSession, saveProgress, isActive]);

  return { elapsedSeconds, unSyncedSeconds, isActive };
}
