'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useUser, useAuth, useDoc, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';

/**
 * @fileOverview Hardened Takeover Session Guard v15.2.
 * FIXED: Standardized hook import order.
 */
export default function SessionGuard() {
  const { user, profile, loading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  
  const isSigningOut = useRef(false);
  const mountedAt = useRef(Date.now());

  // Listen to Global Maintenance/Security Node
  const globalRef = useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]);
  const { data: globalSettings } = useDoc<any>(globalRef);

  useEffect(() => {
    // 1. Initial Guards
    if (loading || !user || !profile || isSigningOut.current || !globalSettings) return;
    
    // 2. Safe-zone routing
    if (pathname === '/login' || pathname === '/profile-setup') return;

    // 3. Handshake Suppression (2s delay to allow profile sync to settle)
    if (Date.now() - mountedAt.current < 2000) return;

    const terminateSession = async (title: string, desc: string) => {
      if (isSigningOut.current) return;
      isSigningOut.current = true;
      
      toast({ variant: "destructive", title, description: desc });
      
      try {
        await signOut(auth);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('cracklix_session_id');
        }
        router.replace('/login');
      } catch (e) {
        isSigningOut.current = false;
      }
    };

    // 4. Global Force Logout Check
    if (globalSettings.maintenanceModeAt) {
       const maintenanceTime = globalSettings.maintenanceModeAt.seconds * 1000;
       const lastLoginTime = profile.lastLoginAt?.seconds ? profile.lastLoginAt.seconds * 1000 : 0;
       
       if (maintenanceTime > lastLoginTime) {
          terminateSession("System Maintenance", "All active sessions have been reset by the administrator.");
          return;
       }
    }

    // 5. Multi-Device Takeover Check
    const localSessionId = typeof window !== 'undefined' ? localStorage.getItem('cracklix_session_id') : null;
    const cloudSessionId = profile.activeDeviceId;

    if (cloudSessionId && localSessionId && cloudSessionId !== localSessionId) {
       terminateSession("Session Expired", "Your account was logged in on another device.");
    }

  }, [user, profile, loading, auth, router, toast, pathname, globalSettings]);

  return null;
}
