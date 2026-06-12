
'use client';

import Link from "next/link";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  showTagline?: boolean;
  href?: string;
}

/**
 * @fileOverview Stylized Brand Identity Node v2.1.
 * RESTORED: Reverted to SVG-based logo for immediate visual stability.
 */
export default function Logo({ className = "", variant = 'light', showTagline = true, href = "/" }: LogoProps) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5 group pointer-events-auto select-none", className)}>
      <div className="relative shrink-0">
        {/* Bolt Icon Hub */}
        <div className="h-9 w-9 md:h-10 md:w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
          <Zap className="h-5 w-5 md:h-6 md:w-6 text-white fill-current" />
        </div>
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="flex flex-col items-start leading-none">
        <span className={cn(
          "text-xl md:text-2xl font-headline font-[900] tracking-tighter uppercase",
          variant === 'light' ? "text-white" : "text-[#0F172A]"
        )}>
          CRACKLIX
        </span>
        {showTagline && (
          <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.4em] text-primary/80 mt-1 md:mt-1.5">
            Punjab Exam Hub
          </span>
        )}
      </div>
    </Link>
  );
}
