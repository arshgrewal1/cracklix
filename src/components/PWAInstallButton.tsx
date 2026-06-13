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
 * @fileOverview Production PWA Trigger v7.0.
 * Handles Native Browser Prompts (Android/Chrome) and Add to Home Screen (iOS).
 */
export default function PWAInstallButton({ 
  className, 
  variant = 'default',
  showLabel = true 
}: PWAInstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Detect Standalone Mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    setIsInstalled(isStandalone);

    // 2. Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // 3. Sync initial prompt
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
    }

    // 4. Listen for availability
    const handleInstallable = () => {
      console.log('[PWA] Install available');
      setDeferredPrompt((window as any).deferredPrompt);
    };

    window.addEventListener('pwa-installable', handleInstallable);
    return () => window.removeEventListener('pwa-installable', handleInstallable);
  }, []);

  const handleInstall = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isIOS) {
       toast({
         title: "Add to Home Screen",
         description: "Tap 'Share' button in Safari and select 'Add to Home Screen' for direct access.",
       });
       return;
    }

    if (!deferredPrompt) {
      console.log('[PWA] Prompt not available yet');
      return;
    }

    try {
      console.log('[PWA] PWA install triggered');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        (window as any).deferredPrompt = null;
      }
    } catch (err) {
      console.error('[PWA] Installation failed:', err);
    }
  };

  if (isInstalled) return null;
  // If not iOS and no prompt, hide button unless we want to show it for debugging
  if (!isIOS && !deferredPrompt) return null;

  return (
    <Button
      onClick={handleInstall}
      className={cn(
        "font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl transition-all active:scale-95",
        variant === 'primary' ? "bg-primary hover:bg-orange-600 text-white" : "",
        className
      )}
    >
      {isIOS ? <Smartphone className="h-4 w-4" /> : <Download className="h-4 w-4" />}
      {showLabel && (isIOS ? "Install App" : "Install App")}
    </Button>
  );
}
