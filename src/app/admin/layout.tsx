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
 * @fileOverview Admin Layout v34.0.
 * UPDATED: Zero spacing between menu toggle and logo.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, profileLoading } = useUser();
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

  useEffect(() => {
    if (mounted && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [pathname, mounted]);

  const userEmail = user?.email?.toLowerCase();
  const isFounder = userEmail && SUPER_ADMIN_WHITELIST.includes(userEmail);
  const isAdmin = (profile && (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN')) || isFounder;

  const isAccessBlocked = !loading && mounted && (!user || (!isAdmin && !profileLoading));

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
    localStorage.setItem('admin-sidebar-state', newState ? 'expanded' : 'collapsed');
  };

  const handleLogout = async () => {
    await signOut(authInstance);
    router.push('/login');
  };

  const isGlobalLoading = !mounted || loading || (user && !profile && profileLoading);

  if (isGlobalLoading) return (
    <div className="h-screen w-full bg-[#0F172A] flex flex-col items-center justify-center space-y-6">
       <ShieldCheck className="h-10 w-10 text-blue-600 animate-pulse" />
       <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Securing Admin Panel...</p>
    </div>
  );
  
  if (!user || !isAdmin) return null;

  return (
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
        <header className="h-[80px] md:h-[110px] border-b border-slate-50 bg-white/80 backdrop-blur-xl sticky top-0 z-30 flex items-center px-4 md:px-8 justify-between shrink-0">
          <div className="flex items-center gap-0">
            <button 
              onClick={toggleSidebar}
              className="lg:hidden bg-white border border-slate-200 h-10 w-10 rounded-xl flex items-center justify-center shrink-0 active:scale-95 mr-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="lg:hidden shrink-0">
              <Logo variant="light" className="h-12 md:h-14 w-auto -ml-2" />
            </div>
            <p className="hidden md:block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
               Registry Governance
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <Button asChild variant="outline" className="hidden sm:flex h-10 rounded-full text-[10px] font-black uppercase tracking-widest">
                <Link href="/">View Site</Link>
             </Button>
             <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black">
                {profile?.name?.[0] || 'A'}
             </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-10 lg:p-12">
          {children}
        </main>
      </div>
    </div>
  );
}
