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
 * @fileOverview Cracklix Maximized Brand Identity v55.0.
 * SPECS:
 * Desktop Header Logo: 72px height (within 88px header)
 * Mobile Header Logo: 60px height (within 72px header)
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

  const src = assets[iconOnly ? 'icon' : variant];
  const isIcon = variant === 'icon' || iconOnly;

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
        width={isIcon ? 80 : 600}
        height={isIcon ? 80 : 200}
        priority={priority}
        className={cn(
          "object-contain w-auto transition-all flex-shrink-0 h-[60px] md:h-[72px]",
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
