
'use client';

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, ShieldCheck, Download, Target, Sparkles, Activity, Users, LayoutGrid, ArrowRight, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDoc, useFirestore, useUser } from "@/firebase";
import { doc } from "firebase/firestore";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import Image from "next/image";

/**
 * @fileOverview Premium UI/UX Hero Hub v151.0 (Dependency Fixed).
 * STYLE: Dark Navy & Vibrant Orange Brand Identity.
 * FEATURES: Futuristic dashboard, real-time tickers, and bilingual impact banners.
 */

export default function Hero() {
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [liveCount, setLiveCount] = useState(124);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setLiveCount(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  const studentImg = PlaceHolderImages.find(img => img.id === 'hero-students');

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats } = useDoc<any>(statsRef);

  const handleActionClick = (path: string) => {
    if (!user) {
      router.push(`/login?returnUrl=${encodeURIComponent(path)}`);
      return;
    }
    router.push(path);
  };

  if (!mounted) return null;

  return (
    <section className="relative pt-6 pb-20 md:pt-16 md:pb-40 bg-[#0B1528] overflow-hidden text-white">
      
      {/* 1. FUTURISTIC BACKGROUND LAYERS */}
      <div className="absolute inset-0 z-0">
         <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/punjab-secretariat/1920/1080')] bg-cover bg-center opacity-10 blur-sm scale-105" />
         <div className="absolute inset-0 bg-gradient-to-br from-[#0B1528] via-[#0B1528]/95 to-[#0B1528]/80" />
         <div className="absolute top-0 right-0 w-[60%] h-full bg-[#F97316]/5 blur-[160px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-7xl">
        
        {/* 2. BILINGUAL CENTER HEADLINE */}
        <motion.div 
           initial={{ y: -40, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
           className="text-center mb-16 md:mb-24"
        >
           <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl px-6 py-2 rounded-full border border-white/10 mb-8">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-primary">PUNJAB'S NO.1 STUDY HUB</span>
           </div>
           
           <h2 className="text-4xl sm:text-5xl md:text-8xl font-black text-white leading-[0.95] tracking-tighter uppercase mb-6 drop-shadow-2xl">
              ਤਿਆਰੀ ਪੰਜਾਬ ਦੀ, <br />
              <span className="text-primary italic">ਸੁਪਨਾ ਸਰਕਾਰੀ ਅਫ਼ਸਰ ਦਾ!</span>
           </h2>
           <p className="text-lg md:text-2xl font-black text-slate-400 uppercase tracking-[0.2em] leading-none">
              Prepare for Punjab, Dream of a Govt. Officer!
           </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 items-center">
          
          {/* 3. LEFT MARKETING NODE */}
          <div className="lg:col-span-5 space-y-10 text-left">
            <div className="space-y-6">
               <h1 className="text-4xl md:text-6xl font-headline font-black leading-[0.95] text-white uppercase tracking-tighter">
                  CRACK PPSC, <br />
                  PUNJAB POLICE, <br />
                  <span className="text-primary">PATWARI & MORE</span>
               </h1>
               <p className="text-base md:text-xl text-slate-400 font-medium leading-relaxed max-w-lg">
                  Access institutional grade mock tests with real-time state rankings and AI-powered logic rationalizations.
               </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
               <Button 
                 onClick={() => handleActionClick('/mocks')}
                 className="w-full sm:w-auto h-16 md:h-20 px-10 md:px-12 bg-primary hover:bg-orange-600 text-white rounded-2xl font-black uppercase tracking-[0.1em] text-[11px] md:text-xs shadow-3xl shadow-primary/20 transition-all active:scale-95 border-none group"
               >
                  START FREE DEMO <Zap className="ml-3 h-4 w-4 fill-current group-hover:scale-125 transition-transform" />
               </Button>
               <Button 
                 onClick={() => handleActionClick('/pass')}
                 className="w-full sm:w-auto h-16 md:h-20 px-10 md:px-12 bg-white text-[#0B1528] hover:bg-slate-100 rounded-2xl font-black uppercase tracking-[0.1em] text-[11px] md:text-xs shadow-xl transition-all active:scale-95 border-none"
               >
                  ENROLL NOW
               </Button>
            </div>

            {/* DASHBOARD TICKER */}
            <div className="pt-10">
               <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 inline-flex items-center gap-6 shadow-2xl backdrop-blur-xl group hover:border-primary/30 transition-all">
                  <div className="relative">
                     <Users className="h-6 w-6 text-primary" />
                     <div className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-emerald-500 rounded-full animate-ping" />
                  </div>
                  <div className="text-left">
                     <p className="text-lg font-black text-white tabular-nums leading-none tracking-tight">LIVE: {liveCount} Students</p>
                     <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Mock Testing in Progress</p>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div className="flex items-center gap-2">
                     <div className="h-2 w-2 rounded-full bg-emerald-500" />
                     <span className="text-[10px] font-black text-emerald-500 uppercase">Secure Hub</span>
                  </div>
               </div>
            </div>
          </div>

          {/* 4. RIGHT VISUAL NODE (ELITE STUDENTS) */}
          <div className="lg:col-span-7 relative">
            <div className="relative aspect-[4/3] w-full max-w-[700px] ml-auto">
               
               {/* Dashboard Panels */}
               <motion.div 
                 initial={{ x: 30, opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 transition={{ delay: 0.5 }}
                 className="absolute -left-10 top-20 z-20 hidden md:block"
               >
                  <Card className="bg-[#0F172A]/90 backdrop-blur-2xl border-white/10 p-5 rounded-2xl shadow-5xl w-48 space-y-4">
                     <div className="flex items-center justify-between">
                        <Badge className="bg-primary text-white border-none text-[8px] font-black">ACCURACY</Badge>
                        <TrendingUpIcon className="h-3 w-3 text-emerald-400" />
                     </div>
                     <p className="text-3xl font-black text-white leading-none">94%</p>
                     <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: "94%" }} className="h-full bg-primary" />
                     </div>
                  </Card>
               </motion.div>

               <motion.div 
                 initial={{ y: 30, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.7 }}
                 className="absolute -right-6 bottom-20 z-20 hidden md:block"
               >
                  <Card className="bg-primary border-none p-5 rounded-2xl shadow-5xl w-52 space-y-3 text-white">
                     <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase">Live Updates</span>
                     </div>
                     <div className="space-y-2">
                        <div className="h-1.5 w-full bg-white/20 rounded-full" />
                        <div className="h-1.5 w-3/4 bg-white/20 rounded-full" />
                     </div>
                  </Card>
               </motion.div>
               
               {/* Main Student Image */}
               <div className="relative h-full w-full rounded-[3rem] md:rounded-[5rem] overflow-hidden border-[8px] md:border-[12px] border-white/5 shadow-6xl group">
                  {studentImg && (
                    <Image 
                      src={studentImg.imageUrl} 
                      alt="Cracklix Elite Students" 
                      fill
                      priority
                      className="object-cover transition-transform duration-[3s] group-hover:scale-105"
                      data-ai-hint={studentImg.imageHint}
                    />
                  )}
                  
                  {/* Glass Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528]/80 via-transparent to-transparent opacity-60" />
                  
                  {/* Floating Selection Badge */}
                  <div className="absolute top-10 right-10 flex flex-col items-center gap-2">
                     <div className="bg-white p-4 rounded-3xl shadow-4xl flex flex-col items-center text-[#0B1528]">
                        <p className="text-3xl font-black leading-none">10k+</p>
                        <p className="text-[8px] font-black uppercase tracking-widest mt-1">SELECTIONS</p>
                     </div>
                  </div>
               </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function TrendingUpIcon({ className }: { className?: string }) {
   return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
         <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
      </svg>
   )
}
