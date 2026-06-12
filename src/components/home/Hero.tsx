
'use client';

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, ShieldCheck, Download, Target, Sparkles, Activity as ActivityIcon, Users, LayoutGrid, ArrowRight, Play, Clock, MessageSquare, Trophy } from "lucide-react";
import { useDoc, useFirestore, useUser } from "@/firebase";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";

/**
 * @fileOverview High-Fidelity Hero Hub v160.0.
 * REPLACED: Static image with Interactive Live Dashboard Mockup.
 * FEATURES: Live Countdown, Activity Feed, Video Simulation, PWA Install Trigger.
 */

interface Activity {
  id: number;
  initials: string;
  name: string;
  action: string;
  status: string;
  isRank?: boolean;
}

export default function Hero() {
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  
  // Live Timer Countdown State
  const [timeLeft, setTimeLeft] = useState('04m : 18s');

  // Simulated Live Activity Feed Data
  const [activities, setActivities] = useState<Activity[]>([
    { id: 1, initials: 'AM', name: 'Amanpreet M.', action: 'just cleared Mock Test #4', status: 'Rank #2', isRank: true },
    { id: 2, initials: 'KS', name: 'Kuldeep Singh', action: 'unlocked Police Batch', status: '10s ago' },
  ]);

  useEffect(() => {
    setMounted(true);
    
    // PWA Install Detection
    if (typeof window !== 'undefined' && (window as any).deferredPrompt) {
       setCanInstall(true);
    }
    const handleInstallable = () => setCanInstall(true);
    window.addEventListener('pwa-installable', handleInstallable);

    // Simulated real-time countdown logic
    const timer = setInterval(() => {
      const mins = Math.floor(Math.random() * 5) + 1;
      const secs = Math.floor(Math.random() * 60);
      setTimeLeft(`${mins.toString().padStart(2, '0')}m : ${secs.toString().padStart(2, '0')}s`);
    }, 5000);

    return () => {
       window.removeEventListener('pwa-installable', handleInstallable);
       clearInterval(timer);
    };
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
    <section className="relative pt-12 pb-24 md:pt-24 md:pb-48 bg-[#0B1528] overflow-hidden text-white flex items-center min-h-[90vh]">
      
      {/* 1. FUTURISTIC BACKGROUND LAYERS */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#F97316]/5 rounded-full blur-[160px] pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      </div>

      <div className="container mx-auto px-4 md:px-16 relative z-10 max-w-[1400px]">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-24 items-center">
          
          {/* 2. LEFT COLUMN: Main Typography & CTA */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-xl px-5 py-2 rounded-full text-[11px] font-black tracking-[0.3em] text-primary shadow-2xl">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              PUNJAB&apos;S NO.1 STUDY HUB
            </div>

            {/* Main Headline (Punjab Identity) */}
            <div className="space-y-2">
               <h1 className="text-4xl md:text-7xl lg:text-8xl font-black leading-[0.85] tracking-tighter uppercase drop-shadow-4xl">
                 ਤਿਆਰੀ ਪੰਜਾਬ ਦੀ, <br />
                 <span className="text-primary">ਸੁਪਨਾ ਸਰਕਾਰੀ ਅਫ਼ਸਰ ਦਾ!</span>
               </h1>
               <p className="text-sm md:text-xl font-black text-slate-500 uppercase tracking-[0.3em] leading-none opacity-80 mt-4">
                  Prepare for Punjab, Dream of a Govt. Officer!
               </p>
            </div>
            
            <p className="text-base md:text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
               Crack <span className="text-white font-bold">PSSSB, POLICE, PSPCL, PSTET, CTET, ETT & MASTER CADRE</span> with India&apos;s most accurate mock tests and regional rankings.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <Button 
                onClick={() => handleActionClick('/mocks')}
                className="bg-primary hover:bg-orange-600 transition-all font-black px-10 h-16 md:h-20 rounded-2xl text-white flex items-center justify-center gap-3 group shadow-3xl shadow-primary/20 uppercase text-[11px] tracking-[0.2em] border-none active:scale-95"
              >
                START FREE DEMO 
                <Zap className="w-5 h-5 fill-current group-hover:scale-125 transition-transform" />
              </Button>
              <Button 
                onClick={() => handleActionClick('/pass')}
                className="border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 text-white font-black px-10 h-16 md:h-20 rounded-2xl transition-all uppercase text-[11px] tracking-[0.2em] active:scale-95 shadow-xl"
              >
                ENROLL IN ELITE HUB
              </Button>
            </div>

            {/* Mobile PWA Install Trigger */}
            {canInstall && (
               <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-700">
                  <Button 
                    onClick={handleInstallClick}
                    className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase text-[9px] tracking-widest gap-2 shadow-2xl transition-all active:scale-95"
                  >
                     <Download className="h-4 w-4" /> Install Mobile App
                     <Badge className="bg-emerald-400 text-emerald-950 border-none ml-2 animate-pulse">NEW</Badge>
                  </Button>
               </div>
            )}

            {/* Metrics & Counter Widgets */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-10 border-t border-white/5">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 shadow-inner group hover:bg-white/10 transition-all">
                <div className="text-3xl font-black text-primary font-headline">10,000+</div>
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total Selections</div>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 shadow-inner group hover:bg-white/10 transition-all">
                <div className="text-3xl font-black text-emerald-400 flex items-center gap-1.5 justify-center lg:justify-start font-headline">
                  5.2k+ <span className="text-[8px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md animate-pulse font-black uppercase tracking-tighter">Live</span>
                </div>
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Students Testing</div>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 shadow-inner group hover:bg-white/10 transition-all col-span-2 sm:col-span-1">
                <div className="text-3xl font-black text-blue-400 font-headline">150+</div>
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Daily Updated Mocks</div>
              </div>
            </div>

          </div>

          {/* 3. RIGHT COLUMN: Interactive Live Dashboard Mockup */}
          <div className="lg:col-span-5 relative w-full max-w-md mx-auto lg:max-w-none animate-in zoom-in-95 duration-1000">
            <Card className="w-full bg-[#0F172A]/90 border-white/10 rounded-[3rem] p-6 shadow-6xl backdrop-blur-2xl relative overflow-hidden group">
              
              {/* Decorative Header */}
              <div className="flex justify-between items-center pb-5 border-b border-white/5 mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </div>
                <Badge className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 text-[8px] font-black uppercase tracking-widest">
                  LIVE STREAMING
                </Badge>
              </div>

              {/* Simulated Live Video Player Screen */}
              <div className="relative bg-black/40 rounded-3xl overflow-hidden aspect-video flex items-center justify-center border border-white/5 group/player">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                <div className="absolute inset-0 bg-[radial-gradient(#F97316_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
                
                {/* Branding Mockup in Player */}
                <div className="absolute bottom-6 left-6 z-20 space-y-2 text-left">
                  <Badge className="bg-rose-600 text-white border-none font-black text-[8px] uppercase px-2 py-0.5 tracking-tighter">PUNJAB REASONING</Badge>
                  <h4 className="text-sm md:text-lg font-black uppercase text-white leading-tight">Mastering Syllogism - Day 4</h4>
                </div>
                
                {/* Play Button Overlay */}
                <div className="h-16 w-16 bg-primary text-white rounded-full flex items-center justify-center z-20 shadow-4xl shadow-primary/40 cursor-pointer hover:scale-110 transition-transform active:scale-95">
                  <Play className="w-7 h-7 fill-current ml-1" />
                </div>

                {/* Live Count in Player */}
                <div className="absolute top-4 right-4 z-20">
                   <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full backdrop-blur-md">
                      <div className="h-1.5 w-1.5 bg-rose-500 rounded-full animate-pulse" />
                      <span className="text-[9px] font-black text-white">842 WATCHING</span>
                   </div>
                </div>
              </div>

              {/* Live Activity Feed List */}
              <div className="mt-8 space-y-3.5 text-left">
                <div className="flex items-center justify-between">
                   <p className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase">Live Activity Hub</p>
                   <RefreshCw className="h-3 w-3 text-slate-700 animate-spin-slow" />
                </div>
                
                {activities.map((act) => (
                  <div key={act.id} className="flex items-center justify-between p-3.5 bg-black/20 border border-white/5 rounded-2xl text-[11px] group/item hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center font-black text-[9px] shadow-lg",
                        act.isRank ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                      )}>
                        {act.initials}
                      </div>
                      <div className="min-w-0">
                        <span className="font-black text-slate-200 uppercase truncate">{act.name} </span> 
                        <span className="text-slate-500 font-bold lowercase">{act.action}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn(
                       "border-none text-[8px] font-black uppercase px-2",
                       act.isRank ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-600'
                    )}>
                       {act.status}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Live Countdown Timer Feature */}
              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Clock className="h-3.5 w-3.5 text-slate-500" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Quiz Starts:</span>
                </div>
                <div className="font-mono font-bold text-primary bg-primary/10 px-4 py-1.5 rounded-xl border border-primary/20 animate-pulse text-[14px] shadow-inner tabular-nums">
                  {timeLeft}
                </div>
              </div>

            </Card>
            
            {/* Subtle Decorative Background Frame */}
            <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-dashed border-white/5 rounded-[4rem] pointer-events-none -z-10 group-hover:border-primary/20 transition-all duration-1000" />
          </div>

        </div>
      </div>
    </section>
  );
}

