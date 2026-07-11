'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * @fileOverview Universal PWA Hook v3.3 (Audit Fixed).
 * FIXED: Stabilized dependency array to prevent "useEffect changed size" and hydration loop errors.
 */
export function usePWAInstall() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkStatus = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;
    
    setIsInstalled(isStandalone);
    
    if ((window as any).deferredPrompt) {
      setCanInstall(true);
    }
  }, []);

  useEffect(() => {
    checkStatus();

    const handlePrompt = (e: any) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      (window as any).deferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    pollIntervalRef.current = setInterval(() => {
      if ((window as any).deferredPrompt) {
        setCanInstall(true);
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      }
    }, 1000);

    return () => {
       window.removeEventListener('beforeinstallprompt', handlePrompt);
       window.removeEventListener('appinstalled', handleAppInstalled);
       if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [checkStatus]);

  const installApp = async () => {
    const prompt = (window as any).deferredPrompt;
    
    if (!prompt) {
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

  return { isInstalled, canInstall, installApp };
}