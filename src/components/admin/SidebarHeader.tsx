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
 * @fileOverview High-Fidelity Admin Sidebar Header v12.0.
 * UPDATED: Synchronized with 140px header height and 120px logo standard.
 */
export default function SidebarHeader({ isOpen, onToggle }: SidebarHeaderProps) {
  return (
    <div className={cn(
      "h-[140px] px-4 flex flex-col shrink-0 relative border-b border-white/5",
      isOpen ? "items-stretch justify-center" : "items-center justify-center gap-4"
    )}>
      <div className={cn(
        "flex items-center transition-all duration-300",
        isOpen ? "justify-between" : "justify-center"
      )}>
        <div className={cn(
          "transition-all duration-300 flex items-center overflow-hidden shrink-0",
          isOpen ? "w-[240px]" : "w-[40px]"
        )}>
          {isOpen ? (
            <Logo href="/admin" variant="dark" />
          ) : (
            <div className="relative h-10 w-10">
               <Image 
                  src="/logo/cracklix-icon.png" 
                  alt="C" 
                  fill
                  className="object-contain"
               />
            </div>
          )}
        </div>

        {isOpen && (
          <SidebarToggle isOpen={isOpen} onToggle={onToggle} />
        )}
      </div>

      {!isOpen && (
        <SidebarToggle isOpen={isOpen} onToggle={onToggle} />
      )}
    </div>
  );
}
