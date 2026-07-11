'use client';

import React, { useState, useRef, useEffect } from "react";
import { motion, useInView, animate } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, User, Target, MapPin, Briefcase } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

/**
 * @fileOverview Meet Founder section v5.1 - Fixed motion.animate Error.
 */

export default function MeetFounder() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section id="founder-section" className="relative py-24 md:py-48 bg-white overflow-hidden" ref={ref}>
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
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
              animate={isInView ? { scale: 1 } : {}}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative h-64 w-64 md:h-80 md:w-80 rounded-full overflow-hidden border-8 border-white shadow-2xl bg-slate-100">
                <Image
                  src="/founder.png"
                  alt="Arsh Grewal"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  loading="lazy"
                />
              </div>
              <div className="absolute bottom-2 right-2 h-16 w-16 bg-blue-500 rounded-full border-4 border-white flex items-center justify-center text-white shadow-xl">
                <Check className="h-8 w-8" />
              </div>
            </motion.div>

            <div className="flex-1 space-y-6 text-center lg:text-left">
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                Hi, I'm Arsh Grewal. I'm a student from Punjab who understands how challenging government exam preparation can be. Instead of waiting for someone else to build the perfect platform, I decided to build it myself. Cracklix is my mission to provide modern mock tests, high-quality study resources, and a better learning experience for every Punjab Government Exam aspirant. Every feature, every mock test, every update and every design improvement is created with one goal: Helping students prepare with confidence. This journey has only just begun, and I am committed to continuously improving Cracklix into one of Punjab's most trusted learning platforms.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-24 items-start">
            <div className="bg-white/50 backdrop-blur-xl border border-blue-100/50 rounded-[32px] p-8 shadow-lg h-full">
              <h3 className="text-2xl font-bold text-[#0F172A]">My Mission</h3>
              <p className="mt-4 text-slate-600 text-lg">
                To build Punjab's smartest, most trusted and student-first exam preparation platform where every aspirant gets access to quality mock tests, meaningful learning tools and a premium preparation experience.
              </p>
            </div>
            <div className="text-center py-8">
              <p className="text-3xl md:text-4xl font-black text-[#0F172A] tracking-tighter leading-tight italic">
                "Dream big.<br/>Build bigger.<br/>Help thousands along the way."
              </p>
              <p className="mt-4 text-slate-500 font-medium">— Arsh Grewal</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-24">
            <StatCard icon={<User />} label="Student Founder" isInView={isInView} />
            <StatCard icon={<Briefcase />} label="Building Since" value="2023" isInView={isInView} delay={0.1} />
            <StatCard icon={<MapPin />} label="Punjab, India" isInView={isInView} delay={0.2} />
            <StatCard icon={<Target />} label="Student-First Mission" isInView={isInView} delay={0.3} />
          </div>

          <div className="text-center mt-24">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="h-16 px-12 bg-primary hover:bg-blue-700 text-white font-bold text-lg rounded-full shadow-4xl transition-all active:scale-95 border-none"
            >
              Read My Journey <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl p-10 bg-white/80 backdrop-blur-2xl rounded-[32px] border-blue-100/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-[#0F172A]">Why I Started Cracklix</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-slate-600 text-lg leading-relaxed mt-6 space-y-6">
              <p>As a student, I experienced how difficult it can be to find one reliable platform dedicated to Punjab Government Exam preparation.</p>
              <p>Most platforms were either outdated, complicated or lacked a premium learning experience.</p>
              <p>So I started building Cracklix. My goal isn't just to create another exam website. I want to build a platform that students genuinely enjoy using every day—a platform that motivates them, tracks their progress, and helps them move one step closer to achieving their government job dream.</p>
              <p>This platform is built with passion, continuously improved through feedback, and dedicated to every aspirant preparing for Punjab Government Exams.</p>
              <p>Thank you for being part of this journey.</p>
              <p className="font-medium">— Arsh Grewal</p>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function StatCard({ icon, label, value, isInView, delay = 0 }: { icon: React.ReactNode; label: string; value?: string; isInView: boolean; delay?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView && value) {
      const animation = animate(0, parseInt(value), {
        duration: 2,
        delay,
        onUpdate: (latest) => setCount(Math.round(latest)),
      });
      return () => animation.stop();
    }
  }, [isInView, value, delay]);

  return (
    <motion.div
      className="bg-white/60 backdrop-blur-lg border border-blue-100/50 rounded-[32px] p-6 text-center flex flex-col items-center justify-center space-y-3 h-full shadow-lg"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: delay + 0.2, ease: "easeOut" }}
    >
      <div className="text-primary">{React.cloneElement(icon as React.ReactElement, { className: "h-8 w-8" })}</div>
      {value ? <motion.p className="text-4xl font-bold text-[#0F172A]">{count}</motion.p> : null}
      <p className="text-sm font-semibold text-slate-500 whitespace-nowrap">{label}</p>
    </motion.div>
  );
}
