
"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck, Instagram, MessageCircle } from "lucide-react";
import Logo from "@/components/brand/Logo";
import { TELEGRAM_GROUP, INSTAGRAM_PROFILE, SUPPORT_EMAIL, SUPPORT_PHONE } from "@/lib/constants";

/**
 * @fileOverview High-Fidelity Institutional Footer v12.0.
 * UPDATED: Dynamic Social Nodes & Support Hub integration.
 */

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#020617] text-white border-t border-white/5 font-body text-left">
      <div className="container mx-auto px-6 max-w-7xl pt-20 pb-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 items-start mb-16">
          
          <div className="space-y-8">
            <div className="flex justify-start">
               <Logo imgClassName="h-12 w-auto" />
            </div>
            
            <p className="text-[15px] text-[#CBD5E1] leading-relaxed max-w-[300px]">
              Punjab&apos;s most advanced government exam portal. Built for serious aspirants.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[#94A3B8] text-[13px]">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>HQs: Shergarh, Bathinda, Punjab</span>
              </div>
              <div className="flex items-center gap-3 text-[#94A3B8] text-[13px]">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Institutional Registry Verified</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <SocialIcon href={TELEGRAM_GROUP} icon={<MessageCircle className="w-5 h-5" />} />
              <SocialIcon href={INSTAGRAM_PROFILE} icon={<Instagram className="w-5 h-5" />} />
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-[18px] font-bold text-white tracking-tight uppercase">Support Hub</h4>
            <ul className="flex flex-col gap-5">
              <FooterLink href="/support">Support Center</FooterLink>
              <FooterLink href="/help">Help Articles</FooterLink>
              <FooterLink href="/privacy">Privacy Node</FooterLink>
              <FooterLink href="/terms">Terms Node</FooterLink>
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-[18px] font-bold text-white tracking-tight uppercase">Resources</h4>
            <ul className="flex flex-col gap-5">
              <FooterLink href="/mocks">Mock Tests</FooterLink>
              <FooterLink href="/pyqs">Previous Papers</FooterLink>
              <FooterLink href="/notes">Study Notes</FooterLink>
              <FooterLink href="/about">About Us</FooterLink>
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-[18px] font-bold text-white tracking-tight uppercase">Connect</h4>
            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                 <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-[#2F6BFF]">
                    <Phone className="h-4 w-4" />
                 </div>
                 <a href={`tel:${SUPPORT_PHONE}`} className="text-[15px] font-bold text-[#94A3B8] group-hover:text-white transition-colors">{SUPPORT_PHONE}</a>
              </div>

              <div className="flex items-center gap-4 group">
                 <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-[#2F6BFF]">
                    <Mail className="h-4 w-4" />
                 </div>
                 <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[15px] font-bold text-[#94A3B8] group-hover:text-white transition-colors">{SUPPORT_EMAIL}</a>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-[#2F6BFF]/20">
                 <span className="text-[11px] font-bold text-[#2F6BFF] uppercase tracking-wider">Official Resolution Channel</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="bg-black/40 h-[60px] flex items-center justify-center border-t border-white/5">
        <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-[#64748B] text-[14px]">
            © {currentYear} Cracklix. All Rights Reserved.
          </p>
          <p className="text-[#64748B] text-[14px] hidden md:block">
            Punjab&apos;s Leading Preparation Ecosystem.
          </p>
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
        className="text-[15px] text-[#94A3B8] hover:text-[#2F6BFF] transition-all duration-200"
      >
        {children}
      </Link>
    </li>
  );
}

function SocialIcon({ href, icon }: { href: string, icon: React.ReactNode }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="h-[42px] w-[42px] rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-[#2F6BFF] transition-all duration-300 shadow-lg"
    >
      {icon}
    </a>
  );
}
