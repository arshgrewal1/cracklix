'use client';

import { ReactNode, useMemo, useState, useEffect } from 'react';
import { initializeFirebase } from './app';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import SessionGuard from '@/components/auth/SessionGuard';

/**
 * @fileOverview Master Client Boundary Node v2.5.
 * FIXED: Enhanced hydration guard to prevent ChunkLoadError and hydration mismatches.
 * This component acts as the primary switch between SSR and Client-side hydration.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // This effect runs immediately after hydration completes.
    setMounted(true);
  }, []);

  // Memoize firebase initialization to prevent re-runs during re-renders.
  const { app, firestore, auth, storage } = useMemo(() => initializeFirebase(), []);

  // Hydration Guard: Return a stable loading skeleton until the client is ready.
  // This prevents the "Loading chunk failed" error by ensuring dynamic chunks 
  // (like SessionGuard) only load after the base layout is stable.
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
         <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <FirebaseProvider app={app} firestore={firestore} auth={auth} storage={storage}>
      <FirebaseErrorListener />
      <SessionGuard />
      {children}
    </FirebaseProvider>
  );
}
