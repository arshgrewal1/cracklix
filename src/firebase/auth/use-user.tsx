'use client';

import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/types';
import { getDeviceId } from '@/lib/device';

/**
 * @fileOverview Auth & Profile Hook v5.0.
 * Optimized: Immediate state resolution and robust profile syncing.
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

  useEffect(() => {
    if (!auth) return;

    // Use onAuthStateChanged to listen to login/logout events globally
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthResolved(true);
      
      if (firebaseUser) {
        setProfileLoading(!profileLoaded.current);
      } else {
        setProfile(null);
        setProfileLoading(false);
        profileLoaded.current = true;
      }
    }, (err) => {
      console.error("[AUTH_SYNC_FAILURE]:", err);
      setAuthResolved(true);
      setProfileLoading(false);
    });

    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    if (!user || !db) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(!profileLoaded.current);

    const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        let passStatus = data.passStatus || 'none';
        
        if (data.passExpiresAt) {
           const expiry = new Date(data.passExpiresAt);
           if (new Date() > expiry) {
              passStatus = 'expired';
           } else {
              passStatus = 'active';
           }
        }

        setProfile({ ...data, id: docSnap.id, passStatus } as UserProfile);
      } else {
        setProfile(null);
      }
      
      profileLoaded.current = true;
      setProfileLoading(false);
    }, (err) => {
      profileLoaded.current = true;
      setProfileLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user, db]);

  return { 
    user, 
    profile, 
    loading: !authResolved, 
    profileLoading,         
    currentDeviceId
  };
}
