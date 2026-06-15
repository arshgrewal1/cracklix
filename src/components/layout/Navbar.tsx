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
  ShieldCheck 
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

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

/**
 * @fileOverview High-Density Master Navbar Hub v51.0.
 * UPDATED: Integrated blue-indigo palette to match new Hero branding.
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

  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || (user?.email && SUPER_ADMIN_WHITELIST.includes(user.email.toLowerCase()));

  const isActivePass = useMemo(() => {
     if (!profile?.pass?.active) return false;
     return new Date(profile.pass.expiryDate) > new Date();
  }, [profile]);

  if (!mounted) return null;

  return (
    <div className="w-full sticky top-0 z-[1000] font-body">
      <nav className="w-full border-b border-slate-100 bg-white/80 backdrop-blur-xl h-18 md:h-20 px-3 md:px-6 shadow-sm flex items-center overflow-hidden">
        <div className="w-full max-w-[1550px] mx-auto flex items-center justify-between h-full gap-2 md:gap-4">
          
          <div className="flex items-center gap-3 md:gap-5 shrink-0">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="w-10 h-10 md:w-11 md:h-11 bg-slate-50 text-slate-400 rounded-xl border border-slate-100 flex items-center justify-center cursor-pointer active:scale-90 transition-all hover:bg-slate-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo imgClassName="h-10 md:h-12" />
          </div>

          <div className="hidden xl:flex items-center gap-2">
             <NavLink 
               href="/" 
               icon={<Home className="h-4 w-4" />} 
               label="Home" 
               active={pathname === '/'} 
             />
             <NavLink 
               href="/mocks" 
               icon={<Zap className="h-4 w-4" />} 
               label="Practice" 
               active={pathname === '/mocks'} 
             />
             <NavLink 
               href="/current-affairs" 
               icon={<Newspaper className="h-4 w-4" />} 
               label="Updates" 
               active={pathname === '/current-affairs'} 
             />
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
             
             <div className="hidden lg:block">
               <Button asChild className="h-10 md:h-11 px-5 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[9px] md:text-[10px] tracking-widest rounded-xl gap-2 shadow-lg border-none">
                  <Link href="/pass"><Gem className="h-4 w-4" /> GET PASS</Link>
               </Button>
             </div>

             {isActivePass && (
                <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
                   <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                   <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">ACTIVE</span>
                </div>
             )}

             <Link href="/search" className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary transition-all">
                <Search className="h-5 w-5" />
             </Link>

             {user ? (
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <button className="w-10 h-10 md:w-11 md:h-11 rounded-full border border-slate-100 overflow-hidden shadow-sm cursor-pointer bg-white active:scale-95 transition-transform flex items-center justify-center">
                      <StudentAvatar profile={profile} className="h-full w-full border-none" />
                   </button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-64 bg-white border-slate-100 rounded-[2rem] p-2 shadow-5xl z-[2001] mt-4">
                    <DropdownMenuItem asChild className="px-4 py-3 cursor-pointer rounded-xl focus:bg-slate-50">
                       <Link href="/profile" className="flex items-center gap-3">
                          <User className="h-5 w-5 text-blue-500" />
                          <span className="font-black text-xs uppercase tracking-tight text-slate-700">My Profile</span>
                       </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild className="px-4 py-3 cursor-pointer rounded-xl focus:bg-rose-50 mt-1 border border-rose-50">
                        <Link href="/admin" className="flex items-center gap-3">
                          <ShieldCheck className="h-5 w-5 text-rose-500" />
                          <span className="font-black text-xs uppercase tracking-tight text-rose-600">Admin Hub</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-slate-50 my-1" />
                    <DropdownMenuItem onClick={handleLogout} className="px-4 py-3 cursor-pointer rounded-xl focus:bg-rose-50 text-rose-500">
                       <LogOut className="h-5 w-5 shrink-0" />
                       <span className="font-black text-xs uppercase tracking-tight">Log Out</span>
                    </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
             ) : (
               <Button asChild className="px-5 h-10 bg-slate-900 hover:bg-black text-white font-black text-[9px] md:text-[10px] rounded-xl transition-all uppercase tracking-widest border-none">
                 <Link href="/login">Login</Link>
               </Button>
             )}
          </div>
        </div>
      </nav>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0 border-none w-[300px] bg-[#0A0E1A] z-[2001]">
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
      "flex items-center gap-2 px-5 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all",
      active ? "bg-blue-50 text-primary shadow-sm" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
    )}>
       {icon}
       <span>{label}</span>
    </Link>
  )
}
