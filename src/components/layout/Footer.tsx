"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck } from "lucide-react";
import Logo from "@/components/brand/Logo";

/**
 * @fileOverview High-Fidelity Institutional Footer v11.0.
 * UPDATED: Cracklix Blue (#2F6BFF) and Dark Navy (#04102B).
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
              Punjab&apos;s most advanced government exam portal.
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
              <SocialIcon href="#" icon={<svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 3.656 11.127 8.812 13.223v-9.357H5.445V12.07h3.367V9.537c0-3.322 1.977-5.158 5.008-5.158 1.45 0 2.965.259 2.965.259v3.259h-1.67c-1.646 0-2.159 1.022-2.159 2.07v2.483h4.004l-.64 3.125h-3.364V25.3c5.156-2.096 8.812-7.233 8.812-13.227z"/></svg>} />
              <SocialIcon href="#" icon={<svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>} />
              <SocialIcon href="#" icon={<svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l6.393 4-6.393 4z"/></svg>} />
              <SocialIcon href="#" icon={<svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.462 8.246c.145.584-.019 1.217-.423 1.634l-3.201 3.201c-.167.167-.393.262-.629.262-.236 0-.462-.095-.629-.262l-1.601-1.601c-.167-.167-.262-.393-.262-.629s.095-.462.262-.629l.48-.48c.167-.167.393-.262.629-.262.236 0 .462.095.629.262l.491.491 2.091-2.091c.167-.167.393-.262.629-.262.236 0 .462.095.629.262l.48.48c.404.417.568 1.05.423 1.634z"/></svg>} />
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-[18px] font-bold text-white tracking-tight">Exam Verticals</h4>
            <ul className="flex flex-col gap-5">
              <FooterLink href="/exams">PSSSB Boards</FooterLink>
              <FooterLink href="/exams">PPSC Gazetted</FooterLink>
              <FooterLink href="/exams">Punjab Police</FooterLink>
              <FooterLink href="/exams">Teaching Cadre</FooterLink>
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-[18px] font-bold text-white tracking-tight">Resources</h4>
            <ul className="flex flex-col gap-5">
              <FooterLink href="/mocks">Free Mock Tests</FooterLink>
              <FooterLink href="/pyqs">Previous Year Papers</FooterLink>
              <FooterLink href="/notes">Study Notes</FooterLink>
              <FooterLink href="/about">Origin Story</FooterLink>
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-[18px] font-bold text-white tracking-tight">Connect</h4>
            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                 <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-[#2F6BFF]">
                    <Phone className="h-4 w-4" />
                 </div>
                 <a href="tel:+919888188602" className="text-[15px] font-bold text-[#94A3B8] group-hover:text-white transition-colors">+91 9888188602</a>
              </div>

              <div className="flex items-center gap-4 group">
                 <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-[#2F6BFF]">
                    <Mail className="h-4 w-4" />
                 </div>
                 <a href="mailto:cracklixhelp@gmail.com" className="text-[15px] font-bold text-[#94A3B8] group-hover:text-white transition-colors">cracklixhelp@gmail.com</a>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-[#2F6BFF]/20">
                 <span className="text-[11px] font-bold text-[#2F6BFF] uppercase tracking-wider">Official Support Channel</span>
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
            Designed for Punjab Government Exam Aspirants.
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