'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Zap, Clock, Calendar, TrendingUp, Star, Activity, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useStudyTimer } from '@/hooks/useStudyTimer';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * @fileOverview Official Study Analytics Center v4.0.
 * UPDATED: Integrated persistent study stats from Firestore.
 */

export default function AnalyticsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  const { displayTime } = useStudyTimer();

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsRef = useMemo(() => (db && user ? doc(db, 'users', user.uid, 'stats', 'study') : null), [db, user]);
  const { data: dbStats, loading } = useDoc<any>(statsRef);

  const formatMins = (mins: number) => {
     if (!mins || mins <= 0) return "0m";
     if (mins < 60) return `${mins}m`;
     const h = Math.floor(mins / 60);
     const m = mins % 60;
     return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-body text-left selection:bg-primary/10 flex flex-col">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 md:py-16 max-w-7xl flex-1 space-y-12">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
             <Activity className="h-5 w-5 text-primary" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Performance Hub</span>
          </div>
          <h1 className="text-3xl md:text-6xl font-black text-[#0F172A] tracking-tight">Study Analytics</h1>
          <p className="text-lg text-slate-500 font-medium">Your learning journey, synchronized in real-time.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          
          <Card className="md:col-span-8 p-8 md:p-14 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl flex flex-col justify-center relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
                <Clock className="h-64 w-64" />
             </div>
             <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4">
                   <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner animate-pulse">
                      <Zap className="h-7 w-7 fill-current" />
                   </div>
                   <div className="text-left">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active session</p>
                      <p className="text-sm font-bold text-emerald-600">Today's Total Prep</p>
                   </div>
                </div>
                <h2 className="text-5xl md:text-8xl font-black text-[#0F172A] tracking-tighter tabular-nums leading-none">
                   {displayTime}
                </h2>
             </div>
          </Card>

          <div className="md:col-span-4 space-y-6">
             <StatCard 
               title="Yesterday's study" 
               value={loading ? "..." : formatMins(dbStats?.yesterdayStudyMinutes || 0)}
               icon={History} 
               color="text-blue-500" 
               bg="bg-blue-50"
             />
             <StatCard 
               title="Lifetime study" 
               value={loading ? "..." : formatMins(dbStats?.totalLifetimeStudyMinutes || 0)}
               icon={TrendingUp} 
               color="text-amber-500" 
               bg="bg-amber-50"
             />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
           <SimplePill label="Weekly peak" val="---" icon={Calendar} color="text-purple-500" />
           <SimplePill label="Avg daily" val="---" icon={Activity} color="text-emerald-500" />
           <SimplePill label="Current streak" val="---" icon={Zap} color="text-orange-500" />
        </div>
      </main>

      <Footer />
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <Card className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-lg text-left group hover:translate-y-[-4px] transition-all h-full flex flex-col justify-between">
      <div className="space-y-6">
         <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform", bg, color)}>
            <Icon className="h-6 w-6" />
         </div>
         <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{title}</p>
            <p className="text-3xl font-black text-[#0F172A] tracking-tighter tabular-nums">{value}</p>
         </div>
      </div>
    </Card>
  );
}

function SimplePill({ label, val, icon: Icon, color }: any) {
   return (
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
         <div className={cn("h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center", color)}>
            <Icon className="h-5 w-5" />
         </div>
         <div className="text-left">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{label}</p>
            <p className="text-lg font-black text-[#0F172A]">{val}</p>
         </div>
      </div>
   )
}

function History({ className }: { className?: string }) {
   return <Clock className={className} />;
}
