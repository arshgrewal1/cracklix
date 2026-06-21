'use client';

import React from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  ShieldCheck,
  Instagram,
  MessageCircle,
} from "lucide-react";

import Logo from "@/components/brand/Logo";
import {
  TELEGRAM_GROUP,
  INSTAGRAM_PROFILE,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
} from "@/lib/constants";

/**
 * @fileOverview Compact High-Density Footer v5.0 (Title Case).
 */

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-50 bg-[#020617] font-body text-white">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 items-start text-left">

          {/* Brand Section */}
          <div className="col-span-2 lg:col-span-1 space-y-4">
            <Logo
              variant="dark"
              align="left"
              imgClassName="h-[48px] md:h-[72px]"
            />
            <p className="max-w-[280px] text-[10px] md:text-sm leading-relaxed text-slate-400">
              Punjab's most advanced government exam platform for serious aspirants.
            </p>
            <div className="flex items-center gap-3">
              <SocialIcon href={TELEGRAM_GROUP} icon={<MessageCircle className="h-4 w-4" />} />
              <SocialIcon href={INSTAGRAM_PROFILE} icon={<Instagram className="h-4 w-4" />} />
            </div>
          </div>

          {/* Links Groups */}
          <div className="space-y-4">
            <h3 className="text-[10px] md:text-sm font-black text-primary tracking-widest uppercase">Support</h3>
            <ul className="space-y-2.5">
              <FooterLink href="/support">Support Center</FooterLink>
              <FooterLink href="/help">Help Articles</FooterLink>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] md:text-sm font-black text-primary tracking-widest uppercase">Resources</h3>
            <ul className="space-y-2.5">
              <FooterLink href="/mocks">Mock Tests</FooterLink>
              <FooterLink href="/pyqs">Previous Papers</FooterLink>
              <FooterLink href="/notes">Study Material</FooterLink>
              <FooterLink href="/about">About Arsh Grewal</FooterLink>
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-1 space-y-4">
            <h3 className="text-[10px] md:text-sm font-black text-primary tracking-widest uppercase">Connect</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-[11px] md:text-sm text-slate-400">
                <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                <a href={`tel:${SUPPORT_PHONE}`} className="hover:text-white transition-colors truncate">{SUPPORT_PHONE}</a>
              </div>
              <div className="flex items-center gap-2.5 text-[11px] md:text-sm text-slate-400">
                <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-white transition-colors truncate">{SUPPORT_EMAIL}</a>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="border-t border-white/5 bg-black/20 py-5">
        <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-[9px] md:text-[12px] text-slate-500 font-medium">© {currentYear} Cracklix. All Rights Reserved.</p>
          <div className="flex items-center gap-2.5 text-[9px] md:text-[11px] font-black uppercase text-slate-600 tracking-tight">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Institutional Registry Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode; }) {
  return (
    <li>
      <Link href={href} className="text-[10px] md:text-sm text-slate-400 hover:text-primary transition-colors font-bold uppercase tracking-tight">
        {children}
      </Link>
    </li>
  );
}

function SocialIcon({ href, icon }: { href: string; icon: React.ReactNode; }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white hover:bg-primary transition-all border border-white/5">
      {icon}
    </a>
  );
}
