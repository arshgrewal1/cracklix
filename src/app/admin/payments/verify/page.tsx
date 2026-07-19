
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, CheckCircle2, XCircle, Zap, CreditCard, Loader2, Activity } from "lucide-react"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, doc, updateDoc, serverTimestamp, addDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { approvePaymentRequest } from "@/app/actions/payment"
import { useToast } from "@/hooks/use-toast"
import { AdminPageHeader, AdminTableSkeleton } from "@/components/admin"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Administrative Manual UPI Verification Center v5.3.
 * UPDATED: Replaced 'node' with 'entry' or 'item'.
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
      
      await addDoc(collection(db, "audit_logs"), {
        user: profile?.name || "Administrator",
        action: "PAYMENT_APPROVE",
        details: `Manual UPI Request ${requestId} verified and pass activated.`,
        timestamp: serverTimestamp()
      });

      toast({ title: "Pass Activated", description: "Student upgraded successfully." })
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
    <div className="space-y-10 md:space-y-16 text-[#0F172A] text-left animate-in fade-in duration-700 pb-32 pt-2">
      
      {/* 1. HEADER CENTER - SIMPLIFIED LANGUAGE */}
      <AdminPageHeader
        icon={ShieldCheck}
        label="Manual Upload Portal"
        title="Manual Verification"
        subtitle="Audit and authorize manual UPI transaction requests for elite pass activation."
      >
        <div className="px-5 py-3 md:px-8 md:py-4 bg-emerald-50 rounded-[1.5rem] border border-emerald-100 flex items-center gap-4 md:gap-8 shadow-sm shrink-0 group">
           <div className="space-y-0.5 text-left">
              <p className="text-[8px] md:text-[9px] font-black text-emerald-600 uppercase tracking-widest">Pending Items</p>
              <p className="text-xl md:text-3xl font-black text-emerald-700 leading-none tabular-nums">
                {loading ? "..." : (requests?.length || 0)}
              </p>
           </div>
           <Zap className="h-6 w-6 md:h-8 md:w-8 text-emerald-400 group-hover:scale-110 transition-transform animate-pulse" />
        </div>
      </AdminPageHeader>

      {/* 2. DATA LIST */}
      <Card className="border-none shadow-3xl bg-white rounded-2xl md:rounded-[3rem] overflow-hidden border border-slate-50 mx-1">
        <CardHeader className="p-6 md:p-10 pb-0 flex flex-row items-center justify-between border-b border-slate-50">
           <CardTitle className="text-sm md:text-xl font-black text-[#0F172A] uppercase tracking-tight flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary" /> Approval Ledger
           </CardTitle>
           <Badge variant="outline" className="text-[8px] font-black uppercase text-slate-400">Database Queue</Badge>
        </CardHeader>
        <CardContent className="p-0 text-left">
          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-slate-100 h-14 md:h-18">
                  <TableHead className="px-8 md:px-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Student Entry</TableHead>
                  <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">UTR / Transaction ID</TableHead>
                  <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Amount</TableHead>
                  <TableHead className="text-right px-8 md:px-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Control</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <AdminTableSkeleton rows={5} columns={4} />
                ) : requests && requests.length > 0 ? (
                  requests.map((req: any) => (
                    <TableRow key={req.id} className="border-slate-50 hover:bg-slate-50/50 transition-all group">
                      <TableCell className="px-8 md:px-12 py-5 md:py-10">
                         <div className="flex items-center gap-4 md:gap-8">
                            <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase text-sm md:text-xl shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                               {req.userName?.[0] || 'A'}
                            </div>
                            <div className="min-w-0">
                               <p className="font-bold text-[#0F172A] text-sm md:text-lg leading-tight truncate">{req.userName}</p>
                               <p className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 truncate">{req.planName} Portal</p>
                            </div>
                         </div>
                      </TableCell>
                      <TableCell>
                         <code className="text-[10px] md:text-xs font-mono font-black text-primary bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm">
                           {req.transactionId}
                         </code>
                      </TableCell>
                      <TableCell className="text-center">
                         <span className="font-black text-sm md:text-2xl text-emerald-600 tabular-nums">₹{req.amount}</span>
                      </TableCell>
                      <TableCell className="text-right px-8 md:px-12">
                         <div className="flex justify-end gap-2 md:gap-4">
                            <Button 
                              onClick={() => handleApprove(req.id)}
                              disabled={processingId === req.id}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[8px] md:text-[10px] tracking-widest h-10 md:h-12 px-6 md:px-10 rounded-full shadow-lg border-none transition-all active:scale-95 gap-2"
                            >
                               {processingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                               Verify Item
                            </Button>
                            <Button 
                              variant="ghost" 
                              onClick={() => handleReject(req.id)}
                              className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-all active:scale-90"
                              title="Reject Request"
                            >
                               <XCircle className="h-5 w-5" />
                            </Button>
                         </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                     <TableCell colSpan={4} className="h-80 md:h-[400px] text-center">
                        <div className="flex flex-col items-center justify-center opacity-10 space-y-6">
                           <CreditCard className="h-20 w-20 md:h-32 md:w-32 text-slate-400" />
                           <p className="font-black text-xl md:text-3xl uppercase tracking-[0.4em]">Queue Empty</p>
                        </div>
                     </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-center gap-4 text-slate-300 py-6">
        <ShieldCheck className="h-4 w-4" />
        <span className="text-[9px] font-black uppercase tracking-[0.5em]">System Verification Update Active</span>
      </div>
    </div>
  )
}
