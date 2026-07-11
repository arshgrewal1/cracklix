'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Zap, ClipboardList, ShieldCheck, Users, Headset, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

/**
 * @fileOverview High-Fidelity Animated Counter Node.
 */
function Counter({ value, suffix = "+" }: { value: number | string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'string' ? parseInt(value.replace(/\D/g, '')) || 0 : value;
  const isStringValue = typeof value === 'string' && isNaN(parseInt(value.replace(/\D/g, '')));

  useEffect(() => {
    if (isStringValue) return;
    
    let startTime: number | null = null;
    const duration = 2000; // 2 seconds

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setDisplayValue(Math.floor(progress * numericValue));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [numericValue, isStringValue]);

  if (isStringValue) return <span>{value}</span>;

  return <span>{displayValue.toLocaleString()}{suffix}</span>;
}

/**
 * @fileOverview Premium Institutional Stats Bar v3.0.
 * UPDATED: Added dynamic trend badges (e.g. +28 this week) as per Cracklix standards.
 */
export default function StatsBar() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const settingsRef = useMemo(() => (db ? doc(db, "settings", "global") : null), [db]);
  
  const { data: stats, loading: statsLoading } = useDoc<any>(statsRef);
  const { data: settings, loading: settingsLoading } = useDoc<any>(settingsRef);

  const activeStats = useMemo(() => {
    const s = settings?.statsVisibility || {
      showQuestions: true,
      showMocks: true,
      showCategories: true,
      showSupport: true,
      showStudents: false
    };

    const trends = settings?.statsTrends || {
      questions: "+28 this week",
      mocks: "+2 added today",
      categories: "Updated daily",
      students: "+84 this week",
      support: "Live now"
    };

    const mode = settings?.studentCounterMode || 'manual';
    const threshold = settings?.studentCounterThreshold || 1000;
    const totalUsers = stats?.totalUsers || 0;

    // Automatic reveal logic
    const shouldShowStudents = mode === 'auto' 
      ? totalUsers >= threshold 
      : s.showStudents;

    const pool = [];
    if (s.showQuestions) pool.push({ label: "Practice questions", val: stats?.totalQuestions || 12000, trend: trends.questions, icon: <Zap />, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" });
    if (s.showMocks) pool.push({ label: "Mock tests", val: stats?.totalMocks || 450, trend: trends.mocks, icon: <ClipboardList />, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" });
    if (s.showCategories) pool.push({ label: "Exam categories", val: stats?.totalCategories || 85, trend: trends.categories, icon: <ShieldCheck />, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" });
    
    if (shouldShowStudents) {
      pool.push({ label: "Verified students", val: totalUsers, trend: trends.students, icon: <Users />, color: "text-blue-600", bg: "bg-blue-600/10", border: "border-blue-600/20" });
    } else if (s.showSupport) {
      pool.push({ label: "Student support", val: "24x7", trend: trends.support, icon: <Headset />, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", noSuffix: true });
    }

    return pool.slice(0, 4);
  }, [stats, settings]);

  if (!mounted) return null;

  return (
    <section className="bg-white py-8 md:py-12 border-b border-slate-50">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:gap-8 grid-cols-2 md:grid-cols-4">
          {statsLoading || settingsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 md:h-36 w-full rounded-[22px] bg-slate-50" />
            ))
          ) : (
            activeStats.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={cn(
                  "relative group h-[130px] md:h-[150px] border border-slate-100 bg-white shadow-sm hover:shadow-2xl transition-all duration-300 rounded-[22px] p-4 md:p-6 flex flex-col items-center justify-center gap-2 overflow-hidden hover:-translate-y-1 active:scale-95 cursor-default"
                )}>
                  {/* Glass Background Node */}
                  <div className={cn("absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-20", item.bg)} />
                  
                  <div className={cn(
                    "h-10 w-10 md:h-12 md:w-12 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-500 group-hover:scale-110 shadow-inner z-10",
                    item.bg,
                    item.border,
                    item.color
                  )}>
                    {React.cloneElement(item.icon as React.ReactElement, { className: "h-5 w-5 md:h-6 md:w-6" })}
                  </div>

                  <div className="text-center space-y-0.5 z-10 w-full">
                    <div className="text-lg md:text-2xl lg:text-3xl font-black text-[#0F172A] tracking-tighter leading-none antialiased">
                      <Counter value={item.val} suffix={item.noSuffix ? "" : "+"} />
                    </div>
                    <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-tight truncate px-1">
                      {item.label}
                    </p>
                    
                    {item.trend && (
                      <div className="mt-1 flex items-center justify-center gap-1 animate-in fade-in slide-in-from-bottom-1">
                         <span className="text-[8px] md:text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/50 flex items-center gap-1">
                           <TrendingUp className="h-2 w-2" /> {item.trend}
                         </span>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
