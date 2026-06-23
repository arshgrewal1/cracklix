'use client';

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { 
  Smartphone, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ChevronRight,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Official APK Download Hub v1.0.
 */
export default function InstallPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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
           <div className="space-y-2 text-center">
              <h1 className="text-3xl md:text-7xl font-black text-[#0F172A] tracking-tighter leading-none">
                Cracklix <span className="text-primary">Mobile</span>
              </h1>
              <p className="text-[12px] md:text-2xl text-slate-500 font-medium leading-tight">
                 Official Android App for Punjab Government Exams.
              </p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12 items-start">
           
           <div className="lg:col-span-7">
              <Card className="border-none shadow-5xl rounded-3xl bg-[#0B1528] text-white overflow-hidden p-6 md:p-14 space-y-6 md:space-y-10 relative">
                 <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12">
                    <Smartphone className="h-44 w-44 md:h-64 md:w-64" />
                 </div>
                 
                 <div className="relative z-10 space-y-6 text-left">
                    <div className="flex items-center gap-2">
                       <Badge className="bg-primary text-white border-none px-3 py-1 rounded-full font-black uppercase text-[8px] md:text-[10px] tracking-widest">
                          ANDROID APK
                       </Badge>
                    </div>

                    <h2 className="text-xl md:text-5xl font-black tracking-tight">
                       Get the App
                    </h2>

                    <div className="space-y-6 text-left">
                       <p className="text-slate-400 text-sm md:text-lg font-medium leading-relaxed">
                          Download and install the official Cracklix APK for low-latency mock tests and instant recruitment alerts.
                       </p>
                       <div className="space-y-4">
                          <Button asChild className="w-full h-14 md:h-20 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] md:text-[11px] tracking-widest rounded-full border-none shadow-3xl">
                             <Link href="https://github.com/arshgrewal1122/cracklix/releases/latest/download/cracklix-production.apk" className="flex items-center justify-center gap-3">
                                <Download className="h-5 w-5" /> Download APK Now
                             </Link>
                          </Button>
                          <p className="text-[9px] font-bold text-slate-500 text-center uppercase tracking-widest">Version 1.0.0 • Secured by Google Play Protect</p>
                       </div>
                    </div>
                 </div>
              </Card>
           </div>

           <div className="lg:col-span-5 space-y-4 md:space-y-8 text-left">
              <h3 className="text-[9px] font-black uppercase text-slate-400 tracking-[0.4em] ml-1">App Perks</h3>
              <div className="grid grid-cols-1 gap-3">
                 <BenefitRow icon={<Smartphone />} title="Native UI" desc="Smooth interface for test attempts." />
                 <BenefitRow icon={<Zap />} title="Instant Sync" desc="Offline cached preparation nodes." />
                 <BenefitRow icon={<ShieldCheck />} title="Push Alerts" desc="Direct official recruitment notifications." />
              </div>

              <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-start gap-4">
                 <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                 <p className="text-[10px] font-bold text-blue-800 leading-relaxed uppercase">
                    Our Android app provides the best performance for Punjab GK, Current Affairs and all Practice Mocks.
                 </p>
              </div>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function BenefitRow({ icon, title, desc }: any) {
   return (
      <div className="p-4 md:p-8 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 md:gap-6 group hover:bg-white hover:shadow-xl transition-all">
         <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform shrink-0">
            {React.cloneElement(icon as React.ReactElement<any>, { className: "h-5 w-5" })}
         </div>
         <div className="text-left min-w-0">
            <h4 className="font-black text-xs md:text-sm uppercase text-[#0F172A] tracking-tight">{title}</h4>
            <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{desc}</p>
         </div>
      </div>
   );
}