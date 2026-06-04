
'use client';

import Link from "next/link";
import { Menu, Search, Zap, CreditCard, ChevronDown, LogOut, ShieldCheck, Megaphone, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/brand/Logo";
import { useState, useMemo } from "react";
import { useUser, useAuth, useDoc, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { doc } from "firebase/firestore";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import MobileSidebar from "./MobileSidebar";

/**
 * @fileOverview Compact Institutional Navbar.
 * Optimized for mobile "Safe Area" and minimal vertical footprint.
 */

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, profile, loading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const pathname = usePathname();
  const router = useRouter();
  
  const settingsRef = useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]);
  const { data: settings } = useDoc<any>(settingsRef);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const isFounder = user?.email === 'arshdeepgrewal1122@gmail.com';
  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || isFounder;

  return (
    <div className="sticky top-0 z-[1000] w-full">
      {settings?.showAnnouncement && (
        <div className="bg-[#F97316] text-white py-1.5 px-4 flex items-center justify-center gap-2 overflow-hidden relative">
          <Megaphone className="h-2.5 w-2.5 shrink-0" />
          <p className="text-[8px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
            {settings.announcement}
          </p>
        </div>
      )}

      <nav className="w-full bg-[#0B1528] border-b border-white/5 py-2 md:py-3 shadow-xl backdrop-blur-md bg-opacity-95">
        <div className="container mx-auto max-w-[95%] lg:max-w-[90%] flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 md:gap-4">
               <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                 <SheetTrigger asChild>
                   <button className="lg:hidden text-white p-1.5 hover:bg-white/5 rounded-lg">
                     <Menu className="h-5 w-5" />
                   </button>
                 </SheetTrigger>
                 <SheetContent side="left" className="p-0 border-none w-[260px]">
                   <SheetHeader className="sr-only"><SheetTitle>Menu</SheetTitle></SheetHeader>
                   <MobileSidebar onClose={() => setIsSidebarOpen(false)} />
                 </SheetContent>
               </Sheet>
               <Logo variant="light" className="scale-75 md:scale-90 origin-left" />
            </div>

            <div className="hidden lg:flex items-center gap-8 text-[12px] font-bold uppercase tracking-widest text-[#7A8B9E]">
              <Link href="/exams" className={pathname === '/exams' ? 'text-white' : 'hover:text-primary'}>Exams</Link>
              <Link href="/mocks" className={pathname === '/mocks' ? 'text-white' : 'hover:text-primary'}>Mocks</Link>
              <Link href="/pass" className="flex items-center gap-2 hover:text-primary"><CreditCard className="h-3.5 w-3.5 text-primary" /> Pass</Link>
              <Link href="/notes" className="flex items-center gap-2 hover:text-primary"><Zap className="h-3.5 w-3.5 text-emerald-500" /> Notes</Link>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/search" className="text-slate-400 hover:text-white p-1.5">
              <Search className="h-4.5 w-4.5" />
            </Link>

            {loading ? (
              <Skeleton className="h-8 w-16 rounded-lg bg-white/5" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg overflow-hidden border border-white/5">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user.photoURL || ""} />
                      <AvatarFallback className="bg-primary/20 text-primary font-black text-[10px] uppercase">
                        {profile?.name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#0F172A] border-white/10 text-white rounded-2xl p-2" align="end">
                  <DropdownNavItem href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
                  <DropdownNavItem href="/pass" icon={<CreditCard className="h-4 w-4 text-primary" />} label="My Pass" />
                  {isAdmin && (
                    <DropdownNavItem href="/admin" icon={<ShieldCheck className="h-4 w-4 text-primary" />} label="Admin Portal" className="text-primary font-black" />
                  )}
                  <DropdownMenuSeparator className="bg-white/5 my-1" />
                  <DropdownMenuItem onClick={handleLogout} className="focus:bg-rose-500/10 focus:text-rose-500 rounded-xl px-4 py-2.5 cursor-pointer text-rose-500/80 font-bold text-xs">
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="bg-[#F97316] text-white font-black px-4 py-1.5 rounded-lg h-8 uppercase text-[9px] tracking-widest shadow-lg">
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}

function DropdownNavItem({ href, icon, label, className }: any) {
  return (
    <DropdownMenuItem asChild className={`focus:bg-white/5 rounded-xl px-4 py-2.5 cursor-pointer transition-colors text-xs font-bold ${className}`}>
      <Link href={href} className="flex items-center gap-3 w-full">
        {icon} <span>{label}</span>
      </Link>
    </DropdownMenuItem>
  )
}
