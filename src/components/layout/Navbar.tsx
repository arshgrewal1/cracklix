'use client';

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { 
  Search, 
  User, 
  LogOut, 
  Menu, 
  ShieldCheck
} from "lucide-react";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StudentAvatar from "@/components/brand/StudentAvatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import MobileSidebar from "./MobileSidebar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Logo from "@/components/brand/Logo";
import { Skeleton } from "@/components/ui/skeleton";

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

/**
 * @fileOverview Final Hardened Header v112.0.
 * LAYOUT: Absolute Far-Left [Menu + Logo] with Minimal Spacing.
 * SIZING: Mobile 72px / Desktop 88px.
 * LOGO: 40px standard.
 */
export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, profile, loading } = useUser();
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("[NAVBAR_LOGOUT_FAILURE]:", error);
    }
  };

  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || (user?.email && SUPER_ADMIN_WHITELIST.includes(user.email.toLowerCase()));

  if (!mounted) return (
    <nav className="w-full border-b border-[#E5E7EB] bg-white h-[72px] lg:h-[88px]" />
  );

  return (
    <div className="w-full sticky top-0 z-50 font-body">
      <nav className="w-full border-b border-[#E5E7EB] bg-white h-[72px] lg:h-[88px] px-0 shadow-[0_2px_10px_rgba(0,0,0,0.06)] flex items-center overflow-hidden">
        <div className="w-full flex items-center justify-between h-full px-2 lg:px-6">
          
          {/* LEFT GROUP: MENU + LOGO (ABSOLUTE LEFT END - ZERO SPACE) */}
          <div className="flex items-center gap-2 lg:gap-4 shrink-0">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 active:bg-gray-50 transition-all z-10 shrink-0 shadow-sm"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Logo 
              variant="light" 
              className="shrink-0"
            />
          </div>

          {/* CENTER: DESKTOP NAVIGATION (Hidden on Mobile) */}
          <nav className="hidden lg:flex items-center gap-8 flex-1 justify-center h-full mx-6">
             <NavLink href="/" label="Home" active={pathname === '/'} />
             <NavLink href="/mocks" label="Practice" active={pathname === '/mocks'} />
             <NavLink href="/current-affairs" label="Updates" active={pathname === '/current-affairs'} />
          </nav>

          {/* RIGHT GROUP: SEARCH + PROFILE */}
          <div className="flex items-center gap-1 md:gap-3 shrink-0">
             <Link href="/search" className="w-11 h-11 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center text-slate-700 hover:text-[#2563EB] transition-all active:scale-95">
                <Search className="w-5 h-5 lg:w-6 lg:h-6" />
             </Link>

             {loading ? (
                <Skeleton className="w-11 h-11 lg:w-14 lg:h-14 rounded-2xl bg-gray-100" />
             ) : user ? (
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <button className="w-11 h-11 lg:w-14 lg:h-14 rounded-2xl border border-slate-100 overflow-hidden shadow-sm cursor-pointer bg-gray-50 active:scale-95 transition-transform flex items-center justify-center">
                      <StudentAvatar profile={profile} className="h-full w-full border-none" iconClassName="w-6 h-6 lg:w-7 lg:h-7" />
                   </button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-64 bg-white border border-gray-200 text-[#04102B] rounded-[2rem] p-2 shadow-5xl z-[2001] mt-4">
                    <DropdownMenuItem asChild className="px-4 py-3 cursor-pointer rounded-xl focus:bg-gray-50">
                       <Link href="/profile" className="flex items-center gap-3">
                          <User className="h-5 w-5 text-[#2563EB]" />
                          <span className="font-bold text-sm tracking-tight">My Profile</span>
                       </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild className="px-4 py-3 cursor-pointer rounded-xl focus:bg-[#2563EB]/5 mt-1 border border-[#2563EB]/10">
                        <Link href="/admin" className="flex items-center gap-3">
                          <ShieldCheck className="h-5 w-5 text-[#2563EB]" />
                          <span className="font-bold text-sm tracking-tight text-[#2563EB]">Admin Center</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-gray-100 my-1" />
                    <DropdownMenuItem onClick={handleLogout} className="px-4 py-3 cursor-pointer rounded-xl focus:bg-rose-50 text-rose-500">
                       <LogOut className="h-5 w-5 shrink-0" />
                       <span className="font-bold text-sm tracking-tight">Log Out</span>
                    </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
             ) : (
               <Link href="/login" className="w-11 h-11 lg:w-14 lg:h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-slate-700 hover:text-[#2563EB] transition-all active:scale-95">
                 <User className="w-5 h-5 lg:w-6 lg:h-6" />
               </Link>
             )}
          </div>
        </div>
      </nav>

      {/* SIDEBAR OVERLAY */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent 
          side="left" 
          className="p-0 border-none w-[280px] bg-white z-[2001] shadow-5xl [&>button]:hidden"
        >
          <SheetHeader className="sr-only">
             <SheetTitle>Navigation Sidebar</SheetTitle>
             <SheetDescription>Access institutional preparation resources and exam verticals.</SheetDescription>
          </SheetHeader>
          <MobileSidebar onClose={() => setIsSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function NavLink({ href, label, active }: { href: string, label: string, active?: boolean }) {
  return (
    <Link href={href} className={cn(
      "flex items-center px-4 py-2 rounded-xl font-bold text-[14px] transition-all shrink-0 uppercase tracking-widest",
      active 
        ? "bg-blue-50 text-[#2563EB] shadow-sm" 
        : "text-slate-400 hover:text-[#04102B] hover:bg-gray-50"
    )}>
       <span>{label}</span>
    </Link>
  )
}
