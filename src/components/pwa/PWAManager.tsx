'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { X, Zap, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * @fileOverview Hardened Institutional PWA Lifecycle Manager v30.0.
 * UPDATED: Persistent event capture with immediate mount check for deferredPrompt.
 */
export default function PWAManager() {
  const pathname = usePathname();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sessionDismissed, setSessionDismissed] = useState(false);

  const checkInstallability = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isExcluded = pathname?.includes('/attempt') || pathname?.startsWith('/admin');
    const hasPrompt = !!(window as any).deferredPrompt;
    
    if (!isExcluded && !isStandalone && !sessionDismissed && hasPrompt) {
      setShowPrompt(true);
    } else {
      setShowPrompt(false);
    }
  }, [pathname, sessionDismissed]);

  useEffect(() => {
    setMounted(true);

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => 
        console.error('[PWA] SW Registration Failed:', err)
      );
    }

    // Immediate check on mount
    checkInstallability();

    // Listen for future availability
    window.addEventListener('pwa-installable', checkInstallability);
    window.addEventListener('beforeinstallprompt', checkInstallability);
    
    const handleAppInstalled = () => {
      setShowPrompt(false);
      setIsInstalled(true);
      (window as any).deferredPrompt = null;
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('pwa-installable', checkInstallability);
      window.removeEventListener('beforeinstallprompt', checkInstallability);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [checkInstallability]);

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const prompt = (window as any).deferredPrompt;
    if (!prompt) return;

    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
      (window as any).deferredPrompt = null;
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPrompt(false);
    setSessionDismissed(true);
  };

  if (!mounted || isInstalled || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="fixed bottom-24 md:bottom-8 left-4 md:left-auto md:right-8 z-[2000] w-[calc(100%-2rem)] md:w-auto max-w-[280px] pointer-events-auto"
      >
        <div className="bg-[#0B1528] text-white p-2.5 rounded-2xl shadow-5xl border border-white/10 flex items-center gap-3 relative overflow-hidden group">
          <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
             <Zap className="h-4 w-4 text-[#F97316] fill-current" />
          </div>
          <div className="flex-1 min-w-0 text-left">
             <h4 className="text-[11px] font-black uppercase tracking-tight leading-none mb-1">Install Hub</h4>
             <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest leading-tight truncate">Quick access for exams</p>
          </div>
          <div className="flex items-center gap-1.5">
             <Button 
              onClick={handleInstallClick}
              className="h-8 px-3 bg-[#F97316] hover:bg-orange-600 text-white font-black uppercase text-[8px] tracking-widest rounded-lg shadow-xl border-none transition-all active:scale-95 gap-1.5 flex items-center"
             >
                <Download className="h-3 w-3" /> INSTALL
             </Button>
             <button 
              onClick={handleClose}
              className="h-7 w-7 flex items-center justify-center text-slate-500 hover:text-white transition-colors cursor-pointer active:scale-90 shrink-0 bg-white/5 rounded-md"
              aria-label="Close"
             >
                <X className="h-3.5 w-3.5" />
             </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
