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
 * @fileOverview Cracklix High-Fidelity Brand Identity v70.1.
 * FIXED: Added sizes prop for optimized responsive delivery.
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
      "relative shrink-0 flex items-center transition-all duration-300",
      align === 'center' && "mx-auto justify-center",
      align === 'right' && "justify-end",
      className
    )}>
      <Image
        src={src}
        alt="Cracklix"
        fill
        priority={priority}
        sizes="(max-width: 768px) 150px, 250px"
        className={cn(
          "transition-all flex-shrink-0 object-contain",
          imgClassName
        )}
      />
    </div>
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
        className={cn(
          "flex items-center select-none hover:opacity-90 transition-opacity flex-shrink-0 relative",
          isIcon ? "h-14 w-14 md:h-20 md:w-20" : "h-[64px] w-[180px] md:h-[92px] md:w-[260px]",
          align === 'center' && "mx-auto"
        )}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={cn(
      "relative",
      isIcon ? "h-14 w-14 md:h-20 md:w-20" : "h-[64px] w-[180px] md:h-[92px] md:w-[260px]",
    )}>
      {content}
    </div>
  );
}
