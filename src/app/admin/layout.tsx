'use client';

import React, { useEffect, useState, useMemo } from "react";
import { useUser, useAuth } from "@/firebase";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Menu, ShieldCheck, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/brand/Logo";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

/**
 * @fileOverview Admin Layout v65.0.
 * UPDATED: Maximized header logo size (h-32 md:h-48) and increased header height for bolder branding.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, profileLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname() ?? '';
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('admin-sidebar-state');
      if (savedState) {
        setIsSidebarOpen(savedState === 'expanded');
      } else {
        setIsSidebarOpen(window.innerWidth >= 1024);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [pathname, mounted]);

  const isAdmin = useMemo(() => {
    if (!profile && !user) return false;
    const userEmail = user?.email?.toLowerCase();
    const isFounder = userEmail && SUPER_ADMIN_WHITELIST.includes(userEmail);
    return (profile && (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN')) || isFounder;
  }, [profile, user]);

  const isAccessBlocked = mounted && !loading && (!user || (!isAdmin && !profileLoading));

  useEffect(() => {
    if (isAccessBlocked) {
      if (!user) {
        router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
      } else {
        router.replace('/dashboard');
      }
    }
  }, [isAccessBlocked, user, router, pathname]);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-sidebar-state', newState ? 'expanded' : 'collapsed');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const isGlobalLoading = !mounted || loading || (user && !profile && profileLoading);

  if (!mounted) return (
    <div className="h-screen w-full bg-white flex items-center justify-center">
       <Loader2 className="h-10 w-10 text-primary animate-spin" />
    </div>
  );

  if (isGlobalLoading) return (
    <div className="h-screen w-full bg-[#0F172A] flex flex-col items-center justify-center space-y-6">
       <div className="relative">
          <ShieldCheck className="h-12 w-12 text-blue-600 animate-pulse" />
          <Loader2 className="absolute -bottom-2 -right-2 h-6 w-6 text-primary animate-spin" />
       </div>
       <div className="text-center space-y-1">
          <p className="text-[10px] font-black tracking-[0.4em] text-slate-500 uppercase">Admin Hub</p>
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Opening Panel...</p>
       </div>
    </div>
  );
  
  if (!user || !isAdmin) return null;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-screen w-full bg-white font-body flex overflow-hidden">
        
        <AdminSidebar 
          isOpen={isSidebarOpen} 
          onToggle={toggleSidebar} 
          onCloseMobile={() => setIsSidebarOpen(false)}
          profile={profile}
          handleLogout={handleLogout}
          pathname={pathname}
        />

        <div className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out w-full",
          isSidebarOpen ? "lg:pl-[280px]" : "lg:pl-[88px]"
        )}>
          <header className="h-[100px] md:h-[130px] border-b border-slate-50 bg-white/80 backdrop-blur-xl sticky top-0 z-30 flex items-center px-4 md:px-8 justify-between shrink-0">
            {/* LEFT BLOCK: TOGGLE + LOGO (STRICT ZERO GAP) */}
            <div className="flex items-center gap-0">
              <button 
                onClick={toggleSidebar}
                className="bg-white border border-slate-200 h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center shrink-0 active:scale-95 shadow-sm hover:border-primary/30 cursor-pointer"
              >
                <Menu className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <div className="shrink-0">
                <Logo 
                  variant="light" 
                  href="/admin"
                  className="flex-shrink-0 ml-0 p-0" 
                  imgClassName="h-32 md:h-48 w-auto"
                  align="left"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
               <Button asChild variant="outline" className="hidden sm:flex h-11 rounded-full text-[10px] font-bold tracking-tight px-6 gap-2">
                  <Link href="/">Student View <ExternalLink className="h-3 w-3 opacity-40" /></Link>
               </Button>
               <div className="h-11 w-11 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg">
                  {profile?.name?.[0] || 'A'}
               </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-10 lg:p-12 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
