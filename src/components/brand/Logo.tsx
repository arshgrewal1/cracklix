'use client';

import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Official Cracklix Master Logo Hub.
 * UPDATED: Removed "CRACKLIX" text and increased icon size as per user request.
 * Tagline "PUNJAB'S NO.1 STUDY HUB" is preserved and centered below the larger icon.
 */
export function LogoIcon({ className = "" }: { className?: string }) {
  return (
    <div className={cn("relative shrink-0 flex flex-col items-center justify-center", className)}>
      <img 
        src="https://i.ibb.co/5WjGyLhn/1000110132-removebg-preview.png" 
        alt="Logo" 
        className="h-12 md:h-16 w-auto object-contain"
        referrerPolicy="no-referrer"
      />
      <div className="flex items-center gap-1.5 w-full mt-1">
         <div className="h-px bg-primary/40 flex-1" />
         <span className="text-[6px] md:text-[7px] font-black text-white/60 uppercase tracking-[0.2em] whitespace-nowrap">
            Punjab's No.1 Study Hub
         </span>
         <div className="h-px bg-primary/40 flex-1" />
      </div>
    </div>
  );
}

export default function Logo({ className = "", variant = 'light', href = "/" }: LogoProps) {
  return (
    <Link href={href} className={cn("flex items-center group pointer-events-auto select-none shrink-0", className)}>
      <LogoIcon />
    </Link>
  );
}

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  href?: string;
}
