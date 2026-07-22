
'use client';

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { StudySession } from '@/types';
import { 
  getLocalStartOfDay, 
  getLocalStartOfWeek, 
  getLocalStartOfMonth, 
  getLocalStartOfYear,
  getLocalDateString,
  getTimezone 
} from '@/lib/date-utils';
import { isAfter, subDays, isValid } from 'date-fns';

/**
 * @fileOverview Production-grade Study Analytics Engine v7.6.
 * FIXED: Hardened Date object conversion to prevent RangeErrors in Safari/APK.
 */

export function useStudySessions() {
  const { user } = useUser();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sessionsQuery = useMemo(() => {
    if (!db || !user || !mounted) return null;
    return query(collection(db, 'users', user.uid, 'study_sessions'));
  }, [db, user, mounted]);

  const { data: rawSessions, loading } = useCollection<StudySession>(sessionsQuery);

  const stats = useMemo(() => {
    const emptyStats = {
      today: 0,
      week: 0,
      month: 0,
      year: 0,
      lifetime: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalSessions: 0
    };

    if (!rawSessions || !mounted) return emptyStats;

    const now = new Date();
    const startOfToday = getLocalStartOfDay(now);
    const startOfWeek = getLocalStartOfWeek(now);
    const startOfMonth = getLocalStartOfMonth(now);
    const startOfYear = getLocalStartOfYear(now);

    let today = 0, week = 0, month = 0, year = 0, lifetime = 0;
    const studyDates = new Set<string>();

    rawSessions.forEach((s) => {
      let startTime: Date;
      
      try {
        if (s.startTime?.seconds) {
          startTime = new Date(s.startTime.seconds * 1000);
        } else if (s.startTime instanceof Date) {
          startTime = s.startTime;
        } else if (typeof s.startTime === 'string' || typeof s.startTime === 'number') {
          startTime = new Date(s.startTime);
        } else if (s.startTime && typeof s.startTime.toDate === 'function') {
          startTime = s.startTime.toDate();
        } else {
          return;
        }

        if (!isValid(startTime)) return;

        const duration = Number(s.durationSeconds) || 0;
        lifetime += duration;
        studyDates.add(getLocalDateString(startTime));

        if (isAfter(startTime, startOfToday)) today += duration;
        if (isAfter(startTime, startOfWeek)) week += duration;
        if (isAfter(startTime, startOfMonth)) month += duration;
        if (isAfter(startTime, startOfYear)) year += duration;
      } catch (e) {}
    });

    const sortedDates = Array.from(studyDates).sort((a, b) => b.localeCompare(a));
    let currentStreak = 0, longestStreak = 0, tempStreak = 0;

    if (sortedDates.length > 0) {
      const todayStr = getLocalDateString(now);
      const yesterdayStr = getLocalDateString(subDays(now, 1));
      
      let checkDate = sortedDates.includes(todayStr) ? now : (sortedDates.includes(yesterdayStr) ? subDays(now, 1) : null);
      
      if (checkDate) {
        let streakCheck = checkDate;
        while (sortedDates.includes(getLocalDateString(streakCheck))) {
          currentStreak++;
          streakCheck = subDays(streakCheck, 1);
        }
      }

      let lastDate: Date | null = null;
      [...sortedDates].reverse().forEach((dateStr) => {
        const d = new Date(dateStr);
        if (!lastDate) {
          tempStreak = 1;
        } else {
          const expected = getLocalDateString(subDays(d, 1));
          if (getLocalDateString(lastDate) === expected) {
            tempStreak++;
          } else {
            tempStreak = 1;
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak);
        lastDate = d;
      });
    }

    return {
      today,
      week,
      month,
      year,
      lifetime,
      currentStreak,
      longestStreak,
      totalSessions: rawSessions.length
    };
  }, [rawSessions, mounted]);

  return { stats, loading, sessions: rawSessions };
}

export function useActiveSession(activityType: StudySession['activityType'], activityId?: string) {
  const { user } = useUser();
  const db = useFirestore();
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startSession = useCallback(() => {
    if (isActive || typeof window === 'undefined') return;
    setIsActive(true);
    startTimeRef.current = Date.now();
    setSeconds(0);
    intervalRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
  }, [isActive]);

  const stopSession = useCallback(async (meta?: Partial<StudySession>) => {
    if (!isActive || !user || !db) return null;
    
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    const endTime = Date.now();
    const startTime = startTimeRef.current || endTime;
    const durationSeconds = Math.round((endTime - startTime) / 1000);

    if (durationSeconds < 5) return null; // Ignore micro-sessions

    const session: Omit<StudySession, 'id'> = {
      userId: user.uid,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      durationSeconds,
      activityType,
      activityId,
      timezone: getTimezone(),
      createdAt: serverTimestamp(),
      ...meta
    };

    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'study_sessions'), session);
      return { id: docRef.id, ...session };
    } catch (e) {
      return null;
    } finally {
      startTimeRef.current = null;
      setSeconds(0);
    }
  }, [isActive, user, db, activityType, activityId]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { isActive, seconds, startSession, stopSession };
}
