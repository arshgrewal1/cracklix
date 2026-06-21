'use client';

import React, { useMemo } from 'react';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Zap, ClipboardList, ShieldCheck, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * @fileOverview High-Fidelity Live Stats Bar v4.0.
 * SCREENSHOT MATCH: Restored specific icons, light backgrounds, and uppercase sub-labels.
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
      icon: <Zap className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />,
      bgColor: "bg-blue-50/50",
      borderColor: "border-blue-100/50"
    },
    { 
      label: "MOCK TESTS", 
      val: (formatCompact(stats?.totalMocks) || "8") + "+", 
      icon: <ClipboardList className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />,
      bgColor: "bg-purple-50/50",
      borderColor: "border-purple-100/50"
    },
    { 
      label: "CATEGORIES", 
      val: (formatCompact(stats?.totalCategories) || "214") + "+", 
      icon: <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-emerald-600" />,
      bgColor: "bg-emerald-50/50",
      borderColor: "border-emerald-100/50"
    },
    { 
      label: "ASPIRANTS", 
      val: (formatCompact(stats?.totalUsers) || "6") + "+", 
      icon: <Users className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />,
      bgColor: "bg-orange-50/50",
      borderColor: "border-orange-100/50"
    }
  ], [stats]);

  return (
    <section className="bg-white py-6 md:py-16 border-b border-slate-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {items.map((item, i) => (
            <Card key={i} className="border border-slate-100 shadow-sm rounded-2xl md:rounded-[2.5rem] p-5 md:p-10 bg-white flex items-center gap-5 md:gap-8 transition-all duration-500 hover:shadow-2xl hover:translate-y-[-4px] group">
              <div className={cn(
                "h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-500 group-hover:scale-110 shadow-sm",
                item.bgColor,
                item.borderColor
              )}>
                {item.icon}
              </div>
              <div className="text-left flex flex-col justify-center min-w-0">
                {loading && !stats ? (
                  <Skeleton className="h-8 md:h-12 w-20 bg-slate-50" />
                ) : (
                  <span className="text-2xl md:text-5xl font-black text-[#0F172A] tabular-nums tracking-tighter leading-none antialiased">
                    {item.val}
                  </span>
                )}
                <span className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 md:mt-3 leading-none">
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
