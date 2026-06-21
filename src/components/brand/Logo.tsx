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
 * @fileOverview Cracklix High-Fidelity Brand Identity v63.0.
 * FIXED: Increased height and resolution for crisp PWA rendering.
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
        width={isIcon ? 160 : 1200}
        height={isIcon ? 160 : 400}
        priority={priority}
        className={cn(
          "transition-all flex-shrink-0 w-auto object-contain",
          isIcon 
            ? "h-10 md:h-12 scale-110" 
            : "h-[40px] md:h-[52px]",
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
          "flex items-center select-none hover:opacity-90 transition-opacity flex-shrink-0",
          align === 'center' && "w-full justify-center"
        )}
      >
        {content}
      </Link>
    );
  }

  return content;
}
