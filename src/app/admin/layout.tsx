import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { LayoutDashboard, Database, ClipboardList, TrendingUp, Settings, Users, LogOut, Bell, ShieldCheck } from "lucide-react"
import Link from "next/link"
import Logo from "@/components/brand/Logo"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#0F172A]">
        <Sidebar className="border-r border-white/5 bg-[#0F172A]">
          <SidebarHeader className="p-6">
            <Logo variant="light" className="scale-90 origin-left" />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="px-6 text-xs font-black uppercase tracking-widest text-white/20">Core Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <AdminNavItem icon={<LayoutDashboard />} label="Overview" href="/admin" />
                  <AdminNavItem icon={<Database />} label="Question Bank" href="/admin/questions" />
                  <AdminNavItem icon={<ClipboardList />} label="Mock Management" href="/admin/mocks" />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-4">
              <SidebarGroupLabel className="px-6 text-xs font-black uppercase tracking-widest text-white/20">Performance</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <AdminNavItem icon={<TrendingUp />} label="Result Analytics" href="/admin/results" />
                  <AdminNavItem icon={<Users />} label="Aspirants" href="/admin/users" />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-auto pb-8">
              <SidebarMenu>
                <AdminNavItem icon={<Settings />} label="Settings" href="/admin/settings" />
                <SidebarMenuItem>
                   <SidebarMenuButton className="px-6 text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors">
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
              <button className="relative text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
              </button>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold leading-none">Admin Control</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">Tier 1 Access</p>
                </div>
                <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20">
                  <span className="font-black text-primary text-xs">AC</span>
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
