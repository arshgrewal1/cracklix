
'use client';

import Link from "next/link";
import { Menu, User, LayoutDashboard, Search, Trophy, Bookmark, Megaphone, CalendarDays, Zap, CreditCard, ChevronDown, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/brand/Logo";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
 * @fileOverview Institutional Top Navbar.
 * Integrates Logo, Search, and Hamburger Drawer for mobile scaling.
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

  const links = [
    { label: "Exams", href: "/exams" },
    { label: "Mocks", href: "/mocks" },
    { label: "Pass", href: "/pass", icon: <CreditCard className="h-4 w-4 text-primary" /> },
    { label: "Notes", href: "/notes", icon: <Zap className="h-4 w-4 text-emerald-500" /> },
  ];

  const isFounder = user?.email === 'arshdeepgrewal1122@gmail.com';
  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || isFounder;

  return (
    <div className="sticky top-0 z-[1000] w-full">
      {settings?.showAnnouncement && (
        <div className="bg-[#F97316] text-white py-2 px-6 flex items-center justify-center gap-3 overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_3s_infinite] pointer-events-none" />
          <Megaphone className="h-3 w-3 shrink-0 animate-bounce" />
          <p className="text-[9px] font-black uppercase tracking-[0.3em] whitespace-nowrap">
            {settings.announcement}
          </p>
        </div>
      )}

      <nav className="w-full bg-[#0B1528] border-b border-white/5 py-3 shadow-2xl backdrop-blur-md bg-opacity-95">
        <div className="container mx-auto max-w-[95%] lg:max-w-[90%] flex items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
               {/* Mobile Sidebar Trigger */}
               <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                 <SheetTrigger asChild>
                   <button className="lg:hidden text-white p-2 hover:bg-white/5 rounded-xl transition-colors">
                     <Menu className="h-6 w-6" />
                   </button>
                 </SheetTrigger>
                 <SheetContent side="left" className="p-0 border-none w-[280px] max-w-[80vw]">
                   <SheetHeader className="sr-only">
                     <SheetTitle>Navigation Menu</SheetTitle>
                   </SheetHeader>
                   <MobileSidebar onClose={() => setIsSidebarOpen(false)} />
                 </SheetContent>
               </Sheet>
               
               <Logo variant="light" className="scale-90" />
            </div>

            <div className="hidden lg:flex items-center gap-[30px] text-[14px] font-bold uppercase tracking-widest text-[#7A8B9E]">
              {links.map(link => (
                <Link 
                  key={link.label} 
                  href={link.href} 
                  className={`transition-colors hover:text-[#F97316] flex items-center gap-2 ${pathname === link.href ? 'text-white' : ''}`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <Link href="/search" className="text-slate-400 hover:text-white transition-colors p-2">
              <Search className="h-5 w-5" />
            </Link>

            {loading ? (
              <Skeleton className="h-10 w-24 rounded-lg bg-white/5" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 flex items-center gap-2 px-2 hover:bg-white/5 rounded-xl border border-white/5">
                      <Avatar className="h-8 w-8 border border-white/10 rounded-lg">
                        <AvatarImage src={user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`} />
                        <AvatarFallback className="bg-primary/20 text-primary font-black text-xs uppercase">
                          {profile?.name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="h-3.5 w-3.5 text-[#7A8B9E] hidden sm:block" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 bg-[#0F172A] border-white/10 text-white rounded-[2rem] p-3 shadow-4xl" align="end">
                    <DropdownMenuLabel className="font-headline font-bold px-4 py-3 text-slate-400 text-[10px] uppercase tracking-widest">Aspirant Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/5 mb-2" />
                    <DropdownNavItem href="/dashboard" icon={<LayoutDashboard />} label="Performance Engine" />
                    <DropdownNavItem href="/pass" icon={<CreditCard className="text-primary" />} label="Manage Pass" />
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator className="bg-white/5 my-2" />
                        <DropdownNavItem href="/admin" icon={<ShieldCheck className="text-primary" />} label="Command Center" className="text-primary font-black" />
                      </>
                    )}
                    <DropdownMenuSeparator className="bg-white/5 my-2" />
                    <DropdownMenuItem onClick={handleLogout} className="focus:bg-destructive/10 focus:text-destructive rounded-xl px-4 py-3 cursor-pointer transition-colors text-destructive/80 font-bold">
                      <LogOut className="h-4 w-4 mr-3" /> Terminate Session
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button asChild className="bg-[#F97316] hover:bg-[#EA580C] text-white font-black px-6 py-2 rounded-xl h-9 uppercase text-[10px] tracking-widest border-none transition-all shadow-xl shadow-orange-900/20">
                <Link href="/login">Sign In</Link>
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
    <DropdownMenuItem asChild className={`focus:bg-white/5 rounded-xl px-4 py-3 cursor-pointer transition-colors ${className}`}>
      <Link href={href} className="flex items-center gap-4 w-full">
        <span className="h-4 w-4">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </Link>
    </DropdownMenuItem>
  )
}
