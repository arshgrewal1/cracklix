'use client';

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Smartphone, CheckCircle2, ShieldCheck, Apple, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

/**
 * @fileOverview High-Density Mobile App Hub v25.0.
 */

export default function AppPreview() {
  const db = useFirestore();
  const phoneMockup = "/images/hero-student.png"; 

  const { data: settings } = useDoc<any>(useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]));

  const appStoreLink = settings?.appStoreUrl || "#";

  return (
    <section className="py-8 md:py-24 bg-white overflow-hidden border-t border-slate-50">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-20 items-center text-left">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4 md:space-y-10 order-2 lg:order-1 max-w-xl"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                 <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Smartphone className="h-4 w-4" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">PWA HUB</span>
              </div>
              <h2 className="text-2xl md:text-7xl font-headline font-black text-[#0F172A] leading-tight md:leading-[0.95] tracking-tight uppercase">
                Study Anywhere. <br />
                <span className="text-primary">Anytime.</span>
              </h2>
              <p className="text-[12px] md:text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
                Experience Punjab's smartest mock test platform as a native application on your smartphone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <BenefitItem text="500+ Mocks" />
               <BenefitItem text="Study Notes" />
               <BenefitItem text="Bilingual" />
               <BenefitItem text="Live Alerts" />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
               <Button asChild className="flex-1 sm:flex-none h-12 md:h-16 px-8 bg-[#0F172A] hover:bg-black text-white rounded-xl md:rounded-2xl shadow-xl gap-3 font-black uppercase text-[9px] md:text-[11px] tracking-widest border-none transition-all active:scale-95">
                  <Link href="/install">
                    <Play className="h-4 w-4 text-primary fill-current" /> Download Android
                  </Link>
               </Button>
               <Button disabled variant="outline" className="flex-1 sm:flex-none h-12 md:h-16 px-8 border-2 border-slate-100 bg-white text-slate-300 rounded-xl md:rounded-2xl gap-3 font-black uppercase text-[9px] md:text-[11px] tracking-widest transition-all">
                  <Apple className="h-4 w-4" /> iOS HUB
               </Button>
            </div>
          </motion.div>

          <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
             <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="relative w-full max-w-[200px] md:max-w-[400px] h-[300px] md:h-[600px] z-10"
             >
                <div className="h-full w-full bg-[#0F172A] rounded-[2.5rem] md:rounded-[3.5rem] p-2 md:p-3 shadow-5xl border-[6px] md:border-[8px] border-[#1E293B] overflow-hidden">
                   <div className="w-full h-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-white relative">
                      <Image 
                        src={phoneMockup} 
                        alt="App Screenshot" 
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-contain p-6 md:p-12"
                      />
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
    <div className="flex items-center gap-2 text-[#0F172A] font-bold uppercase text-[9px] md:text-xs tracking-tight">
       <div className="h-5 w-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
       </div>
       {text}
    </div>
  );
}