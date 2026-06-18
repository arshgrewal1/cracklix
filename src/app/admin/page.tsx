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
  ChevronRight
} from "lucide-react"
import Link from "next/link"
import { useCollection, useFirestore, useDoc } from "@/firebase"
import { collection, query, orderBy, limit, doc, where, getDocs, setDoc, serverTimestamp, DocumentData } from "firebase/firestore"
import { seedInitialData } from "@/services/seed-data"
import { useToast } from "@/hooks/use-toast"
import StudentAvatar from "@/components/brand/StudentAvatar"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Command Center v46.0 (Layout Hardened).
 * FIXED: Grid gaps and card internal spacing to prevent overlap on small screens.
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

  useEffect(() => {
    if (db) {
       handleSyncLiveStats(true);
    }
  }, [db]);

  const finance = useMemo(() => {
    const totalRev = approvedRequests?.reduce((acc: number, r: any) => acc + (r.amount || 0), 0) || 0;
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
        const [qSnap, mSnap, uSnap, rSnap, eSnap] = await Promise.all([
           getDocs(collection(db, "questions")),
           getDocs(collection(db, "mocks")),
           getDocs(collection(db, "users")),
           getDocs(collection(db, "results")),
           getDocs(collection(db, "exams"))
        ]);

        const totalResults = rSnap.docs.length;
        const avgAcc = totalResults > 0 
           ? Math.round(rSnap.docs.reduce((acc: number, d: DocumentData) => acc + (Number(d.data().accuracy) || 0), 0) / totalResults)
           : 94;

        await setDoc(doc(db, "settings", "stats"), {
           totalQuestions: qSnap.size,
           totalMocks: mSnap.size,
           totalUsers: uSnap.size,
           totalBoards: eSnap.size, 
           averageAccuracy: avgAcc,
           updatedAt: serverTimestamp()
        }, { merge: true });

        if (!silent) {
           toast({ 
             title: "Registry Audited", 
             description: `Synced: ${qSnap.size} MCQs, ${eSnap.size} Exams, ${uSnap.size} Students.` 
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
    <div className="space-y-8 md:space-y-12 text-[#0F172A] text-left">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2 min-w-0 flex-1">
           <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 shrink-0">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">Live</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Admin Control</span>
           </div>
          <h1 className="text-3xl md:text-5xl font-headline font-black text-[#0F172A] uppercase tracking-tight leading-none truncate">Admin Hub</h1>
          <p className="text-slate-400 text-sm md:text-lg font-medium max-w-xl">Monitoring preparation nodes and institutional financial flow.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
           <Button onClick={() => handleSyncLiveStats()} disabled={isStatsSyncing} className="h-11 bg-primary hover:bg-primary/90 text-white rounded-xl font-black shadow-lg uppercase tracking-widest text-[10px] px-6 border-none">
              {isStatsSyncing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />} Sync Stats
           </Button>
           <Button onClick={handlePushToRegistry} disabled={isSyncing} className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-lg uppercase tracking-widest text-[10px] px-6 border-none">
              {isSyncing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />} Seed Hub
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
           subLabel="Premium Aspirants" 
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <Card className="lg:col-span-8 border-none shadow-2xl bg-white rounded-[2rem] overflow-hidden border border-slate-100 min-w-0">
            <CardHeader className="p-6 md:p-8 border-b border-slate-50 bg-slate-50/30">
               <CardTitle className="text-xl font-headline font-black uppercase text-[#0F172A]">Audit Stream</CardTitle>
               <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Real-time registry activities.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-8 md:space-y-10">
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Users className="h-4 w-4" /> Latest Aspirants</h4>
                  <div className="grid grid-cols-1 gap-3">
                     {recentUsers?.map((u: any) => (
                        <div key={u.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 min-w-0 gap-4">
                           <div className="flex items-center gap-3 md:gap-4 min-w-0">
                              <StudentAvatar profile={u} className="h-10 w-10 rounded-xl shrink-0" />
                              <div className="min-w-0">
                                 <p className="font-bold text-sm text-[#0F172A] uppercase truncate">{u.name}</p>
                                 <p className="text-[9px] text-slate-400 font-bold uppercase truncate">{u.email}</p>
                              </div>
                           </div>
                           <Badge variant="outline" className="text-[8px] font-black uppercase border-slate-200 shrink-0">
                              {u.pass?.active ? (u.pass.plan || 'ELITE') : 'FREE'}
                           </Badge>
                        </div>
                     ))}
                  </div>
               </div>
               
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Activity className="h-4 w-4" /> Recent CBT Sessions</h4>
                  <div className="grid grid-cols-1 gap-3">
                     {recentResults?.map((r: any) => (
                        <div key={r.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm min-w-0 gap-4">
                           <div className="flex items-center gap-3 md:gap-4 min-w-0">
                              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0"><Zap className="h-5 w-5" /></div>
                              <div className="min-w-0">
                                 <p className="font-bold text-sm text-[#0F172A] uppercase truncate">{r.mockTitle}</p>
                                 <p className="text-[9px] text-slate-400 font-bold uppercase truncate">{r.userName}</p>
                              </div>
                           </div>
                           <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] shrink-0">{r.accuracy}%</Badge>
                        </div>
                     ))}
                  </div>
               </div>
            </CardContent>
         </Card>

         <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-3xl bg-[#0F172A] text-white p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><ShieldCheck className="h-64 w-64" /></div>
               <div className="relative z-10 space-y-8 md:space-y-10">
                  <div className="space-y-2 text-left">
                     <h3 className="text-2xl font-headline font-black uppercase tracking-tight">Quick Launch</h3>
                     <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Operations Hub</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
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

function MetricCard({ label, value, subLabel, icon, href, highlight }: MetricCardProps) {
  return (
    <Link href={href} className="block group">
      <Card className={cn(
        "border-none shadow-xl bg-white p-6 md:p-8 rounded-[2rem] transition-all duration-300",
        "group-hover:translate-y-[-4px] group-hover:shadow-2xl border border-slate-100",
        highlight && "ring-2 ring-rose-500/20 bg-rose-50/5"
      )}>
         <div className="flex items-center gap-4 md:gap-6">
            <div className="h-10 w-10 md:h-14 md:w-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner shrink-0 group-hover:scale-110 transition-transform">
               {icon}
            </div>
            <div className="text-left min-w-0 flex-1">
               <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 truncate">{label}</p>
               <div className="text-xl md:text-3xl font-headline font-black text-[#0F172A] leading-none tracking-tight truncate">{value}</div>
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
           "flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all",
           highlight && "border-rose-500/30 bg-rose-50/5"
         )}>
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
            <ChevronRight className={cn("h-4 w-4 transition-transform group-hover:translate-x-1", highlight ? "text-rose-500" : "text-primary")} />
         </div>
      </Link>
   )
}
