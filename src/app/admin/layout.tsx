'use client';

import React, { useEffect, useState, useMemo } from "react";
import { useUser, useAuth } from "@/firebase";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Menu, ShieldCheck, Loader2, ExternalLink, AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/brand/Logo";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { canAccessAdmin, checkPermission } from "@/lib/permissions";

/**
 * @fileOverview Administrative Control Boundary v76.1.
 * UPDATED: Restored Student View button for all screen sizes.
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

  const isAccessBlocked = mounted && !loading && !profileLoading && !canAccessAdmin(profile, user?.email);
  
  const hasSpecificPermission = useMemo(() => {
     if (user?.email && canAccessAdmin(profile, user.email)) return true;
     if (!profile) return false;
     if (profile.role === 'SUPER_ADMIN') return true;

     // Specific Route Governance
     if (pathname.includes('/payments') || pathname.includes('/revenue')) return checkPermission(profile, 'managePayments', user?.email) || checkPermission(profile, 'viewRevenue', user?.email);
     if (pathname.includes('/roles') || pathname.includes('/users')) return checkPermission(profile, 'manageRoles', user?.email) || checkPermission(profile, 'manageUsers', user?.email);
     if (pathname.includes('/mcq-bank/add') || pathname.includes('/questions/add')) return checkPermission(profile, 'uploadQuestions', user?.email);
     if (pathname.includes('/mocks/builder')) return checkPermission(profile, 'createMock', user?.email);
     if (pathname.includes('/settings')) return checkPermission(profile, 'websiteSettings', user?.email);
     
     return true; 
  }, [profile, user, pathname]);

  useEffect(() => {
    if (isAccessBlocked) {
      if (!user) {
        router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
      } else {
        router.replace('/dashboard');
      }
    } else if (mounted && !profileLoading && !hasSpecificPermission) {
       router.replace('/admin'); 
    }
  }, [isAccessBlocked, hasSpecificPermission, user, profileLoading, router, pathname, mounted]);

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
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Auditing Identity...</p>
       </div>
    </div>
  );
  
  if (!user || isAccessBlocked) return null;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-screen w-full bg-white font-body flex overflow-hidden">
        
        <AdminSidebar 
          isOpen={isSidebarOpen} 
          onToggle={toggleSidebar} 
          onCloseMobile={() => setIsSidebarOpen(false)}
          profile={profile || { name: user.displayName, email: user.email, role: 'SUPER_ADMIN' }}
          handleLogout={handleLogout}
          pathname={pathname}
        />

        <div className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out w-full",
          isSidebarOpen ? "lg:pl-[280px]" : "lg:pl-[88px]"
        )}>
          <header className="h-24 md:h-32 border-b border-slate-50 bg-white/80 backdrop-blur-xl sticky top-0 z-30 flex items-center px-4 md:px-8 justify-between shrink-0">
            <div className="flex items-center shrink-0 h-full">
              <button 
                onClick={toggleSidebar}
                className="bg-white border border-slate-200 h-10 w-10 md:h-12 md:w-12 rounded-lg flex items-center justify-center shrink-0 active:scale-95 shadow-sm hover:border-primary/30 cursor-pointer"
              >
                <Menu className="w-6 h-6 md:w-7 md:h-7" />
              </button>
              <Logo 
                variant="light" 
                href="/admin"
                className="flex-shrink-0 p-0 h-full" 
                imgClassName="h-20 md:h-28 w-auto"
                align="left"
              />
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
               {profile?.status === 'SUSPENDED' && (
                  <Badge className="bg-rose-500 text-white animate-pulse gap-2 px-4 py-2 border-none">
                     <AlertCircle className="h-4 w-4" /> Account Suspended
                  </Badge>
               )}
               <Button asChild variant="outline" className="flex h-10 md:h-11 rounded-full text-[9px] md:text-[11px] font-bold tracking-tight px-4 md:px-6 gap-2">
                  <Link href="/">Student Portal <ExternalLink className="h-3 w-3 md:h-3.5 md:w-3.5 opacity-40" /></Link>
               </Button>
               <div className="h-9 w-9 md:h-12 md:w-12 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shrink-0">
                  {(profile?.name || user.displayName || 'A')[0]}
               </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-10 lg:p-12 overflow-x-hidden">
            {!hasSpecificPermission ? (
               <div className="h-full flex flex-col items-center justify-center space-y-6 text-center">
                  <div className="h-20 w-20 bg-amber-50 rounded-[2.5rem] flex items-center justify-center text-amber-500 shadow-inner">
                     <Lock className="h-10 w-10" />
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Permission Required</h2>
                  <p className="text-slate-500 max-w-xs">You do not have authorization to access this specific hub.</p>
                  <Button asChild className="rounded-full px-10"><Link href="/admin">Return to Dashboard</Link></Button>
               </div>
            ) : children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
