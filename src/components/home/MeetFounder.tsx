
'use client';

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Code, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * @fileOverview Professional Founder & Developer Hub v1.0.
 * Features: Circular image protocol, modern card architecture, and smooth hover nodes.
 */

export default function MeetFounder() {
  const founderImg = PlaceHolderImages.find(img => img.id === 'founder-arsh')?.imageUrl;

  return (
    <section className="py-24 md:py-32 bg-slate-50 overflow-hidden border-t border-slate-100">
      <div className="container mx-auto px-6 max-w-7xl text-center">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="space-y-4 mb-16"
        >
           <h2 className="text-4xl md:text-6xl font-headline font-black uppercase text-[#0F172A] tracking-tight">
              Meet the <span className="text-primary">Founder</span>
           </h2>
           <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white rounded-[3.5rem] md:rounded-[5rem] overflow-hidden shadow-5xl border border-slate-100 flex flex-col md:flex-row items-center p-8 md:p-16 gap-10 md:gap-20 group hover:shadow-6xl transition-all duration-500"
          >
            {/* CIRCULAR PROFILE IMAGE */}
            <div className="relative shrink-0">
               <div className="absolute -inset-4 bg-gradient-to-tr from-primary to-orange-400 rounded-full blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
               <div className="relative h-48 w-48 md:h-72 md:w-72 rounded-full overflow-hidden border-[8px] border-slate-50 shadow-2xl bg-[#0B1528]">
                  <img 
                    src={founderImg!} 
                    alt="Arsh Grewal" 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                       (e.target as HTMLImageElement).src = "https://picsum.photos/seed/arsh/400/400";
                    }}
                  />
               </div>
               <div className="absolute -bottom-2 -right-2 h-12 w-12 md:h-16 md:w-16 bg-emerald-500 rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-xl animate-bounce">
                  <ShieldCheck className="h-6 w-6 md:h-8 md:w-8" />
               </div>
            </div>

            {/* BIO CONTENT */}
            <div className="flex-1 space-y-6 md:space-y-8 text-center md:text-left">
               <div className="space-y-2">
                  <Badge className="bg-primary text-white border-none px-4 py-1.5 rounded-xl font-black uppercase text-[10px] tracking-widest mb-2 shadow-xl shadow-primary/20">Lead Developer</Badge>
                  <h3 className="text-3xl md:text-5xl font-headline font-black text-[#0F172A] uppercase leading-tight tracking-tight">Arsh Grewal</h3>
                  <p className="text-primary font-black uppercase tracking-[0.2em] text-xs md:text-sm">Founder of CRACKLIX</p>
               </div>
               
               <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed italic antialiased border-l-4 border-primary/20 pl-6">
                  "Founder and Lead Developer of CRACKLIX, focused on building a modern, fast, and reliable exam preparation platform for competitive exams. Dedicated to creating high-quality mock tests, PYQs, current affairs, analytics, and multilingual learning experiences for students."
               </p>

               <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4">
                  <Button asChild className="h-14 px-10 bg-[#0F172A] hover:bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl border-none">
                     <Link href="/about">Our Full Mission <ArrowRight className="ml-3 h-4 w-4 text-primary" /></Link>
                  </Button>
                  <div className="flex items-center gap-3 px-6 h-14 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 group-hover:text-primary transition-colors">
                     <Code className="h-5 w-5" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Platform Creator</span>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
