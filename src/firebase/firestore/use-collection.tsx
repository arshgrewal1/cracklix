
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
 * @fileOverview Production-Grade Firestore Collection Hook v3.1.
 * FIXED: Implemented deep comparison check and robust error handling for missing indexes.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  
  const dataRef = useRef<string>("");

  // Generate a stable key for the query
  const queryKey = useMemo(() => {
    if (!query) return null;
    try {
      // Use the internal path or a stringified version of the query structure
      return (query as any)._query?.path?.segments?.join('/') || JSON.stringify(query);
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

        // Deep comparison check to prevent infinite loops
        const dataString = JSON.stringify(items);
        if (dataString !== dataRef.current) {
          dataRef.current = dataString;
          setData(items as T[]);
        }
        
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("[FIRESTORE_COLLECTION_ERROR]:", err);
        
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
