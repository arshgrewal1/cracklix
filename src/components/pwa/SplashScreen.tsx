'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useUser } from '@/firebase';
import { Loader2, Target, Users, Zap, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Official Cracklix Splash Hub v2.0.
 * DESIGN: Premium Startup Aesthetic (Option B Gradient).
 * TYPOGRAPHY: Title Case / Minimal / High Contrast.
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
    
    // Safety exit timer
    const maxTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    // Smooth Progress Simulation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95 && !isDataReady) return 95;
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 15);

    return () => {
      clearTimeout(maxTimer);
      clearInterval(progressInterval);
    };
  }, [isDataReady]);

  // Handle final exit sequence
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
          key="cracklix-pwa-splash-v2"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] bg-[#0F172A] flex flex-col items-center justify-center overflow-hidden pointer-events-none select-none"
        >
          {/* 1. PREMIUM AMBIENT LIGHTING */}
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/15 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center w-full px-6">
             
             {/* 2. LOGO HUB - SCALED VIA CLAMP */}
             <motion.div
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               transition={{ duration: 0.8, ease: "easeOut" }}
               className="relative mb-8 md:mb-12"
             >
                <div className="relative flex items-center justify-center">
                   {/* Soft Glow Pulse */}
                   <motion.div 
                     animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                     transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                     className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"
                   />
                   <div 
                     className="relative"
                     style={{ width: 'clamp(160px, 20vw, 240px)', height: 'auto', aspectRatio: '1/1' }}
                   >
                      <Image 
                        src="/logo/cracklix-icon.png" 
                        alt="Cracklix"
                        fill
                        priority
                        className="object-contain drop-shadow-[0_20px_50px_rgba(37,99,235,0.3)]"
                      />
                   </div>
                </div>
             </motion.div>

             {/* 3. BRANDING HUB */}
             <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, delay: 0.3 }}
               className="text-center space-y-3 mb-16"
             >
                <h1 className="text-[40px] md:text-[64px] font-[900] tracking-tighter text-white leading-none antialiased uppercase">
                   Cracklix
                </h1>
                <p className="text-[14px] md:text-[20px] font-bold text-slate-400 tracking-tight leading-none opacity-80">
                   Punjab&apos;s Smart Mock Test Platform
                </p>
             </motion.div>

             {/* 4. LOADING PROGRESS HUB */}
             <div className="w-full max-w-[280px] md:max-w-[360px] space-y-6">
                <div className="flex flex-col items-center gap-4">
                   <div className="flex items-center gap-2 text-primary">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-slate-500">
                         Preparing Your Experience...
                      </span>
                   </div>
                   
                   <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${progress}%` }}
                         transition={{ duration: 0.2 }}
                         className="h-full bg-gradient-to-r from-primary via-blue-400 to-purple-500 shadow-[0_0_15px_rgba(37,99,235,0.8)]"
                      />
                   </div>
                </div>
             </div>

             {/* 5. INSTITUTIONAL FEATURE HUB */}
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-20 grid grid-cols-3 gap-3 md:gap-8 w-full max-w-2xl"
             >
                <FeatureChip icon={Target} label="Smart Tests" />
                <FeatureChip icon={Users} label="Real Competition" />
                <FeatureChip icon={Zap} label="Instant Analysis" />
             </motion.div>
          </div>

          {/* 6. SECURITY FOOTER */}
          <div className="absolute bottom-10 flex items-center gap-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
             <ShieldCheck className="h-3 w-3 text-primary" />
             Institutional Grade Security
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FeatureChip({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 group">
       <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors shadow-sm">
          <Icon className="h-5 w-5 md:h-6 md:w-6" />
       </div>
       <span className="text-[8px] md:text-[10px] font-black uppercase text-slate-500 tracking-wider text-center">
          {label}
       </span>
    </div>
  )
}
