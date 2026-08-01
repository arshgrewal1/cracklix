'use client';

import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/types';
import { getDeviceId } from '@/lib/device';

/**
 * @fileOverview Hardened Auth Hub v18.0 [Presence Integrated].
 * UPDATED: Implemented live presence tracking with heartbeat sync.
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

  // 1. AUTH HANDSHAKE
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

  // 2. PROFILE & PRESENCE SYNC
  useEffect(() => {
    if (!user || !db) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    // A. Presence Node: Set Online
    const userRef = doc(db, 'users', user.uid);
    updateDoc(userRef, {
      online: true,
      lastSeen: serverTimestamp(),
      updatedAt: serverTimestamp()
    }).catch(() => {});

    // B. Live Profile Listener
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

    // C. Presence Node: Cleanup (Best effort for web)
    const handleVisibility = () => {
       if (document.visibilityState === 'hidden') {
          updateDoc(userRef, { online: false, lastSeen: serverTimestamp() }).catch(() => {});
       } else {
          updateDoc(userRef, { online: true, lastSeen: serverTimestamp() }).catch(() => {});
       }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      unsubscribeProfile();
      document.removeEventListener('visibilitychange', handleVisibility);
      updateDoc(userRef, { online: false, lastSeen: serverTimestamp() }).catch(() => {});
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
