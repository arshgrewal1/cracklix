
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useUser } from '@/firebase';

/**
 * @fileOverview Premium PWA Splash Hub v9.0.
 * FIXED: Tighter vertical gap between icon and title.
 * FIXED: Moved composition upwards for perfect vertical centering in viewport.
 */
export default function SplashScreen() {
  const { loading: authLoading, profileLoading, user } = useUser();
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  const isDataReady = useMemo(() => {
    if (authLoading) return false;
    if (user && profileLoading) return false;
    return true;
  }, [authLoading, profileLoading, user]);

  useEffect(() => {
    setMounted(true);
    
    const safetyTimer = setTimeout(() => {
      if (isDataReady) setIsVisible(false);
    }, 4000);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 98 && !isDataReady) return 98;
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1.5;
      });
    }, 20);

    return () => {
      clearTimeout(safetyTimer);
      clearInterval(progressInterval);
    };
  }, [isDataReady]);

  useEffect(() => {
    if (isDataReady && progress >= 100) {
      const exitTimer = setTimeout(() => setIsVisible(false), 500);
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
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-[#05070B] flex flex-col items-center justify-start overflow-hidden pointer-events-none select-none pt-[6dvh] md:pt-[10dvh]"
        >
          <div className="absolute top-[-10%] left-[-10%] w-full h-[70%] bg-primary/10 blur-[140px] rounded-full" />
          
          <div className="relative z-10 flex flex-col items-center w-full px-8 max-w-lg">
             <motion.div
               initial={{ opacity: 0, scale: 0.7, y: 30 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               transition={{ duration: 1.2, ease: "easeOut" }}
               className="relative mb-0"
             >
                <div className="relative flex items-center justify-center">
                   <motion.div 
                     animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
                     transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                     className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full scale-90"
                   />
                   <div 
                     className="relative"
                     style={{ width: 'clamp(260px, 50vw, 420px)', height: 'auto', aspectRatio: '1/1' }}
                   >
                      <Image 
                        src="/logo/cracklix-icon.png" 
                        alt="Cracklix"
                        fill
                        priority
                        className="object-contain drop-shadow-[0_30px_60px_rgba(37,99,235,0.4)]"
                      />
                   </div>
                </div>
             </motion.div>

             <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1, delay: 0.5 }}
               className="text-center space-y-2 w-full -mt-20 md:-mt-32"
             >
                <div className="space-y-1">
                   <h1 className="text-[56px] md:text-[88px] font-[900] tracking-tighter text-white leading-none antialiased">
                      Cracklix
                   </h1>
                   <p className="text-[14px] md:text-[20px] font-medium text-slate-400 tracking-tight leading-none opacity-90 italic">
                      Punjab's Smart Mock Test Platform
                   </p>
                </div>

                <div className="pt-12 md:pt-16 w-full max-w-[200px] md:max-w-[260px] mx-auto space-y-6">
                   <div className="flex flex-col items-center gap-5">
                      <div className="relative h-[2px] w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                         <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500 shadow-[0_0_10px_rgba(37,99,235,0.8)]"
                         />
                      </div>
                      <p className="text-[10px] md:text-xs font-bold text-slate-500 tracking-tight uppercase opacity-40">
                         Loading your learning journey...
                      </p>
                   </div>
                </div>
             </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
