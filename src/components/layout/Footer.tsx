"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck, Send } from "lucide-react";
import ShareButton from "@/components/navigation/ShareButton";
import Logo from "@/components/brand/Logo";

/**
 * @fileOverview Final Screenshot-Matched Institutional Footer v5.2.
 * UPDATED: Removed 'uppercase' for a premium Title Case look.
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
            <div className="flex justify-start">
               <Logo imgClassName="h-10 md:h-12" />
            </div>
            
            <p className="text-xl md:text-2xl font-medium text-slate-300 leading-relaxed max-w-[280px]">
              Punjab&apos;s most advanced government exam portal.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-400">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className="text-[10px] font-black tracking-[0.2em]">HQs: Shergarh, Bathinda, Punjab</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span className="text-[10px] font-black tracking-[0.2em]">Institutional Registry Verified</span>
              </div>
            </div>

            <div className="pt-4">
               <ShareButton 
                 variant="dark" 
                 className="h-14 px-8 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl shadow-2xl text-[10px] font-black tracking-widest" 
               />
            </div>
          </div>

          {/* COLUMN 2: EXAM VERTICALS */}
          <div className="space-y-10">
            <h4 className="text-[11px] font-black text-slate-500 tracking-[0.4em]">Exam Verticals</h4>
            <ul className="flex flex-col gap-6">
              <FooterLink href="/exams">PSSSB Boards</FooterLink>
              <FooterLink href="/exams">PPSC Gazetted</FooterLink>
              <FooterLink href="/exams">Punjab Police</FooterLink>
              <FooterLink href="/exams">Teaching Cadre</FooterLink>
            </ul>
          </div>

          {/* COLUMN 3: RESOURCES */}
          <div className="space-y-10">
            <h4 className="text-[11px] font-black text-slate-500 tracking-[0.4em]">Resources</h4>
            <ul className="flex flex-col gap-6">
              <FooterLink href="/mocks">Free Mock Tests</FooterLink>
              <FooterLink href="/pyqs">Previous Year Papers</FooterLink>
              <FooterLink href="/notes">Study Notes</FooterLink>
              <FooterLink href="/about">Origin Story</FooterLink>
            </ul>
          </div>

          {/* COLUMN 4: CONNECT & SUPPORT */}
          <div className="space-y-10 flex flex-col items-start lg:items-end text-left lg:text-right">
            <div className="space-y-4 flex flex-col items-start lg:items-end">
               <h4 className="text-[11px] font-black text-slate-500 tracking-[0.4em]">Connect</h4>
               <Link 
                 href="https://t.me/cracklixapp" 
                 target="_blank"
                 className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary transition-all shadow-xl group"
               >
                 <Send className="h-6 w-6 fill-current text-white group-hover:scale-110 transition-transform" />
               </Link>
            </div>
            
            <div className="space-y-1 w-full lg:w-auto">
               <a href="tel:+919888188602" className="block group">
                  <div className="flex flex-col items-start lg:items-end font-black text-primary leading-[1.1] tracking-tighter transition-transform group-hover:scale-105 origin-right">
                     <span className="text-4xl md:text-5xl">+91</span>
                     <span className="text-4xl md:text-5xl">98881</span>
                     <span className="text-4xl md:text-5xl">88602</span>
                  </div>
               </a>
               <p className="text-[9px] font-black text-slate-500 tracking-[0.4em] pt-2">
                  Official Support Channel
               </p>
            </div>

            <div className="w-full lg:w-auto">
               <a href="mailto:cracklixhelp@gmail.com" className="block group">
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all shadow-xl">
                     <Mail className="h-4 w-4 text-primary" />
                     <span className="text-[11px] font-black tracking-widest">cracklixhelp@gmail.com</span>
                  </div>
               </a>
            </div>
          </div>

        </div>

        {/* 2. BOTTOM BAR */}
        <div className="pt-10 border-t border-white/5 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-[10px] font-black text-slate-500 tracking-[0.3em] text-center md:text-left">
              © Latest Pattern Cracklix | All Rights Reserved.
            </div>

            <div className="flex items-center gap-8 md:gap-12">
              <Link href="/privacy" className="text-[10px] font-black text-slate-500 hover:text-white tracking-widest transition-colors">Privacy</Link>
              <Link href="/terms" className="text-[10px] font-black text-slate-500 hover:text-white tracking-widest transition-colors">Terms</Link>
              <Link href="/refund" className="text-[10px] font-black text-slate-500 hover:text-white tracking-widest transition-colors">Refund</Link>
            </div>

            <div className="text-[10px] font-black text-slate-500 tracking-[0.3em] flex items-center gap-2">
              Made In Punjab <span className="text-white brightness-125">🇮🇳</span>
            </div>
          </div>

          <div className="text-center pt-4">
             <p className="text-[10px] md:text-[11px] font-black tracking-[0.5em] text-slate-400">
                Founder & Lead Developer: <span className="text-primary ml-1">Arsh Grewal</span>
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
        className="text-[15px] font-black text-white hover:text-primary transition-all duration-200 tracking-tight"
      >
        {children}
      </Link>
    </li>
  );
}
