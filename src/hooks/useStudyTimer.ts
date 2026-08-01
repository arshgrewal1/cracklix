'use client';

import { create } from 'zustand';

/**
 * @fileOverview Institutional Study Store v2.1.
 * Centralized state for time tracking to prevent multiple interval collisions.
 * UPDATED: Granular Hh Mm Ss formatting for live feedback.
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
    if (!totalSeconds || totalSeconds <= 0) return "0s";
    
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0 || h > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    
    return parts.join(' ');
  };

  return { 
    displayTime: formatStudyTime(activeSeconds),
    rawSeconds: activeSeconds
  };
}
