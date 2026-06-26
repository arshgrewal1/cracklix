'use client';

import React, { useMemo } from 'react';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Zap, ClipboardList, ShieldCheck, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * @fileOverview High-Fidelity Single-Line Stats Bar v6.7.
 * UPDATED: Standardized typography to Title Case and unified container.
 */

const formatCompact = (num: number) => {
  if (num === undefined || num === null) return null;
  if (num === 0) return "0";
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

export default function StatsBar() {
  const db = useFirestore();
  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats, loading } = useDoc<any>(statsRef);

  const items = useMemo(() => [
    { 
      label: "Questions", 
      val: (formatCompact(stats?.totalQuestions) || "404") + "+", 
      icon: <Zap className="h-4 w-4 md:h-6 md:w-6 text-blue-600" />,
      bgColor: "bg-blue-50/50",
      borderColor: "border-blue-100/50"
    },
    { 
      label: "Mock Tests", 
      val: (formatCompact(stats?.totalMocks) || "7") + "+", 
      icon: <ClipboardList className="h-4 w-4 md:h-6 md:w-6 text-purple-600" />,
      bgColor: "bg-purple-50/50",
      borderColor: "border-purple-100/50"
    },
    { 
      label: "Categories", 
      val: (formatCompact(stats?.totalCategories) || "214") + "+", 
      icon: <ShieldCheck className="h-4 w-4 md:h-6 md:w-6 text-emerald-600" />,
      bgColor: "bg-emerald-50/50",
      borderColor: "border-emerald-100/50"
    },
    { 
      label: "Aspirants", 
      val: (formatCompact(stats?.totalUsers) || "8") + "+", 
      icon: <Users className="h-4 w-4 md:h-6 md:w-6 text-orange-600" />,
      bgColor: "bg-orange-50/50",
      borderColor: "border-orange-100/50"
    }
  ], [stats]);

  return (
    <section className="bg-blue-50 py-8 md:py-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-8">
          {items.map((item, i) => (
            <Card key={i} className="border border-slate-100 shadow-sm rounded-2xl md:rounded-[2.5rem] p-4 md:p-10 bg-white flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 md:gap-8 transition-all duration-500 hover:shadow-xl group">
              <div className={cn(
                "h-10 w-10 md:h-16 md:w-16 rounded-full flex items-center justify-center shrink-0 border transition-transform duration-500 group-hover:scale-110 shadow-sm",
                item.bgColor,
                item.borderColor
              )}>
                {item.icon}
              </div>
              <div className="text-center md:text-left flex flex-col justify-center min-w-0">
                {loading && !stats ? (
                  <Skeleton className="h-4 md:h-12 w-16 md:w-20 bg-slate-50" />
                ) : (
                  <span className="text-lg md:text-3xl font-black text-[#0F172A] tabular-nums tracking-tighter leading-none antialiased">
                    {item.val}
                  </span>
                )}
                <span className="text-[10px] md:text-sm font-bold text-slate-400 mt-1 md:mt-3 leading-none truncate w-full tracking-tight">
                  {item.label}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
