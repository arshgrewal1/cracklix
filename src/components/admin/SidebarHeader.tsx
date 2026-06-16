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
 * @fileOverview High-Fidelity Admin Sidebar Header v8.0.
 * FIXED: Synchronized with 72px/88px header height standards and 40px logo.
 */
export default function SidebarHeader({ isOpen, onToggle }: SidebarHeaderProps) {
  return (
    <div className={cn(
      "h-[72px] lg:h-[88px] px-4 flex flex-col shrink-0 relative border-b border-white/5",
      isOpen ? "items-stretch justify-center" : "items-center justify-center gap-4"
    )}>
      <div className={cn(
        "flex items-center transition-all duration-300",
        isOpen ? "justify-between" : "justify-center"
      )}>
        {/* LOGO NODE */}
        <div className={cn(
          "transition-all duration-300 flex items-center overflow-hidden shrink-0",
          isOpen ? "w-[160px]" : "w-[44px]"
        )}>
          {isOpen ? (
            <Logo href="/admin" variant="dark" />
          ) : (
            <div className="relative h-8 w-8">
               <Image 
                  src="/logo/cracklix-icon.png" 
                  alt="C" 
                  fill
                  className="object-contain"
               />
            </div>
          )}
        </div>

        {/* TOGGLE BUTTON - INTERNAL IN EXPANDED MODE */}
        {isOpen && (
          <SidebarToggle isOpen={isOpen} onToggle={onToggle} />
        )}
      </div>

      {/* TOGGLE BUTTON - STACKED IN COLLAPSED MODE */}
      {!isOpen && (
        <SidebarToggle isOpen={isOpen} onToggle={onToggle} />
      )}
    </div>
  );
}
