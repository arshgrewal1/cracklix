'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview Production-Hardened PWA Installation Hook v6.0.
 * FIXED: Strictly detects standalone mode and manages install prompt state.
 */
export function usePWAInstall() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { toast } = useToast();

  const checkStatus = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    // 1. HARDWARE CHECK: Verify if app is actually running in standalone mode
    // Standard browsers (Android/Chrome/Windows)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    // iOS Safari
    const isIOSStandalone = (window.navigator as any).standalone === true;
    
    const actuallyInstalled = isStandalone || isIOSStandalone;
    
    setIsInstalled(actuallyInstalled);
    
    // 2. CHECK FOR PROMPT: If not installed, see if we have a stashed prompt
    if (!actuallyInstalled && (window as any).deferredPrompt) {
      setCanInstall(true);
    } else {
      setCanInstall(false);
    }
    
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    checkStatus();

    // Listener for the install prompt availability
    const handlePrompt = (e: any) => {
      e.preventDefault();
      // Stash event for one-click trigger
      (window as any).deferredPrompt = e;
      setCanInstall(true);
      console.log('[PWA_ENGINE] Installation prompt captured.');
    };

    // Listener for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      (window as any).deferredPrompt = null;

      toast({
        title: "Application Synchronized",
        description: "Cracklix is now ready on your home screen.",
      });
      console.log('[PWA_ENGINE] Installation successful.');
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    // Polling backup to catch browser state transitions
    const poll = setInterval(checkStatus, 2000);

    return () => {
       window.removeEventListener('beforeinstallprompt', handlePrompt);
       window.removeEventListener('appinstalled', handleAppInstalled);
       clearInterval(poll);
    };
  }, [checkStatus, toast]);

  const installApp = async () => {
    const prompt = (window as any).deferredPrompt;
    
    if (!prompt) {
      // If prompt is missing, we can't trigger the native sheet
      return false;
    }

    try {
      console.log('[PWA_ENGINE] Triggering native install sheet...');
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      
      if (outcome === 'accepted') {
        (window as any).deferredPrompt = null;
        setCanInstall(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error('[PWA_ENGINE] Install failure:', err);
      return false;
    }
  };

  return { isInstalled, canInstall, installApp, isReady };
}
