"use client"

import React, { useState, useEffect, useCallback } from "react"
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
  CheckCircle2,
  Info,
  MoreVertical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useRouter, usePathname } from "next/navigation"
import { useUser } from "@/firebase"
import Link from "next/link"
import { cn } from "@/lib/utils"

/**
 * @fileOverview High-Fidelity PWA Install Hub v4.0.
 * FIXED: Reliable standalone detection to prevent false positives for "Already Installed".
 * FIXED: Manual instructions fallback enabled for Android browsers.
 */

type DeviceType = "android" | "ios" | "desktop" | "unknown";

export default function InstallPage() {
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useUser();

  const isIos = device === "ios";

  const updateState = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Hardened check for standalone mode
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);
    
    // Check if the install prompt event is cached globally
    setIsInstallable(!!(window as any).deferredPrompt);
    
    console.log('[PWA_INSTALL_AUDIT] Status:', { isStandaloneMode, isInstallable: !!(window as any).deferredPrompt });
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    }
  }, [user, authLoading, router, pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = navigator.userAgent.toLowerCase();
    if (/android/.test(ua)) setDevice("android");
    else if (/iphone|ipad|ipod/.test(ua)) setDevice("ios");
    else setDevice("desktop");

    updateState();

    window.addEventListener('pwa-installable', updateState);
    window.addEventListener('appinstalled', updateState);
    
    return () => {
      window.removeEventListener('pwa-installable', updateState);
      window.removeEventListener('appinstalled', updateState);
    };
  }, [updateState]);

  const handleInstall = async () => {
    const prompt = (window as any).deferredPrompt;
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') (window as any).deferredPrompt = null;
    } else if (isIos) {
       toast({
         title: "iOS Instructions",
         description: "Tap Share > Add to Home Screen to install.",
       });
    } else {
       setShowManual(true);
       toast({
         title: "Setup Mode",
         description: "Automated prompt blocked. See manual steps below.",
       });
    }
  };

  if (authLoading || !user) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4">
       <Zap className="h-10 w-10 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase text-slate-300">Synchronizing Native Hub...</p>
    </div>
  );

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
           <div className="space-y-2">
              <h1 className="text-2xl md:text-7xl font-black text-[#0F172A] tracking-tighter leading-none">
                Native <span className="text-primary">Experience</span>
              </h1>
              <p className="text-[12px] md:text-2xl text-slate-500 font-medium leading-tight">
                 Install Cracklix on your home screen for zero distractions.
              </p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12 items-start">
           
           <div className="lg:col-span-7">
              <Card className="border-none shadow-5xl rounded-3xl bg-[#0B1528] text-white overflow-hidden p-6 md:p-14 space-y-6 md:space-y-10 relative">
                 <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12">
                    {isIos ? <Apple className="h-44 w-44 md:h-64 md:w-64" /> : <Smartphone className="h-44 w-44 md:h-64 md:w-64" />}
                 </div>
                 
                 <div className="relative z-10 space-y-6 text-left">
                    <div className="flex items-center gap-2">
                       <Badge className="bg-primary text-white border-none px-3 py-1 rounded-full font-black uppercase text-[8px] md:text-[10px] tracking-widest">
                          {device.toUpperCase()} MODE
                       </Badge>
                       {isStandalone && (
                         <Badge className="bg-emerald-500 text-white border-none px-3 py-1 rounded-full font-black uppercase text-[8px] md:text-[10px] tracking-widest">
                            INSTALLED
                         </Badge>
                       )}
                    </div>

                    <h2 className="text-xl md:text-5xl font-black tracking-tight">
                       {isIos ? 'Steps for iPhone' : isStandalone ? 'Ready to Prepare' : 'Install Cracklix'}
                    </h2>

                    {isIos ? (
                       <div className="space-y-4">
                          <InstructionStep num={1} icon={<Share className="h-3.5 w-3.5" />} text="Tap 'Share' in Safari toolbar" />
                          <InstructionStep num={2} icon={<PlusSquare className="h-3.5 w-3.5" />} text="Tap 'Add to Home Screen'" />
                          <InstructionStep num={3} icon={<Sparkles className="h-3.5 w-3.5" />} text="Launch from home screen" />
                       </div>
                    ) : isStandalone ? (
                       <div className="space-y-4">
                          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
                             <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                             <p className="text-emerald-50 [11px] md:text-sm font-medium">You are already using the native app. Go to your home screen to launch it anytime.</p>
                          </div>
                          <Button asChild className="w-full h-12 bg-white text-black hover:bg-slate-100 rounded-full font-black uppercase tracking-widest text-[9px] border-none shadow-xl transition-all">
                             <Link href="/dashboard">Back to Hub</Link>
                          </Button>
                       </div>
                    ) : (
                       <div className="space-y-6 text-left">
                          <p className="text-slate-400 text-sm md:text-lg font-medium leading-relaxed">
                             {device === "desktop" 
                               ? 'Install the desktop app for a cleaner interface and taskbar shortcuts.' 
                               : 'Get instant notifications and faster access directly on your phone.'}
                          </p>
                          <div className="space-y-3">
                             <Button 
                                onClick={handleInstall}
                                className="w-full h-14 md:h-20 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] rounded-full shadow-3xl transition-all active:scale-95 border-none gap-3"
                             >
                                <Download className="h-4 w-4 md:h-6 md:w-6" /> {isInstallable ? 'Install App Now' : 'Show Instructions'}
                             </Button>
                             {!isInstallable && !isIos && (
                                <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2">
                                   <Info className="h-3 w-3 text-primary shrink-0" />
                                   <p className="text-[9px] text-slate-300 font-bold uppercase tracking-tight">Manual install node active for Chrome & Browser.</p>
                                </div>
                             )}
                          </div>
                       </div>
                    )}
                 </div>
              </Card>

              {(showManual || (device === 'android' && !isStandalone && !isInstallable)) && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
                    <Card className="p-6 md:p-10 rounded-[2.5rem] bg-slate-50 border border-slate-200 space-y-6 text-left">
                       <h3 className="text-lg font-black uppercase text-[#0F172A] flex items-center gap-2">
                          <Smartphone className="h-5 w-5 text-primary" /> Manual Android Setup
                       </h3>
                       <div className="space-y-4">
                          <InstructionStep num={1} icon={<MoreVertical className="h-3.5 w-3.5" />} text="Tap the 3-dots menu in Chrome top-right" color="text-slate-500" />
                          <InstructionStep num={2} icon={<PlusSquare className="h-3.5 w-3.5" />} text="Select 'Install app' or 'Add to Home screen'" color="text-slate-500" />
                          <InstructionStep num={3} icon={<CheckCircle2 className="h-3.5 w-3.5" />} text="Confirm and open from your Home Screen" color="text-slate-500" />
                       </div>
                    </Card>
                 </motion.div>
              )}
           </div>

           <div className="lg:col-span-5 space-y-4 md:space-y-8 text-left">
              <h3 className="text-[9px] font-black uppercase text-slate-400 tracking-[0.4em] ml-1">App Benefits</h3>
              <div className="grid grid-cols-1 gap-3">
                 <BenefitRow icon={<Smartphone />} title="Native UI" desc="Optimized specifically for your screen." />
                 <BenefitRow icon={<Zap />} title="Low Latency" desc="Offline caching for rapid loading." />
                 <BenefitRow icon={<ShieldCheck />} title="Verified Hub" desc="Institutional security on every session." />
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
            <span className="text-[11px] md:text-lg font-bold tracking-tight text-current">{text}</span>
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
