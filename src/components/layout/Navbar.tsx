'use client';

import Link from "next/link";
import { Menu, Search, Zap, LogOut, ShieldCheck, Download, User } from "lucide-react";
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
 * @fileOverview High-Fidelity Restored Navbar v55.0.
 * MATCHED: Layout exactly to user screenshot (Menu | Logo | Pass Hub | Search | Profile).
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
    if (!profile?.pass) return null;
    const active = profile.pass.active;
    const expiry = new Date(profile.pass.expiryDate);
    const isExpired = expiry < new Date();
    
    return {
      active: active && !isExpired,
      label: isExpired ? "PASS EXPIRED" : "PASS ACTIVE",
      expiry: expiry.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
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
        <div className="bg-primary text-white py-1 flex items-center overflow-hidden relative shadow-2xl h-8">
          <div className="flex items-center gap-2 animate-marquee whitespace-nowrap min-w-full">
            <Zap className="h-3 w-3 shrink-0 ml-4 fill-current" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">{announcement.announcement}</p>
            <span className="mx-40 md:mx-80" />
            <Zap className="h-3 w-3 shrink-0 fill-current" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">{announcement.announcement}</p>
            <span className="mx-40 md:mx-80" />
          </div>
        </div>
      )}

      <nav className="w-full bg-[#0B1528] border-b border-white/5 h-20 md:h-24 flex items-center shadow-2xl backdrop-blur-md">
        <div className="container mx-auto max-w-full flex items-center justify-between px-4 md:px-10">
          
          {/* LEFT: MENU & LOGO */}
          <div className="flex items-center gap-4 md:gap-8">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <button className="bg-white/5 text-white p-2.5 md:p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 border-none w-[300px] bg-[#0F172A] z-[2001]">
                <SheetHeader className="sr-only"><SheetTitle>Menu</SheetTitle></SheetHeader>
                <MobileSidebar onClose={() => setIsSidebarOpen(false)} />
              </SheetContent>
            </Sheet>
            <Logo variant="light" className="scale-90 md:scale-100" />
          </div>

          {/* RIGHT: ACTION NODES */}
          <div className="flex items-center gap-3 md:gap-6">
            
            {/* 1. PASS STATUS NODE (SCREENSHOT MATCH) */}
            {mounted && user && passStatus && (
               <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end gap-1">
                     <Badge className={cn(
                       "border-none px-4 py-1 rounded-full font-black uppercase text-[8px] md:text-[9px] tracking-widest shadow-lg text-white",
                       passStatus.active ? "bg-[#10B981]" : "bg-rose-600"
                     )}>
                        {passStatus.label}
                     </Badge>
                     <p className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">
                        VALID TILL {passStatus.expiry}
                     </p>
                  </div>
                  <div className="h-10 w-px bg-white/10 hidden md:block" />
               </div>
            )}

            {/* 2. INSTALL APP HUB */}
            {mounted && canInstall && (
              <Button 
                onClick={() => (window as any).deferredPrompt?.prompt()}
                variant="ghost" 
                className="hidden lg:flex h-12 px-6 rounded-xl border border-[#10B981]/20 bg-[#10B981]/5 text-[#10B981] font-black uppercase text-[10px] tracking-widest gap-2 hover:bg-[#10B981] hover:text-white transition-all shadow-md"
              >
                 <Download className="h-4 w-4" /> Install App
              </Button>
            )}

            {/* 3. SEARCH NODE */}
            <Link 
               href="/search" 
               className="bg-white/5 text-slate-400 hover:text-white p-2.5 md:p-3 rounded-xl border border-white/10 transition-all hover:bg-white/10"
            >
              <Search className="h-5 w-5 md:h-6 md:w-6" />
            </Link>

            {/* 4. USER PROFILE HUB */}
            <div className="relative shrink-0">
              {!mounted || loading ? (
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white/5 animate-pulse" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-10 w-10 md:h-12 md:w-12 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary transition-all bg-[#0F172A] shadow-2xl focus:outline-none">
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
                        <span className="font-bold text-[13px] tracking-tight uppercase">My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild className="flex items-center gap-3 px-4 py-4 cursor-pointer rounded-xl transition-all focus:bg-white/5">
                        <Link href="/admin" className="w-full flex items-center gap-3 text-primary">
                          <Zap className="h-4 w-4 fill-current" />
                          <span className="font-bold text-[13px] tracking-tight uppercase">Admin Panel</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-3 px-4 py-4 cursor-pointer rounded-xl transition-all focus:bg-rose-500/10 focus:text-rose-500 text-rose-500/80">
                      <LogOut className="h-4 w-4 shrink-0" />
                      <span className="font-bold text-[13px] tracking-tight uppercase">Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild className="bg-primary hover:bg-orange-600 text-white font-black px-4 md:px-8 h-10 md:h-12 uppercase text-[10px] md:text-[12px] tracking-widest shadow-xl border-none">
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
