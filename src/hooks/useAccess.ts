'use client';

import { useEffect, useState } from "react";
import { hasActivePass } from "@/lib/access-control";

/**
 * @fileOverview Preparation Node Protection Hook.
 * Dynamically gates UI components based on real-time pass status.
 */
export function useAccess(userId?: string) {
  const [access, setAccess] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!userId) {
       setChecking(false);
       return;
    }

    setChecking(true);
    hasActivePass(userId)
      .then(setAccess)
      .finally(() => setChecking(false));
  }, [userId]);

  return { hasAccess: access, checking };
}
