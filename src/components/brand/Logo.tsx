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
 * @fileOverview Cracklix High-Fidelity Brand Identity v96.0.
 * UPDATED: Increased dimensions by 30% for high-fidelity prominent display.
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
        sizes={isIcon ? "512px" : "2500px"}
        className={cn(
          "transition-all flex-shrink-0 object-contain",
          align === 'left' && "object-left",
          imgClassName
        )}
      />
    </div>
  );

  const baseClasses = cn(
    "flex items-center select-none hover:opacity-90 transition-opacity flex-shrink-0 relative",
    isIcon 
      ? "h-40 w-40 md:h-64 md:w-64" 
      : "h-64 w-[320px] md:h-80 md:w-[840px]", 
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