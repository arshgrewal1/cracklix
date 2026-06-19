'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import SidebarToggle from './SidebarToggle';
import Logo from '@/components/brand/Logo';

interface SidebarHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * Cracklix Admin Sidebar Header v22.0.
 * BRAND SYSTEM: 38px desktop height, 32px mobile height, fixed at top.
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
      {/* LOGO AREA: Strictly following Admin Panel specs */}
      <Logo
        href="/admin"
        variant="dark"
        iconOnly={!isOpen}
        align={isOpen ? "left" : "center"}
        className="transition-all duration-300"
        imgClassName={cn(
          isOpen ? "h-[32px] md:h-[38px]" : "h-10"
        )}
      />

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
