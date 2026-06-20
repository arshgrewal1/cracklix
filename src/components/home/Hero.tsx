'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  ShieldCheck,
  Users,
  Zap,
  ChevronRight,
  BookOpen,
  FileText,
  BarChart3,
  Star,
  Gem
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useDoc, useFirestore, useUser } from "@/firebase";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Official Restored Hero Hub v14.0.
 * DATA: Restored original high-authority data strings.
 * TYPOGRAPHY: Uppercase labels for institutional weight.
 */

export default function Hero() {
  const db = useFirestore();
  const { profile } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const settingsRef = useMemo(() => (db ? doc(db, "settings", "global") : null), [db]);
  const { data: settings } = useDoc<any>(settingsRef);

  const trustBadgeContent = useMemo(() => {
    const count = settings?.trustBadgeCount !== undefined && settings.trustBadgeCount > 0 ? settings.trustBadgeCount : 15000;
    const label = settings?.trustBadgeText || "Aspirants Trusting Cracklix for Punjab Exams";
    return `${count.toLocaleString()}+ ${label}`;
  }, [settings]);

  const liveStats = useMemo(() => {
    return [
      {
        id: "q",
        icon: <Zap className="h-5 w-5 text-blue-600" />,
        val: "50,000+",
        label: "QUESTIONS"
      },
      {
        id: "m",
        icon: <ClipboardList className="h-5 w-5 text-indigo-600" />,
        val: "500+",
        label: "MOCK TESTS"
      },
      {
        id: "e",
        icon: <ShieldCheck className="h-5 w-5 text-emerald-600" />,
        val: "50+",
        label: "EXAMS"
      },
      {
        id: "u",
        icon: <Users className="h-5 w-5 text-orange-500" />,
        val: "15K+",
        label: "ASPIRANTS"
      }
    ];
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-blue-50 py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">

          {/* LEFT: Text & Identity Hub */}
          <div className="text-left space-y-6">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-100 shadow-sm group hover:border-primary/30 transition-all cursor-default"
            >
              <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 animate-pulse" />
              <span className="text-[12px] font-black text-slate-700 tracking-tight">
                {trustBadgeContent}
              </span>
            </motion.div>

            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.05]">
                Crack Punjab <br/>
                <span className="block text-blue-600">
                  Government Exams
                </span>
                With Confidence
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-lg leading-relaxed font-medium">
                Practice with bilingual mock tests, previous papers and exam-focused preparation for PSSSB, Punjab Police, PSTET, PSPCL and more.
              </p>

              <div className="flex flex-wrap gap-2">
                {["PSSSB", "Punjab Police", "PSTET", "PSPCL", "PPSC"].map(
                  (item) => (
                    <span
                      key={item}
                      className="px-3 py-1 rounded-full bg-white border text-[11px] font-bold text-slate-500 hover:bg-slate-50 transition-colors tracking-tight"
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Visual & Features Hub */}
          <div className="flex flex-col items-center">
            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative flex justify-center mb-6"
            >
              <img
                src="/images/hero-student.png"
                alt="Cracklix Student"
                className="w-full max-w-[320px] md:max-w-md drop-shadow-2xl"
              />
            </motion.div>

            {/* Feature Matrix Cards */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <FeatureCard icon={ClipboardList} label="Mock Tests" sub="500+ SERIES" color="text-blue-600" href="/mocks" />
              <FeatureCard icon={BookOpen} label="Study Material" sub="100+ NOTES" color="text-indigo-600" href="/notes" />
              <FeatureCard icon={FileText} label="Previous Papers" sub="VERIFIED PYQS" color="text-emerald-600" href="/pyqs" />
              <FeatureCard icon={BarChart3} label="Analytics" sub="STATE MERIT" color="text-orange-500" href="/dashboard" />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 mt-8 w-full justify-center">
              <Button asChild className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg text-white font-bold text-xs tracking-tight gap-2">
                <Link href="/mocks">Start Free Mock Test <ChevronRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" className="h-12 px-6 rounded-xl border-slate-200 bg-white font-bold text-slate-700 text-xs tracking-tight gap-2">
                <Link href="/pass"><Gem className="h-4 w-4 text-primary" /> {profile?.passStatus === 'active' ? 'Manage Pass' : 'Get Elite Pass'}</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* STATS: Bottom Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10">
          {liveStats.map((stat) => (
            <Card key={stat.id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-md group hover:shadow-xl transition-all">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900 leading-none tabular-nums">{stat.val}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, label, sub, color, href }: any) {
  return (
    <Link href={href}>
      <Card className="p-4 rounded-2xl border border-slate-100 bg-white hover:shadow-lg transition-all duration-300 h-full group">
        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center mb-3 shadow-inner bg-slate-50 group-hover:scale-110 transition-transform")}>
          <Icon className={cn("h-4 w-4", color)} />
        </div>
        <p className="font-bold text-slate-900 text-xs leading-tight">{label}</p>
        <p className="text-[8px] text-slate-400 mt-0.5 uppercase font-bold tracking-widest">{sub}</p>
      </Card>
    </Link>
  )
}
