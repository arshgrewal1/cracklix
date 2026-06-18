'use client';

import { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { useUser } from '@/firebase';
import { getDeviceId } from '@/lib/device';

/**
 * @fileOverview Hardened Production Session Guard v3.0.
 * Enforces "One Account = One Active Device" by listening to the activeDeviceId in Firestore.
 * Ensures immediate termination of previous sessions when a new device logs in.
 */
export default function SessionGuard() {
  const auth = useAuth();
  const db = useFirestore();
  const { user, profile } = useUser();

  useEffect(() => {
    if (!user || !db || !auth) return;

    // Do not enforce SDL for admins to allow multi-device monitoring
    if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN') return;

    let unsubscribe: (() => void) | undefined;

    const startEnforcement = async () => {
      const currentDeviceId = await getDeviceId();

      unsubscribe = onSnapshot(
        doc(db, 'users', user.uid),
        async (snap) => {
          if (!snap.exists()) return;

          const data = snap.data();

          // If the registry's active device doesn't match this local hardware node, terminate session
          // We only check if activeDeviceId is set to avoid kicking out users before the field is initialized
          if (
            data.activeDeviceId &&
            data.activeDeviceId !== currentDeviceId
          ) {
            console.warn("[SDL_ENFORCEMENT]: Active device mismatch. Terminating session.");
            
            // Immediate sign out from Firebase
            await signOut(auth);

            // Redirect to login with termination audit flag for UI feedback
            window.location.href = '/login?session=terminated';
          }
        },
        (error) => {
          console.error("[SDL_LISTENER_ERROR]:", error);
        }
      );
    };

    startEnforcement();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, profile, auth, db]);

  return null;
}
