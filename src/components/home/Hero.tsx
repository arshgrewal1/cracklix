'use client';

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck,
  Zap,
  Target,
  TrendingUp,
  Award,
  Lock,
  Play,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Gem,
  Smartphone,
  Globe,
  FileStack
} from "lucide-react";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { useState, useEffect, useMemo } from "react";
import { doc } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Elite Institutional Hero Hub v200.0.
 * DESIGN: High-converting command center matching provided reference.
 * TARGET: PSSSB, Police, PPSC, PSPCL, PSTET, CTET, ETT.
 */
export default function Hero() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats } = useDoc<any>(statsRef);

  const handleAction = (path: string) => {
    if (!user) {
      router.push(`/login?returnUrl=${encodeURIComponent(path)}`);
      return;
    }
    router.push(path);
  };

  if (!mounted) return null;

  const heroImageUrl = "https://i.ibb.co/gZCGMQNJ/IMG-20260612-WA0010.jpg";

  return (
    <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 bg-[#0B1528] overflow-hidden text-left">
      {/* BACKGROUND ATMOSPHERE */}
      <div className="absolute inset-0 z-0">
         <Image 
            src={heroImageUrl}
            alt="Punjab Exam Hub"
            fill
            className="object-cover opacity-20 grayscale-[0.3]"
            priority
         />
         <div className="absolute inset-0 bg-gradient-to-r from-[#0B1528] via-[#0B1528]/95 to-transparent" />
         <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* LEFT: COMMAND CONTENT */}
          <div className="lg:col-span-7 space-y-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 md:space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-4">
                 <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                 <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-primary">🏆 Punjab's Most Trusted Preparation Hub</span>
              </div>

              <div className="space-y-4 md:space-y-6">
                 <h1 className="text-4xl md:text-7xl font-headline font-black leading-[0.9] tracking-tighter text-white uppercase">
                    Master Punjab <br />
                    <span className="text-primary italic">Government Exams.</span>
                 </h1>
                 <p className="text-slate-400 text-base md:text-xl font-medium max-w-2xl leading-relaxed antialiased">
                    Unlock your selection potential with institutional-grade mock tests, verified exam patterns, and AI-powered logic solutions.
                 </p>
              </div>

              {/* TACTICAL EXAM REGISTRY CHIPS */}
              <div className="flex flex-wrap gap-2.5">
                 {['PSSSB', 'POLICE', 'PPSC', 'PSPCL', 'PSTET', 'CTET', 'ETT', 'MASTER CADRE'].map((board) => (
                    <div key={board} className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-black text-[10px] tracking-widest hover:border-primary/50 transition-all cursor-default">
                       {board}
                    </div>
                 ))}
              </div>
            </motion.div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Button 
                onClick={() => handleAction('/mocks')}
                className="w-full sm:w-auto h-16 md:h-20 px-12 bg-primary hover:bg-orange-600 text-white rounded-[1.5rem] md:rounded-[2.5rem] font-black uppercase text-[12px] md:text-[14px] tracking-[0.2em] shadow-3xl shadow-primary/20 border-none transition-all active:scale-95 gap-4"
              >
                Start Free Mock <Zap className="h-5 w-5 fill-current" />
              </Button>
              <Button 
                onClick={() => handleAction('/pass')}
                className="w-full sm:w-auto h-16 md:h-20 px-12 rounded-[1.5rem] md:rounded-[2.5rem] bg-white/5 text-white hover:bg-white/10 font-black uppercase text-[12px] md:text-[14px] tracking-[0.2em] transition-all active:scale-95 gap-4 border border-white/10 backdrop-blur-xl"
              >
                <Gem className="h-5 w-5 text-primary" /> Unlock Elite Pass
              </Button>
            </div>

            {/* MOST ATTEMPTED THIS WEEK */}
            <div className="pt-8 border-t border-white/5 space-y-4">
               <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">MOST ATTEMPTED THIS WEEK</span>
               </div>
               <div className="flex flex-wrap gap-4">
                  {['Revenue Patwari Mock', 'Police SI Prep', 'PSPCL Clerk Series', 'Master Cadre Hub'].map((exam) => (
                     <Link key={exam} href="/mocks" className="text-[11px] font-bold text-slate-300 hover:text-primary transition-all flex items-center gap-2 group">
                        {exam} <ChevronRight className="h-3 w-3 text-slate-600 group-hover:translate-x-1 transition-transform" />
                     </Link>
                  ))}
               </div>
            </div>
          </div>

          {/* RIGHT: READINESS DASHBOARD VISUALIZATION */}
          <div className="lg:col-span-5 relative">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="relative"
             >
                {/* Dashboard Aura */}
                <div className="absolute -inset-2 bg-gradient-to-br from-primary/20 to-blue-500/10 rounded-[4rem] blur-3xl opacity-50" />
                
                <div className="relative bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-10 md:p-12 space-y-10 shadow-5xl overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-5"><Target className="h-64 w-64" /></div>
                   
                   <div className="flex items-center justify-between relative z-10">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black uppercase text-primary tracking-widest leading-none">PREPARATION AUDIT</p>
                         <h3 className="text-xl font-headline font-black text-white uppercase">Selection Hub</h3>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-4 py-1 font-black uppercase text-[10px]">Live Data</Badge>
                   </div>
                   
                   {/* READINESS GAUGE */}
                   <div className="flex items-center gap-10 relative z-10">
                      <div className="relative h-32 w-32 md:h-40 md:w-40 flex items-center justify-center">
                         <svg className="h-full w-full transform -rotate-90">
                            <circle cx="50%" cy="50%" r="45%" className="stroke-white/5 fill-none" strokeWidth="10" />
                            <circle cx="50%" cy="50%" r="45%" className="stroke-primary fill-none transition-all duration-1000" strokeWidth="10" strokeDasharray="283" strokeDashoffset="50" strokeLinecap="round" />
                         </svg>
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl md:text-5xl font-headline font-black text-white tracking-tighter">82%</span>
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">READINESS</span>
                         </div>
                      </div>
                      <div className="space-y-6 flex-1">
                         <DashboardMetric label="AVG ACCURACY" val="94%" icon={<Target className="text-emerald-400" />} />
                         <DashboardMetric label="PUNJAB RANK" val="#12" icon={<Award className="text-amber-400" />} />
                         <DashboardMetric label="DAILY STREAK" val="8 Days" icon={<Zap className="text-primary" />} />
                      </div>
                   </div>

                   {/* VERIFIED STATUS */}
                   <div className="pt-8 border-t border-white/10 relative z-10">
                      <div className="grid grid-cols-1 gap-4">
                         <FeatureNode icon={<CheckCircle2 className="text-emerald-500" />} label="Pattern Verified Content" />
                         <FeatureNode icon={<Zap className="text-primary" />} label="AI Step-by-Step Solutions" />
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>
        </div>

        {/* BOTTOM PREMIUM FEATURES STRIP */}
        <div className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
           <FeatureStripNode icon={<Globe />} label="Full Bilingual Support" />
           <FeatureStripNode icon={<Award />} label="Real-Time State Merit" />
           <FeatureStripNode icon={<FileStack />} label="Official PYQ Hub" />
           <FeatureStripNode icon={<Smartphone />} label="Advanced Mobile Interface" />
        </div>
      </div>
    </section>
  );
}

