'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * @fileOverview Universal PWA Hook v3.2.
 * FIXED: Stabilized dependency array to prevent "useEffect changed size" errors.
 */
export function usePWAInstall() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  const checkStatus = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;
    
    setIsInstalled(isStandalone);
    
    // Check if prompt was already captured by global listener
    if ((window as any).deferredPrompt) {
      setCanInstall(true);
    }
  }, []);

  useEffect(() => {
    checkStatus();

    const handlePrompt = (e: any) => {
      console.log('[PWA_REGISTRY] beforeinstallprompt event captured.');
      e.preventDefault();
      (window as any).deferredPrompt = e;
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      console.log('[PWA_REGISTRY] Application successfully installed on device.');
      setIsInstalled(true);
      setCanInstall(false);
      (window as any).deferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    const pollInterval = setInterval(() => {
      if ((window as any).deferredPrompt) {
        setCanInstall(true);
        clearInterval(pollInterval);
      }
    }, 1000);

    return () => {
       window.removeEventListener('beforeinstallprompt', handlePrompt);
       window.removeEventListener('appinstalled', handleAppInstalled);
       clearInterval(pollInterval);
    };
  }, [checkStatus]); // Removed canInstall from deps to fix size mismatch error

  const installApp = async () => {
    const prompt = (window as any).deferredPrompt;
    
    if (!prompt) {
      console.warn('[PWA_REGISTRY] No installation prompt available. Redirecting to hub.');
      window.location.href = '/install';
      return;
    }

    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      console.log(`[PWA_AUDIT] User response: ${outcome}`);
      
      if (outcome === 'accepted') {
        (window as any).deferredPrompt = null;
        setCanInstall(false);
      }
    } catch (err) {
      console.error('[PWA_INSTALL_ERROR]:', err);
    }
  };

  return { isInstalled, canInstall, installApp };
}
