import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

/**
 * @fileOverview Universal Firebase Initialization Node v1.6.
 * REMOVED: 'use client' directive to allow this module to be shared between 
 * Client Components and Server-Side Route Handlers.
 */

let app: FirebaseApp | null = null;
let firestore: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;

const isConfigValid = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "undefined";

if (isConfigValid) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    if (app) {
      firestore = getFirestore(app);
      auth = getAuth(app);
      storage = getStorage(app);
    }
  } catch (e) {
    console.error("[FIREBASE_BOOT_FAILURE]:", e);
  }
}

export { app, firestore, auth, storage };
