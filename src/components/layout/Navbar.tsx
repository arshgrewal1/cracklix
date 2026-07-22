
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
  ChevronLeft
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
  SheetTrigger,
} from "@/components/ui/sheet";
import MobileSidebar from "./MobileSidebar";
import { cn } from "@/lib/utils";
import Logo from "@/components/brand/Logo";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { canAccessAdmin } from "@/lib/permissions";

/**
 * @fileOverview Cracklix Navigation Hub v126.0.
 * UPDATED: Reduced header height to h-[84px] md:h-[116px] to decrease extra space.
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
    if (!mounted) return;
    const expiryStr = profile?.passExpiresAt;
    if (!expiryStr) {
      setTimeLeft("");
      return;
    }
    
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
  }, [profile?.passExpiresAt, mounted]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {}
  };

  const isAdmin = React.useMemo(() => {
     return canAccessAdmin(profile, user?.email);
  }, [user, profile]);

  if (!mounted) {
    return <nav className="w-full border-b border-slate-100 bg-white h-[84px] md:h-[116px]" />;
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 pt-safe">
        <nav className="w-full h-[84px] md:h-[116px] transition-all">
          <div className="relative w-full max-w-[1500px] 2xl:max-w-[1800px] mx-auto px-4 h-full flex items-center justify-between">

            <div className="flex items-center gap-0 z-10 shrink-0 h-full">
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <button
                    aria-label="Open menu"
                    className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm active:scale-95 transition-all shrink-0 hover:border-primary/30 cursor-pointer"
                  >
                    <Menu className="w-6 h-6 md:w-7 md:h-7" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] p-0 border-none bg-white z-[2001] shadow-2xl [&>button]:hidden">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Menu</SheetTitle>
                    <SheetDescription>Navigation Menu</SheetDescription>
                  </SheetHeader>
                  <MobileSidebar onClose={() => setIsSidebarOpen(false)} />
                </SheetContent>
              </Sheet>

              <Logo
                variant="light"
                className="flex-shrink-0 p-0 h-full"
                imgClassName="h-20 md:h-28 w-auto"
                align="left"
              />
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-6 xl:gap-8 h-full">
              <NavLink href="/" label="Home" active={pathname === '/'} />
              <NavLink href="/exams" label="Mock Tests" active={pathname === '/exams'} />
              <NavLink href="/vacancies" label="Vacancies" active={pathname === '/vacancies'} />
              <NavLink href="/pyqs" label="Old Papers" active={pathname === '/pyqs'} />
              <NavLink href="/current-affairs" label="Current Affairs" active={pathname === '/current-affairs'} />
            </div>

            <div className="flex items-center gap-2 md:gap-4 lg:gap-6 z-10 shrink-0">
              {profile?.passStatus === 'active' && timeLeft && (
                 <div className="hidden lg:flex flex-col items-end shrink-0">
                    <span className="text-[9px] font-bold text-emerald-600 leading-none">Elite Access</span>
                    <span className="text-[11px] font-medium text-slate-400 mt-1.5 leading-none tabular-nums">{timeLeft}</span>
                 </div>
              )}

              <Link
                href="/search"
                className="w-10 h-10 md:w-12 rounded-lg flex items-center justify-center bg-slate-50 text-slate-600 hover:text-primary transition-all active:scale-95 shadow-sm shrink-0"
              >
                <Search className="w-6 h-6" />
              </Link>

              {loading ? (
                <Skeleton className="w-10 h-10 md:w-12 rounded-lg bg-slate-100 shrink-0" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-10 h-10 md:w-12 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center active:scale-95 transition-all shadow-sm shrink-0">
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
                    className="w-[280px] rounded-[24px] p-4 bg-white border border-[#EEF2F7] shadow-xl z-[2001]"
                  >
                    <div className="flex flex-col items-center text-center space-y-6">
                      <div className="flex flex-col items-center gap-4">
                         <div className="h-14 w-14 rounded-2xl bg-[#EEF4FF] flex items-center justify-center text-[#2563EB] shadow-sm relative overflow-hidden">
                            <StudentAvatar profile={profile} className="w-full h-full" iconClassName="h-8 w-8" />
                         </div>
                         <div className="space-y-0.5">
                           <h3 className="text-base font-bold text-[#0F172A] truncate max-w-[240px]">
                             {profile?.name || "Aspirant"}
                           </h3>
                           <Link href="/profile" className="text-[11px] font-medium text-[#94A3B8] hover:text-primary">My Profile</Link>
                         </div>
                      </div>
                      <div className="h-px w-full bg-slate-100" />
                      <div className="w-full space-y-1 text-left">
                         <ProfileMenuItem href="/dashboard" icon={ShieldCheck} label="My Progress" />
                         <ProfileMenuItem href="/pass" icon={Gem} label="Elite Pass Hub" />
                         {isAdmin && <ProfileMenuItem href="/admin" icon={ShieldCheck} label="Admin Console" />}
                         <ProfileMenuItem href="/profile" icon={Settings} label="Portal Settings" />
                      </div>
                      <Button onClick={handleLogout} variant="ghost" className="w-full h-11 bg-rose-50 hover:bg-rose-100 text-rose-500 font-bold text-[11px] rounded-xl transition-all border-none">Log Out</Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login" className="px-6 h-11 rounded-lg bg-primary text-white font-bold text-sm flex items-center justify-center transition-all active:scale-95 shadow-md shrink-0">
                  Login
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>
    </>
  );

  function NavLink({ href, label, active }: { href: string; label: string; active?: boolean; }) {
    return (
      <Link href={href} className={cn(
        "text-[14px] xl:text-[15px] font-bold transition-all whitespace-nowrap border-b-2 py-1", 
        active ? "text-primary border-primary" : "text-slate-400 border-transparent hover:text-primary hover:border-primary/20"
      )}>
        {label}
      </Link>
    );
  }

  function ProfileMenuItem({ href, icon: Icon, label }: { href: string, icon: any, label: string }) {
    return (
      <Link href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-[13px] font-semibold text-slate-600 hover:bg-slate-50">
         <Icon className="h-4 w-4 shrink-0 text-slate-400" />
         <span className="truncate">{label}</span>
      </Link>
    );
  }
}
