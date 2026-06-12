
'use client';

import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  showTagline?: boolean;
  href?: string;
}

/**
 * @fileOverview Official Cracklix Brand Identity Node v3.0.
 * RECONSTRUCTED: Matches the provided "C-Check" emblem and typography from the user image.
 */
export default function Logo({ className = "", variant = 'light', showTagline = true, href = "/" }: LogoProps) {
  const isDark = variant === 'dark';

  return (
    <Link href={href} className={cn("flex items-center gap-3 group pointer-events-auto select-none shrink-0", className)}>
      {/* C-CHECK EMBLEM NODE */}
      <div className="relative shrink-0 w-10 h-10 md:w-12 md:h-12">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
          {/* Orange Outer Arc */}
          <path 
            d="M85 50C85 69.33 69.33 85 50 85C30.67 85 15 69.33 15 50C15 30.67 30.67 15 50 15" 
            stroke="#F97316" 
            strokeWidth="10" 
            strokeLinecap="round"
          />
          {/* White Main 'C' */}
          <path 
            d="M75 50C75 63.8071 63.8071 75 50 75C36.1929 75 25 63.8071 25 50C25 36.1929 36.1929 25 50 25" 
            stroke={isDark ? "#0F172A" : "white"} 
            strokeWidth="12" 
            strokeLinecap="round"
          />
          {/* Integrated Orange Checkmark */}
          <path 
            d="M40 50L50 60L75 35" 
            stroke="#F97316" 
            strokeWidth="10" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="group-hover:translate-y-[-2px] transition-transform duration-300"
          />
        </svg>
      </div>

      {/* BRAND TEXT NODE */}
      <div className="flex flex-col items-start justify-center leading-none">
        <div className="flex items-baseline">
          <span className={cn(
            "text-2xl md:text-3xl font-headline font-[900] tracking-tighter uppercase",
            isDark ? "text-[#0F172A]" : "text-white"
          )}>
            CRACK
          </span>
          <span className="text-2xl md:text-3xl font-headline font-[900] tracking-tighter uppercase text-primary">
            LIX
          </span>
        </div>
        
        {showTagline && (
          <div className="flex items-center gap-1.5 w-full mt-1">
            <div className="h-[1px] flex-1 bg-primary/40" />
            <span className="text-[6px] md:text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap">
              PUNJAB'S <span className="text-primary">NO.1</span> STUDY HUB
            </span>
            <div className="h-[1px] flex-1 bg-primary/40" />
          </div>
        )}
      </div>
    </Link>
  );
}
