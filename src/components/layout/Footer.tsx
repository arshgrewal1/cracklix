
"use client";

import Link from "next/link";
import Logo from "@/components/brand/Logo";
import { Send, MapPin, ShieldCheck, Share2 } from "lucide-react";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";

/**
 * @fileOverview Final Screenshot-Matched Footer Hub v20.0.
 * UPDATED: Reduced font size of the phone number and support label for a more refined look.
 */
export default function Footer() {
  const db = useFirestore();
  const settingsRef = useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]);
  const { data: settings } = useDoc<any>(settingsRef);

  const content = {
    description: settings?.footerText || "Punjab's most advanced government exam portal.",
    phone: settings?.supportPhone || "+91 98881 88602",
    address: settings?.address || "Shergarh, Bathinda, Punjab",
    tg: settings?.telegramUrl || "https://t.me/cracklixapp"
  };

  const phoneParts = content.phone.split(' ');

  return (
    <footer className="bg-[#08152D] text-white pt-20 pb-12 border-t border-white/5 font-body text-left">
      <div className="container mx-auto px-6 max-w-7xl">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 md:gap-16 mb-24">
          
          {/* 1. BRAND HUB (LEFT) */}
          <div className="lg:col-span-4 space-y-10">
            <div className="space-y-8">
               <div className="h-44 flex items-center">
                  <Logo imgClassName="h-44" />
               </div>
               <p className="text-slate-400 text-lg font-medium max-w-xs leading-relaxed">
                  {content.description}
               </p>
            </div>

            <div className="space-y-4">
               <div className="flex items-center gap-3 text-slate-500">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-[11px] font-black uppercase tracking-widest">HQs: {content.address}</span>
               </div>
               <div className="flex items-center gap-3 text-slate-500">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Institutional Registry Verified</span>
               </div>
            </div>

            <Button className="h-14 px-8 bg-[#111A35] hover:bg-slate-800 text-white rounded-xl border border-white/5 font-black uppercase text-[10px] tracking-widest gap-3 shadow-2xl mt-4">
               <Share2 className="h-4 w-4 text-primary" /> SHARE CRACKLIX
            </Button>
          </div>

          {/* 2. EXAM VERTICALS */}
          <div className="lg:col-span-3 space-y-8 pt-4 md:pt-12">
            <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-500">EXAM VERTICALS</h4>
            <ul className="space-y-5 text-white font-bold text-[15px] uppercase tracking-tight">
              <li><Link href="/exams" className="hover:text-primary transition-colors">PSSSB Boards</Link></li>
              <li><Link href="/exams" className="hover:text-primary transition-colors">PPSC Gazetted</Link></li>
              <li><Link href="/exams" className="hover:text-primary transition-colors">Punjab Police</Link></li>
              <li><Link href="/exams" className="hover:text-primary transition-colors">Teaching Cadre</Link></li>
            </ul>
          </div>

          {/* 3. RESOURCES */}
          <div className="lg:col-span-3 space-y-8 pt-4 md:pt-12">
            <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-500">RESOURCES</h4>
            <ul className="space-y-5 text-white font-bold text-[15px] uppercase tracking-tight">
              <li><Link href="/mocks" className="hover:text-primary transition-colors">Free Mock Tests</Link></li>
              <li><Link href="/pyqs" className="hover:text-primary transition-colors">Previous Year Papers</Link></li>
              <li><Link href="/notes" className="hover:text-primary transition-colors">Study Notes</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">Origin Story</Link></li>
            </ul>
          </div>

          {/* 4. CONNECT HUB (RIGHT) */}
          <div className="lg:col-span-2 space-y-10 pt-4 md:pt-12">
            <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-500">CONNECT</h4>
            <div className="space-y-8">
               <a 
                 href={content.tg} 
                 target="_blank" 
                 className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary transition-all shadow-2xl"
               >
                 <Send className="h-6 w-6 fill-current text-white" />
               </a>
               
               <div className="space-y-3">
                  <p className="text-xl md:text-2xl font-headline font-black text-primary leading-none uppercase tracking-tight">
                    {phoneParts[0]}<br/>
                    {phoneParts[1]}<br/>
                    {phoneParts[2]}
                  </p>
                  <div className="space-y-1">
                    <p className="text-[7px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none">OFFICIAL SUPPORT</p>
                    <p className="text-[7px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none">CHANNEL</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* BOTTOM AUDIT BAR */}
        <div className="pt-16 border-t border-white/5 space-y-6 text-center">
           <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 opacity-60">
             © LATEST PATTERN CRACKLIX | ALL RIGHTS RESERVED.
           </p>
           <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">
             FOUNDER & LEAD DEVELOPER: <span className="text-primary">ARSH GREWAL</span>
           </p>
        </div>
      </div>
    </footer>
  );
}
