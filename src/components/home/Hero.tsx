'use client';

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck,
  Zap,
  Search,
  ChevronRight,
  Target,
  Award,
  Users,
  GraduationCap,
  Star
} from "lucide-react";
import { useUser, useFirestore, useDoc } from "@/firebase";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { doc } from "firebase/firestore";

/**
 * @fileOverview Premium Hero Command Center v85.0.
 * OPTIMIZED: Accelerated Search UI with high-performance button placement.
 * FIXED: 'Explore Exams' button visibility with high-contrast theme.
 * INTEGRATION: Real-time student statistics from settings/stats registry.
 */
export default function Hero() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchTerm] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // REAL DATA LISTENERS
  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats } = useDoc<any>(statsRef);

  const studentCount = useMemo(() => {
     if (!mounted || !stats?.totalUsers) return "15,000+";
     return stats.totalUsers.toLocaleString() + "+";
  }, [stats, mounted]);

  const accuracyIndex = useMemo(() => {
     return stats?.averageAccuracy || 94;
  }, [stats]);

  const heroImage = "https://grppunjab.org/wp-content/uploads/2025/09/PP10_slider.jpg";

  const boards = [
    "PSSSB", "POLICE", "PPSC", "PSPCL", "PSTET", "CTET", "MASTER CADRE", "ETT CADRE"
  ];

  const handleAction = (path: string) => {
    if (!user) {
      router.push(`/login?returnUrl=${encodeURIComponent(path)}`);
      return;
    }
    router.push(path);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  if (!mounted) return null;

  return (
    <section className="relative pt-12 pb-24 md:pt-24 md:pb-32 bg-[#0B1528] overflow-hidden text-left">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[140px] rounded-full pointer-events-none opacity-50" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none opacity-30" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24 items-center">
          
          {/* LEFT: CONTENT NODE */}
          <div className="lg:col-span-7 space-y-10">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl shadow-2xl backdrop-blur-md"
            >
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-primary">Punjab's Smartest Exam Hub</span>
            </motion.div>

            <div className="space-y-8">
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.1 }}
                 className="space-y-4"
               >
                  <h1 className="text-3xl md:text-6xl lg:text-7xl font-headline font-black leading-[1.05] tracking-tight text-white uppercase">
                     ਤਿਆਰੀ ਪੰਜਾਬ ਦੀ, <br />
                     <span className="text-primary">ਸੁਪਨਾ ਸਰਕਾਰੀ ਅਫ਼ਸਰ ਦਾ!</span>
                  </h1>
                  <p className="text-slate-400 text-base md:text-xl font-medium max-w-xl leading-relaxed">
                     Master PSSSB, Police, PPSC, PSTET, PSPCL & Master Cadre with high-fidelity mocks and official patterns.
                  </p>
               </motion.div>
               
               {/* REGISTRY BADGES */}
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.2 }}
                 className="space-y-4"
               >
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-1">Official Verticals</p>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                     {boards.map((board) => (
                        <Badge key={board} variant="outline" className="bg-white/5 border-white/10 text-white hover:border-primary/50 hover:text-primary transition-all px-4 py-2 rounded-xl font-black text-[9px] md:text-[11px] uppercase tracking-widest shadow-sm">
                           {board}
                        </Badge>
                     ))}
                     <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary px-4 py-2 rounded-xl font-black text-[9px] md:text-[11px] uppercase tracking-widest">+ HUB</Badge>
                  </div>
               </motion.div>
            </div>

            {/* FAST SEARCH COMMAND HUB */}
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleSearch} 
              className="relative w-full max-w-2xl group"
            >
               <div className="relative flex items-center bg-white rounded-2xl md:rounded-[1.5rem] overflow-hidden p-1.5 shadow-6xl ring-8 ring-white/5">
                  <Search className="absolute left-6 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input 
                    value={searchQuery}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search tests or notes..." 
                    className="h-14 md:h-16 pl-14 border-none bg-transparent text-[#0F172A] font-bold text-base md:text-xl focus-visible:ring-0 placeholder:text-slate-400"
                  />
                  <Button type="submit" className="bg-[#0F172A] hover:bg-black text-white px-8 md:px-14 h-12 md:h-14 rounded-xl md:rounded-[1.2rem] font-black uppercase text-[10px] md:text-xs tracking-widest border-none ml-2 shadow-2xl active:scale-95 transition-all">
                     SEARCH
                  </Button>
               </div>
            </motion.form>

            {/* PRIMARY CTAS */}
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.4 }}
               className="pt-4 flex flex-col sm:flex-row items-center gap-6"
            >
              <Button 
                onClick={() => handleAction('/mocks')}
                className="w-full sm:w-auto bg-primary hover:bg-orange-600 transition-all font-black px-12 h-16 md:h-20 rounded-2xl md:rounded-3xl text-white flex items-center justify-center gap-4 shadow-4xl shadow-orange-500/20 uppercase text-[11px] md:text-sm tracking-[0.2em] border-none active:scale-95"
              >
                START PRACTICE <Zap className="h-6 w-6 fill-current" />
              </Button>
              <Button 
                onClick={() => handleAction('/exams')}
                className="w-full sm:w-auto bg-white hover:bg-slate-50 text-[#0B1528] h-16 md:h-20 px-12 rounded-2xl md:rounded-3xl font-black uppercase text-[11px] md:text-sm tracking-[0.2em] transition-all border-none active:scale-95 shadow-2xl"
              >
                EXPLORE EXAMS
              </Button>
            </motion.div>
          </div>

          {/* RIGHT: VISUAL HUB */}
          <div className="lg:col-span-5 relative">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.8, delay: 0.2 }}
               className="relative group"
             >
                {/* Visual Container */}
                <div className="relative aspect-[4/3] md:aspect-[16/11] rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-6xl border-[1px] border-white/10 bg-[#0F172A] z-10">
                   <Image 
                     src={heroImage} 
                     fill 
                     alt="Official Punjab Prep Node" 
                     className="object-cover opacity-90 transition-transform duration-[5s] group-hover:scale-105" 
                     priority
                     data-ai-hint="punjab recruitment"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                   
                   {/* STATUS BADGE */}
                   <div className="absolute top-8 left-8">
                      <div className="bg-black/40 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 shadow-4xl flex items-center gap-3">
                         <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-xl">
                            <ShieldCheck className="h-5 w-5" />
                         </div>
                         <p className="text-[10px] font-black text-white uppercase tracking-widest">Verified Content</p>
                      </div>
                   </div>

                   {/* LIVE STUDENTS CARD */}
                   <div className="absolute bottom-8 right-8">
                      <motion.div 
                         initial={{ x: 20, opacity: 0 }}
                         animate={{ x: 0, opacity: 1 }}
                         transition={{ delay: 1 }}
                         className="bg-white rounded-[2rem] p-6 flex items-center gap-4 shadow-6xl border border-white"
                      >
                         <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0 shadow-inner">
                            <Users className="h-6 w-6 text-primary" />
                         </div>
                         <div className="text-left pr-4">
                            <div className="flex items-center gap-1.5 mb-0.5">
                               <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                               <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Live Aspirants</p>
                            </div>
                            <p className="text-3xl font-headline font-black text-[#0B1528] leading-none tabular-nums">{studentCount}</p>
                            <p className="text-[8px] font-bold text-slate-500 uppercase mt-1 tracking-tight">Active Registries</p>
                         </div>
                      </motion.div>
                   </div>
                </div>

                {/* Floating Stats */}
                <div className="absolute -top-6 -right-6 h-20 w-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl z-[12] animate-in zoom-in duration-1000 delay-500">
                   <div className="flex flex-col items-center">
                      <span className="text-xs font-black text-primary">{accuracyIndex}%</span>
                      <Target className="h-5 w-5 text-primary" />
                   </div>
                </div>
                
                <div className="absolute -bottom-6 -left-6 h-24 w-24 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] flex items-center justify-center shadow-2xl z-[12] animate-in zoom-in duration-1000 delay-700">
                   <Award className="h-10 w-10 text-primary" />
                </div>
             </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
