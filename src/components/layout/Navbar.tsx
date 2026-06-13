'use client';

import Link from "next/link";
import { Menu, Search, Zap, LogOut, Download, User, Target, Newspaper, Gem, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/brand/Logo";
import { useState, useMemo, useEffect } from "react";
import { useUser, useAuth, useFirestore } from "@/firebase";
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
import { doc, onSnapshot } from "firebase/firestore";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import MobileSidebar from "./MobileSidebar";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Final High-Fidelity Header Spec v100.0.
 * MATCHED: 82px Height, Dark Navy Gradient, Glass Effect, and specific Node sizes.
 */
export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [announcement, setAnnouncement] = useState<any>(null);
  const { user, profile, loading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (db) {
       return onSnapshot(doc(db, 'settings', 'global'), (snap) => {
          if (snap.exists()) setAnnouncement(snap.data());
       });
    }
  }, [db]);

  const passStatus = useMemo(() => {
    if (!profile?.pass) return { active: false, label: "FREE PASS", expiry: "N/A" };
    const active = profile.pass.active;
    const expiryDate = new Date(profile.pass.expiryDate);
    const isExpired = expiryDate < new Date();
    
    return {
      active: active && !isExpired,
      label: isExpired ? "PASS EXPIRED" : "PASS ACTIVE",
      expiry: expiryDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    };
  }, [profile]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN';

  return (
    <div className="sticky top-0 z-[1000] w-full pointer-events-auto">
      {/* 1. ANNOUNCEMENT BAR */}
      {announcement?.showAnnouncement && (
        <div className="bg-[#F97316] text-white py-2 flex items-center overflow-hidden relative shadow-lg h-9">
          <div className="flex items-center gap-3 animate-marquee whitespace-nowrap min-w-full">
            <Zap className="h-3.5 w-3.5 shrink-0 ml-4 fill-current" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">{announcement.announcement}</p>
            <span className="mx-40 md:mx-80" />
            <Zap className="h-3.5 w-3.5 shrink-0 fill-current" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">{announcement.announcement}</p>
            <span className="mx-40 md:mx-80" />
          </div>
        </div>
      )}

      {/* 2. MAIN HEADER (82px Desktop / 72px Mobile) */}
      <nav className={cn(
        "w-full h-[72px] lg:h-[82px] flex items-center transition-all duration-300",
        "bg-gradient-to-r from-[#0B1528] to-[#13233F] backdrop-blur-[12px] border-b border-white/[0.08]"
      )}>
        <div className="container mx-auto max-w-[1440px] flex items-center justify-between px-4 lg:px-6">
          
          {/* LEFT: MENU & LOGO */}
          <div className="flex items-center gap-4 lg:gap-[16px] shrink-0">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <button className="w-[40px] h-[40px] bg-white/[0.05] text-white rounded-[14px] border border-white/[0.08] hover:bg-white/[0.1] transition-all flex items-center justify-center cursor-pointer active:scale-95">
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 border-none w-[300px] bg-[#0F172A] z-[2001]">
                <SheetHeader className="sr-only"><SheetTitle>Menu</SheetTitle></SheetHeader>
                <MobileSidebar onClose={() => setIsSidebarOpen(false)} />
              </SheetContent>
            </Sheet>
            <Logo className="h-[36px] lg:h-[42px] transition-transform hover:scale-[1.03]" />
          </div>

          {/* CENTER: DESKTOP NAVIGATION */}
          <div className="hidden lg:flex items-center gap-[48px]">
             <NavMenuItem label="My Exams" href="/my-exams" />
             <NavMenuItem label="Practice Tests" href="/mocks" />
             <NavMenuItem label="Current Affairs" href="/current-affairs" />
             <NavMenuItem label="Results" href="/dashboard" />
             <NavMenuItem label="Pricing" href="/pricing" />
          </div>

          {/* RIGHT: CTAs & PROFILE */}
          <div className="flex items-center gap-3 lg:gap-5 shrink-0">
             
             {/* GET PASS (Desktop Primary CTA) */}
             <Link href="/pass" className="hidden lg:flex">
                <Button className="w-[180px] h-[56px] bg-[#F97316]/10 border border-[#F97316]/30 rounded-[18px] text-[#F97316] font-extrabold uppercase text-[13px] tracking-[0.18em] hover:bg-[#F97316]/20 transition-all hover:scale-[1.03] active:scale-95">
                   GET PASS
                </Button>
             </Link>

             {/* INSTALL APP (High-Fidelity Badge) */}
             <button 
                onClick={() => (window as any).deferredPrompt?.prompt()}
                className="hidden lg:flex w-[170px] h-[52px] items-center justify-center gap-3 bg-white/[0.03] border border-[#10B981]/30 rounded-xl hover:bg-[#10B981]/10 transition-all hover:scale-[1.03] active:scale-95 group"
             >
                <Download className="h-[22px] w-[22px] text-[#10B981]" />
                <span className="text-[11px] font-black text-[#10B981] uppercase tracking-[0.15em]">INSTALL APP</span>
             </button>

             {/* SUBSCRIPTION BADGE */}
             {mounted && user && (
                <div className="hidden md:flex w-[160px] h-[52px] items-center gap-3 px-4 bg-white/[0.03] border border-white/10 rounded-xl transition-all">
                   <Gem className="h-[22px] w-[22px] text-[#10B981] shrink-0 fill-current opacity-40" />
                   <div className="flex flex-col items-start min-w-0">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-tight leading-none",
                        passStatus.active ? "text-[#10B981]" : "text-rose-500"
                      )}>
                         {passStatus.label}
                      </span>
                      <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mt-1 truncate">
                         EXP: {passStatus.expiry}
                      </span>
                   </div>
                </div>
             )}

             {/* SEARCH & USER */}
             <div className="flex items-center gap-2 lg:gap-4">
                <Link 
                   href="/search" 
                   className="w-[44px] h-[44px] bg-white/[0.05] text-slate-400 hover:text-white rounded-xl border border-white/10 transition-all flex items-center justify-center hover:scale-[1.05]"
                >
                  <Search className="h-[22px] w-[22px]" />
                </Link>

                <div className="relative shrink-0">
                  {!mounted || loading ? (
                    <div className="h-[48px] w-[48px] rounded-full bg-white/5 animate-pulse" />
                  ) : user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="h-[48px] w-[48px] rounded-full overflow-hidden border-2 border-white/10 hover:border-primary transition-all bg-[#0F172A] shadow-2xl focus:outline-none hover:scale-[1.05]">
                          <StudentAvatar profile={profile} className="h-full w-full border-none" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-72 bg-[#0F172A] border-white/10 text-white rounded-[2.5rem] p-3 shadow-5xl z-[2001]" align="end">
                        <div className="px-5 py-6 flex items-center gap-4">
                           <StudentAvatar profile={profile} className="h-12 w-12" />
                           <div className="min-w-0">
                              <p className="text-[12px] font-black uppercase tracking-tight truncate leading-none mb-1.5">{profile?.name || "Aspirant"}</p>
                              <p className="text-[9px] font-bold text-slate-500 truncate">{user.email}</p>
                           </div>
                        </div>
                        
                        <DropdownMenuSeparator className="bg-white/5" />
                        <DropdownMenuItem asChild className="flex items-center gap-4 px-5 py-5 cursor-pointer rounded-xl transition-all focus:bg-white/5">
                          <Link href="/profile" className="w-full flex items-center gap-4">
                            <User className="h-5 w-5 text-primary" />
                            <span className="font-bold text-[14px] tracking-tight uppercase">My Profile Hub</span>
                          </Link>
                        </DropdownMenuItem>
                        {isAdmin && (
                          <DropdownMenuItem asChild className="flex items-center gap-4 px-5 py-5 cursor-pointer rounded-xl transition-all focus:bg-white/5">
                            <Link href="/admin" className="w-full flex items-center gap-4 text-primary">
                              <Zap className="h-5 w-5 fill-current" />
                              <span className="font-bold text-[14px] tracking-tight uppercase">Master Admin</span>
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-white/5" />
                        <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-4 px-5 py-5 cursor-pointer rounded-xl transition-all focus:bg-rose-500/10 focus:text-rose-500 text-rose-500/80">
                          <LogOut className="h-5 w-5 shrink-0" />
                          <span className="font-bold text-[14px] tracking-tight uppercase">Logout Registry</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button asChild className="bg-primary hover:bg-orange-600 text-white font-black px-6 h-11 uppercase text-[12px] tracking-widest shadow-xl border-none transition-all active:scale-95">
                      <Link href="/login">Login Hub</Link>
                    </Button>
                  )}
                </div>
             </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

function NavMenuItem({ label, href }: { label: string; href: string }) {
   return (
      <Link 
        href={href} 
        className="text-white/70 text-[13px] font-bold uppercase tracking-[0.18em] hover:text-[#F97316] transition-all duration-300 hover:scale-[1.03]"
      >
         {label}
      </Link>
   );
}
