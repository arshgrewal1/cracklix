'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Official Premium Splash Screen v1.1.
 * FIXED: Removed touch-none to prevent interaction locking if unmount is delayed.
 */
export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // 1. Initial Handshake delay
    const contentTimer = setTimeout(() => setShowContent(true), 100);
    
    // 2. Lifecycle termination (2 seconds)
    const exitTimer = setTimeout(() => setIsVisible(false), 2200);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(exitTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="cracklix-splash-root"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden pointer-events-none"
        >
          {/* 1. AMBIENT GLOW NODE */}
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.15, 0.25, 0.15] 
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-[500px] h-[500px] bg-[#0A84FF]/20 blur-[100px] rounded-full pointer-events-none"
          />

          <div className="relative z-10 flex flex-col items-center gap-12">
             
             {/* 2. LOGO HUB (OPTICAL MASKING) */}
             <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={showContent ? { opacity: 1, scale: 1 } : {}}
               transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
               className="relative"
             >
                {/* Floating Animation Wrapper */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-[40px] shadow-5xl relative overflow-hidden"
                >
                   {/* This container clips the logo's black corners visually */}
                   <div className="relative h-20 w-20 md:h-28 md:w-28 rounded-2xl overflow-hidden bg-black shadow-inner">
                      <Image 
                        src="/logo/cracklix-icon.png" 
                        alt="Logo"
                        fill
                        priority
                        className="object-cover scale-[1.02]"
                      />
                   </div>
                </motion.div>
             </motion.div>

             {/* 3. BRANDING REGISTRY */}
             <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={showContent ? { opacity: 1, y: 0 } : {}}
               transition={{ duration: 0.6, delay: 0.3 }}
               className="text-center space-y-3"
             >
                <h1 className="text-2xl md:text-4xl font-black tracking-[0.4em] text-white uppercase antialiased">
                   Cracklix
                </h1>
                <p className="text-[10px] md:text-sm font-bold text-[#64748B] uppercase tracking-[0.2em]">
                   Punjab's Smart <span className="text-[#0A84FF]">Mock Test</span> Platform
                </p>
             </motion.div>

             {/* 4. PREMIUM LOADING NODE */}
             <div className="flex items-center gap-2.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      scale: [1, 1.4, 1],
                      opacity: [0.3, 1, 0.3] 
                    }}
                    transition={{ 
                      duration: 1, 
                      repeat: Infinity, 
                      delay: i * 0.2,
                      ease: "easeInOut" 
                    }}
                    className="h-1.5 w-1.5 rounded-full bg-[#0A84FF]"
                  />
                ))}
             </div>
          </div>

          {/* FOOTER BADGE */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={showContent ? { opacity: 0.4 } : {}}
            className="absolute bottom-12 flex items-center gap-2"
          >
             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
             <span className="text-[8px] font-black uppercase text-white tracking-[0.4em]">Verified Security Node</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
