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
 * @fileOverview Cracklix Official Logo Hub v25.0.
 * RESTORED: Balanced sizing (h-14 on mobile, h-16 on desktop).
 */
export default function Logo({
  className = "",
  href = "/",
  variant = "light",
  imgClassName = "",
  onClick,
}: LogoProps) {
  const logoSrc = "/logo/cracklix-logo.png";

  const content = (
    <div className="relative h-14 lg:h-16 w-[180px] md:w-[200px] lg:w-[220px] shrink-0">
      <Image
        src={logoSrc}
        alt="Cracklix"
        fill
        priority
        sizes="(max-width: 768px) 180px, 220px"
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
