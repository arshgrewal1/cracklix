'use client';

import React from "react";
import { motion } from "framer-motion";
import { 
  Smartphone, 
  ShieldCheck, 
  Zap, 
  Layers, 
  CheckCircle,
  Monitor,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { PLATFORM_VERSION } from "@/lib/version";

/**
 * @fileOverview Official Direct App Hub v10.0.
 * ONE-CLICK: Focused entirely on direct installation for maximum student retention.
 */

export default function InstallPwaPage() {
  const { canInstall, installApp, isInstalled } = usePWAInstall();
  const { version } = PLATFORM_VERSION;

  return (
    <div className="min-h-screen bg-[#0B1528] font-body text-left selection:bg-primary/10 flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <section className="relative w-full max-w-4xl mx-auto py-12 md:py-24 text-white">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
           
           <div className="relative z-10 text-center space-y-12">
              <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="space-y-8"
              >
                 <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                    <Zap className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-[10px] md:text-xs font-black tracking-[0.3em] uppercase">V{version} Production Node</span>
                 </div>

                 <div className="space-y-6">
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] antialiased uppercase">
                       Direct <br className="hidden md:block" /> 
                       <span className="text-primary italic">Setup.</span>
                    </h1>
                    <p className="text-slate-400 font-medium text-sm md:text-2xl max-w-2xl mx-auto leading-snug">
                       Install the official Cracklix application directly to your home screen. Fast, secure, and ready for offline preparation.
                    </p>
                 </div>

                 <div className="flex flex-col items-center justify-center gap-6 pt-8">
                    {isInstalled ? (
                      <motion.div 
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-4 px-12 py-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl shadow-2xl"
                      >
                        <CheckCircle className="h-8 w-8 text-emerald-500" />
                        <span className="font-black uppercase tracking-widest text-lg md:text-xl text-emerald-400">Application Active</span>
                      </motion.div>
                    ) : (
                      <Button 
                        onClick={installApp}
                        className="h-20 md:h-28 w-full max-w-[400px] bg-primary hover:bg-blue-700 text-white rounded-[2rem] md:rounded-[3rem] shadow-5xl gap-4 group transition-all active:scale-95 border-none"
                      >
                         <Smartphone className="h-8 w-8 md:h-10 md:w-10 group-hover:rotate-12 transition-transform" />
                         <div className="flex flex-col items-start text-left">
                            <span className="font-black tracking-tight text-xl md:text-3xl leading-none uppercase">Install App Now</span>
                            <span className="text-[9px] md:text-[11px] opacity-60 uppercase font-black tracking-widest mt-1.5">One-Step Platform Setup</span>
                         </div>
                      </Button>
                    )}
                 </div>

                 <div className="flex items-center justify-center gap-8 md:gap-12 text-slate-500 font-black text-[10px] md:text-[13px] tracking-widest pt-12">
                    <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" /> SECURE</span>
                    <span className="flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> SYNCED</span>
                    <span className="flex items-center gap-2"><Monitor className="h-4 w-4 text-primary" /> UNIVERSAL</span>
                 </div>
              </motion.div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
