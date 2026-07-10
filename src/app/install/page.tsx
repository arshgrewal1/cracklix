'use client';

import React from "react";
import { motion } from "framer-motion";
import { 
  Smartphone, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Layers, 
  CheckCircle,
  PlusSquare,
  Share,
  Monitor,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { PLATFORM_VERSION } from "@/lib/version";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Official PWA Install Hub v5.0.
 * Optimized for direct browser-to-home-screen conversion.
 */

export default function InstallPwaPage() {
  const { canInstall, installApp, isInstalled } = usePWAInstall();
  const { version } = PLATFORM_VERSION;

  return (
    <div className="min-h-screen bg-white font-body text-left selection:bg-primary/10">
      <Navbar />
      
      <main>
        {/* PREMIUM INSTALL HERO */}
        <section className="relative pt-12 pb-24 md:pt-32 md:pb-48 overflow-hidden bg-[#0B1528] text-white">
           <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[160px] rounded-full" />
           
           <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
              <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="space-y-10 max-w-4xl mx-auto"
              >
                 <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                    <Zap className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-[10px] md:text-xs font-black tracking-[0.3em] uppercase">Official Hub Node v{version}</span>
                 </div>

                 <div className="space-y-6">
                    <h1 className="text-4xl md:text-8xl font-black tracking-tighter leading-[0.9] antialiased uppercase">
                       From Your <br className="hidden md:block" /> 
                       <span className="text-primary italic">Home Screen.</span>
                    </h1>
                    <p className="text-slate-400 font-medium text-sm md:text-2xl max-w-2xl mx-auto leading-snug">
                       Install the official Cracklix hub directly from your browser. Zero downloads, zero lag, and instant offline registry access.
                    </p>
                 </div>

                 <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6">
                    {isInstalled ? (
                      <div className="flex items-center gap-4 px-10 py-5 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] shadow-xl">
                        <CheckCircle className="h-8 w-8 text-emerald-500" />
                        <span className="font-black uppercase tracking-widest text-sm md:text-lg text-emerald-400">Hub Already Installed</span>
                      </div>
                    ) : canInstall ? (
                      <Button 
                        onClick={installApp}
                        className="h-16 md:h-24 px-10 md:px-16 bg-primary hover:bg-blue-700 text-white rounded-2xl md:rounded-[2.5rem] shadow-5xl gap-4 group transition-all active:scale-95 border-none"
                      >
                         <Smartphone className="h-6 w-6 md:h-8 md:w-8 group-hover:rotate-12 transition-transform" />
                         <div className="flex flex-col items-start text-left">
                            <span className="font-black tracking-tight text-base md:text-2xl leading-none uppercase">Install Hub Now</span>
                            <span className="text-[8px] md:text-[10px] opacity-60 uppercase font-black tracking-widest mt-1">Direct Browser Setup</span>
                         </div>
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div className="inline-flex items-center gap-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-6 py-3 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg">
                           <AlertCircle className="h-4 w-4" /> Setup Required
                        </div>
                        <p className="text-slate-400 font-bold text-sm md:text-lg">Follow the manual instructions below to add Cracklix to your home screen.</p>
                      </div>
                    )}
                 </div>

                 <div className="flex items-center justify-center gap-10 text-slate-500 font-black text-[9px] md:text-[12px] tracking-widest pt-8">
                    <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" /> SECURED</span>
                    <span className="flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> INSTANT SYNC</span>
                    <span className="flex items-center gap-2"><Monitor className="h-4 w-4 text-primary" /> CROSS-DEVICE</span>
                 </div>
              </motion.div>
           </div>
        </section>

        {/* INSTALLATION STEPS */}
        <section className="py-24 bg-white">
           <div className="container mx-auto px-4 max-w-5xl">
              <div className="text-center space-y-4 mb-16">
                 <h2 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tight uppercase">Installation Guide</h2>
                 <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">Institutional Browser Protocols</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* ANDROID/CHROME */}
                <div className="space-y-8 p-10 bg-slate-50 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5"><Zap className="h-32 w-32" /></div>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-50 text-primary rounded-2xl flex items-center justify-center"><Smartphone className="h-6 w-6" /></div>
                    <h3 className="text-xl font-black text-[#0F172A] uppercase">Android / Chrome</h3>
                  </div>
                  <div className="space-y-6 relative z-10">
                    <InstallStep num="1" text="Tap the three dots (⋮) in the top right corner of Chrome." />
                    <InstallStep num="2" text="Select 'Install App' or 'Add to Home Screen' from the menu." />
                    <InstallStep num="3" text="Confirm the installation to add Cracklix to your drawer." />
                  </div>
                </div>

                {/* IOS/SAFARI */}
                <div className="space-y-8 p-10 bg-slate-50 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5"><Share className="h-32 w-32" /></div>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center"><Share className="h-6 w-6" /></div>
                    <h3 className="text-xl font-black text-[#0F172A] uppercase">iOS / Safari</h3>
                  </div>
                  <div className="space-y-6 relative z-10">
                    <InstallStep num="1" text="Tap the 'Share' icon (square with up arrow) at the bottom." />
                    <InstallStep num="2" text="Scroll down and tap 'Add to Home Screen'." />
                    <InstallStep num="3" text="Tap 'Add' in the top right to finish the setup." />
                  </div>
                </div>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function InstallStep({ num, text }: { num: string, text: string }) {
   return (
      <div className="flex items-center gap-5 group">
         <div className="h-9 w-9 rounded-full bg-white border border-slate-200 flex items-center justify-center font-black text-xs text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
            {num}
         </div>
         <p className="text-sm text-slate-600 font-bold leading-tight">{text}</p>
      </div>
   )
}
