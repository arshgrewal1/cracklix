'use client';

import { createContext, useContext, ReactNode } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { FirebaseStorage } from 'firebase/storage';

interface FirebaseContextValue {
  app: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  storage: FirebaseStorage | null;
}

const FirebaseContext = createContext<FirebaseContextValue>({
  app: null,
  firestore: null,
  auth: null,
  storage: null,
});

/**
 * @fileOverview Hardened Context Node v2.7.
 * FIXED: Removed circular self-import causing module initialization failures.
 */
export function FirebaseProvider({
  children,
  app,
  firestore,
  auth,
  storage,
}: {
  children: ReactNode;
  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
}) {
  return (
    <FirebaseContext.Provider value={{ app, firestore, auth, storage }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebaseApp = () => {
  const context = useContext(FirebaseContext);
  if (!context.app) throw new Error('useFirebaseApp must be used within a FirebaseProvider');
  return context.app;
};

export const useFirestore = () => {
  const context = useContext(FirebaseContext);
  if (!context.firestore) throw new Error('useFirestore must be used within a FirebaseProvider');
  return context.firestore;
};

export const useAuth = () => {
  const context = useContext(FirebaseContext);
  if (!context.auth) throw new Error('useAuth must be used within a FirebaseProvider');
  return context.auth;
};

export const useStorage = () => {
  const context = useContext(FirebaseContext);
  if (!context.storage) throw new Error('useStorage must be used within a FirebaseProvider');
  return context.storage;
};