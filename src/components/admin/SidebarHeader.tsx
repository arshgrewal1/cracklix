'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import SidebarToggle from './SidebarToggle';
import Logo from '@/components/brand/Logo';

/**
 * Cracklix Admin Sidebar Header v59.0.
 * UPDATED: Sidebar Toggle anchored to left, Logo to its immediate right.
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
        isOpen ? "justify-start gap-3" : "flex-col justify-center py-4 gap-4"
      )}
    >
      <SidebarToggle
        isOpen={isOpen}
        onToggle={onToggle}
      />

      <div className={cn("flex items-center overflow-hidden transition-all", !isOpen && "opacity-0 scale-95")}>
        {isOpen ? (
          <Logo
            href="/admin"
            variant="light"
            align="left"
            className="transition-all duration-500 h-10 md:h-12 w-auto animate-in fade-in slide-in-from-left-2"
          />
        ) : (
          <Logo
            href="/admin"
            variant="icon"
            align="center"
            className="h-10 md:h-12 w-auto"
          />
        )}
      </div>
    </div>
  );
}
