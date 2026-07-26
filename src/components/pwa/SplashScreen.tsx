'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useUser } from '@/firebase';

/**
 * @fileOverview Premium PWA Splash Hub v5.0.
 * REDESIGNED: Massive hero icon, zero-gap branding, and optimized vertical centering.
 * AESTHETIC: High-fidelity SaaS startup launch experience (Spotify/Linear style).
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
    }, 3200);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 98 && !isDataReady) return 98;
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1.2;
      });
    }, 20);

    return () => {
      clearTimeout(safetyTimer);
      clearInterval(progressInterval);
    };
  }, [isDataReady]);

  useEffect(() => {
    if (isDataReady && progress >= 100) {
      const exitTimer = setTimeout(() => setIsVisible(false), 400);
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
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] bg-[#05070B] flex flex-col items-center justify-start overflow-hidden pointer-events-none select-none pt-[15dvh]"
        >
          {/* AMBIENT BACKGROUND LAYER */}
          <div className="absolute top-[-10%] left-[-10%] w-full h-[70%] bg-primary/10 blur-[140px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full" />
          
          <div className="relative z-10 flex flex-col items-center w-full px-8 max-w-lg">
             
             {/* HERO LOGO HUB - MAXIMIZED SCALE */}
             <motion.div
               initial={{ opacity: 0, scale: 0.7, y: 30 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
               className="relative mb-0"
             >
                <div className="relative flex items-center justify-center">
                   {/* Pulsing Orbit Glow */}
                   <motion.div 
                     animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
                     transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                     className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full scale-90"
                   />
                   
                   <div 
                     className="relative"
                     style={{ 
                        width: 'clamp(260px, 50vw, 420px)', 
                        height: 'auto', 
                        aspectRatio: '1/1' 
                     }}
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

             {/* BRANDING UNIT - ZERO GAP */}
             <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1, delay: 0.5 }}
               className="text-center space-y-2 w-full -mt-4"
             >
                <div className="space-y-1">
                   <h1 className="text-[56px] md:text-[88px] font-[900] tracking-tighter text-white leading-none antialiased">
                      Cracklix
                   </h1>
                   <p className="text-[16px] md:text-[24px] font-medium text-slate-400 tracking-tight leading-none opacity-90 italic">
                      Punjab's Smart Mock Test Platform
                   </p>
                </div>

                {/* LOADING HUB */}
                <div className="pt-28 md:pt-36 w-full max-w-[220px] md:max-w-[300px] mx-auto space-y-6">
                   <div className="flex flex-col items-center gap-5">
                      <div className="relative h-[2px] w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                         <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500 shadow-[0_0_10px_rgba(37,99,235,0.8)]"
                         />
                      </div>
                      <p className="text-[11px] md:text-sm font-bold text-slate-500 tracking-tight uppercase opacity-50">
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
