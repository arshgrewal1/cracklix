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
 * @fileOverview Official Cracklix Brand Hub v26.0.
 * HARDENED: Maximized to absolute vertical limits (112px/128px) per user request (+20px from previous).
 * PLACEMENT: Designed to be anchored exactly next to the sidebar trigger.
 */
export default function Logo({ className = "", href = "/", variant = 'light', imgClassName = "" }: LogoProps) {
  // Use dark logo for light background, and light logo for dark background
  const logoSrc = variant === 'light' ? '/logo/cracklix-logo-dark.png' : '/logo/cracklix-logo-light.png';

  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center group pointer-events-auto select-none shrink-0 min-w-[200px]", 
        className
      )}
    >
      <Image 
        src={logoSrc} 
        alt="Cracklix" 
        width={260}
        height={128}
        priority
        className={cn(
          "h-[112px] w-auto lg:h-[128px] object-contain transition-all group-hover:scale-110 shrink-0",
          imgClassName
        )}
      />
    </Link>
  );
}
