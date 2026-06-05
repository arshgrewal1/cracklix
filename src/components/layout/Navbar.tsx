
'use client';

import Link from "next/link";
import { Menu, Search, Zap, CreditCard, LogOut, ShieldCheck, Megaphone, LayoutGrid } from "lucide-react";
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
        <div className="bg-[#F97316] text-white py-1 px-4 flex items-center justify-center gap-2 overflow-hidden relative min-h-[22px]">
          <Megaphone className="h-2.5 w-2.5 shrink-0" />
          <p className="text-[8px] font-black uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden text-ellipsis">
            {settings.announcement}
          </p>
        </div>
      )}

      <nav className="w-full bg-[#0B1528] border-b border-white/5 py-1.5 md:py-3 shadow-xl backdrop-blur-md bg-opacity-95">
        <div className="container mx-auto max-w-[98%] lg:max-w-[90%] flex items-center justify-between px-2">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1 md:gap-4">
               <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                 <SheetTrigger asChild>
                   <button className="lg:hidden text-white p-1.5 hover:bg-white/5 rounded-xl transition-all active:scale-90">
                     <Menu className="h-5 w-5" />
                   </button>
                 </SheetTrigger>
                 <SheetContent side="left" className="p-0 border-none w-[280px]">
                   <SheetHeader className="sr-only"><SheetTitle>Menu</SheetTitle></SheetHeader>
                   <MobileSidebar onClose={() => setIsSidebarOpen(false)} />
                 </SheetContent>
               </Sheet>
               <Logo variant="light" className="scale-[0.75] md:scale-90 origin-left" />
            </div>

            <div className="hidden lg:flex items-center gap-8 text-[12px] font-bold uppercase tracking-widest text-[#7A8B9E]">
              <Link href="/exams" className={pathname === '/exams' ? 'text-white' : 'hover:text-primary transition-colors'}>Exams</Link>
              <Link href="/mocks" className={pathname === '/mocks' ? 'text-white' : 'hover:text-primary transition-colors'}>Mocks</Link>
              <Link href="/pass" className="flex items-center gap-2 hover:text-primary transition-colors"><CreditCard className="h-3.5 w-3.5 text-primary" /> Pass</Link>
              <Link href="/notes" className="flex items-center gap-2 hover:text-primary transition-colors"><Zap className="h-3.5 w-3.5 text-emerald-500" /> Notes</Link>
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <Link href="/search" className="text-slate-400 hover:text-white p-1.5 md:p-2 rounded-xl hover:bg-white/5 transition-all">
              <Search className="h-4 w-4 md:h-5 md:w-5" />
            </Link>

            {loading ? (
              <Skeleton className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-white/5" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 md:h-9 md:w-9 p-0 rounded-full overflow-hidden border border-white/10 hover:bg-white/5 bg-[#0F172A] shadow-inner focus-visible:ring-0">
                    <StudentAvatar profile={profile} className="h-full w-full border-none" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-[#0F172A] border-white/10 text-white rounded-[2rem] p-3 shadow-4xl animate-in fade-in zoom-in-95 duration-200" align="end">
                  <DropdownMenuLabel className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Account Access</DropdownMenuLabel>
                  
                  <DropdownNavItem href="/dashboard" icon={<LayoutGrid className="h-5 w-5" />} label="Dashboard" />
                  <DropdownNavItem href="/pass" icon={<CreditCard className="h-5 w-5" />} label="My Pass" />
                  
                  {isAdmin && (
                    <DropdownNavItem 
                      href="/admin" 
                      icon={<ShieldCheck className="h-5 w-5" />} 
                      label="Admin Portal" 
                      className="text-primary focus:bg-primary/5 focus:text-primary" 
                    />
                  )}
                  
                  <DropdownMenuSeparator className="bg-white/5 my-2" />
                  
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="flex items-center gap-4 px-4 py-3.5 cursor-pointer rounded-2xl transition-all focus:bg-rose-500/10 focus:text-rose-500 text-rose-500/80"
                  >
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span className="font-bold text-sm tracking-tight">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="bg-[#F97316] hover:bg-orange-600 text-white font-black px-4 md:px-5 py-1.5 rounded-xl h-8 md:h-10 uppercase text-[9px] md:text-[10px] tracking-widest shadow-lg transition-all active:scale-95">
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
    <DropdownMenuItem asChild className={cn("flex items-center gap-4 px-4 py-3.5 cursor-pointer rounded-2xl transition-all focus:bg-white/5", className)}>
      <Link href={href} className="w-full flex items-center gap-4">
        <span className="shrink-0">{icon}</span>
        <span className="font-bold text-sm tracking-tight">{label}</span>
      </Link>
    </DropdownMenuItem>
  )
}
