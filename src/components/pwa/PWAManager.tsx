
'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X, ShieldCheck, Zap, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * @fileOverview Institutional PWA Lifecycle Manager v25.0 (Ultra-Compact).
 * FIXED: Close button logic hardened with propagation stop.
 * UPDATED: Miniature design for non-intrusive student experience.
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

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        () => console.log('[PWA] Service Worker Active'),
        () => console.log('[PWA] Service Worker Offline')
      );
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      setDeferredPrompt(e);
      
      window.dispatchEvent(new CustomEvent('pwa-installable'));
      
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isExcluded = pathname?.includes('/attempt') || pathname?.startsWith('/admin');
      
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

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    setIsDismissed(true);
  };

  if (!mounted || isInstalled || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 50, opacity: 0, scale: 0.95 }}
        className="fixed bottom-24 md:bottom-10 right-4 md:right-10 z-[2000] w-[calc(100%-2rem)] md:w-auto max-w-sm pointer-events-auto"
      >
        <div className="bg-[#0F172A] text-white p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] shadow-5xl border border-white/10 flex items-center gap-4 relative overflow-hidden group">
          {/* Subtle Background Watermark */}
          <div className="absolute top-0 right-0 p-2 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000 pointer-events-none">
            <ShieldCheck className="h-16 w-16" />
          </div>
          
          {/* Miniature Icon Node */}
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
             <Zap className="h-5 w-5 md:h-6 md:w-6 text-[#F97316] fill-current" />
          </div>

          {/* Miniature Content Hub */}
          <div className="flex-1 min-w-0 text-left">
             <h4 className="text-[11px] md:text-[13px] font-black uppercase tracking-tight leading-none mb-1">Download App</h4>
             <p className="text-[7px] md:text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-tight truncate">Get fast, easy learning</p>
          </div>

          {/* Action Hub */}
          <div className="flex items-center gap-2">
             <Button 
              onClick={handleInstallClick}
              className="h-9 md:h-10 px-3 md:px-5 bg-[#F97316] hover:bg-orange-600 text-white font-black uppercase text-[8px] md:text-[9px] tracking-widest rounded-lg shadow-xl border-none transition-all active:scale-95 gap-1.5 flex items-center"
             >
                <Download className="h-3 w-3" /> INSTALL
             </Button>
             
             {/* Close Button - Hardened logic */}
             <button 
              onClick={handleClose}
              className="h-8 w-8 flex items-center justify-center text-slate-500 hover:text-white transition-colors cursor-pointer active:scale-90 shrink-0"
              aria-label="Close notification"
             >
                <X className="h-4 w-4" />
             </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

