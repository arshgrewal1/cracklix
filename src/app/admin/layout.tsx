
"use client"

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { LayoutDashboard, Database, ClipboardList, TrendingUp, Settings, Users, LogOut, Bell, ShieldCheck, GraduationCap, Zap, Newspaper, AlertCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import Logo from "@/components/brand/Logo"
import { useUser, useAuth } from "@/firebase"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { signOut } from "firebase/auth"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useUser()
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || (profile?.role !== 'ADMIN' && profile?.role !== 'SUPER_ADMIN'))) {
      router.push('/login')
    }
  }, [user, profile, loading, router])

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  if (loading) return <div className="h-screen w-full bg-[#0F172A] flex items-center justify-center"><ShieldCheck className="h-10 w-10 text-primary animate-pulse" /></div>
  
  if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN')) return null

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#0F172A]">
        <Sidebar className="border-r border-white/5 bg-[#0F172A]">
          <SidebarHeader className="p-6">
            <Logo variant="light" className="scale-90 origin-left" />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="px-6 text-xs font-black uppercase tracking-widest text-white/20">Data Operations</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <AdminNavItem icon={<Database />} label="MCQ Bank" href="/admin/questions" />
                  <AdminNavItem icon={<Zap className="text-primary" />} label="Bulk Import" href="/admin/questions/bulk" />
                  <AdminNavItem icon={<ClipboardList />} label="Mock Builder" href="/admin/mocks" />
                  <AdminNavItem icon={<AlertTriangle className="text-rose-400" />} label="Error Reports" href="/admin/reports" />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-4">
              <SidebarGroupLabel className="px-6 text-xs font-black uppercase tracking-widest text-white/20">Content Engine</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <AdminNavItem icon={<Newspaper className="text-emerald-400" />} label="Daily Analysis" href="/admin/current-affairs" />
                  <AdminNavItem icon={<AlertCircle className="text-orange-400" />} label="Exam Gazette" href="/admin/notifications" />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-4">
              <SidebarGroupLabel className="px-6 text-xs font-black uppercase tracking-widest text-white/20">Core Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <AdminNavItem icon={<LayoutDashboard />} label="Command Center" href="/admin" />
                  <AdminNavItem icon={<GraduationCap />} label="Exams & Boards" href="/admin/exams" />
                  <AdminNavItem icon={<TrendingUp />} label="Analytics Engine" href="/admin/analytics" />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-auto pb-8">
              <SidebarMenu>
                {profile.role === 'SUPER_ADMIN' && <AdminNavItem icon={<Settings />} label="Portal Settings" href="/admin/settings" />}
                <SidebarMenuItem>
                   <SidebarMenuButton onClick={handleLogout} className="px-6 text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors">
                    <LogOut className="h-4 w-4 mr-2" /> Logout Portal
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        
        <SidebarInset className="flex flex-col bg-background/95">
          <header className="h-16 border-b border-foreground/5 flex items-center px-6 justify-between bg-card/30 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="h-4 w-[1px] bg-foreground/10 mx-2" />
              <div className="flex items-center gap-2">
                 <ShieldCheck className="h-4 w-4 text-primary" />
                 <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Cracklix Management System</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold leading-none">{profile.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">
                    {profile.role === 'SUPER_ADMIN' ? 'Founder & Lead' : 'Content Admin'}
                  </p>
                </div>
                <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20">
                  <span className="font-black text-primary text-xs">{profile.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 p-8 overflow-y-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

function AdminNavItem({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild className="px-6 hover:bg-white/5 hover:text-primary transition-all text-white/60 font-medium">
        <Link href={href}>
          <span className="h-4 w-4 mr-2">{icon}</span>
          {label}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
