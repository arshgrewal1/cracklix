'use client';

import React from 'react';
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  href?: string;
  imgClassName?: string;
}

/**
 * @fileOverview Official Cracklix Brand Hub v15.0.
 * SIZING: Permanently locked to 44px height with 140px min-width.
 * DIMENSIONS: Standardized across all headers and sidebars.
 */
export default function Logo({ className = "", href = "/", variant = 'light', imgClassName = "" }: LogoProps) {
  const logoSrc = variant === 'light' ? '/logo/cracklix-logo-dark.png' : '/logo/cracklix-logo-light.png';

  return (
    <Link href={href} className={cn("flex items-center group pointer-events-auto select-none shrink-0", className)}>
      <div className="relative h-[44px] w-auto min-w-[140px]">
        <Image 
          src={logoSrc} 
          alt="Cracklix" 
          width={160}
          height={44}
          priority
          className={cn(
            "object-contain transition-transform group-hover:scale-105 h-full w-auto",
            imgClassName
          )}
        />
      </div>
    </Link>
  );
}
