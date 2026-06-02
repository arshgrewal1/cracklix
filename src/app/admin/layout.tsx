import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { LayoutDashboard, Database, ClipboardList, TrendingUp, Settings, Users, FilePlus, LogOut } from "lucide-react"
import Link from "next/link"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r border-foreground/5">
          <SidebarHeader className="p-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-headline text-2xl font-black uppercase">
                CRACK<span className="text-primary">LIX</span>
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="px-6 text-xs font-black uppercase tracking-widest text-muted-foreground/50">Core Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <AdminNavItem icon={<LayoutDashboard />} label="Dashboard" href="/admin" />
                  <AdminNavItem icon={<Database />} label="Question Bank" href="/admin/questions" />
                  <AdminNavItem icon={<ClipboardList />} label="Mock Management" href="/admin/mocks" />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-4">
              <SidebarGroupLabel className="px-6 text-xs font-black uppercase tracking-widest text-muted-foreground/50">Performance</SidebarGroupLabel>
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
                   <SidebarMenuButton className="px-6 text-destructive hover:bg-destructive/10">
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        
        <SidebarInset className="flex flex-col">
          <header className="h-16 border-b flex items-center px-6 justify-between bg-card/30 backdrop-blur-sm sticky top-0 z-40">
            <SidebarTrigger />
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold">Admin Portal</p>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Master Access</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
                <span className="font-black text-primary">A</span>
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
      <SidebarMenuButton asChild className="px-6 hover:bg-primary/5 hover:text-primary transition-all">
        <Link href={href}>
          <span className="h-4 w-4 mr-2">{icon}</span>
          {label}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
