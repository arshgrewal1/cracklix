'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useUser } from '@/firebase';

/**
 * @fileOverview Premium PWA Splash Hub v4.0.
 * DESIGN: Mobile-first premium startup aesthetic.
 * FIXED: Increased logo scale, reduced branding gap, and moved composition upwards.
 */
export default function SplashScreen() {
  const { loading: authLoading, profileLoading, user } = useUser();
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Resolution Logic: Wait for auth and profile if user exists
  const isDataReady = useMemo(() => {
    if (authLoading) return false;
    if (user && profileLoading) return false;
    return true;
  }, [authLoading, profileLoading, user]);

  useEffect(() => {
    setMounted(true);
    
    // Minimum visibility time for branding impact
    const safetyTimer = setTimeout(() => {
      if (isDataReady) setIsVisible(false);
    }, 2800);

    // High-performance progress simulation
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

  // Exit sequence trigger
  useEffect(() => {
    if (isDataReady && progress >= 100) {
      const exitTimer = setTimeout(() => setIsVisible(false), 300);
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
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] bg-[#05070B] flex flex-col items-center justify-start overflow-hidden pointer-events-none select-none pt-[18dvh]"
        >
          {/* 1. DEPTH & AMBIENT GLOW */}
          <div className="absolute top-[-10%] left-[-10%] w-[100%] h-[70%] bg-primary/10 blur-[160px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center w-full px-8 max-w-lg">
             
             {/* 2. HERO LOGO HUB - INCREASED SIZE & REMOVED GAP */}
             <motion.div
               initial={{ opacity: 0, scale: 0.8, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
               className="relative mb-2 md:mb-4"
             >
                <div className="relative flex items-center justify-center">
                   {/* Background Orbit/Glow */}
                   <motion.div 
                     animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                     transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                     className="absolute inset-0 bg-primary/30 blur-[60px] rounded-full scale-75"
                   />
                   <div className="absolute h-[80%] w-[80%] bg-white/[0.02] rounded-full border border-white/5 shadow-2xl" />
                   
                   <div 
                     className="relative"
                     style={{ 
                        width: 'clamp(300px, 45vw, 500px)', 
                        height: 'auto', 
                        aspectRatio: '1/1' 
                     }}
                   >
                      <Image 
                        src="/logo/cracklix-icon.png" 
                        alt="Cracklix"
                        fill
                        priority
                        className="object-contain drop-shadow-[0_40px_80px_rgba(37,99,235,0.45)]"
                      />
                   </div>
                </div>
             </motion.div>

             {/* 3. CORE BRANDING - BROUGHT CLOSER */}
             <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.4 }}
               className="text-center space-y-3 w-full"
             >
                <div className="space-y-1">
                   <h1 className="text-[52px] md:text-[84px] font-[900] tracking-tighter text-white leading-none antialiased">
                      Cracklix
                   </h1>
                   <p className="text-[15px] md:text-[22px] font-medium text-slate-400 tracking-tight leading-none opacity-80 italic">
                      Punjab's Smart Mock Test Platform
                   </p>
                </div>

                {/* 4. LOADING PROGRESS */}
                <div className="pt-24 md:pt-32 w-full max-w-[240px] md:max-w-[320px] mx-auto space-y-6">
                   <div className="flex flex-col items-center gap-5">
                      <div className="relative h-[2px] w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                         <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.2 }}
                            className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.6)]"
                         />
                      </div>
                      <p className="text-[11px] md:text-sm font-bold text-slate-500 tracking-tight transition-all uppercase opacity-60">
                         Initialising learning hub...
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
