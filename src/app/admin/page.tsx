"use client"

import React, { useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Database, 
  Users, 
  ShieldCheck, 
  Zap, 
  Loader2, 
  Activity, 
  RefreshCw, 
  Target, 
  DollarSign, 
  CreditCard, 
  AlertCircle,
  ChevronRight,
  Gem
} from "lucide-react"
import Link from "next/link"
import { useCollection, useFirestore, useDoc } from "@/firebase"
import { collection, query, orderBy, limit, doc, where, getDocs, setDoc, serverTimestamp, DocumentData, getCountFromServer } from "firebase/firestore"
import { seedInitialData } from "@/services/seed-data"
import { useToast } from "@/hooks/use-toast"
import StudentAvatar from "@/components/brand/StudentAvatar"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * Admin Dashboard v22.1 (PWA Mode)
 * FIXED: Added missing Gem icon import to resolve ReferenceError.
 */

interface MetricCardProps {
  label: string;
  value: string | number;
  subLabel: string;
  icon: React.ReactNode;
  href: string;
  highlight?: boolean;
}

interface QuickLinkProps {
  label: string;
  href: string;
  highlight?: boolean;
}

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

        toast({ title: "Sync Complete", description: "All registry counters updated." });
     } catch (e: any) {
        toast({ variant: "destructive", title: "Sync Failed" });
     } finally {
        setIsStatsSyncing(false);
     }
  }

  const handlePushToRegistry = async () => {
    if (!db) return
    setIsSyncing(true)
    try {
      await seedInitialData(db)
      toast({ title: "Registry Rebuilt", description: "Database now matches the canonical tree." })
      await handleSyncLiveStats()
    } catch (e: any) {
      toast({ variant: "destructive", title: "Seeding Failed" })
    } finally {
      setIsSyncing(false)
    }
  }

  const hasPending = (pendingNodes?.length || 0) > 0;

  return (
    <div className="space-y-6 md:space-y-10 text-left">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-1">
           <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-100 shadow-sm shrink-0">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[9px] font-black uppercase text-emerald-600">Active Node</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Governance</span>
           </div>
          <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 text-[11px] md:text-lg font-medium">Coordinate preparation nodes and student session integrity.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
           <Button onClick={handleSyncLiveStats} disabled={isStatsSyncing} variant="outline" className="h-11 md:h-12 border-slate-200">
              {isStatsSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Sync Stats
           </Button>
           <Button onClick={handlePushToRegistry} disabled={isSyncing} className="h-11 md:h-12 bg-[#0F172A] hover:bg-black text-white shadow-xl">
              {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4 text-primary" />} Seed Registry
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
         <MetricCard 
           label="Gross Revenue" 
           value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} 
           subLabel="Verified Cashfree Flow" 
           icon={<DollarSign className="text-emerald-500" />} 
           href="/admin/payments"
         />
         <MetricCard 
           label="Active Passes" 
           value={stats?.activePasses || 0} 
           subLabel="Premium Aspirants" 
           icon={<Gem className="text-primary" />} 
           href="/admin/users"
         />
         <MetricCard 
           label="Audit Queue" 
           value={pendingNodes?.length || 0} 
           subLabel="Pending UPI Verifications" 
           icon={<AlertCircle className={cn("h-6 w-6", hasPending ? "text-rose-500 animate-pulse" : "text-slate-300")} />} 
           href="/admin/payments/verify"
           highlight={hasPending}
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
         <Card className="lg:col-span-8 border-none shadow-xl bg-white rounded-[2rem] overflow-hidden border border-slate-100">
            <CardHeader className="p-6 md:p-8 border-b border-slate-50 bg-slate-50/30">
               <CardTitle className="text-lg font-black text-[#0F172A] uppercase tracking-tight">Recent Registrations</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-4">
               {recentUsers?.map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all duration-300">
                     <div className="flex items-center gap-4 min-w-0">
                        <StudentAvatar profile={u} className="h-10 w-10 md:h-12 md:w-12 rounded-xl shrink-0 shadow-sm" />
                        <div className="min-w-0">
                           <p className="font-black text-sm md:text-lg text-[#0F172A] truncate leading-tight">{u.name}</p>
                           <p className="text-[9px] text-slate-400 font-bold uppercase truncate mt-0.5">{u.email}</p>
                        </div>
                     </div>
                     <Badge variant="outline" className="text-[7px] md:text-[9px] font-black uppercase border-slate-200 px-2.5 py-1 rounded-lg">
                        {u.pass?.active ? (u.pass.plan || 'ELITE') : 'FREE HUB'}
                     </Badge>
                  </div>
               ))}
               <Button asChild variant="ghost" className="w-full h-12 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary">
                  <Link href="/admin/users">Explore Full Student Hub <ChevronRight className="h-4 w-4 ml-1" /></Link>
               </Button>
            </CardContent>
         </Card>

         <div className="lg:col-span-4 space-y-6 md:space-y-8">
            <Card className="border-none shadow-2xl bg-[#0F172A] text-white p-6 md:p-10 rounded-[2.5rem] relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:scale-110 transition-transform"><ShieldCheck className="h-64 w-64" /></div>
               <div className="relative z-10 space-y-8">
                  <div className="space-y-1">
                     <h3 className="text-xl md:text-3xl font-black tracking-tight">Quick Tools</h3>
                     <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Operational Shortcuts</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                     <QuickLink label="Mock Builder" href="/admin/mocks/builder" />
                     <QuickLink label="Platform Analytics" href="/admin/analytics" />
                     <QuickLink label="Verify Payments" href="/admin/payments/verify" highlight={hasPending} />
                     <QuickLink label="Manage Folders" href="/admin/categories" />
                  </div>
               </div>
            </Card>
         </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, subLabel, icon, href, highlight }: MetricCardProps) {
  return (
    <Link href={href} className="block group">
      <Card className={cn(
        "border-none shadow-xl bg-white p-6 md:p-10 rounded-[2rem] transition-all duration-500",
        "group-hover:translate-y-[-4px] group-hover:shadow-2xl border border-slate-100",
        highlight && "ring-2 ring-rose-500/20 bg-rose-50/5"
      )}>
         <div className="flex items-center gap-4 md:gap-6">
            <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-50 shadow-inner shrink-0 group-hover:scale-110 transition-transform">
               {icon}
            </div>
            <div className="text-left min-w-0 flex-1">
               <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 truncate">{label}</p>
               <div className="text-xl md:text-4xl font-black text-[#0F172A] leading-none tracking-tighter truncate tabular-nums">{value}</div>
               <p className="text-[8px] font-bold text-slate-300 uppercase mt-2 truncate">{subLabel}</p>
            </div>
         </div>
      </Card>
    </Link>
  )
}

function QuickLink({ label, href, highlight }: QuickLinkProps) {
   return (
      <Link href={href} className="group">
         <div className={cn(
           "flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all active:scale-95",
           highlight && "border-rose-500/30 bg-rose-50/5"
         )}>
            <span className="text-[10px] font-black uppercase tracking-widest ml-2">{label}</span>
            <ChevronRight className={cn("h-4 w-4 transition-transform group-hover:translate-x-1", highlight ? "text-rose-50" : "text-primary")} />
         </div>
      </Link>
   )
}
