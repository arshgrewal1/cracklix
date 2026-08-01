'use client';

import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/types';
import { getDeviceId } from '@/lib/device';

/**
 * @fileOverview Hardened Auth Hub v22.0 [Anti-Hang Sync].
 * FIXED: Added error callback to onSnapshot to prevent profileLoading from hanging on permission errors.
 * ADDED: Silent fallback to getDoc if real-time listener fails.
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
      setAuthResolved(true);
      
      if (firebaseUser) {
        if (!profileLoaded.current) {
          setProfileLoading(true);
        }
      } else {
        setProfile(null);
        profileDataRef.current = "";
        setProfileLoading(false);
        profileLoaded.current = true;
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
    };

    const unsubscribeProfile = onSnapshot(
      userRef, 
      handleProfileSnapshot,
      async (err) => {
        console.warn("[PROFILE_SYNC_FAIL]: Snapshot rejected. Using direct fetch fallback.", err.message);
        // Fallback: Try a single direct getDoc fetch if real-time fails
        try {
          const snap = await getDoc(userRef);
          handleProfileSnapshot(snap);
        } catch (e) {
          console.error("[PROFILE_FETCH_CRITICAL_FAIL]:", e);
          setProfileLoading(false);
          profileLoaded.current = true;
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