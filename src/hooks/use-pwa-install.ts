'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * @fileOverview Universal PWA Hook v2.0.
 * Hardened to capture and persist the installation prompt across the platform lifecycle.
 */
export function usePWAInstall() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  const checkStatus = useCallback(() => {
    if (typeof window === 'undefined') return;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);
    
    // Check if the prompt was already captured and saved to the window object
    if ((window as any).deferredPrompt) {
      setCanInstall(true);
    }
  }, []);

  useEffect(() => {
    checkStatus();

    const handlePrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      (window as any).deferredPrompt = e;
      // Update UI notify the user they can install the PWA
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      // Log the installation to the registry
      console.log('[PWA_REGISTRY] Hub successfully installed.');
      setIsInstalled(true);
      setCanInstall(false);
      (window as any).deferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => {
       window.removeEventListener('beforeinstallprompt', handlePrompt);
       window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [checkStatus]);

  const installApp = async () => {
    const prompt = (window as any).deferredPrompt;
    if (!prompt) return;

    // Show the install prompt
    prompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await prompt.userChoice;
    console.log(`[PWA_AUDIT] User response to install: ${outcome}`);
    
    if (outcome === 'accepted') {
      (window as any).deferredPrompt = null;
      setCanInstall(false);
    }
  };

  return { isInstalled, canInstall, installApp };
}
