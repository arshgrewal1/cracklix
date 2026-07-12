'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import SidebarHeader from './SidebarHeader';
import SidebarNav from './SidebarNav';
import SidebarFooter from './SidebarFooter';

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onCloseMobile: () => void;
  profile: any;
  handleLogout: () => void;
  pathname: string;
}

/**
 * Admin Sidebar v3.5 (PWA Refined)
 * FIXED: Reduced z-index to stay below official shadcn modals.
 */
export default function AdminSidebar({
  isOpen,
  onToggle,
  onCloseMobile,
  profile,
  handleLogout,
  pathname,
}: AdminSidebarProps) {

  return (
    <>
      <div
        onClick={onCloseMobile}
        className={cn(
          "fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-sm transition-all duration-300 lg:hidden",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      />

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col overflow-hidden border-r border-slate-100 bg-white transition-all duration-300 ease-in-out shadow-2xl shadow-slate-200/40",
          "lg:translate-x-0",
          isOpen ? "lg:w-[280px]" : "lg:w-[88px]",
          "w-[85vw] max-w-[320px]",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="relative flex h-full flex-col">
          <SidebarHeader isOpen={isOpen} onToggle={onToggle} />
          <SidebarNav isOpen={isOpen} pathname={pathname} />
          <SidebarFooter isOpen={isOpen} profile={profile} handleLogout={handleLogout} />
        </div>
      </aside>
    </>
  );
}
