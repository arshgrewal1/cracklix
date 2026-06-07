
'use client';

import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { 
  LayoutDashboard, 
  Database, 
  LogOut, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Menu, 
  HeartPulse, 
  Settings, 
  Users, 
  CreditCard, 
  ShieldAlert, 
  History, 
  User, 
  Loader2,
  FileText,
  FileStack,
  Newspaper,
  Megaphone,
  Layers,
  Sparkles,
  SearchCode,
  Bell,
  Gem,
  Plus
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
 * @fileOverview Administrative Security Hub v9.0.
 * HARDENED: Robust component imports for Button and Layout Nodes.
 */

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useUser()
  const auth = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isFounder = user?.email === 'arshdeepgrewal1122@gmail.com';
  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || isFounder;

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login?returnUrl=/admin');
      } else if (!isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [user, profile, loading, router, isAdmin])

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  if (loading) return (
    <div className="h-screen w-full bg-[#0F172A] flex flex-col items-center justify-center space-y-6">
       <ShieldCheck className="h-12 w-12 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Checking Access...</p>
    </div>
  )
  
  if (!user || !isAdmin) return null

  const SideNavContent = () => (
    <div className="flex flex-col h-full bg-[#0F172A]">
       <div className="p-6">
          <Logo variant="light" className="origin-left" />
       </div>
       <div className="flex-1 custom-scrollbar overflow-y-auto overflow-x-hidden">
          <SidebarGroup>
            <SidebarGroupLabel className="px-6 text-[10px] font-black uppercase tracking-widest text-white/20 text-left">Core Control</SidebarGroupLabel>
            <SidebarMenu>
              <AdminNavItem icon={<LayoutDashboard />} label="Dashboard" href="/admin" active={pathname === "/admin"} />
              <AdminNavItem icon={<HeartPulse className="text-rose-400" />} label="System Health" href="/admin/health" active={pathname === "/admin/health"} />
              <AdminNavItem icon={<Globe className="text-blue-400" />} label="Authority Hub" href="/admin/exams" active={pathname === "/admin/exams"} />
              <AdminNavItem icon={<Layers className="text-amber-500" />} label="Exam List" href="/admin/exam-registry" active={pathname === "/admin/exam-registry"} />
              <AdminNavItem icon={<Database />} label="Question Bank" href="/admin/questions" active={pathname === "/admin/questions"} />
              <AdminNavItem icon={<SearchCode className="text-emerald-400" />} label="Subject List" href="/admin/subjects" active={pathname === "/admin/subjects"} />
              <AdminNavItem icon={<Plus className="text-emerald-400" />} label="Bulk Ingestion" href="/admin/bulk-import" active={pathname === "/admin/bulk-import"} />
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="px-6 text-[10px] font-black uppercase tracking-widest text-white/20 text-left">Content Sections</SidebarGroupLabel>
            <SidebarMenu>
              <AdminNavItem icon={<Zap className="text-primary" />} label="Mock Manager" href="/admin/mocks" active={pathname === "/admin/mocks"} />
              <AdminNavItem icon={<FileStack className="text-blue-500" />} label="PYQ Repository" href="/admin/pyqs" active={pathname === "/admin/pyqs"} />
              <AdminNavItem icon={<FileText className="text-rose-400" />} label="Study Notes" href="/admin/notes" active={pathname === "/admin/notes"} />
              <AdminNavItem icon={<Sparkles className="text-amber-400" />} label="Free Hub CMS" href="/admin/free-content" active={pathname === "/admin/free-content"} />
              <AdminNavItem icon={<Newspaper className="text-emerald-500" />} label="Analysis Feed" href="/admin/current-affairs" active={pathname === "/admin/current-affairs"} />
              <AdminNavItem icon={<Bell className="text-orange-500" />} label="Exam Gazette" href="/admin/notifications" active={pathname === "/admin/notifications"} />
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="px-6 text-[10px] font-black uppercase tracking-widest text-white/20 text-left">Financials</SidebarGroupLabel>
            <SidebarMenu>
              <AdminNavItem icon={<Gem className="text-primary" />} label="Pass Manager" href="/admin/passes" active={pathname === "/admin/passes"} />
              <AdminNavItem icon={<CreditCard className="text-emerald-400" />} label="All Payments" href="/admin/payments" active={pathname === "/admin/payments"} />
              <AdminNavItem icon={<ShieldCheck className="text-blue-400" />} label="Verify UPI" href="/admin/payments/verify" active={pathname === "/admin/payments/verify"} />
              <AdminNavItem icon={<Megaphone className="text-pink-400" />} label="Ad Manager" href="/admin/ads" active={pathname === "/admin/ads"} />
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="px-6 text-[10px] font-black uppercase tracking-widest text-white/20 text-left">Governance</SidebarGroupLabel>
            <SidebarMenu>
              <AdminNavItem icon={<Users className="text-blue-400" />} label="Student List" href="/admin/users" active={pathname === "/admin/users"} />
              <AdminNavItem icon={<ShieldAlert className="text-rose-500" />} label="Content Reports" href="/admin/reports" active={pathname === "/admin/reports"} />
              <AdminNavItem icon={<History className="text-slate-400" />} label="Audit Trail" href="/admin/audit-logs" active={pathname === "/admin/audit-logs"} />
              <AdminNavItem icon={<Settings className="text-primary" />} label="Settings" href="/admin/settings" active={pathname === "/admin/settings"} />
            </SidebarMenu>
          </SidebarGroup>
       </div>

       <div className="p-6 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <User className="h-4 w-4" />
             </div>
             <div className="text-left">
                <p className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-1">ADMIN LOGIN</p>
                <p className="text-[11px] font-black text-white uppercase tracking-tight">{profile?.name || 'ADMIN'}</p>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-white font-body overflow-x-hidden">
        <Sidebar className="hidden lg:flex border-r border-white/5 bg-[#0F172A]">
           <SideNavContent />
        </Sidebar>
        
        <SidebarInset className="flex flex-col bg-white">
          <header className="h-14 md:h-16 border-b border-slate-200 flex items-center px-4 md:px-6 justify-between bg-white sticky top-0 z-[100] shrink-0">
            <div className="flex items-center gap-1 md:gap-3">
              <div className="lg:hidden">
                 <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                       <button className="p-2 rounded-xl bg-slate-50 text-[#0F172A]"><Menu className="h-5 w-5" /></button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 border-none w-[280px] bg-[#0F172A]">
                       <SheetHeader className="sr-only">
                          <SheetTitle>Admin Menu</SheetTitle>
                       </SheetHeader>
                       <SideNavContent />
                    </SheetContent>
                 </Sheet>
              </div>
              <SidebarTrigger className="hidden lg:flex text-[#0F172A]" />
              
              <div className="h-4 w-[1px] bg-slate-200 mx-2 hidden md:block" />
              <BackButton label="Dashboard" fallback="/admin" />

              <div className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:block" />
              <div className="flex items-center gap-2 truncate">
                 <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                 <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#0F172A] truncate">Admin Active</span>
              </div>
            </div>
            
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-rose-500 rounded-xl">
               <LogOut className="h-5 w-5" />
            </Button>
          </header>
          <main className="flex-1 p-4 md:p-8 bg-white overflow-y-auto overflow-x-hidden">
            <div className="max-w-full overflow-hidden">
               {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

function AdminNavItem({ icon, label, href, active }: { icon: React.ReactNode, label: string, href: string, active?: boolean }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton 
        asChild 
        isActive={active}
        className={`px-6 transition-all font-medium h-12 group ${active ? 'bg-white/5 text-primary' : 'hover:bg-white/5 hover:text-primary text-white/60'}`}
      >
        <Link href={href} className="flex items-center gap-4 w-full text-left">
          <div className="shrink-0 flex items-center justify-center size-5">
            {icon}
          </div>
          <span className="font-bold tracking-tight truncate text-left text-[13px] uppercase">{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
