'use client';

import { ReactNode } from 'react';
import { app, firestore, auth, storage } from './app';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import SessionGuard from '@/components/auth/SessionGuard';

/**
 * @fileOverview Master Client Boundary Node v3.0.
 * REFACTORED: Removed conditional mounted render to prevent Next.js 15 compilation hangs.
 * Hydration state is now handled by individual components like SplashScreen.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  return (
    <FirebaseProvider app={app} firestore={firestore} auth={auth} storage={storage}>
      <FirebaseErrorListener />
      <SessionGuard />
      {children}
    </FirebaseProvider>
  );
}
