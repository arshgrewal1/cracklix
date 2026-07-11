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
 * @fileOverview Official Direct App Portal v13.0.
 * UPDATED: Normalized background to light theme to match site-wide header color.
 * FIXED: Scaled down hero text sizes for better side margins.
 */

export default function InstallPwaPage() {
  const { canInstall, installApp, isInstalled } = usePWAInstall();
  const { version } = PLATFORM_VERSION;

  return (
    <div className="min-h-screen bg-slate-50/50 font-body text-left selection:bg-primary/10 flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* SUBTLE RADIAL GLOW */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl aspect-square bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

        <section className="relative w-full max-w-5xl mx-auto py-12 md:py-20 text-[#0F172A] z-10">
           <div className="text-center space-y-8 md:space-y-12">
              <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="space-y-8 md:space-y-10"
              >
                 {/* VERSION BADGE */}
                 <div className="inline-flex items-center gap-3 px-5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
                    <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                    <span className="text-[10px] md:text-[11px] font-black tracking-widest uppercase text-slate-400">V{version} Production Portal</span>
                 </div>

                 {/* HERO GRAPHIC - SCALED DOWN FOR BETTER MARGINS */}
                 <div className="relative py-2">
                    <h1 className="flex flex-col items-center justify-center font-black tracking-tighter leading-[0.85] md:leading-[0.8] select-none antialiased italic">
                       <span className="text-[48px] md:text-[100px] lg:text-[120px] text-slate-200 uppercase">Direct</span>
                       <span className="text-[56px] md:text-[120px] lg:text-[140px] text-primary uppercase mt-[-10px] md:mt-[-20px]">Setup.</span>
                    </h1>
                 </div>

                 {/* DESCRIPTION */}
                 <div className="max-w-2xl mx-auto space-y-8">
                    <p className="text-slate-500 font-medium text-[14px] md:text-xl leading-relaxed tracking-tight px-4">
                       Synchronize the official preparation registry with your home screen. One-click setup for the smartest exam experience.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-6 pt-2">
                       {isInstalled ? (
                         <motion.div 
                           initial={{ scale: 0.9 }}
                           animate={{ scale: 1 }}
                           className="flex items-center gap-4 px-10 py-5 bg-emerald-50 border border-emerald-100 rounded-2xl shadow-sm"
                         >
                           <CheckCircle className="h-6 w-6 text-emerald-500" />
                           <span className="font-bold text-base md:text-lg text-emerald-600">Application Verified</span>
                         </motion.div>
                       ) : (
                         <Button 
                           onClick={installApp}
                           className="h-16 md:h-24 w-full max-w-[400px] bg-primary hover:bg-blue-700 text-white rounded-2xl md:rounded-3xl shadow-4xl gap-4 md:gap-6 group transition-all active:scale-95 border-none px-8"
                         >
                            <Smartphone className="h-6 w-6 md:h-10 md:w-10 group-hover:rotate-12 transition-transform" />
                            <div className="flex flex-col items-start text-left">
                               <span className="font-black tracking-tight text-lg md:text-2xl leading-none">Install App Now</span>
                               <span className="text-[9px] md:text-[11px] opacity-60 font-bold mt-1.5 uppercase tracking-widest">Authorize Registry Sync</span>
                            </div>
                            <ChevronRight className="h-4 w-4 md:h-6 md:w-6 ml-auto opacity-30 group-hover:translate-x-1 transition-transform" />
                         </Button>
                       )}
                    </div>
                 </div>

                 {/* FEATURE NODES */}
                 <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-slate-400 font-black text-[9px] md:text-[11px] tracking-widest pt-10 border-t border-slate-100 max-w-2xl mx-auto uppercase">
                    <div className="flex items-center gap-2 hover:text-primary transition-colors"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Secure</div>
                    <div className="flex items-center gap-2 hover:text-primary transition-colors"><Zap className="h-3.5 w-3.5 text-primary" /> Instant</div>
                    <div className="flex items-center gap-2 hover:text-primary transition-colors"><Layers className="h-3.5 w-3.5 text-primary" /> Unified</div>
                 </div>
              </motion.div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
