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
  onClick?: () => void;
}

/**
 * @fileOverview Official Cracklix Brand Hub v33.0.
 * UPDATED: Optimized dimensions for tight header integration (40px/48px).
 */
export default function Logo({ className = "", href = "/", variant = 'light', imgClassName = "", onClick }: LogoProps) {
  // Use dark logo for light background, and light logo for dark background
  const logoSrc = variant === 'light' ? '/logo/cracklix-logo-dark.png' : '/logo/cracklix-logo-light.png';

  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={cn(
        "flex items-center pointer-events-auto select-none shrink-0", 
        className
      )}
    >
      <Image 
        src={logoSrc} 
        alt="Cracklix" 
        width={160}
        height={48}
        priority
        className={cn(
          "h-10 lg:h-12 w-auto object-contain shrink-0",
          imgClassName
        )}
      />
    </Link>
  );
}
