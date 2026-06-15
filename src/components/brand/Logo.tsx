'use client';

import React from 'react';
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  href?: string;
  imgClassName?: string;
}

/**
 * @fileOverview Official Master Logo Hub v23.0.
 * UPDATED: Pointed to new blue-theme logo path.
 */
export function LogoIcon({ className = "", imgClassName = "" }: { className?: string, imgClassName?: string }) {
  return (
    <div className={cn("relative shrink-0 flex items-center justify-center h-full w-auto", className)}>
      <img 
        src="/logo/cracklix-logo.png" 
        alt="Cracklix Logo" 
        className={cn("w-auto object-contain block select-none pointer-events-none", imgClassName)}
        referrerPolicy="no-referrer"
        onError={(e) => {
          // Fallback to text if local asset not found during transition
          (e.target as HTMLImageElement).src = "https://i.ibb.co/5WjGyLhn/1000110132-removebg-preview.png";
        }}
      />
    </div>
  );
}

export default function Logo({ className = "", href = "/", imgClassName = "" }: LogoProps) {
  return (
    <Link href={href} className={cn("flex items-center group pointer-events-auto select-none shrink-0 h-full overflow-visible", className)}>
      <LogoIcon imgClassName={imgClassName} />
    </Link>
  );
}
