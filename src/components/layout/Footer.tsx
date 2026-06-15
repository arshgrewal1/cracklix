
"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck } from "lucide-react";
import Logo from "@/components/brand/Logo";

/**
 * @fileOverview High-Fidelity Institutional Footer v10.0.
 * UPDATED: Strictly matched to user specification for SaaS/EdTech aesthetic.
 * COLOR PALETTE: Primary Blue (#2563EB), Dark Navy (#0F172A), Footer Black (#020617).
 */

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0F172A] text-white border-t border-[#1E293B] font-body text-left">
      <div className="container mx-auto px-6 max-w-7xl pt-20 pb-16">
        
        {/* 1. MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 items-start mb-16">
          
          {/* COLUMN 1: LOGO + ABOUT */}
          <div className="space-y-8">
            <div className="flex justify-start">
               <Logo imgClassName="h-12 w-[180px] object-contain" />
            </div>
            
            <p className="text-[15px] text-[#CBD5E1] leading-relaxed max-w-[300px]">
              Punjab&apos;s most advanced government exam portal.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[#64748B] text-[13px]">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>HQs: Shergarh, Bathinda, Punjab</span>
              </div>
              <div className="flex items-center gap-3 text-[#64748B] text-[13px]">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Institutional Registry Verified</span>
              </div>
            </div>

            {/* SOCIAL HUB */}
            <div className="flex items-center gap-3 pt-2">
              <SocialIcon href="https://facebook.com" icon={
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 3.656 11.127 8.812 13.223v-9.357H5.445V12.07h3.367V9.537c0-3.322 1.977-5.158 5.008-5.158 1.45 0 2.965.259 2.965.259v3.259h-1.67c-1.646 0-2.159 1.022-2.159 2.07v2.483h4.004l-.64 3.125h-3.364V25.3c5.156-2.096 8.812-7.233 8.812-13.227z"/></svg>
              } />
              <SocialIcon href="https://instagram.com" icon={
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              } />
              <SocialIcon href="https://youtube.com" icon={
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l6.393 4-6.393 4z"/></svg>
              } />
              <SocialIcon href="https://t.me/cracklixapp" icon={
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.462 8.246c.145.584-.019 1.217-.423 1.634l-3.201 3.201c-.167.167-.393.262-.629.262-.236 0-.462-.095-.629-.262l-1.601-1.601c-.167-.167-.262-.393-.262-.629s.095-.462.262-.629l.48-.48c.167-.167.393-.262.629-.262.236 0 .462.095.629.262l.491.491 2.091-2.091c.167-.167.393-.262.629-.262.236 0 .462.095.629.262l.48.48c.404.417.568 1.05.423 1.634z"/></svg>
              } />
              <SocialIcon href="https://wa.me/919888188602" icon={
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884 0 2.225.569 3.811 1.594 5.385l-.973 3.548 3.868-.932zm9.567-4.115c-.247-.123-1.463-.721-1.692-.802-.229-.081-.396-.123-.563.123s-.646.802-.79 1.002c-.146.2-.291.222-.539.099-.247-.123-1.044-.384-1.988-1.227-.735-.655-1.231-1.465-1.375-1.711-.144-.247-.015-.38.108-.503l.36-.54c.123-.186.165-.312.247-.519.083-.206.041-.387-.021-.51-.062-.123-.563-1.354-.77-1.83-.201-.463-.406-.399-.563-.407l-.479-.009c-.166 0-.437.062-.666.312s-.874.854-.874 2.081.902 2.41 1.026 2.597c.125.187 1.776 2.71 4.3 3.791.601.257 1.07.41 1.433.521.603.191 1.152.164 1.586.1.484-.072 1.463-.597 1.669-1.173.208-.576.208-1.07.146-1.173-.062-.103-.229-.163-.476-.285z"/></svg>
              } />
            </div>
          </div>

          {/* COLUMN 2: EXAM VERTICALS */}
          <div className="space-y-8">
            <h4 className="text-[18px] font-bold text-white tracking-tight">Exam Verticals</h4>
            <ul className="flex flex-col gap-5">
              <FooterLink href="/exams">PSSSB Boards</FooterLink>
              <FooterLink href="/exams">PPSC Gazetted</FooterLink>
              <FooterLink href="/exams">Punjab Police</FooterLink>
              <FooterLink href="/exams">Teaching Cadre</FooterLink>
            </ul>
          </div>

          {/* COLUMN 3: RESOURCES */}
          <div className="space-y-8">
            <h4 className="text-[18px] font-bold text-white tracking-tight">Resources</h4>
            <ul className="flex flex-col gap-5">
              <FooterLink href="/mocks">Free Mock Tests</FooterLink>
              <FooterLink href="/pyqs">Previous Year Papers</FooterLink>
              <FooterLink href="/notes">Study Notes</FooterLink>
              <FooterLink href="/about">Origin Story</FooterLink>
            </ul>
          </div>

          {/* COLUMN 4: CONNECT */}
          <div className="space-y-8">
            <h4 className="text-[18px] font-bold text-white tracking-tight">Connect</h4>
            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                 <div className="h-10 w-10 rounded-full bg-[#1E293B] flex items-center justify-center text-[#2563EB]">
                    <Phone className="h-4 w-4" />
                 </div>
                 <a href="tel:+919888188602" className="text-[15px] font-bold text-[#94A3B8] group-hover:text-white transition-colors">+91 9888188602</a>
              </div>

              <div className="flex items-center gap-4 group">
                 <div className="h-10 w-10 rounded-full bg-[#1E293B] flex items-center justify-center text-[#2563EB]">
                    <Mail className="h-4 w-4" />
                 </div>
                 <a href="mailto:cracklixhelp@gmail.com" className="text-[15px] font-bold text-[#94A3B8] group-hover:text-white transition-colors">cracklixhelp@gmail.com</a>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1E293B] border border-[#2563EB]/20">
                 <span className="text-[11px] font-bold text-[#38BDF8] uppercase tracking-wider">Official Support Channel</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. COPYRIGHT STRIP */}
      <div className="bg-[#020617] h-[60px] flex items-center justify-center border-t border-[#1E293B]/50">
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
        className="text-[15px] text-[#94A3B8] hover:text-[#2563EB] transition-all duration-200"
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
      className="h-[42px] w-[42px] rounded-full bg-[#1E293B] flex items-center justify-center text-white hover:bg-[#2563EB] transition-all duration-300 shadow-lg"
    >
      {icon}
    </a>
  );
}
