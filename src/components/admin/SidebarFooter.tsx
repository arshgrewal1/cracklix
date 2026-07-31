
'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import { LogOut, ShieldCheck } from "lucide-react";
import StudentAvatar from '@/components/brand/StudentAvatar';
import { isSuperAdmin } from '@/lib/permissions';

interface SidebarFooterProps {
  isOpen: boolean;
  profile: any;
  handleLogout: () => void;
}

/**
 * Admin Sidebar Footer v2.3 [Authority Hub Updated].
 * FIXED: Correctly identifies Super Admin status using the founder email whitelist.
 */
export default function SidebarFooter({
  isOpen,
  profile,
  handleLogout,
}: SidebarFooterProps) {
  
  // High-fidelity authority detection
  const isMasterAuthority = isSuperAdmin(profile, profile?.email);

  return (
    <div className="mt-auto border-t border-slate-50 bg-white p-3">
      {/* PROFILE HUB */}
      <div className={cn(
        "flex items-center gap-3 transition-all duration-300 p-1.5 rounded-2xl",
        isOpen ? "hover:bg-slate-50 cursor-default" : "justify-center"
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
          <p className="truncate text-sm font-black text-[#0F172A] text-left">
            {profile?.name || "Administrator"}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
             <ShieldCheck className={cn("h-2.5 w-2.5", isMasterAuthority ? "text-rose-500" : "text-primary")} />
             <p className={cn(
               "truncate text-[9px] font-black tracking-widest uppercase",
               isMasterAuthority ? "text-rose-600" : "text-slate-400"
             )}>
               {isMasterAuthority ? 'Super Admin' : profile?.role === 'ADMIN' ? 'Admin' : 'Staff'}
             </p>
          </div>
        </div>
      </div>

      {/* LOGOUT CONTROL */}
      <button
        onClick={handleLogout}
        className={cn(
          "mt-3 flex h-11 w-full items-center justify-center rounded-xl transition-all duration-200 active:scale-[0.98] group cursor-pointer border border-transparent",
          isOpen
            ? "gap-3 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100"
            : "text-slate-300 hover:text-rose-600 hover:bg-rose-50"
        )}
      >
        <LogOut className="h-4.5 w-4.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
        <span className={cn(
          "overflow-hidden whitespace-nowrap text-[10px] font-black tracking-widest transition-all duration-300 uppercase",
          isOpen ? "max-w-[120px] opacity-100" : "max-w-0 opacity-0"
        )}>
          Sign Out
        </span>
      </button>
    </div>
  );
}
