'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import { LogOut, ShieldCheck, Gem } from "lucide-react";
import StudentAvatar from '@/components/brand/StudentAvatar';

interface SidebarFooterProps {
  isOpen: boolean;
  profile: any;
  handleLogout: () => void;
}

/**
 * Admin Sidebar Footer v2.1 (PWA Refined)
 * Standardized to Title Case.
 */
export default function SidebarFooter({
  isOpen,
  profile,
  handleLogout,
}: SidebarFooterProps) {
  return (
    <div className="mt-auto border-t border-slate-50 bg-white p-4">
      {/* PROFILE HUB */}
      <div className={cn(
        "flex items-center gap-3 transition-all duration-300",
        isOpen ? "px-1" : "justify-center"
      )}>
        <StudentAvatar
          profile={profile}
          className="h-11 w-11 rounded-xl border border-slate-100 shadow-sm shrink-0 bg-slate-50"
          iconClassName="w-6 h-6"
        />

        <div className={cn(
          "min-w-0 flex-1 overflow-hidden transition-all duration-300",
          isOpen ? "opacity-100 max-w-[160px]" : "max-w-0 opacity-0 pointer-events-none"
        )}>
          <p className="truncate text-sm font-black text-[#0F172A]">
            {profile?.name || "Administrator"}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
             <ShieldCheck className="h-2.5 w-2.5 text-primary" />
             <p className="truncate text-[9px] font-black tracking-widest text-slate-400">
               {profile?.role === 'SUPER_ADMIN' ? 'Super Admin' : profile?.role === 'ADMIN' ? 'Admin' : 'Staff'}
             </p>
          </div>
        </div>
      </div>

      {/* LOGOUT PILL - TITLE CASE SYNC */}
      <button
        onClick={handleLogout}
        className={cn(
          "mt-4 flex h-11 w-full items-center justify-center rounded-xl transition-all duration-300 active:scale-95 group",
          isOpen
            ? "gap-3 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 border border-slate-100"
            : "text-slate-300 hover:text-rose-600"
        )}
      >
        <LogOut className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
        <span className={cn(
          "overflow-hidden whitespace-nowrap text-[10px] font-black tracking-widest transition-all duration-300",
          isOpen ? "max-w-[120px] opacity-100" : "max-w-0 opacity-0"
        )}>
          Sign Out
        </span>
      </button>
    </div>
  );
}
