'use client';

import Link from "next/link";
import { Menu, Search, Zap, LogOut, ShieldCheck, Download, User, Target, Newspaper, Gem, ChevronRight } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

/**
 * @fileOverview FINAL Screenshot Replica Navbar v65.0.
 * MATCHED: Exact sequence and styling from user screenshot.
 * Changes: Removed "Cracklix" text, increased logo size, and optimized functional node spacing.
 * Sequence: [Menu] -> [Logo] -> [My Exams] -> [Practice Tests] -> [Get Pass] -> [Current Affairs] -> [Install App] -> [Pass Active Hub] -> [Search] -> [User]
 */
export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [announcement, setAnnouncement] = useState<any>(null);
  const { user, profile, loading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && (window as any).deferredPrompt) {
      setCanInstall(true);
    }
    const handleInstallable = () => setCanInstall(true);
    window.addEventListener('pwa-installable', handleInstallable);
    
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
      {announcement?.showAnnouncement && (
        <div className="bg-primary text-white py-1 flex items-center overflow-hidden relative shadow-2xl h-8 border-b border-white/5">
          <div className="flex items-center gap-2 animate-marquee whitespace-nowrap min-w-full">
            <Zap className="h-3 w-3 shrink-0 ml-4 fill-current" />
            <p className="text-[9px] font-black uppercase tracking-[0.3em]">{announcement.announcement}</p>
            <span className="mx-40 md:mx-80" />
            <Zap className="h-3 w-3 shrink-0 fill-current" />
            <p className="text-[9px] font-black uppercase tracking-[0.3em]">{announcement.announcement}</p>
            <span className="mx-40 md:mx-80" />
          </div>
        </div>
      )}

      <nav className="w-full bg-[#0B1528] border-b border-white/5 h-24 md:h-28 flex items-center shadow-2xl">
        <div className="container mx-auto max-w-full flex items-center justify-between px-4 md:px-8 overflow-x-auto no-scrollbar">
          
          {/* 1. MENU & LOGO */}
          <div className="flex items-center gap-4 md:gap-10 shrink-0">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <button className="bg-white/5 text-white p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                  <Menu className="h-7 w-7" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 border-none w-[300px] bg-[#0F172A] z-[2001]">
                <SheetHeader className="sr-only"><SheetTitle>Menu</SheetTitle></SheetHeader>
                <MobileSidebar onClose={() => setIsSidebarOpen(false)} />
              </SheetContent>
            </Sheet>
            <Logo variant="light" className="scale-100" />
          </div>

          {/* 2. NAV LINKS HUB (SCREENSHOT REPLICA SEQUENCE) */}
          <div className="flex items-center gap-6 md:gap-10 mx-6 md:mx-12 shrink-0">
             {/* MY EXAMS */}
             <Link href="/my-exams" className="flex items-center gap-3 group">
                <Target className="h-6 w-6 text-primary" />
                <div className="flex flex-col text-left">
                   <span className="text-[11px] md:text-[14px] font-black text-white group-hover:text-primary transition-colors uppercase tracking-tight leading-none">MY</span>
                   <span className="text-[11px] md:text-[14px] font-black text-white group-hover:text-primary transition-colors uppercase tracking-tight mt-0.5 leading-none">EXAMS</span>
                </div>
             </Link>

             {/* PRACTICE TESTS */}
             <Link href="/mocks" className="flex items-center gap-3 group">
                <div className="flex flex-col text-left">
                   <span className="text-[11px] md:text-[14px] font-black text-white group-hover:text-primary transition-colors uppercase tracking-tight leading-none">PRACTICE</span>
                   <span className="text-[11px] md:text-[14px] font-black text-white group-hover:text-primary transition-colors uppercase tracking-tight mt-0.5 leading-none">TESTS</span>
                </div>
             </Link>

             {/* GET PASS BUTTON (MATCHED TO SCREENSHOT) */}
             <Button asChild className="hidden sm:flex h-12 md:h-16 px-6 md:px-10 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl transition-all shadow-xl gap-4">
                <Link href="/pass">
                   <Gem className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                   <span className="text-[11px] md:text-[14px] font-black text-primary uppercase leading-none tracking-widest">GET PASS</span>
                </Link>
             </Button>

             {/* CURRENT AFFAIRS */}
             <Link href="/current-affairs" className="flex items-center gap-3 group">
                <Newspaper className="h-6 w-6 text-primary" />
                <div className="flex flex-col text-left">
                   <span className="text-[11px] md:text-[14px] font-black text-white group-hover:text-primary transition-colors uppercase tracking-tight leading-none">CURRENT</span>
                   <span className="text-[11px] md:text-[14px] font-black text-white group-hover:text-primary transition-colors uppercase tracking-tight mt-0.5 leading-none">AFFAIRS</span>
                </div>
             </Link>
          </div>

          {/* 3. RIGHT ACTION NODES */}
          <div className="flex items-center gap-3 md:gap-8 shrink-0 ml-auto">
            
            {/* INSTALL APP HUB */}
            <button 
              onClick={() => (window as any).deferredPrompt?.prompt()}
              className="hidden lg:flex items-center gap-3 h-12 md:h-16 px-6 rounded-2xl border border-[#10B981]/20 bg-[#10B981]/5 text-[#10B981] group hover:bg-[#10B981] hover:text-white transition-all shadow-md"
            >
               <Download className="h-5 w-5" />
               <span className="text-[11px] md:text-[14px] font-black uppercase tracking-widest">INSTALL APP</span>
            </button>

            {/* PASS STATUS NODE (REPLICA) */}
            {mounted && user && (
               <div className="flex items-center gap-4 h-12 md:h-16 px-5 md:px-8 rounded-2xl border border-[#10B981]/40 bg-[#10B981]/5 shrink-0">
                  <Gem className="h-6 w-6 md:h-7 md:w-7 text-[#10B981] shrink-0" />
                  <div className="flex flex-col items-start justify-center">
                     <span className={cn(
                       "text-[11px] md:text-[14px] font-black uppercase tracking-tight leading-none",
                       passStatus.active ? "text-[#10B981]" : "text-rose-500"
                     )}>
                        {passStatus.label}
                     </span>
                     <span className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        EXP: {passStatus.expiry}
                     </span>
                  </div>
               </div>
            )}

            <div className="h-8 w-px bg-white/10 hidden md:block" />

            {/* SEARCH NODE */}
            <Link 
               href="/search" 
               className="bg-white/5 text-slate-400 hover:text-white p-3 md:p-4 rounded-2xl border border-white/10 transition-all hover:bg-white/10"
            >
              <Search className="h-6 w-6" />
            </Link>

            {/* PROFILE HUB */}
            <div className="relative shrink-0">
              {!mounted || loading ? (
                <div className="h-10 w-10 md:h-14 md:w-14 rounded-2xl bg-white/5 animate-pulse" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-12 w-12 md:h-14 md:w-14 rounded-full overflow-hidden border-2 border-white/20 hover:border-primary transition-all bg-[#0F172A] shadow-2xl focus:outline-none">
                      <StudentAvatar profile={profile} className="h-full w-full border-none" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 bg-[#0F172A] border-white/10 text-white rounded-[2rem] p-2 shadow-5xl z-[2001]" align="end">
                    <div className="px-4 py-4 flex items-center gap-3">
                       <StudentAvatar profile={profile} className="h-10 w-10" />
                       <div className="min-w-0">
                          <p className="text-[11px] font-black uppercase tracking-tight truncate leading-none mb-1">{profile?.name || "Aspirant"}</p>
                          <p className="text-[8px] font-bold text-slate-500 truncate">{user.email}</p>
                       </div>
                    </div>
                    
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem asChild className="flex items-center gap-3 px-4 py-4 cursor-pointer rounded-xl transition-all focus:bg-white/5">
                      <Link href="/profile" className="w-full flex items-center gap-3">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-bold text-[13px] tracking-tight uppercase">My Profile Hub</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild className="flex items-center gap-3 px-4 py-4 cursor-pointer rounded-xl transition-all focus:bg-white/5">
                        <Link href="/admin" className="w-full flex items-center gap-3 text-primary">
                          <Zap className="h-4 w-4 fill-current" />
                          <span className="font-bold text-[13px] tracking-tight uppercase">Master Admin</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-3 px-4 py-4 cursor-pointer rounded-xl transition-all focus:bg-rose-500/10 focus:text-rose-500 text-rose-500/80">
                      <LogOut className="h-4 w-4 shrink-0" />
                      <span className="font-bold text-[13px] tracking-tight uppercase">Logout Registry</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild className="bg-primary hover:bg-orange-600 text-white font-black px-4 md:px-8 h-10 md:h-14 uppercase text-[10px] md:text-[12px] tracking-widest shadow-xl border-none">
                  <Link href="/login">Login Hub</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
