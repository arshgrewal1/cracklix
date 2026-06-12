
'use client';

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  ShieldCheck, 
  Download, 
  Trophy, 
  Sparkles, 
  RefreshCw,
  Star,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { useFirestore, useUser } from "@/firebase";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface ActivityItem {
  id: number;
  initials: string;
  name: string;
  action: string;
  status: string;
  isRank?: boolean;
}

/**
 * @fileOverview Institutional Hero Hub v180.0.
 * Redesigned for elite "Teaching Website" aesthetic with massive responsive typography.
 * UPDATED: Fixed scaling to prevent overflow while maintaining high impact.
 */
export default function Hero() {
  const router = useRouter();
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  
  const [activities] = useState<ActivityItem[]>([
    { id: 1, initials: 'AM', name: 'Amanpreet M.', action: 'cleared Mock Test #12', status: 'Rank #2', isRank: true },
    { id: 2, initials: 'KS', name: 'Kuldeep Singh', action: 'joined Police Batch', status: 'Active' },
  ]);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && (window as any).deferredPrompt) {
       setCanInstall(true);
    }
    const handleInstallable = () => setCanInstall(true);
    window.addEventListener('pwa-installable', handleInstallable);
    return () => window.removeEventListener('pwa-installable', handleInstallable);
  }, []);

  const handleActionClick = (path: string) => {
    if (!user) {
      router.push(`/login?returnUrl=${encodeURIComponent(path)}`);
      return;
    }
    router.push(path);
  };

  const handleInstallClick = async () => {
    const prompt = (window as any).deferredPrompt;
    if (prompt) {
      prompt.prompt();
    }
  };

  if (!mounted) return null;

  return (
    <section className="relative pt-12 pb-24 md:pt-28 md:pb-48 bg-[#0B1528] overflow-hidden text-white flex items-center min-h-[85vh]">
      
      {/* 1. FUTURISTIC BACKGROUND NODES */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px] pointer-events-none" />
         <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 items-center">
          
          {/* 2. LEFT COLUMN: Institutional Typography */}
          <div className="lg:col-span-7 space-y-12 text-center lg:text-left">
            
            <motion.div 
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               className="inline-flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-xl px-5 py-2 rounded-full text-[10px] font-black tracking-[0.3em] text-primary shadow-2xl"
            >
              <Sparkles className="h-3 w-3 animate-pulse" />
              PUNJAB&apos;S NO.1 PREP HUB
            </motion.div>

            <div className="space-y-8">
               <h1 className="text-4xl md:text-[6rem] lg:text-[7rem] font-black leading-[0.85] tracking-tighter uppercase drop-shadow-4xl">
                 <span className="block text-white">ਤਿਆਰੀ ਪੰਜਾਬ ਦੀ,</span>
                 <span className="block text-primary">ਸੁਪਨਾ ਸਰਕਾਰੀ</span>
                 <span className="block text-primary">ਅਫ਼ਸਰ ਦਾ!</span>
               </h1>
               
               <div className="space-y-6 max-w-2xl mx-auto lg:mx-0">
                  <p className="text-sm md:text-2xl font-black text-white uppercase tracking-[0.1em] border-l-4 border-primary pl-5 leading-tight">
                     CRACK PSSSB, POLICE, PSPCL, PSTET, CTET, ETT & MASTER CADRE
                  </p>
                  <p className="text-base md:text-xl text-slate-400 font-medium leading-relaxed">
                     Get official pattern mock tests, verified answer keys, and real-time state rankings. Prepare with India&apos;s most accurate CBT engine.
                  </p>
               </div>
            </div>

            {/* ACTION CENTER */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                onClick={() => handleActionClick('/mocks')}
                className="bg-primary hover:bg-orange-600 transition-all font-black px-10 h-16 md:h-20 rounded-2xl text-white flex items-center justify-center gap-3 group shadow-3xl shadow-primary/20 uppercase text-[11px] tracking-[0.2em] border-none active:scale-95"
              >
                START FREE MOCK 
                <Zap className="w-5 h-5 fill-current group-hover:scale-125 transition-transform" />
              </Button>
              <Button 
                onClick={() => handleActionClick('/pass')}
                className="border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 text-white font-black px-10 h-16 md:h-20 rounded-2xl transition-all uppercase text-[11px] tracking-[0.2em] active:scale-95 shadow-xl"
              >
                ELITE ENROLLMENT
              </Button>
            </div>

            {canInstall && (
               <div className="flex justify-center lg:justify-start">
                  <Button 
                    onClick={handleInstallClick}
                    className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 shadow-2xl transition-all active:scale-95 border-none"
                  >
                     <Download className="h-4 w-4" /> INSTALL MOBILE APP
                  </Button>
               </div>
            )}
          </div>

          {/* 3. RIGHT COLUMN: Visual Trust Hub */}
          <div className="lg:col-span-5 relative w-full max-w-lg mx-auto lg:max-w-none">
             <div className="relative group">
                {/* Floating Trust Nodes */}
                <motion.div 
                   animate={{ y: [0, -10, 0] }} 
                   transition={{ duration: 4, repeat: Infinity }}
                   className="absolute -left-10 top-20 z-20 hidden xl:block"
                >
                   <div className="bg-[#0F172A]/90 backdrop-blur-2xl border border-white/10 p-5 rounded-2xl shadow-5xl flex items-center gap-5">
                      <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                         <Trophy className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">STATE RANK</p>
                         <p className="text-xl font-black text-white">TOP #04</p>
                      </div>
                   </div>
                </motion.div>

                <motion.div 
                   animate={{ y: [0, 10, 0] }} 
                   transition={{ duration: 5, repeat: Infinity }}
                   className="absolute -right-10 bottom-32 z-20 hidden xl:block"
                >
                   <div className="bg-[#0F172A]/90 backdrop-blur-2xl border border-white/10 p-5 rounded-2xl shadow-5xl flex items-center gap-5">
                      <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                         <ShieldCheck className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">CURRICULUM</p>
                         <p className="text-xl font-black text-white">VERIFIED</p>
                      </div>
                   </div>
                </motion.div>

                {/* Main Visual Image Hub */}
                <div className="relative aspect-[4/5] rounded-[3.5rem] overflow-hidden border border-white/10 shadow-6xl bg-[#0F172A] group-hover:border-primary/30 transition-all duration-700">
                   <Image 
                      src="https://picsum.photos/seed/punjab-study-hub/800/1000" 
                      alt="Academy Success" 
                      fill 
                      className="object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                      data-ai-hint="students study"
                      priority
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-transparent to-transparent opacity-90" />
                   
                   {/* Real-time Activity Feed Component */}
                   <div className="absolute bottom-8 left-8 right-8 space-y-4">
                      <div className="flex items-center justify-between">
                         <Badge className="bg-primary text-white border-none text-[9px] font-black uppercase px-4 py-1.5 rounded-lg shadow-xl">LIVE ACTIVITY</Badge>
                         <RefreshCw className="h-4 w-4 text-slate-600 animate-spin" />
                      </div>
                      <div className="space-y-3">
                         {activities.map(act => (
                            <div key={act.id} className="flex items-center justify-between p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 transition-all hover:bg-black/60">
                               <div className="flex items-center gap-4">
                                  <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center font-black text-[10px] shadow-lg", act.isRank ? "bg-primary text-white" : "bg-blue-500 text-white")}>
                                     {act.initials}
                                  </div>
                                  <div className="text-left">
                                     <p className="text-[11px] font-black text-white truncate max-w-[120px] uppercase">{act.name}</p>
                                     <p className="text-[9px] font-bold text-slate-400 uppercase truncate">{act.action}</p>
                                  </div>
                               </div>
                               <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">{act.status}</span>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
                
                {/* Visual Anchors */}
                <div className="absolute -inset-6 border border-white/5 rounded-[4.5rem] pointer-events-none -z-10 group-hover:border-primary/10 transition-all duration-1000" />
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}

