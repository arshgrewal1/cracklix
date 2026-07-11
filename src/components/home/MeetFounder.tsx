'use client';

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, useInView, animate } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, User, Target, MapPin, Briefcase } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";

/**
 * @fileOverview Meet Founder section v6.0.
 * UPDATED: Normalized typography and reduced section spacing.
 */
export default function MeetFounder() {
  const db = useFirestore();
  const settingsRef = useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]);
  const { data: settings } = useDoc<any>(settingsRef);

  const founder = {
    name: settings?.founderName || "Arsh Grewal",
    bio: settings?.founderBio || "I'm Arsh Grewal, a student from Punjab dedicated to building Punjab's smartest exam preparation platform.",
    quote: settings?.founderQuote || "Empowering every aspirant in Punjab with institutional-grade technology.",
    buildingSince: settings?.founderBuildingSince || "19 July 2026",
    mission: settings?.founderMission || "To build a trusted, student-first exam preparation platform."
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section id="founder-section" className="relative py-12 md:py-24 bg-white overflow-hidden" ref={ref}>
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="text-center mb-10 md:mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/50 border border-blue-100/50 text-xs font-bold text-slate-600">
              🚀 Student • Founder • Developer
            </span>
            <h2 className="text-3xl md:text-[50px] font-black text-[#0F172A] tracking-tighter mt-4 leading-tight">
              Meet the founder
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-10 md:gap-16">
            <motion.div 
              className="relative shrink-0"
              initial={{ scale: 0.95 }} 
              animate={isInView ? { scale: 1 } : { scale: 0.95 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative h-48 w-48 md:h-80 md:w-80 rounded-full overflow-hidden border-4 md:border-8 border-white shadow-xl bg-slate-100">
                <Image
                  src="/founder.png"
                  alt={founder.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 150px, 320px"
                />
              </div>
              <div className="absolute bottom-1 right-1 h-12 w-12 md:h-16 md:w-16 bg-blue-500 rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg">
                <Check className="h-6 w-6 md:h-8 md:w-8" />
              </div>
            </motion.div>

            <div className="flex-1 space-y-4 md:space-y-6 text-center lg:text-left">
              <p className="text-base md:text-xl text-slate-600 leading-relaxed font-medium">
                {founder.bio}
              </p>
              <p className="text-sm md:text-lg text-slate-400 font-medium italic">
                "{founder.quote}"
              </p>
            </div>
          </div>

          <div className="text-center mt-12 md:mt-20">
            <Button
              asChild
              className="h-[52px] md:h-16 px-10 bg-[#0B1528] hover:bg-black text-white font-bold text-sm md:text-base rounded-full shadow-xl transition-all active:scale-95 border-none"
            >
              <Link href="/meet-founder">
                Read my story <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value, isInView, delay = 0 }: { icon: React.ReactNode; label: string; value?: string; isInView: boolean; delay?: number }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (isInView && value && /^\d+$/.test(value)) {
      const controls = animate(0, parseInt(value), {
        duration: 2,
        delay,
        onUpdate: (latest) => setCount(Math.round(latest)),
      });
      return () => controls.stop();
    }
  }, [isInView, value, delay]);

  return (
    <motion.div
      className="bg-white/60 backdrop-blur-lg border border-blue-100/50 rounded-[2rem] p-5 text-center flex flex-col items-center justify-center space-y-2 h-full shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4, delay: delay + 0.1, ease: "easeOut" }}
    >
      <div className="text-primary scale-90">{icon}</div>
      {value ? (
        <p className="text-lg md:text-2xl font-black text-[#0F172A] tabular-nums leading-tight">
          {value && /^\d+$/.test(value) ? count : value}
        </p>
      ) : null}
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    </motion.div>
  );
}