import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

/**
 * Lazily initialise Firebase Admin. Initialising at module scope crashes the
 * build (e.g. Vercel "Collecting page data") whenever the service-account env
 * vars are not present, because admin.credential.cert() throws immediately.
 * Deferring init to first use means the module can be imported safely and the
 * credentials are only required when a request actually hits the route.
 */
function getAdminApp(): admin.app.App {
  if (admin.apps.length) {
    return admin.app();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, ' +
        'FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in the environment.'
    );
  }

  const serviceAccount: ServiceAccount = { projectId, clientEmail, privateKey };

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

/**
 * Firestore proxy that resolves the real instance on first property access,
 * so importing this module never triggers Firebase Admin initialisation.
 */
export const adminDB: admin.firestore.Firestore = new Proxy(
  {} as admin.firestore.Firestore,
  {
    get(_target, prop) {
      const firestore = getAdminApp().firestore();
      const value = (firestore as any)[prop];
      return typeof value === 'function' ? value.bind(firestore) : value;
    },
  }
);
