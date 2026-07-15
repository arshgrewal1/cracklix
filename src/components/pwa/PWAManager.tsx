'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X, Zap, Smartphone, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { usePWAInstall } from '@/hooks/use-pwa-install';

/**
 * @fileOverview Institutional PWA Manager v1.6.
 * FIXED: Uses strict hardware-level installation detection.
 */
export default function PWAManager() {
  const pathname = usePathname();
  const { canInstall, installApp, isInstalled, isReady } = usePWAInstall();
  const [showPrompt, setShowPrompt] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (!isReady || isInstalled || !canInstall) {
      setShowPrompt(false);
      return;
    }

    const isNative = Capacitor.isNativePlatform();
    const isExcluded = pathname?.includes('/attempt') || pathname?.startsWith('/admin');
    
    let isDismissed = false;
    try {
       isDismissed = localStorage.getItem('cracklix_app_prompt_dismissed') === 'true';
    } catch (e) {}
    
    // Only show if mobile view, not native app, not installed, and not in excluded routes
    if (!isNative && !isInstalled && !isExcluded && !isDismissed) {
      const timer = setTimeout(() => setShowPrompt(true), 4000);
      return () => clearTimeout(timer);
    } else {
      setShowPrompt(false);
    }
  }, [pathname, isInstalled, canInstall, isReady]);

  const handleInstallAction = () => {
    installApp();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
     try {
        localStorage.setItem('cracklix_app_prompt_dismissed', 'true'); 
     } catch (e) {}
     setShowPrompt(false);
  };

  if (!mounted || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        exit={{ y: 100, opacity: 0 }} 
        className="fixed bottom-28 md:bottom-12 left-4 right-4 md:left-auto md:right-8 z-[2000] md:w-[360px]"
      >
        <div className="bg-[#0B1528] text-white p-6 rounded-[2.5rem] shadow-5xl border border-white/10 relative overflow-hidden text-left">
          <div className="flex flex-col gap-6 relative z-10">
             <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 shadow-inner border border-primary/20">
                      <Zap className="h-6 w-6 text-primary fill-primary" />
                   </div>
                   <div className="text-left">
                      <h4 className="text-sm font-black uppercase tracking-tight">Official App</h4>
                      <p className="text-[9px] font-black uppercase text-primary tracking-widest">Portal Enabled</p>
                   </div>
                </div>
                <button 
                  onClick={handleDismiss} 
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors active:scale-90"
                >
                  <X className="h-4 w-4 text-slate-500" />
                </button>
             </div>
             <p className="text-[13px] font-bold text-slate-300 leading-snug">
               Install the official Cracklix app on your home screen for high-speed preparation and instant alerts.
             </p>
             <Button 
               onClick={handleInstallAction}
               className="w-full h-14 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl border-none shadow-3xl flex items-center justify-center gap-2 group transition-all"
             >
               <Smartphone className="h-4 w-4 transition-transform group-hover:rotate-12" /> 
               INSTALL APP
               <ChevronRight className="h-3.5 w-3.5 ml-1 opacity-50 group-hover:translate-x-1 transition-transform" />
             </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
