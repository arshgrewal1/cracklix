'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'primary' | 'secondary';
  showLabel?: boolean;
}

/**
 * @fileOverview Institutional PWA Trigger v4.0.
 * AUDIT: Strictly triggers native browser prompt.
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
    const checkState = () => {
      if (typeof window === 'undefined') return;

      // 1. Check if captured in layout.tsx
      if ((window as any).deferredPrompt) {
        setDeferredPrompt((window as any).deferredPrompt);
        console.log('[PWA_BUTTON] Prompt detected in global state');
      }

      // 2. Check standalone mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
      if (isStandalone) {
        setIsInstalled(true);
      }
    };

    const handleInstallable = () => {
      setDeferredPrompt((window as any).deferredPrompt);
      console.log('[PWA_BUTTON] pwa-installable event received');
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
      console.warn('[PWA_BUTTON] Attempted install but prompt is null');
      toast({
        title: "Install from Menu",
        description: "To install Cracklix, tap the 3-dots menu or Share icon and select 'Add to Home Screen'.",
      });
      return;
    }

    try {
      console.log('[PWA_BUTTON] Triggering native install dialog');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA_BUTTON] User choice: ${outcome}`);
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        (window as any).deferredPrompt = null;
      }
    } catch (err) {
      console.error('[PWA_BUTTON] Prompt execution error:', err);
    }
  };

  // Hide if already installed
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
      <Download className="h-4 w-4" />
      {showLabel && "Install App"}
    </Button>
  );
}
