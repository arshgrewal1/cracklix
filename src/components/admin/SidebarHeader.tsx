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
 * @fileOverview High-Fidelity Sidebar Header v3.0.
 * UPDATED: Synchronized with root-relative logo paths for production stability.
 */
export default function SidebarHeader({ isOpen, onToggle }: SidebarHeaderProps) {
  return (
    <div className={cn(
      "h-28 px-6 flex flex-col shrink-0 relative border-b border-white/5",
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
            <Logo href="/admin" variant="dark" imgClassName="h-8 w-auto" />
          ) : (
            <div className="relative h-8 w-8">
               <Image 
                  src="/cracklix-logo-dark.png" 
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
