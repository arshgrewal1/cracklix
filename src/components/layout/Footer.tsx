"use client";

import Link from "next/link";
import Logo from "@/components/brand/Logo";
import { Send, MapPin, ShieldCheck, Share2 } from "lucide-react";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";

/**
 * @fileOverview Final Screenshot-Matched Footer Hub v10.0.
 * MATCHED: Left-aligned brand info, 3-column link grid, and centered bottom credits.
 * MATCHED: Large Orange Phone Number (+91 98881 88602) in the Connect section.
 */
export default function Footer() {
  const db = useFirestore();
  const settingsRef = useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]);
  const { data: settings } = useDoc<any>(settingsRef);

  const content = {
    description: settings?.footerText || "Punjab's most advanced government exam portal.",
    phone: settings?.supportPhone || "+91 98881 88602",
    address: settings?.address || "HQs: Shergarh, Bathinda, Punjab",
    tg: settings?.telegramUrl || "https://t.me/cracklixapp"
  };

  return (
    <footer className="bg-[#050B19] text-white pt-20 pb-12 border-t border-white/5 font-body text-left">
      <div className="container mx-auto px-6 max-w-7xl">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 mb-20">
          
          {/* 1. BRAND HUB (LEFT) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="h-12 flex items-center">
               <Logo imgClassName="h-full" />
            </div>
            
            <p className="text-slate-400 text-lg md:text-xl font-medium max-w-sm leading-relaxed">
               {content.description}
            </p>

            <div className="space-y-4">
               <div className="flex items-center gap-3 text-primary">
                  <MapPin className="h-4 w-4" />
                  <span className="text-[11px] font-black uppercase tracking-widest">{content.address}</span>
               </div>
               <div className="flex items-center gap-3 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Institutional Registry Verified</span>
               </div>
            </div>

            <Button className="h-14 px-10 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 font-black uppercase text-[10px] tracking-widest gap-3 shadow-xl mt-4">
               <Share2 className="h-4 w-4 text-primary" /> SHARE CRACKLIX
            </Button>
          </div>

          {/* 2. LINK NODES (RIGHT) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-6">
            
            <div className="space-y-6">
              <h4 className="font-black text-[11px] uppercase tracking-[0.3em] text-slate-500">EXAM VERTICALS</h4>
              <ul className="space-y-4 text-slate-300 font-bold text-[13px] uppercase tracking-tight">
                <li><Link href="/exams" className="hover:text-primary transition-colors">PSSSB Boards</Link></li>
                <li><Link href="/exams" className="hover:text-primary transition-colors">PPSC Gazetted</Link></li>
                <li><Link href="/exams" className="hover:text-primary transition-colors">Punjab Police</Link></li>
                <li><Link href="/exams" className="hover:text-primary transition-colors">Teaching Cadre</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="font-black text-[11px] uppercase tracking-[0.3em] text-slate-500">RESOURCES</h4>
              <ul className="space-y-4 text-slate-300 font-bold text-[13px] uppercase tracking-tight">
                <li><Link href="/mocks" className="hover:text-primary transition-colors">Free Mock Tests</Link></li>
                <li><Link href="/pyqs" className="hover:text-primary transition-colors">Previous Year Papers</Link></li>
                <li><Link href="/notes" className="hover:text-primary transition-colors">Study Notes</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">Origin Story</Link></li>
              </ul>
            </div>

            <div className="space-y-8">
              <h4 className="font-black text-[11px] uppercase tracking-[0.3em] text-slate-500">CONNECT</h4>
              <div className="space-y-8">
                 <a 
                   href={content.tg} 
                   target="_blank" 
                   className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary transition-all shadow-xl"
                 >
                   <Send className="h-5 w-5 fill-current" />
                 </a>
                 
                 <div className="space-y-2">
                    <p className="text-3xl md:text-4xl font-headline font-black text-primary leading-tight uppercase tracking-tight">
                      {content.phone.split(' ')[0]} {content.phone.split(' ')[1]}<br/>
                      {content.phone.split(' ')[2]}
                    </p>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">Official Support Channel</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. BOTTOM AUDIT BAR */}
        <div className="pt-20 border-t border-white/5 space-y-6 text-center">
           <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">
             © LATEST PATTERN CRACKLIX | ALL RIGHTS RESERVED.
           </p>
           <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-primary italic">
             FOUNDER & LEAD DEVELOPER: ARSH GREWAL
           </p>
           
           <div className="pt-10 flex justify-center">
              <div className="flex items-center gap-3 px-6 py-2 rounded-full border border-white/5 bg-white/[0.02]">
                 <ShieldCheck className="h-3 w-3 text-slate-500" />
                 <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500">Registry Secure Punjab</span>
              </div>
           </div>
        </div>
      </div>
    </footer>
  );
}
