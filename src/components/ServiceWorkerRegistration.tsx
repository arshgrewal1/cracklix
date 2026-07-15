
'use client';

import { useEffect } from 'react';

/**
 * @fileOverview Production Service Worker Registry Node v3.0.
 * FIXED: Implemented resilient registration that handles late mounting and prevents hydration stalls.
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const register = () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('[PWA] ServiceWorker node synchronized:', registration.scope);
          },
          (error) => {
            console.warn('[PWA] ServiceWorker registration bypassed:', error);
          }
        );
      };

      // If the page is already loaded, register immediately
      if (document.readyState === 'complete') {
        register();
      } else {
        // Otherwise wait for the load event
        window.addEventListener('load', register);
        return () => window.removeEventListener('load', register);
      }
    }
  }, []);

  return null;
}
