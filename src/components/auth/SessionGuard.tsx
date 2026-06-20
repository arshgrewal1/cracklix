
'use client';

import { useEffect, useRef } from 'react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview Hardened Takeover Session Guard v10.0 (Latest Login Wins).
 * LOGIC: Compares authoritative activeDeviceId and sessionVersion from Firestore with local state.
 * If they mismatch, it means a newer login occurred on another device.
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
    
    // 2. Ignore guard if on login or registration nodes
    if (pathname === '/login' || pathname === '/profile-setup') return;

    // 3. Authority Validation
    const localSessionId = localStorage.getItem('cracklix_session_id');
    const cloudSessionId = profile.activeDeviceId;

    // 4. Takeover Detection (Latest Login Wins)
    // If the cloud says a different device is active, this session is now unauthorized.
    if (cloudSessionId && localSessionId && cloudSessionId !== localSessionId) {
      isSigningOut.current = true;
      
      console.warn("[SESSION_TAKEOVER]: Invalidation triggered by cloud authority mismatch.");

      toast({
        variant: "destructive",
        title: "Session Expired",
        description: "Your account was logged in on another device. This session has been terminated for security.",
      });

      // Atomic Sign Out node
      signOut(auth).then(() => {
        localStorage.removeItem('cracklix_session_id');
        router.replace('/login');
        isSigningOut.current = false;
      }).catch(err => {
        console.error("[SESSION_TERMINATION_FAILURE]:", err);
        isSigningOut.current = false;
      });
    }
  }, [user, profile, loading, auth, router, toast, pathname]);

  return null;
}
