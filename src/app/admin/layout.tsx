'use client';

import React, { useEffect, useState } from "react";
import { useUser, useAuth } from "@/firebase";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Menu, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * @fileOverview Hardened Admin Hub Layout v12.0.
 * UPDATED: Header height synchronized to 72px (Mobile) and 88px (Desktop).
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

  // Synchronization Widths
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
        <header className="h-[72px] lg:h-[88px] border-b border-slate-100 flex items-center px-4 md:px-10 justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden bg-white border border-slate-200 text-slate-700 h-12 w-12 rounded-2xl shadow-sm flex items-center justify-center active:scale-95 transition-all"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex flex-col text-left">
               <span className="text-[11px] font-black uppercase text-blue-600 tracking-[0.2em] leading-none">ADMIN HUB</span>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 hidden xs:block">REGISTRY AUDIT ACTIVE</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <Button asChild variant="outline" className="h-12 px-7 rounded-2xl border-slate-200 font-black uppercase text-[10px] tracking-widest gap-2 hover:bg-slate-50 transition-all active:scale-95">
                <Link href="/">VIEW SITE</Link>
             </Button>
             <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                <div className="text-right hidden sm:block">
                   <p className="text-[10px] font-black text-slate-900 leading-none">{profile?.name || 'ADMIN'}</p>
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">SUPER_ADMIN</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-lg">
                  {profile?.name?.[0] || 'A'}
                </div>
             </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-12 max-w-full">
           {children}
        </main>
      </div>
    </div>
  );
}
