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

/**
 * @fileOverview Maximized Admin Hub Layout v39.0.
 * REALIGNED: Synchronized header height to 150px.
 */

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useUser();
  const authInstance = useAuth();
  const router = useRouter();
  const pathname = usePathname();
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

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem('admin-sidebar-state', newState ? 'expanded' : 'collapsed');
  };

  const userEmail = user?.email?.toLowerCase();
  const isFounder = userEmail && SUPER_ADMIN_WHITELIST.includes(userEmail);
  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || isFounder;

  useEffect(() => {
    if (!loading && mounted) {
      if (!user) {
        router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
      } else if (!isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [user, profile, loading, router, isAdmin, mounted, pathname]);

  const handleLogout = async () => {
    await signOut(authInstance);
    router.push('/login');
  };

  if (!mounted || loading) return (
    <div className="h-screen w-full bg-[#0F172A] flex flex-col items-center justify-center space-y-6">
       <ShieldCheck className="h-12 w-12 text-blue-600 animate-pulse" />
       <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Securing Registry Center...</p>
    </div>
  );
  
  if (!user || !isAdmin) return null;

  const sidebarWidth = isSidebarOpen ? 280 : 88;

  return (
    <div className="min-h-screen w-full bg-white font-body overflow-x-hidden relative flex">
      
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar} 
        onCloseMobile={() => setIsSidebarOpen(false)}
        profile={profile}
        handleLogout={handleLogout}
        pathname={pathname}
      />

      <div 
        className="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out"
        style={{ 
          marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024 ? sidebarWidth : 0 
        }}
      >
        <header className="h-[150px] border-b border-slate-100 flex items-center px-4 md:px-8 justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden bg-white border border-slate-200 text-slate-700 h-12 w-12 rounded-xl shadow-sm flex items-center justify-center active:scale-95 transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Logo
              variant="light"
              className="shrink-0"
            />
          </div>
          
          <div className="flex items-center gap-6">
             <Button asChild variant="outline" className="h-12 px-8 rounded-xl border-slate-200 font-bold text-sm tracking-tight gap-2 hover:bg-slate-50 transition-all active:scale-95">
                <Link href="/">View Site</Link>
             </Button>
             <div className="flex items-center gap-4 pl-4 border-l border-slate-100">
                <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                  {profile?.name?.[0] || 'A'}
                </div>
             </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-10 max-w-full">
           {children}
        </main>
      </div>
    </div>
  );
}
