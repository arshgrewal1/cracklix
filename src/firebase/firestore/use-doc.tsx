
'use client';

import { useState, useEffect } from 'react';
import { 
  DocumentReference, 
  onSnapshot, 
  DocumentSnapshot, 
  DocumentData, 
  FirestoreError 
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '../errors';

/**
 * @fileOverview Hardened Document Listener Hook.
 * Prevents system-wide crashes and infinite loops by using stable path dependencies.
 */
export function useDoc<T = DocumentData>(docRef: DocumentReference<T> | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  // We use the path as a stable key to prevent infinite loops if the docRef 
  // object is recreated on every render by the caller.
  const path = docRef?.path;

  useEffect(() => {
    if (!docRef || !path) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot: DocumentSnapshot<T>) => {
        // Build the final data object once per snapshot
        const docData = snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } : null;
        
        setData(docData as T);
        setLoading(false);
        setError(null);
      },
      (err) => {
        // Only emit to global error listener if it's a permission failure
        if (err.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'get',
          } satisfies SecurityRuleContext);

          errorEmitter.emit('permission-error', permissionError);
        }
        
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [path, docRef]); // Crucial: Depend on the stable path string, not the unstable object reference

  return { data, loading, error };
}
