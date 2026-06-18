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

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

/**
 * @fileOverview Institutional Header v80.0 (Responsive Hardened).
 * FIXED: Logo scaling and margin logic for 320px devices to prevent icon overflow.
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
      <nav className="w-full h-20 bg-white border-b border-slate-100 shadow-sm">
        <div className="w-full max-w-7xl mx-auto px-2 xs:px-4 md:px-6 h-full flex items-center justify-between">

          {/* LEFT SIDE: Branding Hub */}
          <div className="flex items-center gap-1 xs:gap-4 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
              className="flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm active:scale-95 transition-all shrink-0"
            >
              <Menu className="w-5 h-5 xs:w-6 xs:h-6" />
            </button>

            <Logo
              variant="light"
              className="shrink-0 -ml-8 xs:-ml-12 lg:-ml-16 scale-90 xs:scale-100 origin-left"
            />
          </div>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden lg:flex items-center justify-center gap-10 flex-1 px-8">
            <NavLink href="/" label="Home" active={pathname === '/'} />
            <NavLink href="/mocks" label="Practice" active={pathname === '/mocks'} />
            <NavLink href="/pyqs" label="Previous Papers" active={pathname === '/pyqs'} />
            <NavLink href="/current-affairs" label="Study Center" active={pathname === '/current-affairs'} />
          </div>

          {/* RIGHT SIDE: Action Hub */}
          <div className="flex items-center gap-2 xs:gap-4 shrink-0">
            <Link
              href="/search"
              className="w-10 h-10 xs:w-12 xs:h-12 rounded-2xl flex items-center justify-center bg-slate-50 text-slate-600 hover:text-primary transition-all active:scale-95"
            >
              <Search className="w-4 h-4 xs:w-5 xs:h-5" />
            </Link>

            {loading ? (
              <Skeleton className="w-10 h-10 xs:w-12 xs:h-12 rounded-2xl bg-slate-100" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-10 h-10 xs:w-12 xs:h-12 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center active:scale-95 transition-all">
                    <StudentAvatar
                      profile={profile}
                      className="w-full h-full border-none"
                      iconClassName="w-5 h-5 xs:w-6 xs:h-6"
                    />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-64 mt-4 rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl z-[2001]"
                >
                  <DropdownMenuItem asChild className="rounded-2xl px-4 py-4 cursor-pointer">
                    <Link href="/profile" className="flex items-center gap-3">
                      <User className="w-5 h-5 text-primary" />
                      <span className="font-bold text-base">My Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  {isAdmin && (
                    <DropdownMenuItem asChild className="rounded-2xl px-4 py-4 mt-1 border border-primary/10 cursor-pointer bg-primary/5">
                      <Link href="/admin" className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        <span className="font-bold text-base text-primary">Admin Hub</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="my-2 bg-slate-100" />

                  <DropdownMenuItem onClick={handleLogout} className="rounded-2xl px-4 py-4 cursor-pointer text-rose-500 font-bold text-base flex items-center gap-3">
                    <LogOut className="w-5 h-5 shrink-0" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="px-4 xs:px-8 h-10 xs:h-12 rounded-2xl bg-primary text-white font-bold text-xs xs:text-base flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-primary/20">
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