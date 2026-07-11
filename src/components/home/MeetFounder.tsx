
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
 * UPDATED: Connected to live Firestore settings for dynamic admin control.
 */
export default function MeetFounder() {
  const db = useFirestore();
  const settingsRef = useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]);
  const { data: settings } = useDoc<any>(settingsRef);

  const founder = {
    name: settings?.founderName || "Arsh Grewal",
    bio: settings?.founderBio || "Hi, I'm Arsh Grewal. I'm a student from Punjab who understands how challenging government exam preparation can be. Instead of waiting for someone else to build the perfect platform, I decided to build it myself. Cracklix is my mission to provide modern mock tests, high-quality study resources, and a better learning experience for every Punjab Government Exam aspirant.",
    quote: settings?.founderQuote || "Dream big. Build bigger. Help thousands along the way.",
    buildingSince: settings?.founderBuildingSince || "19 July 2026",
    mission: settings?.founderMission || "To build Punjab's smartest, most trusted and student-first exam preparation platform where every aspirant gets access to quality mock tests and a premium preparation experience."
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section id="founder-section" className="relative py-24 md:py-48 bg-white overflow-hidden" ref={ref}>
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/50 border border-blue-100/50 text-sm font-bold text-slate-600">
              🚀 Student • Founder • Developer
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-[#0F172A] tracking-tighter mt-4">
              Meet the Founder
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              className="relative shrink-0"
              initial={{ scale: 0.9 }} 
              animate={isInView ? { scale: 1 } : { scale: 0.9 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative h-64 w-64 md:h-80 md:w-80 rounded-full overflow-hidden border-8 border-white shadow-2xl bg-slate-100">
                <Image
                  src="/founder.png"
                  alt={founder.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="absolute bottom-2 right-2 h-16 w-16 bg-blue-500 rounded-full border-4 border-white flex items-center justify-center text-white shadow-xl">
                <Check className="h-8 w-8" />
              </div>
            </motion.div>

            <div className="flex-1 space-y-6 text-center lg:text-left">
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
                {founder.bio}
              </p>
              <p className="text-slate-500 font-medium italic">
                Every feature, every design improvement is created with one goal: Helping students prepare with confidence.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-24 items-start">
            <div className="bg-white/50 backdrop-blur-xl border border-blue-100/50 rounded-[32px] p-8 shadow-lg h-full text-left">
              <h3 className="text-2xl font-bold text-[#0F172A]">My Mission</h3>
              <p className="mt-4 text-slate-600 text-lg font-medium leading-relaxed">
                {founder.mission}
              </p>
            </div>
            <div className="text-center py-8">
              <p className="text-3xl md:text-4xl font-black text-[#0F172A] tracking-tighter leading-tight italic">
                "{founder.quote.split('.').join('".<br/>"')}"
              </p>
              <p className="mt-4 text-slate-500 font-medium">— {founder.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-24">
            <StatCard icon={<User />} label="Student Founder" isInView={isInView} />
            <StatCard icon={<Briefcase />} label="Building Since" value={founder.buildingSince} isInView={isInView} delay={0.1} />
            <StatCard icon={<MapPin />} label="Punjab, India" isInView={isInView} delay={0.2} />
            <StatCard icon={<Target />} label="Student-First Mission" isInView={isInView} delay={0.3} />
          </div>

          <div className="text-center mt-24">
            <Button
              asChild
              className="h-16 px-12 bg-primary hover:bg-blue-700 text-white font-bold text-lg rounded-full shadow-4xl transition-all active:scale-95 border-none"
            >
              <Link href="/meet-founder">
                Read My Journey <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl p-10 bg-white rounded-[32px] border-none shadow-5xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-[#0F172A]">Why I Started Cracklix</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-slate-600 text-lg leading-relaxed mt-6 space-y-6 text-left font-medium">
              <p>As a student, I experienced how difficult it can be to find one reliable platform dedicated to Punjab Government Exam preparation.</p>
              <p>Most platforms were either outdated, complicated or lacked a premium learning experience.</p>
              <p>So I started building Cracklix. My goal isn't just to create another exam website. I want to build a platform that students genuinely enjoy using every day—a platform that motivates them, tracks their progress, and helps them move one step closer to achieving their government job dream.</p>
              <p className="font-bold">— {founder.name}</p>
          </DialogDescription>
        </DialogContent>
      </Dialog>
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
      className="bg-white/60 backdrop-blur-lg border border-blue-100/50 rounded-[32px] p-6 text-center flex flex-col items-center justify-center space-y-3 h-full shadow-lg"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: delay + 0.2, ease: "easeOut" }}
    >
      <div className="text-primary">{icon}</div>
      {value ? (
        <p className="text-xl md:text-3xl font-black text-[#0F172A] tabular-nums leading-tight">
          {value && /^\d+$/.test(value) ? count : value}
        </p>
      ) : null}
      <p className="text-[10px] md:text-sm font-bold text-slate-500 uppercase tracking-widest">{label}</p>
    </motion.div>
  );
}
