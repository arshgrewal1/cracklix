'use client';

import { useEffect } from 'react';
import { useExamStore } from '@/store/useExamStore';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';

/**
 * @fileOverview Institutional Anti-Cheat Node v1.6 (Hardened).
 * FIXED: Pass explicit Firestore instance to prevent build-gate failures.
 */

export default function AntiCheat() {
  const { addViolation } = useExamStore();
  const { toast } = useToast();
  const db = useFirestore();

  useEffect(() => {
    const handleBlur = () => {
      if (!db) return;
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
