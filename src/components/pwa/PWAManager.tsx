
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * @fileOverview Hardened Institutional PWA Manager v26.0.
 * FIXED: Universal capture of 'beforeinstallprompt' with global event dispatch.
 * LOGGING: Added audit logs for install states.
 */
export default function PWAManager() {
  const pathname = usePathname();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [mounted, setMounted] = useState(false);

  const checkStatus = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    const isExcluded = pathname?.includes('/attempt') || pathname?.startsWith('/admin');
    const isDismissed = localStorage.getItem('cracklix_pwa_dismissed') === 'true';
    const hasPrompt = !!(window as any).deferredPrompt;
    
    const shouldShow = !isStandalone && !isExcluded && !isDismissed && hasPrompt;
    setShowPrompt(shouldShow);
  }, [pathname]);

  useEffect(() => {
    setMounted(true);

    const handlePrompt = (e: any) => {
      console.log('[PWA_AUDIT] beforeinstallprompt event captured');
      e.preventDefault();
      (window as any).deferredPrompt = e;
      // Notify all install buttons to update their visibility
      window.dispatchEvent(new CustomEvent('pwa-installable'));
      checkStatus();
    };

    const handleAppInstalled = () => {
      console.log('[PWA_AUDIT] App installed node successfully committed');
      setIsInstalled(true);
      setShowPrompt(false);
      (window as any).deferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    const timer = setTimeout(checkStatus, 1000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, [checkStatus]);

  const handleInstallClick = async () => {
    const prompt = (window as any).deferredPrompt;
    if (!prompt) return;

    try {
      console.log('[PWA_AUDIT] Triggering native install prompt');
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      console.log(`[PWA_AUDIT] Installation outcome: ${outcome}`);
      if (outcome === 'accepted') {
        setShowPrompt(false);
        (window as any).deferredPrompt = null;
      }
    } catch (err) {
      console.error('[PWA_AUDIT] Native trigger failed:', err);
    }
  };

  if (!mounted || isInstalled || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        exit={{ y: 100, opacity: 0 }} 
        className="fixed bottom-28 md:bottom-12 left-4 right-4 md:left-auto md:right-8 z-[2000] md:w-[360px]"
      >
        <div className="bg-[#0B1528] text-white p-6 rounded-[2.5rem] shadow-5xl border border-white/10 relative overflow-hidden">
          <div className="flex flex-col gap-6 relative z-10">
             <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 shadow-inner">
                      <Zap className="h-6 w-6 text-primary" />
                   </div>
                   <div className="text-left">
                      <h4 className="text-sm font-black uppercase tracking-tight">Cracklix App</h4>
                      <p className="text-[9px] font-black uppercase text-primary tracking-widest">Native Experience</p>
                   </div>
                </div>
                <button 
                  onClick={() => { 
                    localStorage.setItem('cracklix_pwa_dismissed', 'true'); 
                    setShowPrompt(false); 
                  }} 
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <X className="h-4 w-4 text-slate-500" />
                </button>
             </div>
             <p className="text-[13px] font-bold text-slate-300 leading-snug text-left">
               Install the official Punjab exam prep app on your home screen for instant alerts.
             </p>
             <Button 
               onClick={handleInstallClick}
               className="w-full h-14 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl border-none shadow-3xl"
             >
               INSTALL APP NOW
             </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
