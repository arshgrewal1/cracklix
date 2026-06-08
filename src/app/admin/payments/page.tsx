
"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Clock, 
  User, 
  CheckCircle2, 
  Download,
  Filter,
  Zap,
  BarChart3
} from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, orderBy, where, limit } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

/**
 * @fileOverview Institutional Revenue Hub v3.0.
 * UPDATED: Uses dynamic aggregation from approved payment requests.
 */

export default function AdminPayments() {
  const db = useFirestore()
  
  // REAL-TIME LEDGER LISTENERS
  const approvedQuery = useMemo(() => (db ? query(collection(db, "payment_requests"), where("status", "==", "APPROVED"), orderBy("updatedAt", "desc"), limit(100)) : null), [db])
  const pendingQuery = useMemo(() => (db ? query(collection(db, "payment_requests"), where("status", "==", "PENDING")) : null), [db])

  const { data: approvedPayments, loading: approvedLoading } = useCollection<any>(approvedQuery)
  const { data: pendingPayments } = useCollection<any>(pendingQuery)

  const stats = useMemo(() => {
    if (!approvedPayments) return { total: 0, count: 0, pending: 0 }
    const total = approvedPayments.reduce((acc: number, p: any) => acc + (p.amount || 0), 0)
    return { 
      total, 
      count: approvedPayments.length, 
      pending: pendingPayments?.length || 0 
    }
  }, [approvedPayments, pendingPayments])

  return (
    <div className="space-y-12 pb-20 text-[#0F172A] text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="h-6 w-6 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Revenue & Billing Monitor</span>
           </div>
          <h1 className="text-5xl font-black font-headline text-[#0F172A] uppercase tracking-tight">Revenue Hub</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Tracking verified monetization nodes and aspirant transaction cycles.</p>
        </div>
        <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 bg-white font-black uppercase text-[10px] tracking-widest gap-3 shadow-sm text-[#0F172A]">
           <Download className="h-4 w-4" /> Export Ledger
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-4">
         <FinanceCard label="Gross Revenue" value={`₹${stats.total.toLocaleString()}`} trend="+ Verified" icon={<DollarSign className="text-emerald-500" />} />
         <FinanceCard label="Approved Nodes" value={stats.count} trend="Registry Sync" icon={<CheckCircle2 className="text-blue-500" />} />
         <FinanceCard label="Pending Audit" value={stats.pending} trend="Action Req." icon={<Zap className={stats.pending > 0 ? "text-primary animate-pulse" : "text-slate-300"} />} highlight={stats.pending > 0} />
         <FinanceCard label="Avg Ticket" value={`₹${stats.count > 0 ? Math.round(stats.total / stats.count) : '0'}`} trend="Plan Value" icon={<CreditCard className="text-primary" />} />
      </div>

      <Card className="border-none shadow-3xl bg-white rounded-[3rem] overflow-hidden mx-4">
        <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/30 flex flex-row justify-between items-center">
           <div>
              <CardTitle className="font-headline font-black text-2xl uppercase">Transaction Audit Ledger</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Verified institutional gateway events</CardDescription>
           </div>
        </CardHeader>
        <CardContent className="p-0 text-left">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-20">
                <TableHead className="px-12 text-[10px] font-black uppercase text-slate-500">Aspirant Hub</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-500">Transaction UTR</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-500 text-center">Plan Node</TableHead>
                <TableHead className="text-right px-12 text-[10px] font-black uppercase text-slate-500">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvedLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-50"><TableCell colSpan={4} className="px-12 py-10"><Skeleton className="h-12 w-full rounded-2xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : approvedPayments && approvedPayments.length > 0 ? (
                approvedPayments.map((p: any) => (
                  <TableRow key={p.id} className="border-slate-50 hover:bg-slate-50 transition-colors group">
                    <TableCell className="px-12 py-10">
                       <div className="flex items-center gap-6">
                          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase text-xs shadow-inner">
                             {p.userName?.[0] || 'A'}
                          </div>
                          <div>
                             <p className="font-black text-[#0F172A] text-lg uppercase leading-none">{p.userName}</p>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{p.userEmail}</p>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <code className="text-xs font-mono font-black text-slate-500 bg-slate-100 px-4 py-1.5 rounded-xl border border-slate-200">
                         {p.transactionId}
                       </code>
                    </TableCell>
                    <TableCell className="text-center">
                       <Badge className="bg-[#0F172A] text-white border-none font-black text-[9px] px-4 py-1.5 rounded-xl">
                          {p.planName?.toUpperCase() || 'PREMIUM'}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right px-12">
                       <span className="font-headline font-black text-2xl text-emerald-600">₹{p.amount}</span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                   <TableCell colSpan={4} className="h-80 text-center">
                      <div className="flex flex-col items-center justify-center opacity-10 space-y-6">
                         <DollarSign className="h-24 w-24 text-slate-400" />
                         <p className="font-black font-headline text-2xl uppercase tracking-widest">No Revenue Data in Node</p>
                      </div>
                   </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function FinanceCard({ label, value, trend, icon, highlight }: any) {
  return (
    <Card className={cn(
      "border-none shadow-2xl bg-white p-10 rounded-[2.5rem] relative overflow-hidden group",
      highlight && "ring-2 ring-primary/20 bg-primary/5"
    )}>
       <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">{icon}</div>
       <div className="space-y-4 relative z-10 text-left">
          <div className="flex justify-between items-center">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</p>
             <Badge className={cn("border-none text-[8px] font-black uppercase", highlight ? "bg-primary text-white" : "bg-emerald-50 text-emerald-600")}>{trend}</Badge>
          </div>
          <p className="text-4xl font-headline font-black text-[#0F172A] tabular-nums">{value}</p>
       </div>
    </Card>
  )
}
