'use client';

import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { 
  LayoutDashboard, 
  LogOut, 
  ShieldCheck, 
  User, 
  FileStack,
  Newspaper, 
  SearchCode,
  Landmark,
  GraduationCap,
  Rocket,
  ArrowLeftRight,
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
  LayoutGrid,
  Wand2,
  HeartPulse,
  Settings,
  Box
} from "lucide-react"
import Link from "next/link"
import Logo from "@/components/brand/Logo"
import { useUser, useAuth } from "@/firebase"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { signOut } from "firebase/auth"
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"

/**
 * @fileOverview Hardened Mobile-First Admin Layout v193.0.
 * UPDATED: Increased Logo size to h-36 and moved section labels down while tightening item gaps.
 */

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useUser()
  const authInstance = useAuth()
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
    await signOut(authInstance)
    router.push('/login')
  }

  if (!mounted || loading) return (
    <div className="h-screen w-full bg-[#0F172A] flex flex-col items-center justify-center space-y-6">
       <ShieldCheck className="h-12 w-12 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Securing Registry Center...</p>
    </div>
  )
  
  if (!user || !isAdmin) return null

  const SideNavContent = () => (
    <div className="flex flex-col h-full bg-[#0F172A] pointer-events-auto select-none overflow-y-auto no-scrollbar">
       <div className="flex-1">
          
          <div className="px-6 py-4 flex justify-start shrink-0 overflow-visible mb-2">
             <Logo href="/admin" imgClassName="h-36 origin-left" />
          </div>

          <SidebarGroup className="p-0 m-0 border-none">
            <SidebarGroupLabel className="px-6 py-0 h-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 text-left mt-0 mb-1">MANAGEMENT CENTER</SidebarGroupLabel>
            <SidebarMenu className="gap-0 mt-0 p-0">
              <AdminNavItem icon={<LayoutDashboard />} label="DASHBOARD" href="/admin" active={pathname === "/admin"} />
              <AdminNavItem icon={<Layers />} label="CATEGORIES" href="/admin/categories" active={pathname === "/admin/categories"} />
              <AdminNavItem icon={<Landmark />} label="BOARDS CENTER" href="/admin/exams" active={pathname === "/admin/exams"} />
              <AdminNavItem icon={<GraduationCap />} label="EXAM REGISTRY" href="/admin/exam-registry" active={pathname === "/admin/exam-registry"} />
              <AdminNavItem icon={<SearchCode />} label="SUBJECT REGISTRY" href="/admin/subjects" active={pathname === "/admin/subjects"} />
              <AdminNavItem icon={<Box />} label="MCQ BANK" href="/admin/questions" active={pathname === "/admin/questions"} />
              <AdminNavItem icon={<Rocket className="text-primary" />} label="BULK INGEST" href="/admin/bulk-import" active={pathname === "/admin/bulk-import"} />
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup className="p-0 m-0 border-none mt-6">
            <SidebarGroupLabel className="px-6 py-0 h-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 text-left mt-0 mb-1">CONTENT PULSE</SidebarGroupLabel>
            <SidebarMenu className="gap-0 mt-0 p-0">
              <AdminNavItem icon={<Wand2 />} label="BRAND MAGIC" href="/admin/brand-magic" active={pathname === "/admin/brand-magic"} />
              <AdminNavItem icon={<LayoutGrid />} label="MOCK BUILDER" href="/admin/mocks/builder" active={pathname === "/admin/mocks/builder"} />
              <AdminNavItem icon={<Zap />} label="MOCK MANAGER" href="/admin/mocks" active={pathname === "/admin/mocks"} />
              <AdminNavItem icon={<Newspaper />} label="CURR. AFFAIRS" href="/admin/current-affairs" active={pathname === "/admin/current-affairs"} />
              <AdminNavItem icon={<FileText />} label="STUDY NOTES" href="/admin/notes" active={pathname === "/admin/notes"} />
              <AdminNavItem icon={<FileStack />} label="PYQ ARCHIVE" href="/admin/pyqs" active={pathname === "/admin/pyqs"} />
              <AdminNavItem icon={<Sparkles />} label="FREE CENTER CMS" href="/admin/free-content" active={pathname === "/admin/free-content"} />
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup className="p-0 m-0 border-none mt-6">
            <SidebarGroupLabel className="px-6 py-0 h-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 text-left mt-0 mb-1">GOVERNANCE</SidebarGroupLabel>
            <SidebarMenu className="gap-0 mt-0 p-0">
              <AdminNavItem icon={<Users />} label="STUDENT LIST" href="/admin/users" active={pathname === "/admin/users"} />
              <AdminNavItem icon={<DollarSign />} label="REVENUE CENTER" href="/admin/payments" active={pathname === "/admin/payments"} />
              <AdminNavItem icon={<ShieldCheck />} label="VERIFY UPI" href="/admin/payments/verify" active={pathname === "/admin/payments/verify"} />
              <AdminNavItem icon={<Gem />} label="PASS MANAGER" href="/admin/passes" active={pathname === "/admin/passes"} />
              <AdminNavItem icon={<History />} label="AUDIT LOGS" href="/admin/audit-logs" active={pathname === "/admin/audit-logs"} />
              <AdminNavItem icon={<HeartPulse />} label="SYSTEM HEALTH" href="/admin/health" active={pathname === "/admin/health"} />
              <AdminNavItem icon={<Settings />} label="SETTINGS" href="/admin/settings" active={pathname === "/admin/settings"} />
            </SidebarMenu>
          </SidebarGroup>
       </div>

       <div className="p-4 border-t border-white/5 bg-black/20 shrink-0 mb-safe">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <User className="h-4 w-4" />
             </div>
             <div className="text-left min-w-0">
                <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">ADMIN MODE</p>
                <p className="text-[11px] font-black text-white uppercase tracking-tight truncate">{profile?.name || 'ADMIN'}</p>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-white font-body overflow-x-hidden pointer-events-auto text-left">
        <Sidebar className="border-r border-white/5 bg-[#0F172A] z-[50]">
           <SideNavContent />
        </Sidebar>
        
        <SidebarInset className="flex flex-col bg-white min-w-0 max-w-full relative">
          <header className="h-[60px] md:h-20 border-b border-slate-100 flex items-center px-4 md:px-8 justify-between bg-white sticky top-0 z-40 shrink-0 shadow-sm pt-safe">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-[#0F172A] hover:bg-slate-50 cursor-pointer h-10 w-10 rounded-xl" />
              <div className="h-6 w-px bg-slate-100 mx-2 hidden sm:block" />
              <div className="flex flex-col text-left">
                 <span className="text-[10px] md:text-[11px] font-black uppercase text-primary tracking-widest leading-none">ADMIN CENTER</span>
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 hidden xs:block">REGISTRY AUDIT ACTIVE</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
               <Button asChild variant="outline" className="h-10 px-4 md:px-6 rounded-xl border-slate-200 font-black uppercase text-[10px] tracking-widest gap-2 hover:bg-slate-50 shadow-sm transition-all active:scale-95">
                  <Link href="/">
                     <ArrowLeftRight className="h-4 w-4 text-primary" /> <span className="hidden sm:inline">VIEW SITE</span>
                  </Link>
               </Button>
               <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-300 hover:text-rose-500 rounded-xl h-10 w-10">
                  <LogOut className="h-5 w-5" />
               </Button>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-12 bg-white overflow-y-auto overflow-x-hidden min-w-0 pointer-events-auto">
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
    <SidebarMenuItem className="p-0 m-0 list-none">
      <SidebarMenuButton 
        asChild 
        isActive={active}
        className={cn(
          "px-6 transition-all font-medium h-9 group cursor-pointer rounded-none",
          active ? "bg-white/5 text-primary" : "hover:bg-white/5 hover:text-primary text-slate-400",
          className
        )}
      >
        <Link href={href} className="flex items-center gap-4 w-full text-left">
          <div className="shrink-0 flex items-center justify-center size-4">
            {icon}
          </div>
          <span className="font-bold tracking-tight truncate text-left text-[11px] uppercase">{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
