'use client';

import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Official Cracklix Master Logo Hub.
 * RESTORED: Standardized premium dimensions for high visibility across all platforms.
 * FIXED: Strict max-height to prevent layout corruption.
 */
export function LogoIcon({ className = "" }: { className?: string }) {
  return (
    <div className={cn("relative shrink-0 flex items-center justify-center h-10 md:h-16 w-auto", className)}>
      <img 
        src="https://i.ibb.co/5WjGyLhn/1000110132-removebg-preview.png" 
        alt="Cracklix" 
        className="h-full w-auto object-contain"
        referrerPolicy="no-referrer"
        width={180}
        height={64}
        style={{ maxHeight: '64px', width: 'auto' }}
      />
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
