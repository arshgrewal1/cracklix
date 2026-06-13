'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'primary' | 'secondary';
  showLabel?: boolean;
}

/**
 * @fileOverview Universal PWA Installation Trigger v2.0 (Hardened).
 * UPDATED: Replaced conditional "How to install" text with strict "Install App" label.
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
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('[PWA] beforeinstallprompt captured');
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      console.log('[PWA] App installed successfully');
    };

    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
        setIsInstalled(true);
      }
    };

    // Sync with global script in layout.tsx
    if (typeof window !== 'undefined') {
      if ((window as any).deferredPrompt) {
        setDeferredPrompt((window as any).deferredPrompt);
      }
      
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
      
      // Listen for the custom event dispatched by layout.tsx script
      window.addEventListener('pwa-installable', () => {
        if ((window as any).deferredPrompt) {
          setDeferredPrompt((window as any).deferredPrompt);
        }
      });
      
      checkInstalled();
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!deferredPrompt) {
      toast({
        title: "Browser Menu",
        description: "To install: Tap the 3-dots (Android) or Share button (iOS) and select 'Add to Home Screen'.",
      });
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        (window as any).deferredPrompt = null;
      }
    } catch (err) {
      console.error('[PWA] Installation prompt failed:', err);
    }
  };

  // Hide button if already installed
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
