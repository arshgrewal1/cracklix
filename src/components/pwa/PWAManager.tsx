'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X, Zap, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

/**
 * @fileOverview Institutional Mobile App Prompt v1.0.
 * Updated to suggest APK download instead of browser PWA installation.
 */
export default function PWAManager() {
  const pathname = usePathname();
  const [showPrompt, setShowPrompt] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Show prompt after 5 seconds if on mobile-like resolution
    const checkStatus = () => {
      const isMobile = window.innerWidth < 768;
      const isExcluded = pathname?.includes('/attempt') || pathname?.startsWith('/admin');
      const isDismissed = localStorage.getItem('cracklix_app_prompt_dismissed') === 'true';
      
      if (isMobile && !isExcluded && !isDismissed) {
        setShowPrompt(true);
      }
    };

    const timer = setTimeout(checkStatus, 5000);
    return () => clearTimeout(timer);
  }, [pathname]);

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
                      <p className="text-[9px] font-black uppercase text-primary tracking-widest">Cracklix Android</p>
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
               Get the official Cracklix app for a smoother testing experience and instant job alerts.
             </p>
             <Button 
               asChild
               className="w-full h-14 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl border-none shadow-3xl"
             >
               <Link href="/install">
                  <Download className="h-4 w-4 mr-2" /> DOWNLOAD APK
               </Link>
             </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}