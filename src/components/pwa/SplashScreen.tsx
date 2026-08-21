'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useUser } from '@/firebase';

/**
 * @fileOverview Optimized PWA Splash Hub v17.0 [Pure White Sync].
 * FIXED: Removed black corners by transitioning to a pure white background.
 * FIXED: Eliminated redundant system logo flash by allowing the React logo to be the primary visual entry.
 */
export default function SplashScreen() {
  const { loading: authLoading, profileLoading, user } = useUser();
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [forceClose, setForceClose] = useState(false);

  const isDataReady = useMemo(() => {
    if (forceClose) return true;
    if (authLoading) return false;
    if (user && profileLoading) return false;
    return true;
  }, [authLoading, profileLoading, user, forceClose]);

  useEffect(() => {
    setMounted(true);
    
    // SAFETY PROTOCOL: Force exit splash after 4 seconds
    const safetyTimer = setTimeout(() => {
      setForceClose(true);
    }, 4000);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90 && !isDataReady) return 90;
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 6; 
      });
    }, 16);

    return () => {
      clearTimeout(safetyTimer);
      clearInterval(progressInterval);
    };
  }, [isDataReady]);

  useEffect(() => {
    if (isDataReady && progress >= 100) {
      const exitTimer = setTimeout(() => setIsVisible(false), 100);
      return () => clearTimeout(exitTimer);
    }
  }, [isDataReady, progress]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="cracklix-premium-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-0 z-[10000] bg-white flex flex-col items-center justify-center overflow-hidden pointer-events-none select-none"
        >
          {/* Subtle brand-blue glow node */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl aspect-square bg-primary/5 blur-[120px] rounded-full" />
          
          <div className="relative z-10 flex flex-col items-center w-full px-8 max-w-lg">
             <motion.div
               initial={{ opacity: 0, scale: 0.9, y: 10 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
               className="relative"
             >
                <div className="relative flex items-center justify-center">
                   {/* Logo Container with precision masking to kill black corners */}
                   <div 
                     className="relative overflow-hidden rounded-[22%] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]"
                     style={{ width: 'clamp(200px, 35vw, 320px)', height: 'auto', aspectRatio: '1/1' }}
                   >
                      <Image 
                        src="/logo/cracklix-icon.png" 
                        alt="Cracklix"
                        fill
                        priority
                        className="object-contain"
                      />
                   </div>
                </div>
             </motion.div>

             <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, delay: 0.2 }}
               className="text-center space-y-3 w-full mt-10"
             >
                <div className="space-y-1">
                   <h1 className="text-[32px] md:text-[44px] font-[900] tracking-tighter text-[#0F172A] leading-none antialiased">
                      Cracklix
                   </h1>
                   <p className="text-[11px] md:text-[13px] font-bold text-slate-400 tracking-widest leading-none uppercase">
                      Punjab&apos;s Smart Mock Test Platform
                   </p>
                </div>

                <div className="pt-8 w-full max-w-[120px] mx-auto">
                   <div className="relative h-[2px] w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${progress}%` }}
                         className="h-full bg-primary"
                      />
                   </div>
                </div>
             </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}