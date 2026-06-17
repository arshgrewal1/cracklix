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
 * @fileOverview Official Cracklix Brand Hub v37.0.
 * UPDATED: Hardened to 120px height standard for maximum visibility.
 */
export default function Logo({ className = "", href = "/", variant = 'light', imgClassName = "", onClick }: LogoProps) {
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
        width={400}
        height={120}
        priority
        className={cn(
          "h-[120px] w-auto object-contain shrink-0",
          imgClassName
        )}
      />
    </Link>
  );
}
