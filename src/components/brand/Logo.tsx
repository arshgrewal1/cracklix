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
 * @fileOverview Cracklix Official Logo Component v1.5
 * Standardized at 120px height for premium brand visibility.
 * FIXED: Resolved unterminated string and unexpected EOF errors.
 */
export default function Logo({
  className = "",
  href = "/",
  variant = "light",
  imgClassName = "",
  onClick,
}: LogoProps) {

  const logoSrc =
    variant === "light"
      ? "/logo/cracklix-logo-dark.png"
      : "/logo/cracklix-logo-light.png";

  const logo = (
    <Image
      src={logoSrc}
      alt="Cracklix"
      width={400}
      height={120}
      priority
      className={cn(
        "h-[120px] w-auto object-contain shrink-0 select-none",
        imgClassName
      )}
    />
  );

  const handleClick = (e: React.MouseEvent) => {
    if (onClick && typeof onClick === 'function') {
      onClick();
    }
  };

  if (!href) {
    return (
      <div
        className={cn(
          "flex items-center",
          className
        )}
        onClick={handleClick}
      >
        {logo}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center group transition-transform active:scale-95",
        className
      )}
      onClick={handleClick}
    >
      {logo}
    </Link>
  );
}
