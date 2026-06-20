"use client"

import React, { useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { motion } from "framer-motion"
import { 
  Smartphone, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Apple, 
  Share,
  PlusSquare,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

/**
 * @fileOverview High-Fidelity PWA Install Hub v1.4 (Hardened).
 * FIXED: Resolved TS2367 type overlap error for 'device' state.
 */

type DeviceType = "android" | "ios" | "desktop" | "unknown";

export default function InstallPage() {
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = navigator.userAgent.toLowerCase();
    if (/android/.test(ua)) setDevice("android");
    else if (/iphone|ipad|ipod/.test(ua)) setDevice("ios");
    else setDevice("desktop");

    const updateState = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
      setIsStandalone(!!standalone);
      setIsInstallable(!!(window as any).deferredPrompt);
    };

    window.addEventListener('pwa-installable', updateState);
    window.addEventListener('appinstalled', updateState);
    updateState();

    return () => {
      window.removeEventListener('pwa-installable', updateState);
      window.removeEventListener('appinstalled', updateState);
    };
  }, []);

  const handleInstall = async () => {
    const prompt = (window as any).deferredPrompt;
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') (window as any).deferredPrompt = null;
    } else if (device === "ios") {
       toast({
         title: "iOS Instructions",
         description: "Tap Share > Add to Home Screen to install.",
       });
    } else {
       toast({
         variant: "destructive",
         title: "Handshake Pending",
         description: "Please open this page in Chrome or your native mobile browser.",
       });
    }
  };

  return (
    <div className="min-h-screen bg-white font-body text-left">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 md:py-24 max-w-5xl space-y-16 md:space-y-24">
        
        <div className="text-center space-y-6 max-w-3xl mx-auto">
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="h-20 w-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-primary shadow-2xl"
           >
              <Zap className="h-10 w-10 fill-current" />
           </motion.div>
           <div className="space-y-4">
              <h1 className="text-4xl md:text-7xl font-black text-[#0F172A] tracking-tighter leading-[0.95] uppercase">
                Native <span className="text-primary">Experience</span>
              </h1>
              <p className="text-sm md:text-2xl text-slate-500 font-medium leading-tight">
                 Install Cracklix on your home screen for zero distractions and rapid loading.
              </p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
           
           <div className="lg:col-span-7">
              <Card className="border-none shadow-5xl rounded-[3rem] bg-[#0B1528] text-white overflow-hidden p-8 md:p-14 space-y-10 relative">
                 <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
                    {device === "ios" ? <Apple className="h-64 w-64" /> : <Smartphone className="h-64 w-64" />}
                 </div>
                 
                 <div className="relative z-10 space-y-8 text-left">
                    <div className="flex items-center gap-4">
                       <Badge className="bg-primary text-white border-none px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest">
                          {device.toUpperCase()} MODE
                       </Badge>
                       {isStandalone && (
                         <Badge className="bg-emerald-500 text-white border-none px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest">
                            INSTALLED
                         </Badge>
                       )}
                    </div>

                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
                       {device === "ios" ? 'Steps for iPhone' : isStandalone ? 'Ready to Prepare' : 'Install Cracklix'}
                    </h2>

                    {device === "ios" ? (
                       <div className="space-y-6">
                          <IOSStep num={1} icon={<Share className="h-4 w-4" />} text="Tap 'Share' in your Safari toolbar" />
                          <IOSStep num={2} icon={<PlusSquare className="h-4 w-4" />} text="Scroll and tap 'Add to Home Screen'" />
                          <IOSStep num={3} icon={<Sparkles className="h-4 w-4" />} text="Launch and start your preparation" />
                       </div>
                    ) : isStandalone ? (
                       <div className="space-y-6">
                          <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-4">
                             <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                             <p className="text-emerald-50 text-sm font-medium">You are already using the native app. Go to your home screen to launch it anytime.</p>
                          </div>
                          <Button asChild className="w-full h-16 bg-white text-black hover:bg-slate-100 rounded-2xl font-black uppercase tracking-widest text-[10px] border-none shadow-xl transition-all">
                             <Link href="/dashboard">Back to Hub</Link>
                          </Button>
                       </div>
                    ) : (
                       <div className="space-y-8 text-left">
                          <p className="text-slate-400 text-lg font-medium leading-relaxed">
                             {device === "desktop" 
                               ? 'Install the desktop app for a cleaner interface and taskbar shortcuts.' 
                               : 'Get instant notifications and faster access directly on your Android phone.'}
                          </p>
                          <div className="space-y-4">
                             <Button 
                                onClick={handleInstall}
                                disabled={!isInstallable && (device as string) !== "ios"}
                                className="w-full h-16 md:h-20 bg-primary hover:bg-blue-600 text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-2xl shadow-3xl transition-all active:scale-95 border-none gap-4"
                             >
                                <Download className="h-6 w-6" /> {isInstallable ? 'INSTALL CRACKLIX APP' : 'BROWSER NOT READY'}
                             </Button>
                             {!isInstallable && (device as string) !== "ios" && (
                                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center gap-3">
                                   <AlertCircle className="h-4 w-4 text-orange-500 shrink-0" />
                                   <p className="text-[10px] text-orange-200 font-bold uppercase tracking-tight">Chrome or Edge is required for direct installation.</p>
                                </div>
                             )}
                          </div>
                       </div>
                    )}
                 </div>
              </Card>
           </div>

           <div className="lg:col-span-5 space-y-8 text-left">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] ml-1">App Benefits</h3>
              <div className="grid grid-cols-1 gap-4">
                 <BenefitRow icon={<Smartphone />} title="Native UI" desc="Optimized specifically for your screen size." />
                 <BenefitRow icon={<Zap />} title="Low Latency" desc="Offline caching for rapid navigation." />
                 <BenefitRow icon={<ShieldCheck />} title="Verified Hub" desc="Institutional security on every session." />
              </div>
           </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}

function IOSStep({ num, icon, text }: any) {
   return (
      <div className="flex items-center gap-6 group">
         <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-primary shadow-inner">
            {num}
         </div>
         <div className="flex items-center gap-3 text-slate-200">
            <span className="p-2 bg-white/10 rounded-lg text-primary">{icon}</span>
            <span className="text-sm md:text-lg font-bold uppercase tracking-tight">{text}</span>
         </div>
      </div>
   )
}

function BenefitRow({ icon, title, desc }: any) {
   return (
      <div className="p-6 md:p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center gap-6 group hover:bg-white hover:shadow-xl transition-all">
         <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform shrink-0">
            {icon}
         </div>
         <div className="text-left">
            <h4 className="font-black text-sm uppercase text-[#0F172A] tracking-tight">{title}</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{desc}</p>
         </div>
      </div>
   )
}
