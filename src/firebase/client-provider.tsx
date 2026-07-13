'use client';

import { ReactNode, useState, useEffect } from 'react';
import { app, firestore, auth, storage } from './app';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import SessionGuard from '@/components/auth/SessionGuard';

/**
 * @fileOverview Master Client Boundary Node v2.8.
 * FIXED: Optimized hydration logic to ensure body content is always rendered to avoid compilation hangs.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <FirebaseProvider app={app} firestore={firestore} auth={auth} storage={storage}>
      {!mounted ? (
        <div className="min-h-screen bg-white flex items-center justify-center">
           <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <FirebaseErrorListener />
          <SessionGuard />
          {children}
        </>
      )}
    </FirebaseProvider>
  );
}
