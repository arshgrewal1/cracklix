
'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { UserStudyAnalytics } from '@/lib/firebase-schema';

export function useUserAnalytics() {
  const { user } = useUser();
  const db = useFirestore();
  const [analytics, setAnalytics] = useState<UserStudyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) return;

    const analyticsRef = doc(db, 'user-analytics', user.uid);

    const unsubscribe = onSnapshot(analyticsRef, (doc) => {
      if (doc.exists()) {
        setAnalytics(doc.data() as UserStudyAnalytics);
      } else {
        // If no analytics document exists, we can trigger the API to create one.
        fetch('/api/update-analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: user.uid }),
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, db]);

  return { analytics, loading };
}
