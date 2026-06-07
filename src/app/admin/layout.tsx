
'use client';

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { LayoutDashboard, Database, ClipboardList, LogOut, ShieldCheck, Zap, Newspaper, Megaphone, Globe, MousePointer2, Layers, CheckCircle2, Gem, BookOpen, FileStack, Upload, ListTree, Landmark, Menu, HeartPulse } from "lucide-react"
import Link from "next/link"
import Logo from "@/components/brand/Logo"
import { useUser, useAuth } from "@/firebase"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { signOut } from "firebase/auth"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import BackButton from "@/components/navigation/BackButton";

/**
 * @fileOverview Administrative Sidebar & Navigation Layout.
 * Updated: Logo scaling refined for mobile-first native app feel.
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
    if (!loading && (!user || !isAdmin)) {
      router.push('/login')
    }
  }, [user, profile, loading, router, isAdmin])

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  if (loading) return <div className="h-screen w-full bg-[#0F172A] flex items-center justify-center"><ShieldCheck className="h-10 w-10 text-primary animate-pulse" /></div>
  
  if (!user || !isAdmin) return null

  const showBack = pathname !== "/admin";

  const SideNavContent = () => (
    <div className="flex flex-col h-full bg-[#0F172A]">
       <div className="p-6">
          <Logo variant="light" className="origin-left" />
       </div>
       <div className="flex-1 custom-scrollbar overflow-y-auto overflow-x-hidden">
          <SidebarGroup>
            <SidebarGroupLabel className="px-6 text-[10px] font-black uppercase tracking-widest text-white/20 text-left">Operations</SidebarGroupLabel>
            <SidebarMenu>
              <AdminNavItem icon={<LayoutDashboard />} label="Dashboard" href="/admin" active={pathname === "/admin"} onClick={() => setIsMobileMenuOpen(false)} />
              <AdminNavItem icon={<HeartPulse className="text-rose-400" />} label="System Health" href="/admin/health" active={pathname === "/admin/health"} onClick={() => setIsMobileMenuOpen(false)} />
              <AdminNavItem icon={<Globe className="text-blue-400" />} label="Authority Hub" href="/admin/exams" active={pathname === "/admin/exams"} onClick={() => setIsMobileMenuOpen(false)} />
              <AdminNavItem icon={<Landmark className="text-amber-400" />} label="Exam Registry" href="/admin/exam-registry" active={pathname === "/admin/exam-registry"} onClick={() => setIsMobileMenuOpen(false)} />
              <AdminNavItem icon={<Database />} label="Atomic Bank" href="/admin/questions" active={pathname === "/admin/questions"} onClick={() => setIsMobileMenuOpen(false)} />
              <AdminNavItem icon={<Upload className="text-primary" />} label="Bulk Ingestion" href="/admin/bulk-import" active={pathname === "/admin/bulk-import"} onClick={() => setIsMobileMenuOpen(false)} />
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="px-6 text-[10px] font-black uppercase tracking-widest text-white/20 text-left">CMS Hub</SidebarGroupLabel>
            <SidebarMenu>
              <AdminNavItem icon={<Zap className="text-primary" />} label="Free Hub CMS" href="/admin/free-content" active={pathname === "/admin/free-content"} onClick={() => setIsMobileMenuOpen(false)} />
              <AdminNavItem icon={<Newspaper className="text-emerald-400" />} label="Analysis Feed" href="/admin/current-affairs" active={pathname === "/admin/current-affairs"} onClick={() => setIsMobileMenuOpen(false)} />
              <AdminNavItem icon={<BookOpen className="text-orange-400" />} label="Study Notes" href="/admin/notes" active={pathname === "/admin/notes"} onClick={() => setIsMobileMenuOpen(false)} />
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="px-6 text-[10px] font-black uppercase tracking-widest text-white/20 text-left">Modular Architect</SidebarGroupLabel>
            <SidebarMenu>
              <AdminNavItem icon={<Layers className="text-primary" />} label="Test Assembly" href="/admin/mocks" active={pathname === "/admin/mocks"} onClick={() => setIsMobileMenuOpen(false)} />
              <AdminNavItem icon={<ClipboardList />} label="Mock Blueprints" href="/admin/mocks/builder" active={pathname === "/admin/mocks/builder"} onClick={() => setIsMobileMenuOpen(false)} />
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup className="mt-auto pb-8">
            <SidebarMenu>
              <SidebarMenuItem>
                 <button onClick={handleLogout} className="w-full flex items-center px-6 text-destructive/70 hover:bg-destructive/10 hover:text-destructive h-12 gap-3">
                  <LogOut className="size-4 shrink-0" /> <span className="font-bold text-sm uppercase tracking-tight">Logout</span>
                </button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
       </div>
    </div>
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-white font-body overflow-x-hidden">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden lg:flex border-r border-white/5 bg-[#0F172A]">
           <SideNavContent />
        </Sidebar>
        
        <SidebarInset className="flex flex-col bg-white">
          <header className="h-14 md:h-16 border-b border-slate-200 flex items-center px-4 md:px-6 justify-between bg-white sticky top-0 z-[100] shrink-0">
            <div className="flex items-center gap-1 md:gap-3">
              {/* Mobile Menu Trigger */}
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
              
              {showBack && (
                <div className="flex items-center">
                  <div className="h-4 w-[1px] bg-slate-200 mx-2 hidden md:block" />
                  <BackButton label="Dashboard" fallback="/admin" />
                </div>
              )}

              <div className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:block" />
              <div className="flex items-center gap-2 truncate">
                 <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                 <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#0F172A] truncate">CMS Governance</span>
              </div>
            </div>
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

function AdminNavItem({ icon, label, href, active, onClick }: { icon: React.ReactNode, label: string, href: string, active?: boolean, onClick?: () => void }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton 
        asChild 
        isActive={active}
        className={`px-6 transition-all font-medium h-12 group ${active ? 'bg-white/5 text-primary' : 'hover:bg-white/5 hover:text-primary text-white/60'}`}
        onClick={onClick}
      >
        <Link href={href} className="flex items-center gap-4 w-full text-left">
          <div className="shrink-0 flex items-center justify-center size-5">
            {icon}
          </div>
          <span className="font-bold tracking-tight truncate text-left text-[14px] uppercase">{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
