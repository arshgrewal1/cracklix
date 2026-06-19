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
}

/**
 * @fileOverview Master Cracklix Branding Node v2.0.
 * Strictly implements the official brand guidelines:
 * - variant="light": Uses cracklix-logo-dark.png (for light backgrounds)
 * - variant="dark": Uses cracklix-logo-light.png (for dark backgrounds)
 * - variant="icon": Uses cracklix-icon.png
 */
export default function Logo({
  className = "",
  href = "/",
  variant = "light",
  imgClassName = "",
  onClick,
  priority = true,
  align = 'left'
}: LogoProps) {
  
  // Official Asset Mapping
  const assets = {
    light: "/logo/cracklix-logo-dark.png",  // Logo with dark text for light UI
    dark: "/logo/cracklix-logo-light.png",  // Logo with light text for dark UI
    icon: "/logo/cracklix-icon.png"
  };

  const src = assets[variant];
  const isIcon = variant === 'icon';

  // Responsive Height Logic based on Overhaul Specs
  // Header: 40px desktop / 32px mobile
  // Sidebar: 42px desktop / 36px mobile
  // Login: 60px desktop / 50px mobile
  // Admin: 38px desktop / 32px mobile

  const content = (
    <div className={cn(
      "relative shrink-0 flex items-center transition-all duration-300",
      align === 'center' && "mx-auto justify-center",
      align === 'right' && "justify-end",
      isIcon ? "h-10 w-10 md:h-12 md:w-12" : "w-auto",
      className
    )}>
      <Image
        src={src}
        alt="Cracklix"
        width={isIcon ? 48 : 240}
        height={isIcon ? 48 : 80}
        priority={priority}
        className={cn(
          "object-contain w-auto",
          // Heights are strictly controlled by parent or these specific classes
          !isIcon && "h-[32px] md:h-[40px]",
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
