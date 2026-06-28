'use client';

import { useEffect } from 'react';
import { useExamStore } from '@/store/useExamStore';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';

/**
 * @fileOverview Operational Anti-Cheat Node v5.4.
 * FIXED: Correctly passed Firestore instance to addViolation.
 */
export default function AntiCheat() {
  const { addViolation } = useExamStore();
  const { toast } = useToast();
  const db = useFirestore();

  useEffect(() => {
    const handleBlur = () => {
      // Violation tracking logic
      if (db) {
        addViolation(db);
        toast({
          variant: "destructive",
          title: "Security Warning",
          description: "Switching tabs or windows is prohibited. This violation has been logged."
        });
      }
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [addViolation, toast, db]);

  return null;
}
