'use client';

import Link from "next/link";
import { Menu, Search, Zap, CreditCard, LogOut, ShieldCheck, Megaphone, Target, LayoutGrid, Award, Gem, User, Sparkles, Newspaper, AlertCircle, Clock, FileStack, Download } from "lucide-react";
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

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

/**
 * @fileOverview Institutional Navbar v46.0 (Restored).
 * RESTORED: Full header functionality and optimized logo scaling.
 * FIXED: Increased height for premium aesthetic.
 */
export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const { user, profile, loading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
    const checkInstall = () => {
      if (typeof window !== 'undefined' && (window as any).deferredPrompt) {
        setCanInstall(true);
      }
    };

    window.addEventListener('pwa-installable', () => setCanInstall(true));
    window.addEventListener('pwa-installed', () => setCanInstall(false));
    checkInstall();
    
    return () => {
      window.removeEventListener('pwa-installable', () => setCanInstall(true));
    };
  }, []);
  
  const settingsRef = useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]);
  const { data: settings } = useDoc<any>(settingsRef);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handleInstallApp = async () => {
    const prompt = (window as any).deferredPrompt;
    if (prompt) {
      prompt.prompt();
    }
  };

  const isFounder = user?.email && SUPER_ADMIN_WHITELIST.includes(user.email.toLowerCase());
  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || isFounder;

  return (
    <div className="sticky top-0 z-[1000] w-full pointer-events-auto">
      {settings?.showAnnouncement && (
        <div className="bg-primary text-white py-1 md:py-1.5 flex items-center overflow-hidden relative shadow-2xl h-7 md:h-8">
          <div className="flex items-center gap-2 animate-marquee whitespace-nowrap min-w-full">
            <Megaphone className="h-3 w-3 shrink-0 ml-4" />
            <p className="text-[9px] md:text-10px] font-black uppercase tracking-[0.3em]">
              {settings.announcement}
            </p>
            <span className="mx-40 md:mx-80" />
            <Megaphone className="h-3 w-3 shrink-0" />
            <p className="text-[9px] md:text-10px] font-black uppercase tracking-[0.3em]">
              {settings.announcement}
            </p>
            <span className="mx-40 md:mx-80" />
          </div>
        </div>
      )}

      <nav className="w-full bg-[#0B1528] border-b border-white/5 h-16 md:h-28 flex items-center shadow-xl backdrop-blur-md bg-opacity-95">
        <div className="container mx-auto max-w-full flex items-center justify-between px-3 md:px-8">
          <div className="flex items-center gap-2 md:gap-10 overflow-hidden">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <button className="text-white p-2 md:p-4 hover:bg-white/5 rounded-xl md:rounded-3xl transition-all active:scale-90 cursor-pointer border border-white/10 focus:outline-none shrink-0">
                  <Menu className="h-5 w-5 md:h-8 md:w-8" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 border-none w-[280px] bg-[#0F172A] z-[2001] h-screen">
                <SheetHeader className="sr-only"><SheetTitle>Menu Hub</SheetTitle></SheetHeader>
                <MobileSidebar onClose={() => setIsSidebarOpen(false)} />
              </SheetContent>
            </Sheet>
            <Logo variant="light" className="origin-left scale-100" />
          </div>

          <div className="flex items-center gap-2 md:gap-8 shrink-0">
            {mounted && canInstall && (
              <Button 
                onClick={handleInstallApp}
                variant="outline" 
                className="h-10 md:h-14 px-3 md:px-8 rounded-xl md:rounded-2xl border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-black uppercase text-[8px] md:text-[12px] tracking-widest gap-2 hover:bg-emerald-500 hover:text-white transition-all shadow-lg shrink-0"
              >
                 <Download className="h-4 w-4 md:h-5 md:w-5" /> 
                 <span className="hidden sm:inline">Install App</span>
              </Button>
            )}

            <Link href="/search" className="text-slate-400 hover:text-white p-2 md:p-4 rounded-xl md:rounded-3xl hover:bg-white/5 transition-all border border-white/5">
              <Search className="h-5 w-5 md:h-8 md:w-8" />
            </Link>

            <div className="relative">
              {!mounted || loading ? (
                <div className="h-9 w-9 md:h-16 md:w-16 rounded-xl md:rounded-3xl bg-white/5 animate-pulse" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-9 w-9 md:h-16 md:w-16 p-0 rounded-xl md:rounded-3xl overflow-hidden border-2 border-primary/20 hover:border-primary transition-all bg-[#0F172A] shadow-2xl">
                      <StudentAvatar profile={profile} className="h-full w-full border-none" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 bg-[#0F172A] border-white/10 text-white rounded-[2rem] p-2 shadow-5xl z-[2001]" align="end">
                    <DropdownMenuItem asChild className="flex items-center gap-3 px-4 py-4 cursor-pointer rounded-xl transition-all focus:bg-white/5">
                      <Link href="/profile" className="w-full flex items-center gap-3">
                        <User className="h-5 w-5 text-blue-400" />
                        <span className="font-bold text-[13px] tracking-tight uppercase">My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild className="flex items-center gap-3 px-4 py-4 cursor-pointer rounded-xl transition-all focus:bg-white/5 bg-rose-500/10 mt-1">
                        <Link href="/admin" className="w-full flex items-center gap-3">
                          <ShieldCheck className="h-5 w-5 text-rose-500" />
                          <span className="font-bold text-[13px] tracking-tight uppercase">Admin Panel</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-white/5 my-2" />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-3 px-4 py-4 cursor-pointer rounded-xl transition-all focus:bg-white/5 focus:text-rose-500 text-rose-500/80">
                      <LogOut className="h-5 w-5 shrink-0" />
                      <span className="font-bold text-[13px] tracking-tight uppercase">Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild className="bg-primary hover:bg-orange-600 text-white font-black px-5 md:px-12 py-3 rounded-xl md:rounded-3xl h-10 md:h-16 uppercase text-[9px] md:text-[14px] tracking-[0.2em] shadow-2xl transition-all active:scale-90 border-none">
                  <Link href="/login">Login</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
