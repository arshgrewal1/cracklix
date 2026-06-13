'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'primary' | 'secondary';
  showLabel?: boolean;
}

/**
 * @fileOverview Hardened PWA Native Prompt Trigger v5.0.
 * UPDATED: Enhanced listener for state synchronization.
 */
export default function PWAInstallButton({ 
  className, 
  variant = 'default',
  showLabel = true 
}: PWAInstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkState = () => {
      // 1. Capture from global window (Next.js layout may have already caught it)
      if ((window as any).deferredPrompt) {
        setDeferredPrompt((window as any).deferredPrompt);
      }

      // 2. Check if already running in standalone mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
      if (isStandalone) {
        setIsInstalled(true);
      }
    };

    const handleInstallable = () => {
      console.log('[PWA_BUTTON] Syncing deferredPrompt from global state');
      setDeferredPrompt((window as any).deferredPrompt);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    checkState();
    window.addEventListener('pwa-installable', handleInstallable);
    window.addEventListener('pwa-installed', handleInstalled);

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  const handleInstall = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!deferredPrompt) {
      console.warn('[PWA_BUTTON] Native prompt not available. Showing instructions.');
      toast({
        title: "Install from Menu",
        description: "To install Cracklix, tap your browser's menu (3 dots or share icon) and select 'Add to Home Screen'.",
      });
      return;
    }

    try {
      console.log('[PWA_BUTTON] Triggering native install prompt');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA_BUTTON] User choice outcome: ${outcome}`);
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        (window as any).deferredPrompt = null;
      }
    } catch (err) {
      console.error('[PWA_BUTTON] Error triggering prompt:', err);
    }
  };

  // Hide the button if the app is already installed
  if (isInstalled) return null;

  return (
    <Button
      onClick={handleInstall}
      className={cn(
        "font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl transition-all active:scale-95",
        variant === 'primary' ? "bg-primary hover:bg-orange-600 text-white" : "",
        className
      )}
    >
      {deferredPrompt ? <Download className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
      {showLabel && "Install App"}
    </Button>
  );
}
