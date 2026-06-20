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
 * @fileOverview Cracklix Maximized Brand Identity v57.0.
 * FIXED: Optimized icon rendering to prevent "compression" and clipping.
 * FIXED: Removed object-contain for icons to allow edge-to-edge ring visibility.
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
      "relative shrink-0 flex items-center transition-all duration-300 h-full",
      align === 'center' && "mx-auto justify-center",
      align === 'right' && "justify-end",
      className
    )}>
      <Image
        src={src}
        alt="Cracklix"
        width={isIcon ? 120 : 800}
        height={isIcon ? 120 : 250}
        priority={priority}
        className={cn(
          "transition-all flex-shrink-0 w-auto",
          isIcon 
            ? "h-10 md:h-12 object-center scale-110" // Maximum visibility for the ring
            : "h-[56px] md:h-[72px] object-contain",
          imgClassName
        )}
      />
    </div>
  );

  if (href || onClick) {
    return (
      <Link
        href={href || "/"}
        onClick={onClick}
        className={cn(
          "flex items-center select-none hover:opacity-90 transition-opacity flex-shrink-0 h-full",
          align === 'center' && "w-full justify-center"
        )}
      >
        {content}
      </Link>
    );
  }

  return content;
}
