
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from "next/link";
import {
  Search,
  User,
  LogOut,
  Menu,
  ShieldCheck,
  ChevronRight,
  Gem,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Badge } from "@/components/ui/badge";

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

/**
 * @fileOverview Institutional Header v108.0 (Verification Status Sync).
 */
export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { user, profile, loading, emailVerified } = useUser();
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

  const passDaysLeft = useMemo(() => {
    if (!profile?.passExpiresAt) return null;
    const expiry = new Date(profile.passExpiresAt);
    const now = new Date();
    const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [profile]);

  if (!mounted) {
    return <nav className="w-full border-b border-slate-100 bg-white h-20" />;
  }

  return (
    <div className="sticky top-0 z-50 w-full font-body">
      <nav className="w-full h-20 bg-white border-b border-slate-100 shadow-sm">
        <div className="w-full max-w-7xl mx-auto px-2 md:px-4 h-full flex items-center justify-between gap-2 md:gap-4">

          <div className="flex items-center shrink-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
              className="flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm active:scale-95 transition-all shrink-0 hover:border-primary/30"
            >
              <Menu className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <Logo
              variant="light"
              className="ml-1 flex-shrink-0"
              imgClassName="h-[64px] md:h-[72px]"
            />
          </div>

          <div className="hidden lg:flex items-center justify-center gap-8 flex-1">
            <NavLink href="/" label="Home" active={pathname === '/'} />
            <NavLink href="/mocks" label="Practice" active={pathname === '/mocks'} />
            <NavLink href="/pyqs" label="Previous Papers" active={pathname === '/pyqs'} />
            <NavLink href="/current-affairs" label="Study Center" active={pathname === '/current-affairs'} />
          </div>

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
                  className="w-[92vw] max-w-[340px] sm:w-[320px] rounded-[28px] p-6 bg-white border border-[#EEF2F7] shadow-[0_12px_30px_rgba(15,23,42,0.08)] z-[2001]"
                >
                  <div className="flex flex-col items-center text-center space-y-6">
                    
                    <div className="h-16 w-16 rounded-2xl bg-[#EEF4FF] flex items-center justify-center text-[#2563EB] shadow-sm border border-blue-50 relative">
                       <User className="h-8 w-8" />
                       {emailVerified && (
                         <div className="absolute -top-1 -right-1 bg-emerald-500 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                            <ShieldCheck className="h-3 w-3 text-white" />
                         </div>
                       )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl md:text-2xl font-[800] text-[#0F172A] tracking-tight leading-tight truncate w-full px-2">
                        {profile?.name || "Aspirant"}
                      </h3>
                      <Link 
                        href="/profile" 
                        className="text-[13px] font-[700] text-[#94A3B8] uppercase tracking-[0.15em] hover:text-primary transition-colors flex items-center justify-center gap-1"
                      >
                        View Profile <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    {!emailVerified && (
                      <Link href="/verify-email" className="w-full p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex flex-col gap-1 group">
                         <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-widest">UNVERIFIED NODE</p>
                            <AlertCircle className="h-3.5 w-3.5 animate-pulse" />
                         </div>
                         <p className="text-[11px] font-bold text-rose-400 mt-1 group-hover:underline">Click to verify account</p>
                      </Link>
                    )}

                    <div className="w-full p-4 bg-[#DBEAFE]/40 text-[#2563EB] rounded-2xl border border-blue-50/50 flex flex-col gap-1">
                       <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black uppercase tracking-widest leading-none">
                            {profile?.status?.toUpperCase() || "FREE"} PASS
                          </p>
                          <Gem className="h-3.5 w-3.5 animate-pulse" />
                       </div>
                       <p className="text-[12px] font-bold text-slate-500 mt-1">
                         {passDaysLeft !== null ? `${passDaysLeft} Days Remaining` : "Active Subscription"}
                       </p>
                    </div>

                    {isAdmin && (
                      <Button asChild className="w-full h-12 rounded-2xl text-sm font-black bg-[#0F172A] hover:bg-black text-white shadow-lg border-none transition-all active:scale-95">
                         <Link href="/admin">
                            <ShieldCheck className="h-5 w-5 mr-2 text-primary" />
                            Admin Control Hub
                          </Link>
                      </Button>
                    )}

                    <div className="w-full pt-2">
                       <Button
                          onClick={handleLogout}
                          className="w-full h-12 justify-between px-6 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#EF4444] font-black text-sm rounded-[14px] transition-all active:scale-95 border-none shadow-none group"
                       >
                          <span>Log Out</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                       </Button>
                    </div>
                  </div>
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
