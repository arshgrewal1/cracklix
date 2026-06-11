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
 * @fileOverview Institutional Navbar v17.0.
 * UPDATED: Optimized PWA Install button visibility and live status nodes.
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

    window.addEventListener('pwa-installable', checkInstall);
    window.addEventListener('pwa-installed', () => setCanInstall(false));
    
    // Immediate check
    checkInstall();
    
    return () => {
      window.removeEventListener('pwa-installable', checkInstall);
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
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        setCanInstall(false);
        (window as any).deferredPrompt = null;
      }
    }
  };

  const isFounder = user?.email && SUPER_ADMIN_WHITELIST.includes(user.email.toLowerCase());
  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || isFounder;

  const passStatus = useMemo(() => {
    if (!profile?.pass) return null;
    const active = profile.pass.active;
    const expiry = new Date(profile.pass.expiryDate);
    const isExpired = expiry < new Date();
    
    return {
      active: active && !isExpired,
      label: isExpired ? "PASS EXPIRED" : `PASS ACTIVE`,
      expiry: expiry.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    };
  }, [profile]);

  if (!mounted) {
    return (
      <div className="h-16 w-full bg-[#0B1528] flex items-center justify-between px-6 border-b border-white/5">
        <Skeleton className="h-8 w-32 bg-white/5" />
        <Skeleton className="h-10 w-10 rounded-full bg-white/5" />
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-[1000] w-full pointer-events-auto">
      {settings?.showAnnouncement && (
        <div className="bg-primary text-white py-1 md:py-1.5 flex items-center overflow-hidden relative shadow-2xl pointer-events-none h-7 md:h-8">
          <div className="flex items-center gap-2 animate-marquee whitespace-nowrap min-w-full">
            <Megaphone className="h-3 w-3 shrink-0 ml-4" />
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em]">
              {settings.announcement}
            </p>
            <span className="mx-40 md:mx-80" />
            <Megaphone className="h-3 w-3 shrink-0" />
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em]">
              {settings.announcement}
            </p>
            <span className="mx-40 md:mx-80" />
          </div>
        </div>
      )}

      <nav className="w-full bg-[#0B1528] border-b border-white/5 py-2 md:py-3 shadow-xl backdrop-blur-md bg-opacity-95">
        <div className="container mx-auto max-w-full flex items-center justify-between px-3 md:px-6">
          <div className="flex items-center gap-2 md:gap-8">
            <div className="flex items-center gap-2 md:gap-6">
               <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                 <SheetTrigger asChild>
                   <button className="text-white p-2.5 hover:bg-white/5 rounded-2xl transition-all active:scale-90 cursor-pointer border border-white/10 focus:outline-none shrink-0">
                     <Menu className="h-6 w-6" />
                   </button>
                 </SheetTrigger>
                 <SheetContent side="left" className="p-0 border-none w-[280px] overflow-hidden shadow-5xl transition-all duration-200 bg-[#0F172A] z-[2001] top-0 h-screen">
                   <SheetHeader className="sr-only"><SheetTitle>Menu Hub</SheetTitle></SheetHeader>
                   <MobileSidebar onClose={() => setIsSidebarOpen(false)} />
                 </SheetContent>
               </Sheet>
               <Logo variant="light" className="origin-left scale-90 sm:scale-100" />
            </div>

            <div className="hidden lg:flex items-center gap-10 text-[12px] font-black uppercase tracking-[0.2em] text-[#7A8B9E]">
              <Link href="/my-exams" className={cn("transition-colors flex items-center gap-2 hover:text-white pointer-events-auto", pathname === '/my-exams' ? 'text-white' : '')}>
                <Target className="h-4 w-4 text-primary" /> My Exams
              </Link>
              <Link href="/mocks" className={cn("transition-colors hover:text-white pointer-events-auto", pathname === '/mocks' ? 'text-white' : '')}>
                Practice Tests
              </Link>
              <Link href="/pass" className={cn("transition-all flex items-center gap-2 px-5 py-2 rounded-xl border pointer-events-auto", pathname === '/pass' ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'bg-primary/10 border-primary/20 text-primary/80 hover:text-primary hover:bg-primary/20')}>
                <Gem className="h-4 w-4" /> GET PASS
              </Link>
              <Link href="/current-affairs" className={cn("transition-colors flex items-center gap-2 hover:text-white pointer-events-auto", pathname === '/current-affairs' ? 'text-white' : '')}>
                <Newspaper className="h-4 w-4 text-primary" /> Current Affairs
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {canInstall && (
              <Button 
                onClick={handleInstallApp}
                variant="outline" 
                className="h-10 px-4 rounded-xl border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-black uppercase text-[9px] tracking-widest gap-2 hover:bg-emerald-500 hover:text-white transition-all shadow-lg animate-pulse"
              >
                 <Download className="h-3.5 w-3.5" /> Install App
              </Button>
            )}

            {user && passStatus && (
               <div className={cn(
                 "hidden sm:flex items-center gap-3 px-4 py-1.5 rounded-xl border-2 transition-all",
                 passStatus.active ? "bg-emerald-50/10 border-emerald-500/20 text-emerald-400" : "bg-rose-50/10 border-rose-500/20 text-rose-400"
               )}>
                  {passStatus.active ? <Gem className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <div className="flex flex-col text-left">
                     <span className="text-[8px] font-black uppercase leading-none tracking-widest">{passStatus.label}</span>
                     <span className="text-[7px] font-bold opacity-60 leading-none mt-1 uppercase">EXP: {passStatus.expiry}</span>
                  </div>
               </div>
            )}

            <Link href="/search" className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all active:scale-95 border border-white/5 pointer-events-auto">
              <Search className="h-5 w-5" />
            </Link>

            {loading ? (
              <Skeleton className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-white/5" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 w-9 md:h-11 md:w-11 p-0 rounded-xl md:rounded-2xl overflow-hidden border-2 border-primary/20 hover:border-primary transition-all bg-[#0F172A] shadow-2xl focus-visible:ring-0 active:scale-95 cursor-pointer">
                    <StudentAvatar profile={profile} className="h-full w-full border-none" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-60 bg-[#0F172A] border-white/10 text-white rounded-[2rem] p-2 shadow-5xl animate-in fade-in zoom-in-95 duration-200 z-[2001]" align="end">
                  <DropdownMenuLabel className="px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Student Area</DropdownMenuLabel>
                  <DropdownNavItem href="/profile" icon={<User className="h-4 w-4 text-blue-400" />} label="My Profile" />
                  <DropdownNavItem href="/dashboard" icon={<Award className="h-4 w-4 text-emerald-400" />} label="My Results" />
                  <DropdownNavItem href="/pass" icon={<Gem className="h-4 w-4 text-primary" />} label="Elite Pass" />
                  {isAdmin && <DropdownNavItem href="/admin" icon={<ShieldCheck className="h-4 w-4 text-rose-500" />} label="Admin Panel" className="bg-rose-500/10 mt-1" />}
                  <DropdownMenuSeparator className="bg-white/5 my-2" />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all focus:bg-white/5 focus:text-rose-500 text-rose-500/80"><LogOut className="h-4 w-4 shrink-0" /><span className="font-bold text-[12px] tracking-tight uppercase">Logout</span></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="bg-primary hover:bg-orange-600 text-white font-black px-4 md:px-8 py-2 rounded-xl h-9 md:h-12 uppercase text-[9px] md:text-[11px] tracking-[0.2em] shadow-2xl transition-all active:scale-95 border-none cursor-pointer"><Link href="/login">Login</Link></Button>
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
      <Link href={href} className="w-full flex items-center gap-3 pointer-events-auto">
        <span className="shrink-0">{icon}</span>
        <span className="font-bold text-[12px] tracking-tight uppercase">{label}</span>
      </Link>
    </DropdownMenuItem>
  )
}
