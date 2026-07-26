
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { PLATFORM_VERSION } from '@/lib/version';

/**
 * @fileOverview Official High-Fidelity Splash Rebuild v1.0.
 * REPLACED: Entire old splash logic removed.
 * DESIGN: Pure Black (#05070B), 220px Glass Card, 48px ExtraBold Typography.
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
    
    // Safety exit timer (Max 1200ms)
    const maxTimer = setTimeout(() => {
      setIsVisible(false);
    }, 1200);

    // Progress Simulation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90 && !isDataReady) return 90;
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 20);

    return () => {
      clearTimeout(maxTimer);
      clearInterval(progressInterval);
    };
  }, [isDataReady]);

  // Fast exit when data is ready
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
          key="cracklix-native-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] bg-[#05070B] flex flex-col items-center justify-center overflow-hidden pointer-events-none"
        >
          {/* Institutional Blue Radial Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.08),transparent_70%)] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center w-full">
             
             {/* 220x220 Glassmorphism Hub */}
             <motion.div
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
               className="relative mb-10"
             >
                <div className="w-[220px] h-[220px] bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[56px] shadow-[0_0_100px_rgba(37,99,235,0.12)] flex items-center justify-center relative overflow-hidden">
                   <div className="relative w-[130px] h-[130px] rounded-[32px] overflow-hidden drop-shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                      <Image 
                        src={`/logo/cracklix-icon.png?v=${PLATFORM_VERSION.build}`} 
                        alt="Cracklix"
                        fill
                        priority
                        className="object-contain"
                      />
                   </div>
                   
                   {/* Scanning Animation */}
                   <motion.div 
                     animate={{ y: [-150, 150] }}
                     transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                     className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                   />
                </div>
             </motion.div>

             {/* Branding Hub */}
             <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.4, delay: 0.2 }}
               className="text-center space-y-4 px-6"
             >
                <h1 className="text-[48px] font-[900] tracking-tighter text-white leading-none antialiased">
                   Cracklix
                </h1>
                <p className="text-[18px] font-bold text-slate-400 tracking-tight leading-none opacity-90">
                   Punjab&apos;s Smart Mock Test Platform
                </p>

                {/* Circular Sync Loader */}
                <div className="pt-10 flex flex-col items-center gap-6">
                   <div className="relative h-1 w-48 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${progress}%` }}
                         className="h-full bg-primary shadow-[0_0_20px_rgba(37,99,235,1)]"
                      />
                   </div>
                   
                   <div className="flex items-center gap-3 text-slate-500">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                      <span className="text-[11px] font-black uppercase tracking-[0.3em] tabular-nums">
                         🔒 Securely syncing...
                      </span>
                   </div>
                </div>
             </motion.div>
          </div>

          {/* Version Footer */}
          <div className="absolute bottom-10 text-[9px] font-bold text-slate-700 uppercase tracking-widest">
             Binary Registry V{PLATFORM_VERSION.version}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
