'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { CheckCircle, Download, ShieldCheck, Smartphone, Zap, ArrowRight, Layers } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { PLATFORM_VERSION } from "@/lib/version";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

/**
 * @fileOverview Official Direct Install Hub v2.0.
 * High-fidelity landing page for APK distribution and PWA setup.
 */

const CURRENT_BUILD_VERSION = `v${PLATFORM_VERSION.version}`;
const BUILD_DATE = PLATFORM_VERSION.releaseDate;
const APK_DOWNLOAD_URL = "https://github.com/arshgrewal1/cracklix/releases/latest/download/cracklix.apk";

export default function InstallPwaPage() {
   const [buildProgress, setBuildProgress] = useState(10);
   const [apkFound, setApkFound] = useState(false);

   const handleDownload = () => {
      window.open(APK_DOWNLOAD_URL, '_blank');
   };

   useEffect(() => {
      let active = true;
      const timer = setInterval(() => {
         setBuildProgress(prev => (prev >= 90 ? 90 : prev + 10));
      }, 150);

      fetch(APK_DOWNLOAD_URL, { method: 'HEAD' })
         .then(res => {
            if (!active) return;
            setBuildProgress(100);
            if (res.ok) {
               setApkFound(true);
            }
         })
         .catch(() => {
            if (active) setBuildProgress(100);
         });

      return () => {
         active = false;
         clearInterval(timer);
      };
   }, []);
   
   return (
      <div className="min-h-screen bg-white font-body text-left">
         <Navbar />
         
         <main className="container mx-auto px-4 py-12 md:py-24 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
               
               {/* BRAND IDENTITY & FEATURES */}
               <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-10 md:space-y-16"
               >
                  <div className="space-y-6">
                     <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                        <Zap className="h-4 w-4 text-primary animate-pulse" />
                        <span className="text-[10px] font-black tracking-widest text-primary uppercase">Institutional Mobile Node</span>
                     </div>
                     <h1 className="text-4xl md:text-7xl font-black text-[#0F172A] tracking-tighter leading-[0.95] antialiased">
                        Get the Full <br/> <span className="text-primary">Experience.</span>
                     </h1>
                     <p className="text-base md:text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
                        Install the official Android app to unlock high-fidelity mock tests, offline study nodes, and instant merit notifications.
                     </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                     <FeatureItem title="Secure Native Build" desc="Digitally signed Android APK verified for institutional data integrity." />
                     <FeatureItem title="Zero Latency Hub" desc="Optimized rendering engine built for high-speed test practice." />
                     <FeatureItem title="Offline Registry" desc="Access your vault and attempted mocks without an internet connection." />
                  </div>
               </motion.div>

               {/* DOWNLOAD / INSTALL CARD */}
               <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
               >
                  <Card className="p-8 md:p-14 border-none shadow-5xl rounded-[3rem] bg-[#0B1528] text-white relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000">
                        <Smartphone className="h-64 w-64" />
                     </div>

                     <div className="relative z-10 flex flex-col items-center text-center space-y-10">
                        <div className="h-20 w-20 md:h-24 md:w-24 bg-primary/20 rounded-[2.5rem] flex items-center justify-center text-primary shadow-2xl">
                           <Download className="h-10 w-10 md:h-12 md:w-12 animate-bounce" />
                        </div>
                        
                        <div className="space-y-2">
                           <h2 className="text-2xl md:text-4xl font-black tracking-tight">Direct Install</h2>
                           <p className="text-slate-400 font-bold uppercase text-[9px] md:text-xs tracking-[0.3em]">Build {CURRENT_BUILD_VERSION} • {BUILD_DATE}</p>
                        </div>

                        <div className="w-full space-y-6">
                           {!apkFound ? (
                              <div className="w-full space-y-3">
                                 <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                    <span>Syncing build node...</span>
                                    <span>{buildProgress}%</span>
                                 </div>
                                 <Progress value={buildProgress} className="h-2 bg-white/5" />
                              </div>
                           ) : (
                              <div className="space-y-6">
                                 <Button 
                                    onClick={handleDownload}
                                    className="w-full h-16 md:h-20 bg-primary hover:bg-blue-700 text-white gap-4 rounded-2xl md:rounded-[2rem] font-black uppercase tracking-widest text-xs md:text-lg shadow-2xl transition-all active:scale-95 border-none"
                                 >
                                    <Download className="h-6 w-6" /> Download APK Node
                                 </Button>
                                 <div className="flex items-center justify-center gap-6 text-slate-500 font-black text-[9px] tracking-[0.2em] uppercase">
                                    <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Verified</span>
                                    <span className="flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> 15.4MB</span>
                                 </div>
                              </div>
                           )}
                        </div>

                        <div className="pt-8 border-t border-white/5 w-full">
                           <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">
                              * Recommended for PPSC, PSSSB and Punjab Police aspirants for best performance.
                           </p>
                        </div>
                     </div>
                  </Card>
               </motion.div>

            </div>
         </main>
         
         <Footer />
      </div>
   );
}

function FeatureItem({ title, desc }: { title: string, desc: string }) {
   return (
      <div className="flex items-start gap-6 group">
         <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-300">
            <CheckCircle className="h-6 w-6" />
         </div>
         <div className="space-y-1">
            <h3 className="text-lg font-black text-[#0F172A] uppercase tracking-tight">{title}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
         </div>
      </div>
   )
}
