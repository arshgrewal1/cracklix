'use client';

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Smartphone, 
  ShieldCheck, 
  Zap, 
  Layers, 
  CheckCircle,
  ChevronRight,
  Sparkles,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { PLATFORM_VERSION } from "@/lib/version";

/**
 * @fileOverview Official Direct App Portal v16.0.
 * UPDATED: Optimized for One-Click One-Tap installation.
 */

export default function InstallPwaPage() {
  const { canInstall, installApp, isInstalled } = usePWAInstall();
  const { version } = PLATFORM_VERSION;
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOneClickInstall = async () => {
    if (isInstalled) return;
    setIsProcessing(true);
    try {
      await installApp();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-body text-left selection:bg-primary/10 flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl aspect-square bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

        <section className="relative w-full max-w-4xl mx-auto py-10 md:py-20 text-[#0F172A] z-10">
           <div className="text-center space-y-10 md:space-y-14">
              <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="space-y-8 md:space-y-10"
              >
                 <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white border border-slate-200 shadow-sm mx-auto">
                    <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                    <span className="text-[10px] md:text-[11px] font-black tracking-widest uppercase text-slate-400">V{version} Direct Setup</span>
                 </div>

                 <div className="relative py-2 flex flex-col items-center">
                    <h1 className="flex flex-col items-center justify-center font-black tracking-tighter leading-[0.85] md:leading-[0.8] select-none antialiased italic">
                       <span className="text-[42px] md:text-[80px] lg:text-[100px] text-slate-200 uppercase">One Click</span>
                       <span className="text-[52px] md:text-[100px] lg:text-[120px] text-primary uppercase mt-[-10px] md:mt-[-15px]">Install.</span>
                    </h1>
                 </div>

                 <div className="max-w-xl mx-auto space-y-8 px-4">
                    <p className="text-slate-500 font-medium text-[13px] md:text-xl leading-relaxed tracking-tight">
                       Install the official Cracklix app on your home screen for high-speed preparation, offline tests, and instant job alerts.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-6 pt-4">
                       {isInstalled ? (
                         <motion.div 
                           initial={{ scale: 0.9 }}
                           animate={{ scale: 1 }}
                           className="flex items-center gap-4 px-10 py-5 bg-emerald-50 border border-emerald-100 rounded-2xl shadow-sm"
                         >
                           <CheckCircle className="h-6 w-6 text-emerald-500" />
                           <span className="font-bold text-base md:text-lg text-emerald-600">App Is Installed</span>
                         </motion.div>
                       ) : (
                         <Button 
                           onClick={handleOneClickInstall}
                           disabled={isProcessing}
                           className="h-16 md:h-24 w-full max-w-[360px] bg-primary hover:bg-blue-700 text-white rounded-2xl md:rounded-[2rem] shadow-4xl gap-4 md:gap-6 group transition-all active:scale-95 border-none px-8"
                         >
                            {isProcessing ? (
                              <Loader2 className="h-8 w-8 animate-spin" />
                            ) : (
                              <Smartphone className="h-6 w-6 md:h-10 md:w-10 group-hover:rotate-12 transition-transform" />
                            )}
                            
                            <div className="flex flex-col items-start text-left">
                               <span className="font-black tracking-tight text-lg md:text-2xl leading-none">
                                 {isProcessing ? 'Syncing...' : 'Install Now'}
                               </span>
                               <span className="text-[8px] md:text-[10px] opacity-60 font-bold mt-1 uppercase tracking-widest">Instant One-Click Setup</span>
                            </div>
                            <ChevronRight className="h-4 w-4 md:h-6 md:w-6 ml-auto opacity-30 group-hover:translate-x-1 transition-transform" />
                         </Button>
                       )}
                       
                       {!canInstall && !isInstalled && (
                          <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4 text-left max-w-sm">
                             <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                             <p className="text-[11px] md:text-xs text-amber-700 font-medium leading-relaxed">
                                If the install button doesn't trigger, click your browser's <span className="font-black">Menu (⋮)</span> and select <span className="font-black">"Add to Home Screen"</span>.
                             </p>
                          </div>
                       )}
                    </div>
                 </div>

                 <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-slate-400 font-black text-[9px] md:text-[11px] tracking-widest pt-10 border-t border-slate-100 max-w-lg mx-auto uppercase">
                    <div className="flex items-center gap-2 hover:text-primary transition-colors"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Secure Hub</div>
                    <div className="flex items-center gap-2 hover:text-primary transition-colors"><Zap className="h-3.5 w-3.5 text-primary" /> Instant Sync</div>
                    <div className="flex items-center gap-2 hover:text-primary transition-colors"><Layers className="h-3.5 w-3.5 text-primary" /> Offline Ready</div>
                 </div>
              </motion.div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function AlertCircle({ className }: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  );
}
