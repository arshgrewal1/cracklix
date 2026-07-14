'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview Production-Hardened PWA Installation Hook v5.0.
 * Handles state persistence, event capture, and one-time success notifications.
 */
export function usePWAInstall() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { toast } = useToast();

  const checkStatus = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    // 1. Check native browser standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;
    
    // 2. Check local persistence
    const wasInstalled = localStorage.getItem('cracklix_pwa_installed') === 'true';
    
    setIsInstalled(isStandalone || wasInstalled);
    
    // 3. Check for stashed install prompt
    if ((window as any).deferredPrompt) {
      setCanInstall(true);
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    checkStatus();

    const handlePrompt = (e: any) => {
      e.preventDefault();
      // Stash event for one-click trigger
      (window as any).deferredPrompt = e;
      setCanInstall(true);
      console.log('[PWA_ENGINE] Installation prompt captured and stashed.');
    };

    const handleAppInstalled = () => {
      // PERSISTENCE PROTOCOL: Mark as installed
      localStorage.setItem('cracklix_pwa_installed', 'true');
      setIsInstalled(true);
      setCanInstall(false);
      (window as any).deferredPrompt = null;

      // SUCCESS PROTOCOL: Only show toast if NOT shown before for THIS installation session
      const successShown = sessionStorage.getItem('cracklix_install_success_shown');
      if (!successShown) {
        toast({
          title: "Application Synchronized",
          description: "Cracklix is now ready on your home screen.",
        });
        sessionStorage.setItem('cracklix_install_success_shown', 'true');
      }
      console.log('[PWA_ENGINE] Installation successful. Registry updated.');
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    // HEALER: Poll to catch state changes if listeners are delayed by browser
    const poll = setInterval(() => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone === true;
      
      if (isStandalone && !isInstalled) {
        localStorage.setItem('cracklix_pwa_installed', 'true');
        setIsInstalled(true);
      }

      if ((window as any).deferredPrompt && !canInstall) {
        setCanInstall(true);
      }
    }, 1000);

    return () => {
       window.removeEventListener('beforeinstallprompt', handlePrompt);
       window.removeEventListener('appinstalled', handleAppInstalled);
       clearInterval(poll);
    };
  }, [checkStatus, isInstalled, canInstall, toast]);

  const installApp = async () => {
    const prompt = (window as any).deferredPrompt;
    
    if (!prompt) {
      // Fallback if prompt is missing but we're in browser
      window.location.href = '/install';
      return;
    }

    try {
      console.log('[PWA_ENGINE] Triggering native install sheet...');
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      
      if (outcome === 'accepted') {
        (window as any).deferredPrompt = null;
        setCanInstall(false);
      }
    } catch (err) {
      console.error('[PWA_ENGINE] Critical install failure:', err);
    }
  };

  return { isInstalled, canInstall, installApp, isReady };
}
