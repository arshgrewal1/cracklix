'use client';

import React from "react";
import { motion } from "framer-motion";
import { 
  Smartphone, 
  ShieldCheck, 
  Zap, 
  Layers, 
  CheckCircle,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { PLATFORM_VERSION } from "@/lib/version";

/**
 * @fileOverview Official Direct App Portal v12.1.
 * UPDATED: Matched high-fidelity midnight theme with refined radial blue glow.
 * NORMALIZED: Removed forced uppercase and replaced Hub terminology.
 */

export default function InstallPwaPage() {
  const { canInstall, installApp, isInstalled } = usePWAInstall();
  const { version } = PLATFORM_VERSION;

  return (
    <div className="min-h-screen bg-[#0B1528] font-body text-left selection:bg-primary/10 flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* REFINED RADIAL GLOW */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl aspect-square bg-primary/15 blur-[160px] rounded-full pointer-events-none" />

        <section className="relative w-full max-w-5xl mx-auto py-12 md:py-24 text-white z-10">
           <div className="text-center space-y-8 md:space-y-16">
              <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="space-y-10 md:space-y-14"
              >
                 {/* VERSION BADGE */}
                 <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
                    <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                    <span className="text-[10px] md:text-xs font-black tracking-[0.3em] uppercase text-white/90">V{version} Production Portal</span>
                 </div>

                 {/* HERO GRAPHIC - HIGH FIDELITY */}
                 <div className="relative py-4">
                    <h1 className="flex flex-col items-center justify-center font-black tracking-tighter leading-[0.8] md:leading-[0.75] select-none antialiased italic">
                       <span className="text-[60px] md:text-[140px] lg:text-[180px] text-[#1E293B]/40 uppercase">Direct</span>
                       <span className="text-[72px] md:text-[160px] lg:text-[200px] text-primary uppercase mt-[-10px] md:mt-[-30px]">Setup.</span>
                    </h1>
                 </div>

                 {/* DESCRIPTION */}
                 <div className="max-w-2xl mx-auto space-y-10">
                    <p className="text-slate-400 font-medium text-[15px] md:text-2xl leading-snug tracking-tight px-4">
                       Synchronize the official preparation registry with your home screen. One-click setup for the smartest exam experience.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-6 pt-4">
                       {isInstalled ? (
                         <motion.div 
                           initial={{ scale: 0.9 }}
                           animate={{ scale: 1 }}
                           className="flex items-center gap-4 px-12 py-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl shadow-3xl"
                         >
                           <CheckCircle className="h-8 w-8 text-emerald-500" />
                           <span className="font-bold text-lg md:text-xl text-emerald-400">Application Verified</span>
                         </motion.div>
                       ) : (
                         <Button 
                           onClick={installApp}
                           className="h-20 md:h-28 w-full max-w-[440px] bg-primary hover:bg-blue-700 text-white rounded-[2rem] md:rounded-[3rem] shadow-5xl gap-4 md:gap-8 group transition-all active:scale-95 border-none px-10"
                         >
                            <Smartphone className="h-8 w-8 md:h-12 md:w-12 group-hover:rotate-12 transition-transform" />
                            <div className="flex flex-col items-start text-left">
                               <span className="font-black tracking-tight text-xl md:text-3xl leading-none">Install App Now</span>
                               <span className="text-[11px] md:text-sm opacity-60 font-bold mt-2 uppercase tracking-widest">Authorize Registry Sync</span>
                            </div>
                            <ChevronRight className="h-5 w-5 md:h-8 md:w-8 ml-auto opacity-30 group-hover:translate-x-2 transition-transform" />
                         </Button>
                       )}
                    </div>
                 </div>

                 {/* FEATURE NODES */}
                 <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-slate-500 font-black text-[10px] md:text-[13px] tracking-widest pt-12 border-t border-white/5 max-w-3xl mx-auto uppercase">
                    <div className="flex items-center gap-2.5 hover:text-white transition-colors"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Secure</div>
                    <div className="flex items-center gap-2.5 hover:text-white transition-colors"><Zap className="h-4 w-4 text-primary" /> Instant</div>
                    <div className="flex items-center gap-2.5 hover:text-white transition-colors"><Layers className="h-4 w-4 text-primary" /> Unified</div>
                 </div>
              </motion.div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
