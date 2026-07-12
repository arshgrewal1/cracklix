'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import SidebarToggle from './SidebarToggle';
import Logo from '@/components/brand/Logo';

/**
 * Cracklix Admin Sidebar Header v51.0.
 * RESTORED: Toggle button visibility regardless of isOpen state to ensure expansion is possible.
 */
export default function SidebarHeader({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "h-[90px] md:h-[110px] border-b border-slate-50 px-4 shrink-0 flex items-center transition-all duration-300",
        isOpen ? "justify-between" : "flex-col justify-center py-4 gap-4"
      )}
    >
      <Logo
        href="/admin"
        variant="light"
        iconOnly={!isOpen}
        align={isOpen ? "left" : "center"}
        className="transition-all duration-300"
      />

      <SidebarToggle
        isOpen={isOpen}
        onToggle={onToggle}
      />
    </div>
  );
}
