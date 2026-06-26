"use client"

import React, { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Database, 
  Users, 
  ShieldCheck, 
  Zap, 
  Loader2, 
  RefreshCw, 
  DollarSign, 
  AlertCircle,
  ChevronRight,
  Gem
} from "lucide-react"
import Link from "next/link"
import { useCollection, useFirestore, useDoc } from "@/firebase"
import { collection, query, orderBy, limit, doc, where, getDocs, setDoc, serverTimestamp, DocumentData, getCountFromServer, updateDoc, increment } from "firebase/firestore"
import { seedInitialData } from "@/services/seed-data"
import { useToast } from "@/hooks/use-toast"
import StudentAvatar from "@/components/brand/StudentAvatar"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * Admin Dashboard v27.0 (Typography Hardened)
 * UPDATED: Title Case normalization for all headers and strings.
 */

export default function AdminDashboard() {
  const db = useFirestore()
  const { toast } = useToast()
  const [isSyncing, setIsSyncing] = useState(false)
  const [isStatsSyncing, setIsStatsSyncing] = useState(false)

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats } = useDoc<any>(statsRef);

  const recentUsersQuery = useMemo(() => (db ? query(collection(db, "users"), orderBy("createdAt", "desc"), limit(5)) : null), [db]);
  const { data: recentUsers } = useCollection<any>(recentUsersQuery);

  const pendingReqQuery = useMemo(() => (db ? query(collection(db, "payment_requests"), where("status", "==", "PENDING"), limit(10)) : null), [db]);
  const { data: pendingNodes } = useCollection<any>(pendingReqQuery);

  const handleSyncLiveStats = async () => {
     if (!db) return;
     setIsStatsSyncing(true);
     try {
        const [qCount, mCount, uCount, rCount, eCount, nCount, pyqCount, pSnap] = await Promise.all([
           getCountFromServer(collection(db, "questions")),
           getCountFromServer(collection(db, "mocks")),
           getCountFromServer(collection(db, "users")),
           getCountFromServer(collection(db, "results")),
           getCountFromServer(collection(db, "exams")),
           getCountFromServer(collection(db, "notes")),
           getCountFromServer(collection(db, "pyqs")),
           getDocs(query(collection(db, "payment_requests"), where("status", "==", "APPROVED")))
        ]);

        const totalRev = pSnap.docs.reduce((acc: number, d: DocumentData) => acc + (Number(d.data().amount) || 0), 0);
        
        await setDoc(doc(db, "settings", "stats"), {
           totalQuestions: qCount.data().count,
           totalMocks: mCount.data().count,
           totalUsers: uCount.data().count,
           totalCategories: eCount.data().count,
           totalRevenue: totalRev,
           totalNotes: nCount.data().count,
           totalPYQs: pyqCount.data().count,
           totalAttempts: rCount.data().count,
           updatedAt: serverTimestamp()
        }, { merge: true });

        toast({ title: "Counters Synchronized" });
     } finally {
        setIsStatsSyncing(false);
     }
  }

  const handlePushToRegistry = async () => {
    if (!db) return
    setIsSyncing(true)
    try {
      await seedInitialData(db)
      toast({ title: "Registry Rebuilt" })
      await handleSyncLiveStats()
    } finally {
      setIsSyncing(false)
    }
  }

  const hasPending = (pendingNodes?.length || 0) > 0;

  return (
    <div className="space-y-6 md:space-y-10 text-left animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[9px] font-black text-emerald-600 tracking-tight">Governance Active</span>
              </div>
           </div>
          <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-none">Admin Hub</h1>
          <p className="text-slate-500 text-[11px] md:text-lg font-medium">Coordinate preparation nodes and session integrity.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto shrink-0">
           <button onClick={handleSyncLiveStats} disabled={isStatsSyncing} className="flex-1 sm:flex-none h-11 px-6 rounded-full border border-slate-200 font-black text-[10px] tracking-widest text-[#0F172A] hover:bg-slate-50 transition-all">
              {isStatsSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Sync
           </button>
           <Button onClick={handlePushToRegistry} disabled={isSyncing} className="flex-1 sm:flex-none h-11 px-8 bg-primary hover:bg-blue-700 text-white shadow-xl rounded-full border-none font-black text-[10px] tracking-widest">
              {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />} Seed
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
         <AdminMetricCard label="Gross Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} sub="Verified Flow" icon={<DollarSign className="text-emerald-500" />} href="/admin/payments" />
         <AdminMetricCard label="Active Passes" value={stats?.activePasses || 0} sub="Elite Aspirants" icon={<Gem className="text-primary" />} href="/admin/users" />
         <AdminMetricCard label="Audit Queue" value={pendingNodes?.length || 0} sub="Pending UPI" icon={<AlertCircle className={cn(hasPending ? "text-rose-500 animate-pulse" : "text-slate-300")} />} href="/admin/payments/verify" highlight={hasPending} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
         <Card className="lg:col-span-8 border-none shadow-xl bg-white rounded-2xl md:rounded-[2.5rem] overflow-hidden border border-slate-50">
            <CardHeader className="p-5 md:p-8 border-b border-slate-50 bg-slate-50/30">
               <CardTitle className="text-sm md:text-xl font-black text-[#0F172A] tracking-tight">Recent Registrations</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-8 space-y-3">
               {recentUsers?.map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between p-3 md:p-5 bg-slate-50/50 rounded-xl md:rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all duration-300">
                     <div className="flex items-center gap-3 md:gap-5 min-w-0">
                        <StudentAvatar profile={u} className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-slate-100" />
                        <div className="min-w-0 text-left">
                           <p className="font-bold text-sm md:text-lg text-[#0F172A] truncate leading-tight">{u.name}</p>
                           <p className="text-[9px] text-slate-400 font-bold mt-1 truncate lowercase">{u.email}</p>
                        </div>
                     </div>
                     <Badge variant="outline" className="text-[7px] md:text-[8px] font-black uppercase border-slate-200 px-2 py-0.5 rounded shadow-sm">
                        {u.pass?.active ? (u.pass.plan || 'Elite') : 'Free Hub'}
                     </Badge>
                  </div>
               ))}
               <Button asChild variant="ghost" className="w-full h-11 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary">
                  <Link href="/admin/users">Open Student Hub <ChevronRight className="h-3 w-3 md:h-4 md:w-4 ml-1" /></Link>
               </Button>
            </CardContent>
         </Card>

         <div className="lg:col-span-4 space-y-6 md:space-y-8">
            <Card className="border-none shadow-xl bg-[#0F172A] text-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform"><ShieldCheck className="h-44 w-44 md:h-64 md:w-64" /></div>
               <div className="relative z-10 space-y-6 md:space-y-8 text-left">
                  <div className="space-y-1">
                     <h3 className="text-xl md:text-2xl font-black tracking-tight">Quick Tools</h3>
                     <p className="text-[8px] md:text-[9px] font-black text-slate-500 tracking-widest">Operational Shortcuts</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 md:gap-3">
                     <AdminQuickLink label="Mock Builder" href="/admin/mocks/builder" />
                     <AdminQuickLink label="Platform Stats" href="/admin/analytics" />
                     <AdminQuickLink label="Verify Payments" href="/admin/payments/verify" highlight={hasPending} />
                     <AdminQuickLink label="System Tools" href="/admin/maintenance" />
                  </div>
               </div>
            </Card>
         </div>
      </div>
    </div>
  )
}

