'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import { ShieldCheck, Cloud, Zap, Lock } from 'lucide-react';

/**
 * @fileOverview Official Premium Splash Screen v2.0.
 * Redesigned for production-grade startup experience with dynamic sync logic.
 */
export default function SplashScreen() {
  const { loading: authLoading, profileLoading, user } = useUser();
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Critical resource check
  const isDataReady = useMemo(() => {
    if (authLoading) return false;
    if (user && profileLoading) return false;
    return true;
  }, [authLoading, profileLoading, user]);

  useEffect(() => {
    setMounted(true);
    
    // 1. Minimum duration timer (800ms)
    const minTimer = setTimeout(() => {
      if (isDataReady) setProgress(100);
    }, 800);

    // 2. Maximum safety timeout (2500ms)
    const maxTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    // 3. Progress simulation linked to data readiness
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90 && !isDataReady) return 90; // Hold at 90% until ready
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 30);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
      clearInterval(progressInterval);
    };
  }, [isDataReady]);

  // Handle exit transition when 100% and data is ready
  useEffect(() => {
    if (progress === 100 && isDataReady) {
      const exitTimer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(exitTimer);
    }
  }, [progress, isDataReady]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="cracklix-premium-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] bg-[#050816] flex flex-col items-center justify-center overflow-hidden pointer-events-none"
        >
          {/* Animated Radial Glow */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1] 
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-[800px] h-[800px] bg-[#2563EB]/20 blur-[120px] rounded-full pointer-events-none"
          />

          <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-6">
             
             {/* Glassmorphism Logo Container */}
             <motion.div
               initial={{ opacity: 0, scale: 0.8, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
               className="relative mb-12"
             >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-[140px] h-[140px] bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[40px] shadow-[0_0_50px_rgba(37,99,235,0.15)] flex items-center justify-center relative overflow-hidden"
                >
                   <div className="relative w-[100px] h-[100px] rounded-2xl overflow-hidden bg-black shadow-inner">
                      <Image 
                        src="/logo/cracklix-icon.png" 
                        alt="Cracklix"
                        fill
                        priority
                        className="object-cover scale-[1.05]"
                      />
                   </div>
                   {/* Internal Shine Animation */}
                   <motion.div 
                     animate={{ x: [-150, 150] }}
                     transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                     className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg]"
                   />
                </motion.div>
             </motion.div>

             {/* Typography Hub */}
             <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.3 }}
               className="text-center space-y-4 w-full"
             >
                <h1 className="text-[42px] md:text-[48px] font-black tracking-tighter text-white leading-none antialiased">
                   Cracklix
                </h1>
                <p className="text-xs md:text-sm font-bold text-slate-400 tracking-tight uppercase tracking-widest opacity-80">
                   Punjab&apos;s Smart <span className="text-primary">Mock Test</span> Platform
                </p>

                {/* Premium Progress Bar */}
                <div className="pt-8 w-full max-w-[240px] mx-auto space-y-3">
                   <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${progress}%` }}
                         className="h-full bg-primary shadow-[0_0_15px_rgba(37,99,235,0.8)]"
                      />
                   </div>
                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] tabular-nums">
                      {progress < 100 ? 'Synchronizing Registry...' : 'System Online'}
                   </p>
                </div>
             </motion.div>
          </div>

          {/* Institutional Status Items */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1 }}
            className="absolute bottom-12 flex items-center justify-center gap-6 md:gap-10 w-full"
          >
             <StatusItem icon={<Lock className="h-3 w-3" />} label="Secure Login" />
             <StatusItem icon={<Cloud className="h-3 w-3" />} label="Cloud Sync" />
             <StatusItem icon={<Zap className="h-3 w-3" />} label="Fast Loading" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StatusItem({ icon, label }: { icon: React.ReactNode, label: string }) {
   return (
      <div className="flex items-center gap-2 text-white">
         <span className="text-primary">{icon}</span>
         <span className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">{label}</span>
      </div>
   );
}
