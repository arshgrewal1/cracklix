
'use client';

import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/types';
import { getDeviceId } from '@/lib/device';

/**
 * @fileOverview Hardened Auth Hub v25.0 [Zero-Latency Sync].
 * FIXED: loading state now resolves immediately when user is null or found.
 * FIXED: Prevented auth state flickering by unifying profile and user resolution.
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
  const profileDataRef = useRef<string>("");

  useEffect(() => {
    getDeviceId().then(id => {
      if (id) setCurrentDeviceId(id);
    }).catch(() => {});
  }, []);

  // 1. Auth Switchboard
  useEffect(() => {
    if (!auth) {
      setAuthResolved(true);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        if (!profileLoaded.current) {
          setProfileLoading(true);
        }
      } else {
        setProfile(null);
        profileDataRef.current = "";
        setProfileLoading(false);
        profileLoaded.current = true;
        setAuthResolved(true); // Resolve immediately if no user
      }
    });

    return () => unsubscribeAuth();
  }, [auth]);

  // 2. Presence & Profile Sync Node
  useEffect(() => {
    if (!user || !db) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    const userRef = doc(db, 'users', user.uid);

    const syncPresence = (isOnline: boolean) => {
       updateDoc(userRef, {
          online: isOnline,
          lastSeen: serverTimestamp(),
          updatedAt: serverTimestamp()
       }).catch(() => {});
    };

    syncPresence(true);

    const handleProfileSnapshot = (docSnap: any) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const now = new Date();
        
        let passStatus: 'active' | 'expired' | 'none' = data.passStatus || 'none';
        
        if (data.passExpiresAt) {
           const expiryDate = new Date(data.passExpiresAt);
           passStatus = now > expiryDate ? 'expired' : 'active';
        }

        const profileObj = { 
          ...data, 
          id: docSnap.id, 
          passStatus 
        } as UserProfile;

        const profileString = JSON.stringify(profileObj);
        if (profileString !== profileDataRef.current) {
           profileDataRef.current = profileString;
           setProfile(profileObj);
        }
      }
      profileLoaded.current = true;
      setProfileLoading(false);
      setAuthResolved(true); // Resolve loading only after profile is fetched or determined missing
    };

    const unsubscribeProfile = onSnapshot(
      userRef, 
      handleProfileSnapshot,
      async (err) => {
        console.warn("[PROFILE_SYNC_FAIL]: Snapshot rejected. Using direct fetch fallback.", err.message);
        try {
          const snap = await getDoc(userRef);
          handleProfileSnapshot(snap);
        } catch (e) {
          setProfileLoading(false);
          profileLoaded.current = true;
          setAuthResolved(true);
        }
      }
    );

    const heartbeat = setInterval(() => {
       if (document.visibilityState === 'visible') {
          syncPresence(true);
       }
    }, 240000);

    const handleVisibility = () => {
       const isOnline = document.visibilityState === 'visible';
       syncPresence(isOnline);
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      unsubscribeProfile();
      clearInterval(heartbeat);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user, db]);

  return { 
    user, 
    profile, 
    loading: !authResolved, 
    profileLoading,         
    currentDeviceId
  };
}
