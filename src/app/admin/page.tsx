
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
  Clock, 
  ChevronRight, 
  RefreshCw, 
  Target, 
  DollarSign, 
  CreditCard, 
  AlertCircle 
} from "lucide-react"
import Link from "next/link"
import { useCollection, useFirestore, useDoc } from "@/firebase"
import { collection, query, orderBy, limit, doc, where, getDocs, setDoc, serverTimestamp } from "firebase/firestore"
import { seedInitialData } from "@/services/seed-data"
import { useToast } from "@/hooks/use-toast"
import StudentAvatar from "@/components/brand/StudentAvatar"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Command Center v39.0.
 * UPDATED: Added totalBoards to master statistics synchronization.
 */

export default function AdminDashboard() {
  const db = useFirestore()
  const { toast } = useToast()
  const [isSyncing, setIsSyncing] = useState(false)
  const [isStatsSyncing, setIsStatsSyncing] = useState(false)

  // STABILIZED DATA LISTENERS
  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats } = useDoc<any>(statsRef);

  const { data: allUsers } = useCollection<any>(useMemo(() => (db ? collection(db, "users") : null), [db]));
  const { data: pendingRequests } = useCollection<any>(useMemo(() => (db ? query(collection(db, "payment_requests"), where("status", "==", "PENDING")) : null), [db]));
  const { data: approvedRequests } = useCollection<any>(useMemo(() => (db ? query(collection(db, "payment_requests"), where("status", "==", "APPROVED")) : null), [db]));

  const recentUsersQuery = useMemo(() => (db ? query(collection(db, "users"), orderBy("createdAt", "desc"), limit(5)) : null), [db]);
  const { data: recentUsers } = useCollection<any>(recentUsersQuery);

  const recentResultsQuery = useMemo(() => (db ? query(collection(db, "results"), orderBy("timestamp", "desc"), limit(5)) : null), [db]);
  const { data: recentResults } = useCollection<any>(recentResultsQuery);

  // AUTO-SYNC ON MOUNT
  useEffect(() => {
    if (db) {
       handleSyncLiveStats(true);
    }
  }, [db]);

  const finance = useMemo(() => {
    const totalRev = approvedRequests?.reduce((acc, r) => acc + (r.amount || 0), 0) || 0;
    const activePasses = allUsers?.filter((u: any) => u.pass?.active === true).length || 0;
    return {
      totalRevenue: totalRev,
      pendingCount: pendingRequests?.length || 0,
      activePasses
    };
  }, [allUsers, pendingRequests, approvedRequests]);

  const handleSyncLiveStats = async (silent = false) => {
     if (!db) return;
     if (!silent) setIsStatsSyncing(true);
     try {
        const [qSnap, mSnap, uSnap, rSnap, bSnap] = await Promise.all([
           getDocs(collection(db, "questions")),
           getDocs(collection(db, "mocks")),
           getDocs(collection(db, "users")),
           getDocs(collection(db, "results")),
           getDocs(collection(db, "boards"))
        ]);

        const totalResults = rSnap.docs.length;
        const avgAcc = totalResults > 0 
           ? Math.round(rSnap.docs.reduce((acc, d) => acc + (Number(d.data().accuracy) || 0), 0) / totalResults)
           : 94;

        await setDoc(doc(db, "settings", "stats"), {
           totalQuestions: qSnap.size,
           totalMocks: mSnap.size,
           totalUsers: uSnap.size,
           totalBoards: bSnap.size,
           averageAccuracy: avgAcc,
           updatedAt: serverTimestamp()
        }, { merge: true });

        if (!silent) {
           toast({ 
             title: "Registry Audited", 
             description: `Synced: ${qSnap.size} MCQs, ${bSnap.size} Hubs, ${uSnap.size} Students.` 
           });
        }
     } catch (e) {
        if (!silent) toast({ variant: "destructive", title: "Sync Failed" });
     } finally {
        if (!silent) setIsStatsSyncing(false);
     }
  }

  const handlePushToRegistry = async () => {
    if (!db) return
    setIsSyncing(true)
    try {
      await seedInitialData(db)
      await handleSyncLiveStats(true)
      toast({ title: "Registry Synced", description: "Official Punjab Exam nodes updated." })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed" })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-6 md:space-y-12 pb-20 text-[#0F172A] text-left pt-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 md:gap-8 px-2 md:px-4">
        <div className="min-w-0 flex-1">
           <div className="flex items-center gap-3 mb-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 shrink-0">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[8px] md:text-[9px] font-black uppercase text-emerald-600 tracking-widest">System Online</span>
              </div>
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 truncate">Registry Command Hub</span>
           </div>
          <h1 className="text-3xl md:text-5xl font-headline font-black text-[#0F172A] uppercase tracking-tight leading-tight truncate">Admin Center</h1>
          <p className="text-slate-500 mt-1 md:text-2xl text-sm font-medium">Monitoring Preparation Nodes & Financial Distribution.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
           <Button onClick={() => handleSyncLiveStats()} disabled={isStatsSyncing} className="h-12 md:h-14 bg-primary hover:bg-orange-600 text-white rounded-xl md:rounded-2xl font-black shadow-xl uppercase tracking-widest text-xs px-8">
              {isStatsSyncing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />} Sync Master Stats
           </Button>
           <Button onClick={handlePushToRegistry} disabled={isSyncing} className="h-12 md:h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl md:rounded-2xl font-black shadow-xl uppercase tracking-widest text-xs px-8">
              {isSyncing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />} Seed Data
           </Button>
        </div>
      </div>

      {/* FINANCIAL PULSE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 px-2 md:px-4">
         <MetricCard 
           label="Gross Collection" 
           value={`₹${finance.totalRevenue.toLocaleString()}`} 
           subLabel="Verified Transactions" 
           icon={<DollarSign className="text-emerald-500" />} 
           href="/admin/payments"
         />
         <MetricCard 
           label="Active Pass Holders" 
           value={finance.activePasses} 
           subLabel="Premium Students" 
           icon={<CreditCard className="text-primary" />} 
           href="/admin/users"
         />
         <MetricCard 
           label="Pending Approvals" 
           value={finance.pendingCount} 
           subLabel="M-Payment Queue" 
           icon={<AlertCircle className={cn("h-6 w-6", finance.pendingCount > 0 ? "text-rose-500 animate-pulse" : "text-slate-300")} />} 
           href="/admin/payments/verify"
           highlight={finance.pendingCount > 0}
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-2 md:px-4">
         <Card className="lg:col-span-8 border-none shadow-3xl bg-white rounded-3xl overflow-hidden text-left border border-slate-100">
            <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/30">
               <CardTitle className="text-2xl font-headline font-black uppercase text-[#0F172A]">Audit Stream</CardTitle>
               <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live operational activity across the hub.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Users className="h-4 w-4" /> Latest Student Registrations</h4>
                  <div className="grid grid-cols-1 gap-3">
                     {recentUsers?.map((u: any) => (
                        <div key={u.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                           <div className="flex items-center gap-4">
                              <StudentAvatar profile={u} className="h-10 w-10 rounded-xl" />
                              <div>
                                 <p className="font-bold text-sm text-[#0F172A] uppercase">{u.name}</p>
                                 <p className="text-[9px] text-slate-400 font-bold uppercase">{u.email}</p>
                              </div>
                           </div>
                           <Badge variant="outline" className="text-[8px] font-black uppercase border-slate-200">
                              {u.pass?.active ? (u.pass.plan || 'ELITE') : 'FREE NODE'}
                           </Badge>
                        </div>
                     ))}
                  </div>
               </div>
               
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Activity className="h-4 w-4" /> Recent CBT Attempts</h4>
                  <div className="grid grid-cols-1 gap-3">
                     {recentResults?.map((r: any) => (
                        <div key={r.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                           <div className="flex items-center gap-4">
                              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><Zap className="h-5 w-5" /></div>
                              <div>
                                 <p className="font-bold text-sm text-[#0F172A] uppercase truncate max-w-[200px]">{r.mockTitle}</p>
                                 <p className="text-[9px] text-slate-400 font-bold uppercase">{r.userName} • Score: {r.score}</p>
                              </div>
                           </div>
                           <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px]">{r.accuracy}%</Badge>
                        </div>
                     ))}
                  </div>
               </div>
            </CardContent>
         </Card>

         <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-3xl bg-[#0F172A] text-white p-10 rounded-[3rem] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><ShieldCheck className="h-64 w-64" /></div>
               <div className="relative z-10 space-y-10">
                  <div className="space-y-2 text-left">
                     <h3 className="text-2xl font-headline font-black uppercase tracking-tight">Quick Launch</h3>
                     <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Launch content generators</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                     <QuickLink label="Assemble Mock" href="/admin/mocks/builder" />
                     <QuickLink label="Manual MCQ Entry" href="/admin/questions/add" />
                     <QuickLink label="Verify Payments" href="/admin/payments/verify" highlight={finance.pendingCount > 0} />
                     <QuickLink label="Pass Registry" href="/admin/passes" />
                  </div>
               </div>
            </Card>
         </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, subLabel, icon, href, highlight }: any) {
  return (
    <Link href={href}>
      <Card className={cn(
        "border-none shadow-xl bg-white p-8 rounded-[2.5rem] hover:translate-y-[-4px] transition-all group",
        highlight && "ring-2 ring-rose-500/20"
      )}>
         <div className="flex items-center gap-6">
            <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner group-hover:scale-110 transition-transform">
               {icon}
            </div>
            <div className="text-left">
               <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
               <p className="text-3xl font-headline font-black text-[#0F172A] leading-none">{value}</p>
               <p className="text-[8px] font-bold text-slate-300 uppercase mt-2">{subLabel}</p>
            </div>
         </div>
      </Card>
    </Link>
  )
}

function QuickLink({ label, href, highlight }: { label: string, href: string, highlight?: boolean }) {
   return (
      <Link href={href} className="group">
         <div className={cn(
           "flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all",
           highlight && "border-rose-500/30 bg-rose-500/5"
         )}>
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
            <ChevronRight className={cn("h-4 w-4 transition-transform group-hover:translate-x-1", highlight ? "text-rose-500" : "text-primary")} />
         </div>
      </Link>
   )
}
