'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useUser } from '@/firebase';

/**
 * @fileOverview Premium PWA Splash Hub v3.2.
 * DESIGN: Mobile-first premium startup aesthetic (Linear/Spotify style).
 * FIXED: Resolved JSX syntax error by balancing closing tags.
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
        return prev + 1.2;
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
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] bg-[#05070B] flex flex-col items-center justify-start overflow-hidden pointer-events-none select-none pt-[32dvh]"
        >
          {/* 1. DEPTH & AMBIENT GLOW */}
          <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[60%] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center w-full px-8 max-w-lg">
             
             {/* 2. HERO LOGO HUB */}
             <motion.div
               initial={{ opacity: 0, scale: 0.9, y: 15 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
               className="relative mb-10 md:mb-12"
             >
                <div className="relative flex items-center justify-center">
                   <motion.div 
                     animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
                     transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                     className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"
                   />
                   
                   <div 
                     className="relative"
                     style={{ 
                        width: 'clamp(220px, 28vw, 300px)', 
                        height: 'auto', 
                        aspectRatio: '1/1' 
                     }}
                   >
                      <Image 
                        src="/logo/cracklix-icon.png" 
                        alt="Cracklix"
                        fill
                        priority
                        className="object-contain drop-shadow-[0_30px_70px_rgba(37,99,235,0.4)]"
                      />
                   </div>
                </div>
             </motion.div>

             {/* 3. CORE BRANDING */}
             <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.5 }}
               className="text-center space-y-4 w-full"
             >
                <div className="space-y-2">
                   <h1 className="text-[48px] md:text-[72px] font-[900] tracking-tighter text-white leading-none antialiased">
                      Cracklix
                   </h1>
                   <p className="text-[14px] md:text-[20px] font-medium text-slate-500 tracking-tight leading-none opacity-90 italic">
                      Punjab's Smart Mock Test Platform
                   </p>
                </div>

                {/* 4. LOADING PROGRESS */}
                <div className="pt-20 md:pt-28 w-full max-w-[220px] md:max-w-[280px] mx-auto space-y-5">
                   <div className="flex flex-col items-center gap-4">
                      <div className="relative h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                         <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.2 }}
                            className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.5)]"
                         />
                      </div>
                      <p className="text-[11px] md:text-sm font-medium text-slate-600 transition-all">
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
