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
 * Cracklix Admin Sidebar Header v1.6.
 * Standardized at 88px/100px height for ecosystem consistency.
 */
export default function SidebarHeader({
  isOpen,
  onToggle,
}: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        "h-[88px] lg:h-[100px] border-b border-white/5 px-4 shrink-0 flex items-center",
        isOpen ? "justify-between" : "justify-center"
      )}
    >
      {/* LOGO AREA */}
      <div
        className={cn(
          "flex items-center overflow-hidden transition-all duration-300",
          isOpen ? "w-[180px]" : "w-12 justify-center"
        )}
      >
        {isOpen ? (
          <Logo
            href="/admin"
            variant="dark"
            imgClassName="h-[52px] lg:h-[64px]"
          />
        ) : (
          <div className="relative h-12 w-12 shrink-0">
            <Image
              src="/logo/cracklix-icon.png"
              alt="Cracklix"
              fill
              priority
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
