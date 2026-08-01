'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, increment as fsIncrement } from 'firebase/firestore';
import { getLocalDateString } from '@/lib/date-utils';
import { create } from 'zustand';

/**
 * @fileOverview Production Study Timer Engine v1.1.
 * FIXED: Aliased firestore increment to fsIncrement to avoid shadowing local state.
 */

interface StudyStore {
  activeSeconds: number;
  increment: () => void;
  setBase: (secs: number) => void;
  reset: () => void;
}

const useStudyStore = create<StudyStore>((set) => ({
  activeSeconds: 0,
  increment: () => set((s) => ({ activeSeconds: s.activeSeconds + 1 })),
  setBase: (secs) => set({ activeSeconds: secs }),
  reset: () => set({ activeSeconds: 0 }),
}));

export function useStudyTimer() {
  const { user } = useUser();
  const db = useFirestore();
  const { activeSeconds, increment, setBase, reset } = useStudyStore();
  
  const lastSyncTime = useRef(Date.now());
  const lastActivityTime = useRef(Date.now());
  const isSyncing = useRef(false);

  // Formatting utility: 1h 20m
  const formatStudyTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const syncToFirestore = useCallback(async (isRollover = false) => {
    if (!user || !db || isSyncing.current) return;
    
    isSyncing.current = true;
    try {
      const statsRef = doc(db, 'users', user.uid, 'stats', 'study');
      const todayStr = getLocalDateString();
      
      const snap = await getDoc(statsRef);
      const data = snap.data();
      
      const sessionSeconds = activeSeconds - (data?.lastSyncedSeconds || 0);
      if (sessionSeconds <= 0 && !isRollover) {
        isSyncing.current = false;
        return;
      }

      const payload: any = {
        todayStudyMinutes: Math.floor(activeSeconds / 60),
        lastActiveTime: serverTimestamp(),
        lastStudyDate: todayStr,
        updatedAt: serverTimestamp(),
        lastSyncedSeconds: activeSeconds
      };

      if (isRollover) {
        payload.yesterdayStudyMinutes = data?.todayStudyMinutes || 0;
        payload.todayStudyMinutes = 0;
        payload.lastSyncedSeconds = 0;
        reset();
      }

      await setDoc(statsRef, payload, { merge: true });
      await updateDoc(doc(db, 'users', user.uid), {
         'studyStats.totalLifetimeStudyMinutes': fsIncrement(Math.floor(sessionSeconds / 60))
      });
      
    } catch (e) {
      console.error("[StudyTimer_Sync_Error]:", e);
    } finally {
      isSyncing.current = false;
    }
  }, [user, db, activeSeconds, reset]);

  // Main Effect
  useEffect(() => {
    if (!user || !db) return;

    const initialize = async () => {
       const statsRef = doc(db, 'users', user.uid, 'stats', 'study');
       const snap = await getDoc(statsRef);
       const todayStr = getLocalDateString();
       
       if (snap.exists()) {
          const data = snap.data();
          if (data.lastStudyDate === todayStr) {
             setBase(data.todayStudyMinutes * 60);
          } else {
             // Rollover check on mount
             await syncToFirestore(true);
          }
       }
    };

    initialize();

    const ticker = setInterval(() => {
      // 5 Minute Idle Check
      const now = Date.now();
      const idleTime = (now - lastActivityTime.current) / 1000;
      
      if (idleTime < 300) { // 5 minutes
         increment();
      }

      // Sync every 60 seconds
      if (now - lastSyncTime.current > 60000) {
         syncToFirestore();
         lastSyncTime.current = now;
      }

      // Midnight Rollover Check
      if (getLocalDateString() !== getLocalDateString(new Date(lastSyncTime.current))) {
         syncToFirestore(true);
      }
    }, 1000);

    const activityListener = () => {
       lastActivityTime.current = Date.now();
    };

    window.addEventListener('mousemove', activityListener);
    window.addEventListener('keydown', activityListener);
    window.addEventListener('click', activityListener);
    window.addEventListener('visibilitychange', () => syncToFirestore());

    return () => {
      clearInterval(ticker);
      window.removeEventListener('mousemove', activityListener);
      window.removeEventListener('keydown', activityListener);
      window.removeEventListener('click', activityListener);
      syncToFirestore();
    };
  }, [user, db, increment, setBase, syncToFirestore]);

  return { 
    displayTime: formatStudyTime(activeSeconds),
    rawSeconds: activeSeconds
  };
}
