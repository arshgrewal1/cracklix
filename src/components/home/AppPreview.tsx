'use client';

import { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Smartphone, CheckCircle2, Map as MapIcon, Globe, ShieldCheck, Download, Zap, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Apple, Play } from "lucide-react";
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";

/**
 * @fileOverview Final Regional Hub Section v10.0 (Hardened Install).
 * UPDATED: Enhanced PWA trigger with robust event check.
 */

export default function AppPreview() {
  const db = useFirestore();
  const { toast } = useToast();
  const [canInstall, setCanInstall] = useState(false);
  const punjabMap = "https://www.mapsofindia.com/maps/punjab/punjab-map.jpg";
  const indiaMap = "https://www.mapsofindia.com/images2/india-map.jpg";

  const { data: settings } = useDoc<any>(useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const updateInstallable = () => {
      if ((window as any).deferredPrompt) {
        setCanInstall(true);
      }
    };

    updateInstallable();
    window.addEventListener('pwa-installable', updateInstallable);
    window.addEventListener('beforeinstallprompt', updateInstallable);
    
    return () => {
      window.removeEventListener('pwa-installable', updateInstallable);
      window.removeEventListener('beforeinstallprompt', updateInstallable);
    };
  }, []);

  const handleInstallClick = async () => {
    if (typeof window === 'undefined') return;
    
    const prompt = (window as any).deferredPrompt;
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        (window as any).deferredPrompt = null;
        setCanInstall(false);
        toast({ title: "Installation Started", description: "Cracklix is being added to your home screen." });
      }
    } else {
      toast({ 
        title: "Installation Guide", 
        description: "Tap the 'Share' button in your browser and select 'Add to Home Screen' for faster access.",
      });
    }
  };

  const playStoreLink = settings?.playStoreUrl || "#";
  const appStoreLink = settings?.appStoreUrl || "#";

  return (
    <section className="py-20 md:py-32 bg-white overflow-hidden border-t border-slate-50">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 md:space-y-8 text-left"
          >
            <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
               <Smartphone className="h-6 w-6 md:h-7 md:w-7 text-primary" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-headline font-black text-[#0F172A] leading-tight md:leading-[0.95] tracking-tight uppercase">
              STUDY ON THE <br className="hidden sm:block" />
              <span className="text-primary">MOBILE APP</span>
            </h2>
            <p className="text-base md:text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
              Install the official Cracklix app on your phone to get instant notifications and access tests offline.
            </p>

            <ul className="space-y-3 md:space-y-5 pt-2">
               <FeatureItem text="Direct Home Screen Access" />
               <FeatureItem text="Bilingual Tests (English & Punjabi)" />
               <FeatureItem text="Instant Admit Card & Result Alerts" />
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 md:pt-8">
              <Button 
                onClick={handleInstallClick}
                className="w-full sm:w-auto h-16 md:h-20 px-10 bg-[#0F172A] hover:bg-black text-white rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center gap-4 shadow-3xl transition-all active:scale-95 border-none"
              >
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary flex items-center justify-center shadow-xl">
                   {canInstall ? <Download className="h-5 w-5 md:h-6 md:w-6 text-white" /> : <Zap className="h-5 w-5 md:h-6 md:w-6 text-white" />}
                </div>
                <div className="text-left">
                  <p className="text-[10px] md:text-[11px] uppercase font-black tracking-widest text-primary leading-none">
                    {canInstall ? "AVAILABLE NOW" : "PWA ENABLED"}
                  </p>
                  <p className="text-lg md:text-xl font-black uppercase text-white mt-1 leading-none tracking-tight">INSTALL APP</p>
                </div>
              </Button>
              
              <div className="flex gap-4">
                 <a href={appStoreLink} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none">
                   <Button variant="outline" size="icon" className="h-16 w-16 md:h-20 md:w-20 rounded-2xl border-slate-100 bg-slate-50 hover:bg-white shadow-lg"><Apple className="h-6 w-6 md:h-8 md:w-8" /></Button>
                 </a>
                 <a href={playStoreLink} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none">
                   <Button variant="outline" size="icon" className="h-16 w-16 md:h-20 md:w-20 rounded-2xl border-slate-100 bg-slate-50 hover:bg-white shadow-lg"><Play className="h-6 w-6 md:h-8 md:w-8" /></Button>
                 </a>
              </div>
            </div>
          </motion.div>

          <div className="space-y-12 md:space-y-16 mt-12 lg:mt-0">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 relative">
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group flex flex-col items-center gap-4 md:gap-6"
                >
                   <div className="w-full h-auto min-h-[250px] md:min-h-[350px] relative rounded-3xl group-hover:scale-105 transition-transform duration-700 flex items-center justify-center">
                      <img src={punjabMap} className="w-full h-full object-contain" referrerPolicy="no-referrer" alt="Punjab Hub" />
                   </div>
                   <div className="flex items-center gap-4 px-6 md:px-8 py-3 bg-white border border-slate-100 rounded-2xl shadow-xl transition-all hover:border-primary/20 w-full sm:w-auto">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><MapIcon className="h-4 w-4" /></div>
                      <div className="text-left">
                         <p className="text-[10px] font-black uppercase text-[#0F172A] tracking-[0.2em] leading-none">Punjab Hub</p>
                         <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">State Exams Covered</p>
                      </div>
                   </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="group flex flex-col items-center gap-4 md:gap-6 sm:mt-12"
                >
                   <div className="w-full h-auto min-h-[250px] md:min-h-[350px] relative rounded-3xl group-hover:scale-105 transition-transform duration-700 flex items-center justify-center">
                      <img src={indiaMap} className="w-full h-full object-contain" referrerPolicy="no-referrer" alt="National Hub" />
                   </div>
                   <div className="flex items-center gap-4 px-6 md:px-8 py-3 bg-white border border-slate-100 rounded-2xl shadow-xl transition-all hover:border-blue-200 w-full sm:w-auto">
                      <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500"><Globe className="h-4 w-4" /></div>
                      <div className="text-left">
                         <p className="text-[10px] font-black uppercase text-[#0F172A] tracking-[0.2em] leading-none">National Hub</p>
                         <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Central Exams Covered</p>
                      </div>
                   </div>
                </motion.div>
             </div>
             <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex items-center justify-center gap-4 bg-slate-50/50 py-6 md:py-8 rounded-[2rem] md:rounded-[3rem] border border-slate-100/50">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl border-2 border-white bg-primary flex items-center justify-center text-white shadow-xl"><ShieldCheck className="h-5 w-5 md:h-6 md:w-6" /></div>
                <div className="text-left">
                   <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 md:mb-1.5">Platform Founder</p>
                   <p className="text-sm md:text-base font-bold text-[#0F172A]">Developed by <span className="text-primary font-black uppercase tracking-tighter ml-1 transition-colors">Arsh Grewal</span></p>
                </div>
             </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 md:gap-4 text-[#0F172A] font-bold uppercase text-[10px] md:text-xs tracking-tight">
       <div className="h-5 w-5 md:h-6 md:w-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
          <CheckCircle2 className="h-3 w-3 md:h-3.5 md:w-3.5 text-emerald-500" />
       </div>
       {text}
    </li>
  );
}
