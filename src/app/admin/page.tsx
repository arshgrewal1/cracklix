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
  ShieldCheck,
  TrendingUp,
  FileText
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, limit, orderBy } from "firebase/firestore"
import { useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

/**
 * @fileOverview Phase 32: Polished Admin Command Center.
 * Provides institutional oversight for Arsh Grewal Management.
 */

export default function AdminDashboard() {
  const db = useFirestore()

  const { data: users, loading: uLoading } = useCollection(useMemo(() => (db ? collection(db, "users") : null), [db]))
  const { data: mocks, loading: mLoading } = useCollection(useMemo(() => (db ? collection(db, "mocks") : null), [db]))
  const { data: questions, loading: qLoading } = useCollection(useMemo(() => (db ? collection(db, "questions") : null), [db]))
  const { data: ca, loading: cLoading } = useCollection(useMemo(() => (db ? collection(db, "current_affairs") : null), [db]))

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Arsh Grewal Management Mode</span>
           </div>
          <h1 className="text-5xl font-headline font-black text-primary uppercase tracking-tight">Command Center</h1>
          <p className="text-muted-foreground mt-2 text-lg">System Oversight: Monitoring Punjab's largest preparation vertical.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button variant="outline" className="border-foreground/10 bg-card/30 rounded-2xl font-bold h-14 px-8 text-xs uppercase tracking-widest">System Health</Button>
          <Button asChild className="bg-primary hover:bg-primary/90 rounded-2xl h-14 px-10 font-black shadow-2xl shadow-primary/20 uppercase tracking-widest text-xs">
            <Link href="/admin/mocks/builder"><Plus className="mr-3 h-5 w-5" /> Deploy New Mock</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard 
          icon={<Users className="text-blue-400" />} 
          label="Total Aspirants" 
          value={uLoading ? "..." : (users?.length || "0")} 
          trend="+84 today" 
        />
        <AdminStatCard 
          icon={<Database className="text-primary" />} 
          label="Verified MCQs" 
          value={qLoading ? "..." : (questions?.length || "0")} 
          trend="+120 audited" 
        />
        <AdminStatCard 
          icon={<Calendar className="text-emerald-400" />} 
          label="Active Series" 
          value={mLoading ? "..." : (mocks?.length || "0")} 
          trend="8 high-fidelity" 
        />
        <AdminStatCard 
          icon={<Newspaper className="text-orange-400" />} 
          label="Analysis Feed" 
          value={cLoading ? "..." : (ca?.length || "0")} 
          trend="+2 strategic" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Live Logs */}
        <Card className="lg:col-span-8 border-foreground/5 bg-card/50 rounded-[3rem] overflow-hidden shadow-3xl">
          <CardHeader className="p-10 border-b border-white/5 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-headline font-black uppercase">Aspirant Flow</CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-500">Live Registry Activity</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-primary font-black uppercase text-[10px] tracking-widest">
              <Link href="/admin/users">Full Registry <ArrowRight className="ml-2 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-white/5 h-16">
                  <TableHead className="px-10 text-[10px] font-black uppercase tracking-widest">Aspirant Identity</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Geographic Node</TableHead>
                  <TableHead className="text-right px-10 text-[10px] font-black uppercase tracking-widest">Audit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-white/5"><TableCell colSpan={4} className="px-10 py-5"><Skeleton className="h-10 w-full rounded-xl bg-white/5" /></TableCell></TableRow>
                  ))
                ) : users?.slice(0, 5).map((user: any) => (
                  <TableRow key={user.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                    <TableCell className="px-10 py-6">
                      <div className="flex items-center gap-4">
                         <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm">
                            {user.name?.[0]}
                         </div>
                         <div>
                            <p className="font-bold text-slate-100 text-base">{user.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">{user.email}</p>
                         </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <Badge className={user.status === 'Pro' ? 'bg-primary text-white border-none px-3 py-1 text-[9px] font-black uppercase rounded-lg' : 'bg-muted text-muted-foreground border-none px-3 py-1 text-[9px] font-black uppercase rounded-lg'} variant="outline">
                          {user.status || 'Free'}
                       </Badge>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                          {user.targetExam || 'General'}
                       </div>
                    </TableCell>
                    <TableCell className="text-right px-10">
                       <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl opacity-20 group-hover:opacity-100 transition-opacity hover:bg-white/5" asChild>
                          <Link href="/admin/users"><Edit className="h-5 w-5" /></Link>
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Insights */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="border-foreground/5 bg-[#0F172A] rounded-[3rem] shadow-3xl p-10 space-y-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5"><TrendingUp className="h-40 w-40" /></div>
              <div className="relative z-10 space-y-6">
                 <h3 className="text-2xl font-headline font-black text-white uppercase leading-none">System Pulse</h3>
                 <div className="space-y-6">
                    <ActivityItem icon={<UserCheck className="text-emerald-500" />} title="New Enrollment" desc="Gurpreet Kaur (Pro)" time="2m ago" />
                    <ActivityItem icon={<ShieldCheck className="text-primary" />} title="Mock Published" desc="PPSC PCS Set 04" time="15m ago" />
                    <ActivityItem icon={<MessageSquare className="text-orange-500" />} title="Sync Complete" desc="CA Feed Refreshed" time="1h ago" />
                 </div>
                 <Button asChild variant="outline" className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-white/10 hover:bg-white/5 text-slate-400">
                    <Link href="/admin/analytics">View Full Analytics Engine</Link>
                 </Button>
              </div>
           </Card>

           <Card className="border-none bg-primary text-white rounded-[3rem] p-10 shadow-3xl shadow-primary/20 relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform"><Zap className="h-32 w-32" /></div>
              <div className="relative z-10 space-y-4">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Strategic Action</p>
                 <h4 className="text-3xl font-headline font-black leading-tight">Scale Your <br/>Bank Instantly</h4>
                 <Button asChild className="bg-[#0F172A] hover:bg-black text-white h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest mt-4 shadow-2xl">
                    <Link href="/admin/questions/bulk">Extraction Engine</Link>
                 </Button>
              </div>
           </Card>
        </div>
      </div>
    </div>
  )
}

function AdminStatCard({ icon, label, value, trend }: any) {
  return (
    <Card className="bg-card/50 border-foreground/5 shadow-2xl rounded-[2.5rem] overflow-hidden group hover:translate-y-[-4px] transition-all">
      <div className="h-1.5 w-full bg-primary/20 group-hover:bg-primary transition-colors" />
      <CardContent className="p-10">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 rounded-[1.5rem] bg-background border border-foreground/5 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
             {icon}
          </div>
          <div>
            <p className="text-4xl font-headline font-black tracking-tighter text-slate-100 leading-none">{value}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mt-3">{label}</p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
             <ArrowUpRight className="h-4 w-4" /> {trend}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ icon, title, desc, time }: any) {
  return (
    <div className="flex gap-5 group">
      <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors shadow-lg">{icon}</div>
      <div className="space-y-1 min-w-0">
        <p className="text-sm font-black uppercase tracking-tight leading-none text-slate-100">{title}</p>
        <p className="text-xs text-slate-400 truncate font-medium">{desc}</p>
        <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{time}</p>
      </div>
    </div>
  )
}
