'use client';

import { useMemo } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * @fileOverview Streak Tracking Component v1.0
 * @description Displays the user's current and longest study streaks by connecting
 * to the 'streaks' collection in Firestore for real-time updates.
 */
const StreakTracker = () => {
  const { user } = useUser();
  const db = useFirestore();

  const streakRef = useMemo(() => user ? doc(db, 'streaks', user.uid) : null, [user, db]);
  const [streakData, loading, error] = useDocumentData(streakRef);

  const currentStreak = useMemo(() => streakData?.currentStreak || 0, [streakData]);
  const longestStreak = useMemo(() => streakData?.longestStreak || 0, [streakData]);

  // Don't render the component for non-logged-in users
  if (!user) {
    return null;
  }

  // Display skeleton loaders while data is being fetched
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
    );
  }

  // Don't render the card if there is an error fetching data
  if (error) {
    console.error("Error loading streak data:", error);
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="shadow-sm border-slate-100 dark:border-slate-800 rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Streak</CardTitle>
          <Flame className="h-5 w-5 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{currentStreak}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {currentStreak > 0 ? `Day${currentStreak > 1 ? 's' : ''} in a row!` : 'Study today to start a streak!'}
          </p>
        </CardContent>
      </Card>
      <Card className="shadow-sm border-slate-100 dark:border-slate-800 rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Longest Streak</CardTitle>
          <Zap className="h-5 w-5 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{longestStreak}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {longestStreak > 0 ? `Your best record!` : 'Keep going!'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreakTracker;
