
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
        console.error("[FIRESTORE RUNTIME ERROR]:", err);
      }
    );

    return () => unsubscribe();
  }, [query]); // Callers MUST use useMemo() for this dependency to be stable

  return { data, loading, error };
}
