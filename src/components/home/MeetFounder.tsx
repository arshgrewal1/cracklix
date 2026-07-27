'use client';

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Target, Star, ShieldCheck, Heart, Instagram } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";

/**
 * @fileOverview Refined Meet Founder Section v8.5 [SEO Hardened].
 * UPDATED: Added alt text to images for accessibility and SEO.
 */
export default function MeetFounder() {
  const db = useFirestore();
  const settingsRef = useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]);
  const { data: settings } = useDoc<any>(settingsRef);

  const founder = {
    name: settings?.founderName || "Arsh Grewal",
    bio: settings?.founderBio || "I'm Arsh Grewal, a student from Punjab dedicated to building Punjab's smartest exam preparation platform.",
    quote: settings?.founderQuote || "Empowering every aspirant in Punjab with institutional-grade technology.",
    instagramUrl: settings?.instagramUrl || "https://www.instagram.com/cracklix.in/",
    showImage: settings?.showFounderImage !== false
  };

  return (
    <section aria-labelledby="founder-heading" className="py-12 md:py-24 bg-slate-50/50 border-y border-slate-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 max-w-6xl relative z-10">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 md:gap-20">
          
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] md:text-xs font-bold tracking-tight text-primary">
                 <Star className="h-3 w-3 fill-current" /> Verified Founder
              </div>
              
              <h2 id="founder-heading" className="text-3xl md:text-6xl font-[800] text-[#0F172A] tracking-tighter leading-[0.95] antialiased">
                Meet the <br/> <span className="text-primary italic">founder.</span>
              </h2>
              
              <p className="text-lg md:text-2xl text-slate-500 font-medium leading-relaxed italic max-w-2xl">
                "{founder.quote}"
              </p>
              
              <p className="text-base md:text-lg text-slate-600 font-medium leading-relaxed line-clamp-3">
                {founder.bio}
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
                 <FeatureChip icon={Target} label="Student First" />
                 <FeatureChip icon={ShieldCheck} label="Official Patterns" />
                 <FeatureChip icon={Heart} label="Made in Punjab" />
              </div>
            </motion.div>
            
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button
                asChild
                className="h-16 px-12 bg-[#0F172A] hover:bg-black text-white font-bold tracking-tight rounded-2xl shadow-xl transition-all active:scale-95 border-none group w-full sm:w-auto"
              >
                <Link href="/meet-founder" className="flex items-center justify-center gap-3">
                  Read my full story <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-16 px-12 border-2 border-slate-200 text-[#0F172A] font-bold tracking-tight rounded-2xl shadow-sm hover:bg-slate-50 active:scale-95 transition-all w-full sm:w-auto"
              >
                <a href={founder.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3">
                  <Instagram className="h-5 w-5 text-rose-500" />
                  Follow on Instagram
                </a>
              </Button>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative shrink-0"
          >
            <div className="relative h-64 w-64 md:h-[420px] md:w-[420px] rounded-[3rem] overflow-hidden border-8 border-white shadow-5xl bg-[#0B1528] flex items-center justify-center">
              {founder.showImage ? (
                <Image
                  src="/founder.png"
                  alt={`Portrait of ${founder.name}, Founder of Cracklix`}
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                  priority
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center space-y-6">
                  <div className="h-20 w-20 rounded-[1.5rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                    <ShieldCheck className="h-10 w-10 text-primary animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-primary">Security Protocol</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Photo hidden by admin</p>
                  </div>
                </div>
              )}
            </div>
            {founder.showImage && (
              <div className="absolute -bottom-4 -right-4 h-16 w-16 md:h-20 md:w-20 bg-primary rounded-3xl border-8 border-white shadow-2xl flex items-center justify-center text-white">
                <Check className="h-8 w-8 md:h-10 md:w-10 stroke-[4px]" />
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
}

function FeatureChip({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-xl shadow-sm">
       <Icon className="h-4 w-4 text-primary" />
       <span className="text-[10px] md:text-xs font-bold text-[#0F172A] tracking-tight">{label}</span>
    </div>
  );
}
