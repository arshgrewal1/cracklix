
'use client';

import Link from "next/link";
import { Menu, Search, Zap, CreditCard, LogOut, ShieldCheck, Megaphone, Target, LayoutGrid, Award, Gem, User } from "lucide-react";
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
import StudentAvatar from "@/components/brand/StudentAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { doc } from "firebase/firestore";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import MobileSidebar from "./MobileSidebar";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Elite Global Navigation Hub v5.2.
 * Updated: Prioritized "PASS" node with distinct background and Gem icon.
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
    <div className="sticky top-0 z-[1000] w-full pointer-events-auto">
      {settings?.showAnnouncement && (
        <div className="bg-primary text-white py-1.5 px-4 flex items-center justify-center gap-2 overflow-hidden relative shadow-2xl">
          <Megaphone className="h-3 w-3 shrink-0 animate-bounce" />
          <p className="text-[9px] font-black uppercase tracking-[0.3em] whitespace-nowrap overflow-hidden text-ellipsis">
            {settings.announcement}
          </p>
        </div>
      )}

      <nav className="w-full bg-[#0B1528] border-b border-white/5 py-2.5 md:py-3.5 shadow-xl backdrop-blur-md bg-opacity-95">
        <div className="container mx-auto max-w-[98%] lg:max-w-[90%] flex items-center justify-between px-2">
          <div className="flex items-center gap-2 md:gap-8">
            <div className="flex items-center gap-1 md:gap-6">
               <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                 <SheetTrigger asChild>
                   <button className="text-white p-2 hover:bg-white/5 rounded-2xl transition-all active:scale-90 cursor-pointer border border-white/5">
                     <Menu className="h-5 w-5" />
                   </button>
                 </SheetTrigger>
                 <SheetContent 
                   side="left" 
                   className={cn(
                     "p-0 border-r border-slate-100 !w-[220px] lg:!w-[300px] overflow-hidden shadow-4xl transition-all duration-500",
                     "top-[60px] h-[calc(100vh-60px)]"
                   )}
                 >
                   <SheetHeader className="sr-only">
                      <SheetTitle>Menu</SheetTitle>
                   </SheetHeader>
                   <MobileSidebar onClose={() => setIsSidebarOpen(false)} />
                 </SheetContent>
               </Sheet>
               <Logo variant="light" className="origin-left scale-105" />
            </div>

            <div className="hidden lg:flex items-center gap-10 text-[12px] font-black uppercase tracking-[0.2em] text-[#7A8B9E]">
              <Link href="/my-exams" className={cn("transition-colors flex items-center gap-2 hover:text-white", pathname === '/my-exams' ? 'text-white' : '')}><Target className="h-4 w-4 text-primary" /> My Exams</Link>
              <Link href="/mocks" className={cn("transition-colors hover:text-white", pathname === '/mocks' ? 'text-white' : '')}>Mocks</Link>
              <Link href="/pass" className={cn("transition-all flex items-center gap-2 px-5 py-2 rounded-xl border", pathname === '/pass' ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'bg-primary/10 border-primary/20 text-primary/80 hover:text-primary hover:bg-primary/20')}>
                <Gem className="h-4 w-4" /> PASS
              </Link>
              <Link href="/notes" className={cn("transition-colors hover:text-white", pathname === '/notes' ? 'text-white' : '')}>Study Notes</Link>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/search" className="text-slate-400 hover:text-white p-2.5 rounded-2xl hover:bg-white/5 transition-all active:scale-95 border border-white/5">
              <Search className="h-5 w-5" />
            </Link>

            {loading ? (
              <Skeleton className="h-10 w-10 rounded-full bg-white/5" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 w-10 md:h-12 md:w-12 p-0 rounded-2xl overflow-hidden border-2 border-primary/20 hover:border-primary transition-all bg-[#0F172A] shadow-2xl focus-visible:ring-0 active:scale-95">
                    <StudentAvatar profile={profile} className="h-full w-full border-none" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72 bg-[#0F172A] border-white/10 text-white rounded-[2.5rem] p-4 shadow-5xl animate-in fade-in zoom-in-95 duration-200" align="end">
                  <DropdownMenuLabel className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Student Area</DropdownMenuLabel>
                  
                  <DropdownNavItem href="/profile" icon={<User className="h-5 w-5 text-blue-400" />} label="My Profile" />
                  <DropdownNavItem href="/dashboard" icon={<Award className="h-5 w-5 text-emerald-400" />} label="My Results" />
                  <DropdownNavItem href="/pass" icon={<Gem className="h-5 w-5 text-primary" />} label="Elite Pass" />
                  
                  {isAdmin && (
                    <DropdownNavItem 
                      href="/admin" 
                      icon={<ShieldCheck className="h-5 w-5 text-rose-500" />} 
                      label="Admin Portal" 
                      className="bg-rose-500/5 mt-2"
                    />
                  )}
                  
                  <DropdownMenuSeparator className="bg-white/5 my-3" />
                  
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="flex items-center gap-4 px-5 py-4 cursor-pointer rounded-2xl transition-all focus:bg-white/5 focus:text-rose-500 text-rose-500/80"
                  >
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span className="font-bold text-[13px] tracking-tight uppercase">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="bg-primary hover:bg-orange-600 text-white font-black px-6 md:px-8 py-2 rounded-xl h-10 md:h-12 uppercase text-[10px] md:text-[11px] tracking-[0.2em] shadow-2xl transition-all active:scale-95 border-none">
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
    <DropdownMenuItem asChild className={cn("flex items-center gap-4 px-5 py-4 cursor-pointer rounded-2xl transition-all focus:bg-white/5", className)}>
      <Link href={href} className="w-full flex items-center gap-4">
        <span className="shrink-0">{icon}</span>
        <span className="font-bold text-[13px] tracking-tight uppercase">{label}</span>
      </Link>
    </DropdownMenuItem>
  )
}
