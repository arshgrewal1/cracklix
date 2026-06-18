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
 * Cracklix Official Logo Hub v21.0.
 * MAXIMIZED: Logo height fixed to 78px to fill the 80px (h-20) header perfectly.
 * ALIGNMENT: Reduced container width to 200px to eliminate ghost white-space on left.
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

  const content = (
    <div className="relative h-[78px] w-[180px] md:w-[200px] shrink-0">
      <Image
        src={logoSrc}
        alt="Cracklix"
        fill
        priority
        sizes="(max-width: 768px) 180px, 200px"
        className={cn(
          "object-contain object-left shrink-0 transition-all duration-300",
          imgClassName
        )}
      />
    </div>
  );

  if (onClick || href) {
    return (
      <Link
        href={href || "#"}
        onClick={onClick}
        className={cn(
          "flex items-center shrink-0 select-none overflow-hidden",
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
        className
      )}
    >
      {content}
    </div>
  );
}
