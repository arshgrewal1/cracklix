'use client';

import { useState, useEffect, useRef } from 'react';
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
 * @fileOverview Hardened Document Listener Hook v3.1.
 * FIXED: Removed reliance on docRef.path as the primary dependency to avoid internal property access issues.
 * Uses the reference itself (caller should memoize).
 */
export function useDoc<T = DocumentData>(docRef: DocumentReference<T> | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const dataRef = useRef<string>("");

  useEffect(() => {
    if (!docRef) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot: DocumentSnapshot<T>) => {
        const docData = snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } : null;
        
        // Deep comparison using stringified state to prevent infinite recursion
        const dataString = JSON.stringify(docData);
        if (dataString !== dataRef.current) {
          dataRef.current = dataString;
          setData(docData as T);
        }
        
        setLoading(false);
        setError(null);
      },
      (err) => {
        if (err.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: docRef.path || 'document_node',
            operation: 'get',
          } satisfies SecurityRuleContext);

          errorEmitter.emit('permission-error', permissionError);
        }
        
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRef]);

  return { data, loading, error };
}
