
'use client';

import { doc, updateDoc, increment, Firestore } from 'firebase/firestore';

/**
 * @fileOverview Client-side tracking for advertisement metrics.
 */

export function trackAdImpression(db: Firestore, adId: string) {
  const adRef = doc(db, 'ads', adId);
  updateDoc(adRef, {
    'stats.impressions': increment(1)
  }).catch(() => {
     // Silent fail for stats tracking to not disrupt UI
  });
}

export function trackAdClick(db: Firestore, adId: string) {
  const adRef = doc(db, 'ads', adId);
  updateDoc(adRef, {
    'stats.clicks': increment(1)
  }).catch(() => {
     // Silent fail for stats tracking
  });
}
