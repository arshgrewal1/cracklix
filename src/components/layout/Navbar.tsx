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
  Settings,
  HelpCircle,
  CreditCard,
  Clock
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
import PWAInstallButton from "@/components/PWAInstallButton";

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

/**
 * @fileOverview Standardized Navbar v55.0 (High Resolution Logo).
 */
export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  const { user, profile, loading } = useUser();
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const expiryStr = profile?.passExpiresAt;
    if (!expiryStr) return;
    
    const expiryDate = new Date(expiryStr);
    if (isNaN(expiryDate.getTime())) return;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = expiryDate.getTime() - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(interval);
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (d > 0) setTimeLeft(`${d}d left`);
      else if (h > 0) setTimeLeft(`${h}h left`);
      else setTimeLeft(`${m}m left`);
    }, 1000);

    return () => clearInterval(interval);
  }, [profile?.passExpiresAt]);

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

  const passLabel = useMemo(() => {
    if (!profile?.pass?.plan) return 'Free Pass';
    const plan = profile.pass.plan;
    return plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase().replace('_pass', '');
  }, [profile]);

  if (!mounted) {
    return <nav className="w-full border-b border-slate-100 bg-white h-[64px] md:h-[88px]" />;
  }

  return (
    <div className="sticky top-0 z-50 w-full font-body">
      <nav className="w-full h-[64px] md:h-[88px] bg-white border-b border-slate-100 shadow-sm transition-all duration-300">
        <div className="w-full max-w-7xl mx-auto px-3 md:px-4 h-full flex items-center justify-between gap-1 md:gap-2">

          <div className="flex items-center shrink-0 h-full">
            <button
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
              className="flex items-center justify-center w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm active:scale-95 transition-all shrink-0 hover:border-primary/30 mr-1"
            >
              <Menu className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <Logo
              variant="light"
              className="flex-shrink-0"
              imgClassName="h-[40px] md:h-[52px]"
            />
          </div>

          <div className="hidden lg:flex items-center justify-center gap-8 flex-1">
            <NavLink href="/" label="Home" active={pathname === '/'} />
            <NavLink href="/exams" label="View Exams" active={pathname === '/exams'} />
            <NavLink href="/pyqs" label="Previous Papers" active={pathname === '/pyqs'} />
            <NavLink href="/current-affairs" label="Study Material" active={pathname === '/current-affairs'} />
          </div>

          <div className="flex items-center gap-1 md:gap-4 shrink-0">
            {profile?.passStatus === 'active' && timeLeft && (
               <div className="hidden sm:flex flex-col items-end mr-2">
                  <span className="text-[8px] font-black uppercase text-emerald-600 tracking-widest leading-none">PREMIUM</span>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 leading-none">{timeLeft}</span>
               </div>
            )}

            <PWAInstallButton 
              variant="outline"
              className="hidden md:flex h-9 px-4 text-[9px] rounded-lg border-slate-200"
            />

            <Link
              href="/search"
              className="w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl flex items-center justify-center bg-slate-50 text-slate-600 hover:text-primary transition-all active:scale-95"
            >
              <Search className="w-5 h-5" />
            </Link>

            {loading ? (
              <Skeleton className="w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-slate-100" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-9 h-9 md:h-12 rounded-lg md:rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center active:scale-95 transition-all">
                    <StudentAvatar
                      profile={profile}
                      className="w-full h-full border-none"
                      iconClassName="w-5 h-5 md:w-6 md:h-6"
                    />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  sideOffset={12}
                  className="w-[280px] xs:w-[320px] max-h-[85vh] overflow-y-auto custom-scrollbar rounded-[24px] md:rounded-[28px] p-4 xs:p-6 bg-white border border-[#EEF2F7] shadow-[0_12px_30px_rgba(15,23,42,0.08)] z-[2001]"
                >
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="flex flex-col items-center gap-4">
                       <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-[#EEF4FF] flex items-center justify-center text-[#2563EB] shadow-sm relative">
                          <User className="h-7 v-7 md:h-8 md:w-8" />
                       </div>
                       <div className="space-y-0.5">
                         <h3 className="text-base md:text-xl font-bold text-[#0F172A] tracking-tight truncate max-w-[240px]">
                           {profile?.name || "Aspirant"}
                         </h3>
                         <Link href="/profile" className="text-[11px] md:text-[13px] font-bold text-[#94A3B8] hover:text-primary">View Profile</Link>
                       </div>
                    </div>
                    <div className="h-px w-full bg-slate-100" />
                    <div className="w-full space-y-1 text-left">
                       <ProfileMenuItem href="/dashboard" icon={ShieldCheck} label="My Progress" />
                       <ProfileMenuItem href="/pass" icon={CreditCard} label="My Pass" />
                       <ProfileMenuItem href="/profile" icon={Settings} label="Settings" />
                       {isAdmin && <ProfileMenuItem href="/admin" icon={ShieldCheck} label="Admin Panel" highlight />}
                    </div>
                    <Button onClick={handleLogout} className="w-full h-11 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#EF4444] font-bold text-[11px] rounded-xl transition-all border-none">Log Out</Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="px-5 h-10 rounded-lg md:rounded-xl bg-primary text-white font-bold text-xs flex items-center justify-center transition-all active:scale-95 shadow-md">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-[280px] xs:w-[320px] p-0 border-none bg-white z-[2001] shadow-2xl [&>button]:hidden">
          <SheetHeader className="sr-only"><SheetTitle>Menu</SheetTitle><SheetDescription>Navigation</SheetDescription></SheetHeader>
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

function ProfileMenuItem({ href, icon: Icon, label, highlight }: { href: string, icon: any, label: string, highlight?: boolean }) {
  return (
    <Link href={href} className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-xs font-bold",
      highlight ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
    )}>
       <Icon className={cn("h-4 w-4 shrink-0", highlight ? "text-primary" : "text-slate-400")} />
       <span className="truncate">{label}</span>
    </Link>
  )
}
