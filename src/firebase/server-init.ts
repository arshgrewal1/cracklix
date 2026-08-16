/**
 * @fileOverview Institutional Server-Side Firebase Admin Hub v3.0.
 * FIXED: Re-enabled Admin SDK for secure backend Storage and Firestore operations.
 */
import * as admin from 'firebase-admin';
import { firebaseConfig } from './config';

const cert = {
  projectId: process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  try {
    if (cert.clientEmail && cert.privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert(cert as any),
        storageBucket: `${cert.projectId}.firebasestorage.app`,
      });
      console.log('[FIREBASE_ADMIN] Initialized with Service Account.');
    } else {
      admin.initializeApp({
        storageBucket: `${cert.projectId}.firebasestorage.app`,
      });
      console.log('[FIREBASE_ADMIN] Initialized with Default Credentials.');
    }
  } catch (e) {
    console.error('[FIREBASE_ADMIN_INIT_FAILURE]:', e);
  }
}

export const adminDB = admin.firestore();
export const adminStorage = admin.storage();
export const adminAuth = admin.auth();
