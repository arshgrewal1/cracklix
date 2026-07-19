'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import SidebarToggle from './SidebarToggle';
import Logo from '@/components/brand/Logo';

/**
 * Cracklix Admin Sidebar Header v63.0.
 * UPDATED: Increased logo size for better visibility while maintaining sidebar alignment.
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
        "h-[100px] md:h-[130px] border-b border-slate-50 px-4 shrink-0 flex items-center transition-all duration-300 relative",
        isOpen ? "justify-center" : "flex-col justify-center py-4 gap-4"
      )}
    >
      <div className={cn(
        "transition-all duration-300",
        isOpen ? "absolute left-4" : "relative"
      )}>
        <SidebarToggle
          isOpen={isOpen}
          onToggle={onToggle}
        />
      </div>

      <div className={cn(
        "flex items-center overflow-hidden transition-all", 
        !isOpen && "opacity-0 scale-95"
      )}>
        {isOpen ? (
          <Logo
            href="/admin"
            variant="light"
            align="center"
            className="transition-all duration-500 animate-in fade-in zoom-in-95 -ml-4"
            imgClassName="h-28 md:h-44 w-auto"
          />
        ) : (
          <Logo
            href="/admin"
            variant="icon"
            align="center"
            imgClassName="h-12 md:h-14 w-auto"
          />
        )}
      </div>
    </div>
  );
}