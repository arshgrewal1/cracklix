
'use client';

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Target, Star, ShieldCheck, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";

/**
 * @fileOverview Refined Meet Founder Section v7.1.
 * UPDATED: Removed uppercase and repositioned text above image on mobile.
 */
export default function MeetFounder() {
  const db = useFirestore();
  const settingsRef = useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]);
  const { data: settings } = useDoc<any>(settingsRef);

  const founder = {
    name: settings?.founderName || "Arsh Grewal",
    bio: settings?.founderBio || "I'm Arsh Grewal, a student from Punjab dedicated to building Punjab's smartest exam preparation platform.",
    quote: settings?.founderQuote || "Empowering every aspirant in Punjab with institutional-grade technology.",
  };

  return (
    <section className="py-12 md:py-24 bg-slate-50/50 border-y border-slate-100 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 max-w-6xl relative z-10">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 md:gap-20">
          
          {/* Narrative Content - Positioned Above on Mobile */}
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] md:text-xs font-black tracking-widest text-primary">
                 <Star className="h-3 w-3 fill-current" /> Verified Founder
              </div>
              
              <h2 className="text-3xl md:text-6xl font-black text-[#0F172A] tracking-tighter leading-[0.95] antialiased">
                Meet the <br/> <span className="text-primary italic">Founder.</span>
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
            
            <div className="pt-4">
              <Button
                asChild
                className="h-16 px-12 bg-[#0F172A] hover:bg-black text-white font-black tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 border-none group"
              >
                <Link href="/meet-founder" className="flex items-center justify-center gap-3">
                  Read My Full Story <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Founder Visual Hub */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative shrink-0"
          >
            <div className="relative h-64 w-64 md:h-[420px] md:w-[420px] rounded-[3rem] overflow-hidden border-8 border-white shadow-5xl bg-[#0B1528]">
              <Image
                src="/founder.png"
                alt={founder.name}
                fill
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                priority
              />
            </div>
            <div className="absolute -bottom-4 -right-4 h-16 w-16 md:h-20 md:w-20 bg-primary rounded-3xl border-8 border-white shadow-2xl flex items-center justify-center text-white">
              <Check className="h-8 w-8 md:h-10 md:w-10 stroke-[4px]" />
            </div>
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
