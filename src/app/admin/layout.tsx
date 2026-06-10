
'use client';

import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { 
  LayoutDashboard, 
  LogOut, 
  ShieldCheck, 
  Menu, 
  HeartPulse, 
  Settings, 
  User, 
  FileStack,
  Newspaper,
  Megaphone,
  SearchCode,
  Landmark,
  GraduationCap,
  Rocket,
  ArrowLeftRight,
  Box,
  Layers,
  Zap,
  FileText,
  Sparkles,
  Bell,
  Users,
  DollarSign,
  Gem,
  History,
  ShieldAlert,
  ClipboardCheck,
  LayoutGrid
} from "lucide-react"
import Link from "next/link"
import Logo from "@/components/brand/Logo"
import { useUser, useAuth } from "@/firebase"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { signOut } from "firebase/auth"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/navigation/BackButton";

/**
 * @fileOverview Institutional Sidebar Restoration v126.0.
 * UPDATED: Removed ARCHITECTURE node as requested.
 */

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useUser()
  const auth = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
  }, [user, profile, loading, router, isAdmin, mounted, pathname])

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  if (!mounted || loading) return (
    <div className="h-screen w-full bg-[#0F172A] flex flex-col items-center justify-center space-y-6">
       <ShieldCheck className="h-12 w-12 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Initializing Registry...</p>
    </div>
  )
  
  if (!user || !isAdmin) return null

  const SideNavContent = () => (
    <div className="flex flex-col h-full bg-[#0F172A] pointer-events-auto">
       <div className="p-6">
          <Logo variant="light" className="origin-left" />
       </div>
       <div className="flex-1 custom-scrollbar overflow-y-auto overflow-x-hidden pb-10">
          <SidebarGroup>
            <SidebarGroupLabel className="px-6 text-[10px] font-black uppercase tracking-widest text-white/20 text-left">Master Registry</SidebarGroupLabel>
            <SidebarMenu>
              <AdminNavItem icon={<LayoutDashboard />} label="DASHBOARD" href="/admin" active={pathname === "/admin"} />
              <AdminNavItem icon={<Layers />} label="CATEGORIES" href="/admin/categories" active={pathname === "/admin/categories"} />
              <AdminNavItem icon={<Landmark className="text-amber-400" />} label="HUBS (BOARDS)" href="/admin/exams" active={pathname === "/admin/exams"} />
              <AdminNavItem icon={<GraduationCap className="text-emerald-400" />} label="EXAM REGISTRY" href="/admin/exam-registry" active={pathname === "/admin/exam-registry"} />
              <AdminNavItem icon={<SearchCode className="text-emerald-400" />} label="SUBJECT LIST" href="/admin/subjects" active={pathname === "/admin/subjects"} />
              <AdminNavItem icon={<Box />} label="GLOBAL BANK" href="/admin/questions" active={pathname === "/admin/questions"} />
              <AdminNavItem icon={<Rocket className="text-primary" />} label="BULK INGESTION" href="/admin/bulk-import" active={pathname === "/admin/bulk-import"} />
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="px-6 text-[10px] font-black uppercase tracking-widest text-white/20 text-left">Content Management</SidebarGroupLabel>
            <SidebarMenu>
              <AdminNavItem icon={<LayoutGrid className="text-orange-500" />} label="MOCK ARCHITECT" href="/admin/mocks/builder" active={pathname === "/admin/mocks/builder"} />
              <AdminNavItem icon={<Zap className="text-primary" />} label="MOCK MANAGER" href="/admin/mocks" active={pathname === "/admin/mocks"} />
              <AdminNavItem icon={<Newspaper className="text-blue-400" />} label="CURRENT AFFAIRS" href="/admin/current-affairs" active={pathname === "/admin/current-affairs"} />
              <AdminNavItem icon={<FileText className="text-emerald-400" />} label="NOTES LIBRARY" href="/admin/notes" active={pathname === "/admin/notes"} />
              <AdminNavItem icon={<FileStack className="text-amber-400" />} label="PYQ REPOSITORY" href="/admin/pyqs" active={pathname === "/admin/pyqs"} />
              <AdminNavItem icon={<Sparkles className="text-primary" />} label="FREE HUB CMS" href="/admin/free-content" active={pathname === "/admin/free-content"} />
              <AdminNavItem icon={<Bell className="text-orange-400" />} label="EXAM GAZETTE" href="/admin/notifications" active={pathname === "/admin/notifications"} />
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="px-6 text-[10px] font-black uppercase tracking-widest text-white/20 text-left">Users & Revenue</SidebarGroupLabel>
            <SidebarMenu>
              <AdminNavItem icon={<Users className="text-blue-400" />} label="STUDENT HUB" href="/admin/users" active={pathname === "/admin/users"} />
              <AdminNavItem icon={<DollarSign className="text-emerald-400" />} label="REVENUE HUB" href="/admin/payments" active={pathname === "/admin/payments"} />
              <AdminNavItem icon={<ShieldCheck className="text-primary" />} label="MANUAL VERIFY" href="/admin/payments/verify" active={pathname === "/admin/payments/verify"} />
              <AdminNavItem icon={<Gem className="text-amber-400" />} label="PASS MANAGER" href="/admin/passes" active={pathname === "/admin/passes"} />
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="px-6 text-[10px] font-black uppercase tracking-widest text-white/20 text-left">Integrity & Governance</SidebarGroupLabel>
            <SidebarMenu>
              <AdminNavItem icon={<History className="text-slate-400" />} label="AUDIT TRAIL" href="/admin/audit-logs" active={pathname === "/admin/audit-logs"} />
              <AdminNavItem icon={<ShieldAlert className="text-rose-500" />} label="CBT INTEGRITY" href="/admin/qa" active={pathname === "/admin/qa"} />
              <AdminNavItem icon={<HeartPulse className="text-rose-500" />} label="SYSTEM HEALTH" href="/admin/health" active={pathname === "/admin/health"} />
              <AdminNavItem icon={<Settings className="text-primary" />} label="SYSTEM PORTAL" href="/admin/settings" active={pathname === "/admin/settings"} />
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup className="mt-auto pb-6">
            <SidebarMenu>
               <AdminNavItem 
                  icon={<ArrowLeftRight className="text-primary" />} 
                  label="Exit to Dashboard" 
                  href="/dashboard" 
                  className="bg-primary/10 border-l-4 border-primary"
               />
            </SidebarMenu>
          </SidebarGroup>
       </div>

       <div className="p-6 border-t border-white/5 bg-black/20 shrink-0">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <User className="h-4 w-4" />
             </div>
             <div className="text-left">
                <p className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-1 md:mb-1.5">ADMIN LOGIN</p>
                <p className="text-[11px] font-black text-white uppercase tracking-tight truncate max-w-[120px]">{profile?.name || (isFounder ? 'FOUNDER' : 'ADMIN')}</p>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-white font-body overflow-x-hidden pointer-events-auto">
        <Sidebar className="hidden lg:flex border-r border-white/5 bg-[#0F172A] z-[50]">
           <SideNavContent />
        </Sidebar>
        
        <SidebarInset className="flex flex-col bg-white min-w-0 max-w-full relative">
          <header className="h-14 md:h-16 border-b border-slate-200 flex items-center px-4 md:px-6 justify-between bg-white sticky top-0 z-[100] shrink-0">
            <div className="flex items-center gap-1 md:gap-3 overflow-hidden">
              <div className="lg:hidden">
                 <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                       <button className="p-2 rounded-xl bg-slate-50 text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer"><Menu className="h-5 w-5" /></button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 border-none w-[280px] bg-[#0F172A] z-[1001]">
                       <SheetHeader className="sr-only">
                          <SheetTitle>Admin Menu</SheetTitle>
                       </SheetHeader>
                       <SideNavContent />
                    </SheetContent>
                 </Sheet>
              </div>
              <SidebarTrigger className="hidden lg:flex text-[#0F172A] hover:bg-slate-50 cursor-pointer" />
              
              <div className="h-4 w-[1px] bg-slate-200 mx-2 hidden md:block" />
              <BackButton label="Dashboard" fallback="/admin" className="hidden xs:flex" />

              <div className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:block" />
              <div className="flex items-center gap-2 truncate">
                 <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                 <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#0F172A] truncate">Admin Active</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
               <Button asChild variant="outline" className="hidden sm:flex h-10 px-4 rounded-xl border-slate-200 font-black uppercase text-[9px] tracking-widest gap-2 hover:bg-slate-50 shadow-sm transition-all active:scale-95">
                  <Link href="/dashboard">
                     <ArrowLeftRight className="h-3.5 w-3.5 text-primary" /> Student Side
                  </Link>
               </Button>
               <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-rose-500 rounded-xl cursor-pointer">
                  <LogOut className="h-5 w-5" />
               </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8 bg-white overflow-y-auto overflow-x-hidden min-w-0 pointer-events-auto">
            <div className="max-w-full">
               {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

function AdminNavItem({ icon, label, href, active, className }: { icon: React.ReactNode, label: string, href: string, active?: boolean, className?: string }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton 
        asChild 
        isActive={active}
        className={`px-6 transition-all font-medium h-12 group cursor-pointer ${active ? 'bg-white/5 text-primary' : 'hover:bg-white/5 hover:text-primary text-white/60'} ${className}`}
      >
        <Link href={href} className="flex items-center gap-4 w-full text-left pointer-events-auto">
          <div className="shrink-0 flex items-center justify-center size-5">
            {icon}
          </div>
          <span className="font-bold tracking-tight truncate text-left text-[13px] uppercase">{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
