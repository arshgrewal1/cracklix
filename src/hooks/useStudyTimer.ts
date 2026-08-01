'use client';

import { create } from 'zustand';

/**
 * @fileOverview Institutional Study Store v2.0.
 * Centralized state for time tracking to prevent multiple interval collisions.
 */

interface StudyStore {
  activeSeconds: number;
  increment: () => void;
  setBase: (secs: number) => void;
  reset: () => void;
}

export const useStudyStore = create<StudyStore>((set) => ({
  activeSeconds: 0,
  increment: () => set((s) => ({ activeSeconds: s.activeSeconds + 1 })),
  setBase: (secs) => set({ activeSeconds: secs }),
  reset: () => set({ activeSeconds: 0 }),
}));

export function useStudyTimer() {
  const activeSeconds = useStudyStore(s => s.activeSeconds);
  
  const formatStudyTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return { 
    displayTime: formatStudyTime(activeSeconds),
    rawSeconds: activeSeconds
  };
}
