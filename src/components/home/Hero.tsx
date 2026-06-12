'use client';

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  ShieldCheck,
  Star,
  Download,
  ArrowRight
} from "lucide-react";
import { useUser } from "@/firebase";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

/**
 * @fileOverview Official Punjab Police Restoration v50.0.
 * RESTORED: High-impact dark-navy theme with massive Punjabi headline.
 */
export default function Hero() {
  const router = useRouter();
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleInstallable = () => setCanInstall(true);
    window.addEventListener('pwa-installable', handleInstallable);
    return () => window.removeEventListener('pwa-installable', handleInstallable);
  }, []);

  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-police')?.imageUrl || "https://picsum.photos/seed/police/1200/800";

  const handleAction = (path: string) => {
    if (!user) {
      router.push(`/login?returnUrl=${encodeURIComponent(path)}`);
      return;
    }
    router.push(path);
  };

  const handleInstall = () => {
    const prompt = (window as any).deferredPrompt;
    if (prompt) prompt.prompt();
  };

  return (
    <section className="relative pt-12 pb-16 md:pt-24 md:pb-32 bg-[#0B1528] overflow-hidden text-left min-h-[85vh] flex items-center">
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 items-center">
          
          {/* LEFT: CONTENT HUB */}
          <div className="lg:col-span-7 space-y-8 md:space-y-12">
            <motion.div 
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2.5 rounded-full text-[10px] md:text-xs font-black tracking-tight text-white shadow-2xl"
            >
              <Star className="h-4 w-4 text-primary fill-current" />
              <span className="tracking-[0.2em] uppercase">PUNJAB&apos;S NO.1 STUDY HUB</span>
            </motion.div>

            <div className="space-y-6">
               <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[3.5rem] sm:text-[5rem] md:text-[8rem] font-black leading-[0.85] tracking-tighter uppercase text-white flex flex-col"
               >
                  <span>ਤਿਆਰੀ ਪੰਜਾਬ ਦੀ,</span>
                  <span className="text-primary">ਸੁਪਨਾ ਸਰਕਾਰੀ</span>
                  <span className="text-primary">ਅਫ਼ਸਰ ਦਾ!</span>
               </motion.h1>
               <p className="text-lg md:text-2xl font-bold text-slate-400 uppercase tracking-tight max-w-2xl">
                  CRACK PSSSB, POLICE, PSPCL, PSTET, CTET, ETT & MASTER CADRE
               </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                onClick={() => handleAction('/mocks')}
                className="bg-primary hover:bg-orange-600 transition-all font-black px-12 h-16 md:h-20 rounded-2xl text-white flex items-center justify-center gap-4 shadow-3xl uppercase text-[11px] tracking-[0.2em] border-none active:scale-95"
              >
                🚀 Start Free Mock
              </Button>
              
              {mounted && canInstall && (
                <Button 
                  onClick={handleInstall}
                  className="bg-emerald-600 hover:bg-emerald-700 transition-all font-black px-10 h-16 md:h-20 rounded-2xl text-white flex items-center justify-center gap-4 shadow-3xl uppercase text-[11px] tracking-[0.2em] border-none active:scale-95 group"
                >
                  <Download className="h-5 w-5" /> INSTALL APP
                </Button>
              )}

              {!canInstall && (
                 <Button 
                  onClick={() => handleAction('/exams')}
                  className="border-2 border-white/10 hover:border-primary/20 bg-white/5 text-white font-black px-10 h-16 md:h-20 rounded-2xl transition-all uppercase text-[11px] tracking-[0.2em] shadow-xl gap-3 active:scale-95"
                >
                  <Trophy className="h-5 w-5 text-primary" /> Explore Exams
                </Button>
              )}
            </div>
          </div>

          {/* RIGHT: POLICE VISUAL HUB */}
          <div className="lg:col-span-5 relative group">
             <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.8 }}
               className="relative aspect-[4/5] rounded-[3.5rem] md:rounded-[5rem] overflow-hidden shadow-5xl border-[12px] border-white/5 bg-[#0F172A]"
             >
                <Image 
                  src={heroImage} 
                  fill 
                  alt="Punjab Police Hub" 
                  className="object-cover opacity-80 transition-transform duration-[3s] group-hover:scale-110" 
                  priority
                  data-ai-hint="punjab police"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-transparent to-transparent opacity-60" />
                
                {/* Floating Trust Badge */}
                <div className="absolute bottom-10 left-8 right-8">
                   <div className="bg-white/10 backdrop-blur-xl px-8 py-6 rounded-[2rem] border border-white/10 shadow-4xl group-hover:bg-white/15 transition-all">
                      <div className="flex items-center gap-4">
                         <ShieldCheck className="h-10 w-10 text-primary" />
                         <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Live Status</p>
                            <p className="text-2xl font-black text-white leading-none">15,000+ Selections</p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Regional Badge */}
                <div className="absolute top-10 right-8">
                   <div className="bg-primary p-4 rounded-[1.5rem] shadow-2xl flex flex-col items-center gap-1 border-4 border-[#0B1528] scale-110">
                      <Trophy className="h-6 w-6 text-white fill-current" />
                      <span className="text-[10px] font-black text-white uppercase leading-none">RANK 1</span>
                   </div>
                </div>
             </motion.div>

             {/* Background Decoration */}
             <div className="absolute -inset-10 bg-primary/5 blur-[100px] rounded-full -z-10 opacity-50" />
          </div>

        </div>
      </div>
    </section>
  );
}