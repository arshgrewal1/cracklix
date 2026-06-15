"use client"

import { useMemo, useState } from "react"
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
  BarChart3,
  Search,
  Globe
} from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, orderBy, where, limit } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Revenue Hub v5.0.
 * Layout refactor: Removed redundant horizontal padding.
 */

export default function AdminPayments() {
  const db = useFirestore()
  const [searchTerm, setSearchTerm] = useState("")
  
  // REAL-TIME LEDGER LISTENERS
  const approvedQuery = useMemo(() => (db ? query(collection(db, "payment_requests"), where("status", "==", "APPROVED"), orderBy("updatedAt", "desc"), limit(100)) : null), [db])
  const pendingQuery = useMemo(() => (db ? query(collection(db, "payment_requests"), where("status", "==", "PENDING")) : null), [db])

  const { data: approvedPayments, loading: approvedLoading } = useCollection<any>(approvedQuery)
  const { data: pendingPayments } = useCollection<any>(pendingQuery)

  const filteredPayments = useMemo(() => {
    if (!approvedPayments) return []
    return approvedPayments.filter((p: any) => 
      p.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [approvedPayments, searchTerm])

  const stats = useMemo(() => {
    if (!approvedPayments) return { total: 0, count: 0, pending: 0, razorpayCount: 0 }
    const total = approvedPayments.reduce((acc: number, p: any) => acc + (p.amount || 0), 0)
    const razorpayCount = approvedPayments.filter((p: any) => p.gateway === 'RAZORPAY').length
    return { 
      total, 
      count: approvedPayments.length, 
      pending: pendingPayments?.length || 0,
      razorpayCount
    }
  }, [approvedPayments, pendingPayments])

  return (
    <div className="space-y-12 text-[#0F172A] text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="h-6 w-6 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Revenue & Billing Monitor</span>
           </div>
          <h1 className="text-5xl font-black font-headline text-[#0F172A] uppercase tracking-tight">Revenue Hub</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Tracking verified monetization nodes and gateway transaction cycles.</p>
        </div>
        <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 bg-white font-black uppercase text-[10px] tracking-widest gap-3 shadow-sm text-[#0F172A]">
           <Download className="h-4 w-4" /> Export Ledger
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         <FinanceCard label="Gross Revenue" value={`₹${stats.total.toLocaleString()}`} trend="+ Verified" icon={<DollarSign className="text-emerald-500" />} />
         <FinanceCard label="Approved Nodes" value={stats.count} trend="Registry Sync" icon={<CheckCircle2 className="text-blue-500" />} />
         <FinanceCard label="Razorpay Flow" value={stats.razorpayCount} trend="Online Auto" icon={<Globe className="text-primary" />} />
         <FinanceCard label="Pending Audit" value={stats.pending} trend="Action Req." icon={<Zap className={stats.pending > 0 ? "text-primary animate-pulse" : "text-slate-300"} />} highlight={stats.pending > 0} />
      </div>

      <div className="relative group">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
         <Input 
           className="h-16 pl-16 rounded-[1.5rem] bg-white border-none shadow-2xl text-lg font-medium" 
           placeholder="Search Aspirant, Transaction UTR or Order ID..." 
           value={searchTerm}
           onChange={e => setSearchTerm(e.target.value)}
         />
      </div>

      <Card className="border-none shadow-3xl bg-white rounded-[3rem] overflow-hidden">
        <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/30">
           <CardTitle className="font-headline font-black text-2xl uppercase">Transaction Audit Ledger</CardTitle>
        </CardHeader>
        <CardContent className="p-0 text-left">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-20">
                <TableHead className="px-12 text-[10px] font-black uppercase text-slate-500">Aspirant & Gateway</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-500">Transaction Registry</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-500 text-center">Plan Node</TableHead>
                <TableHead className="text-right px-12 text-[10px] font-black uppercase text-slate-500">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvedLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-50"><TableCell colSpan={4} className="px-12 py-10"><Skeleton className="h-12 w-full rounded-2xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : filteredPayments && filteredPayments.length > 0 ? (
                filteredPayments.map((p: any) => (
                  <TableRow key={p.id} className="border-slate-50 hover:bg-slate-50 transition-colors group">
                    <TableCell className="px-12 py-10">
                       <div className="flex items-center gap-6">
                          <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center text-white font-black uppercase text-xs shadow-inner", p.gateway === 'RAZORPAY' ? "bg-primary" : "bg-[#0F172A]")}>
                             {p.gateway === 'RAZORPAY' ? <Globe className="h-6 w-6" /> : (p.userName?.[0] || 'A')}
                          </div>
                          <div>
                             <p className="font-black text-[#0F172A] text-lg uppercase leading-none">{p.userName || 'System Auto'}</p>
                             <div className="flex items-center gap-2 mt-2">
                                <Badge className={cn("border-none text-[7px] font-black uppercase", p.gateway === 'RAZORPAY' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500")}>
                                   {p.gateway || 'MANUAL'}
                                </Badge>
                             </div>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex flex-col gap-1.5">
                          <code className="text-[10px] font-mono font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-lg w-fit">
                            UTR: {p.transactionId || '---'}
                          </code>
                          <code className="text-[10px] font-mono text-slate-400 px-3">
                            ID: {p.id}
                          </code>
                       </div>
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
                         <p className="font-black font-headline text-2xl uppercase tracking-widest">No matching transaction nodes</p>
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
