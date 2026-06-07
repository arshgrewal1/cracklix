'use client';

import Link from "next/link";
import { Menu, Search, Zap, CreditCard, LogOut, ShieldCheck, Megaphone, Target, LayoutGrid, Award, Gem, User, Sparkles, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/brand/Logo";
import { useState, useMemo, useEffect } from "react";
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
 * @fileOverview Elite Global Navigation Hub v7.5.
 * FIXED: Hydration mismatch by deferring dynamic state rendering.
 */

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, profile, loading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);
  
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
      {mounted && settings?.showAnnouncement && (
        <div className="bg-primary text-white py-1.5 px-4 flex items-center justify-center gap-2 overflow-hidden relative shadow-2xl">
          <Megaphone className="h-3 w-3 shrink-0 animate-bounce" />
          <p className="text-[9px] font-black uppercase tracking-[0.3em] whitespace-nowrap overflow-hidden text-ellipsis">
            {settings.announcement}
          </p>
        </div>
      )}

      <nav className="w-full bg-[#0B1528] border-b border-white/5 py-2 md:py-3 shadow-xl backdrop-blur-md bg-opacity-95">
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
                     "p-0 border-none w-[290px] overflow-hidden shadow-5xl transition-all duration-200 bg-[#0F172A]",
                     "top-0 h-screen"
                   )}
                 >
                   <SheetHeader className="sr-only">
                      <SheetTitle>Menu Hub</SheetTitle>
                   </SheetHeader>
                   <MobileSidebar onClose={() => setIsSidebarOpen(false)} />
                 </SheetContent>
               </Sheet>
               <Logo variant="light" className="origin-left scale-105" />
            </div>

            <div className="hidden lg:flex items-center gap-10 text-[12px] font-black uppercase tracking-[0.2em] text-[#7A8B9E]">
              <Link href="/my-exams" className={cn("transition-colors flex items-center gap-2 hover:text-white", mounted && pathname === '/my-exams' ? 'text-white' : '')}>
                <Target className="h-4 w-4 text-primary" /> My Exams
              </Link>
              <Link href="/mocks" className={cn("transition-colors hover:text-white", mounted && pathname === '/mocks' ? 'text-white' : '')}>
                Mocks
              </Link>
              <Link href="/pass" className={cn("transition-all flex items-center gap-2 px-5 py-2 rounded-xl border", mounted && pathname === '/pass' ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'bg-primary/10 border-primary/20 text-primary/80 hover:text-primary hover:bg-primary/20')}>
                <Gem className="h-4 w-4" /> PASS
              </Link>
              <Link href="/current-affairs" className={cn("transition-colors flex items-center gap-2 hover:text-white", mounted && pathname === '/current-affairs' ? 'text-white' : '')}>
                <Newspaper className="h-4 w-4 text-primary" /> Current Affairs
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/search" className="text-slate-400 hover:text-white p-2 rounded-2xl hover:bg-white/5 transition-all active:scale-95 border border-white/5">
              <Search className="h-5 w-5" />
            </Link>

            {!mounted || loading ? (
              <Skeleton className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-white/5" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 w-9 md:h-11 md:w-11 p-0 rounded-xl md:rounded-2xl overflow-hidden border-2 border-primary/20 hover:border-primary transition-all bg-[#0F172A] shadow-2xl focus-visible:ring-0 active:scale-95">
                    <StudentAvatar profile={profile} className="h-full w-full border-none" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-60 bg-[#0F172A] border-white/10 text-white rounded-[2rem] p-2 shadow-5xl animate-in fade-in zoom-in-95 duration-200" align="end">
                  <DropdownMenuLabel className="px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Student Area</DropdownMenuLabel>
                  
                  <DropdownNavItem href="/profile" icon={<User className="h-4 w-4 text-blue-400" />} label="My Profile" />
                  <DropdownNavItem href="/dashboard" icon={<Award className="h-4 w-4 text-emerald-400" />} label="My Results" />
                  <DropdownNavItem href="/pass" icon={<Gem className="h-4 w-4 text-primary" />} label="Elite Pass" />
                  
                  {isAdmin && (
                    <DropdownNavItem 
                      href="/admin" 
                      icon={<ShieldCheck className="h-4 w-4 text-rose-500" />} 
                      label="Admin Portal" 
                      className="bg-rose-500/10 mt-1"
                    />
                  )}
                  
                  <DropdownMenuSeparator className="bg-white/5 my-2" />
                  
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all focus:bg-white/5 focus:text-rose-500 text-rose-500/80"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span className="font-bold text-[12px] tracking-tight uppercase">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="bg-primary hover:bg-orange-600 text-white font-black px-4 md:px-8 py-2 rounded-xl h-9 md:h-12 uppercase text-[9px] md:text-[11px] tracking-[0.2em] shadow-2xl transition-all active:scale-95 border-none">
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
    <DropdownMenuItem asChild className={cn("flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all focus:bg-white/5", className)}>
      <Link href={href} className="w-full flex items-center gap-3">
        <span className="shrink-0">{icon}</span>
        <span className="font-bold text-[12px] tracking-tight uppercase">{label}</span>
      </Link>
    </DropdownMenuItem>
  )
}
