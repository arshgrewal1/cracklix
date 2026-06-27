'use client';

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import {
  Search,
  User,
  Menu,
  ShieldCheck,
  Gem,
  Settings,
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

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

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

  if (!mounted) {
    return <nav className="w-full border-b border-slate-100 bg-white h-[72px] md:h-[112px]" />;
  }

  return (
    <div className="sticky top-0 z-50 w-full font-body bg-white border-b border-slate-100 shadow-sm transition-all pt-safe">
      <nav className="w-full h-[72px] md:h-[112px]">
        <div className="w-full max-w-[1500px] 2xl:max-w-[1800px] mx-auto px-4 md:px-8 h-full flex items-center justify-between">

          {/* LEFT: Menu + Logo (Hard Left Shift) */}
          <div className="flex items-center shrink-0 gap-3 md:gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
              className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm active:scale-95 transition-all shrink-0 hover:border-primary/30 z-10"
            >
              <Menu className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <Logo
              variant="light"
              className="flex-shrink-0" 
              imgClassName="h-14 md:h-24 w-auto"
              align="left"
            />
          </div>

          {/* CENTER: Navigation Links (Title Case) */}
          <div className="hidden lg:flex items-center justify-center gap-6 xl:gap-10 flex-1">
            <NavLink href="/" label="Home" active={pathname === '/'} />
            <NavLink href="/exams" label="Mock Tests" active={pathname === '/exams'} />
            <NavLink href="/pyqs" label="Old Papers" active={pathname === '/pyqs'} />
            <NavLink href="/current-affairs" label="Current Affairs" active={pathname === '/current-affairs'} />
            <NavLink href="/leaderboard" label="Top Rankers" active={pathname === '/leaderboard'} />
          </div>

          {/* RIGHT: User Actions */}
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            {profile?.passStatus === 'active' && timeLeft && (
               <div className="hidden sm:flex flex-col items-end mr-1">
                  <span className="text-[8px] font-black text-emerald-600 tracking-tight leading-none uppercase">Elite Hub</span>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 leading-none">{timeLeft}</span>
               </div>
            )}

            <Link
              href="/search"
              className="w-10 h-10 md:h-12 rounded-xl flex items-center justify-center bg-slate-50 text-slate-600 hover:text-primary transition-all active:scale-95 shadow-sm"
            >
              <Search className="w-5 h-5" />
            </Link>

            {loading ? (
              <Skeleton className="w-10 h-10 md:h-12 rounded-xl bg-slate-100" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-10 h-10 md:h-12 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center active:scale-95 transition-all shadow-sm">
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
                  className="w-[280px] rounded-[24px] p-4 bg-white border border-[#EEF2F7] shadow-[0_12px_30px_rgba(15,23,42,0.08)] z-[2001]"
                >
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="flex flex-col items-center gap-4">
                       <div className="h-14 w-14 rounded-2xl bg-[#EEF4FF] flex items-center justify-center text-[#2563EB] shadow-sm relative">
                          <User className="h-7 w-7" />
                       </div>
                       <div className="space-y-0.5">
                         <h3 className="text-base font-bold text-[#0F172A] tracking-tight truncate max-w-[240px]">
                           {profile?.name || "Student"}
                         </h3>
                         <Link href="/profile" className="text-[11px] font-bold text-[#94A3B8] hover:text-primary">My Profile</Link>
                       </div>
                    </div>
                    <div className="h-px w-full bg-slate-100" />
                    <div className="w-full space-y-1 text-left">
                       <ProfileMenuItem href="/dashboard" icon={ShieldCheck} label="My Progress" />
                       <ProfileMenuItem href="/pass" icon={Gem} label="Pro Pass" />
                       <ProfileMenuItem href="/profile" icon={Settings} label="Settings" />
                       {isAdmin && <ProfileMenuItem href="/admin" icon={ShieldCheck} label="Admin Panel" highlight />}
                    </div>
                    <Button onClick={handleLogout} variant="ghost" className="w-full h-11 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#EF4444] font-bold text-[11px] rounded-xl transition-all border-none">Log Out</Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="px-4 md:px-6 h-10 md:h-12 rounded-xl bg-primary text-white font-bold text-[11px] md:text-xs flex items-center justify-center transition-all active:scale-95 shadow-md">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-[280px] p-0 border-none bg-white z-[2001] shadow-2xl [&>button]:hidden">
          <SheetHeader className="sr-only"><SheetTitle>Menu</SheetTitle><SheetDescription>Navigation Hub</SheetDescription></SheetHeader>
          <MobileSidebar onClose={() => setIsSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active?: boolean; }) {
  return (
    <Link href={href} className={cn(
      "text-[15px] xl:text-[17px] font-bold transition-all whitespace-nowrap border-b-2 py-1", 
      active ? "text-primary border-primary" : "text-slate-500 border-transparent hover:text-primary hover:border-primary/20"
    )}>
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
