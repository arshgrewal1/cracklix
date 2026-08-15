'use client';

import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/types';
import { getDeviceId } from '@/lib/device';

/**
 * @fileOverview Hardened Auth Hub v27.0 [Real-Time Presence].
 * FIXED: Implemented heartbeat and visibility listeners to prevent stale "Online" status.
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
        setAuthResolved(true);
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

    // Optimized Presence Handler
    const syncPresence = (isOnline: boolean) => {
       updateDoc(userRef, {
          online: isOnline,
          lastSeen: serverTimestamp(),
          updatedAt: serverTimestamp()
       }).catch(() => {});
    };

    // Heartbeat: 4 min (strictly less than admin's 5 min threshold)
    const heartbeat = setInterval(() => {
       if (document.visibilityState === 'visible') {
          syncPresence(true);
       }
    }, 240000);

    const handleVisibility = () => {
       const isOnline = document.visibilityState === 'visible';
       syncPresence(isOnline);
    };

    // Initial Online Set
    syncPresence(true);
    document.addEventListener('visibilitychange', handleVisibility);

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
      setAuthResolved(true);
    };

    const unsubscribeProfile = onSnapshot(
      userRef, 
      handleProfileSnapshot,
      async (err) => {
        setAuthResolved(true);
      }
    );

    return () => {
      unsubscribeProfile();
      clearInterval(heartbeat);
      document.removeEventListener('visibilitychange', handleVisibility);
      // Offline transition attempt on unmount
      syncPresence(false);
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