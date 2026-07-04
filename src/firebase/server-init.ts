
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceKey = require('./service-key.json');

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceKey),
  });
}

export const adminDB = getFirestore();
