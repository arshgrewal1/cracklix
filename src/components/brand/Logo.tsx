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
  iconOnly?: boolean;
  align?: 'left' | 'center' | 'right';
}

/**
 * @fileOverview Institutional Logo Node v28.0 (Path & Size Fix).
 * FIXED: Reverted to root-level logo assets to resolve broken image errors.
 * SIZING: Mobile h-12 (48px) | Desktop h-16 (64px) for premium visibility.
 */
export default function Logo({
  className = "",
  href = "/",
  variant = "light",
  imgClassName = "",
  onClick,
  iconOnly = false,
  align = 'left'
}: LogoProps) {
  // Canonical Registry Paths - Using root-level assets for maximum reliability
  const fullLogo = "/logo.png";
  const iconLogo = "/logo-icon.png";

  const content = (
    <div className={cn(
      "relative shrink-0 transition-all duration-300",
      iconOnly 
        ? "h-10 w-10 md:h-12 md:w-12" 
        : "h-10 md:h-14 w-[140px] md:w-[200px]",
      align === 'center' && "mx-auto"
    )}>
      <Image
        src={iconOnly ? iconLogo : fullLogo}
        alt="Cracklix"
        fill
        priority
        sizes={iconOnly ? "48px" : "(max-width: 768px) 160px, 220px"}
        className={cn(
          "object-contain shrink-0",
          align === 'left' ? "object-left" : align === 'right' ? "object-right" : "object-center",
          imgClassName
        )}
      />
    </div>
  );

  if (onClick || href) {
    return (
      <Link
        href={href || "/"}
        onClick={onClick}
        className={cn(
          "flex items-center shrink-0 select-none overflow-hidden hover:opacity-90 transition-opacity",
          align === 'center' ? "justify-center w-full" : align === 'right' ? "justify-end" : "justify-start",
          className
        )}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center shrink-0 select-none overflow-hidden",
        align === 'center' ? "justify-center w-full" : align === 'right' ? "justify-end" : "justify-start",
        className
      )}
    >
      {content}
    </div>
  );
}
