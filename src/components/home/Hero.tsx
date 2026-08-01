'use client';

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ChevronRight, Star, Download, Loader2, Landmark, ShieldCheck, Zap, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePWAInstall } from "@/hooks/use-pwa-install";

/**
 * @fileOverview Premium Mobile-First PWA Hero v66.0.
 * UPDATED: Removed uppercase from primary heading and buttons.
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

  if (!mounted) {
    return (
      <section className="relative overflow-hidden bg-background pt-4 pb-4 md:pt-12 md:pb-16 w-full min-h-[360px] md:min-h-[540px] flex items-center justify-center">
         <div className="animate-pulse flex flex-col items-center gap-4 w-full max-w-lg px-6">
            <div className="h-8 w-40 bg-muted rounded-full" />
            <div className="h-16 w-full bg-muted rounded-xl" />
            <div className="h-12 w-3/4 bg-muted rounded-xl" />
         </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-background pt-4 pb-4 md:pt-12 md:pb-16 w-full min-h-[360px] md:min-h-[540px] flex items-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-full max-w-lg aspect-square bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center space-y-4 md:space-y-6 w-full">
          
          <motion.div 
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/20 max-w-[220px]"
          >
            <Star className="h-3 w-3 text-primary fill-primary animate-pulse" />
            <span className="text-[9px] md:text-[11px] font-bold text-primary tracking-tight">
              Punjab's smartest exam platform
            </span>
          </motion.div>

          <div className="space-y-2 w-full max-w-[340px] md:max-w-4xl px-1">
            <h1 className="text-[28px] sm:text-6xl lg:text-[86px] font-black tracking-tighter leading-[1.05] text-foreground antialiased">
              Crack Punjab exams <br className="hidden sm:block" />
              <span className="text-primary italic">with confidence.</span>
            </h1>

            <p className="text-[13px] md:text-xl text-muted-foreground font-medium leading-relaxed tracking-tight max-w-md mx-auto">
              Master official patterns with verified mock tests, notes, and daily updates.
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col gap-2.5 w-full max-w-sm px-2 mx-auto"
          >
             <Button 
               asChild 
               className="relative overflow-hidden w-full h-[54px] md:h-[64px] bg-gradient-to-r from-primary to-blue-400 hover:brightness-110 rounded-2xl shadow-2xl transition-all duration-300 active:scale-[0.98] border-none group cursor-pointer"
             >
                <Link href="/mocks" className="flex items-center justify-between w-full px-5">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/10">
                      <Play className="h-3 w-3 fill-white text-white" />
                    </div>
                    <span className="font-bold text-sm md:text-base text-white tracking-tight">
                      Start preparation
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/50 group-hover:translate-x-1 transition-transform" />
                </Link>
             </Button>
             
             <AnimatePresence mode="wait">
               {(!isInstalled && canInstall) ? (
                 <motion.div 
                   key="install-entry" 
                   initial={{ opacity: 0, scale: 0.95 }} 
                   animate={{ opacity: 1, scale: 1 }} 
                   className="w-full"
                 >
                   <Button 
                      onClick={handleInstallClick}
                      disabled={isInstalling}
                      variant="outline" 
                      className="w-full h-[54px] md:h-[64px] rounded-2xl bg-card border-2 border-primary text-primary font-bold text-sm shadow-sm transition-all duration-300 active:scale-95 hover:bg-primary/5 group flex items-center justify-between px-5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                           {isInstalling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        </div>
                        <span className="tracking-tight">Install app</span>
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-30 group-hover:translate-x-1 transition-transform" />
                    </Button>
                 </motion.div>
               ) : (
                 <motion.div 
                   key="browse-entry" 
                   initial={{ opacity: 0, scale: 0.95 }} 
                   animate={{ opacity: 1, scale: 1 }} 
                   className="w-full"
                 >
                   <Button 
                      asChild 
                      variant="outline" 
                      className="w-full h-[54px] md:h-[64px] rounded-2xl bg-card border-2 border-border hover:border-primary text-foreground hover:text-primary font-bold text-sm shadow-sm transition-all duration-300 active:scale-[0.98] flex items-center justify-between px-5"
                    >
                      <Link href="/exams">
                        <div className="flex items-center gap-4">
                           <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-border group-hover:bg-primary/10 transition-colors">
                              <Landmark className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                           </div>
                           <span className="tracking-tight">Browse selection</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                      </Link>
                    </Button>
                 </motion.div>
               )}
             </AnimatePresence>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-slate-400 font-bold text-[8px] md:text-[10px] tracking-tight pt-6 border-t border-slate-100 max-w-lg mx-auto uppercase">
             <div className="flex items-center gap-2"><ShieldCheck className="h-3 w-3 text-emerald-500" /> Secure hub</div>
             <div className="flex items-center gap-2"><Zap className="h-3 w-3 text-primary" /> Instant sync</div>
             <div className="flex items-center gap-2"><Layers className="h-3 w-3 text-primary" /> Offline ready</div>
          </div>
        </div>
      </div>
    </section>
  );
}
