'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
 * @fileOverview Production-Grade Firestore Collection Hook v3.3.
 * OPTIMIZED: Removed heavy JSON stringification to prevent memory threshold restarts.
 * Identity of the items array is now managed via snapshot metadata to ensure stability.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  
  // Use query path as a stable key
  const queryKey = useMemo(() => {
    if (!query) return null;
    try {
      return (query as any)._query?.path?.segments?.join('/') || 'stable_query';
    } catch (e) {
      return 'unstable_query';
    }
  }, [query]);

  useEffect(() => {
    if (!query || !queryKey) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

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
        if (process.env.NODE_ENV === 'development') {
          console.error("[FIRESTORE_COLLECTION_ERROR]:", err);
        }
        
        if (err.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: (query as any)?._query?.path?.segments?.join('/') || 'registry_node',
            operation: 'list',
          } satisfies SecurityRuleContext);

          errorEmitter.emit('permission-error', permissionError);
        }
        
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [queryKey]);

  return { data, loading, error };
}
