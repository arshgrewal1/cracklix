'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, increment as fsIncrement } from 'firebase/firestore';
import { getLocalDateString } from '@/lib/date-utils';
import { useStudyStore } from '@/hooks/useStudyTimer';
import { usePathname } from 'next/navigation';

/**
 * @fileOverview Institutional Study Engine v1.2 [Standalone Manager].
 * FIXED: Resilient activity detection for mobile PWA (scroll/touch).
 * FIXED: Atomic midnight rollover at 12:00 AM local time.
 */
export default function StudyTimerManager() {
  const { user } = useUser();
  const db = useFirestore();
  const pathname = usePathname();
  const { activeSeconds, increment, setBase, reset } = useStudyStore();
  
  const lastSyncTime = useRef(Date.now());
  const lastActivityTime = useRef(Date.now());
  const isSyncing = useRef(false);

  const syncToFirestore = useCallback(async (isRollover = false) => {
    if (!user || !db || isSyncing.current) return;
    
    isSyncing.current = true;
    try {
      const statsRef = doc(db, 'users', user.uid, 'stats', 'study');
      const todayStr = getLocalDateString();
      
      const snap = await getDoc(statsRef);
      const data = snap.data();
      
      // Handle Date Rollover (Midnight Reset)
      if (isRollover || (data?.lastStudyDate && data.lastStudyDate !== todayStr)) {
        await setDoc(statsRef, {
          yesterdayStudyMinutes: data?.todayStudyMinutes || 0,
          todayStudyMinutes: 0,
          lastSyncedSeconds: 0,
          lastStudyDate: todayStr,
          lastActiveTime: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        reset(); 
        isSyncing.current = false;
        return;
      }

      const sessionSeconds = activeSeconds - (data?.lastSyncedSeconds || 0);
      if (sessionSeconds <= 0) {
        isSyncing.current = false;
        return;
      }

      // Sync active minutes to database hub
      await setDoc(statsRef, {
        todayStudyMinutes: Math.floor(activeSeconds / 60),
        lastActiveTime: serverTimestamp(),
        lastStudyDate: todayStr,
        updatedAt: serverTimestamp(),
        lastSyncedSeconds: activeSeconds
      }, { merge: true });

      // Update global user node for leaderboard ranking
      await updateDoc(doc(db, 'users', user.uid), {
         'studyStats.totalLifetimeStudyMinutes': fsIncrement(Math.floor(sessionSeconds / 60)),
         'studyStats.lastStudyDate': todayStr
      }).catch(() => {});
      
    } catch (e) {
      console.error("[STUDY_SYNC_FAILURE]:", e);
    } finally {
      isSyncing.current = false;
    }
  }, [user, db, activeSeconds, reset]);

  useEffect(() => {
    if (!user || !db) return;

    // Initialize from database on mount
    const initialize = async () => {
       const statsRef = doc(db, 'users', user.uid, 'stats', 'study');
       const snap = await getDoc(statsRef);
       const todayStr = getLocalDateString();
       
       if (snap.exists()) {
          const data = snap.data();
          if (data.lastStudyDate === todayStr) {
             setBase(data.todayStudyMinutes * 60);
          } else {
             await syncToFirestore(true);
          }
       }
    };

    initialize();

    const ticker = setInterval(() => {
      const now = Date.now();
      const idleTime = (now - lastActivityTime.current) / 1000;
      
      // 1. Ticking Logic: Only count if user is active (5 min threshold)
      if (idleTime < 300) { 
         increment();
      }

      // 2. Periodic Sync: Every 60 seconds
      if (now - lastSyncTime.current > 60000) {
         syncToFirestore();
         lastSyncTime.current = now;
      }

      // 3. Midnight Check: Every tick
      const currentDay = getLocalDateString();
      const lastSyncDay = getLocalDateString(new Date(lastSyncTime.current));
      if (currentDay !== lastSyncDay) {
         syncToFirestore(true);
         lastSyncTime.current = now;
      }
    }, 1000);

    const activityListener = () => {
       lastActivityTime.current = Date.now();
    };

    // Global Activity Registry: Tracks all meaningful interactions
    window.addEventListener('mousemove', activityListener);
    window.addEventListener('keydown', activityListener);
    window.addEventListener('click', activityListener);
    window.addEventListener('scroll', activityListener);
    window.addEventListener('touchstart', activityListener);
    window.addEventListener('touchmove', activityListener);
    
    // Visibility Hub: Triggers sync on app minimize/restore
    window.addEventListener('visibilitychange', () => {
       activityListener();
       syncToFirestore();
    });

    return () => {
      clearInterval(ticker);
      window.removeEventListener('mousemove', activityListener);
      window.removeEventListener('keydown', activityListener);
      window.removeEventListener('click', activityListener);
      window.removeEventListener('scroll', activityListener);
      window.removeEventListener('touchstart', activityListener);
      window.removeEventListener('touchmove', activityListener);
      syncToFirestore();
    };
  }, [user, db, increment, setBase, syncToFirestore]);

  return null;
}
