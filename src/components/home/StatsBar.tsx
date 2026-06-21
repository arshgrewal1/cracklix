'use client';

import React, { useMemo } from 'react';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Zap, ClipboardList, ShieldCheck, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * @fileOverview High-Fidelity Single-Line Stats Bar v6.1.
 * ALIGNMENT: Standardized side margins to match Hero section.
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
      label: "QUESTIONS", 
      val: (formatCompact(stats?.totalQuestions) || "439") + "+", 
      icon: <Zap className="h-3 w-3 md:h-6 md:w-6 text-blue-600" />,
      bgColor: "bg-blue-50/50",
      borderColor: "border-blue-100/50"
    },
    { 
      label: "MOCKS", 
      val: (formatCompact(stats?.totalMocks) || "8") + "+", 
      icon: <ClipboardList className="h-3 w-3 md:h-6 md:w-6 text-purple-600" />,
      bgColor: "bg-purple-50/50",
      borderColor: "border-purple-100/50"
    },
    { 
      label: "CATEGORIES", 
      val: (formatCompact(stats?.totalCategories) || "214") + "+", 
      icon: <ShieldCheck className="h-3 w-3 md:h-6 md:w-6 text-emerald-600" />,
      bgColor: "bg-emerald-50/50",
      borderColor: "border-emerald-100/50"
    },
    { 
      label: "ASPIRANTS", 
      val: (formatCompact(stats?.totalUsers) || "6") + "+", 
      icon: <Users className="h-3 w-3 md:h-6 md:w-6 text-orange-600" />,
      bgColor: "bg-orange-50/50",
      borderColor: "border-orange-100/50"
    }
  ], [stats]);

  return (
    <section className="bg-blue-50 pt-0 pb-6 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-4 gap-1.5 md:gap-8">
          {items.map((item, i) => (
            <Card key={i} className="border border-slate-100 shadow-sm rounded-xl md:rounded-[2.5rem] p-2 md:p-10 bg-white flex flex-col md:flex-row items-center justify-center md:justify-start gap-1.5 md:gap-8 transition-all duration-500 hover:shadow-xl group">
              <div className={cn(
                "h-7 w-7 md:h-16 md:w-16 rounded-full flex items-center justify-center shrink-0 border transition-transform duration-500 group-hover:scale-110 shadow-sm",
                item.bgColor,
                item.borderColor
              )}>
                {item.icon}
              </div>
              <div className="text-center md:text-left flex flex-col justify-center min-w-0">
                {loading && !stats ? (
                  <Skeleton className="h-3 md:h-12 w-10 md:w-20 bg-slate-50" />
                ) : (
                  <span className="text-[10px] md:text-4xl font-black text-[#0F172A] tabular-nums tracking-tighter leading-none antialiased">
                    {item.val}
                  </span>
                )}
                <span className="text-[6px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest mt-0.5 md:mt-3 leading-none truncate w-full">
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