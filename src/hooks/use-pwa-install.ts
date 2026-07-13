'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * @fileOverview Universal PWA Hook v3.4 [PRODUCTION READY].
 * FIXED: Optimized state polling and event capturing for maximum reliability.
 */
export function usePWAInstall() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const checkStatus = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;
    
    setIsInstalled(isStandalone);
    
    if ((window as any).deferredPrompt) {
      setCanInstall(true);
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    checkStatus();

    const handlePrompt = (e: any) => {
      console.log('[PWA] Capture: beforeinstallprompt');
      e.preventDefault();
      (window as any).deferredPrompt = e;
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      console.log('[PWA] Registry: App Installed');
      setIsInstalled(true);
      setCanInstall(false);
      (window as any).deferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    // Interval check for browsers that might trigger event before hook mount
    const poll = setInterval(() => {
      if ((window as any).deferredPrompt && !canInstall) {
        setCanInstall(true);
      }
    }, 1000);

    return () => {
       window.removeEventListener('beforeinstallprompt', handlePrompt);
       window.removeEventListener('appinstalled', handleAppInstalled);
       clearInterval(poll);
    };
  }, [checkStatus, canInstall]);

  const installApp = async () => {
    const prompt = (window as any).deferredPrompt;
    
    if (!prompt) {
      // Fallback: If prompt lost but user wants to install, redirect to guide
      window.location.href = '/install';
      return;
    }

    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        (window as any).deferredPrompt = null;
        setCanInstall(false);
      }
    } catch (err) {
      console.error('[PWA_INSTALL_ERROR]:', err);
    }
  };

  return { isInstalled, canInstall, installApp, isReady };
}
