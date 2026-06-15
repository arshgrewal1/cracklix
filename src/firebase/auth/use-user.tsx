
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/types';
import { getDeviceId } from '@/lib/device';

/**
 * @fileOverview Hardened Auth & Profile Hook v6.0.
 * Eliminates UI flickering by strictly tracking the initial synchronization phase.
 */
export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>("");
  
  // Track if we have performed the initial profile fetch
  const profileLoaded = useRef(false);
  const [internalLoading, setInternalLoading] = useState(true);

  useEffect(() => {
    getDeviceId().then(setCurrentDeviceId);
  }, []);

  // 1. Handle Firebase Auth Session
  useEffect(() => {
    if (!auth) return;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthResolved(true);
      
      // If no user, we are done loading
      if (!firebaseUser) {
        setInternalLoading(false);
        profileLoaded.current = true;
      }
    }, (err) => {
      console.error("[AUTH_SYNC_FAILURE]:", err);
      setAuthResolved(true);
      setInternalLoading(false);
    });

    return () => unsubscribeAuth();
  }, [auth]);

  // 2. Handle Firestore Profile Real-time Sync
  useEffect(() => {
    if (!user || !db) {
      setProfile(null);
      return;
    }

    const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfile({ ...docSnap.data(), id: docSnap.id } as UserProfile);
      } else {
        setProfile(null);
      }
      
      // Mark as loaded after the first successful (or null) snapshot
      profileLoaded.current = true;
      setInternalLoading(false);
    }, (err) => {
      console.error("[PROFILE_HUB_FAILURE]:", err);
      profileLoaded.current = true;
      setInternalLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user, db]);

  // Derive final loading state
  // Only true during the very first boot of the application
  const isSyncing = useMemo(() => {
    if (!authResolved) return true;
    if (user && !profileLoaded.current) return true;
    return false;
  }, [authResolved, user]);

  const isDeviceAuthorized = useMemo(() => {
    if (!profile) return true;
    if (!profile.deviceLock?.deviceId) return true;
    if (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') return true;
    
    // Enforcement Levels: 0: Off, 1: Track, 2: Warning, 3: Block
    if (profile.deviceLock.enforcementLevel < 3) return true;

    return profile.deviceLock.deviceId === currentDeviceId;
  }, [profile, currentDeviceId]);

  return { 
    user, 
    profile, 
    loading: isSyncing,
    currentDeviceId,
    isDeviceAuthorized
  };
}
