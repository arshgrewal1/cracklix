"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  Database, 
  Users, 
  Calendar, 
  BarChart3, 
  Edit, 
  Trash2, 
  ArrowRight, 
  UserCheck, 
  MessageSquare, 
  ArrowUpRight,
  Zap,
  Newspaper,
  Bell,
  ShieldCheck
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EXAMS } from "@/lib/mock-data"
import Link from "next/link"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, limit, orderBy } from "firebase/firestore"
import { useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminDashboard() {
  const db = useFirestore()

  const { data: users } = useCollection(useMemo(() => (db ? collection(db, "users") : null), [db]))
  const { data: mocks } = useCollection(useMemo(() => (db ? collection(db, "mocks") : null), [db]))
  const { data: questions } = useCollection(useMemo(() => (db ? collection(db, "questions") : null), [db]))
  const { data: ca } = useCollection(useMemo(() => (db ? collection(db, "current_affairs") : null), [db]))

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-headline font-black text-primary uppercase tracking-tight">Command Center</h1>
          <p className="text-muted-foreground mt-1">Institutional Oversight Mode: Arsh Grewal Management.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="border-foreground/5 bg-card/30 rounded-xl font-bold h-12 px-6">System Health</Button>
          <Button asChild className="bg-primary hover:bg-primary/90 rounded-xl h-12 px-8 font-black shadow-xl shadow-primary/20">
            <Link href="/admin/mocks/builder"><Plus className="mr-2 h-5 w-5" /> Deploy New Mock</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard icon={<Users className="text-blue-400" />} label="Total Aspirants" value={users?.length || "0"} trend="+84 today" />
        <AdminStatCard icon={<Database className="text-primary" />} label="Verified MCQs" value={questions?.length || "0"} trend="+12 today" />
        <AdminStatCard icon={<Calendar className="text-emerald-400" />} label="Active Series" value={mocks?.length || "0"} trend="3 expiring" />
        <AdminStatCard icon={<Newspaper className="text-orange-400" />} label="Analysis Feed" value={ca?.length || "0"} trend="+2 today" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Core Actions Grid */}
        <Card className="lg:col-span-12 border-foreground/5 bg-card/20 backdrop-blur-sm rounded-[2.5rem] p-10 overflow-hidden">
           <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2">
                 <h2 className="text-2xl font-headline font-black">Strategic Operations</h2>
                 <p className="text-muted-foreground font-medium">Quick access to primary platform modules.</p>
              </div>
              <div className="flex flex-wrap gap-4 justify-center">
                 <QuickActionBtn icon={<Zap />} label="Bulk Import" href="/admin/questions/bulk" color="text-primary" />
                 <QuickActionBtn icon={<Database />} label="Bank" href="/admin/questions" color="text-blue-400" />
                 <QuickActionBtn icon={<Newspaper />} label="Post CA" href="/admin/current-affairs" color="text-emerald-400" />
                 <QuickActionBtn icon={<Bell />} label="Broadcast" href="/admin/notifications" color="text-orange-400" />
              </div>
           </div>
        </Card>

        {/* Live Logs */}
        <Card className="lg:col-span-8 border-foreground/5 bg-card/50 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-headline font-black">Aspirant Flow</CardTitle>
              <CardDescription>Recent registrations and mock attempts.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-primary font-bold">
              <Link href="/admin/users">Full Registry <ArrowRight className="ml-2 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-white/5">
                  <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest">Aspirant Identity</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Joined</TableHead>
                  <TableHead className="text-right px-8 text-[10px] font-black uppercase tracking-widest">Controls</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.slice(0, 5).map((user: any) => (
                  <TableRow key={user.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="px-8 py-5">
                      <div className="flex items-center gap-3">
                         <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black text-xs">
                            {user.name?.[0]}
                         </div>
                         <div>
                            <p className="font-bold text-slate-100">{user.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">{user.email}</p>
                         </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <Badge className={user.status === 'Pro' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'} variant="outline">
                          {user.status || 'Free'}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-muted-foreground">
                       {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Just now'}
                    </TableCell>
                    <TableCell className="text-right px-8">
                       <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/5"><Edit className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* System Activity */}
        <Card className="lg:col-span-4 border-foreground/5 bg-card/50 rounded-[2.5rem] shadow-2xl">
          <CardHeader className="p-8 pb-0">
            <CardTitle className="text-xl font-headline font-black">Live Pulse</CardTitle>
            <CardDescription>Real-time backend events.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <ActivityItem icon={<UserCheck className="text-emerald-500" />} title="New Enrollment" desc="Gurpreet Kaur (Pro)" time="2m ago" />
            <ActivityItem icon={<ShieldCheck className="text-primary" />} title="Mock Published" desc="PPSC PCS Set 04" time="15m ago" />
            <ActivityItem icon={<MessageSquare className="text-orange-500" />} title="Sync Complete" desc="CA Feed Refreshed" time="1h ago" />
            <Button variant="outline" className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border-foreground/10 hover:bg-white/5">View Full Analytics Engine</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function AdminStatCard({ icon, label, value, trend }: any) {
  return (
    <Card className="bg-card/50 border-foreground/5 shadow-2xl rounded-3xl overflow-hidden group hover:scale-[1.02] transition-all">
      <div className="h-1 w-full bg-primary/20 group-hover:bg-primary transition-colors" />
      <CardContent className="p-8">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-background border border-foreground/5 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
             {icon}
          </div>
          <div>
            <p className="text-3xl font-headline font-black tracking-tighter">{value}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{label}</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] font-bold text-emerald-500/80 tracking-tight flex items-center gap-1">
             <ArrowUpRight className="h-3 w-3" /> {trend}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function QuickActionBtn({ icon, label, href, color }: any) {
   return (
      <Link href={href}>
         <div className="bg-background/80 hover:bg-background border border-white/5 rounded-2xl p-5 w-32 flex flex-col items-center gap-3 transition-all hover:-translate-y-1 shadow-lg">
            <div className={`h-10 w-10 rounded-xl bg-muted/20 flex items-center justify-center ${color}`}>
               {icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
         </div>
      </Link>
   )
}

function ActivityItem({ icon, title, desc, time }: any) {
  return (
    <div className="flex gap-4 group">
      <div className="h-11 w-11 rounded-full bg-background border border-white/5 flex items-center justify-center shrink-0 group-hover:bg-white/5 transition-colors">{icon}</div>
      <div className="space-y-0.5 min-w-0">
        <p className="text-xs font-black uppercase tracking-tight leading-none text-slate-200">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{desc}</p>
        <p className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest">{time}</p>
      </div>
    </div>
  )
}
