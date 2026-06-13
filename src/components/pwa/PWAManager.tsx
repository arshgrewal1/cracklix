
'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X, ShieldCheck, Zap, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * @fileOverview Institutional PWA Lifecycle Manager v24.0 (Design Match).
 * FIXED: Close button event propagation resolved.
 * MATCHED: High-fidelity dark pill design from user screenshot.
 */
export default function PWAManager() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 1. Service Worker registration
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        () => console.log('[PWA] Service Worker Active'),
        () => console.log('[PWA] Service Worker Offline')
      );
    }

    // 2. Capture Install Prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      setDeferredPrompt(e);
      
      window.dispatchEvent(new CustomEvent('pwa-installable'));
      
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isExcluded = pathname?.includes('/attempt') || pathname?.startsWith('/admin');
      
      // Only show if not dismissed in this session
      if (!isExcluded && !isStandalone && !isDismissed) {
        const timer = setTimeout(() => setShowPrompt(true), 3000);
        return () => clearTimeout(timer);
      }
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
      setShowPrompt(false);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [pathname, isDismissed]);

  const handleInstallClick = async () => {
    const prompt = deferredPrompt || (window as any).deferredPrompt;
    if (!prompt) return;

    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
      (window as any).deferredPrompt = null;
      setDeferredPrompt(null);
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPrompt(false);
    setIsDismissed(true); // Prevent re-showing in this session
  };

  if (!mounted || isInstalled || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.9 }}
        className="fixed bottom-24 md:bottom-12 right-4 md:right-12 z-[2000] w-[calc(100%-2rem)] md:w-auto max-w-md pointer-events-auto"
      >
        <div className="bg-[#0F172A] text-white p-4 md:p-6 rounded-[2rem] md:rounded-[3rem] shadow-5xl border border-white/10 flex items-center gap-4 md:gap-8 relative overflow-hidden group">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000">
            <ShieldCheck className="h-24 w-24" />
          </div>
          
          {/* Left Icon Node */}
          <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
             <Zap className="h-6 w-6 md:h-8 md:w-8 text-[#F97316] fill-current" />
          </div>

          {/* Content Node */}
          <div className="flex-1 min-w-0 text-left">
             <h4 className="text-sm md:text-lg font-black uppercase tracking-tight leading-none mb-1 md:mb-2">Download Cracklix</h4>
             <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Install for fast, easy learning</p>
          </div>

          {/* Action Node */}
          <div className="flex items-center gap-4">
             <Button 
              onClick={handleInstallClick}
              className="h-10 md:h-12 px-5 md:px-8 bg-gradient-to-r from-[#F97316] to-orange-600 hover:to-orange-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-xl border-none transition-all active:scale-95 gap-2 flex items-center"
             >
                <Download className="h-3.5 w-3.5" /> INSTALL
             </Button>
             
             {/* Close Button - FIXED Logic */}
             <button 
              onClick={handleClose}
              className="p-2 text-slate-500 hover:text-white transition-colors cursor-pointer active:scale-90"
              aria-label="Close notification"
             >
                <X className="h-5 w-5" />
             </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
