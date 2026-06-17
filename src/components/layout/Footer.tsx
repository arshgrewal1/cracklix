'use client';

import React from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
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
 * Production Footer v1.2
 * Cracklix Official Footer
 * UPDATED: Logo height synchronized to 120px standard.
 */

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-[#020617] font-body text-white">

      <div className="mx-auto max-w-7xl px-6 pt-16 pb-14">

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">

          {/* Brand Section */}
          <div className="space-y-8">

            <Logo
              variant="dark"
            />

            <p className="max-w-[300px] text-[15px] leading-relaxed text-slate-300">
              Punjab's most advanced government exam platform,
              built for serious aspirants preparing for success.
            </p>

            <div className="space-y-3">

              <div className="flex items-center gap-3 text-[13px] text-slate-400">
                <MapPin className="h-4 w-4 shrink-0" />

                <span>
                  Shergarh, Bathinda, Punjab
                </span>
              </div>

              <div className="flex items-center gap-3 text-[13px] text-slate-400">
                <ShieldCheck className="h-4 w-4 shrink-0" />

                <span>
                  Institutional Registry Verified
                </span>
              </div>

            </div>

            <div className="flex items-center gap-3">

              <SocialIcon
                href={TELEGRAM_GROUP}
                icon={<MessageCircle className="h-5 w-5" />}
              />

              <SocialIcon
                href={INSTAGRAM_PROFILE}
                icon={<Instagram className="h-5 w-5" />}
              />

            </div>

          </div>

          {/* Support */}
          <div className="space-y-8">

            <h3 className="text-lg font-bold tracking-tight">
              Support Hub
            </h3>

            <ul className="space-y-5">

              <FooterLink href="/support">
                Support Center
              </FooterLink>

              <FooterLink href="/help">
                Help Articles
              </FooterLink>

              <FooterLink href="/privacy">
                Privacy Policy
              </FooterLink>

              <FooterLink href="/terms">
                Terms of Service
              </FooterLink>

            </ul>

          </div>

          {/* Resources */}
          <div className="space-y-8">

            <h3 className="text-lg font-bold tracking-tight">
              Resources
            </h3>

            <ul className="space-y-5">

              <FooterLink href="/mocks">
                Mock Tests
              </FooterLink>

              <FooterLink href="/pyqs">
                Previous Papers
              </FooterLink>

              <FooterLink href="/notes">
                Study Notes
              </FooterLink>

              <FooterLink href="/about">
                About Us
              </FooterLink>

            </ul>

          </div>

          {/* Contact */}
          <div className="space-y-8">

            <h3 className="text-lg font-bold tracking-tight">
              Connect With Us
            </h3>

            <div className="space-y-6">

              <div className="group flex items-center gap-4">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-[#2563EB]">
                  <Phone className="h-4 w-4" />
                </div>

                <a
                  href={`tel:${SUPPORT_PHONE}`}
                  className="text-[15px] font-semibold text-slate-400 transition-colors group-hover:text-white"
                >
                  {SUPPORT_PHONE}
                </a>

              </div>

              <div className="group flex items-center gap-4">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-[#2563EB]">
                  <Mail className="h-4 w-4" />
                </div>

                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-[15px] font-semibold text-slate-400 transition-colors group-hover:text-white"
                >
                  {SUPPORT_EMAIL}
                </a>

              </div>

              <div className="inline-flex items-center rounded-full border border-[#2563EB]/20 bg-white/5 px-3 py-1.5">

                <span className="text-11px] font-bold tracking-tight text-[#2563EB]">
                  Official Resolution Channel
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 bg-black/40">

        <div className="mx-auto flex min-h-[72px] max-w-7xl flex-col items-center justify-between gap-2 px-6 py-3 text-center md:flex-row md:text-left">

          <p className="text-[14px] text-slate-500">
            © {currentYear} Cracklix. All Rights Reserved.
          </p>

          <p className="hidden text-[14px] text-slate-500 md:block">
            Punjab's Leading Preparation Ecosystem.
          </p>

        </div>

      </div>

    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-[15px] text-slate-400 transition-colors hover:text-[#2563EB]"
      >
        {children}
      </Link>
    </li>
  );
}

function SocialIcon({
  href,
  icon,
}: {
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white/5 text-white shadow-lg transition-all duration-300 hover:bg-[#2563EB]"
    >
      {icon}
    </a>
  );
}
