'use client';

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { 
  Search, 
  User, 
  LogOut, 
  Menu, 
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
import { Skeleton } from "@/components/ui/skeleton";

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

/**
 * @fileOverview Professional White Navbar v69.0.
 * DESIGN: Restored clean white aesthetic with scaled mobile height (72px).
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

  if (!mounted) return (
    <nav className="w-full border-b border-gray-200 bg-white h-[72px] md:h-20" />
  );

  return (
    <div className="w-full sticky top-0 z-[1000] font-body">
      <nav className="w-full border-b border-gray-200 bg-white h-[72px] md:h-20 px-4 md:px-6 shadow-sm flex items-center overflow-hidden">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between h-full gap-2 md:gap-4">
          
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 text-slate-400 rounded-xl md:rounded-2xl border border-gray-100 flex items-center justify-center cursor-pointer active:scale-90 transition-all hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo imgClassName="h-8 md:h-12" />
          </div>

          <div className="hidden lg:flex items-center gap-2 xl:gap-4">
             <NavLink href="/" label="Home" active={pathname === '/'} />
             <NavLink href="/mocks" label="Practice" active={pathname === '/mocks'} />
             <NavLink href="/current-affairs" label="Updates" active={pathname === '/current-affairs'} />
          </div>

          <div className="flex items-center justify-end gap-2 md:gap-4 shrink-0">
             <Button asChild className="h-10 md:h-[52px] px-4 md:px-7 bg-[#04102B] hover:bg-[#0B1736] text-white font-bold text-[12px] md:text-[11px] tracking-widest rounded-xl md:rounded-2xl gap-2 shadow-lg border-none transition-all active:scale-95">
                <Link href="/pass"><Gem className="h-4 w-4 text-[#2F6BFF]" /> <span className="hidden sm:inline">Pass</span></Link>
             </Button>

             <Link href="/search" className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-slate-400 hover:text-[#2F6BFF] transition-all">
                <Search className="h-5 w-5" />
             </Link>

             {loading ? (
                <Skeleton className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-100" />
             ) : user ? (
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <button className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#E2E8F0] overflow-hidden shadow-sm cursor-pointer bg-[#F8FAFC] active:scale-95 transition-transform flex items-center justify-center">
                      <StudentAvatar profile={profile} className="h-full w-full border-none" />
                   </button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-64 bg-white border border-gray-200 text-[#04102B] rounded-[2rem] p-2 shadow-5xl z-[2001] mt-4">
                    <DropdownMenuItem asChild className="px-4 py-3 cursor-pointer rounded-xl focus:bg-gray-50">
                       <Link href="/profile" className="flex items-center gap-3">
                          <User className="h-5 w-5 text-[#2F6BFF]" />
                          <span className="font-bold text-sm tracking-tight">My Profile</span>
                       </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild className="px-4 py-3 cursor-pointer rounded-xl focus:bg-[#2F6BFF]/5 mt-1 border border-[#2F6BFF]/10">
                        <Link href="/admin" className="flex items-center gap-3">
                          <ShieldCheck className="h-5 w-5 text-[#2F6BFF]" />
                          <span className="font-bold text-sm tracking-tight text-[#2F6BFF]">Admin Center</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-gray-100 my-1" />
                    <DropdownMenuItem onClick={handleLogout} className="px-4 py-3 cursor-pointer rounded-xl focus:bg-rose-50 text-rose-500">
                       <LogOut className="h-5 w-5 shrink-0" />
                       <span className="font-bold text-sm tracking-tight">Log Out</span>
                    </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
             ) : (
               <Button asChild className="px-5 md:px-8 h-10 md:h-12 bg-[#2F6BFF] hover:bg-[#1F5BFF] text-white font-bold text-[11px] rounded-xl md:rounded-xl transition-all tracking-widest border-none active:scale-95">
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
      active ? "bg-[#2F6BFF]/10 text-[#2F6BFF] shadow-sm" : "text-slate-400 hover:bg-gray-50 hover:text-[#04102B]"
    )}>
       <span>{label}</span>
    </Link>
  )
}