'use client';

import { useEffect } from 'react';

/**
 * @fileOverview Production Service Worker Registry.
 * UPDATED: Converted to TypeScript and added browser-only guard.
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('[PWA] ServiceWorker registered:', registration.scope);
          },
          (error) => {
            console.warn('[PWA] ServiceWorker failed:', error);
          }
        );
      });
    }
  }, []);

  return null;
}
