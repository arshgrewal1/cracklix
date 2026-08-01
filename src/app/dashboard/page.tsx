'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { collection, query, where, limit, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Target, 
  Clock, 
  Trophy, 
  Activity, 
  ChevronRight, 
  ShieldCheck,
  Loader2,
  CheckCircle2,
  ArrowRight,
  History,
  BarChart3
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import StudentAvatar from '@/components/brand/StudentAvatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudyTimer } from '@/hooks/useStudyTimer';
import { motion } from 'framer-motion';

/**
 * @fileOverview Official Real-Time Dashboard Portal v9.2.
 * FIXED: Standardized metric icon backgrounds to match logo registry style.
 */

export default function StudentDashboard() {
  const { user, profile, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { displayTime } = useStudyTimer();

  useEffect(() => { setMounted(true); }, []);

  // Real-time results query
  const resultsQuery = useMemo(() => {
    if (!db || !user || !mounted) return null;
    return query(
      collection(db, "results"), 
      where("userId", "==", user.uid), 
      limit(20)
    );
  }, [db, user, mounted]);

  const { data: rawResults, loading: resultsLoading } = useCollection<any>(resultsQuery);

  const sortedResults = useMemo(() => {
    if (!rawResults) return [];
    return [...rawResults].sort((a, b) => {
       const tA = new Date(a.timestamp || 0).getTime();
       const tB = new Date(b.timestamp || 0).getTime();
       return tB - tA;
    }).slice(0, 10);
  }, [rawResults]);

  const performance = useMemo(() => {
    if (!sortedResults || sortedResults.length === 0) {
      return { accuracy: 0, totalCorrect: 0, totalAttempted: 0 };
    }
    let totalCorrect = 0; let totalAttempted = 0;
    sortedResults.forEach((r: any) => {
      totalCorrect += (r.correctCount || 0);
      totalAttempted += (r.attemptedCount || 0);
    });
    const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
    return { accuracy, totalCorrect, totalAttempted };
  }, [sortedResults]);

  if (!mounted || authLoading) return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background font-body text-left selection:bg-primary/10">
      <Navbar />
      <main className="container mx-auto px-4 md:px-8 py-8 md:py-16 max-w-7xl space-y-8 md:space-y-12">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-xl border border-border flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="relative shrink-0">
            <StudentAvatar profile={profile} className="h-24 w-24 md:h-44 md:w-44 rounded-full border-4 border-background shadow-2xl" />
            <div className="absolute -bottom-2 -right-2 bg-primary h-8 w-8 md:h-12 md:w-12 rounded-full flex items-center justify-center text-white shadow-xl border-4 border-background"><ShieldCheck className="h-4 w-4 md:h-6 md:w-6" /></div>
          </div>
          <div className="flex-1 text-center md:text-left space-y-4 min-w-0">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-6xl font-black text-foreground tracking-tighter antialiased leading-none">{profile?.name || "Aspirant"}</h1>
              <p className="text-muted-foreground font-bold text-[10px] md:text-xs tracking-tight">{profile?.email}</p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <Badge className="bg-primary/10 text-primary border-none font-bold text-[10px] px-4 py-1.5 rounded-full">{profile?.pass?.plan || 'Free'} member</Badge>
              <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-500 font-bold text-[10px] px-4 py-1.5 rounded-full">Solved: {performance.totalAttempted}</Badge>
            </div>
          </div>
          <Button asChild className="h-14 md:h-16 px-10 bg-primary hover:bg-blue-700 text-white font-bold text-[11px] tracking-tight rounded-2xl shadow-xl transition-all border-none">
            <Link href="/profile">Edit profile <ChevronRight className="h-4 w-4 ml-2" /></Link>
          </Button>
        </motion.section>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
          <MetricPill label="Accuracy" val={`${performance.accuracy}%`} icon={<Target />} color="text-primary" progress={performance.accuracy} />
          <MetricPill label="Study time" val={displayTime} icon={<Clock />} color="text-emerald-500" />
          <MetricPill label="Solved questions" val={performance.totalCorrect.toLocaleString()} icon={<Trophy />} color="text-amber-500" />
          <MetricPill label="Total tests" val={sortedResults.length} icon={<CheckCircle2 />} color="text-indigo-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
          <div className="lg:col-span-8">
             <Card className="border-none shadow-xl rounded-[2.5rem] bg-card overflow-hidden border border-border">
                <CardHeader className="p-8 border-b border-border bg-muted/30 flex flex-row items-center justify-between">
                   <CardTitle className="text-xl font-black text-foreground flex items-center gap-3 tracking-tighter">
                      <History className="h-6 w-6 text-primary" /> Recent attempts
                   </CardTitle>
                   <Badge variant="outline" className="text-[8px] font-black uppercase">Live feed</Badge>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="divide-y divide-border">
                      {resultsLoading ? (
                         Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full bg-muted" />)
                      ) : sortedResults.length > 0 ? (
                         sortedResults.map((res: any) => (
                           <Link key={res.id} href={`/results/view?id=${res.mockId}&attemptId=${res.attemptId}`} className="flex items-center justify-between p-6 hover:bg-muted/50 transition-all group">
                              <div className="flex items-center gap-4 min-w-0">
                                 <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all shadow-inner"><Zap className="h-5 w-5" /></div>
                                 <div className="min-w-0">
                                    <p className="font-bold text-sm md:text-lg text-foreground truncate tracking-tight">{res.mockTitle}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                       <span className="text-[10px] font-bold text-muted-foreground tabular-nums">{new Date(res.timestamp).toLocaleDateString('en-GB')}</span>
                                       <Badge className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-500 border-none text-[8px] font-black px-2">Score: {res.score}</Badge>
                                    </div>
                                 </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground opacity-20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                           </Link>
                         ))
                      ) : (
                         <div className="py-24 flex flex-col items-center justify-center text-center opacity-30 italic">
                            <BarChart3 className="h-16 w-16 mb-4" />
                            <p className="text-sm font-bold">Analysis synchronizing...</p>
                         </div>
                      )}
                   </div>
                </CardContent>
             </Card>
          </div>
          <div className="lg:col-span-4">
             <Card className="border-none shadow-2xl rounded-[2.5rem] bg-[#0F172A] text-white p-8 md:p-10 space-y-8 relative overflow-hidden group border border-white/5">
                <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000"><Activity className="h-64 w-64 text-primary" /></div>
                <div className="relative z-10 space-y-8 text-left">
                   <div className="space-y-1">
                      <h3 className="text-2xl font-black tracking-tight leading-none">Milestones</h3>
                      <p className="text-[10px] font-bold text-slate-500 tracking-tight uppercase">Platform rewards</p>
                   </div>
                   <div className="space-y-6">
                      <p className="text-xs text-slate-400 font-medium">Practice daily to unlock achievement badges and state rank certificates. Your progress is verified daily.</p>
                   </div>
                   <div className="pt-6 border-t border-white/5">
                      <Button asChild className="w-full h-14 bg-primary hover:bg-blue-700 text-white font-bold text-[10px] tracking-tight shadow-2xl border-none transition-all active:scale-95">
                         <Link href="/leaderboard">Merit rankings <ArrowRight className="ml-2 h-4 w-4" /></Link>
                      </Button>
                   </div>
                </div>
             </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function MetricPill({ label, val, icon, color, progress }: any) {
  return (
    <motion.div whileHover={{ y: -4 }} className="p-5 md:p-8 bg-card rounded-[2rem] shadow-lg border border-border flex flex-col gap-4 text-left group transition-all duration-300 h-full">
      <div className={cn("h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center shadow-inner shrink-0 bg-slate-50 border border-slate-100", color)}>{React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: cn("h-5 w-5 md:h-6 md:w-6") }) : null}</div>
      <div className="space-y-0.5 min-w-0 w-full">
        <p className="text-xl md:text-3xl font-black text-foreground tabular-nums tracking-tighter leading-none truncate">{val}</p>
        <p className="text-[8px] md:text-[9px] font-black text-muted-foreground tracking-tight uppercase mt-1">{label}</p>
      </div>
      {progress !== undefined && <div className="h-1 w-full bg-muted rounded-full overflow-hidden mt-2"><div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progress}%` }} /></div>}
    </motion.div>
  );
}
