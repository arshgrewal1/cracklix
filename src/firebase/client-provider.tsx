
'use client';

import { ReactNode, useState, useEffect } from 'react';
import { app, firestore, auth, storage } from './app';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import SessionGuard from '@/components/auth/SessionGuard';

/**
 * @fileOverview Master Client Boundary Node v2.9.
 * UPDATED: Changed hydration loading background to pure black to match Splash Screen.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <FirebaseProvider app={app} firestore={firestore} auth={auth} storage={storage}>
      {!mounted ? (
        <div className="min-h-screen bg-black flex items-center justify-center">
           {/* Pure black background matches the Splash Screen during hydration */}
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
