'use client';

import React from 'react';
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'icon';
  href?: string;
  imgClassName?: string;
  onClick?: () => void;
  priority?: boolean;
  align?: 'left' | 'center' | 'right';
  iconOnly?: boolean;
}

/**
 * @fileOverview Cracklix High-Fidelity Brand Identity v103.0.
 * UPDATED: Increased base dimensions significantly for a bolder desktop presence.
 */
export default function Logo({
  className = "",
  href = "/",
  variant = "light",
  imgClassName = "",
  onClick,
  priority = true,
  align = 'left',
  iconOnly = false
}: LogoProps) {
  
  const assets = {
    light: "/logo/cracklix-logo-dark.png",
    dark: "/logo/cracklix-logo-light.png",
    icon: "/logo/cracklix-icon.png"
  };

  const isIcon = variant === 'icon' || iconOnly;
  const src = assets[isIcon ? 'icon' : variant];

  const content = (
    <div className={cn(
      "relative w-full h-full flex items-center",
      align === 'center' ? "justify-center" : 
      align === 'right' ? "justify-end" : "justify-start"
    )}>
      <Image
        src={src}
        alt="Cracklix"
        fill
        priority={priority}
        sizes={isIcon ? "256px" : "1024px"}
        className={cn(
          "transition-all flex-shrink-0 object-contain",
          align === 'left' && "object-left",
          imgClassName
        )}
      />
    </div>
  );

  const baseClasses = cn(
    "flex items-center select-none hover:opacity-95 transition-opacity flex-shrink-0 relative",
    isIcon 
      ? "h-14 w-14 md:h-28 md:w-28" 
      : "h-20 w-64 md:h-44 md:w-[600px]", 
    align === 'center' && "mx-auto",
    className
  );

  if (href || onClick) {
    return (
      <Link
        href={href || "/"}
        onClick={(e) => {
           if (onClick) {
              e.preventDefault();
              onClick();
           }
        }}
        className={baseClasses}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={baseClasses}>
      {content}
    </div>
  );
}