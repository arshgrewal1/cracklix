'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import SidebarToggle from './SidebarToggle';
import Logo from '@/components/brand/Logo';

/**
 * Cracklix Admin Sidebar Header v52.0.
 * FIXED: Improved logo rendering logic for better visibility in collapsed state.
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
        variant={isOpen ? "light" : "icon"}
        align={isOpen ? "left" : "center"}
        className="transition-all duration-300 h-10 md:h-12 w-auto"
      />

      <SidebarToggle
        isOpen={isOpen}
        onToggle={onToggle}
      />
    </div>
  );
}
