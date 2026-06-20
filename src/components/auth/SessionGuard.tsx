'use client';

import { useEffect, useRef } from 'react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview Hardened Takeover Session Guard v8.0.
 * PERFORMANCE: Non-blocking background verification to ensure fast initial dashboard paint.
 */
export default function SessionGuard() {
  const { user, profile, loading, profileLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const isSigningOut = useRef(false);

  useEffect(() => {
    // 1. Guard against unauthenticated states or transition phases
    // We don't block on 'profileLoading' to allow the UI to render first
    if (loading || !user || !profile || isSigningOut.current) return;
    
    // 2. Ignore guard if on login or registration nodes
    if (pathname === '/login' || pathname === '/profile-setup') return;

    // 3. Background Verification
    const localSessionId = localStorage.getItem('cracklix_session_id');
    const cloudSessionId = profile.activeDeviceId;

    // 4. Takeover Detection
    if (cloudSessionId && localSessionId && cloudSessionId !== localSessionId) {
      isSigningOut.current = true;
      
      toast({
        variant: "destructive",
        title: "Session Expired",
        description: "Your account was logged in on another device. This session has been closed for security.",
      });

      // Atomic Sign Out
      signOut(auth).then(() => {
        localStorage.removeItem('cracklix_session_id');
        router.replace('/login');
        isSigningOut.current = false;
      }).catch(err => {
        console.error("[SESSION_TAKEOVER_FAILURE]:", err);
        isSigningOut.current = false;
      });
    }
  }, [user, profile, loading, auth, router, toast, pathname, profileLoading]);

  return null;
}
