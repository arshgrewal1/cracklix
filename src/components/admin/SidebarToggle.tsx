'use client';

import React from 'react';
import { PanelLeft, PanelRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * Cracklix Admin Sidebar Toggle v2.1
 * FIXED: Removed unconditional centering to allow side-by-side Logo alignment.
 */

export default function SidebarToggle({
  isOpen,
  onToggle,
}: SidebarToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={
        isOpen
          ? 'Collapse Sidebar'
          : 'Expand Sidebar'
      }
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
        "border border-slate-100 bg-slate-50 text-slate-400 shadow-sm",
        "transition-all duration-200",
        "hover:bg-primary hover:text-white hover:border-primary",
        "active:scale-90",
        !isOpen && "mx-auto"
      )}
    >
      {isOpen ? (
        <PanelLeft className="h-4 w-4" />
      ) : (
        <PanelRight className="h-4 w-4" />
      )}
    </button>
  );
}
