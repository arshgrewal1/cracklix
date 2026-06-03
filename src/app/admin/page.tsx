
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Database, Users, ShieldCheck, Rocket, Zap, Activity, ShieldAlert, Scale, Megaphone, ClipboardList, TrendingUp, DollarSign, BarChart3, HeartPulse, Target, CheckCircle2, RefreshCw, Layers } from "lucide-react"
import Link from "next/link"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, orderBy, limit } from "firebase/firestore"
import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { seedInitialData } from "@/services/seed-data"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"

/**
 * @fileOverview Phase 131/155: Founder's Command Center.
 * Includes Database Engine controls for pushing collection hierarchies.
 */

export default function AdminDashboard() {
  const db = useFirestore()
  const { user, profile } = useUser()
  const { toast } = useToast()
  const [isSyncing, setIsSyncing] = useState(false)

  const { data: users } = useCollection<any>(useMemo(() => (db ? collection(db, "users") : null), [db]))
  const { data: questions } = useCollection<any>(useMemo(() => (db ? collection(db, "questions") : null), [db]))
  const { data: mocks } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]))
  const { data: reports } = useCollection<any>(useMemo(() => (db ? collection(db, "reports") : null), [db]))
  const { data: results } = useCollection<any>(useMemo(() => (db ? collection(db, "results") : null), [db]))

  const isFounder = user?.email === 'arshdeepgrewal1122@gmail.com';
  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || isFounder;

  const handleSyncDatabase = async () => {
    if (!db) return
    setIsSyncing(true)
    try {
      await seedInitialData(db)
      toast({
        title: "Repository Synced",
        description: "Official Punjab Exam hierarchy (Boards, Exams, Subjects) pushed to Firestore.",
      })
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: e.message || "Failed to push collection hierarchy.",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const avgProgress = useMemo(() => {
    const goals = [
      (users?.length || 0) / 1000 * 100,
      (questions?.length || 0) / 10000 * 100,
      (mocks?.length || 0) / 500 * 100,
    ];
    return Math.round(goals.reduce((a, b) => a + b, 0) / goals.length);
  }, [users, questions, mocks]);

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Institutional Governance Hub</span>
           </div>
          <h1 className="text-5xl font-headline font-black text-primary uppercase tracking-tight">Command Center</h1>
          <p className="text-muted-foreground mt-2 text-lg">System Audit: {questions?.length || 0} Questions Live. Database in Dev Mode.</p>
        </div>
        <div className="flex gap-4">
           {isAdmin && (
             <Button 
              onClick={handleSyncDatabase} 
              disabled={isSyncing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black h-14 px-8 text-xs uppercase tracking-widest gap-3 shadow-xl transition-all active:scale-95"
             >
               {isSyncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
               {isSyncing ? "Syncing Repo..." : "Global Repo Sync"}
             </Button>
           )}
           <Button asChild className="bg-primary hover:bg-primary/90 rounded-2xl h-14 px-10 font-black shadow-2xl uppercase tracking-widest text-xs">
            <Link href="/admin/mocks/builder"><Plus className="mr-3 h-5 w-5" /> Assemble Mock</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         <StatCard label="Aspirant Nodes" value={users?.length || 0} icon={<Users className="text-blue-400" />} />
         <StatCard label="Database Status" value="Connected" icon={<Database className="text-emerald-500" />} color="text-emerald-500" />
         <StatCard label="Attempts Logged" value={results?.length || 0} icon={<Activity className="text-primary" />} />
         <StatCard label="Audit Flags" value={reports?.filter((r:any) => r.status === 'PENDING').length || 0} icon={<ShieldAlert className="text-rose-500" />} color="text-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
         <div className="lg:col-span-8 space-y-10">
            {/* Database Engine Card */}
            <Card className="border-none shadow-3xl bg-card/50 rounded-[3.5rem] overflow-hidden">
               <CardHeader className="p-12 border-b border-white/5 bg-primary/5">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                        <Database className="h-6 w-6" />
                     </div>
                     <div>
                        <CardTitle className="text-2xl font-headline font-black uppercase">Database Engine</CardTitle>
                        <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">Manage collection hierarchy and initial data seeding.</CardDescription>
                     </div>
                  </div>
               </CardHeader>
               <CardContent className="p-12 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-6">
                        <div className="space-y-1">
                           <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Seeding Protocol</p>
                           <h4 className="text-xl font-headline font-black text-white uppercase">Push Collections</h4>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                           Sync Boards, Exams, and Subjects to Firestore. Use this to reset or initialize the system architecture.
                        </p>
                        <Button 
                           onClick={handleSyncDatabase} 
                           disabled={isSyncing}
                           variant="outline" 
                           className="w-full h-12 rounded-xl border-white/10 font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 hover:text-white transition-all"
                        >
                           {isSyncing ? "Processing..." : "Trigger Full Sync"}
                        </Button>
                     </div>

                     <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-6">
                        <div className="space-y-1">
                           <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Metadata Audit</p>
                           <h4 className="text-xl font-headline font-black text-white uppercase">Hierarchy Status</h4>
                        </div>
                        <div className="space-y-3">
                           <ProgressRow label="Recruitment Boards" perc={100} status="Verified" />
                           <ProgressRow label="Exam Verticals" perc={100} status="Verified" />
                           <ProgressRow label="Subject Matrix" perc={100} status="Verified" />
                        </div>
                     </div>
                  </div>
               </CardContent>
            </Card>

            {/* Launch Criteria */}
            <Card className="border-none shadow-3xl bg-[#0F172A] text-white rounded-[3.5rem] overflow-hidden">
               <CardHeader className="p-12 border-b border-white/5">
                  <div className="flex items-center gap-4">
                     <Target className="h-6 w-6 text-primary" />
                     <CardTitle className="text-2xl font-headline font-black uppercase">Launch Readiness ({avgProgress}%)</CardTitle>
                  </div>
               </CardHeader>
               <CardContent className="p-12 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <LaunchMetric label="Aspirant Nodes" current={users?.length || 0} target={1000} />
                     <LaunchMetric label="Institutional MCQs" current={questions?.length || 0} target={10000} />
                     <LaunchMetric label="High-Fidelity Mocks" current={mocks?.length || 0} target={500} />
                     <LaunchMetric label="Audit Attempts" current={results?.length || 0} target={5000} />
                  </div>
               </CardContent>
            </Card>
         </div>

         <div className="lg:col-span-4 space-y-10">
            <Card className="border-none bg-[#0F172A] rounded-[3.5rem] p-12 space-y-10 shadow-4xl border border-white/5">
               <div className="space-y-2">
                  <h3 className="text-2xl font-headline font-black text-white uppercase flex items-center gap-4">
                     <DollarSign className="h-6 w-6 text-emerald-500" /> Revenue Node
                  </h3>
               </div>
               <div className="space-y-6">
                  <div className="p-8 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-slate-400">Scale Mode</span>
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] font-black">ACTIVE</Badge>
                     </div>
                     <p className="text-4xl font-headline font-black text-white">Free Beta</p>
                     <p className="text-xs text-slate-500 font-medium">Platform-wide subscription gateways are currently bypassed for testing.</p>
                  </div>
               </div>
            </Card>

            <Card className="border-none bg-primary/5 rounded-[3.5rem] p-12 space-y-6 border border-primary/10">
               <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Layers className="h-8 w-8" />
               </div>
               <h4 className="text-2xl font-headline font-black text-white uppercase leading-tight">Fast-Track Assembly</h4>
               <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  Use the Smart Assembler to generate mocks instantly from the existing question bank metadata.
               </p>
               <Button asChild className="w-full bg-primary hover:bg-primary/90 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">
                  <Link href="/admin/mocks/builder">Launch Assembler</Link>
               </Button>
            </Card>
         </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }: any) {
   return (
      <Card className="border-none shadow-2xl bg-card/50 p-10 rounded-[3rem] group hover:translate-y-[-4px] transition-all">
         <div className="flex items-center gap-6">
            <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
               {icon}
            </div>
            <div>
               <p className={`text-4xl font-headline font-black tracking-tighter ${color || 'text-white'}`}>{value}</p>
               <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">{label}</p>
            </div>
         </div>
      </Card>
   )
}

function ProgressRow({ label, perc, status }: { label: string, perc: number, status?: string }) {
   return (
      <div className="space-y-2">
         <div className="flex justify-between items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
            <span className="text-[9px] font-black text-emerald-500">{status || `${perc}%`}</span>
         </div>
         <Progress value={perc} className="h-1 bg-white/5" />
      </div>
   )
}

function LaunchMetric({ label, current, target }: { label: string, current: number, target: number }) {
   const perc = Math.min(100, Math.round((current / target) * 100));
   return (
      <div className="space-y-4">
         <div className="flex justify-between items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
            <span className="text-[10px] font-black text-primary">{current} / {target} ({perc}%)</span>
         </div>
         <Progress value={perc} className="h-1.5 bg-white/5" />
      </div>
   )
}
