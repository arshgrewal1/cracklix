
'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Download, X, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * @fileOverview Institutional PWA Lifecycle Manager v3.1.
 * UPDATED: Optimized installation flow and refined event listeners.
 */
export default function PWAManager() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Service Worker registration
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (reg) => console.log('[PWA] ServiceWorker registered'),
          (err) => console.log('[PWA] ServiceWorker failed:', err)
        );
      });
    }

    // 2. Install prompt listener
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after a short delay on non-critical pages
      const timer = setTimeout(() => {
        if (!pathname?.includes('/attempt') && !pathname?.startsWith('/admin')) {
          setShowPrompt(true);
        }
      }, 5000);
      
      return () => clearTimeout(timer);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
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
  }, [pathname]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] Install choice: ${outcome}`);
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (isInstalled || !deferredPrompt) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 md:bottom-10 left-4 right-4 md:left-auto md:right-10 z-[2000] md:w-96"
        >
          <div className="bg-[#0F172A] text-white p-5 rounded-[2.5rem] shadow-5xl border border-white/10 flex items-center gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-20 w-20" />
            </div>
            
            <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/20">
               <Zap className="h-6 w-6 text-primary fill-current" />
            </div>

            <div className="flex-1 min-w-0 text-left">
               <h4 className="text-[13px] font-black uppercase tracking-tight leading-none mb-1">Install CRACKLIX App</h4>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Fast Offline Access</p>
            </div>

            <div className="flex items-center gap-2">
               <Button 
                onClick={handleInstallClick}
                className="h-10 px-4 bg-primary hover:bg-orange-600 text-white font-black uppercase text-[9px] tracking-widest rounded-xl shadow-lg border-none transition-all active:scale-95"
               >
                  Install
               </Button>
               <button 
                onClick={() => setShowPrompt(false)}
                className="p-2 text-slate-500 hover:text-white transition-colors"
               >
                  <X className="h-4 w-4" />
               </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
