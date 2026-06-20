
'use client';

import { useEffect, useRef } from 'react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview Hardened Single-Device Enforcement Node v5.0.
 * LOGIC: Real-time listener checks if the current device matches the one authorized in Firestore.
 * ACTION: If a mismatch is detected (new login elsewhere), it signs out the current device immediately.
 */
export default function SessionGuard() {
  const { user, profile, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const isSigningOut = useRef(false);

  useEffect(() => {
    if (loading || !user || !profile || isSigningOut.current) return;

    const localSessionId = localStorage.getItem('cracklix_session_id');
    const authorizedDeviceId = profile.activeDeviceId;

    // Check for mismatch: If Firestore has a different ID than local storage
    if (authorizedDeviceId && localSessionId && authorizedDeviceId !== localSessionId) {
      isSigningOut.current = true;
      
      toast({
        variant: "destructive",
        title: "Session Terminated",
        description: "You have been logged out because your account is active on another device.",
      });

      signOut(auth).then(() => {
        localStorage.removeItem('cracklix_session_id');
        router.replace('/login');
        isSigningOut.current = false;
      });
    }
  }, [user, profile, loading, auth, router, toast]);

  return null;
}
