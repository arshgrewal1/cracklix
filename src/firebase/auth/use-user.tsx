
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/types';
import { getDeviceId } from '@/lib/device';

/**
 * @fileOverview Hardened Auth & Profile Hook v9.0.
 * UPDATED: Optimized 10-second hydration timeout to resolve infinite loading scenarios.
 */
export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>("");
  
  const profileLoaded = useRef(false);

  useEffect(() => {
    getDeviceId().then(setCurrentDeviceId);
  }, []);

  // 1. Auth Sync Hub with explicit 10s "Panic Timeout"
  useEffect(() => {
    if (!auth) return;

    let timeoutId: NodeJS.Timeout;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthResolved(true);
      
      if (firebaseUser) {
        setProfileLoading(!profileLoaded.current);
      } else {
        setProfileLoading(false);
        profileLoaded.current = true;
      }
      
      if (timeoutId) clearTimeout(timeoutId);
    }, (err) => {
      console.error("[AUTH_SYNC_FAILURE]:", err);
      setAuthResolved(true);
      setProfileLoading(false);
      if (timeoutId) clearTimeout(timeoutId);
    });

    // Panic Timeout: Resolve loading state if Firebase takes too long
    timeoutId = setTimeout(() => {
       if (!authResolved) {
          console.warn("[AUTH_PANIC]: Handshake timed out after 10s. Bypassing blocker for UX.");
          setAuthResolved(true);
          setProfileLoading(false);
       }
    }, 10000);

    return () => {
       unsubscribeAuth();
       if (timeoutId) clearTimeout(timeoutId);
    };
  }, [auth]);

  // 2. Firestore Profile Real-time Sync with mandatory cleanup
  useEffect(() => {
    if (!user || !db) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(!profileLoaded.current);

    const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfile({ ...docSnap.data(), id: docSnap.id } as UserProfile);
      } else {
        setProfile(null);
      }
      
      profileLoaded.current = true;
      setProfileLoading(false);
    }, (err) => {
      console.error("[PROFILE_HUB_FAILURE]:", err);
      profileLoaded.current = true;
      setProfileLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user, db]);

  const isDeviceAuthorized = useMemo(() => {
    if (!profile) return true;
    if (!profile.deviceLock?.deviceId) return true;
    if (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') return true;
    if (profile.deviceLock.enforcementLevel < 3) return true;
    return profile.deviceLock.deviceId === currentDeviceId;
  }, [profile, currentDeviceId]);

  return { 
    user, 
    profile, 
    loading: !authResolved, 
    profileLoading,         
    currentDeviceId,
    isDeviceAuthorized
  };
}
