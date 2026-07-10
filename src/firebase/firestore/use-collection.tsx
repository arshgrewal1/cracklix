'use client';

import { useState, useEffect, useMemo } from 'react';
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
 * FIXED: Uses stringified query footprint to prevent infinite loops from non-memoized queries.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  // Generate a stable key for the query to prevent unnecessary re-subscriptions
  const queryKey = useMemo(() => {
    if (!query) return null;
    // Attempt to extract a unique fingerprint from the query object
    try {
      return JSON.stringify((query as any)._query || query);
    } catch (e) {
      return (query as any).path || 'unstable_query';
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
