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
 * @fileOverview Professional Header Hub v46.0.
 * UPDATED: Standardized Header height to 140px with 120px Logo.
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
      <nav className="w-full border-b border-[#E5E7EB] bg-white h-[140px]" />
    );
  }

  return (
    <div className="sticky top-0 z-50 w-full font-body">
      <nav className="w-full h-[140px] bg-white border-b border-[#E5E7EB] shadow-sm">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">

          {/* LEFT SIDE: Brand Group */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
              className="flex items-center justify-center w-14 h-14 rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm active:scale-95 transition-all shrink-0"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Logo
              variant="light"
              className="shrink-0"
            />
          </div>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden lg:flex items-center justify-center gap-8 flex-1 px-8">
            <NavLink
              href="/"
              label="Home"
              active={pathname === '/'}
            />

            <NavLink
              href="/mocks"
              label="Practice"
              active={pathname === '/mocks'}
            />

            <NavLink
              href="/current-affairs"
              label="Updates"
              active={pathname === '/current-affairs'}
            />
          </div>

          {/* RIGHT SIDE: Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/search"
              className="w-11 h-11 rounded-2xl flex items-center justify-center bg-gray-50 text-slate-700 hover:text-[#2563EB] transition-all active:scale-95"
            >
              <Search className="w-5 h-5" />
            </Link>

            {loading ? (
              <Skeleton className="w-11 h-11 rounded-2xl bg-gray-100" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-11 h-11 rounded-2xl overflow-hidden border border-slate-100 bg-gray-50 shadow-sm flex items-center justify-center active:scale-95 transition-all">
                    <StudentAvatar
                      profile={profile}
                      className="w-full h-full border-none"
                      iconClassName="w-6 h-6"
                    />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-64 mt-4 rounded-[2rem] border border-gray-200 bg-white p-2 shadow-2xl z-[2001]"
                >
                  <DropdownMenuItem
                    asChild
                    className="rounded-xl px-4 py-3 cursor-pointer"
                  >
                    <Link
                      href="/profile"
                      className="flex items-center gap-3"
                    >
                      <User className="w-5 h-5 text-[#2563EB]" />
                      <span className="font-bold text-sm">
                        My Profile
                      </span>
                    </Link>
                  </DropdownMenuItem>

                  {isAdmin && (
                    <DropdownMenuItem
                      asChild
                      className="rounded-xl px-4 py-3 mt-1 border border-[#2563EB]/10 cursor-pointer"
                    >
                      <Link
                        href="/admin"
                        className="flex items-center gap-3"
                      >
                        <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
                        <span className="font-bold text-sm text-[#2563EB]">
                          Admin Center
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="my-1 bg-gray-100" />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-xl px-4 py-3 cursor-pointer text-rose-500"
                  >
                    <LogOut className="w-5 h-5 shrink-0" />
                    <span className="font-bold text-sm">
                      Log Out
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/login"
                className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center text-slate-700 hover:text-[#2563EB] transition-all active:scale-95"
              >
                <User className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </nav>

      <Sheet
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
      >
        <SheetContent
          side="left"
          className="w-[280px] p-0 border-none bg-white z-[2001] shadow-2xl [&>button]:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Sidebar</SheetTitle>
            <SheetDescription>Cracklix mobile navigation menu.</SheetDescription>
          </SheetHeader>

          <MobileSidebar onClose={() => setIsSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center px-4 py-2 rounded-xl font-bold text-[14px] tracking-tight transition-all",
        active
          ? "bg-blue-50 text-[#2563EB] shadow-sm"
          : "text-slate-400 hover:text-[#04102B] hover:bg-gray-50"
      )}
    >
      {label}
    </Link>
  );
}
