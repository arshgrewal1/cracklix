'use client';

import { useEffect } from 'react';

/**
 * @fileOverview Client-side PWA Event Handler.
 * Captures the 'beforeinstallprompt' event and stashes it globally.
 */
export default function PWAInstallHandler() {
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      (window as any).deferredPrompt = e;
      console.log('[PWA_REGISTRY] beforeinstallprompt event captured.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return null;
}
