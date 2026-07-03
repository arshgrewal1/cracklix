import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

function getApp() {
  if (admin.apps.length) return admin.apps[0]!;

  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminDB = new Proxy({} as admin.firestore.Firestore, {
  get(_target, prop, receiver) {
    const db = getApp().firestore();
    return Reflect.get(db, prop, receiver);
  },
});
