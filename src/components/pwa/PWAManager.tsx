'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X, Zap, Smartphone, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { usePWAInstall } from '@/hooks/use-pwa-install';

/**
 * @fileOverview Institutional Mobile App Prompt v1.3.
 * UPDATED: Facilitates direct PWA installation instead of APK download.
 */
export default function PWAManager() {
  const pathname = usePathname();
  const { canInstall, installApp, isInstalled } = usePWAInstall();
  const [showPrompt, setShowPrompt] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const checkStatus = () => {
      // 1. Check if running inside the Native Android APK
      const isNative = Capacitor.isNativePlatform();
      
      // 2. Check if running as an installed PWA (Standalone mode)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

      // 3. Other existing checks
      const isMobile = window.innerWidth < 1024; 
      const isExcluded = pathname?.includes('/attempt') || pathname?.startsWith('/admin');
      const isDismissed = localStorage.getItem('cracklix_app_prompt_dismissed') === 'true';
      
      // LOGIC: Only show if NOT native, NOT standalone, is on mobile resolution, NOT in exam, NOT installed already and NOT dismissed
      if (!isNative && !isStandalone && isMobile && !isExcluded && !isDismissed && !isInstalled) {
        setShowPrompt(true);
      }
    };

    // Show prompt after 5 seconds to let the main content load
    const timer = setTimeout(checkStatus, 5000);
    return () => clearTimeout(timer);
  }, [pathname, isInstalled]);

  const handleInstallAction = () => {
    if (canInstall) {
      installApp();
    } else {
      window.location.href = '/install';
    }
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
                   <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 shadow-inner">
                      <Zap className="h-6 w-6 text-primary" />
                   </div>
                   <div className="text-left">
                      <h4 className="text-sm font-black uppercase tracking-tight">Official App</h4>
                      <p className="text-[9px] font-black uppercase text-primary tracking-widest">Cracklix Web App</p>
                   </div>
                </div>
                <button 
                  onClick={() => { 
                    localStorage.setItem('cracklix_app_prompt_dismissed', 'true'); 
                    setShowPrompt(false); 
                  }} 
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <X className="h-4 w-4 text-slate-500" />
                </button>
             </div>
             <p className="text-[13px] font-bold text-slate-300 leading-snug">
               Install the official Cracklix app on your home screen for a smoother experience and instant job alerts.
             </p>
             <Button 
               onClick={handleInstallAction}
               className="w-full h-14 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl border-none shadow-3xl flex items-center justify-center gap-2 group"
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