function DashboardMetric({ label, val, icon }: any) {
   return (
      <div className="flex items-center gap-4 group">
         <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-white/10 transition-all shadow-inner">
            {React.cloneElement(icon, { className: "h-4 w-4" })}
         </div>
         <div className="text-left">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{label}</p>
            <p className="text-base font-black text-white leading-none tracking-tight">{val}</p>
         </div>
      </div>
   )
}

function FeatureNode({ icon, label }: any) {
   return (
      <div className="flex items-center gap-4 px-5 py-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-default group">
         <div className="shrink-0 group-hover:scale-110 transition-transform">
            {React.cloneElement(icon, { className: "h-5 w-5" })}
         </div>
         <span className="text-[10px] md:text-xs font-black uppercase tracking-tight text-slate-400 group-hover:text-white transition-colors">{label}</span>
      </div>
   )
}

function FeatureStripNode({ icon, label }: any) {
   return (
      <div className="flex flex-col items-center md:flex-row gap-4 p-6 bg-white/5 border border-white/5 rounded-[2.5rem] hover:bg-white/10 transition-all cursor-default group shadow-inner">
         <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-xl">
            {React.cloneElement(icon, { className: "h-5 w-5 md:h-6 md:w-6" })}
         </div>
         <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors text-center md:text-left">{label}</span>
      </div>
   )
}
