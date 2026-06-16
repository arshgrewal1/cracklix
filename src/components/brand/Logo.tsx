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
 * @fileOverview Official Cracklix Brand Hub v6.0.
 * LOGIC:
 * - variant='light': Navy text logo for light/white backgrounds.
 * - variant='dark': White text logo for dark/navy backgrounds.
 * SIZING: Mobile: 120x34 | Tablet: 145x42 | Desktop: 180x52
 */
export default function Logo({ className = "", href = "/", variant = 'light', imgClassName = "" }: LogoProps) {
  const logoSrc = variant === 'light' ? '/logo/cracklix-logo-dark.png' : '/logo/cracklix-logo-light.png';

  return (
    <Link href={href} className={cn("flex items-center group pointer-events-auto select-none shrink-0", className)}>
      <Image 
        src={logoSrc} 
        alt="Cracklix" 
        width={180}
        height={52}
        priority
        className={cn(
          "w-auto object-contain transition-transform group-hover:scale-105",
          "h-8 sm:h-9 md:h-10 lg:h-12", 
          imgClassName
        )}
      />
    </Link>
  );
}
