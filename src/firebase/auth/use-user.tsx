'use client';

import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/types';
import { getDeviceId } from '@/lib/device';

/**
 * @fileOverview Hardened Auth & Profile Hub v12.0 (Auto-Activation Aware).
 * SECURITY: Real-time pass status derivation with rapid auto-activation from queue.
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
    }, (err) => {
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

    const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), async (docSnap) => {
      try {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const now = new Date();
          
          let passStatus: 'active' | 'expired' | 'none' = data.passStatus || 'none';
          let passActive = false;

          // 1. PRIMARY PASS AUDIT
          if (data.passExpiresAt) {
             const expiryDate = new Date(data.passExpiresAt);
             if (now > expiryDate) {
                passStatus = 'expired';
                passActive = false;
                
                // 2. RAPID QUEUE ACTIVATION (Eliminates service gaps)
                if (data.queuedPasses && data.queuedPasses.length > 0) {
                   const nextPass = data.queuedPasses[0];
                   const remainingQueue = data.queuedPasses.slice(1);
                   
                   const newExpiry = new Date();
                   newExpiry.setDate(newExpiry.getDate() + nextPass.durationDays);

                   await updateDoc(doc(db, 'users', user.uid), {
                      pass: {
                         active: true,
                         plan: nextPass.planId.toUpperCase(),
                         purchaseDate: now.toISOString(),
                         expiryDate: newExpiry.toISOString(),
                         freePassClaimed: nextPass.planId === 'free-pass'
                      },
                      passStatus: 'active',
                      passExpiresAt: newExpiry.toISOString(),
                      status: nextPass.planId,
                      queuedPasses: remainingQueue,
                      updatedAt: serverTimestamp()
                   });
                   return; // Snapshot will re-trigger immediately
                }
             } else {
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
