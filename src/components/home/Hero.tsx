'use client';

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck,
  Zap,
  Search,
  ChevronRight
} from "lucide-react";
import { useUser } from "@/firebase";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

/**
 * @fileOverview High-Fidelity Hero Restoration v60.0.
 * STYLED: Perfectly matched to user-provided screenshot reference.
 * FEATURES: Integrated search node, large orange CTA, and Police visual hub.
 */
export default function Hero() {
  const router = useRouter();
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchTerm] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-police')?.imageUrl || "https://punjabpolice.gov.in/media/images/pp10.original.jpg";

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
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 bg-[#0B1528] overflow-hidden text-left">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 items-center">
          
          {/* LEFT: CONTENT HUB */}
          <div className="lg:col-span-6 space-y-8 md:space-y-12">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full shadow-2xl">
              <Zap className="h-3 w-3 text-primary fill-current" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-primary">PUNJAB&apos;S NO. 1 STUDY CENTER</span>
            </div>

            <div className="space-y-6">
               <h1 className="text-[3.5rem] md:text-[6rem] font-black leading-[0.9] tracking-tighter uppercase text-white flex flex-col">
                  <span>CRACK EVERY</span>
                  <span className="text-primary">EXAM.</span>
               </h1>
               <p className="text-lg md:text-2xl font-medium text-slate-400 max-w-xl leading-relaxed">
                  The most trusted practice tests for PSSSB, PPSC, Police, and Army. Latest pattern based study plans for guaranteed success.
               </p>
            </div>

            {/* INTEGRATED SEARCH HUB */}
            <form onSubmit={handleSearch} className="relative w-full max-w-xl group">
               <div className="relative flex items-center bg-white rounded-2xl md:rounded-[1.5rem] overflow-hidden p-1 shadow-2xl">
                  <Search className="absolute left-6 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <Input 
                    value={searchQuery}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search Patwari, SI, Army..." 
                    className="h-14 md:h-16 pl-14 border-none bg-transparent text-slate-900 font-bold text-base md:text-lg focus-visible:ring-0 placeholder:text-slate-400"
                  />
                  <Button type="submit" className="bg-[#0B1528] hover:bg-black text-white px-8 md:px-12 h-12 md:h-14 rounded-xl md:rounded-lg font-black uppercase text-[10px] md:text-xs tracking-widest border-none ml-2">
                     SEARCH
                  </Button>
               </div>
            </form>

            <div className="pt-4">
              <Button 
                onClick={() => handleAction('/mocks')}
                className="bg-primary hover:bg-orange-600 transition-all font-black px-12 h-16 md:h-20 rounded-2xl text-white flex items-center justify-center gap-4 shadow-4xl uppercase text-[11px] md:text-sm tracking-[0.2em] border-none active:scale-95"
              >
                START PRACTICE <Zap className="h-5 w-5 fill-current" />
              </Button>
            </div>
          </div>

          {/* RIGHT: VISUAL HUB */}
          <div className="lg:col-span-6 relative group">
             <div className="relative aspect-[4/3] md:aspect-[16/11] rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-5xl border-[8px] border-white/5 bg-[#0F172A]">
                <Image 
                  src={heroImage} 
                  fill 
                  alt="Punjab Police Official Hub" 
                  className="object-cover opacity-90 transition-transform duration-[3s] group-hover:scale-105" 
                  priority
                  data-ai-hint="punjab police officers"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                
                {/* STATUS OVERLAY */}
                <div className="absolute bottom-10 left-10">
                   <div className="bg-black/30 backdrop-blur-xl px-8 py-5 rounded-[2rem] border border-white/10 shadow-4xl flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl">
                         <ShieldCheck className="h-7 w-7" />
                      </div>
                      <div className="text-left">
                         <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-0.5">OFFICIAL HUB</p>
                         <p className="text-xl font-black text-white uppercase tracking-tight">VERIFIED CONTENT</p>
                      </div>
                   </div>
                </div>

                {/* LIVE STUDENT OVERLAY */}
                <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 animate-in fade-in zoom-in duration-700">
                   <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 flex items-center gap-6 shadow-5xl border border-white shadow-orange-500/10">
                      <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
                         <Zap className="h-6 w-6 md:h-8 md:w-8 text-primary fill-current" />
                      </div>
                      <div className="text-left pr-4">
                         <p className="text-[9px] md:text-[11px] font-black uppercase text-slate-400 tracking-widest mb-1">LIVE STUDENTS</p>
                         <p className="text-3xl md:text-5xl font-black text-[#0B1528] leading-none tabular-nums">5</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Background Decoration */}
             <div className="absolute -inset-10 bg-primary/10 blur-[120px] rounded-full -z-10 opacity-30 pointer-events-none" />
          </div>

        </div>
      </div>
    </section>
  );
}
