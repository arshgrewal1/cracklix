'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from "next/link";
import { Menu, Search, User, Gem, LogOut, Newspaper, Download, Zap, Home, ShieldCheck, Award } from "lucide-react";
import Logo from "@/components/brand/Logo";
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
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import MobileSidebar from "./MobileSidebar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

/**
 * @fileOverview Professional Header v178.0 (Logo 40px Fix).
 * UPDATED: Set logo height to exactly 40px (h-10) as requested.
 */
export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasPrompt, setHasPrompt] = useState(false);
  const { user, profile, loading } = useUser();
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined' && (window as any).deferredPrompt) {
      setHasPrompt(true);
    }

    const handleInstallable = () => setHasPrompt(true);
    window.addEventListener('pwa-installable', handleInstallable);
    return () => window.removeEventListener('pwa-installable', handleInstallable);
  }, []);

  const isAdmin = useMemo(() => {
    if (!user) return false;
    const email = user.email?.toLowerCase();
    const isFounder = email && SUPER_ADMIN_WHITELIST.includes(email);
    return profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || isFounder;
  }, [user, profile]);

  const passStatus = useMemo(() => {
    if (!profile?.pass) return { active: false, label: "NO PASS", expiry: "N/A" };
    const active = profile.pass.active;
    const expiryDate = new Date(profile.pass.expiryDate);
    const isExpired = expiryDate < new Date();
    
    return {
      active: active && !isExpired,
      label: isExpired ? "EXPIRED" : "PASS ACTIVE",
      expiry: expiryDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    };
  }, [profile]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handleInstallClick = async () => {
    if (typeof window !== 'undefined') {
      const prompt = (window as any).deferredPrompt;
      if (prompt) {
        prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === 'accepted') {
          (window as any).deferredPrompt = null;
          setHasPrompt(false);
          toast({ title: "Welcome!", description: "Cracklix app is being added to your device." });
        }
      } else {
        toast({ 
          title: "Install Service", 
          description: "If you don't see a prompt, the app might already be installed. Look for Cracklix on your home screen." 
        });
      }
    }
  };

  const headerHeightClass = "h-[var(--header-height)]";

  if (!mounted) {
    return (
      <nav className={cn("w-full flex items-center bg-[#0B1528] px-4 lg:px-8", headerHeightClass)}>
        <div className="container mx-auto flex justify-between">
          <div className="w-8 h-8 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-6 w-24 bg-white/5 rounded-lg animate-pulse" />
          <div className="w-8 h-8 bg-white/5 rounded-full animate-pulse" />
        </div>
      </nav>
    );
  }

  return (
    <div className="sticky top-0 z-[1000] w-full pointer-events-auto font-body text-left">
      <nav className={cn(
        "w-full flex items-center bg-[#0B1528] border-b border-white/5 px-2 md:px-4 lg:px-8 shadow-2xl overflow-hidden backdrop-blur-xl",
        "pt-[env(safe-area-inset-top)]",
        headerHeightClass
      )}>
        <div className="container mx-auto max-w-[1536px] flex items-center justify-between h-full gap-1 md:gap-2">
          
          <div className="flex items-center gap-1 md:gap-2 shrink-0 h-full">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <button className="w-8 h-8 md:w-9 md:h-9 bg-white/5 text-white rounded-[10px] border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center cursor-pointer active:scale-90 outline-none">
                  <Menu className="h-4 w-4 md:h-5 md:w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 border-none w-[280px] bg-[#0F172A] z-[2001]">
                <SheetHeader className="sr-only"><SheetTitle>Menu</SheetTitle></SheetHeader>
                <MobileSidebar onClose={() => setIsSidebarOpen(false)} />
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center shrink-0 h-full py-0.5 md:py-1">
               <Logo 
                 imgClassName="h-10 origin-left" 
                 className="active:scale-95 transition-transform" 
               />
            </div>
          </div>

          <div className="hidden lg:flex flex-1 items-center justify-center gap-4 xl:gap-6 h-full">
            <NavLink icon={<Home />} label1="HOME" label2="PAGE" href="/" active={pathname === "/"} />
            <NavLink icon={<Zap />} label1="PRACTICE" label2="TESTS" href="/mocks" active={pathname.startsWith("/mocks")} />
            <NavLink icon={<Newspaper />} label1="CURRENT" label2="AFFAIRS" href="/current-affairs" active={pathname === "/current-affairs"} />

            <Link href="/pass" className="transition-all active:scale-95 group h-full flex items-center">
              <div className={cn(
                "px-4 h-[36px] min-w-[110px] rounded-[10px] border flex items-center justify-center gap-2 transition-all",
                pathname === "/pass" 
                  ? "bg-[#F97316]/20 border-[#F97316]" 
                  : "bg-[#F97316]/10 border-[#F97316]/30 hover:bg-[#F97316]/20"
              )}>
                <Gem className={cn("h-3 w-3", pathname === "/pass" ? "text-white fill-[#F97316]" : "text-[#F97316]")} />
                <span className="text-[9px] font-black uppercase tracking-widest text-white whitespace-nowrap">GET PASS</span>
              </div>
            </Link>

            <div onClick={handleInstallClick} className="cursor-pointer transition-all active:scale-95 group h-full flex items-center">
               <div className={cn(
                 "flex items-center gap-2 transition-all",
                 hasPrompt ? "opacity-100" : "opacity-60 grayscale hover:opacity-100 hover:grayscale-0"
               )}>
                  <div className={cn(
                    "h-7 w-7 rounded-lg flex items-center justify-center border",
                    hasPrompt ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/10 text-slate-400"
                  )}>
                     <Download className="h-3 w-3" />
                  </div>
                  <div className="flex flex-col leading-tight text-left">
                     <span className="text-[9px] font-black text-white leading-none">INSTALL</span>
                     <span className="text-[9px] font-black text-white leading-none">APP</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-3 shrink-0 h-full">
             {user && (
                <div 
                  onClick={() => router.push('/pass')}
                  className={cn(
                    "hidden sm:flex h-[36px] px-3 min-w-[120px] rounded-lg items-center justify-center gap-2 shadow-xl shrink-0 group border transition-all cursor-pointer active:scale-95",
                    passStatus.active ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30"
                  )}
                >
                   <Gem className={cn("h-3 w-3 fill-current", passStatus.active ? "text-emerald-400" : "text-rose-400")} />
                   <div className="flex flex-col text-left leading-none gap-0.5">
                      <span className={cn("text-[8px] font-black uppercase whitespace-nowrap", passStatus.active ? "text-emerald-400" : "text-rose-400")}>
                        {passStatus.label}
                      </span>
                      <span className="text-[7px] text-slate-500 font-bold uppercase whitespace-nowrap">
                         {passStatus.active ? `EXP: ${passStatus.expiry}` : "UNLOCK NOW"}
                      </span>
                   </div>
                </div>
             )}

             <Link href="/search" className={cn(
               "w-8 h-8 md:w-[36px] md:h-[36px] rounded-lg border border-white/10 transition-all flex items-center justify-center shadow-lg active:scale-90 shrink-0",
               pathname === "/search" ? "bg-white/10 text-white border-white/30" : "bg-white/5 text-slate-400 hover:text-white"
             )}>
                <Search className="h-[14px] w-[14px] md:h-[16px] md:w-[16px]" />
             </Link>

             <div className="relative">
               {user ? (
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <button className="w-8 h-8 md:w-[38px] md:h-[38px] rounded-full overflow-hidden border-[2px] border-white/10 hover:border-primary transition-all bg-white shadow-2xl focus:outline-none flex items-center justify-center active:scale-90 cursor-pointer shrink-0">
                       <StudentAvatar profile={profile} className="h-full w-full border-none" iconClassName="text-[#0B1528]" />
                     </button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent className="w-56 bg-[#0F172A] border-white/10 text-white rounded-2xl p-2 shadow-5xl z-[2001]" align="end">
                     <div className="px-4 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">STUDENT AREA</div>
                     <DropdownMenuItem asChild className="flex items-center gap-4 px-4 py-3 cursor-pointer rounded-xl transition-all focus:bg-white/5 focus:text-white group">
                       <Link href="/profile" className="w-full flex items-center gap-4">
                         <User className="h-4 w-4 text-blue-400" />
                         <span className="font-bold text-[12px] tracking-tight uppercase">MY PROFILE</span>
                       </Link>
                     </DropdownMenuItem>
                     <DropdownMenuItem asChild className="flex items-center gap-4 px-4 py-3 cursor-pointer rounded-xl transition-all focus:bg-white/5 focus:text-white group">
                       <Link href="/my-exams" className="w-full flex items-center gap-4">
                         <Award className="h-4 w-4 text-emerald-400" />
                         <span className="font-bold text-[12px] tracking-tight uppercase">MY RESULTS</span>
                       </Link>
                     </DropdownMenuItem>
                     {isAdmin && (
                       <DropdownMenuItem asChild className="flex items-center gap-4 px-4 py-3 cursor-pointer rounded-xl transition-all bg-white/5 focus:bg-white/10 group mt-1 border border-white/5">
                         <Link href="/admin" className="w-full flex items-center gap-4">
                           <ShieldCheck className="h-4 w-4 text-rose-500" />
                           <span className="font-bold text-[12px] tracking-tight uppercase text-white">ADMIN PANEL</span>
                         </Link>
                       </DropdownMenuItem>
                     )}
                     <DropdownMenuSeparator className="bg-white/5 my-2" />
                     <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-4 px-4 py-3 cursor-pointer rounded-xl transition-all focus:bg-rose-50/10 group">
                       <LogOut className="h-4 w-4 shrink-0 text-rose-500" />
                       <span className="font-bold text-[12px] tracking-tight uppercase text-rose-500">LOGOUT</span>
                     </DropdownMenuItem>
                   </DropdownMenuContent>
                 </DropdownMenu>
               ) : (
                 <Button asChild className="bg-primary hover:bg-orange-600 text-white font-black px-3 md:px-4 h-7 md:h-9 uppercase text-[9px] md:text-[10px] tracking-widest shadow-xl border-none transition-all active:scale-95">
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

function NavLink({ icon, label1, label2, href, active }: { icon: React.ReactNode, label1: string, label2: string, href: string, active: boolean }) {
  return (
    <Link href={href} className={cn(
      "flex items-center gap-2 group transition-all active:scale-95 h-full",
      active ? "opacity-100" : "opacity-70 hover:opacity-100"
    )}>
      <div className={cn(
        "h-7 w-7 rounded-lg flex items-center justify-center shadow-sm transition-all",
        active ? "bg-[#F97316] text-white" : "bg-white/5 text-slate-400 group-hover:text-[#F97316]"
      )}>
        {React.cloneElement(icon as React.ReactElement, { className: "h-3.5 w-3.5" })}
      </div>
      <div className="flex flex-col text-left leading-tight">
        <span className={cn("text-[10px] font-black uppercase tracking-widest leading-none", active ? "text-[#F97316]" : "text-white")}>{label1}</span>
        <span className={cn("text-[10px] font-black uppercase tracking-widest leading-none", active ? "text-[#F97316]" : "text-white")}>{label2}</span>
      </div>
    </Link>
  )
}
