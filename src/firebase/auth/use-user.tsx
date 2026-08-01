'use client';

import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/types';
import { getDeviceId } from '@/lib/device';

/**
 * @fileOverview Hardened Auth Hub v21.0 [Presence Hub].
 * UPDATED: Optimized profile loading to prevent login loops during background sync.
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

    const unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
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
        }
      } catch (e) {
        console.error("[PROFILE_SYNC_ERROR]:", e);
      } finally {
        profileLoaded.current = true;
        setProfileLoading(false);
      }
    });

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
