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
  LayoutGrid,
  Wand2
} from "lucide-react"
import Link from "next/link"
import Logo from "@/components/brand/Logo"
import { useUser, useAuth } from "@/firebase"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { signOut } from "firebase/auth"
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Admin Layout v156.0.
 * UPDATED: Logo background added ONLY to admin header as per request.
 * UPDATED: Logo sizes decreased for a cleaner look.
 */

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useUser()
  const auth = useAuth()
  const router = useRouter()
  const pathname = usePathname()
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
       <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Authenticating Registry...</p>
    </div>
  )
  
  if (!user || !isAdmin) return null

  const SideNavContent = () => (
    <div className="flex flex-col h-full bg-[#0F172A] pointer-events-auto select-none">
       <div className="p-8 flex justify-center">
          {/* SIDEBAR LOGO: DECREASED SIZE (h-14) NO BACKGROUND */}
          <div className="h-14 flex items-center justify-center transition-all duration-500">
            <Logo href="/admin" />
          </div>
       </div>

       <div className="flex-1 custom-scrollbar overflow-y-auto overflow-x-hidden pb-10">
          <SidebarGroup>
            <SidebarGroupLabel className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-white/20 text-left">Main Database</SidebarGroupLabel>
            <SidebarMenu className="gap-3">
              <AdminNavItem icon={<LayoutDashboard />} label="DASHBOARD" href="/admin" active={pathname === "/admin"} />
              <AdminNavItem icon={<Layers />} label="CATEGORIES" href="/admin/categories" active={pathname === "/admin/categories"} />
              <AdminNavItem icon={<Landmark className="text-amber-400" />} label="HUBS (BOARDS)" href="/admin/exams" active={pathname === "/admin/exams"} />
              <AdminNavItem icon={<GraduationCap className="text-emerald-400" />} label="EXAM LIST" href="/admin/exam-registry" active={pathname === "/admin/exam-registry"} />
              <AdminNavItem icon={<SearchCode className="text-emerald-400" />} label="SUBJECT LIST" href="/admin/subjects" active={pathname === "/admin/subjects"} />
              <AdminNavItem icon={<Box />} label="QUESTION BANK" href="/admin/questions" active={pathname === "/admin/questions"} />
              <AdminNavItem icon={<Rocket className="text-primary" />} label="BULK UPLOAD" href="/admin/bulk-import" active={pathname === "/admin/bulk-import"} />
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup className="mt-8">
            <SidebarGroupLabel className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-white/20 text-left">Content Hub</SidebarGroupLabel>
            <SidebarMenu className="gap-3">
              <AdminNavItem icon={<Wand2 className="text-emerald-400" />} label="BRAND MAGIC" href="/admin/brand-magic" active={pathname === "/brand-magic"} />
              <AdminNavItem icon={<LayoutGrid className="text-orange-500" />} label="MOCK BUILDER" href="/admin/mocks/builder" active={pathname === "/admin/mocks/builder"} />
              <AdminNavItem icon={<Zap className="text-primary" />} label="MOCK MANAGER" href="/admin/mocks" active={pathname === "/admin/mocks"} />
              <AdminNavItem icon={<Newspaper className="text-blue-400" />} label="CURRENT AFFAIRS" href="/admin/current-affairs" active={pathname === "/admin/current-affairs"} />
              <AdminNavItem icon={<FileText className="text-emerald-400" />} label="STUDY NOTES" href="/admin/notes" active={pathname === "/admin/notes"} />
              <AdminNavItem icon={<FileStack className="text-amber-400" />} label="PYQ ARCHIVE" href="/admin/pyqs" active={pathname === "/admin/pyqs"} />
              <AdminNavItem icon={<Sparkles className="text-primary" />} label="FREE HUB CMS" href="/admin/free-content" active={pathname === "/admin/free-content"} />
              <AdminNavItem icon={<Bell className="text-orange-400" />} label="EXAM NEWS" href="/admin/notifications" active={pathname === "/admin/notifications"} />
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup className="mt-8">
            <SidebarGroupLabel className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-white/20 text-left">Users & Revenue</SidebarGroupLabel>
            <SidebarMenu className="gap-3">
              <AdminNavItem icon={<Users className="text-blue-400" />} label="STUDENT LIST" href="/admin/users" active={pathname === "/admin/users"} />
              <AdminNavItem icon={<DollarSign className="text-emerald-400" />} label="REVENUE HUB" href="/admin/payments" active={pathname === "/admin"} />
              <AdminNavItem icon={<ShieldCheck className="text-primary" />} label="MANUAL VERIFY" href="/admin/payments/verify" active={pathname === "/admin/payments/verify"} />
              <AdminNavItem icon={<Gem className="text-amber-400" />} label="PASS MANAGER" href="/admin/passes" active={pathname === "/admin/passes"} />
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup className="mt-8">
            <SidebarGroupLabel className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-white/20 text-left">System Health</SidebarGroupLabel>
            <SidebarMenu className="gap-3">
              <AdminNavItem icon={<History className="text-slate-400" />} label="ACTIVITY LOGS" href="/admin/audit-logs" active={pathname === "/admin/audit-logs"} />
              <AdminNavItem icon={<ShieldAlert className="text-rose-500" />} label="ERROR CHECK" href="/admin/qa" active={pathname === "/admin/qa"} />
              <AdminNavItem icon={<HeartPulse className="text-rose-500" />} label="PLATFORM STATUS" href="/admin/health" active={pathname === "/admin/health"} />
              <AdminNavItem icon={<Settings className="text-primary" />} label="SYSTEM SETTINGS" href="/admin/settings" active={pathname === "/admin/settings"} />
            </SidebarMenu>
          </SidebarGroup>
       </div>

       <div className="p-6 border-t border-white/5 bg-black/20 shrink-0">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <User className="h-5 w-5" />
             </div>
             <div className="text-left">
                <p className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-1.5">ADMIN LOGIN</p>
                <p className="text-[11px] font-black text-white uppercase tracking-tight truncate max-w-[120px]">{profile?.name || (isFounder ? 'FOUNDER' : 'ADMIN')}</p>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-white font-body overflow-x-hidden pointer-events-auto">
        <Sidebar className="border-r border-white/5 bg-[#0F172A] z-[50]">
           <SideNavContent />
        </Sidebar>
        
        <SidebarInset className="flex flex-col bg-white min-w-0 max-w-full relative">
          <header className="h-20 border-b border-slate-100 flex items-center px-4 md:px-8 justify-between bg-white sticky top-0 z-[100] shrink-0 overflow-hidden">
            <div className="flex items-center gap-4 overflow-hidden">
              <SidebarTrigger className="text-[#0F172A] hover:bg-slate-50 cursor-pointer" />
              
              <div className="flex items-center gap-4">
                 {/* HEADER LOGO: DECREASED SIZE (h-10) WITH NAVY BACKGROUND BOX */}
                 <div className="bg-[#0B1528] rounded-xl px-4 h-10 flex items-center justify-center overflow-hidden shadow-sm">
                    <Logo variant="dark" href="/admin" />
                 </div>
                 
                 <div className="h-10 w-[1.5px] bg-slate-200 mx-1 md:block" />
                 
                 <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] text-[#0F172A] truncate">Admin Hub</span>
                 </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-6">
               <Button asChild variant="outline" className="h-12 px-6 rounded-xl border-slate-200 font-black uppercase text-[10px] tracking-widest gap-2 hover:bg-slate-50 shadow-sm transition-all active:scale-95">
                  <Link href="/">
                     <ArrowLeftRight className="h-4 w-4 text-primary" /> View Home
                  </Link>
               </Button>
               <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-300 hover:text-rose-500 rounded-xl cursor-pointer">
                  <LogOut className="h-5 w-5" />
               </Button>
            </div>
          </header>

          <main className="flex-1 p-6 md:p-12 bg-white overflow-y-auto overflow-x-hidden min-w-0 pointer-events-auto">
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
        className={cn(
          "px-6 transition-all font-medium h-12 group cursor-pointer",
          active ? "bg-white/5 text-primary" : "hover:bg-white/5 hover:text-primary text-white/60",
          className
        )}
      >
        <Link href={href} className="flex items-center gap-5 w-full text-left pointer-events-auto">
          <div className="shrink-0 flex items-center justify-center size-5">
            {icon}
          </div>
          <span className="font-bold tracking-tight truncate text-left text-[13px] uppercase">{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
