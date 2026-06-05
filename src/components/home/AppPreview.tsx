
'use client';

import { motion } from "framer-motion";
import { Smartphone, CheckCircle2, Map as MapIcon, Globe, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Apple, Play } from "lucide-react";

/**
 * @fileOverview Final App Preview Hub v5.0.
 * Re-engineered for maximum map visibility (zero-clip) and clean white containers.
 * Added: Founder & Developer Credit: Arsh Grewal.
 */

export default function AppPreview() {
  const punjabMap = "https://www.mapsofindia.com/maps/punjab/punjab-map.jpg";
  const indiaMap = "https://www.mapsofindia.com/images2/india-map.jpg";

  return (
    <section className="py-32 bg-white overflow-hidden border-t border-slate-50">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8 text-left"
          >
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
               <Smartphone className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-5xl lg:text-7xl font-headline font-black text-[#0F172A] leading-[0.95] tracking-tight uppercase">
              CRACKLIX IN <br/>
              <span className="text-primary">YOUR POCKET</span>
            </h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
              Download the official mobile node to access high-fidelity mocks and AI rationalizations anywhere in Punjab.
            </p>

            <ul className="space-y-5 pt-4">
               <FeatureItem text="Bilingual CBT Interface (PA/EN)" />
               <FeatureItem text="AI-Powered Audit Rationalizations" />
               <FeatureItem text="All Punjab State Ranking Index" />
            </ul>

            <div className="flex flex-wrap gap-4 pt-8">
              <Button className="h-16 px-8 bg-[#0F172A] hover:bg-black text-white rounded-2xl flex items-center gap-4 shadow-xl transition-all active:scale-95">
                <Apple className="h-8 w-8" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold opacity-50 leading-none">Download on</p>
                  <p className="text-xl font-bold mt-1 leading-none">App Store</p>
                </div>
              </Button>
              <Button className="h-16 px-8 bg-[#0F172A] hover:bg-black text-white rounded-2xl flex items-center gap-4 shadow-xl transition-all active:scale-95">
                <Play className="h-8 w-8" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold opacity-50 leading-none">Get it on</p>
                  <p className="text-xl font-bold mt-1 leading-none">Google Play</p>
                </div>
              </Button>
            </div>
          </motion.div>

          <div className="space-y-12">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                <div className="absolute -inset-10 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                
                {/* Punjab Coverage Node - CLEAN WHITE CONTAINER */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group relative rounded-[3rem] bg-white border border-slate-100 shadow-2xl overflow-hidden aspect-[3/4] hover:-translate-y-2 transition-all duration-500 flex flex-col items-center justify-center p-6"
                >
                   <div className="w-full h-full relative">
                      <img 
                        src={punjabMap} 
                        className="w-full h-full object-contain transition-all duration-[2s] group-hover:scale-110" 
                        referrerPolicy="no-referrer"
                        alt="Punjab Hub"
                      />
                   </div>
                   
                   <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between bg-[#0B1528] border border-white/10 p-4 rounded-2xl shadow-4xl z-20 transition-all group-hover:scale-105">
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                            <MapIcon className="h-4 w-4 text-primary" />
                         </div>
                         <span className="text-[11px] font-black uppercase text-white tracking-[0.2em]">Punjab Hub</span>
                      </div>
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                   </div>
                </motion.div>

                {/* National Coverage Node - CLEAN WHITE CONTAINER */}
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="group relative rounded-[3rem] bg-white border border-slate-100 shadow-2xl overflow-hidden aspect-[3/4] md:mt-12 hover:-translate-y-2 transition-all duration-500 flex flex-col items-center justify-center p-6"
                >
                   <div className="w-full h-full relative">
                      <img 
                        src={indiaMap} 
                        className="w-full h-full object-contain transition-all duration-[2s] group-hover:scale-110" 
                        referrerPolicy="no-referrer"
                        alt="National Hub"
                      />
                   </div>
                   
                   <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between bg-[#0B1528] border border-white/10 p-4 rounded-2xl shadow-4xl z-20 transition-all group-hover:scale-105">
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Globe className="h-4 w-4 text-blue-400" />
                         </div>
                         <span className="text-[11px] font-black uppercase text-white tracking-[0.2em]">National Hub</span>
                      </div>
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                   </div>
                </motion.div>
             </div>

             {/* Founder & Developer Credit Node */}
             <motion.div 
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               viewport={{ once: true }}
               className="flex items-center justify-center gap-4 bg-slate-50 py-6 rounded-[2rem] border border-slate-100"
             >
                <div className="flex -space-x-2">
                   <div className="h-10 w-10 rounded-full border-2 border-white bg-primary flex items-center justify-center text-white shadow-lg relative z-10">
                      <ShieldCheck className="h-5 w-5" />
                   </div>
                </div>
                <div className="text-left">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Architect & Authority</p>
                   <p className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                      Founder & Developer: <span className="text-primary font-black uppercase tracking-tighter ml-1">Arsh Grewal</span>
                   </p>
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
    <li className="flex items-center gap-4 text-[#0F172A] font-bold uppercase text-xs tracking-tight">
       <div className="h-6 w-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
       </div>
       {text}
    </li>
  );
}
