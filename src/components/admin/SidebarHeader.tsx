'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import SidebarToggle from './SidebarToggle';
import Logo from '@/components/brand/Logo';

/**
 * Cracklix Admin Sidebar Header v81.0.
 * UPDATED: Logo centered when sidebar is expanded for symmetrical vertical navigation.
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
        "h-[120px] md:h-[180px] border-b border-slate-50 px-4 shrink-0 flex items-center transition-all duration-300",
        isOpen ? "justify-center relative" : "flex-col justify-center py-4 gap-4"
      )}
    >
      <div className={cn(
        "shrink-0",
        isOpen ? "absolute left-4" : ""
      )}>
        <SidebarToggle
          isOpen={isOpen}
          onToggle={onToggle}
        />
      </div>

      <div className={cn(
        "flex items-center overflow-hidden transition-all duration-500", 
        !isOpen && "opacity-0 scale-95 pointer-events-none absolute"
      )}>
        {isOpen && (
          <Logo
            href="/admin"
            variant="light"
            align="center"
            className="transition-all"
            imgClassName="h-24 md:h-44 w-auto"
          />
        )}
      </div>
    </div>
  );
}