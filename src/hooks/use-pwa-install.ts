'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * @fileOverview Universal PWA Hook v4.0 [PRODUCTION HARDENED].
 * FIXED: Implemented high-frequency polling and handshake protocol for One-Click install.
 */
export function usePWAInstall() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const checkStatus = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    // Check if app is running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;
    
    setIsInstalled(isStandalone);
    
    // Check if the prompt is already stashed in global window
    if ((window as any).deferredPrompt) {
      setCanInstall(true);
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    checkStatus();

    const handlePrompt = (e: any) => {
      console.log('[PWA_SYNC] Installation prompt captured.');
      e.preventDefault();
      // Stash event for one-click trigger
      (window as any).deferredPrompt = e;
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      console.log('[PWA_SYNC] Registry Update: App Installed.');
      setIsInstalled(true);
      setCanInstall(false);
      (window as any).deferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    // HEALER: Poll every 500ms to catch the event if listener missed it
    const poll = setInterval(() => {
      if ((window as any).deferredPrompt && !canInstall) {
        console.log('[PWA_SYNC] Handshake: Prompt found in global memory.');
        setCanInstall(true);
      }
      
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone === true;
      if (isStandalone !== isInstalled) setIsInstalled(isStandalone);
    }, 500);

    return () => {
       window.removeEventListener('beforeinstallprompt', handlePrompt);
       window.removeEventListener('appinstalled', handleAppInstalled);
       clearInterval(poll);
    };
  }, [checkStatus, canInstall, isInstalled]);

  const installApp = async () => {
    const prompt = (window as any).deferredPrompt;
    
    if (!prompt) {
      console.warn('[PWA_SYNC] Installation prompt not found. Redirecting to setup guide.');
      window.location.href = '/install';
      return;
    }

    try {
      console.log('[PWA_SYNC] Initializing One-Click Install...');
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      console.log(`[PWA_SYNC] Outcome: ${outcome}`);
      
      if (outcome === 'accepted') {
        (window as any).deferredPrompt = null;
        setCanInstall(false);
      }
    } catch (err) {
      console.error('[PWA_SYNC] Critical install failure:', err);
    }
  };

  return { isInstalled, canInstall, installApp, isReady };
}
