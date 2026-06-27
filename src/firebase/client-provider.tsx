
'use client';

import { ReactNode, useMemo, useState, useEffect } from 'react';
import { initializeFirebase } from './app';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import SessionGuard from '@/components/auth/SessionGuard';

/**
 * @fileOverview Master Client Boundary Node v2.6.
 * FIXED: Hardened hydration guard to prevent ChunkLoadError and ensure stable PWA mounting.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // Ensuring hydration is complete before rendering Capacitor/Firebase nodes
    setMounted(true);
  }, []);

  const { app, firestore, auth, storage } = useMemo(() => initializeFirebase(), []);

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
