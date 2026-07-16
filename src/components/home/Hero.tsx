'use client';

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ChevronRight, Star, Download, Loader2, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePWAInstall } from "@/hooks/use-pwa-install";

/**
 * @fileOverview Premium Mobile-First PWA Hero v61.3.
 * UPDATED: Removed uppercase from action nodes.
 */
export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const { canInstall, installApp, isInstalled } = usePWAInstall();
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInstallClick = async () => {
    if (isInstalling) return;
    setIsInstalling(true);
    try {
      await installApp();
    } finally {
      setTimeout(() => setIsInstalling(false), 1000);
    }
  };

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-white pt-6 pb-5 md:pt-16 md:pb-20 w-full">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg aspect-square bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center space-y-4 md:space-y-8 w-full">
          
          <motion.div 
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100/50 max-w-[240px]"
          >
            <Star className="h-3 w-3 text-primary fill-primary animate-pulse" />
            <span className="text-[10px] md:text-xs font-bold text-primary tracking-tight">
              Punjab's smartest exam platform
            </span>
          </motion.div>

          <div className="space-y-3 w-full max-w-[340px] md:max-w-4xl px-1">
            <h1 className="text-[32px] sm:text-7xl lg:text-[100px] font-black tracking-tighter text-[#0F172A] leading-[1.05] antialiased">
              Crack Punjab exams <br className="hidden sm:block" />
              <span className="text-primary italic">with confidence</span>
            </h1>

            <p className="text-[14px] md:text-2xl text-slate-500 font-medium leading-relaxed tracking-tight max-w-md mx-auto">
              Master official patterns with verified mock tests, notes, and daily updates.
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col gap-3 w-full max-w-sm px-2 mx-auto"
          >
             <Button 
               asChild 
               className="relative overflow-hidden w-full h-[58px] bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:brightness-110 rounded-[20px] shadow-[0_15px_30px_rgba(37,99,235,0.25)] transition-all duration-300 active:scale-[0.98] border-none group cursor-pointer"
             >
                <Link href="/mocks" className="flex items-center justify-between w-full px-5">
                  <div className="flex items-center gap-4">
                    <div className="w-[32px] h-[32px] rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                      <Play className="h-3.5 w-3.5 fill-white text-white" />
                    </div>
                    <span className="font-bold text-base text-white tracking-tight">
                      Start preparation
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/50 group-hover:translate-x-1 transition-transform" />
                  
                  <motion.div 
                    animate={{ x: ['-100%', '300%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg] pointer-events-none"
                  />
                </Link>
             </Button>
             
             <AnimatePresence mode="wait">
               {(!isInstalled && canInstall) ? (
                 <motion.div 
                   key="install-node" 
                   initial={{ opacity: 0, scale: 0.95 }} 
                   animate={{ opacity: 1, scale: 1 }} 
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="w-full"
                 >
                   <Button 
                      onClick={handleInstallClick}
                      disabled={isInstalling}
                      variant="outline" 
                      className="w-full h-[58px] rounded-[20px] bg-white border-2 border-primary text-primary font-bold text-base shadow-sm transition-all duration-300 active:scale-95 hover:bg-blue-50 group flex items-center justify-between px-5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-[32px] h-[32px] rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                           {isInstalling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        </div>
                        <span className="tracking-tight">Install app</span>
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-30 group-hover:translate-x-1 transition-transform" />
                    </Button>
                 </motion.div>
               ) : (
                 <motion.div 
                   key="browse-node" 
                   initial={{ opacity: 0, scale: 0.95 }} 
                   animate={{ opacity: 1, scale: 1 }} 
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="w-full"
                 >
                   <Button 
                      asChild 
                      variant="outline" 
                      className="w-full h-[58px] rounded-[20px] bg-white border-2 border-slate-100 hover:border-primary text-[#0F172A] hover:text-primary font-bold text-base shadow-sm transition-all duration-300 active:scale-[0.98] flex items-center justify-between px-5"
                    >
                      <Link href="/exams">
                        <div className="flex items-center gap-4">
                           <div className="w-[32px] h-[32px] rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-primary/10 transition-colors">
                              <Landmark className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                           </div>
                           <span className="tracking-tight">Browse selection</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                      </Link>
                    </Button>
                 </motion.div>
               )}
             </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
