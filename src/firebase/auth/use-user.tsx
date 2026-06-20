'use client';

import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/types';
import { getDeviceId } from '@/lib/device';

/**
 * @fileOverview Hardened Auth & Profile Hub v7.0.
 * PERFORMANCE: Decoupled Auth state from Profile Sync to prevent UI blocking.
 * STABILITY: Guaranteed loading state resolution to prevent skeleton-lock.
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
    getDeviceId().then(id => {
      if (id) setCurrentDeviceId(id);
    });
  }, []);

  useEffect(() => {
    if (!auth) {
      setAuthResolved(true);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthResolved(true);
      
      if (firebaseUser) {
        // Only set loading if we haven't successfully loaded before
        if (!profileLoaded.current) setProfileLoading(true);
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

    const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      try {
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // REAL-TIME EXPIRY AUDIT
          let passStatus = data.passStatus || 'none';
          let passActive = false;

          if (data.passExpiresAt) {
             const expiryDate = new Date(data.passExpiresAt);
             const now = new Date();
             
             if (now > expiryDate) {
                passStatus = 'expired';
                passActive = false;
             } else if (data.pass?.active !== false) {
                passStatus = 'active';
                passActive = true;
             }
          } else if (data.pass?.active === true) {
             passStatus = 'active';
             passActive = true;
          }

          setProfile({ 
            ...data, 
            id: docSnap.id, 
            passStatus,
            pass: {
              ...(data.pass || {}),
              active: passActive
            }
          } as UserProfile);
        } else {
          setProfile(null);
        }
      } catch (e) {
        console.error("[PROFILE_PARSE_ERROR]:", e);
      } finally {
        profileLoaded.current = true;
        setProfileLoading(false);
      }
    }, (err) => {
      console.error("[PROFILE_SYNC_FAILURE]:", err);
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
