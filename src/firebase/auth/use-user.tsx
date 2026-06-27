'use client';

import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/types';
import { getDeviceId } from '@/lib/device';

/**
 * @fileOverview Hardened Auth Hub v15.0.
 * SECURITY: Real-time pass audit on every handshake.
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
        if (!profileLoaded.current) {
          setProfileLoading(true);
        }
      } else {
        setProfile(null);
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

    const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), async (docSnap) => {
      try {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const now = new Date();
          
          let passStatus: 'active' | 'expired' | 'none' = data.passStatus || 'none';
          
          // 1. INSTITUTIONAL PASS AUDIT
          if (data.passExpiresAt) {
             const expiryDate = new Date(data.passExpiresAt);
             if (now > expiryDate && data.passStatus === 'active') {
                // Auto-expire session node
                await updateDoc(doc(db, 'users', user.uid), {
                   passStatus: 'expired',
                   updatedAt: serverTimestamp()
                });
                passStatus = 'expired';
             } else if (now <= expiryDate) {
                passStatus = 'active';
             }
          }

          setProfile({ 
            ...data, 
            id: docSnap.id, 
            passStatus 
          } as UserProfile);
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
