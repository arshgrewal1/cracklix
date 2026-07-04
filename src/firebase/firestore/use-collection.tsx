
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
 * Hardened to prevent infinite loop loops if query objects are not memoized by the caller.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!query) {
      console.log('[useCollection] Query is null, setting loading to false.');
      setData(null);
      setLoading(false);
      return;
    }

    console.log('[useCollection] New query received, setting up snapshot listener...');
    setLoading(true);

    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        console.log('[useCollection] Snapshot received, processing data...');
        const items = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setData(items as T[]);
        setLoading(false);
        setError(null);
        console.log('[useCollection] Data processed, loading finished.');
      },
      (err) => {
        console.error('[useCollection] Error in snapshot listener:', err);
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

    return () => {
      console.log('[useCollection] Unsubscribing from snapshot listener.');
      unsubscribe();
    }
  }, [query]);

  return { data, loading, error };
}
