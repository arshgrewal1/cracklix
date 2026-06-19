'use client';

import { useEffect } from 'react';
import { useExamStore } from '@/store/useExamStore';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';

/**
 * @fileOverview Institutional Anti-Cheat Node v1.7 (Hardened).
 * FIXED: Synchronized store call with correct argument count.
 */

export default function AntiCheat() {
  const { addViolation } = useExamStore();
  const { toast } = useToast();
  const db = useFirestore();

  useEffect(() => {
    const handleBlur = () => {
      // 1. Audit Check: Only run if Firestore is initialized
      if (!db) return;

      // 2. Logic Audit: Log the violation to the cloud registry
      addViolation(db);
      
      toast({
        variant: "destructive",
        title: "Security Warning",
        description: "Switching tabs or windows is prohibited. This violation has been logged."
      });
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [addViolation, toast, db]);

  return null;
}
