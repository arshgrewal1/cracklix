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
  Activity,
  ArrowRight,
  Sparkles,
  Search,
  LayoutGrid
} from "lucide-react";
import { useUser, useFirestore, useDoc } from "@/firebase";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { doc } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";

/**
 * @fileOverview Institutional Command Hero v90.0.
 * ALIGNED: Perfectly matched to the user wireframe.
 * INTEGRATED: Real-time Stats Registry and Dashboard Preview.
 */
export default function Hero() {
  const router = useRouter();
  const { user, profile } = useUser();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats } = useDoc<any>(statsRef);

  const accuracyIndex = useMemo(() => stats?.averageAccuracy || 94, [stats]);

  const handleAction = (path: string) => {
    if (!user) {
      router.push(`/login?returnUrl=${encodeURIComponent(path)}`);
      return;
    }
    router.push(path);
  };

  if (!mounted) return null;

  return (
    <section className="relative pt-10 pb-20 md:pt-16 md:pb-24 bg-[#0B1528] overflow-hidden text-left">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none select-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 items-center">
          
          {/* LEFT: WIREFRAME CONTENT */}
          <div className="lg:col-span-7 space-y-8 md:space-y-10">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl shadow-xl backdrop-blur-md"
            >
              <span className="text-[11px] md:text-sm font-black uppercase tracking-tight text-white flex items-center gap-2">
                🏆 Punjab's Smartest Exam Preparation Platform
              </span>
            </motion.div>

            <div className="space-y-6">
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.1 }}
                 className="space-y-2"
               >
                  <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px] md:text-xs ml-1">
                     Prepare for: PSSSB • Punjab Police • PPSC • PSTET • PSPCL • High Court
                  </p>
                  <h1 className="text-3xl md:text-6xl font-headline font-black leading-[1.1] tracking-tight text-white uppercase">
                     MASTER PUNJAB <br />
                     <span className="text-primary">GOVERNMENT EXAMS.</span>
                  </h1>
               </motion.div>

               <motion.p 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.2 }}
                 className="text-slate-400 text-base md:text-xl font-medium max-w-2xl leading-relaxed"
               >
                  Complete Preparation Hub with Full-Length Mocks, PYQs, Current Affairs, Analytics & Detailed Solutions.
               </motion.p>
            </div>

            {/* ACTION HUB */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="flex flex-col sm:flex-row items-center gap-6"
            >
              <Button 
                onClick={() => handleAction('/mocks')}
                className="w-full sm:w-auto bg-primary hover:bg-orange-600 h-16 md:h-20 px-10 md:px-12 rounded-2xl md:rounded-3xl font-black uppercase text-[11px] md:text-sm tracking-[0.2em] shadow-4xl shadow-primary/20 border-none transition-all active:scale-95 gap-4"
              >
                🚀 Start Free Mock
              </Button>
              <Button 
                onClick={() => handleAction('/exams')}
                className="w-full sm:w-auto bg-white hover:bg-slate-50 text-[#0B1528] h-16 md:h-20 px-10 md:px-12 rounded-2xl md:rounded-3xl font-black uppercase text-[11px] md:text-sm tracking-[0.2em] shadow-xl border-none transition-all active:scale-95 gap-3"
              >
                📚 Explore Exams
              </Button>
            </motion.div>
          </div>

          {/* RIGHT: DASHBOARD PREVIEW */}
          <div className="lg:col-span-5 relative">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.8, delay: 0.2 }}
               className="relative group"
             >
                {/* Visual Glass Container */}
                <div className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-[3rem] shadow-6xl backdrop-blur-md relative overflow-hidden z-10">
                   <div className="absolute top-0 right-0 p-8 opacity-5"><Zap className="h-40 w-40" /></div>
                   
                   {/* App Header Simulation */}
                   <div className="flex items-center justify-between mb-6 px-2">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                            <Activity className="h-5 w-5" />
                         </div>
                         <div className="text-left">
                            <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1">DASHBOARD</p>
                            <p className="text-[10px] font-black text-white uppercase tracking-tight">Active Session Preview</p>
                         </div>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[8px] font-black">ONLINE</Badge>
                   </div>

                   {/* Mock Performance Visual */}
                   <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-6 shadow-2xl border border-white/5">
                      <Image 
                         src="https://grppunjab.org/wp-content/uploads/2025/09/PP10_slider.jpg" 
                         fill 
                         className="object-cover opacity-80" 
                         alt="Police Exam Hub"
                         data-ai-hint="punjab police"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-6">
                         <h4 className="text-lg font-black text-white uppercase tracking-tight">PSSSB Excise Inspector</h4>
                         <p className="text-[8px] font-bold text-primary uppercase tracking-[0.3em]">Full Mock Series</p>
                      </div>
                   </div>

                   {/* Metrics Grid */}
                   <div className="grid grid-cols-2 gap-4">
                      <StatRow label="Readiness Score" val="82%" icon={<Zap className="text-primary" />} />
                      <StatRow label="Accuracy" val={`${accuracyIndex}%`} icon={<Target className="text-emerald-500" />} />
                      <StatRow label="Mock Rank" val="#245" icon={<Trophy className="text-amber-500" />} />
                      <StatRow label="Tests Attempted" val="156" icon={<Activity className="text-blue-500" />} />
                   </div>

                   <Button className="w-full mt-6 h-12 bg-white/10 hover:bg-white/20 text-white rounded-xl font-black uppercase text-[9px] tracking-widest border border-white/5 gap-3">
                      View Detailed Analytics <ArrowRight className="h-3 w-3 text-primary" />
                   </Button>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-6 -right-6 h-20 w-20 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                <div className="absolute -bottom-6 -left-6 h-24 w-24 bg-blue-500/10 blur-2xl rounded-full" />
             </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

function StatRow({ label, val, icon }: { label: string, val: string, icon: React.ReactNode }) {
   return (
      <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all">
         <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
               {React.cloneElement(icon as React.ReactElement, { className: "h-3.5 w-3.5" })}
            </div>
            <span className="text-[8px] font-black uppercase text-slate-500 tracking-tight leading-none text-left">{label}</span>
         </div>
         <span className="text-sm font-black text-white tabular-nums">{val}</span>
      </div>
   );
}
