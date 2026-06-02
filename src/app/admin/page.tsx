
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
  ArrowRight, 
  UserCheck, 
  MessageSquare, 
  ArrowUpRight,
  Zap,
  Newspaper,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  Download,
  FileJson
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, limit, orderBy } from "firebase/firestore"
import { useMemo, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { seedInitialData } from "@/services/seed-data"
import { useToast } from "@/hooks/use-toast"

/**
 * @fileOverview Final Admin Command Center with Backup System.
 */

export default function AdminDashboard() {
  const db = useFirestore()
  const { profile } = useUser()
  const { toast } = useToast()
  const [seeding, setSeeding] = useState(false)

  const { data: users, loading: uLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "users") : null), [db]))
  const { data: mocks, loading: mLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]))
  const { data: questions, loading: qLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "questions") : null), [db]))
  const { data: results, loading: rLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "results") : null), [db]))

  const handleSeed = async () => {
    if (!db || seeding) return
    if (!confirm("This will populate all 13 core collections with sample data. Continue?")) return
    setSeeding(true)
    try {
      await seedInitialData(db)
      toast({ title: "Global Sync Complete", description: "Institutional collections initialized." })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: e.message })
    } finally {
      setSeeding(false)
    }
  }

  const exportData = () => {
    const data = { 
      users, 
      mocks, 
      questions, 
      results, 
      exportedAt: new Date().toISOString(),
      platform: "Cracklix Production"
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cracklix-backup-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    toast({ title: "Backup Successful", description: "JSON archive generated for off-site storage." })
  }

  const topMocks = useMemo(() => {
    if (!mocks || !results) return []
    const counts: any = {}
    results.forEach((r: any) => counts[r.mockId] = (counts[r.mockId] || 0) + 1)
    return mocks
      .map((m: any) => ({ ...m, attempts: counts[m.id] || 0 }))
      .sort((a: any, b: any) => b.attempts - a.attempts)
      .slice(0, 3)
  }, [mocks, results])

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Executive Portal CMS</span>
           </div>
          <h1 className="text-5xl font-headline font-black text-primary uppercase tracking-tight">Command Center</h1>
          <p className="text-muted-foreground mt-2 text-lg">Aspirant Registry: Monitoring growth across {users?.length || 0} registered nodes.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button 
            onClick={exportData}
            variant="outline" 
            className="border-white/10 bg-white/5 text-white rounded-2xl font-bold h-14 px-8 text-xs uppercase tracking-widest gap-3"
          >
            <FileJson className="h-4 w-4 text-emerald-400" /> Export JSON Archive
          </Button>
          {profile?.role === 'SUPER_ADMIN' && (
            <Button 
              onClick={handleSeed} 
              disabled={seeding}
              variant="outline" 
              className="border-primary/20 bg-primary/5 text-primary rounded-2xl font-bold h-14 px-8 text-xs uppercase tracking-widest gap-3"
            >
              <RefreshCw className={`h-4 w-4 ${seeding ? 'animate-spin' : ''}`} /> 
              {seeding ? "Syncing..." : "Initialize Repo"}
            </Button>
          )}
          <Button asChild className="bg-primary hover:bg-primary/90 rounded-2xl h-14 px-10 font-black shadow-2xl shadow-primary/20 uppercase tracking-widest text-xs">
            <Link href="/admin/mocks/builder"><Plus className="mr-3 h-5 w-5" /> Build Test Series</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard icon={<Users className="text-blue-400" />} label="Total Aspirants" value={uLoading ? "..." : (users?.length || "0")} trend="+24% Month" />
        <AdminStatCard icon={<Database className="text-primary" />} label="Verified MCQs" value={qLoading ? "..." : (questions?.length || "0")} trend="+120 Today" />
        <AdminStatCard icon={<Calendar className="text-emerald-400" />} label="Active Series" value={mLoading ? "..." : (mocks?.length || "0")} trend="8 Live Sets" />
        <AdminStatCard icon={<Zap className="text-orange-400" />} label="Test Attempts" value={rLoading ? "..." : (results?.length || "0")} trend="High Load" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 border-foreground/5 bg-card/50 rounded-[3rem] overflow-hidden shadow-3xl">
          <CardHeader className="p-10 border-b border-white/5 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-headline font-black uppercase">Live Enrollment</CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-500">Registry Snapshot</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-primary font-black uppercase text-[10px] tracking-widest">
              <Link href="/admin/users">Full Registry <ArrowRight className="ml-2 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-white/5 h-16">
                  <TableHead className="px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Identity</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Membership</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registration</TableHead>
                  <TableHead className="text-right px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Audit</TableHead>
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
                         <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs uppercase">{user.name?.[0]}</div>
                         <div>
                            <p className="font-bold text-slate-100 text-sm">{user.name}</p>
                            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">{user.email}</p>
                         </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <Badge className={user.status === 'Pro' ? 'bg-primary text-white border-none px-3 py-1 text-[8px] font-black uppercase rounded-lg' : 'bg-muted text-muted-foreground border-none px-3 py-1 text-[8px] font-black uppercase rounded-lg'}>
                          {user.status || 'Free'}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                       {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
                    </TableCell>
                    <TableCell className="text-right px-10">
                       <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl opacity-20 group-hover:opacity-100 hover:bg-white/5" asChild>
                          <Link href="/admin/users"><Edit className="h-4 w-4" /></Link>
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="lg:col-span-4 space-y-8">
           <Card className="border-none bg-[#0F172A] rounded-[3rem] shadow-3xl p-10 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5"><TrendingUp className="h-40 w-40" /></div>
              <div className="relative z-10 space-y-6">
                 <h3 className="text-xl font-headline font-black text-white uppercase leading-none">Popularity Audit</h3>
                 <div className="space-y-6">
                    {topMocks.length > 0 ? topMocks.map((m: any) => (
                       <div key={m.id} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0">
                          <div className="space-y-1">
                             <p className="text-xs font-black text-slate-200 uppercase tracking-tight truncate max-w-[150px]">{m.title}</p>
                             <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{m.boardId}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-lg font-black text-primary leading-none">{m.attempts}</p>
                             <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Attempts</p>
                          </div>
                       </div>
                    )) : <p className="text-xs text-slate-500 italic">No attempt data available.</p>}
                 </div>
              </div>
           </Card>

           <Card className="border-none bg-primary text-white rounded-[3rem] p-10 shadow-3xl shadow-primary/20 relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform"><Zap className="h-32 w-32" /></div>
              <div className="relative z-10 space-y-4">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Strategic Action</p>
                 <h4 className="text-3xl font-headline font-black leading-tight">Institutional <br/>News Feed</h4>
                 <Button asChild className="bg-[#0F172A] hover:bg-black text-white h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest mt-4">
                    <Link href="/admin/current-affairs">Content Engine</Link>
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
        <div className="mt-8 pt-8 border-t border-white/5">
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
             <ArrowUpRight className="h-4 w-4" /> {trend}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
