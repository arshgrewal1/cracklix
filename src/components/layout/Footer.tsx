'use client';

import React from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  ShieldCheck,
  Instagram,
  MessageCircle,
  Download
} from "lucide-react";

import Logo from "@/components/brand/Logo";
import {
  TELEGRAM_GROUP,
  INSTAGRAM_PROFILE,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
} from "@/lib/constants";
import PLATFORM_VERSION from "@/lib/version";
import { Badge } from "@/components/ui/badge";

/**
 * @fileOverview Institutional Footer Hub v21.0.
 * UPDATED: Normalized casing for category headers.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-50 bg-[#020617] font-body text-white">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-0 pb-12 md:pb-24">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 md:gap-20 items-start text-left">

          {/* Brand Section - ZERO TOP SPACE */}
          <div className="col-span-2 lg:col-span-1 space-y-4">
            <Logo
              variant="dark"
              align="left"
              className="h-32 md:h-48 -ml-2"
              imgClassName="h-full w-auto"
            />
            <p className="max-w-[320px] text-[15px] leading-relaxed text-slate-400 font-medium tracking-tight">
              Punjab&apos;s smart exam preparation platform for every aspirant.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <SocialIcon href={TELEGRAM_GROUP} icon={<MessageCircle className="h-5 w-5" />} />
              <SocialIcon href={INSTAGRAM_PROFILE} icon={<Instagram className="h-5 w-5" />} />
              <SocialIcon href="/download" icon={<Download className="h-5 w-5" />} />
            </div>
          </div>

          {/* Links Group */}
          <div className="col-span-1 lg:col-span-1 space-y-6 pt-10 md:pt-14">
            <h3 className="text-sm font-bold text-primary tracking-tight">Quick Links</h3>
            <ul className="space-y-3">
              <FooterLink href="/">Home</FooterLink>
              <FooterLink href="/exams">Exams</FooterLink>
              <FooterLink href="/download">Download App</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
            </ul>
          </div>

          {/* Resources Group */}
          <div className="hidden lg:block lg:col-span-1 space-y-6 pt-10 md:pt-14">
            <h3 className="text-sm font-bold text-primary tracking-tight">Resources</h3>
            <ul className="space-y-3">
              <FooterLink href="/mocks">Mock Tests</FooterLink>
              <FooterLink href="/pyqs">Previous Papers</FooterLink>
              <FooterLink href="/notes">Study Material</FooterLink>
              <FooterLink href="/about">About Arsh Grewal</FooterLink>
            </ul>
          </div>

          {/* Support Group */}
          <div className="col-span-2 lg:col-span-1 space-y-6 pt-10 md:pt-14">
            <h3 className="text-sm font-bold text-primary tracking-tight">Support</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[14px] md:text-[15px] text-slate-400">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <a href={`tel:${SUPPORT_PHONE}`} className="hover:text-white transition-colors font-bold whitespace-nowrap">
                  {SUPPORT_PHONE}
                </a>
              </div>
              <div className="flex items-center gap-3 text-[14px] md:text-[15px] text-slate-400">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-white transition-colors font-bold break-all md:break-normal">
                  {SUPPORT_EMAIL}
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="border-t border-white/5 bg-black/20 py-6">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
             <p className="text-[12px] text-slate-500 font-bold">© {currentYear} Cracklix</p>
             <Badge variant="outline" className="border-white/10 text-slate-500 text-[10px] font-bold">V{PLATFORM_VERSION.version}</Badge>
          </div>
          <div className="flex items-center gap-3 text-[12px] font-bold text-slate-600 tracking-tight">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Trusted Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );

  function FooterLink({ href, children }: { href: string; children: React.ReactNode; }) {
    return (
      <li>
        <Link href={href} className="text-[14px] text-slate-400 hover:text-white transition-colors font-bold tracking-tight">
          {children}
        </Link>
      </li>
    );
  }

  function SocialIcon({ href, icon }: { href: string; icon: React.ReactNode; }) {
    return (
      <Link href={href} target={href.startsWith('http') ? "_blank" : undefined} className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-white hover:bg-primary transition-all border border-white/5">
        {icon}
      </Link>
    );
  }
}
