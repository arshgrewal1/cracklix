'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import SidebarToggle from './SidebarToggle';
import Logo from '@/components/brand/Logo';

/**
 * Cracklix Admin Sidebar Header v48.0.
 * FIXED: Replaced non-standard h-18 with standard h-16 for collapsed logo.
 */
export default function SidebarHeader({
  isOpen,
  onToggle,
}: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        "h-[100px] md:h-[110px] border-b border-slate-50 px-4 shrink-0 flex items-center transition-all duration-300",
        isOpen ? "justify-between gap-2" : "flex-col justify-center gap-4 py-4 px-0"
      )}
    >
      <Logo
        href="/admin"
        variant="light"
        iconOnly={!isOpen}
        align={isOpen ? "left" : "center"}
        className="transition-all duration-300"
        imgClassName={cn(
          isOpen ? "h-24 md:h-24" : "h-16 md:h-16"
        )}
      />

      <SidebarToggle
        isOpen={isOpen}
        onToggle={onToggle}
      />
    </div>
  );
}

interface SidebarHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
}
