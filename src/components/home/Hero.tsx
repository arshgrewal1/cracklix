'use client';

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck,
  Zap,
  Target,
  Trophy,
  Users,
  ArrowRight,
  BookOpen,
  ClipboardList,
  TrendingUp,
  Globe,
  FileStack
} from "lucide-react";
import { useUser, useFirestore, useDoc } from "@/firebase";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { doc } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

/**
 * @fileOverview High-Fidelity Institutional Hero v146.0 (Locked).
 * MATCHED: Strictly aligned with the reference (ibb.co/F4D0JLHP).
 * Features: Background image hub, floating readiness node, and real-time stats integration.
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

  return (
    <section className="relative pt-12 pb-16 md:pt-24 md:pb-36 bg-[#0B1528] overflow-hidden text-left">
      {/* BACKGROUND IMAGE HUB - LOCKED TO OFFICIAL PUNJAB POLICE SLIDER */}
      <div className="absolute inset-0 z-0">
         <Image 
           src="https://grppunjab.org/wp-content/uploads/2025/09/PP10_slider.jpg" 
           fill 
           className="object-cover opacity-30 grayscale-[0.2]" 
           alt="Punjab Police Institutional Background"
           priority
         />
         <div className="absolute inset-0 bg-gradient-to-r from-[#0B1528] via-[#0B1528]/95 to-transparent" />
         <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT: COMMAND CONTENT */}
          <div className="lg:col-span-8 space-y-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              {/* Trust Badge */}
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full w-fit backdrop-blur-md">
                <div className="h-5 w-5 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                   <Trophy className="h-3 w-3 text-white fill-current" />
                </div>
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white/80">
                  Punjab's #1 Exam Preparation Hub
                </span>
              </div>

              {/* Master Headline - Matched to Design */}
              <div className="space-y-4">
                 <h1 className="text-4xl md:text-8xl font-headline font-black leading-[0.95] tracking-tight text-white uppercase">
                    Prepare For Punjab <br />
                    <span className="text-primary">Government Exams</span>
                 </h1>
                 <p className="text-slate-400 text-sm md:text-xl font-medium max-w-2xl leading-relaxed antialiased">
                    Master PSSSB, Punjab Police, PPSC, PSTET, and PSPCL with high-fidelity mocks and AI logic rationalizations.
                 </p>
              </div>

              {/* Functional Feature Tags */}
              <div className="flex flex-wrap gap-4">
                 <FeatureTag icon={<ClipboardList className="text-primary" />} label="Full-Length Mocks" />
                 <FeatureTag icon={<FileStack className="text-primary" />} label="Official PYQs" />
                 <FeatureTag icon={<Globe className="text-primary" />} label="Daily News Hub" />
                 <FeatureTag icon={<ShieldCheck className="text-primary" />} label="Detailed Logic" />
              </div>
            </motion.div>

            {/* Tactical Action Nodes */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Button 
                onClick={() => handleAction('/mocks')}
                className="w-full sm:w-auto h-16 md:h-20 px-12 bg-primary hover:bg-orange-600 text-white rounded-[1.5rem] md:rounded-[2rem] font-black uppercase text-[12px] md:text-[14px] tracking-[0.2em] shadow-3xl shadow-primary/20 border-none transition-all active:scale-95 gap-4"
              >
                Start Free Mock <ArrowRight className="h-5 w-5" />
              </Button>
              <Button 
                onClick={() => handleAction('/exams')}
                className="w-full sm:w-auto h-16 md:h-20 px-12 rounded-[1.5rem] md:rounded-[2rem] border-2 border-white/20 bg-white/5 text-white hover:bg-white/10 font-black uppercase text-[12px] md:text-[14px] tracking-[0.2em] transition-all active:scale-95 gap-4"
              >
                Explore Hubs <ArrowRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Hot Exams Quick Links (Trending) */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
               <span className="text-[10px] font-black uppercase text-primary tracking-widest">Hot Exams:</span>
               {['PSSSB Patwari', 'Punjab Police SI', 'PSTET Hub', 'Master Cadre', 'Excise'].map((t) => (
                  <Link key={t} href={`/search?q=${t}`}>
                    <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-400 hover:text-white hover:border-white/30 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer shadow-sm">
                       {t}
                    </Badge>
                  </Link>
               ))}
            </div>
          </div>

          {/* RIGHT: FLOATING READINESS HUB (Matched to ibb.co/F4D0JLHP) */}
          <div className="lg:col-span-4 relative hidden lg:block">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-[#1A2333]/90 backdrop-blur-2xl rounded-[3rem] p-10 border border-white/10 shadow-5xl relative overflow-hidden group"
             >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000"><Zap className="h-40 w-40" /></div>
                
                <div className="relative z-10 text-center space-y-8">
                   <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Exam Readiness</h3>
                   
                   <div className="relative h-44 w-44 mx-auto flex items-center justify-center">
                      <svg className="h-full w-full transform -rotate-90">
                         <circle cx="88" cy="88" r="78" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                         <circle cx="88" cy="88" r="78" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="490" strokeDashoffset={490 - (490 * 0.82)} className="text-emerald-500 shadow-xl" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-6xl font-headline font-black text-white leading-none">82%</span>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <p className="text-emerald-400 font-black uppercase text-[10px] tracking-[0.3em]">Mastery Increasing</p>
                      <div className="bg-white/5 rounded-2xl py-3 px-6 inline-flex items-center gap-2 border border-white/5">
                         <TrendingUp className="h-4 w-4 text-emerald-500" />
                         <span className="text-xs font-bold text-white">12% growth this week</span>
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>
        </div>

        {/* BOTTOM STATS STRIP (Matched to ibb.co/F4D0JLHP bottom part) */}
        <div className="mt-20 md:mt-32 bg-[#0F172A] rounded-[2rem] md:rounded-[3rem] border border-white/5 shadow-5xl overflow-hidden p-6 md:p-12">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              <LegacyStatNode 
                label="Questions" 
                val={`${stats?.totalQuestions?.toLocaleString() || '50,000'}+`} 
                icon={<BookOpen />} 
                color="bg-blue-600" 
              />
              <LegacyStatNode 
                label="Mock Tests" 
                val={`${stats?.totalMocks || '500'}+`} 
                icon={<Zap />} 
                color="bg-emerald-600" 
              />
              <LegacyStatNode 
                label="Live Aspirants" 
                val={`${stats?.totalUsers?.toLocaleString() || '15,000'}+`} 
                icon={<Users />} 
                color="bg-orange-600" 
              />
              <LegacyStatNode 
                label="Accuracy" 
                val={`${stats?.averageAccuracy || '94'}%`} 
                icon={<ShieldCheck />} 
                color="bg-purple-600" 
              />
           </div>
        </div>
      </div>
    </section>
  );
}

function FeatureTag({ icon, label }: any) {
   return (
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-slate-300 transition-all hover:border-primary/40 hover:bg-white/10">
         {icon}
         <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
   )
}

function LegacyStatNode({ label, val, icon, color }: any) {
   return (
      <div className="flex items-center gap-4 md:gap-8 text-left group">
         <div className={cn("h-12 w-12 md:h-16 md:w-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-110", color)}>
            {icon && Object.assign({}, icon, { props: { className: "h-6 w-6 md:h-8 md:w-8 text-white" } })}
         </div>
         <div>
            <p className="text-2xl md:text-4xl font-headline font-black text-white tabular-nums leading-none tracking-tight">{val}</p>
            <p className="text-[9px] md:text-[11px] font-black uppercase text-slate-500 tracking-widest mt-2">{label}</p>
         </div>
      </div>
   )
}
