
'use client';

import React from 'react';
import { PanelLeft, PanelRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * Cracklix Admin Sidebar Toggle v2.2
 * UPDATED: Increased interactive footprint for 100% reliable one-click response.
 */

export default function SidebarToggle({
  isOpen,
  onToggle,
}: SidebarToggleProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
         e.preventDefault();
         onToggle();
      }}
      aria-label={
        isOpen
          ? 'Collapse Sidebar'
          : 'Expand Sidebar'
      }
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl cursor-pointer",
        "border border-slate-100 bg-slate-50 text-slate-400 shadow-sm",
        "transition-all duration-200",
        "hover:bg-primary hover:text-white hover:border-primary",
        "active:scale-90",
        !isOpen && "mx-auto"
      )}
    >
      {isOpen ? (
        <PanelLeft className="h-5 w-5" />
      ) : (
        <PanelRight className="h-5 w-5" />
      )}
    </button>
  );
}
