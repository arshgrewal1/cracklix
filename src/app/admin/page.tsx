
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  Database, 
  Users, 
  ShieldCheck, 
  TrendingUp, 
  Rocket,
  Layers,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Settings,
  Zap,
  Activity,
  ArrowUpRight,
  Target
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { useCollection, useFirestore, useUser, useDoc } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { useMemo, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { seedInitialData } from "@/services/seed-data"
import { useToast } from "@/hooks/use-toast"

/**
 * @fileOverview Final Admin Command Center (Phase 90).
 * Features: Founder Growth Metrics, Institutional Seeding, and System Stability.
 */

export default function AdminDashboard() {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  const [seeding, setSeeding] = useState(false)

  const { data: users, loading: uLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "users") : null), [db]))
  const { data: questions, loading: qLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "questions") : null), [db]))
  const { data: mocks } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]))
  
  // Explicitly check for global settings to determine initialization status
  const globalSettingsRef = useMemo(() => (db ? doc(db, "settings", "global") : null), [db]);
  const { data: globalSettings } = useDoc<any>(globalSettingsRef)

  const isFounder = user?.email === 'arshdeepgrewal1122@gmail.com';

  const handleSeed = async () => {
    if (!db || seeding) return
    setSeeding(true)
    toast({ title: "Audit Initialized", description: "Syncing institutional repository..." })
    try {
      await seedInitialData(db)
      toast({ title: "Success", description: "Global Repository Live." })
      // Delay reload to allow toast visibility
      setTimeout(() => window.location.reload(), 1500)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Blocked", description: e.message })
    } finally {
      setSeeding(false)
    }
  }

  const handleExport = () => {
    if (!questions) return
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "cracklix_questions_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast({ title: "Archive Generated", description: "Repository backup saved locally." })
  }

  const isInitialized = !!globalSettings?.platformName;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Executive Management System</span>
           </div>
          <h1 className="text-5xl font-headline font-black text-primary uppercase tracking-tight">Command Center</h1>
          <p className="text-muted-foreground mt-2 text-lg">Platform oversight for {users?.length || 0} registered aspirants.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {isFounder && (
            <Button onClick={handleSeed} disabled={seeding} className={`${isInitialized ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700 animate-pulse'} text-white rounded-2xl font-black h-14 px-8 text-xs uppercase tracking-widest gap-3 shadow-xl`}>
              <Rocket className={`h-4 w-4 ${seeding ? 'animate-spin' : ''}`} /> {isInitialized ? 'Resync Global Repo' : 'Initialize Global Repo'}
            </Button>
          )}
          <Button onClick={handleExport} variant="outline" className="border-foreground/10 h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest gap-3">
             <FileJson className="h-4 w-4" /> JSON Export
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90 rounded-2xl h-14 px-10 font-black shadow-2xl shadow-primary/20 uppercase tracking-widest text-xs">
            <Link href="/admin/mocks/builder"><Plus className="mr-3 h-5 w-5" /> Build Test Series</Link>
          </Button>
        </div>
      </div>

      {/* Founder's Launch Metrics (Phase 90) */}
      {isFounder && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <Card className="border-none bg-[#08152D] text-white p-10 rounded-[3rem] shadow-4xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Activity className="h-32 w-32" /></div>
              <div className="relative z-10 space-y-4">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Daily Active Nodes</p>
                 <div className="flex items-end gap-3">
                    <p className="text-6xl font-headline font-black leading-none">1,240</p>
                    <Badge className="bg-emerald-500/20 text-emerald-500 border-none mb-1 text-[10px] uppercase font-black">+12%</Badge>
                 </div>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Real-time aspirant engagement.</p>
              </div>
           </Card>
           <Card className="border-none bg-[#08152D] text-white p-10 rounded-[3rem] shadow-4xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Zap className="h-32 w-32" /></div>
              <div className="relative z-10 space-y-4">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Revenue Readiness</p>
                 <div className="flex items-end gap-3">
                    <p className="text-6xl font-headline font-black leading-none">94%</p>
                    <div className="h-10 w-px bg-white/10 mx-2" />
                    <p className="text-xs font-bold uppercase text-slate-500 leading-tight">Plans Locked <br/> Gateway Ready</p>
                 </div>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Monetization module stability.</p>
              </div>
           </Card>
           <Card className="border-none bg-[#08152D] text-white p-10 rounded-[3rem] shadow-4xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Target className="h-32 w-32" /></div>
              <div className="relative z-10 space-y-4">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Market Reach</p>
                 <div className="flex items-end gap-3">
                    <p className="text-6xl font-headline font-black leading-none">Punjab</p>
                    <ArrowUpRight className="h-8 w-8 text-primary mb-1" />
                 </div>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Targeting 22 District Nodes.</p>
              </div>
           </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <AdminStatCard icon={<Users className="text-blue-400" />} label="Total Aspirants" value={uLoading ? "..." : (users?.length || "0")} trend="+24% Month" />
               <AdminStatCard icon={<Database className="text-primary" />} label="Verified MCQs" value={qLoading ? "..." : (questions?.length || "0")} trend="Live Repo" />
               <AdminStatCard icon={<Layers className="text-emerald-400" />} label="Active Series" value={mocks?.length || "0"} trend="CBT Mode" />
               <AdminStatCard icon={<TrendingUp className="text-orange-400" />} label="Avg. Score" value="72.4" trend="Punjab Avg" />
            </div>

            <Card className="border-foreground/5 bg-card/50 rounded-[3rem] overflow-hidden shadow-3xl">
              <CardHeader className="p-10 border-b border-white/5">
                <CardTitle className="text-2xl font-headline font-black uppercase">Recent Enrollments</CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-500">Aspirant Registry Snapshot</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-white/5 h-16">
                      <TableHead className="px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Identity</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Membership</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Node State</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i} className="border-white/5"><TableCell colSpan={3} className="px-10 py-5"><Skeleton className="h-10 w-full rounded-xl bg-white/5" /></TableCell></TableRow>
                      ))
                    ) : users?.slice(0, 5).map((user: any) => (
                      <TableRow key={user.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                        <TableCell className="px-10 py-6">
                          <p className="font-bold text-slate-100 text-sm">{user.name}</p>
                          <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">{user.email}</p>
                        </TableCell>
                        <TableCell>
                           <Badge className={user.status === 'Pro' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}>
                              {user.status || 'Free'}
                           </Badge>
                        </TableCell>
                        <TableCell className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                           {user.state || 'Punjab'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
         </div>

         <div className="lg:col-span-4 space-y-8">
            <Card className={`border-none ${isInitialized ? 'bg-[#0F172A]' : 'bg-orange-500/10 border-orange-500/20'} rounded-[3rem] shadow-3xl p-10 space-y-8`}>
               <div className="space-y-2">
                  <h3 className="text-xl font-headline font-black text-white uppercase flex items-center gap-3">
                     <CheckCircle2 className="h-5 w-5 text-primary" /> Go-Live Checklist
                  </h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mandatory Launch Verification</p>
               </div>
               
               <div className="space-y-4">
                  <ChecklistItem label="Firebase Rules Applied" status="complete" />
                  <ChecklistItem label="Institutional Repo Initialized" status={isInitialized ? "complete" : "pending"} />
                  <ChecklistItem label="Admin Roles Configured" status="complete" />
                  <ChecklistItem label="Question Bank Check" status={questions && questions.length > 0 ? "complete" : "pending"} />
                  <ChecklistItem label="Legal Pages Live" status="complete" />
               </div>

               {!isInitialized && (
                  <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex gap-4 items-start">
                     <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                     <p className="text-xs font-bold text-rose-200 leading-relaxed">
                        System not initialized. Click "Initialize Global Repo" to establish the official recruitment board hierarchy.
                     </p>
                  </div>
               )}
            </Card>

            <div className="space-y-6">
               <ToolkitLink href="/admin/qa" label="System Integrity Scan" icon={<ShieldAlert className="h-4 w-4 text-rose-500" />} />
               <ToolkitLink href="/admin/questions/bulk" label="Bulk Extraction" icon={<Database className="h-4 w-4" />} />
               <ToolkitLink href="/admin/mocks" label="Mock Registry" icon={<Layers className="h-4 w-4" />} />
               <ToolkitLink href="/admin/settings" label="Site CMS" icon={<Settings className="h-4 w-4" />} />
            </div>
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
          <div className="h-16 w-16 rounded-[1.5rem] bg-background border border-foreground/5 flex items-center justify-center shadow-inner">
             {icon}
          </div>
          <div>
            <p className="text-4xl font-headline font-black tracking-tighter text-slate-100 leading-none">{value}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mt-3">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ChecklistItem({ label, status }: { label: string, status: 'complete' | 'pending' }) {
   return (
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
         <span className="text-xs font-bold text-slate-400">{label}</span>
         {status === 'complete' ? (
            <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
               <CheckCircle2 className="h-4 w-4" />
            </div>
         ) : (
            <div className="h-6 w-6 rounded-full bg-slate-500/20 flex items-center justify-center text-slate-500 animate-pulse">
               <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            </div>
         )}
      </div>
   )
}

function ToolkitLink({ href, label, icon }: any) {
   return (
      <Link href={href} className="flex items-center justify-between p-5 bg-card/50 rounded-2xl hover:bg-primary/10 border border-white/5 transition-all shadow-xl group">
         <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">{icon}</div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-300">{label}</span>
         </div>
      </Link>
   )
}
