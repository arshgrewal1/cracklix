'use client';

import React, { useMemo } from 'react';
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';

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
 * @fileOverview Cracklix Brand Identity v131.0 [Real-Time Sync].
 * FIXED: Pulls dynamic logo URL from branding registry with local fallback.
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
  const db = useFirestore();
  const brandRef = useMemo(() => (db ? doc(db, 'settings', 'branding') : null), [db]);
  const { data: brand } = useDoc<any>(brandRef);
  
  const staticAssets = {
    light: "/logo/cracklix-logo-dark.png",
    dark: "/logo/cracklix-logo-light.png",
    icon: "/logo/cracklix-icon.png"
  };

  const isIcon = variant === 'icon' || iconOnly;
  
  // Use remote logo if available in registry, otherwise fallback to local asset
  const src = isIcon 
    ? (brand?.logoUrl || staticAssets.icon)
    : (variant === 'light' ? (brand?.logoUrl || staticAssets.light) : (brand?.logoUrl || staticAssets.dark));

  const content = (
    <div className={cn(
      "relative flex items-center h-full",
      align === 'center' ? "justify-center" : 
      align === 'right' ? "justify-end" : "justify-start"
    )}>
      <Image
        src={src}
        alt={brand?.organizationName || "Cracklix"}
        width={isIcon ? 320 : 1200}
        height={isIcon ? 320 : 480}
        priority={priority}
        className={cn(
          "h-auto transition-all flex-shrink-0 object-contain w-auto scale-110",
          imgClassName
        )}
        unoptimized={src.startsWith('http')}
      />
    </div>
  );

  const baseClasses = cn(
    "flex items-center select-none hover:opacity-95 transition-opacity flex-shrink-0 -ml-2",
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
