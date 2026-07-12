
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, CheckCircle2, XCircle, Zap, CreditCard, Loader2 } from "lucide-react"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, doc, updateDoc, serverTimestamp, addDoc } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { approvePaymentRequest } from "@/app/actions/payment"
import { useToast } from "@/hooks/use-toast"

/**
 * @fileOverview Administrative Manual UPI Verification Hub v4.1.
 * UPDATED: Integrated live auditing for manual payment approvals.
 */

export default function VerifyPaymentsPage() {
  const db = useFirestore()
  const { user: admin, profile } = useUser()
  const { toast } = useToast()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const requestsQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "payment_requests"), where("status", "==", "PENDING"))
  }, [db])

  const { data: requests, loading } = useCollection<any>(requestsQuery)

  const handleApprove = async (requestId: string) => {
    if (!admin || !db) return
    setProcessingId(requestId)
    try {
      await approvePaymentRequest(requestId, admin.uid)
      
      // LOG AUDIT TRAIL
      await addDoc(collection(db, "audit_logs"), {
        user: profile?.name || "Administrator",
        action: "PAYMENT_APPROVE",
        details: `Manual UPI Request ${requestId} verified and pass activated.`,
        timestamp: serverTimestamp()
      });

      toast({ title: "Pass Activated", description: "Aspirant upgraded successfully." })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Approval Failed" })
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (requestId: string) => {
    if (!db) return
    if (!confirm("Permanently reject this payment request?")) return
    
    try {
      await updateDoc(doc(db, "payment_requests", requestId), {
        status: 'REJECTED',
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db, "audit_logs"), {
        user: profile?.name || "Administrator",
        action: "PAYMENT_REJECT",
        details: `Manual UPI Request ${requestId} rejected.`,
        timestamp: serverTimestamp()
      });

      toast({ title: "Request Rejected" });
    } catch (e) {
      toast({ variant: "destructive", title: "Action Failed" });
    }
  }

  return (
    <div className="space-y-6 md:space-y-10 pb-20 text-[#0F172A] text-left animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1.5">
           <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Manual Ingestion Node</span>
           </div>
          <h1 className="text-2xl md:text-5xl font-black tracking-tight text-[#0F172A]">Manual Verification</h1>
          <p className="text-slate-500 text-[11px] md:text-lg font-medium max-w-2xl leading-tight">Audit and authorize manual UPI transaction requests for elite pass activation.</p>
        </div>
        <div className="px-5 py-3 md:px-8 md:py-4 bg-emerald-50 rounded-[1.5rem] border border-emerald-100 flex items-center gap-4 md:gap-8 shadow-sm shrink-0">
           <div className="space-y-0.5 text-left">
              <p className="text-[8px] md:text-[9px] font-black text-emerald-600 uppercase tracking-widest">Pending Nodes</p>
              <p className="text-xl md:text-3xl font-black text-emerald-700 leading-none tabular-nums">{requests?.length || 0}</p>
           </div>
           <Zap className="h-6 w-6 md:h-8 md:w-8 text-emerald-400 animate-pulse" />
        </div>
      </div>

      <Card className="border-none shadow-xl bg-white rounded-2xl md:rounded-[2.5rem] overflow-hidden border border-slate-50 mx-1">
        <CardHeader className="p-5 md:p-8 border-b border-slate-50 bg-slate-50/30">
           <CardTitle className="text-sm md:text-2xl font-black text-[#0F172A]">Approval Ledger</CardTitle>
        </CardHeader>
        <CardContent className="p-0 text-left">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-14 md:h-18">
                <TableHead className="px-5 md:px-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Aspirant Node</TableHead>
                <TableHead className="hidden md:table-cell text-[10px] font-black uppercase tracking-widest text-slate-400">UTR / Transaction ID</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Amount</TableHead>
                <TableHead className="text-right px-5 md:px-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-50"><TableCell colSpan={4} className="px-5 py-6 md:px-12 md:py-8"><Skeleton className="h-10 w-full rounded-xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : requests && requests.length > 0 ? (
                requests.map((req: any) => (
                  <TableRow key={req.id} className="border-slate-50 hover:bg-slate-50 transition-colors group">
                    <TableCell className="px-5 py-5 md:px-12 md:py-8">
                       <div className="flex items-center gap-3 md:gap-6">
                          <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase text-[10px] md:text-xs shadow-inner shrink-0">
                             {req.userName?.[0] || 'A'}
                          </div>
                          <div className="min-w-0">
                             <p className="font-bold text-[#0F172A] text-sm md:text-lg leading-tight truncate">{req.userName}</p>
                             <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">{req.planName} Hub</p>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                       <code className="text-[10px] md:text-xs font-mono font-bold text-[#0F172A] bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                         {req.transactionId}
                       </code>
                    </TableCell>
                    <TableCell className="text-center">
                       <span className="font-black text-sm md:text-2xl text-emerald-600 tabular-nums">₹{req.amount}</span>
                    </TableCell>
                    <TableCell className="text-right px-5 md:px-12">
                       <div className="flex justify-end gap-2 md:gap-3">
                          <Button 
                            onClick={() => handleApprove(req.id)}
                            disabled={processingId === req.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[8px] md:text-[10px] tracking-widest h-9 md:h-11 px-4 md:px-8 rounded-full shadow-lg border-none transition-all active:scale-95"
                          >
                             {processingId === req.id ? <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" /> : <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4" />}
                             <span className="hidden sm:inline">Verify</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            onClick={() => handleReject(req.id)}
                            className="h-9 w-9 md:h-11 md:w-11 rounded-full text-rose-500 hover:bg-rose-50 p-0"
                          >
                             <XCircle className="h-5 w-5" />
                          </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                   <TableCell colSpan={4} className="h-60 md:h-80 text-center">
                      <div className="flex flex-col items-center justify-center opacity-10 space-y-4 md:space-y-6">
                         <CreditCard className="h-16 w-16 md:h-24 md:w-24 text-slate-400" />
                         <p className="font-black text-sm md:text-2xl uppercase tracking-widest">No Pending Approvals</p>
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
