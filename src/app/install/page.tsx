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
  Download,
  ArrowRight,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { PLATFORM_VERSION } from "@/lib/version";

/**
 * @fileOverview Official Direct App Hub v11.0.
 * DIRECT ACTION: A high-fidelity, single-focus node for application setup.
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
                 className="space-y-8 md:space-y-12"
              >
                 <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-[10px] md:text-xs font-black tracking-[0.3em] uppercase">V{version} Production Hub</span>
                 </div>

                 <div className="space-y-6">
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] antialiased uppercase">
                       Direct <br className="hidden md:block" /> 
                       <span className="text-primary italic">Setup.</span>
                    </h1>
                    <p className="text-slate-400 font-medium text-sm md:text-2xl max-w-2xl mx-auto leading-snug tracking-tight">
                       Synchronize the official preparation registry with your home screen. One-click setup for the smartest exam experience.
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
                        <span className="font-black uppercase tracking-widest text-lg md:text-xl text-emerald-400">Application Verified</span>
                      </motion.div>
                    ) : (
                      <Button 
                        onClick={installApp}
                        className="h-20 md:h-28 w-full max-w-[440px] bg-primary hover:bg-blue-700 text-white rounded-[2rem] md:rounded-[3rem] shadow-5xl gap-4 md:gap-8 group transition-all active:scale-95 border-none"
                      >
                         <Smartphone className="h-8 w-8 md:h-12 md:w-12 group-hover:rotate-12 transition-transform" />
                         <div className="flex flex-col items-start text-left">
                            <span className="font-black tracking-tight text-xl md:text-3xl leading-none uppercase">Install Hub Now</span>
                            <span className="text-[9px] md:text-[11px] opacity-60 uppercase font-black tracking-widest mt-2">Authorize Registry Sync</span>
                         </div>
                         <ChevronRight className="h-5 w-5 md:h-8 md:w-8 ml-auto opacity-30 group-hover:translate-x-2 transition-transform" />
                      </Button>
                    )}
                 </div>

                 <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-slate-500 font-black text-[10px] md:text-[13px] tracking-widest pt-12 uppercase">
                    <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Secure</div>
                    <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Instant</div>
                    <div className="flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> Unified</div>
                 </div>
              </motion.div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
