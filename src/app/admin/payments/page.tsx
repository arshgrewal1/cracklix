
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
  ArrowUpRight, 
  Download,
  Filter,
  Zap,
  BarChart3
} from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, limit } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

/**
 * @fileOverview Institutional Revenue & Payment Command Center.
 * Monitors gross collection and individual transaction audit nodes.
 */

export default function AdminPayments() {
  const db = useFirestore()
  const paymentQuery = useMemo(() => (db ? query(collection(db, "payments"), limit(100)) : null), [db])
  const { data: allPayments, loading } = useCollection<any>(paymentQuery)

  const payments = useMemo(() => {
    if (!allPayments) return []
    return [...allPayments].sort((a, b) => {
      const tA = a.createdAt?.seconds || 0
      const tB = b.createdAt?.seconds || 0
      return tB - tA
    })
  }, [allPayments])

  const stats = useMemo(() => {
    if (!payments) return { total: 0, today: 0, active: 0 }
    const total = payments.reduce((acc, p) => acc + (p.amount || 0), 0)
    return { total, today: 0, active: payments.length }
  }, [payments])

  return (
    <div className="space-y-12 pb-20 text-[#0F172A]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="h-6 w-6 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Revenue & Billing Monitor</span>
           </div>
          <h1 className="text-5xl font-black font-headline text-[#0F172A] uppercase tracking-tight">Financial Hub</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Tracking gross monetization nodes and aspirant transaction cycles.</p>
        </div>
        <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 bg-white font-black uppercase text-[10px] tracking-widest gap-3 shadow-sm text-[#0F172A]">
           <Download className="h-4 w-4" /> Export Ledger
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         <FinanceCard label="Gross Revenue" value={`₹${stats.total}`} trend="+24%" icon={<DollarSign className="text-emerald-500" />} />
         <FinanceCard label="Today's Sync" value="₹0" trend="Audit Mode" icon={<Zap className="text-primary" />} />
         <FinanceCard label="Active Passes" value={stats.active} trend="+12%" icon={<User className="text-blue-500" />} />
         <FinanceCard label="Avg Ticket" value="₹199" trend="Gold Tier" icon={<CreditCard className="text-primary" />} />
      </div>

      <Card className="border-slate-100 shadow-3xl bg-white rounded-[3rem] overflow-hidden">
        <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/50 flex flex-row justify-between items-center">
           <div>
              <CardTitle className="font-headline font-black text-2xl uppercase">Transaction Audit Ledger</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Verified institutional gateway events</CardDescription>
           </div>
           <div className="flex gap-3">
              <Button variant="ghost" size="sm" className="h-10 rounded-xl font-bold uppercase text-[9px] gap-2"><Filter className="h-3 w-3" /> Filter</Button>
           </div>
        </CardHeader>
        <CardContent className="p-0 text-left">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-20">
                <TableHead className="px-12 text-[10px] font-black uppercase text-slate-500">Aspirant Node</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-500">Gateway ID</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-500 text-center">Amount</TableHead>
                <TableHead className="text-right px-12 text-[10px] font-black uppercase text-slate-500">Audit Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-50"><TableCell colSpan={4} className="px-12 py-8"><Skeleton className="h-12 w-full rounded-2xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : payments && payments.length > 0 ? (
                payments.map((p: any) => (
                  <TableRow key={p.id} className="border-slate-50 hover:bg-slate-50 transition-colors group">
                    <TableCell className="px-12 py-8">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase text-xs">
                             {p.userEmail?.[0] || 'A'}
                          </div>
                          <div>
                             <p className="font-bold text-[#0F172A]">{p.userEmail}</p>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.passName}</p>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <code className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">{p.paymentId || 'PAY_ID'}</code>
                    </TableCell>
                    <TableCell className="text-center">
                       <span className="font-headline font-black text-xl text-[#0F172A]">₹{p.amount}</span>
                    </TableCell>
                    <TableCell className="text-right px-12">
                       <Badge className="bg-emerald-50 text-emerald-600 border-none font-black px-4 py-1.5 rounded-xl text-[9px] uppercase tracking-[0.2em]">VERIFIED</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                   <TableCell colSpan={4} className="h-60 text-center opacity-20 italic">No transactions recorded in the current audit cycle.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function FinanceCard({ label, value, trend, icon }: any) {
  return (
    <Card className="border-none shadow-2xl bg-white p-10 rounded-[2.5rem] relative overflow-hidden group">
       <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">{icon}</div>
       <div className="space-y-4 relative z-10 text-left">
          <div className="flex justify-between items-center">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</p>
             <Badge className="bg-emerald-50 text-emerald-500 border-none text-[8px] font-black">{trend}</Badge>
          </div>
          <p className="text-4xl font-headline font-black text-[#0F172A]">{value}</p>
       </div>
    </Card>
  )
}
