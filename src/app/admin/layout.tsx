'use client';

import React, { useEffect, useState } from "react";
import { useUser, useAuth } from "@/firebase";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Menu, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/brand/Logo";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

/**
 * @fileOverview Admin Layout v20.0.
 * UPDATED: Refined top header height and logo scale for a clean administrative portal.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useUser();
  const authInstance = useAuth();
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedState = localStorage.getItem('admin-sidebar-state');
    if (savedState) {
      setIsSidebarOpen(savedState === 'expanded');
    } else {
      setIsSidebarOpen(window.innerWidth >= 1024);
    }
  }, []);

  // SIDEBAR AUTO-COLLAPSE ON NAVIGATION
  useEffect(() => {
    if (mounted && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [pathname, mounted]);

  const userEmail = user?.email?.toLowerCase();
  const isFounder = userEmail && SUPER_ADMIN_WHITELIST.includes(userEmail);
  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || isFounder;

  useEffect(() => {
    if (!loading && mounted) {
      if (!user) {
        router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
      } else if (!isAdmin) {
        router.replace('/dashboard');
      }
    }
  }, [user, profile, loading, router, isAdmin, mounted, pathname]);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem('admin-sidebar-state', newState ? 'expanded' : 'collapsed');
  };

  const handleLogout = async () => {
    await signOut(authInstance);
    router.push('/login');
  };

  if (!mounted || loading) return (
    <div className="h-screen w-full bg-[#0F172A] flex flex-col items-center justify-center space-y-6 text-center">
       <ShieldCheck className="h-10 w-10 md:h-12 md:w-12 text-blue-600 animate-pulse" />
       <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Securing Admin Panel...</p>
    </div>
  );
  
  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen w-full bg-white font-body relative flex overflow-hidden">
      
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar} 
        onCloseMobile={() => setIsSidebarOpen(false)}
        profile={profile}
        handleLogout={handleLogout}
        pathname={pathname}
      />

      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out w-full min-w-0 overflow-x-hidden",
        isSidebarOpen ? "lg:pl-[280px]" : "lg:pl-[88px]"
      )}>
        <header className="pt-safe border-b border-slate-50 bg-white/80 backdrop-blur-xl sticky top-0 z-30 shrink-0">
          <div className="h-[80px] md:h-[110px] flex items-center px-2 md:px-6 justify-between">
            <div className="flex items-center h-full gap-0 md:gap-1">
              <button 
                onClick={toggleSidebar}
                className="bg-white border border-slate-200 text-slate-700 h-10 w-10 md:h-11 md:w-11 rounded-xl shadow-sm flex items-center justify-center active:scale-95 transition-all hover:border-primary/30 z-10"
              >
                <Menu className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              <Logo
                variant="light"
                className="shrink-0 -ml-5 md:-ml-7"
                imgClassName="h-24 md:h-32"
              />
            </div>
            
            <div className="flex items-center gap-4 md:gap-8">
               <Button asChild variant="outline" className="hidden sm:flex h-11 px-6 rounded-full border-slate-200 font-bold text-xs tracking-tight gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                  <Link href="/">View Site</Link>
               </Button>
               <div className="flex items-center gap-4 md:gap-6 pl-4 md:pl-6 border-l border-slate-100 h-10 md:h-14">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-lg md:text-xl shadow-lg">
                    {profile?.name?.[0] || 'A'}
                  </div>
               </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 lg:p-12 w-full max-w-full overflow-x-hidden">
           <div className="max-w-full mx-auto w-full">
              {children}
           </div>
        </main>
      </div>
    </div>
  );
}
