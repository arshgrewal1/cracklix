'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from "next/link";
import { Menu, Search, User, Gem, LogOut, Newspaper, Zap, Home, ShieldCheck, Smartphone } from "lucide-react";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import MobileSidebar from "./MobileSidebar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import PWAInstallButton from "@/components/PWAInstallButton";

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

/**
 * @fileOverview Final Screenshot-Matched Navbar v253.0.
 * UPDATED: Logo height calibrated to 230px as requested.
 */
export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, profile } = useUser();
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

  const isAdmin = useMemo(() => {
    if (!user) return false;
    const email = user.email?.toLowerCase();
    const isFounder = email && SUPER_ADMIN_WHITELIST.includes(email);
    return profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || isFounder;
  }, [user, profile]);

  const headerHeightClass = "h-[var(--header-height)]";

  if (!mounted) return <div className={cn("w-full bg-[#0B1528]", headerHeightClass)} />;

  return (
    <div className="sticky top-0 z-[1000] w-full pointer-events-auto font-body text-left">
      <nav className={cn(
        "w-full flex items-center bg-[#0B1528] border-b border-white/5 px-4 md:px-8 shadow-2xl backdrop-blur-2xl",
        headerHeightClass
      )}>
        <div className="container mx-auto max-w-[1536px] flex items-center justify-between h-full gap-4">
          
          <div className="flex items-center gap-4 md:gap-8 shrink-0 h-full">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="w-10 h-10 bg-white/5 text-white rounded-xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center cursor-pointer"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <Logo imgClassName="h-[180px] md:h-[230px] origin-left" />
          </div>

          <div className="hidden lg:flex flex-1 items-center justify-center gap-8 xl:gap-12 h-full">
            <NavLink icon={<Home />} label1="HOME" label2="PAGE" href="/" active={pathname === "/"} />
            <NavLink icon={<Zap />} label1="PRACTICE" label2="TESTS" href="/mocks" active={pathname.startsWith("/mocks")} />
            <NavLink icon={<Newspaper />} label1="CURRENT" label2="AFFAIRS" href="/current-affairs" active={pathname === "/current-affairs"} />

            <Link href="/pass" className="transition-all active:scale-95 group h-full flex items-center">
              <div className={cn(
                "px-5 h-10 min-w-[130px] rounded-xl border flex items-center justify-center gap-3 transition-all shadow-xl",
                pathname === "/pass" 
                  ? "bg-[#F97316] border-[#F97316] text-white" 
                  : "bg-white/5 border-white/10 hover:bg-white/10 text-primary"
              )}>
                <Gem className="h-4 w-4 fill-current text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap">GET PASS</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0 h-full">
             <div className="hidden md:block">
               <PWAInstallButton 
                 className="h-10 px-6 rounded-xl bg-[#F97316] hover:bg-orange-600 text-white font-black uppercase text-[10px] tracking-widest border-none shadow-2xl gap-3" 
                 variant="primary"
               />
             </div>

             <Link href="/search" className={cn(
               "w-10 h-10 rounded-xl border border-white/10 transition-all flex items-center justify-center shadow-lg bg-white/5 text-slate-400 hover:text-white"
             )}>
                <Search className="h-5 w-5" />
             </Link>

             <div className="relative">
               {user ? (
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <button className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 hover:border-primary transition-all bg-white shadow-2xl flex items-center justify-center cursor-pointer">
                       <StudentAvatar profile={profile} className="h-full w-full border-none" iconClassName="text-[#0B1528]" />
                     </button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent className="w-64 bg-[#0F172A] border-white/10 text-white rounded-2xl p-2 shadow-5xl z-[2001] mt-2" align="end">
                     <DropdownMenuItem asChild className="px-4 py-3.5 cursor-pointer rounded-xl focus:bg-white/5 group">
                       <Link href="/profile" className="w-full flex items-center gap-4">
                         <User className="h-5 w-5 text-blue-400" />
                         <span className="font-bold text-[14px] tracking-tight uppercase">MY PROFILE</span>
                       </Link>
                     </DropdownMenuItem>
                     <DropdownMenuItem asChild className="px-4 py-3.5 cursor-pointer rounded-xl focus:bg-white/5 group">
                       <Link href="/my-exams" className="w-full flex items-center gap-4">
                         <ShieldCheck className="h-5 w-5 text-emerald-400" />
                         <span className="font-bold text-[14px] tracking-tight uppercase">MY RESULTS</span>
                       </Link>
                     </DropdownMenuItem>
                     {isAdmin && (
                       <DropdownMenuItem asChild className="px-4 py-3.5 cursor-pointer rounded-xl focus:bg-white/10 group mt-1 border border-white/5">
                         <Link href="/admin" className="w-full flex items-center gap-4">
                           <Smartphone className="h-5 w-5 text-rose-500" />
                           <span className="font-bold text-[14px] tracking-tight uppercase text-white">ADMIN HUB</span>
                         </Link>
                       </DropdownMenuItem>
                     )}
                     <DropdownMenuSeparator className="bg-white/5 my-2" />
                     <DropdownMenuItem onClick={handleLogout} className="px-4 py-3.5 cursor-pointer rounded-xl focus:bg-rose-50/10 text-rose-500">
                       <LogOut className="h-5 w-5 shrink-0" />
                       <span className="font-bold text-[14px] tracking-tight uppercase">LOG OUT</span>
                     </DropdownMenuItem>
                   </DropdownMenuContent>
                 </DropdownMenu>
               ) : (
                 <Button asChild className="bg-[#F97316] hover:bg-orange-600 text-white font-black px-7 h-11 uppercase text-[11px] tracking-widest shadow-2xl border-none transition-all active:scale-95">
                   <Link href="/login">LOGIN</Link>
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
      "flex items-center gap-4 group transition-all active:scale-95 h-full",
      active ? "opacity-100" : "opacity-60 hover:opacity-100"
    )}>
      <div className={cn(
        "h-10 w-10 rounded-[12px] flex items-center justify-center shadow-lg transition-all",
        active ? "bg-[#F97316] text-white" : "bg-white/5 text-slate-400 group-hover:text-[#F97316]"
      )}>
        {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5" })}
      </div>
      <div className="flex flex-col text-left leading-none gap-0.5">
        <span className={cn("text-[11px] font-black uppercase tracking-widest", active ? "text-[#F97316]" : "text-white")}>{label1}</span>
        <span className={cn("text-[11px] font-black uppercase tracking-widest", active ? "text-[#F97316]" : "text-white")}>{label2}</span>
      </div>
    </Link>
  )
}
