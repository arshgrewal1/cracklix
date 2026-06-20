'use client';

import React, { useMemo, useEffect, useState, isValidElement } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  ShieldCheck,
  Users,
  Zap,
  ChevronRight,
  Star,
  FileText,
  Landmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import PWAInstallButton from "@/components/PWAInstallButton";

/**
 * @fileOverview Hero Section v41.0 (TypeScript Hardened).
 */

export default function Hero() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsRef = useMemo(
    () => (db ? doc(db, "settings", "stats") : null),
    [db]
  );

  const { data: stats, loading: statsLoading } = useDoc<any>(statsRef);

  const formatNumber = (num: number, fallback: string) => {
    if (!num) return fallback;
    if (num >= 1000) return Math.floor(num / 1000) + "k+";
    return num + "+";
  };

  const dynamicUserCount = useMemo(() => {
    if (!stats?.totalUsers) return "10,000";
    return stats.totalUsers.toLocaleString();
  }, [stats]);

  const liveStats = useMemo(() => {
    return [
      {
        id: "q",
        icon: <Zap className="h-5 w-5 text-blue-600 fill-current" />,
        val: formatNumber(stats?.totalQuestions, "50,000+"),
        label: "Questions"
      },
      {
        id: "m",
        icon: <ClipboardList className="h-5 w-5 text-indigo-600" />,
        val: formatNumber(stats?.totalMocks, "500+"),
        label: "Mock Tests"
      },
      {
        id: "e",
        icon: <ShieldCheck className="h-5 w-5 text-blue-500" />,
        val: formatNumber(stats?.totalBoards, "50+"),
        label: "Exams"
      },
      {
        id: "u",
        icon: <Users className="h-5 w-5 text-indigo-500" />,
        val: formatNumber(stats?.totalUsers, "15,000+"),
        label: "Students"
      }
    ];
  }, [stats]);

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] py-16 lg:py-20">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full bg-blue-600/5 blur-[140px] rounded-full pointer-events-none" />
      
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 xl:px-12 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-8 xl:gap-16 items-center">
          
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 md:space-y-10 max-w-4xl lg:max-w-[680px] mx-auto lg:mx-0">
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-white border border-slate-100 shadow-xl"
            >
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-[10px] md:text-[13px] font-bold text-[#04102B] tracking-tight">
                {statsLoading ? "10,000+" : `${dynamicUserCount}+`} Students Trust Cracklix
              </span>
            </motion.div>

            <div className="space-y-4 md:space-y-6">
              <h1 className="text-3xl sm:text-5xl md:text-6xl xl:text-7xl font-extrabold tracking-tight text-[#0F172A] leading-[1.05] break-words">
                Crack Punjab <br/>
                <span className="text-[#2563EB]">Government Exams</span> <br/>
                With Confidence
              </h1>

              <p className="text-sm md:text-xl text-[#64748B] font-medium leading-relaxed max-w-2xl">
                Practice bilingual mock tests and prepare for Punjab Government Exams. 
                Access practice tests, previous papers and track your performance.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4 justify-center lg:justify-start">
              <Button
                asChild
                className="h-14 md:h-16 px-10 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm tracking-tight rounded-full shadow-xl transition-all active:scale-95 border-none group/btn"
              >
                <Link href="/mocks" className="flex items-center justify-center gap-3">
                  <span>Start Free Mock Test</span>
                  <ChevronRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </Button>

              <PWAInstallButton 
                variant="outline"
                className="h-14 md:h-16 px-10 border-2 border-slate-200 bg-white text-[#0F172A] font-bold text-sm tracking-tight rounded-full shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-6 w-full max-w-2xl pt-2">
               <FeatureCard icon={<Zap />} label="Mock Tests" href="/mocks" />
               <FeatureCard icon={<Landmark />} label="Punjab Exams" href="/exams" />
               <FeatureCard icon={<FileText />} label="Previous Papers" href="/pyqs" />
               <FeatureCard icon={<ShieldCheck />} label="Free Practice" href="/mocks" />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative w-full flex justify-center lg:justify-end py-4"
          >
            <div className="absolute inset-0 bg-blue-600/5 blur-[80px] rounded-full scale-110 pointer-events-none" />
            <img
              src="/images/hero-student.png"
              alt="Cracklix Student"
              className="w-full h-auto object-contain drop-shadow-2xl max-w-[280px] md:max-w-[480px] lg:max-w-[540px] xl:max-w-[620px]"
            />
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-16 md:mt-24">
          {liveStats.map((stat, i) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-white border border-slate-100 shadow-xl group hover:translate-y-[-4px] transition-all duration-300 text-left">
                <div className="flex flex-col items-start gap-4">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-slate-50 flex items-center justify-center shadow-inner group-hover:bg-blue-50 transition-colors">
                    {stat.icon}
                  </div>
                  <div className="space-y-1">
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-2xl md:text-4xl font-bold text-[#0F172A] tracking-tighter tabular-nums leading-none">
                        {stat.val}
                      </p>
                    )}
                    <p className="text-[10px] md:text-xs font-semibold text-[#64748B] tracking-tight pt-1">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

function FeatureCard({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) {
  return (
    <Link href={href} className="block group">
      <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-lg border border-slate-100 flex items-center gap-4 transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px] active:scale-95 cursor-pointer h-full">
        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-primary transition-colors duration-300">
           {isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, { className: "h-5 w-5 md:h-6 md:w-6 text-primary group-hover:text-white transition-colors" })}
        </div>
        <span className="font-bold text-[10px] md:text-xs text-[#0F172A] tracking-tight group-hover:text-primary transition-colors text-left leading-tight">
          {label}
        </span>
      </div>
    </Link>
  );
}
