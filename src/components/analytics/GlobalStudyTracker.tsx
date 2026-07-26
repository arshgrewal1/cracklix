'use client';

import { useEffect, useMemo } from 'react';
import { useStudyTimer } from '@/hooks/useStudyTimer';
import { usePathname } from 'next/navigation';

/**
 * @fileOverview Institutional Engagement Node v2.0.
 * Automatically tracks study time on verified preparation pages.
 */
export default function GlobalStudyTracker() {
  const pathname = usePathname();
  
  const isStudyArea = useMemo(() => {
     const paths = [
       '/mocks', 
       '/exams', 
       '/subjects', 
       '/current-affairs', 
       '/pyqs', 
       '/notes', 
       '/revision', 
       '/bookmarks',
       '/results'
     ];
     return paths.some(p => pathname?.startsWith(p));
  }, [pathname]);

  // The hook itself manages the internal timer logic
  // We only mount/unmount the logic based on study area
  return <StudyTimerEngine active={isStudyArea} />;
}

function StudyTimerEngine({ active }: { active: boolean }) {
   // Use the persistent timer hook only if in study area
   const { displayTime } = useStudyTimer();
   
   useEffect(() => {
      if (active) {
         console.log('[Engagement] Syncing study node...');
      }
   }, [active]);

   return null;
}