function AdminMetricCard({ label, value, sub, icon, href, highlight }: any) {
  return (
    <Link href={href} className="block group">
      <Card className={cn(
        "border-none shadow-xl bg-white p-5 md:p-8 rounded-2xl md:rounded-[2rem] transition-all duration-500 text-left",
        "group-hover:translate-y-[-4px] border border-slate-50",
        highlight && "ring-2 ring-rose-500/20 bg-rose-50/5"
      )}>
         <div className="flex items-center gap-4 md:gap-6">
            <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-50 shadow-inner shrink-0 group-hover:scale-110 transition-transform">
               {icon}
            </div>
            <div className="min-w-0 flex-1">
               <p className="text-[8px] md:text-[9px] font-black text-slate-400 mb-1 truncate tracking-tight">{label}</p>
               <div className="text-lg md:text-3xl font-black text-[#0F172A] leading-none tabular-nums truncate">{value}</div>
               <p className="text-[7px] md:text-[8px] font-bold text-slate-300 uppercase mt-2 truncate">{sub}</p>
            </div>
         </div>
      </Card>
    </Link>
  )
}

function AdminQuickLink({ label, href, highlight }: any) {
   return (
      <Link href={href} className="group">
         <div className={cn(
           "flex items-center justify-between p-3 md:p-4 bg-white/5 border border-white/5 rounded-xl md:rounded-2xl hover:bg-white/10 transition-all active:scale-95",
           highlight && "border-rose-500/30 bg-rose-50/5"
         )}>
            <span className="text-[9px] md:text-[10px] font-black tracking-widest ml-1 md:ml-2">{label}</span>
            <ChevronRight className={cn("h-3 w-3 md:h-4 md:w-4 transition-transform group-hover:translate-x-1", highlight ? "text-rose-50" : "text-primary")} />
         </div>
      </Link>
   )
}
