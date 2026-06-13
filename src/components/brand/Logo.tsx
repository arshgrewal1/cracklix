'use client';

import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  href?: string;
}

/**
 * @fileOverview Official Cracklix Master Logo Hub.
 * HARDENED: Strict dimensions to prevent hydration mismatch and oversized rendering.
 */
export function LogoIcon({ className = "" }: { className?: string }) {
  return (
    <div className={cn("relative shrink-0 flex items-center justify-center", className)} style={{ height: '40px', width: 'auto' }}>
      <img 
        src="https://i.ibb.co/5WjGyLhn/1000110132-removebg-preview.png" 
        alt="Cracklix" 
        className="h-full w-auto object-contain"
        referrerPolicy="no-referrer"
        style={{ maxHeight: '40px' }}
      />
    </div>
  );
}

export default function Logo({ className = "", variant = 'light', href = "/" }: LogoProps) {
  return (
    <Link href={href} className={cn("flex items-center group pointer-events-auto select-none shrink-0", className)}>
      <LogoIcon className="md:h-10 h-8" />
    </Link>
  );
}
