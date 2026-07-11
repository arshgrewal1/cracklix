'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, writeBatch, serverTimestamp, increment } from 'firebase/firestore';
import { nanoid } from 'nanoid';

export type StudyContentType = 'MOCK' | 'PRACTICE' | 'SUBJECT' | 'PDF' | 'VIDEO' | 'OTHER' | 'DASHBOARD' | 'CA' | 'PYQ';

const INACTIVITY_THRESHOLD = 60 * 1000; // 60 seconds
const SYNC_INTERVAL = 30 * 1000; // 30 seconds

/**
 * @fileOverview Institutional Real-Time Study Tracker v3.0.
 * FIXED: Local ticker for live UI updates and robust inactivity handling.
 */
export function useStudyTracker(contentId: string | null, contentType: StudyContentType, enabled: boolean = true) {
  const { user } = useUser();
  const db = useFirestore();
  
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  const sessionRef = useRef<{ sessionId: string | null; startTime: number | null; lastSyncTime: number; }>({
    sessionId: null,
    startTime: null,
    lastSyncTime: 0
  });

  const lastActivityRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const saveProgress = useCallback(async (durationToSync: number, isFinal = false) => {
    if (!db || !user || !sessionRef.current.sessionId || durationToSync <= 0) return;

    const { sessionId } = sessionRef.current;
    const today = new Date();
    const dayStr = today.toISOString().split('T')[0];

    try {
      const batch = writeBatch(db);
      const sessionDocRef = doc(db, 'users', user.uid, 'study_sessions', sessionId);
      const dailyAggRef = doc(db, 'users', user.uid, 'study_daily', dayStr);
      const userStatsRef = doc(db, 'users', user.uid, 'study_statistics', 'all_time');

      batch.set(sessionDocRef, {
        sessionId,
        userId: user.uid,
        contentId: contentId || 'portal',
        contentType,
        duration: increment(durationToSync),
        updatedAt: serverTimestamp(),
        ...(isFinal ? { endTime: Date.now(), status: 'COMPLETED' } : { status: 'ACTIVE' })
      }, { merge: true });

      batch.set(dailyAggRef, {
        userId: user.uid,
        date: dayStr,
        totalDuration: increment(durationToSync),
        lastUpdated: serverTimestamp(),
      }, { merge: true });

      batch.set(userStatsRef, {
        totalStudyTime: increment(durationToSync),
        lastSessionDate: serverTimestamp(),
        totalSessions: isFinal ? increment(1) : increment(0)
      }, { merge: true });

      await batch.commit();
      
      // Dispatch global event for other components to update UI live
      window.dispatchEvent(new CustomEvent('study_progress_sync', { 
        detail: { duration: durationToSync, dayStr } 
      }));

    } catch (error) {
      console.error('[StudyTracker] Sync failure:', error);
    }
  }, [db, user, contentId, contentType]);

  const startSession = useCallback(() => {
    if (!user || sessionRef.current.sessionId || !enabled) return;

    const sid = nanoid();
    sessionRef.current = {
      sessionId: sid,
      startTime: Date.now(),
      lastSyncTime: Date.now()
    };
    setIsActive(true);
    lastActivityRef.current = Date.now();

    window.dispatchEvent(new CustomEvent('study_session_start', { 
      detail: { sessionId: sid, contentType } 
    }));
  }, [user, enabled, contentType]);

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
    
    window.dispatchEvent(new CustomEvent('study_session_end'));
  }, [saveProgress]);

  useEffect(() => {
    if (!enabled || !user) return;

    startSession();

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivityRef.current;

      if (timeSinceActivity > INACTIVITY_THRESHOLD) {
        if (isActive) setIsActive(false);
        return;
      }

      if (!isActive) setIsActive(true);

      // Increment local UI state
      setElapsedSeconds(prev => {
        const next = prev + 1;
        
        // Throttled sync every 30s
        if (next > 0 && next % 30 === 0) {
          const nowSync = Date.now();
          const unSynced = Math.round((nowSync - sessionRef.current.lastSyncTime) / 1000);
          if (unSynced > 0) {
            saveProgress(unSynced);
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
  }, [enabled, user, isActive, startSession, endSession, saveProgress]);

  return { elapsedSeconds, isActive };
}
