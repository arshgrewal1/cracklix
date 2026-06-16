'use client';

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Smartphone, CheckCircle2, ShieldCheck, Download, Apple, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from "@/lib/utils";
import Image from "next/image";

/**
 * @fileOverview High-Fidelity Balanced Mobile App Hub v19.0.
 * FIXED: Explicit Image import restored to resolve TypeError.
 */

export default function AppPreview() {
  const db = useFirestore();
  const phoneMockup = "/logo/hero-student.png"; 

  const { data: settings } = useDoc<any>(useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]));

  const playStoreLink = settings?.playStoreUrl || "#";
  const appStoreLink = settings?.appStoreUrl || "#";

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden border-t border-slate-50">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 md:space-y-10 text-left order-2 lg:order-1 max-w-xl"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <Smartphone className="h-5 w-5" />
                 </div>
                 <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-slate-500">Official Mobile Node</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-headline font-black text-[#0F172A] leading-tight md:leading-[0.95] tracking-tight uppercase">
                Study Anywhere. <br />
                <span className="text-primary">Anytime.</span>
              </h2>
              <p className="text-base md:text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
                Experience Punjab's smartest mock test platform as a native application on your smartphone.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <BenefitItem text="500+ Mock Tests" />
               <BenefitItem text="Daily Study Notes" />
               <BenefitItem text="Bilingual Updates" />
               <BenefitItem text="Real-time Alerts" />
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
               <a href={playStoreLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                 <Button className="w-full h-14 md:h-16 px-10 bg-[#0F172A] hover:bg-black text-white rounded-2xl shadow-xl gap-4 font-black uppercase text-[11px] tracking-widest border-none transition-all active:scale-95">
                    <Play className="h-5 w-5 text-primary fill-current" /> Download Android
                 </Button>
               </a>
               <a href={appStoreLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto opacity-50 cursor-not-allowed">
                 <Button variant="outline" className="w-full h-14 md:h-16 px-10 border-2 border-slate-100 bg-white text-slate-400 rounded-2xl gap-4 font-black uppercase text-[11px] tracking-widest transition-all">
                    <Apple className="h-5 w-5" /> iOS Coming Soon
                 </Button>
               </a>
            </div>
          </motion.div>

          <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
             <div className="absolute -inset-20 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
             
             <motion.div 
               initial={{ opacity: 0, y: 50 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="relative w-full max-w-[320px] md:max-w-[400px] h-[500px] md:h-[600px] z-10"
             >
                {/* DEVICE MOCKUP FRAME */}
                <div className="h-full w-full bg-[#0F172A] rounded-[3.5rem] p-3 shadow-5xl border-[8px] border-[#1E293B] ring-1 ring-white/10 overflow-hidden">
                   <div className="w-full h-full rounded-[2.5rem] overflow-hidden bg-white relative">
                      <Image 
                        src={phoneMockup} 
                        alt="App Screenshot" 
                        fill
                        className="object-contain p-8 md:p-12"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/5 to-transparent pointer-events-none" />
                   </div>
                </div>
             </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-[#0F172A] font-bold uppercase text-[10px] md:text-xs tracking-tight">
       <div className="h-6 w-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
       </div>
       {text}
    </div>
  );
}
