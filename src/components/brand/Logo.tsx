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
 * Cracklix Official Logo Component
 * SCALE: Maximized to the absolute technical limits of the 80px (h-20) header.
 * UNIFIED: 78px height across all breakpoints for consistent brand dominance.
 * SAFETY: Added max-w-full to prevent horizontal overflow in narrow containers.
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
    <Image
      src={logoSrc}
      alt="Cracklix"
      width={400}
      height={80}
      priority
      className={cn(
        "h-[78px] w-auto max-w-full object-contain shrink-0 transition-all duration-300",
        imgClassName
      )}
      style={{ width: "auto" }}
    />
  );

  if (onClick || href) {
    return (
      <Link
        href={href || "#"}
        onClick={onClick}
        className={cn(
          "flex items-center shrink-0 select-none",
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
        "flex items-center shrink-0 select-none",
        className
      )}
    >
      {content}
    </div>
  );
}
