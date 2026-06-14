
"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck, Heart, Send, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ShareButton from "@/components/navigation/ShareButton";

/**
 * @fileOverview Final Screenshot-Matched Institutional Footer v4.0.
 * UPDATED: Integrated Arsh Grewal founder credit and contact buttons.
 */

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0B1528] text-white border-t border-white/5 font-body text-left">
      <div className="container mx-auto px-6 max-w-[1280px] pt-20 pb-10">
        
        {/* 1. MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 items-start mb-20">
          
          {/* COLUMN 1: BRAND HUB */}
          <div className="space-y-10">
            <p className="text-xl md:text-2xl font-medium text-slate-300 leading-relaxed max-w-[280px]">
              Punjab&apos;s most advanced government exam portal.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-400">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">HQS: SHERGARH, BATHINDA, PUNJAB</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">INSTITUTIONAL REGISTRY VERIFIED</span>
              </div>
            </div>

            <div className="pt-4">
               <ShareButton 
                 variant="dark" 
                 className="h-14 px-8 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl shadow-2xl" 
               />
            </div>
          </div>

          {/* COLUMN 2: EXAMS */}
          <div className="space-y-10">
            <ul className="flex flex-col gap-6">
              <FooterLink href="/exams">PPSC GAZETTED</FooterLink>
              <FooterLink href="/exams">PUNJAB POLICE</FooterLink>
              <FooterLink href="/exams">TEACHING CADRE</FooterLink>
            </ul>
          </div>

          {/* COLUMN 3: RESOURCES */}
          <div className="space-y-10">
            <ul className="flex flex-col gap-6">
              <FooterLink href="/pyqs">PREVIOUS YEAR PAPERS</FooterLink>
              <FooterLink href="/notes">STUDY NOTES</FooterLink>
              <FooterLink href="/about">ORIGIN STORY</FooterLink>
            </ul>
          </div>

          {/* COLUMN 4: CONTACT & SUPPORT */}
          <div className="space-y-10 flex flex-col items-start lg:items-end text-left lg:text-right">
            <Link 
              href="https://t.me/cracklixapp" 
              target="_blank"
              className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary transition-all shadow-xl group"
            >
              <Send className="h-6 w-6 fill-current text-white group-hover:scale-110 transition-transform" />
            </Link>
            
            <div className="space-y-6 w-full lg:w-auto">
               <a href="tel:+919888188602" className="block group">
                  <div className="space-y-1">
                     <p className="text-3xl md:text-4xl font-black text-primary leading-none tracking-tighter transition-transform group-hover:scale-105 origin-right">
                        +91 98881 88602
                     </p>
                  </div>
               </a>

               <a href="mailto:cracklixhelp@gmail.com" className="block group">
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all shadow-xl">
                     <Mail className="h-4 w-4 text-primary" />
                     <span className="text-[11px] font-black uppercase tracking-widest">cracklixhelp@gmail.com</span>
                  </div>
               </a>

               <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">
                  OFFICIAL SUPPORT CHANNEL
               </p>
            </div>
          </div>

        </div>

        {/* 2. BOTTOM BAR */}
        <div className="pt-10 border-t border-white/5 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-center md:text-left">
              © LATEST PATTERN CRACKLIX | ALL RIGHTS RESERVED.
            </div>

            <div className="flex items-center gap-8 md:gap-12">
              <Link href="/privacy" className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">Privacy</Link>
              <Link href="/terms" className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">Terms</Link>
              <Link href="/refund" className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">Refund</Link>
            </div>

            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
              MADE IN PUNJAB <span className="text-white brightness-125">🇮🇳</span>
            </div>
          </div>

          <div className="text-center pt-4">
             <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.5em] text-slate-400">
                FOUNDER & LEAD DEVELOPER: <span className="text-primary ml-1">ARSH GREWAL</span>
             </p>
          </div>
        </div>

      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <li>
      <Link 
        href={href} 
        className="text-[16px] font-black text-white hover:text-primary transition-all duration-200 uppercase tracking-tight"
      >
        {children}
      </Link>
    </li>
  );
}
