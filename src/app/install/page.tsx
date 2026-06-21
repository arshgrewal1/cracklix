
'use client';

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { 
  Smartphone, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Apple, 
  Share,
  PlusSquare,
  CheckCircle2,
  MoreVertical,
  ChevronRight,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import PWAInstallButton from "@/components/PWAInstallButton";

/**
 * @fileOverview Public PWA Install Hub v11.0.
 * ACCESSIBLE: Publicly accessible without login to allow shared growth.
 * HARDENED: Direct install trigger and manual fallbacks.
 */
export default function InstallPage() {
  const [device, setDevice] = useState<"android" | "ios" | "desktop" | "unknown">("desktop");
  const [isStandalone, setIsStandalone] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const ua = navigator.userAgent.toLowerCase();
    if (/android/.test(ua)) setDevice("android");
    else if (/iphone|ipad|ipod/.test(ua)) setDevice("ios");
    else setDevice("desktop");

    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-[100dvh] bg-white font-body text-left">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 md:py-16 max-w-5xl space-y-12 md:space-y-24">
        
        <div className="text-center space-y-4 max-w-3xl mx-auto">
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="h-14 w-14 md:h-20 md:w-20 bg-primary/10 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center mx-auto text-primary shadow-2xl"
           >
              <Zap className="h-7 w-7 md:h-10 md:w-10 fill-current" />
           </motion.div>
           <div className="space-y-2 text-center">
              <h1 className="text-3xl md:text-7xl font-black text-[#0F172A] tracking-tighter leading-none">
                Cracklix <span className="text-primary">Native</span>
              </h1>
              <p className="text-[12px] md:text-2xl text-slate-500 font-medium leading-tight">
                 Official preparation hub for your home screen.
              </p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12 items-start">
           
           <div className="lg:col-span-7">
              <Card className="border-none shadow-5xl rounded-3xl bg-[#0B1528] text-white overflow-hidden p-6 md:p-14 space-y-6 md:space-y-10 relative">
                 <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12">
                    {device === "ios" ? <Apple className="h-44 w-44 md:h-64 md:w-64" /> : <Smartphone className="h-44 w-44 md:h-64 md:w-64" />}
                 </div>
                 
                 <div className="relative z-10 space-y-6 text-left">
                    <div className="flex items-center gap-2">
                       <Badge className="bg-primary text-white border-none px-3 py-1 rounded-full font-black uppercase text-[8px] md:text-[10px] tracking-widest">
                          {device.toUpperCase()} NODES
                       </Badge>
                       {isStandalone && <Badge className="bg-emerald-500 text-white border-none px-3 py-1 rounded-full font-black uppercase text-[8px] md:text-[10px] tracking-widest">INSTALLED</Badge>}
                    </div>

                    <h2 className="text-xl md:text-5xl font-black tracking-tight">
                       {device === "ios" ? 'iOS Hub Setup' : isStandalone ? 'App Active' : 'Start Installation'}
                    </h2>

                    {device === "ios" ? (
                       <div className="space-y-4">
                          <InstructionStep num={1} icon={<Share className="h-3.5 w-3.5" />} text="Tap 'Share' in Safari footer" />
                          <InstructionStep num={2} icon={<PlusSquare className="h-3.5 w-3.5" />} text="Select 'Add to Home Screen'" />
                          <InstructionStep num={3} icon={<Sparkles className="h-3.5 w-3.5" />} text="Launch from Home Screen" />
                       </div>
                    ) : isStandalone ? (
                       <div className="space-y-4">
                          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
                             <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                             <p className="text-emerald-50 text-[11px] md:text-sm font-medium leading-relaxed">Native mode active. You are now connected to the elite prep registry.</p>
                          </div>
                          <Button asChild className="w-full h-12 bg-white text-black hover:bg-slate-100 rounded-full font-black uppercase tracking-widest text-[9px] border-none shadow-xl transition-all">
                             <Link href="/dashboard">Enter Dashboard</Link>
                          </Button>
                       </div>
                    ) : (
                       <div className="space-y-6 text-left">
                          <p className="text-slate-400 text-sm md:text-lg font-medium leading-relaxed">
                             Install for low-latency mock tests and instant recruitment alerts.
                          </p>
                          <div className="space-y-3">
                             <PWAInstallButton 
                                variant="primary"
                                className="w-full h-14 md:h-20 text-[10px] md:text-[11px] rounded-full"
                             />
                             <p className="text-[9px] font-bold text-slate-500 text-center uppercase tracking-widest">One-tap installation for supported browsers</p>
                          </div>
                       </div>
                    )}
                 </div>
              </Card>

              {(!isStandalone && device !== "ios") && (
                 <div className="mt-6 space-y-4">
                    <Card className="p-6 md:p-10 rounded-[2.5rem] bg-slate-50 border border-slate-200 space-y-6 text-left shadow-inner">
                       <h3 className="text-lg font-black uppercase text-[#0F172A] flex items-center gap-2">
                          <Smartphone className="h-5 w-5 text-primary" /> Manual Setup Fallback
                       </h3>
                       <div className="space-y-4">
                          <InstructionStep num={1} icon={<MoreVertical className="h-3.5 w-3.5" />} text="Tap browser menu (3-dots)" color="text-slate-500" />
                          <InstructionStep num={2} icon={<PlusSquare className="h-3.5 w-3.5" />} text="Select 'Install App' or 'Add to Home'" color="text-slate-500" />
                          <InstructionStep num={3} icon={<CheckCircle2 className="h-3.5 w-3.5" />} text="Sync and Launch from Home Screen" color="text-slate-500" />
                       </div>
                    </Card>
                 </div>
              )}
           </div>

           <div className="lg:col-span-5 space-y-4 md:space-y-8 text-left">
              <h3 className="text-[9px] font-black uppercase text-slate-400 tracking-[0.4em] ml-1">Registry Perks</h3>
              <div className="grid grid-cols-1 gap-3">
                 <BenefitRow icon={<Smartphone />} title="Native Experience" desc="Zero address bar distraction." />
                 <BenefitRow icon={<Zap />} title="Rapid Sync" desc="Offline cached preparation nodes." />
                 <BenefitRow icon={<ShieldCheck />} title="Push Alerts" desc="Instant recruitment notifications." />
              </div>

              <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-start gap-4">
                 <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                 <p className="text-[10px] md:text-[11px] font-bold text-blue-800 leading-relaxed uppercase">
                    Cracklix is a Progressive Web App (PWA). It works just like a native app but consumes less storage and updates automatically.
                 </p>
              </div>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function InstructionStep({ num, icon, text, color = "text-primary" }: any) {
   return (
      <div className="flex items-center gap-4 group">
         <div className={cn("h-8 w-8 md:h-12 md:w-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-black text-[10px] md:text-sm shadow-inner", color)}>
            {num}
         </div>
         <div className="flex items-center gap-2 text-slate-200">
            <span className={cn("p-1.5 bg-white/10 rounded-lg", color)}>{icon}</span>
            <span className="text-[11px] md:text-lg font-bold tracking-tight text-current leading-none">{text}</span>
         </div>
      </div>
   );
}

function BenefitRow({ icon, title, desc }: any) {
   return (
      <div className="p-4 md:p-8 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 md:gap-6 group hover:bg-white hover:shadow-xl transition-all">
         <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform shrink-0">
            {React.cloneElement(icon, { className: "h-5 w-5" })}
         </div>
         <div className="text-left min-w-0">
            <h4 className="font-black text-xs md:text-sm uppercase text-[#0F172A] tracking-tight">{title}</h4>
            <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{desc}</p>
         </div>
      </div>
   );
}
