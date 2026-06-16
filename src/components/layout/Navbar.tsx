'use client';

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { 
  Search, 
  User, 
  LogOut, 
  Menu, 
  Gem, 
  ShieldCheck,
  X
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
 * @fileOverview Production-Grade Responsive PWA Header v81.0.
 * UPDATED: Simplified mobile pass button to a single Gem icon.
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
    <nav className="w-full border-b border-gray-200 bg-white h-20 lg:h-24" />
  );

  return (
    <div className="w-full sticky top-0 z-50 font-body">
      <nav className="w-full border-b border-gray-200 bg-white h-20 lg:h-24 px-4 lg:px-8 shadow-sm flex items-center overflow-hidden">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between h-full">
          
          {/* LEFT: HAMBURGER (Mobile) + LOGO */}
          <div className="flex items-center gap-3 lg:gap-6 shrink-0">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="flex lg:hidden w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 items-center justify-center text-slate-600 active:scale-95 transition-all"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo imgClassName="h-8 lg:h-10 w-auto" />
          </div>

          {/* CENTER: NAVIGATION (Desktop ONLY) */}
          <nav className="hidden lg:flex items-center gap-12 flex-1 justify-center">
             <NavLink href="/" label="Home" active={pathname === '/'} />
             <NavLink href="/mocks" label="Practice" active={pathname === '/mocks'} />
             <NavLink href="/current-affairs" label="Updates" active={pathname === '/current-affairs'} />
          </nav>

          {/* RIGHT: ACTIONS */}
          <div className="flex items-center justify-end gap-2 lg:gap-4 shrink-0">
             <Button asChild className="h-11 lg:h-16 px-4 lg:px-10 bg-[#2563EB] hover:bg-blue-700 text-white font-black text-[10px] lg:text-[11px] tracking-widest rounded-2xl lg:rounded-3xl gap-2 shadow-lg shadow-blue-600/20 border-none transition-all active:scale-95">
                <Link href="/pass">
                  <Gem className="h-4 w-4 text-white" /> 
                  <span className="hidden lg:inline">PASS</span>
                </Link>
             </Button>

             <Link href="/search" className="w-11 h-11 lg:w-16 lg:h-16 rounded-2xl lg:rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#2563EB] hover:bg-blue-50/50 transition-all active:scale-95">
                <Search className="h-5 w-5 lg:h-6 lg:w-6" />
             </Link>

             {loading ? (
                <Skeleton className="w-11 h-11 lg:w-16 lg:h-16 rounded-2xl lg:rounded-3xl bg-gray-100" />
             ) : user ? (
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <button className="w-11 h-11 lg:w-16 lg:h-16 rounded-2xl lg:rounded-3xl border border-slate-100 overflow-hidden shadow-sm cursor-pointer bg-slate-50 active:scale-95 transition-transform flex items-center justify-center">
                      <StudentAvatar profile={profile} className="h-full w-full border-none" />
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
               <Button asChild className="px-5 lg:px-8 h-11 lg:h-16 bg-[#2563EB] hover:bg-blue-700 text-white font-black text-[10px] lg:text-[11px] rounded-2xl lg:rounded-3xl transition-all tracking-widest border-none active:scale-95 shadow-lg">
                 <Link href="/login">LOGIN</Link>
               </Button>
             )}
          </div>
        </div>
      </nav>

      {/* SIDEBAR OVERLAY */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0 border-none w-[300px] bg-white z-[2001]">
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
      "flex items-center px-8 py-4 rounded-2xl font-semibold text-[15px] transition-all shrink-0 uppercase tracking-widest",
      active 
        ? "bg-blue-50 text-[#2563EB] shadow-sm" 
        : "text-slate-400 hover:text-[#04102B] hover:bg-gray-50"
    )}>
       <span>{label}</span>
    </Link>
  )
}
