'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from "next/link";
import { Menu, Search, User, Gem, LogOut, Newspaper, Download, Zap, Home, ShieldCheck, Smartphone } from "lucide-react";
import Logo from "@/components/brand/Logo";
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
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import MobileSidebar from "./MobileSidebar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import PWAInstallButton from "@/components/PWAInstallButton";

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

/**
 * @fileOverview High-Fidelity Mobile-First Navbar v200.0.
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

  const isAdmin = useMemo(() => {
    if (!user) return false;
    const email = user.email?.toLowerCase();
    const isFounder = email && SUPER_ADMIN_WHITELIST.includes(email);
    return profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || isFounder;
  }, [user, profile]);

  const passStatus = useMemo(() => {
    if (!profile?.pass) return { active: false, label: "NO PASS", expiry: "N/A" };
    const active = profile.pass.active;
    const expiryDate = new Date(profile.pass.expiryDate);
    const isExpired = expiryDate < new Date();
    
    return {
      active: active && !isExpired,
      label: isExpired ? "EXPIRED" : "PASS ACTIVE",
      expiry: expiryDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    };
  }, [profile]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const headerHeightClass = "h-[var(--header-height)]";

  if (!mounted) {
    return (
      <nav className={cn("w-full flex items-center bg-[#0B1528] px-4", headerHeightClass)}>
        <div className="container mx-auto flex justify-between">
          <div className="w-8 h-8 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-6 w-24 bg-white/5 rounded-lg animate-pulse" />
          <div className="w-8 h-8 bg-white/5 rounded-full animate-pulse" />
        </div>
      </nav>
    );
  }

  return (
    <div className="sticky top-0 z-[1000] w-full pointer-events-auto font-body text-left">
      <nav className={cn(
        "w-full flex items-center bg-[#0B1528] border-b border-white/5 px-4 md:px-6 lg:px-8 shadow-2xl overflow-visible backdrop-blur-xl",
        headerHeightClass
      )}>
        <div className="container mx-auto max-w-[1536px] flex items-center justify-between h-full gap-2">
          
          <div className="flex items-center gap-2 md:gap-4 lg:gap-6 shrink-0 h-full">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="w-10 h-10 bg-white/5 text-white rounded-[12px] border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center cursor-pointer active:scale-90 outline-none"
            >
              <Menu className="h-5 w-5 md:h-6 md:w-6" />
            </button>
            
            <div className="flex items-center shrink-0 h-full overflow-visible">
               <Logo 
                 imgClassName="h-[120px] md:h-[140px] origin-left transition-all" 
                 className="active:scale-95 transition-transform" 
               />
            </div>
          </div>

          <div className="hidden lg:flex flex-1 items-center justify-center gap-6 xl:gap-10 h-full">
            <NavLink icon={<Home />} label1="HOME" label2="PAGE" href="/" active={pathname === "/"} />
            <NavLink icon={<Zap />} label1="PRACTICE" label2="TESTS" href="/mocks" active={pathname.startsWith("/mocks")} />
            <NavLink icon={<Newspaper />} label1="CURRENT" label2="AFFAIRS" href="/current-affairs" active={pathname === "/current-affairs"} />

            <Link href="/pass" className="transition-all active:scale-95 group h-full flex items-center">
              <div className={cn(
                "px-5 h-[38px] min-w-[120px] rounded-[12px] border flex items-center justify-center gap-2.5 transition-all shadow-lg",
                pathname === "/pass" 
                  ? "bg-[#F97316] border-[#F97316] text-white" 
                  : "bg-[#F97316]/10 border-[#F97316]/30 hover:bg-[#F97316]/20"
              )}>
                <Gem className={cn("h-3.5 w-3.5", pathname === "/pass" ? "text-white fill-white" : "text-[#F97316]")} />
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-white whitespace-nowrap">GET PASS</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-4 lg:gap-5 shrink-0 h-full">
             <div className="hidden md:block">
               <PWAInstallButton className="h-[38px] px-5 rounded-xl border-none bg-primary hover:bg-orange-600 text-white" />
             </div>

             {user && (
                <div 
                  onClick={() => router.push('/pass')}
                  className={cn(
                    "hidden sm:flex h-[38px] px-4 min-w-[130px] rounded-xl items-center justify-center gap-2.5 shadow-xl shrink-0 group border transition-all cursor-pointer active:scale-95",
                    passStatus.active ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30"
                  )}
                >
                   <Gem className={cn("h-4 w-4 fill-current", passStatus.active ? "text-emerald-400" : "text-rose-400")} />
                   <div className="flex flex-col text-left leading-none gap-0.5">
                      <span className={cn("text-[9px] font-black uppercase whitespace-nowrap", passStatus.active ? "text-emerald-400" : "text-rose-400")}>
                        {passStatus.label}
                      </span>
                      <span className="text-[7.5px] text-slate-500 font-bold uppercase whitespace-nowrap">
                         {passStatus.active ? `EXP: ${passStatus.expiry}` : "UNLOCK NOW"}
                      </span>
                   </div>
                </div>
             )}

             <Link href="/search" className={cn(
               "w-9 h-9 md:w-[40px] md:h-[40px] rounded-xl border border-white/10 transition-all flex items-center justify-center shadow-lg active:scale-90 shrink-0",
               pathname === "/search" ? "bg-white/10 text-white border-white/30" : "bg-white/5 text-slate-400 hover:text-white"
             )}>
                <Search className="h-[18px] w-[18px] md:h-[22px] md:w-[22px]" />
             </Link>

             <div className="relative">
               {user ? (
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <button className="w-9 h-9 md:w-[40px] md:h-[40px] rounded-full overflow-hidden border-[2px] border-white/10 hover:border-primary transition-all bg-white shadow-2xl focus:outline-none flex items-center justify-center active:scale-90 cursor-pointer shrink-0">
                       <StudentAvatar profile={profile} className="h-full w-full border-none" iconClassName="text-[#0B1528]" />
                     </button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent className="w-64 bg-[#0F172A] border-white/10 text-white rounded-2xl p-2 shadow-5xl z-[2001] mt-2" align="end">
                     <div className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">STUDENT GATEWAY</div>
                     <DropdownMenuItem asChild className="flex items-center gap-4 px-4 py-3.5 cursor-pointer rounded-xl transition-all focus:bg-white/5 focus:text-white group">
                       <Link href="/profile" className="w-full flex items-center gap-4">
                         <User className="h-5 w-5 text-blue-400" />
                         <span className="font-bold text-[14px] tracking-tight uppercase">MY PROFILE</span>
                       </Link>
                     </DropdownMenuItem>
                     <DropdownMenuItem asChild className="flex items-center gap-4 px-4 py-3.5 cursor-pointer rounded-xl transition-all focus:bg-white/5 focus:text-white group">
                       <Link href="/my-exams" className="w-full flex items-center gap-4">
                         <ShieldCheck className="h-5 w-5 text-emerald-400" />
                         <span className="font-bold text-[14px] tracking-tight uppercase">MY RESULTS</span>
                       </Link>
                     </DropdownMenuItem>
                     {isAdmin && (
                       <DropdownMenuItem asChild className="flex items-center gap-4 px-4 py-3.5 cursor-pointer rounded-xl transition-all bg-white/5 focus:bg-white/10 group mt-1 border border-white/5">
                         <Link href="/admin" className="w-full flex items-center gap-4">
                           <Smartphone className="h-5 w-5 text-rose-500" />
                           <span className="font-bold text-[14px] tracking-tight uppercase text-white">ADMIN HUB</span>
                         </Link>
                       </DropdownMenuItem>
                     )}
                     <DropdownMenuSeparator className="bg-white/5 my-2" />
                     <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-4 px-4 py-3.5 cursor-pointer rounded-xl transition-all focus:bg-rose-50/10 group">
                       <LogOut className="h-5 w-5 shrink-0 text-rose-500" />
                       <span className="font-bold text-[14px] tracking-tight uppercase text-rose-500">LOG OUT</span>
                     </DropdownMenuItem>
                   </DropdownMenuContent>
                 </DropdownMenu>
               ) : (
                 <Button asChild className="bg-primary hover:bg-orange-600 text-white font-black px-5 md:px-7 h-9 md:h-11 uppercase text-[10px] md:text-[12px] tracking-[0.1em] shadow-xl border-none transition-all active:scale-95">
                   <Link href="/login">Login</Link>
                 </Button>
               )}
             </div>
          </div>
        </div>
      </nav>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0 border-none w-[300px] bg-[#0F172A] z-[2001]">
          <SheetHeader className="sr-only">
             <SheetTitle>Mobile Navigation Sidebar</SheetTitle>
             <SheetDescription>Main navigation menu for mobile users to access practice tests, results and profile.</SheetDescription>
          </SheetHeader>
          <MobileSidebar onClose={() => setIsSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function NavLink({ icon, label1, label2, href, active }: { icon: React.ReactNode, label1: string, label2: string, href: string, active: boolean }) {
  return (
    <Link href={href} className={cn(
      "flex items-center gap-3 group transition-all active:scale-95 h-full",
      active ? "opacity-100" : "opacity-60 hover:opacity-100"
    )}>
      <div className={cn(
        "h-9 w-9 rounded-[11px] flex items-center justify-center shadow-md transition-all",
        active ? "bg-[#F97316] text-white" : "bg-white/5 text-slate-400 group-hover:text-[#F97316]"
      )}>
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: "h-4.5 w-4.5" }) : icon}
      </div>
      <div className="flex flex-col text-left leading-none gap-0.5">
        <span className={cn("text-[10px] font-black uppercase tracking-widest", active ? "text-[#F97316]" : "text-white")}>{label1}</span>
        <span className={cn("text-[10px] font-black uppercase tracking-widest", active ? "text-[#F97316]" : "text-white")}>{label2}</span>
      </div>
    </Link>
  )
}
