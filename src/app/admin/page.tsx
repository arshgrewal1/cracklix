
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Database, Users, ShieldCheck, Rocket, Zap, Activity, ShieldAlert, Megaphone, ClipboardList, TrendingUp, DollarSign, RefreshCw, Layers, CreditCard, Globe, Newspaper, FileText, Gem, SearchCode, Settings, Target, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where } from "firebase/firestore"
import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { seedInitialData } from "@/services/seed-data"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"

/**
 * @fileOverview Final Command Center v6.8.
 * Features: High-Fidelity Real-time Counts per Vertical & Total Registry Audit.
 */

export default function AdminDashboard() {
  const db = useFirestore()
  const { user, profile } = useUser()
  const { toast } = useToast()
  const [isSyncing, setIsSyncing] = useState(false)

  // Real-time Collections - Global count for accurate recovery reporting
  const { data: users } = useCollection<any>(useMemo(() => (db ? collection(db, "users") : null), [db]))
  const { data: questions } = useCollection<any>(useMemo(() => (db ? collection(db, "questions") : null), [db]))
  const { data: mocks } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]))
  const { data: reports } = useCollection<any>(useMemo(() => (db ? collection(db, "reports") : null), [db]))
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))
  const { data: notes } = useCollection<any>(useMemo(() => (db ? collection(db, "notes") : null), [db]))
  const { data: pyqs } = useCollection<any>(useMemo(() => (db ? collection(db, "pyqs") : null), [db]))

  const proUsers = useMemo(() => users?.filter((u: any) => u.status && u.status !== 'Free') || [], [users]);

  // Exam-wise Content Matrix (Hardened for Sectional Counts)
  const examBreakdown = useMemo(() => {
    if (!exams || !questions) return [];
    return exams.map(e => ({
      id: e.id,
      name: e.name,
      mockCount: mocks?.filter((m: any) => m.examId === e.id).length || 0,
      questionCount: questions.filter((q: any) => q.examId === e.id || q.boardId === e.boardId).length,
    })).sort((a, b) => b.questionCount - a.questionCount);
  }, [exams, mocks, questions]);

  const handleSyncDatabase = async () => {
    if (!db) return
    setIsSyncing(true)
    try {
      await seedInitialData(db)
      toast({ title: "Repository Synced", description: "Official Punjab Exam hierarchy pushed to Firestore." })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: e.message })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-12 pb-20 pt-4 text-[#0F172A] text-left">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="text-left">
           <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Live Content Overview</span>
           </div>
          <h1 className="text-5xl font-headline font-black text-[#0F172A] uppercase tracking-tight">Command Center</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Audit: {questions?.length || 0} Questions Locked • {mocks?.filter((m: any) => m.published).length || 0} Live Mocks.</p>
        </div>
        <div className="flex gap-4">
           <Button onClick={handleSyncDatabase} disabled={isSyncing} variant="outline" className="h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest gap-3 border-slate-200 bg-white">
              {isSyncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />} Repo Sync
           </Button>
           <Button asChild className="bg-primary hover:bg-primary/90 rounded-2xl h-14 px-10 font-black shadow-2xl uppercase tracking-widest text-xs">
            <Link href="/admin/mocks/builder"><Plus className="mr-3 h-5 w-5" /> Assemble Mock</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
         <StatCard label="Live Mocks" value={mocks?.filter((m: any) => m.published).length || 0} icon={<Zap className="text-primary" />} />
         <StatCard label="Total Bank" value={questions?.length || 0} icon={<Database className="text-blue-500" />} />
         <StatCard label="Pro Aspirants" value={proUsers.length} icon={<Users className="text-emerald-500" />} />
         <StatCard label="Audit Archives" value={pyqs?.length || 0} icon={<FileText className="text-orange-500" />} />
         <StatCard label="Study Notes" value={notes?.length || 0} icon={<Newspaper className="text-rose-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
         <Card className="lg:col-span-8 border-none shadow-3xl bg-white rounded-[3.5rem] overflow-hidden text-left">
            <CardHeader className="p-12 border-b border-slate-50 bg-slate-50/30">
               <div className="flex items-center justify-between">
                  <div className="text-left">
                     <CardTitle className="text-2xl font-headline font-black uppercase text-[#0F172A]">Vertical Breakdown</CardTitle>
                     <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">Question density across recruitment hubs.</CardDescription>
                  </div>
                  <Button variant="ghost" asChild className="text-primary font-black uppercase text-[10px] tracking-widest">
                     <Link href="/admin/questions">Registry Bank <ChevronRight className="h-3 w-3 ml-2" /></Link>
                  </Button>
               </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto custom-scrollbar">
                  {examBreakdown.map((e) => (
                     <div key={e.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-6">
                           <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 uppercase text-xs">
                              {e.name[0]}
                           </div>
                           <div>
                              <p className="font-black text-[#0B1528] text-lg uppercase leading-none">{e.name}</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">
                                {e.questionCount} Questions Locked • {e.mockCount} Series
                              </p>
                           </div>
                        </div>
                        <div className="flex items-center gap-8 text-right">
                           <div className="space-y-1">
                              <p className="text-2xl font-headline font-black text-[#0B1528]">{e.questionCount}</p>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Node Count</p>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>

         <div className="lg:col-span-4 space-y-10">
            <Card className="border-none bg-[#0F172A] text-white shadow-3xl rounded-[3.5rem] p-12 overflow-hidden relative group">
               <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform"><ShieldCheck className="h-48 w-48" /></div>
               <div className="relative z-10 space-y-8 text-left">
                  <div className="space-y-2">
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">System Integrity</p>
                     <h3 className="text-3xl font-headline font-black uppercase">Content Audit</h3>
                  </div>
                  <div className="space-y-6">
                     <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400 font-bold">Pending Reports</span>
                        <span className="text-rose-500 font-black">{reports?.filter((r: any) => r.status === 'PENDING').length || 0}</span>
                     </div>
                     <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400 font-bold">Registry Volume</span>
                        <span className="text-emerald-500 font-black">{questions?.length || 0} Nodes</span>
                     </div>
                  </div>
                  <Button asChild className="w-full bg-primary hover:bg-orange-600 text-white font-black uppercase h-14 rounded-2xl text-[10px] tracking-widest shadow-2xl">
                     <Link href="/admin/questions">Browse Atomic Bank</Link>
                  </Button>
               </div>
            </Card>

            <Card className="border-slate-100 bg-white shadow-2xl rounded-[3rem] p-10 space-y-6 text-left">
               <h4 className="font-headline font-black text-xs uppercase tracking-[0.3em] text-slate-400">Growth Hub</h4>
               <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-slate-500">Active Aspirants</p>
                  <p className="text-5xl font-headline font-black text-[#0B1528] tracking-tighter">{users?.length || 0}</p>
               </div>
               <div className="flex items-center gap-3 text-emerald-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Real-time Node</span>
               </div>
            </Card>
         </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: any) {
   return (
      <Card className="border-none shadow-xl bg-white p-6 rounded-[2.5rem] group hover:translate-y-[-4px] transition-all text-left">
         <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
               {icon}
            </div>
            <div className="min-w-0">
               <p className="text-2xl font-headline font-black text-[#0F172A] leading-none">{value}</p>
               <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1 truncate">{label}</p>
            </div>
         </div>
      </Card>
   )
}
