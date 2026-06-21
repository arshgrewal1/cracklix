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
 * @fileOverview Institutional Revenue Hub v5.1.
 * PWA SYNC: Removed uppercase, reduced font scales, and normalized Title Case.
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
    <div className="space-y-6 md:space-y-12 text-[#0F172A] text-left animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-emerald-500" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Revenue Monitor</span>
           </div>
          <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight">Revenue Hub</h1>
          <p className="text-slate-500 text-[11px] md:text-lg font-medium">Tracking verified monetization nodes and gateway transaction cycles.</p>
        </div>
        <Button variant="outline" className="w-full md:w-auto h-11 md:h-14 px-8 rounded-full border-slate-200 bg-white font-black uppercase text-[10px] tracking-widest gap-2 shadow-sm">
           <Download className="h-4 w-4" /> Export Ledger
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 px-1">
         <FinanceCard label="Gross Revenue" value={`₹${stats.total.toLocaleString()}`} trend="Verified" icon={<DollarSign className="text-emerald-500" />} />
         <FinanceCard label="Approved Nodes" value={stats.count} trend="Synced" icon={<CheckCircle2 className="text-blue-500" />} />
         <FinanceCard label="Gateway Flow" value={stats.razorpayCount} trend="Online" icon={<Globe className="text-primary" />} />
         <FinanceCard label="Pending Audit" value={stats.pending} trend="Action" icon={<Zap className={stats.pending > 0 ? "text-primary animate-pulse" : "text-slate-300"} />} highlight={stats.pending > 0} />
      </div>

      <div className="relative group px-1">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
         <Input 
           className="h-14 md:h-16 pl-14 rounded-2xl md:rounded-full bg-white border-slate-50 shadow-inner text-base md:text-lg font-bold" 
           placeholder="Search aspirant or UTR..." 
           value={searchTerm}
           onChange={e => setSearchTerm(e.target.value)}
         />
      </div>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1">
        <CardHeader className="p-6 md:p-10 border-b border-slate-50 bg-slate-50/30">
           <CardTitle className="text-lg md:text-2xl font-black text-[#0F172A]">Transaction Audit Ledger</CardTitle>
        </CardHeader>
        <CardContent className="p-0 text-left">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-14 md:h-20">
                <TableHead className="px-6 md:px-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Aspirant Hub</TableHead>
                <TableHead className="hidden md:table-cell text-[10px] font-black uppercase tracking-widest text-slate-400">Registry ID</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Plan Node</TableHead>
                <TableHead className="text-right px-6 md:px-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvedLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-50"><TableCell colSpan={4} className="px-6 md:px-12 py-6 md:py-10"><Skeleton className="h-10 w-full rounded-xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : filteredPayments && filteredPayments.length > 0 ? (
                filteredPayments.map((p: any) => (
                  <TableRow key={p.id} className="border-slate-50 hover:bg-slate-50 transition-colors group">
                    <TableCell className="px-6 md:px-12 py-5 md:py-10">
                       <div className="flex items-center gap-4 md:gap-6">
                          <div className={cn("h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center text-white font-black uppercase text-[10px] md:text-xs shadow-inner", p.gateway === 'CASHFREE' ? "bg-primary" : "bg-[#0F172A]")}>
                             {p.userName?.[0] || 'A'}
                          </div>
                          <div className="min-w-0">
                             <p className="font-bold text-[#0F172A] text-sm md:text-lg leading-tight truncate">{p.userName || 'Aspirant'}</p>
                             <div className="flex items-center gap-2 mt-1">
                                <Badge className="bg-slate-50 text-slate-400 border-none text-[7px] font-black uppercase px-2">{p.gateway || 'MANUAL'}</Badge>
                             </div>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                       <div className="flex flex-col gap-1">
                          <code className="text-[10px] font-mono font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded w-fit">
                            UTR: {p.transactionId || '---'}
                          </code>
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <Badge className="bg-[#0F172A] text-white border-none font-black text-[8px] md:text-[9px] px-3 py-1 rounded-lg">
                          {p.planName || 'ELITE'}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right px-6 md:px-12">
                       <span className="font-black text-sm md:text-2xl text-emerald-600 tabular-nums">₹{p.amount}</span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                   <TableCell colSpan={4} className="h-60 md:h-80 text-center">
                      <div className="flex flex-col items-center justify-center opacity-10 space-y-4">
                         <DollarSign className="h-16 w-16 md:h-24 md:w-24 text-slate-400" />
                         <p className="font-black text-sm md:text-2xl uppercase tracking-widest">No transaction nodes</p>
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
      "border-none shadow-lg bg-white p-5 md:p-8 rounded-2xl md:rounded-[2rem] relative overflow-hidden group",
      highlight && "ring-2 ring-primary/10 bg-primary/5"
    )}>
       <div className="absolute top-0 right-0 p-4 md:p-6 opacity-5 group-hover:scale-110 transition-transform">{icon}</div>
       <div className="space-y-3 md:space-y-4 relative z-10 text-left">
          <div className="flex justify-between items-center">
             <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{label}</p>
             <Badge className={cn("border-none text-[7px] font-black uppercase px-1.5 rounded", highlight ? "bg-primary text-white" : "bg-emerald-50 text-emerald-600")}>{trend}</Badge>
          </div>
          <p className="text-2xl md:text-4xl font-black text-[#0F172A] tabular-nums leading-none tracking-tight">{value}</p>
       </div>
    </Card>
  )
}
