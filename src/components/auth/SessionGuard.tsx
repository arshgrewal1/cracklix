
'use client';

import { useEffect, useRef } from 'react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview Hardened Takeover Session Guard v7.0.
 * LOGIC: Monitors Firestore for sessionId changes. Older devices are logged out automatically.
 */
export default function SessionGuard() {
  const { user, profile, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const isSigningOut = useRef(false);

  useEffect(() => {
    // 1. Guard against unauthenticated states or transition phases
    if (loading || !user || !profile || isSigningOut.current) return;
    
    // 2. Ignore guard if on the login page to allow takeover to complete
    if (pathname === '/login') return;

    const localSessionId = localStorage.getItem('cracklix_session_id');
    const cloudSessionId = profile.activeDeviceId;

    // 3. Takeover Detection: If cloud ID exists and doesn't match local device
    if (cloudSessionId && localSessionId && cloudSessionId !== localSessionId) {
      isSigningOut.current = true;
      
      // Notify the student that their session was taken over
      toast({
        variant: "destructive",
        title: "Session Expired",
        description: "This account was recently logged in on another device. For security, this session has been terminated.",
      });

      // Perform atomic logout
      signOut(auth).then(() => {
        localStorage.removeItem('cracklix_session_id');
        router.replace('/login');
        isSigningOut.current = false;
      }).catch(err => {
        console.error("[SESSION_TAKEOVER_FAILURE]:", err);
        isSigningOut.current = false;
      });
    }
  }, [user, profile, loading, auth, router, toast, pathname]);

  return null;
}
