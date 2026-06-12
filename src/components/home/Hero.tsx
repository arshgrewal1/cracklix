'use client';

import { motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Official Hero Hub v58.0.
 * FIXED: Synchronized heading text to strictly use "EXAM." and implemented stable mounting logic.
 */

export default function Hero() {
  const router = useRouter();
  const db = useFirestore();
  const [queryText, setQueryText] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const policeImage = PlaceHolderImages.find(img => img.id === 'hero-police')?.imageUrl || "https://punjabpolice.gov.in/media/images/pp10.original.jpg";

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats } = useDoc<any>(statsRef);

  const liveStudentCount = useMemo(() => {
    if (!mounted || !stats) return "---";
    const count = stats?.totalUsers || 0;
    if (count > 999) return `${(count / 1000).toFixed(1)}k+`;
    return count.toLocaleString();
  }, [stats, mounted]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (queryText.trim()) {
      router.push(`/search?q=${encodeURIComponent(queryText.trim())}`);
    }
  };

  return (
    <section className="relative pt-8 pb-12 md:pt-20 md:pb-32 bg-[#08152D] overflow-hidden min-h-[600px] flex items-center">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
         <div className="h-full w-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:30px_30px]" />
      </div>

      <div className="container mx-auto px-4 relative z-20 max-w-7xl text-left">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 items-center">
          
          <div className="space-y-6 md:space-y-10">
            <div className="space-y-4 md:space-y-6">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-widest">Punjab's No. 1 Study Center</span>
               </div>
               
               <div className="min-h-[60px] md:min-h-[140px]">
                  <h1 className="text-3xl sm:text-5xl lg:text-7xl font-headline font-black leading-[1.1] text-white uppercase tracking-tight break-words">
                     CRACK EVERY <br className="hidden sm:block" /> <span className="text-primary">EXAM.</span>
                  </h1>
               </div>

               <p className="text-sm md:text-xl text-slate-400 font-medium max-w-lg leading-relaxed">
                  The most trusted practice tests for PSSSB, PPSC, Police, and Army. Latest pattern based study plans for guaranteed success.
               </p>
            </div>

            <form onSubmit={handleSearch} className="relative group max-w-lg">
               <div className="relative flex items-center bg-white rounded-xl md:rounded-2xl p-1.5 shadow-2xl">
                  <Search className="absolute left-4 h-4 w-4 md:h-5 md:w-5 text-slate-400" />
                  <Input 
                    placeholder="Search Patwari, SI, Army..." 
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    className="h-11 md:h-16 pl-10 md:pl-12 pr-4 border-none text-[13px] md:text-lg font-medium text-[#0F172A] bg-transparent focus-visible:ring-0 w-full"
                  />
                  <Button 
                    type="submit"
                    className="h-9 md:h-13 px-5 md:px-8 bg-[#0F172A] text-white font-black uppercase text-[9px] md:text-[11px] tracking-widest rounded-lg md:rounded-xl ml-1 shrink-0"
                  >
                    Search
                  </Button>
               </div>
            </form>

            <div className="flex flex-wrap gap-4 mt-8">
              <Button asChild className="bg-primary hover:bg-orange-600 text-white px-8 md:px-12 rounded-xl font-black uppercase tracking-[0.1em] text-[10px] md:text-[11px] h-14 md:h-16 shadow-2xl transition-all active:scale-95 border-none group">
                 <Link href="/exams" className="flex items-center justify-center gap-3">START PRACTICE <Zap className="h-4 w-4 fill-current" /></Link>
              </Button>
            </div>
          </div>

          <div className="relative w-full block">
            <div className="relative aspect-video sm:aspect-[4/3] w-full max-w-[620px] lg:ml-auto mx-auto mt-10 lg:mt-0">
               <div className="absolute -inset-6 md:-inset-10 bg-primary/10 blur-[100px] rounded-full opacity-50" />
               
               <div className="relative h-full w-full rounded-[2rem] md:rounded-[3.5rem] overflow-hidden border-[4px] md:border-[10px] border-white/5 shadow-5xl bg-slate-800 group">
                  <img 
                    src={policeImage} 
                    alt="Punjab Police Preparation" 
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" 
                    referrerPolicy="no-referrer"
                    data-ai-hint="punjab police"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08152D] via-transparent to-transparent opacity-60" />
                  
                  <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8 flex items-center justify-between">
                     <div className="bg-white/30 backdrop-blur-xl px-4 py-2 md:px-6 md:py-4 rounded-xl md:rounded-2xl border border-white/20 shadow-2xl flex items-center gap-3 md:gap-4">
                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-primary flex items-center justify-center shadow-lg">
                           <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-white" />
                        </div>
                        <div className="text-left">
                           <p className="text-[7px] md:text-[8px] font-black uppercase text-white leading-none mb-1">Official Hub</p>
                           <p className="text-sm md:text-lg font-black text-white leading-none uppercase">VERIFIED CONTENT</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="absolute -bottom-4 -right-2 md:-bottom-6 md:-right-6 bg-white p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-3xl flex items-center gap-3 md:gap-4 border border-slate-50">
                  <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
                     <Zap className="h-5 w-5 md:h-7 md:w-7 text-primary fill-current" />
                  </div>
                  <div className="text-left md:pr-4">
                     <p className="text-[7px] md:text-[9px] font-black uppercase text-slate-400 leading-none mb-1 md:mb-1.5">Live Students</p>
                     <p className="text-lg md:text-2xl font-headline font-black text-[#0F172A] leading-none uppercase">
                        {mounted ? liveStudentCount : "---"}
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
