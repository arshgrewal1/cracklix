'use client';

import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Official Master Logo Hub v7.0.
 * UPDATED: Increased size and refined typography to match specifications.
 */
export function LogoIcon({ className = "" }: { className?: string }) {
  return (
    <div className={cn("relative shrink-0 flex items-center gap-4", className)}>
      <img 
        src="https://i.ibb.co/5WjGyLhn/1000110132-removebg-preview.png" 
        alt="Cracklix Logo" 
        className="h-full w-auto object-contain"
        referrerPolicy="no-referrer"
      />
      <div className="flex flex-col items-start leading-none">
         <span className="text-[16px] lg:text-[18px] font-[700] text-white tracking-tight">Cracklix</span>
         <span className="text-[8px] lg:text-[10px] font-black uppercase text-primary tracking-[0.15em] mt-1">
            Punjab's Mock Test Platform
         </span>
      </div>
    </div>
  );
}

export default function Logo({ className = "", href = "/" }: LogoProps) {
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
