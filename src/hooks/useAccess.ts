'use client';

import { useEffect, useState } from "react";
import { useUser } from "@/firebase";
import { hasSeriesAccess } from "@/lib/access-control";
import { TestSeries } from "@/types";

/**
 * @fileOverview Production Access Protection Hook.
 * Dynamically gates UI components based on real-time pass status and granular permissions.
 */
export function useAccess() {
  const { profile, loading } = useUser();

  const checkAccess = (series: TestSeries | null) => {
    if (!series) return { hasAccess: false, status: 'LOCKED' as const };
    return hasSeriesAccess(profile, series);
  };

  const isElite = profile?.passStatus === 'active';
  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN';

  return { 
    hasAccess: checkAccess, 
    isElite, 
    isAdmin,
    loading 
  };
}
