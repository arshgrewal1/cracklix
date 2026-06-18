'use client';

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import {
  Search,
  User,
  LogOut,
  Menu,
  ShieldCheck,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import MobileSidebar from "./MobileSidebar";
import { cn } from "@/lib/utils";
import Logo from "@/components/brand/Logo";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

/**
 * @fileOverview Institutional Header v91.0 (Hardened Responsiveness).
 * FIXED: Logo alignment and responsive dropdown dimensions.
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
      console.error('[NAVBAR_LOGOUT_FAILURE]:', error);
    }
  };

  const isAdmin =
    profile?.role === 'ADMIN' ||
    profile?.role === 'SUPER_ADMIN' ||
    (user?.email &&
      SUPER_ADMIN_WHITELIST.includes(user.email.toLowerCase()));

  if (!mounted) {
    return (
      <nav className="w-full border-b border-slate-100 bg-white h-20" />
    );
  }

  return (
    <div className="sticky top-0 z-50 w-full font-body">
      <nav className="w-full h-20 bg-white border-b border-slate-100 shadow-sm overflow-visible">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between">

          {/* LEFT SIDE: Menu Hub + Maximized Logo */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
              className="flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm active:scale-95 transition-all shrink-0 hover:border-primary/30 z-10"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Logo
              variant="light"
              className="shrink-0 -ml-3 md:-ml-4 transition-all duration-500 origin-left"
            />
          </div>

          {/* DESKTOP NAVIGATION (CENTERED) */}
          <div className="hidden lg:flex items-center justify-center gap-8 flex-1 px-4">
            <NavLink href="/" label="Home" active={pathname === '/'} />
            <NavLink href="/mocks" label="Practice" active={pathname === '/mocks'} />
            <NavLink href="/pyqs" label="Previous Papers" active={pathname === '/pyqs'} />
            <NavLink href="/current-affairs" label="Study Center" active={pathname === '/current-affairs'} />
          </div>

          {/* RIGHT SIDE: Action Hub */}
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <Link
              href="/search"
              className="w-10 h-10 md:w-11 md:h-11 rounded-2xl flex items-center justify-center bg-slate-50 text-slate-600 hover:text-primary transition-all active:scale-95"
            >
              <Search className="w-5 h-5" />
            </Link>

            {loading ? (
              <Skeleton className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-slate-100" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-10 h-10 md:w-11 md:h-11 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center active:scale-95 transition-all">
                    <StudentAvatar
                      profile={profile}
                      className="w-full h-full border-none"
                      iconClassName="w-6 h-6"
                    />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  sideOffset={12}
                  className="
                    w-[92vw]
                    max-w-[420px]
                    min-w-[280px]
                    rounded-[28px]
                    p-4 sm:p-6 md:p-8
                    bg-white
                    border border-slate-200
                    shadow-[0_20px_60px_rgba(15,23,42,0.15)]
                    z-[2001]
                  "
                >
                  <DropdownMenuItem asChild className="rounded-2xl p-0 focus:bg-transparent cursor-default">
                    <div className="w-full">
                       {/* PROFILE HEADER */}
                       <Link href="/profile" className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 group cursor-pointer">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                             <User className="h-5 w-5 sm:h-6 sm:w-6" />
                          </div>
                          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">My Profile</h3>
                       </Link>

                       {/* ADMIN HUB (IF APPLICABLE) */}
                       {isAdmin && (
                         <div className="mb-4 sm:mb-6">
                            <Button asChild className="w-full h-14 sm:h-16 rounded-2xl sm:rounded-3xl text-lg sm:text-xl font-black px-4 sm:px-6 bg-primary hover:bg-blue-700 text-white shadow-lg border-none transition-all active:scale-95">
                               <Link href="/admin">
                                  <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                                  Admin Hub
                               </Link>
                            </Button>
                         </div>
                       )}

                       <DropdownMenuSeparator className="my-4 bg-slate-100" />

                       {/* LOGOUT NODE */}
                       <Button
                          variant="ghost"
                          onClick={handleLogout}
                          className="w-full h-14 sm:h-16 justify-start text-red-500 text-lg sm:text-xl font-black rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all active:scale-95"
                       >
                          <LogOut className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                          Log Out
                       </Button>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="px-5 md:px-8 h-11 md:h-12 rounded-2xl bg-primary text-white font-bold text-sm md:text-base flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-primary/20">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-[320px] p-0 border-none bg-white z-[2001] shadow-2xl [&>button]:hidden">
          <SheetHeader className="sr-only"><SheetTitle>Menu</SheetTitle><SheetDescription>Main menu.</SheetDescription></SheetHeader>
          <MobileSidebar onClose={() => setIsSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active?: boolean; }) {
  return (
    <Link href={href} className={cn("text-base font-bold tracking-tight transition-all", active ? "text-primary scale-105" : "text-slate-500 hover:text-[#04102B]")}>
      {label}
    </Link>
  );
}
