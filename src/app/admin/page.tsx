
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Database, Users, ShieldCheck, Rocket, Zap, Activity, ShieldAlert, Scale, Megaphone, ClipboardList, TrendingUp, DollarSign, BarChart3, HeartPulse, Target, CheckCircle2, RefreshCw, Layers, CreditCard } from "lucide-react"
import Link from "next/link"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, orderBy, limit } from "firebase/firestore"
import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { seedInitialData } from "@/services/seed-data"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"

/**
 * @fileOverview Final Command Center (Phase 156).
 * Features: High-fidelity revenue monitoring and plan distribution nodes.
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

  const proUsers = useMemo(() => users?.filter((u: any) => u.status && u.status !== 'Free') || [], [users]);

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

  return (
    <div className="space-y-12 pb-20 pt-4 text-[#0F172A]">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="text-left">
           <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Institutional Governance Hub</span>
           </div>
          <h1 className="text-5xl font-headline font-black text-[#0F172A] uppercase tracking-tight">Command Center</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">System Audit: {questions?.length || 0} Questions Live. Database in Monetization Mode.</p>
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
         <StatCard label="Aspirant Nodes" value={users?.length || 0} icon={<Users className="text-blue-500" />} />
         <StatCard label="Pro Subscribers" value={proUsers.length} icon={<CreditCard className="text-emerald-600" />} color="text-emerald-600" />
         <StatCard label="Attempts Logged" value={results?.length || 0} icon={<Activity className="text-primary" />} />
         <StatCard label="Audit Flags" value={reports?.filter((r:any) => r.status === 'PENDING').length || 0} icon={<ShieldAlert className="text-rose-500" />} color="text-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
         <div className="lg:col-span-8 space-y-10">
            <Card className="border-slate-100 shadow-3xl bg-white rounded-[3.5rem] overflow-hidden">
               <CardHeader className="p-12 border-b border-slate-50 bg-slate-50/50 text-left">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <DollarSign className="h-6 w-6" />
                     </div>
                     <div className="text-left">
                        <CardTitle className="text-2xl font-headline font-black uppercase text-[#0F172A]">Revenue Engine</CardTitle>
                        <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">Institutional monetization and subscriber metrics.</CardDescription>
                     </div>
                  </div>
               </CardHeader>
               <CardContent className="p-12 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6 shadow-inner text-left">
                        <div className="space-y-1 text-left">
                           <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Projected Growth</p>
                           <h4 className="text-xl font-headline font-black text-[#0F172A] uppercase">Active Pass Volume</h4>
                        </div>
                        <div className="space-y-4 pt-2">
                           <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-400">Silver Passes</span>
                              <span className="font-black text-blue-500">{proUsers.filter((u:any) => u.status === 'Silver').length}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-400">Gold Passes</span>
                              <span className="font-black text-amber-500">{proUsers.filter((u:any) => u.status === 'Gold').length}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-400">Elite Passes</span>
                              <span className="font-black text-primary">{proUsers.filter((u:any) => u.status === 'Premium').length}</span>
                           </div>
                        </div>
                     </div>

                     <div className="p-8 bg-[#0F172A] rounded-[2.5rem] shadow-2xl space-y-6 flex flex-col justify-center text-left">
                        <div className="space-y-1 text-left">
                           <p className="text-[10px] font-black uppercase text-primary tracking-widest">Platform Lifetime</p>
                           <h4 className="text-3xl font-headline font-black text-white uppercase">Gross Nodes</h4>
                        </div>
                        <p className="text-5xl font-black text-primary leading-none tracking-tighter">₹{proUsers.length * 199}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Aggregated simulation via Gold Baseline</p>
                     </div>
                  </div>
               </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-3xl bg-white rounded-[3.5rem] overflow-hidden">
               <CardHeader className="p-12 border-b border-slate-50 bg-slate-50/50 text-left">
                  <div className="flex items-center gap-4">
                     <Target className="h-6 w-6 text-primary" />
                     <CardTitle className="text-2xl font-headline font-black uppercase text-[#0F172A]">Beta Launch Readiness</CardTitle>
                  </div>
               </CardHeader>
               <CardContent className="p-12 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <LaunchMetric label="Pro Nodes (Conversion)" current={proUsers.length} target={100} />
                     <LaunchMetric label="Institutional MCQs" current={questions?.length || 0} target={10000} />
                  </div>
               </CardContent>
            </Card>
         </div>

         <div className="lg:col-span-4 space-y-10 text-left">
            <Card className="border-slate-100 bg-white rounded-[3.5rem] p-12 space-y-10 shadow-3xl text-left">
               <div className="space-y-2 text-left">
                  <h3 className="text-2xl font-headline font-black text-[#0F172A] uppercase flex items-center gap-4 text-left">
                     <TrendingUp className="h-6 w-6 text-emerald-600" /> Conversion
                  </h3>
               </div>
               <div className="space-y-6">
                  <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 shadow-inner text-left">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-slate-500">Status</span>
                        <Badge className="bg-emerald-600 text-white border-none text-[9px] font-black">STABLE</Badge>
                     </div>
                     <p className="text-4xl font-headline font-black text-[#0F172A] text-left">{Math.round((proUsers.length / (users?.length || 1)) * 100)}%</p>
                     <p className="text-xs text-slate-500 font-medium text-left leading-relaxed">Free-to-Pro institutional conversion rate.</p>
                  </div>
               </div>
            </Card>

            <Card className="border-primary/20 bg-primary/5 rounded-[3.5rem] p-12 space-y-6 border shadow-xl text-left">
               <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Layers className="h-8 w-8" />
               </div>
               <h4 className="text-2xl font-headline font-black text-[#0F172A] uppercase leading-tight text-left">Monetization Active</h4>
               <p className="text-slate-600 text-sm font-medium leading-relaxed text-left">
                  The Pass System is now live in the architectural node. Users can select plans at /pass.
               </p>
               <Button asChild className="w-full bg-primary hover:bg-primary/90 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">
                  <Link href="/pass">Audit Pricing Hub</Link>
               </Button>
            </Card>
         </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }: any) {
   const isLongValue = typeof value === 'string' && value.length > 8;
   
   return (
      <Card className="border-slate-100 shadow-xl bg-white p-8 rounded-[3rem] group hover:translate-y-[-4px] transition-all overflow-hidden text-left">
         <div className="flex items-center gap-4 text-left">
            <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0 shadow-inner">
               {icon}
            </div>
            <div className="min-w-0 text-left">
               <p className={`font-headline font-black tracking-tighter truncate text-left ${isLongValue ? 'text-2xl' : 'text-4xl'} ${color || 'text-[#0F172A]'}`}>
                 {value}
               </p>
               <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1 truncate text-left">{label}</p>
            </div>
         </div>
      </Card>
   )
}

function LaunchMetric({ label, current, target }: { label: string, current: number, target: number }) {
   const perc = Math.min(100, Math.round((current / target) * 100));
   return (
      <div className="space-y-4 text-left">
         <div className="flex justify-between items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
            <span className="text-[10px] font-black text-primary">{current} / {target} ({perc}%)</span>
         </div>
         <Progress value={perc} className="h-1.5 bg-slate-100" />
      </div>
   )
}
