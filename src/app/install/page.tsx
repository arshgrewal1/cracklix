'use client';

import React from "react";
import { motion } from "framer-motion";
import { 
  Smartphone, 
  ShieldCheck, 
  Zap, 
  Layers, 
  CheckCircle,
  Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { PLATFORM_VERSION } from "@/lib/version";

/**
 * @fileOverview Official App Hub v9.0.
 * DIRECT: Removed manual instructions to focus on high-fidelity direct setup.
 */

export default function InstallPwaPage() {
  const { canInstall, installApp, isInstalled } = usePWAInstall();
  const { version } = PLATFORM_VERSION;

  return (
    <div className="min-h-screen bg-white font-body text-left selection:bg-primary/10">
      <Navbar />
      
      <main>
        {/* PREMIUM INSTALL HERO - NOW THE ONLY SECTION */}
        <section className="relative min-h-[80vh] flex items-center pt-12 pb-24 md:pt-32 md:pb-48 overflow-hidden bg-[#0B1528] text-white">
           <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[160px] rounded-full" />
           
           <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
              <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="space-y-10 max-w-4xl mx-auto"
              >
                 <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                    <Zap className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-[10px] md:text-xs font-black tracking-[0.3em] uppercase">Official App Hub v{version}</span>
                 </div>

                 <div className="space-y-6">
                    <h1 className="text-4xl md:text-8xl font-black tracking-tighter leading-[0.9] antialiased uppercase">
                       Official App <br className="hidden md:block" /> 
                       <span className="text-primary italic">Distribution.</span>
                    </h1>
                    <p className="text-slate-400 font-medium text-sm md:text-2xl max-w-2xl mx-auto leading-snug">
                       Setup the official Cracklix application directly from your browser. Zero step setup, instant registry sync, and high-fidelity offline preparation.
                    </p>
                 </div>

                 <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6">
                    {isInstalled ? (
                      <div className="flex items-center gap-4 px-10 py-5 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] shadow-xl">
                        <CheckCircle className="h-8 w-8 text-emerald-500" />
                        <span className="font-black uppercase tracking-widest text-sm md:text-lg text-emerald-400">Application Active</span>
                      </div>
                    ) : (
                      <Button 
                        onClick={installApp}
                        className="h-16 md:h-24 px-10 md:px-16 bg-primary hover:bg-blue-700 text-white rounded-2xl md:rounded-[2.5rem] shadow-5xl gap-4 group transition-all active:scale-95 border-none"
                      >
                         <Smartphone className="h-6 w-6 md:h-8 md:w-8 group-hover:rotate-12 transition-transform" />
                         <div className="flex flex-col items-start text-left">
                            <span className="font-black tracking-tight text-base md:text-2xl leading-none uppercase">Install App Now</span>
                            <span className="text-[8px] md:text-[10px] opacity-60 uppercase font-black tracking-widest mt-1">Direct Platform Setup</span>
                         </div>
                      </Button>
                    )}
                 </div>

                 <div className="flex items-center justify-center gap-10 text-slate-500 font-black text-[9px] md:text-[12px] tracking-widest pt-8">
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
