
'use client';

import { ReactNode, useState, useEffect, useLayoutEffect } from 'react';
import { app, firestore, auth, storage } from './app';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import SessionGuard from '@/components/auth/SessionGuard';

/**
 * @fileOverview Master Client Boundary Node v2.7.
 * FIXED: Optimized hydration logic to prevent infinite loading state.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  // Use useLayoutEffect for faster hydration sync if available, 
  // otherwise fallback to useEffect.
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
         <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
