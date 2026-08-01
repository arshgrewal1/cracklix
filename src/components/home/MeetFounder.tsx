'use client';

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Target, Star, ShieldCheck, Heart, Instagram } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Compact Meet Founder Section v9.0.
 * COMPACT: Drastically reduced text sizes and image container for Home Page fit.
 */
export default function MeetFounder() {
  const db = useFirestore();
  const settingsRef = useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]);
  const { data: settings } = useDoc<any>(settingsRef);

  const founder = {
    name: settings?.founderName || "Arsh Grewal",
    bio: settings?.founderBio || "I'm Arsh Grewal, dedicated to building Punjab's smartest platform.",
    quote: settings?.founderQuote || "Empowering aspirants with elite technology.",
    instagramUrl: settings?.instagramUrl || "https://www.instagram.com/cracklix.in/",
    showImage: settings?.showFounderImage !== false
  };

  return (
    <section aria-labelledby="founder-heading" className="py-10 md:py-16 bg-slate-50/50 border-y border-slate-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-16">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative shrink-0"
          >
            <div className="relative h-44 w-44 md:h-72 md:w-72 rounded-[2rem] md:rounded-[3rem] overflow-hidden border-4 md:border-8 border-white shadow-2xl bg-[#0B1528] flex items-center justify-center">
              {founder.showImage ? (
                <Image
                  src="/founder.png"
                  alt={`Portrait of ${founder.name}`}
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  priority
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <ShieldCheck className="h-8 w-8 text-primary animate-pulse" />
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Secured</p>
                </div>
              )}
            </div>
            {founder.showImage && (
              <div className="absolute -bottom-2 -right-2 h-10 w-10 md:h-12 md:w-12 bg-primary rounded-xl md:rounded-2xl border-4 md:border-8 border-white shadow-xl flex items-center justify-center text-white">
                <Check className="h-4 w-4 md:h-6 md:w-6 stroke-[4px]" />
              </div>
            )}
          </motion.div>

          <div className="flex-1 space-y-5 md:space-y-8 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[8px] md:text-[10px] font-bold tracking-tight text-primary">
                 <Star className="h-2.5 w-2.5 fill-current" /> Verified Founder
              </div>
              
              <h2 id="founder-heading" className="text-2xl md:text-4xl font-[900] text-[#0F172A] tracking-tighter leading-tight antialiased">
                Meet the <span className="text-primary italic">founder.</span>
              </h2>
              
              <p className="text-sm md:text-xl text-slate-500 font-medium leading-relaxed italic max-w-xl">
                "{founder.quote}"
              </p>
              
              <p className="text-[12px] md:text-base text-slate-600 font-medium leading-relaxed line-clamp-2 max-w-2xl">
                {founder.bio}
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-2 pt-1">
                 <FeatureMini icon={Target} label="Student First" />
                 <FeatureMini icon={ShieldCheck} label="Verified" />
                 <FeatureMini icon={Heart} label="Punjab" />
              </div>
            </motion.div>
            
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <Button
                asChild
                className="h-11 md:h-13 px-8 bg-[#0F172A] hover:bg-black text-white font-bold tracking-tight rounded-xl shadow-lg transition-all active:scale-95 border-none group w-full sm:w-auto text-xs"
              >
                <Link href="/meet-founder" className="flex items-center justify-center gap-2">
                  Full story <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 md:h-13 px-8 border border-slate-200 text-[#0F172A] font-bold tracking-tight rounded-xl shadow-sm hover:bg-slate-50 active:scale-95 transition-all w-full sm:w-auto text-xs"
              >
                <a href={founder.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                  <Instagram className="h-4 w-4 text-rose-500" />
                  Instagram
                </a>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function FeatureMini({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-100 rounded-lg shadow-sm">
       <Icon className="h-3 w-3 text-primary" />
       <span className="text-[9px] md:text-[11px] font-bold text-[#0F172A] tracking-tight">{label}</span>
    </div>
  );
}
