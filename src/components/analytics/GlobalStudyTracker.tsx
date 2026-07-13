'use client';

import { useEffect, useRef } from 'react';
import { useActiveSession } from '@/hooks/useStudyAnalytics';
import { useUser } from '@/firebase';

/**
 * @fileOverview Institutional Engagement Node v1.0.
 * Automatically tracks platform open time as a baseline study session.
 */
export default function GlobalStudyTracker() {
  const { user } = useUser();
  const { isActive, startSession, stopSession } = useActiveSession('PRACTICE');
  const mounted = useRef(false);

  useEffect(() => {
    if (!user || mounted.current) return;
    
    // Auto-start tracking on platform entry
    console.log('[Engagement] Syncing baseline session...');
    startSession();
    mounted.current = true;

    // Handle backgrounding
    const handleVisibility = () => {
       if (document.hidden) {
          stopSession();
       } else {
          startSession();
       }
    };

    window.addEventListener('visibilitychange', handleVisibility);
    
    return () => {
      window.removeEventListener('visibilitychange', handleVisibility);
      stopSession(); // Save session on exit
    };
  }, [user, startSession, stopSession]);

  return null;
}
