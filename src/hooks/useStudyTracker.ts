'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, writeBatch, serverTimestamp, getDoc, increment } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { Capacitor } from '@capacitor/core';
import { App, AppState } from '@capacitor/app';

// Define the types for the study tracker
export type StudyContentType = 'MOCK' | 'PRACTICE' | 'SUBJECT' | 'PDF' | 'VIDEO' | 'OTHER';

export interface StudySession {
  sessionId: string;
  userId: string;
  contentId: string;
  contentType: StudyContentType;
  startTime: number; // UTC timestamp
  endTime: number; // UTC timestamp
  duration: number; // in seconds
}

/**
 * @fileoverview Core Study Tracking Hook v1.1
 * @description This hook is the heart of the study analytics system.
 * It now dispatches custom events for real-time UI updates.
 */
export function useStudyTracker(contentId: string | null, contentType: StudyContentType, enabled: boolean = true) {
  const { user } = useUser();
  const db = useFirestore();
  const [isTracking, setIsTracking] = useState(false);
  const sessionRef = useRef<{ sessionId: string | null; startTime: number | null; }>({
    sessionId: null,
    startTime: null,
  });

  const endSession = useCallback(async (isAppClosing = false) => {
    if (!db || !user || !sessionRef.current.sessionId || !sessionRef.current.startTime) {
      return;
    }

    const { sessionId, startTime } = sessionRef.current;
    
    // Reset state immediately to prevent duplicate sessions
    sessionRef.current = { sessionId: null, startTime: null };
    setIsTracking(false);
    window.dispatchEvent(new CustomEvent('studySessionEnd'));

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    // Ignore short sessions (less than 10s) to reduce noise, unless the app is closing.
    if (duration < 10 && !isAppClosing) {
      console.log(`[StudyTracker] Session ignored (duration < 10s): ${duration}s`);
      return;
    }

    console.log(`[StudyTracker] Ending session. ID: ${sessionId}, Duration: ${duration}s`);

    const sessionData: StudySession = {
      sessionId,
      userId: user.uid,
      contentId: contentId || 'unknown',
      contentType,
      startTime,
      endTime,
      duration,
    };
    
    try {
        const batch = writeBatch(db);

        // 1. Save the individual session document
        const sessionDocRef = doc(db, 'users', user.uid, 'study_sessions', sessionId);
        batch.set(sessionDocRef, { ...sessionData, createdAt: serverTimestamp() });

        // 2. Update daily aggregate
        const today = new Date();
        const dayStr = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split('T')[0]; // YYYY-MM-DD
        const dailyAggRef = doc(db, 'users', user.uid, 'study_daily', dayStr);

        batch.set(dailyAggRef, {
            userId: user.uid,
            date: dayStr,
            totalDuration: increment(duration),
            sessionCount: increment(1),
            lastUpdated: serverTimestamp(),
        }, { merge: true });

        // 3. Update overall user stats
        const userStatsRef = doc(db, 'users', user.uid, 'study_statistics', 'all_time');
        batch.set(userStatsRef, {
            totalStudyTime: increment(duration),
            totalSessions: increment(1),
            lastSessionDate: serverTimestamp(),
        }, { merge: true });
        
        await batch.commit();
        console.log(`[StudyTracker] Session ${sessionId} and aggregates saved successfully.`);

    } catch (error) {
        console.error('[StudyTracker] Failed to save session:', error);
        try {
          const fallbackKey = `studySession_${sessionId}`;
          localStorage.setItem(fallbackKey, JSON.stringify(sessionData));
          console.warn(`[StudyTracker] Session ${sessionId} saved to localStorage for later sync.`);
        } catch (storageError) {
          console.error('[StudyTracker] LocalStorage fallback also failed:', storageError);
        }
    }

  }, [db, user, contentId, contentType]);


  const startSession = useCallback(() => {
    if (!db || !user || sessionRef.current.sessionId || !contentId || !enabled) {
      return;
    }
    const newSessionId = nanoid();
    const startTime = Date.now();
    sessionRef.current = {
      sessionId: newSessionId,
      startTime: startTime,
    };
    setIsTracking(true);
    console.log(`[StudyTracker] Starting session: ${newSessionId} for content: ${contentId}`);
    window.dispatchEvent(new CustomEvent('studySessionStart', { detail: { startTime } }));
  }, [db, user, contentId, enabled]);

  // Main effect to handle app/page lifecycle
  useEffect(() => {
    if (!enabled) return;

    startSession();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        endSession();
      } else if (document.visibilityState === 'visible') {
        startSession();
      }
    };
    
    let appStateListener: any = null;
    if (Capacitor.isNativePlatform()) {
        appStateListener = App.addListener('appStateChange', (state: AppState) => {
            if (!state.isActive) {
                endSession(true);
            } else {
                startSession();
            }
        });
    } else {
        document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    
    // Cleanup on component unmount
    return () => {
      endSession(true);
      if (appStateListener) {
        appStateListener.remove();
      } else {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [startSession, endSession, enabled]);

  return { isTracking };
}
