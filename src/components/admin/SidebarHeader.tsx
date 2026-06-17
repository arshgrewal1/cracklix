'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import SidebarToggle from './SidebarToggle';
import Logo from '@/components/brand/Logo';
import Image from 'next/image';

interface SidebarHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * Cracklix Admin Sidebar Header v12.0.
 * REALIGNED: Reduced height to 80px and removed negative logo margins.
 */
export default function SidebarHeader({
  isOpen,
  onToggle,
}: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        "h-20 border-b border-white/5 px-4 shrink-0 flex items-center",
        isOpen ? "justify-between gap-4" : "justify-center"
      )}
    >
      {/* LOGO AREA */}
      <div
        className={cn(
          "flex items-center overflow-hidden transition-all duration-300",
          isOpen ? "w-[180px]" : "w-10 justify-center"
        )}
      >
        {isOpen ? (
          <Logo
            href="/admin"
            variant="dark"
            className="shrink-0"
          />
        ) : (
          <div className="relative h-10 w-10 shrink-0">
            <Image
              src="/logo/cracklix-icon.png"
              alt="Cracklix"
              fill
              priority
              sizes="40px"
              className="object-contain"
            />
          </div>
        )}
      </div>

      {/* TOGGLE BUTTON */}
      {isOpen && (
        <SidebarToggle
          isOpen={isOpen}
          onToggle={onToggle}
        />
      )}
    </div>
  );
}
