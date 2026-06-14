'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from "next/link";
import { Menu, Search, User, Gem, LogOut, Newspaper, Zap, Home, Download } from "lucide-react";
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

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

/**
 * @fileOverview Final Screenshot-Matched Navbar v264.0.
 * UPDATED: Restored INSTALL APP and LOGIN button styles from the reference image.
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

  if (!mounted) return <div className="w-full h-16 md:h-20 bg-[#0B1528]" />;

  return (
    <div className="sticky top-0 z-[1000] w-full pointer-events-auto font-body text-left">
      <nav className="w-full flex items-center bg-[#0B1528] border-b border-white/5 h-16 md:h-20 px-4 md:px-8 shadow-2xl">
        <div className="container mx-auto max-w-[1536px] flex items-center justify-between h-full gap-4">
          
          <div className="flex items-center gap-4 lg:gap-8 shrink-0">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="w-9 h-9 bg-white/5 text-white rounded-lg border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="pt-0.5">
              <Logo imgClassName="h-8 md:h-9 origin-left" />
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4 xl:gap-6 h-full">
            <NavLink icon={<Home className="h-4 w-4" />} label="HOME PAGE" href="/" active={pathname === "/"} />
            <NavLink icon={<Zap className="h-4 w-4" />} label="PRACTICE TESTS" href="/mocks" active={pathname.startsWith("/mocks")} />
            <NavLink icon={<Newspaper className="h-4 w-4" />} label="CURRENT AFFAIRS" href="/current-affairs" active={pathname === "/current-affairs"} />

            <Link href="/pass" className="transition-all active:scale-95 h-full flex items-center">
              <div className={cn(
                "px-4 h-9 rounded-lg border flex items-center justify-center gap-2 transition-all",
                "bg-white/5 border-white/10 hover:bg-white/10 text-white"
              )}>
                <Gem className="h-3.5 w-3.5 text-[#F97316]" />
                <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">GET PASS</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
             {/* RESTORED INSTALL APP BUTTON */}
             <Button asChild className="hidden sm:flex bg-[#F97316] hover:bg-orange-600 text-white font-black px-6 h-10 rounded-lg uppercase text-[10px] tracking-widest shadow-2xl border-none gap-2">
                <Link href="/download">
                   <Download className="h-3.5 w-3.5" /> INSTALL APP
                </Link>
             </Button>

             <Link href="/search" className="w-10 h-10 rounded-lg border border-white/10 transition-all flex items-center justify-center bg-white/5 text-slate-400 hover:text-white">
                <Search className="h-4.5 w-4.5" />
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
                     {isAdmin && (
                       <DropdownMenuItem asChild className="px-4 py-3.5 cursor-pointer rounded-xl focus:bg-white/10 group mt-1 border border-white/5">
                         <Link href="/admin" className="w-full flex items-center gap-4">
                           <User className="h-5 w-5 text-rose-500" />
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
                 <Button asChild className="bg-[#F97316] hover:bg-orange-600 text-white font-black px-6 h-10 rounded-lg uppercase text-[10px] tracking-widest shadow-2xl border-none">
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
             <SheetTitle>Navigation Sidebar</SheetTitle>
             <SheetDescription>Access all preparation resources.</SheetDescription>
          </SheetHeader>
          <MobileSidebar onClose={() => setIsSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function NavLink({ icon, label, href, active }: { icon: React.ReactNode, label: string, href: string, active: boolean }) {
  return (
    <Link href={href} className={cn(
      "flex items-center gap-2.5 transition-all h-10 px-4 rounded-lg",
      active ? "bg-[#F97316] text-white shadow-xl shadow-orange-500/20" : "text-slate-400 hover:text-white"
    )}>
      <span className={cn("shrink-0", active ? "text-white" : "text-slate-500")}>
        {icon}
      </span>
      <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{label}</span>
    </Link>
  )
}
