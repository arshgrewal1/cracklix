'use client';

import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/types';
import { getDeviceId } from '@/lib/device';

/**
 * @fileOverview Hardened Auth Hub v17.0.
 * FIXED: Removed database write operations from within the snapshot listener to prevent infinite loops.
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
          const now = new Date();
          
          let passStatus: 'active' | 'expired' | 'none' = data.passStatus || 'none';
          
          if (data.passExpiresAt) {
             const expiryDate = new Date(data.passExpiresAt);
             if (now > expiryDate) {
                passStatus = 'expired';
             } else {
                passStatus = 'active';
             }
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
        } else {
          setProfile(null);
        }
      } catch (e) {
        console.error("[PROFILE_AUDIT_ERROR]:", e);
      } finally {
        profileLoaded.current = true;
        setProfileLoading(false);
      }
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
