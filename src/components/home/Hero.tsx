
'use client';

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";

/**
 * @fileOverview High-Density Mobile-First Hero v37.0.
 * UPDATED: Zero-baseline aspirant count. Removed 15k fallback.
 */

export default function Hero() {
  const router = useRouter();
  const db = useFirestore();
  const [queryText, setQueryText] = useState("");
  const policeImage = "https://punjabpolice.gov.in/media/images/pp10.original.jpg";

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats } = useDoc<any>(statsRef);

  const liveAspirantCount = useMemo(() => {
    const count = stats?.totalUsers || 0;
    return count.toLocaleString();
  }, [stats]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (queryText.trim()) {
      router.push(`/search?q=${encodeURIComponent(queryText.trim())}`);
    }
  };

  return (
    <section className="relative pt-6 pb-10 md:pt-20 md:pb-32 bg-[#08152D] overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
         <div className="h-full w-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:30px_30px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-7xl text-left">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4 md:space-y-10"
          >
            <div className="space-y-2 md:space-y-6">
               <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                  <Sparkles className="h-2.5 w-2.5 text-primary" />
                  <span className="text-[7px] md:text-[10px] font-black text-primary uppercase tracking-widest">Punjab's No. 1 Prep Node</span>
               </div>
               <h1 className="text-3xl md:text-5xl lg:text-7xl font-headline font-black leading-[1.1] text-white uppercase tracking-tight">
                  CRACK EVERY <br/> <span className="text-primary">RECRUITMENT.</span>
               </h1>
               <p className="text-[13px] md:text-xl text-slate-400 font-medium max-w-lg leading-relaxed">
                  High-fidelity practice series for PSSSB, PPSC, Police, and Army. Updated pattern based preparation.
               </p>
            </div>

            <form onSubmit={handleSearch} className="relative group max-w-lg">
               <div className="relative flex items-center bg-white rounded-lg md:rounded-2xl p-1 shadow-2xl">
                  <Search className="absolute left-3 h-3.5 w-3.5 md:h-5 md:w-5 text-slate-400" />
                  <Input 
                    placeholder="Search Patwari, SI, Army..." 
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    className="h-10 md:h-16 pl-9 md:pl-12 pr-4 border-none text-xs md:text-lg font-medium text-[#0F172A] bg-transparent focus-visible:ring-0 w-full"
                  />
                  <Button 
                    type="submit"
                    className="h-8 md:h-13 px-4 md:px-8 bg-[#0F172A] text-white font-black uppercase text-[8px] md:text-[11px] tracking-widest rounded-md md:rounded-xl ml-1"
                  >
                    Search
                  </Button>
               </div>
            </form>

            <div className="flex flex-wrap gap-4 mt-6">
              <Button asChild className="bg-primary hover:bg-orange-600 text-white px-12 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] h-16 shadow-2xl shadow-primary/30 transition-all active:scale-95 border-none group">
                 <Link href="/exams">Start Practice <Zap className="ml-3 h-4 w-4 group-hover:scale-125 transition-transform" /></Link>
              </Button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-[4/3] w-full max-w-[600px] ml-auto">
               <div className="absolute -inset-10 bg-primary/10 blur-[100px] rounded-full opacity-50" />
               <div className="relative h-full w-full rounded-[3.5rem] overflow-hidden border-[10px] border-white/5 shadow-5xl bg-slate-800">
                  <img src={policeImage} alt="Hub" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08152D] via-transparent to-transparent opacity-40" />
               </div>
               <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-[2rem] shadow-3xl flex items-center gap-4 border border-slate-50">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg">
                     <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left pr-4">
                     <p className="text-[8px] font-black uppercase text-slate-400 leading-none mb-1">Live Success</p>
                     <p className="text-lg font-headline font-black text-[#0F172A] leading-none uppercase">{liveAspirantCount} Aspirants</p>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
