
'use client';

import { ReactNode, useMemo } from 'react';
import { initializeFirebase } from './app';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import SessionGuard from '@/components/auth/SessionGuard';

/**
 * @fileOverview Master Client Boundary Node v2.1.
 * SECURE: Imports initialization singleton and registers critical security listeners.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const { app, firestore, auth, storage } = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseProvider app={app} firestore={firestore} auth={auth} storage={storage}>
      <FirebaseErrorListener />
      <SessionGuard />
      {children}
    </FirebaseProvider>
  );
}
