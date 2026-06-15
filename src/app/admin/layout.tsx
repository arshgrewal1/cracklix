'use client';

import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { 
  LayoutDashboard, 
  LogOut, 
  ShieldCheck, 
  Database,
  Newspaper, 
  BookOpen,
  Building2,
  GraduationCap,
  UploadCloud,
  FolderTree,
  Activity,
  Sparkles,
  PenSquare,
  ClipboardList,
  Archive,
  Users,
  DollarSign,
  Smartphone,
  Gem,
  History,
  HeartPulse,
  Settings,
  FileCode2,
  NotebookPen,
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

/**
 * @fileOverview Hardened Admin Layout Hub v4.0.
 * Stabilized widths: 280px (Expanded), 80px (Collapsed).
 * Global layout transitions: 250ms.
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
       <ShieldCheck className="h-12 w-12 text-blue-600 animate-pulse" />
       <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Securing Registry Center...</p>
    </div>
  )
  
  if (!user || !isAdmin) return null

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-white font-body overflow-x-hidden">
        <Sidebar 
          collapsible="icon"
          className="border-r border-[#1E293B] bg-[#0F172A] z-[50]"
          style={{ 
            "--sidebar-width": "280px", 
            "--sidebar-width-icon": "80px",
            transition: "width 250ms ease-in-out" 
          } as React.CSSProperties}
        >
          <div className="flex flex-col h-full bg-gradient-to-b from-[#0F172A] to-[#111827]">
            
            <div className="h-24 px-6 flex items-center shrink-0">
               <Logo href="/admin" variant="light" imgClassName="h-12 w-auto" />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar-admin px-4 pb-10">
               
               <SidebarGroup className="p-0 mb-6">
                 <SidebarGroupLabel className="px-4 h-fit py-0 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500 mb-3 group-data-[state=collapsed]:hidden">
                   MANAGEMENT CENTER
                 </SidebarGroupLabel>
                 <SidebarMenu className="gap-1">
                   <AdminNavItem icon={<LayoutDashboard />} label="Dashboard" href="/admin" active={pathname === "/admin"} />
                   <AdminNavItem icon={<FolderTree />} label="Categories" href="/admin/categories" active={pathname === "/admin/categories"} />
                   <AdminNavItem icon={<Building2 />} label="Boards Center" href="/admin/exams" active={pathname === "/admin/exams"} />
                   <AdminNavItem icon={<GraduationCap />} label="Exam Registry" href="/admin/exam-registry" active={pathname === "/admin/exam-registry"} />
                   <AdminNavItem icon={<BookOpen />} label="Subject Registry" href="/admin/subjects" active={pathname === "/admin/subjects"} />
                   <AdminNavItem icon={<Database />} label="MCQ Bank" href="/admin/questions" active={pathname === "/admin/questions"} />
                   <AdminNavItem icon={<UploadCloud />} label="Bulk Ingest" href="/admin/bulk-import" active={pathname === "/admin/bulk-import"} />
                 </SidebarMenu>
               </SidebarGroup>

               <SidebarGroup className="p-0 mb-6">
                 <SidebarGroupLabel className="px-4 h-fit py-0 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500 mb-3 group-data-[state=collapsed]:hidden">
                   CONTENT PULSE
                 </SidebarGroupLabel>
                 <SidebarMenu className="gap-1">
                   <AdminNavItem icon={<Activity />} label="Content Pulse" href="/admin/qa" active={pathname === "/admin/qa"} />
                   <AdminNavItem icon={<Sparkles />} label="Brand Magic" href="/admin/brand-magic" active={pathname === "/admin/brand-magic"} />
                   <AdminNavItem icon={<PenSquare />} label="Mock Builder" href="/admin/mocks/builder" active={pathname === "/admin/mocks/builder"} />
                   <AdminNavItem icon={<ClipboardList />} label="Mock Manager" href="/admin/mocks" active={pathname === "/admin/mocks"} />
                   <AdminNavItem icon={<Newspaper />} label="Curr. Affairs" href="/admin/current-affairs" active={pathname === "/admin/current-affairs"} />
                   <AdminNavItem icon={<NotebookPen />} label="Study Notes" href="/admin/notes" active={pathname === "/admin/notes"} />
                   <AdminNavItem icon={<Archive />} label="PYQ Archive" href="/admin/pyqs" active={pathname === "/admin/pyqs"} />
                   <AdminNavItem icon={<FileCode2 />} label="Free Center CMS" href="/admin/free-content" active={pathname === "/admin/free-content"} />
                 </SidebarMenu>
               </SidebarGroup>

               <SidebarGroup className="p-0">
                 <SidebarGroupLabel className="px-4 h-fit py-0 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500 mb-3 group-data-[state=collapsed]:hidden">
                   GOVERNANCE
                 </SidebarGroupLabel>
                 <SidebarMenu className="gap-1">
                   <AdminNavItem icon={<Users />} label="Student List" href="/admin/users" active={pathname === "/admin/users"} />
                   <AdminNavItem icon={<Smartphone />} label="Device Audit" href="/admin/devices" active={pathname === "/admin/devices"} />
                   <AdminNavItem icon={<DollarSign />} label="Revenue Center" href="/admin/payments" active={pathname === "/admin/payments"} />
                   <AdminNavItem icon={<ShieldCheck />} label="Verify UPI" href="/admin/payments/verify" active={pathname === "/admin/payments/verify"} />
                   <AdminNavItem icon={<Gem />} label="Pass Manager" href="/admin/passes" active={pathname === "/admin/passes"} />
                   <AdminNavItem icon={<History />} label="Audit Logs" href="/admin/audit-logs" active={pathname === "/admin/audit-logs"} />
                   <AdminNavItem icon={<HeartPulse />} label="System Health" href="/admin/health" active={pathname === "/admin/health"} />
                   <AdminNavItem icon={<Settings />} label="Settings" href="/admin/settings" active={pathname === "/admin/settings"} />
                 </SidebarMenu>
               </SidebarGroup>
            </div>

            <div className="p-4 border-t border-[#1E293B] bg-[#020617]/50 shrink-0">
               <button 
                 onClick={handleLogout}
                 className="h-12 w-full flex items-center gap-3 px-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all font-semibold active:scale-95 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-0"
               >
                 <LogOut className="h-5 w-5 shrink-0" />
                 <span className="text-[15px] hidden group-data-[state=expanded]:block">LOG OUT SESSION</span>
               </button>
            </div>
          </div>
        </Sidebar>
        
        <SidebarInset className="flex flex-col bg-white min-w-0 max-w-full relative transition-all duration-250 ease-in-out">
          <header className="h-[72px] md:h-20 border-b border-slate-100 flex items-center px-4 md:px-8 justify-between bg-white sticky top-0 z-40 shrink-0 shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="bg-blue-600 text-white hover:bg-blue-700 h-11 w-11 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 cursor-pointer" />
              <div className="h-8 w-px bg-slate-100 mx-2 hidden sm:block" />
              <div className="flex flex-col text-left">
                 <span className="text-[11px] font-black uppercase text-blue-600 tracking-[0.2em] leading-none">ADMIN HUB</span>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 hidden xs:block">REGISTRY AUDIT ACTIVE</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 md:gap-4">
               <Button asChild variant="outline" className="h-11 px-5 md:px-7 rounded-xl border-slate-200 font-black uppercase text-[10px] tracking-widest gap-2 hover:bg-slate-50 shadow-sm transition-all active:scale-95">
                  <Link href="/">
                     <Activity className="h-4 w-4 text-blue-600" /> <span className="hidden sm:inline">VIEW SITE</span>
                  </Link>
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

          <main className="flex-1 p-4 md:p-8 lg:p-12 bg-white overflow-y-auto overflow-x-hidden min-w-0 pointer-events-auto">
             <div className="max-w-full">
                {children}
             </div>
          </main>
        </SidebarInset>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar-admin::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar-admin::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar-admin::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar-admin::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </SidebarProvider>
  )
}

function AdminNavItem({ icon, label, href, active }: { icon: React.ReactNode, label: string, href: string, active?: boolean }) {
  return (
    <SidebarMenuItem className="p-0 m-0 list-none">
      <SidebarMenuButton 
        asChild 
        isActive={active}
        className={cn(
          "h-12 w-full transition-all duration-200 font-semibold px-4 rounded-2xl group",
          active 
            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
            : "text-slate-300 hover:bg-[#1E293B] hover:text-white"
        )}
      >
        <Link href={href} className="flex items-center gap-3 w-full">
          <div className={cn(
            "shrink-0 flex items-center justify-center size-5 transition-colors",
            active ? "text-white" : "text-slate-400 group-hover:text-white"
          )}>
            {icon}
          </div>
          <span className="text-[15px] whitespace-nowrap hidden group-data-[state=expanded]:block">{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
