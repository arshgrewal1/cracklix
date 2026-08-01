'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useUser } from '@/firebase';

/**
 * @fileOverview Optimized PWA Splash Hub v14.0 [Anti-Hang Hardened].
 * FIXED: Implemented a strict 4s safety timeout to prevent app hanging if Firestore sync is slow.
 */
export default function SplashScreen() {
  const { loading: authLoading, profileLoading, user } = useUser();
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [forceClose, setForceClose] = useState(false);

  const isDataReady = useMemo(() => {
    // If safety timeout triggered, ignore data status
    if (forceClose) return true;
    if (authLoading) return false;
    if (user && profileLoading) return false;
    return true;
  }, [authLoading, profileLoading, user, forceClose]);

  useEffect(() => {
    setMounted(true);
    
    // SAFETY PROTOCOL: Force exit splash after 4 seconds regardless of data state
    // This prevents the "90% hang" on slow networks or DNS/SSL delays.
    const safetyTimer = setTimeout(() => {
      console.log('[SPLASH] Safety override triggered.');
      setForceClose(true);
    }, 4000);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        // Hang at 90% only if data isn't ready and safety timer hasn't fired
        if (prev >= 90 && !isDataReady) return 90;
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 4;
      });
    }, 20);

    return () => {
      clearTimeout(safetyTimer);
      clearInterval(progressInterval);
    };
  }, [isDataReady]);

  useEffect(() => {
    if (isDataReady && progress >= 100) {
      const exitTimer = setTimeout(() => setIsVisible(false), 200);
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
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed inset-0 z-[10000] bg-[#05070B] flex flex-col items-center justify-center overflow-hidden pointer-events-none select-none"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-primary/5 blur-[140px] rounded-full" />
          
          <div className="relative z-10 flex flex-col items-center w-full px-8 max-w-lg">
             <motion.div
               initial={{ opacity: 0, scale: 0.8, y: 10 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               transition={{ duration: 0.6, ease: "easeOut" }}
               className="relative"
             >
                <div className="relative flex items-center justify-center">
                   <motion.div 
                     animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
                     transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                     className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full scale-90"
                   />
                   <div 
                     className="relative"
                     style={{ width: 'clamp(240px, 40vw, 400px)', height: 'auto', aspectRatio: '1/1' }}
                   >
                      <Image 
                        src="/logo/cracklix-icon.png" 
                        alt="Cracklix"
                        fill
                        priority
                        className="object-contain drop-shadow-[0_20px_40px_rgba(37,99,235,0.3)]"
                      />
                   </div>
                </div>
             </motion.div>

             <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.2 }}
               className="text-center space-y-2 w-full -mt-16 md:-mt-24"
             >
                <div className="space-y-1">
                   <h1 className="text-[48px] md:text-[64px] font-[900] tracking-tighter text-white leading-none antialiased">
                      Cracklix
                   </h1>
                   <p className="text-[12px] md:text-[14px] font-medium text-slate-400 tracking-tight leading-none opacity-60 italic">
                      Punjab's Smart Mock Test Platform
                   </p>
                </div>

                <div className="pt-8 md:pt-10 w-full max-w-[140px] md:max-w-[180px] mx-auto space-y-4">
                   <div className="flex flex-col items-center gap-4">
                      <div className="relative h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                         <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-primary shadow-[0_0_10px_rgba(37,99,235,0.8)]"
                         />
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}