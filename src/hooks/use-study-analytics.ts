
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { StudySession } from '@/lib/firebase-schema';

const INACTIVITY_TIMEOUT = 60000; // 60 seconds

export function useStudyAnalytics(activityType: StudySession['activityType']) {
  const { user } = useUser();
  const db = useFirestore();
  const [isTracking, setIsTracking] = useState(false);
  const sessionStartTime = useRef<number | null>(null);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  const saveSession = useCallback(async (startTime: number, endTime: number) => {
    if (!user || !db || endTime <= startTime) return;

    const duration = Math.round((endTime - startTime) / 1000);
    if (duration <= 0) return;

    const session: Omit<StudySession, 'id'> = {
      userId: user.uid,
      startTime,
      endTime,
      duration,
      activityType,
    };

    try {
      await addDoc(collection(db, 'study-sessions'), session);
    } catch (error) {
      console.error("Failed to save study session:", error);
    }
  }, [user, db, activityType]);

  const startTracking = useCallback(() => {
    if (isTracking) return;
    setIsTracking(true);
    sessionStartTime.current = Date.now();
    resetInactivityTimer();
  }, [isTracking]);

  const stopTracking = useCallback(() => {
    if (!isTracking || !sessionStartTime.current) return;
    saveSession(sessionStartTime.current, Date.now());
    setIsTracking(false);
    sessionStartTime.current = null;
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
  }, [isTracking, saveSession]);

  const pauseTracking = useCallback(() => {
    if (!isTracking || !sessionStartTime.current) return;
    saveSession(sessionStartTime.current, Date.now());
    sessionStartTime.current = null;
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
  }, [isTracking, saveSession]);

  const resumeTracking = useCallback(() => {
    if (!isTracking || sessionStartTime.current) return;
    sessionStartTime.current = Date.now();
    resetInactivityTimer();
  }, [isTracking]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    inactivityTimer.current = setTimeout(() => {
      pauseTracking();
    }, INACTIVITY_TIMEOUT);
  }, [pauseTracking]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseTracking();
      } else {
        resumeTracking();
      }
    };

    const handleInteraction = () => {
      resetInactivityTimer();
      if (!sessionStartTime.current) {
          resumeTracking();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('scroll', handleInteraction);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      stopTracking(); // Save any remaining session time when the component unmounts
    };
  }, [pauseTracking, resumeTracking, resetInactivityTimer, stopTracking]);

  return { startTracking, stopTracking };
}
