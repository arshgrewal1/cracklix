'use client';

/**
 * @fileOverview Redundant Study Tracker Node (Neutralized).
 * Functionality has been moved to the more robust session-based Study Analytics Engine (useStudyAnalytics.ts).
 */
export function useStudyTracker() {
  return { 
    elapsedSeconds: 0, 
    unSyncedSeconds: 0, 
    isActive: false, 
    isStudyContent: false 
  };
}
