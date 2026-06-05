
'use client';

import { motion } from "framer-motion";
import { Smartphone, CheckCircle2, Map as MapIcon, Globe, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Apple, Play } from "lucide-react";

/**
 * @fileOverview Final Geographic Registry Hub v6.0.
 * Re-engineered for absolute map visibility: 
 * - Removed all card containers and overlapping overlays.
 * - Maps are now raw, high-fidelity nodes on the section background.
 * - Labels moved below the content to ensure zero-clipping.
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

          <div className="space-y-16">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative">
                
                {/* Punjab Registry Node - ZERO OVERLAY */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group flex flex-col items-center gap-6"
                >
                   <div className="w-full aspect-[3/4] relative">
                      <img 
                        src={punjabMap} 
                        className="w-full h-full object-contain transition-all duration-[2s] group-hover:scale-105" 
                        referrerPolicy="no-referrer"
                        alt="Punjab Hub"
                      />
                   </div>
                   
                   <div className="flex items-center gap-4 px-8 py-3 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm transition-all group-hover:border-primary/20">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                         <MapIcon className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                         <p className="text-[10px] font-black uppercase text-[#0F172A] tracking-[0.2em] leading-none">Punjab Hub</p>
                         <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">State Registry Active</p>
                      </div>
                   </div>
                </motion.div>

                {/* National Registry Node - ZERO OVERLAY */}
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="group flex flex-col items-center gap-6 md:mt-12"
                >
                   <div className="w-full aspect-[3/4] relative">
                      <img 
                        src={indiaMap} 
                        className="w-full h-full object-contain transition-all duration-[2s] group-hover:scale-105" 
                        referrerPolicy="no-referrer"
                        alt="National Hub"
                      />
                   </div>
                   
                   <div className="flex items-center gap-4 px-8 py-3 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm transition-all group-hover:border-blue-200">
                      <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                         <Globe className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                         <p className="text-[10px] font-black uppercase text-[#0F172A] tracking-[0.2em] leading-none">National Hub</p>
                         <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Central Registry Active</p>
                      </div>
                   </div>
                </motion.div>
             </div>

             {/* Founder & Developer Credit Node */}
             <motion.div 
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               viewport={{ once: true }}
               className="flex items-center justify-center gap-4 bg-slate-50/50 py-8 rounded-[3rem] border border-slate-100/50"
             >
                <div className="h-12 w-12 rounded-2xl border-2 border-white bg-primary flex items-center justify-center text-white shadow-xl">
                   <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="text-left">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Architect & Authority</p>
                   <p className="text-base font-bold text-[#0F172A]">
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
