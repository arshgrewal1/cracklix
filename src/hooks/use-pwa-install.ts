'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * @fileOverview Universal PWA Hook v3.0.
 * Hardened to capture and trigger the installation prompt with maximum reliability.
 */
export function usePWAInstall() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

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
      console.log('[PWA_REGISTRY] beforeinstallprompt event captured.');
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      (window as any).deferredPrompt = e;
      // Update UI notify the user they can install the PWA
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
    
    // Fallback check: if the event already fired before mount
    if ((window as any).deferredPrompt) {
      setCanInstall(true);
    }

    return () => {
       window.removeEventListener('beforeinstallprompt', handlePrompt);
       window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [checkStatus]);

  const installApp = async () => {
    const prompt = (window as any).deferredPrompt;
    
    if (!prompt) {
      console.warn('[PWA_REGISTRY] No installation prompt available in current browser context.');
      // If we can't trigger the prompt, we redirect to ensure the user is on the right page
      if (window.location.pathname !== '/install/') {
        window.location.href = '/install/';
      }
      return;
    }

    try {
      // Show the install prompt
      await prompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await prompt.userChoice;
      console.log(`[PWA_AUDIT] User response to installation: ${outcome}`);
      
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
