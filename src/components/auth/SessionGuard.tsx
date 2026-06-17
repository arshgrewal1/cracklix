'use client';

import { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { useUser } from '@/firebase';
import { getDeviceId } from '@/lib/device';

/**
 * @fileOverview Hardened Production Session Guard v2.0.
 * Enforces "One Account = One Active Device" by listening to the activeDeviceId in Firestore.
 */
export default function SessionGuard() {
  const auth = useAuth();
  const db = useFirestore();
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    let unsubscribe: (() => void) | undefined;

    const start = async () => {
      const currentDeviceId = await getDeviceId();

      unsubscribe = onSnapshot(
        doc(db, 'users', user.uid),
        async (snap) => {
          if (!snap.exists()) return;

          const data = snap.data();

          // If the registry's active device doesn't match this local hardware node, terminate session
          if (
            data.activeDeviceId &&
            data.activeDeviceId !== currentDeviceId
          ) {
            // Immediate sign out from Firebase
            await signOut(auth);

            // Redirect to login with termination audit flag
            window.location.href = '/login?session=terminated';
          }
        }
      );
    };

    start();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, auth, db]);

  return null;
}
