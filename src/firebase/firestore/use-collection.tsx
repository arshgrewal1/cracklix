
'use client';

import { useState, useEffect, useRef } from 'react';
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
 * @fileOverview Production-Grade Firestore Collection Hook v3.5.
 * FIXED: Added JSON comparison to snapshot listener to prevent "building" feel
 * caused by repeated state updates with identical data.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const dataRef = useRef<string>("");
  
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

        // Registry Optimization: Only update state if data node differs
        const dataString = JSON.stringify(items);
        if (dataString !== dataRef.current) {
          dataRef.current = dataString;
          setData(items as T[]);
        }
        
        setLoading(false);
        setError(null);
      },
      (err) => {
        if (process.env.NODE_ENV === 'development') {
          console.error("[FIRESTORE_COLLECTION_ERROR]:", err);
        }
        
        if (err.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: 'collection_query',
            operation: 'list',
          } satisfies SecurityRuleContext);

          errorEmitter.emit('permission-error', permissionError);
        }
        
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}
