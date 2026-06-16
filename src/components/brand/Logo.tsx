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
 * @fileOverview Official Cracklix Brand Hub v8.0.
 * LOGIC:
 * - variant='light': Navy text logo for light/white backgrounds.
 * - variant='dark': White text logo for dark/navy backgrounds.
 * SIZING: Standardized to 44px height for professional presence.
 */
export default function Logo({ className = "", href = "/", variant = 'light', imgClassName = "" }: LogoProps) {
  const logoSrc = variant === 'light' ? '/logo/cracklix-logo-dark.png' : '/logo/cracklix-logo-light.png';

  return (
    <Link href={href} className={cn("flex items-center group pointer-events-auto select-none shrink-0", className)}>
      <Image 
        src={logoSrc} 
        alt="Cracklix" 
        width={160}
        height={44}
        priority
        className={cn(
          "w-auto object-contain transition-transform group-hover:scale-105",
          "h-11", // Standardized to 44px (11 * 4)
          imgClassName
        )}
      />
    </Link>
  );
}
