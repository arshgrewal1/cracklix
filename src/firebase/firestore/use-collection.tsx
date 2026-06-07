
'use client';

import { useState, useEffect } from 'react';
import { 
  Query, 
  onSnapshot, 
  QuerySnapshot, 
  DocumentData, 
  FirestoreError 
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '../errors';

/**
 * @fileOverview Production-Grade Firestore Collection Hook.
 * Features: Infinite loop prevention, memory leak cleanup, and strict permission monitoring.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    // 1. Stability Guard: Prevent initialization with invalid query objects
    if (!query || typeof query !== 'object') {
      setLoading(false);
      setData(null);
      return;
    }

    setLoading(true);

    // 2. Real-time Subscription with robust cleanup
    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        const items = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setData(items as T[]);
        setLoading(false);
        setError(null);
      },
      (err) => {
        // 3. Security & Operational Logging
        if (err.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: (query as any)?._query?.path?.segments?.join('/') || 'registry_node',
            operation: 'list',
          } satisfies SecurityRuleContext);

          errorEmitter.emit('permission-error', permissionError);
        }
        
        setError(err);
        setLoading(false);
        console.error("[FIRESTORE RUNTIME ERROR]:", err);
      }
    );

    return () => unsubscribe();
  }, [query]); // Dependencies are strictly controlled to prevent infinite re-renders

  return { data, loading, error };
}
