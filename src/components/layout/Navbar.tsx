'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from "next/link";
import { 
  Search, 
  User, 
  LogOut, 
  Menu, 
  Gem, 
  ShieldCheck,
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
 * @fileOverview Native-Scaled Navbar Hub v66.0.
 * UPDATED: Mobile height set to 72px with 48x48 icon targets and 48px pass button.
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

  if (!mounted) return (
    <nav className="w-full border-b border-slate-100 bg-white h-[72px] md:h-20" />
  );

  return (
    <div className="w-full sticky top-0 z-[1000] font-body">
      <nav className="w-full border-b border-slate-100 bg-white/80 backdrop-blur-xl h-[72px] md:h-20 px-4 md:px-6 shadow-sm flex items-center overflow-hidden">
        <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between h-full gap-2 md:gap-4">
          
          {/* LEFT: TRIGGER + LOGO */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="w-12 h-12 md:w-12 md:h-12 bg-slate-50 text-slate-400 rounded-2xl border border-slate-100 flex items-center justify-center cursor-pointer active:scale-90 transition-all hover:bg-slate-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo imgClassName="h-10 md:h-14" />
          </div>

          {/* CENTER: TEXT-ONLY NAV */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-4">
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

          {/* RIGHT: ACTION NODES */}
          <div className="flex items-center justify-end gap-2 md:gap-4 shrink-0">
             
             <div>
               <Button asChild className="h-12 md:h-12 px-4 md:px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[14px] md:text-[11px] tracking-widest rounded-2xl md:rounded-xl gap-2 shadow-lg border-none transition-all active:scale-95">
                  <Link href="/pass"><Gem className="h-4 w-4" /> <span className="hidden xs:inline">Pass</span></Link>
               </Button>
             </div>

             <Link href="/search" className="w-12 h-12 md:w-12 md:h-12 rounded-2xl md:rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all">
                <Search className="h-5 w-5" />
             </Link>

             {/* AUTHENTICATION ACTION BLOCK */}
             {loading ? (
                <Skeleton className="w-12 h-12 md:w-12 md:h-12 rounded-full bg-slate-100" />
             ) : user ? (
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <button className="w-12 h-12 md:w-12 md:h-12 rounded-full border border-slate-100 overflow-hidden shadow-sm cursor-pointer bg-white active:scale-95 transition-transform flex items-center justify-center">
                      <StudentAvatar profile={profile} className="h-full w-full border-none" />
                   </button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-64 bg-white border-slate-100 rounded-[2rem] p-2 shadow-5xl z-[2001] mt-4">
                    <DropdownMenuItem asChild className="px-4 py-3 cursor-pointer rounded-xl focus:bg-slate-50">
                       <Link href="/profile" className="flex items-center gap-3">
                          <User className="h-5 w-5 text-blue-500" />
                          <span className="font-bold text-sm tracking-tight text-slate-700">My Profile</span>
                       </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild className="px-4 py-3 cursor-pointer rounded-xl focus:bg-blue-50 mt-1 border border-blue-50">
                        <Link href="/admin" className="flex items-center gap-3">
                          <ShieldCheck className="h-5 w-5 text-blue-600" />
                          <span className="font-bold text-sm tracking-tight text-blue-700">Admin Center</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-slate-50 my-1" />
                    <DropdownMenuItem onClick={handleLogout} className="px-4 py-3 cursor-pointer rounded-xl focus:bg-rose-50 text-rose-500">
                       <LogOut className="h-5 w-5 shrink-0" />
                       <span className="font-bold text-sm tracking-tight">Log Out</span>
                    </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
             ) : (
               <Button asChild className="px-5 md:px-8 h-12 md:h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-2xl md:rounded-xl transition-all tracking-widest border-none active:scale-95">
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

function NavLink({ href, label, active }: { href: string, label: string, active?: boolean }) {
  return (
    <Link href={href} className={cn(
      "flex items-center px-4 py-2 rounded-xl font-bold text-[10px] md:text-sm transition-all shrink-0",
      active ? "bg-blue-50 text-blue-600 shadow-sm" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
    )}>
       <span>{label}</span>
    </Link>
  )
}
