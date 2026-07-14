'use client';

import React, { useMemo, useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Play, ChevronRight, Star, Smartphone, Landmark, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { usePWAInstall } from "@/hooks/use-pwa-install";

/**
 * @fileOverview High-Mass Institutional Hero v50.0 [Responsive Hardened].
 * FIXED: Eliminated all width overflows on ultra-mobile screens.
 */
export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const { canInstall, installApp, isInstalled } = usePWAInstall();
  const [isInstalling, setIsInstalling] = useState(false);
  const prevInstalled = useRef(isInstalled);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isInstalled && !prevInstalled.current) {
      toast({
        title: "Application Synchronized.",
        description: "Cracklix is now ready on your home screen.",
      });
    }
    prevInstalled.current = isInstalled;
  }, [isInstalled, mounted, toast]);

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      await installApp();
    } finally {
      setIsInstalling(false);
    }
  };

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-white pt-10 pb-16 md:pt-20 md:pb-28 border-b border-slate-50 w-full max-w-full">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="flex flex-col items-center text-center space-y-8 md:space-y-16 w-full">
          
          <motion.div 
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-blue-50 border border-blue-100/50 shadow-sm"
          >
            <Star className="h-3.5 w-3.5 text-primary fill-primary animate-pulse" />
            <span className="text-[10px] md:text-xs font-semibold text-primary antialiased">
              Punjab's Smartest Platform
            </span>
          </motion.div>

          <div className="space-y-6 w-full max-w-4xl px-1">
            <h1 className="text-[32px] sm:text-7xl lg:text-[100px] font-bold tracking-tighter text-[#0F172A] leading-[1] antialiased">
              Crack Punjab Exams <br className="hidden sm:block" />
              <span className="text-primary italic">with confidence</span>
            </h1>

            <p className="text-[14px] md:text-2xl text-slate-500 font-medium leading-relaxed tracking-tight max-w-2xl mx-auto">
              Master official patterns with verified Mock Tests, Notes, and Daily Updates.
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl px-2 mx-auto items-center justify-center overflow-hidden"
          >
             <Button 
               asChild 
               className="relative overflow-hidden w-full h-[54px] md:h-[68px] bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#60A5FA] hover:brightness-110 rounded-[20px] md:rounded-full shadow-xl transition-all duration-300 active:scale-[0.98] border-none group cursor-pointer"
             >
                <Link href="/mocks" className="flex items-center justify-center w-full px-1">
                  <motion.div 
                    animate={{ x: ['-100%', '250%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] pointer-events-none"
                  />
                  
                  <div className="flex items-center justify-start w-full relative z-10 gap-2">
                    <div className="w-[38px] h-[38px] md:w-[44px] md:h-[44px] rounded-full bg-white/18 backdrop-blur-[12px] flex items-center justify-center shrink-0 border border-white/10">
                      <Play className="h-4 w-4 md:h-5 md:w-5 fill-white text-white" />
                    </div>
                    <span className="flex-1 text-center font-bold text-sm md:text-xl text-white pr-[40px] uppercase tracking-tight">
                      Start Preparation
                    </span>
                  </div>
                </Link>
             </Button>
             
             <div className="w-full sm:w-auto sm:flex-1">
               <AnimatePresence mode="wait">
                 {canInstall && !isInstalled ? (
                   <motion.div key="install-node" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                     <Button 
                        onClick={handleInstallClick}
                        disabled={isInstalling}
                        variant="outline" 
                        className="w-full h-[54px] md:h-[68px] rounded-[20px] md:rounded-full bg-white border-2 border-primary text-[#1E3A8A] font-bold text-sm md:text-lg shadow-sm transition-all duration-300 active:scale-95 hover:bg-blue-50 group px-1"
                      >
                        <div className="flex items-center justify-center w-full px-1 gap-2">
                            <div className="w-[38px] h-[38px] md:w-[44px] md:h-[44px] rounded-full bg-primary flex items-center justify-center shrink-0 shadow-lg">
                                {isInstalling ? <Loader2 className="h-4 w-4 md:h-5 md:w-5 text-white animate-spin" /> : <Download className="h-4 w-4 md:h-5 md:w-5 text-white" />}
                            </div>
                            <span className="flex-1 text-center pr-[40px] uppercase tracking-tight">
                              Install App
                            </span>
                        </div>
                      </Button>
                   </motion.div>
                 ) : (
                   <motion.div key="browse-node" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                     <Button 
                        asChild 
                        variant="outline" 
                        className="w-full h-[54px] md:h-[68px] rounded-[20px] md:rounded-full bg-white border-2 border-slate-100 hover:border-primary text-[#1E3A8A] font-bold text-sm md:text-lg shadow-sm transition-all duration-300 active:scale-[0.98] group px-1"
                      >
                        <Link href="/exams" className="flex items-center justify-center w-full px-1 gap-2">
                            <div className="w-[38px] h-[38px] md:w-[44px] md:h-[44px] rounded-full bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-primary/5 transition-colors">
                                <Landmark className="h-4 w-4 md:h-5 md:w-5 text-[#1E3A8A]" />
                            </div>
                            <span className="flex-1 text-center pr-[40px] uppercase tracking-tight">Browse All</span>
                        </Link>
                      </Button>
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
          </motion.div>
          
          <div className="flex items-center gap-6 md:gap-10 pt-4 opacity-40 grayscale group hover:grayscale-0 transition-all duration-700 overflow-hidden px-4">
             <p className="text-[9px] md:text-[10px] font-black tracking-widest text-slate-400 uppercase whitespace-nowrap">Official Registry Node Verified</p>
          </div>
        </div>
      </div>
    </section>
  );
}
