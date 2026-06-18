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
 * @fileOverview Institutional Header v95.0 (Restored Branding).
 * RESTORED: Canonical Logo and Menu spacing.
 * FIXED: Normalized sizing for desktop/mobile brand nodes.
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
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between gap-4">

          {/* LEFT SIDE: Menu Hub + Logo Node */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
              className="flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm active:scale-95 transition-all shrink-0 hover:border-primary/30 z-10"
            >
              <Menu className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <Logo
              variant="light"
              className="shrink-0"
            />
          </div>

          {/* DESKTOP NAVIGATION (CENTERED) */}
          <div className="hidden lg:flex items-center justify-center gap-8 flex-1">
            <NavLink href="/" label="Home" active={pathname === '/'} />
            <NavLink href="/mocks" label="Practice" active={pathname === '/mocks'} />
            <NavLink href="/pyqs" label="Previous Papers" active={pathname === '/pyqs'} />
            <NavLink href="/current-affairs" label="Study Center" active={pathname === '/current-affairs'} />
          </div>

          {/* RIGHT SIDE: Action Hub */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <Link
              href="/search"
              className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center bg-slate-50 text-slate-600 hover:text-primary transition-all active:scale-95"
            >
              <Search className="w-5 h-5" />
            </Link>

            {loading ? (
              <Skeleton className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-slate-100" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-10 h-10 md:w-11 md:h-11 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center active:scale-95 transition-all">
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
                  className="w-[92vw] max-w-[420px] min-w-[280px] rounded-[28px] p-4 sm:p-6 bg-white border border-slate-200 shadow-[0_20px_60px_rgba(15,23,42,0.15)] z-[2001]"
                >
                  <DropdownMenuItem asChild className="rounded-2xl p-0 focus:bg-transparent cursor-default">
                    <div className="w-full">
                       <Link href="/profile" className="flex items-center gap-4 mb-4 group cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-all">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                             <User className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">{profile?.name || "Aspirant"}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">View Profile</p>
                          </div>
                       </Link>

                       {isAdmin && (
                         <div className="mb-4">
                            <Button asChild className="w-full h-12 rounded-xl text-sm font-black bg-primary hover:bg-blue-700 text-white shadow-lg border-none transition-all active:scale-95">
                               <Link href="/admin">
                                  <ShieldCheck className="h-5 w-5 mr-2" />
                                  Admin Control Hub
                               </Link>
                            </Button>
                         </div>
                       )}

                       <DropdownMenuSeparator className="my-2 bg-slate-100" />

                       <Button
                          variant="ghost"
                          onClick={handleLogout}
                          className="w-full h-12 justify-start text-red-500 font-bold rounded-xl hover:bg-red-50 hover:text-red-600 transition-all active:scale-95"
                       >
                          <LogOut className="h-5 w-5 mr-3" />
                          Sign Out
                       </Button>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="px-5 md:px-8 h-10 md:h-12 rounded-xl bg-primary text-white font-bold text-sm md:text-base flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-primary/20">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-[320px] p-0 border-none bg-white z-[2001] shadow-2xl [&>button]:hidden">
          <SheetHeader className="sr-only"><SheetTitle>Menu</SheetTitle><SheetDescription>Main menu navigation hub.</SheetDescription></SheetHeader>
          <MobileSidebar onClose={() => setIsSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active?: boolean; }) {
  return (
    <Link href={href} className={cn("text-sm font-bold tracking-tight transition-all", active ? "text-primary" : "text-slate-500 hover:text-[#04102B]")}>
      {label}
    </Link>
  );
}
