
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from "next/link";
import { 
  Search, 
  User, 
  LogOut, 
  Menu, 
  Home, 
  Zap, 
  Newspaper, 
  Gem, 
  ShieldCheck,
  Download,
  Loader2
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import MobileSidebar from "./MobileSidebar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Logo from "@/components/brand/Logo";
import { Skeleton } from "@/components/ui/skeleton";

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

/**
 * @fileOverview High-Density Master Navbar Hub v57.0.
 * UPDATED: Hardened auth rendering to eliminate login button flicker.
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
      console.error("[NAVBAR_LOGOUT_FAILURE]:", error);
    }
  };

  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || (user?.email && SUPER_ADMIN_WHITELIST.includes(user.email.toLowerCase()));

  const isActivePass = useMemo(() => {
     if (!profile?.pass?.active) return false;
     return new Date(profile.pass.expiryDate) > new Date();
  }, [profile]);

  if (!mounted) return null;

  return (
    <div className="w-full sticky top-0 z-[1000] font-body">
      <nav className="w-full border-b border-slate-100 bg-white/80 backdrop-blur-xl h-16 md:h-20 px-2 md:px-4 shadow-sm flex items-center overflow-hidden">
        <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between h-full gap-2">
          
          {/* LEFT: TRIGGER + LOGO */}
          <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="w-9 h-9 md:w-11 md:h-11 bg-slate-50 text-slate-400 rounded-lg md:rounded-xl border border-slate-100 flex items-center justify-center cursor-pointer active:scale-90 transition-all hover:bg-slate-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo imgClassName="h-9 md:h-14 lg:h-16" />
          </div>

          {/* CENTER: COMPACT NAV */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-3">
             <NavLink 
               href="/" 
               icon={<Home className="h-3.5 w-3.5" />} 
               label="Home" 
               active={pathname === '/'} 
             />
             <NavLink 
               href="/mocks" 
               icon={<Zap className="h-3.5 w-3.5" />} 
               label="Practice" 
               active={pathname === '/mocks'} 
             />
             <NavLink 
               href="/current-affairs" 
               icon={<Newspaper className="h-3.5 w-3.5" />} 
               label="Updates" 
               active={pathname === '/current-affairs'} 
             />
          </div>

          {/* RIGHT: ACTION NODES */}
          <div className="flex items-center justify-end gap-1.5 md:gap-3 shrink-0 flex-1 md:flex-none">
             
             <div className="hidden sm:block">
               <Button asChild className="h-9 md:h-11 px-3 md:px-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[8px] md:text-[9px] tracking-widest rounded-lg md:rounded-xl gap-2 shadow-lg border-none">
                  <Link href="/pass"><Gem className="h-3.5 w-3.5 text-white/80" /> Pass</Link>
               </Button>
             </div>

             {isActivePass && (
                <div className="hidden xs:flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                   <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                   <span className="text-[8px] font-black text-emerald-600">Active</span>
                </div>
             )}

             <Link href="/search" className="w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all">
                <Search className="h-4.5 w-4.5 md:h-5 md:w-5" />
             </Link>

             {/* AUTHENTICATION ACTION BLOCK - FLICKER-FREE */}
             {loading ? (
                <Skeleton className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-slate-100" />
             ) : user ? (
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <button className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-slate-100 overflow-hidden shadow-sm cursor-pointer bg-white active:scale-95 transition-transform flex items-center justify-center">
                      <StudentAvatar profile={profile} className="h-full w-full border-none" />
                   </button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-64 bg-white border-slate-100 rounded-[2rem] p-2 shadow-5xl z-[2001] mt-4">
                    <DropdownMenuItem asChild className="px-4 py-3 cursor-pointer rounded-xl focus:bg-slate-50">
                       <Link href="/profile" className="flex items-center gap-3">
                          <User className="h-5 w-5 text-blue-500" />
                          <span className="font-black text-xs tracking-tight text-slate-700">My Profile</span>
                       </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild className="px-4 py-3 cursor-pointer rounded-xl focus:bg-blue-50 mt-1 border border-blue-50">
                        <Link href="/admin" className="flex items-center gap-3">
                          <ShieldCheck className="h-5 w-5 text-blue-600" />
                          <span className="font-black text-xs tracking-tight text-blue-700">Admin Hub</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-slate-50 my-1" />
                    <DropdownMenuItem onClick={handleLogout} className="px-4 py-3 cursor-pointer rounded-xl focus:bg-rose-50 text-rose-500">
                       <LogOut className="h-5 w-5 shrink-0" />
                       <span className="font-black text-xs tracking-tight">Log Out</span>
                    </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
             ) : (
               <Button asChild className="px-4 md:px-5 h-9 md:h-10 bg-[#0F172A] hover:bg-black text-white font-black text-[9px] md:text-[10px] rounded-lg md:rounded-xl transition-all tracking-widest border-none">
                 <Link href="/login">Login</Link>
               </Button>
             )}
          </div>
        </div>
      </nav>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0 border-none w-[300px] bg-white z-[2001]">
          <SheetHeader className="sr-only">
             <SheetTitle>Navigation Sidebar</SheetTitle>
             <SheetDescription>Access institutional preparation resources and exam verticals.</SheetDescription>
          </SheetHeader>
          <MobileSidebar onClose={() => setIsSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function NavLink({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link href={href} className={cn(
      "flex items-center gap-2 px-3 xl:px-4 py-1.5 rounded-lg font-black text-[9px] tracking-widest transition-all shrink-0",
      active ? "bg-blue-50 text-blue-600 shadow-sm" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
    )}>
       {icon}
       <span>{label}</span>
    </Link>
  )
}
