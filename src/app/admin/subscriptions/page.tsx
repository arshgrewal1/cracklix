
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  ShieldCheck, 
  Trash2, 
  ChevronRight, 
  Clock, 
  Loader2, 
  Zap,
  XCircle,
  Activity
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, orderBy, deleteDoc, doc, updateDoc, serverTimestamp, addDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { AdminPageHeader, AdminSearchInput, AdminTableSkeleton } from "@/components/admin"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/**
 * @fileOverview Official Subscription Governance Hub v2.0 (High-Fidelity).
 * FIXED: Rebalanced header spacing and replaced native filter with high-fidelity Select node.
 * UPDATED: Integrated Live Auditing for all pass modifications.
 */

export default function SubscriptionManagement() {
  const db = useFirestore()
  const { profile } = useUser()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const subQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "subscriptions"), orderBy("updatedAt", "desc"))
  }, [db])

  const { data: rawSubs, loading } = useCollection<any>(subQuery)

  const filteredSubs = useMemo(() => {
    if (!rawSubs) return []
    return rawSubs.filter((s: any) => {
      const matchesSearch = s.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.id?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [rawSubs, searchTerm, statusFilter])

  const handleDeactivate = async (id: string, name: string) => {
     if (!db) return
     if (!confirm(`Deactivate subscription node for ${name}?`)) return
     
     try {
        await updateDoc(doc(db, "subscriptions", id), { status: "EXPIRED", updatedAt: serverTimestamp() })
        
        await addDoc(collection(db, "audit_logs"), {
          user: profile?.name || "Administrator",
          action: "SUBSCRIPTION_DEACTIVATE",
          details: `Manual deactivation of pass node for aspirant: ${name}.`,
          timestamp: serverTimestamp()
        });

        toast({ title: "Node Deactivated" })
     } catch (e) {
        toast({ variant: "destructive", title: "Action Failed" })
     }
  }

  const handleExtend = async (id: string, currentExpiry: string, name: string) => {
     if (!db) return
     const expiry = new Date(currentExpiry)
     expiry.setDate(expiry.getDate() + 30) 
     
     try {
        await updateDoc(doc(db, "subscriptions", id), { expiryDate: expiry.toISOString(), status: "ACTIVE", updatedAt: serverTimestamp() })
        
        await addDoc(collection(db, "audit_logs"), {
          user: profile?.name || "Administrator",
          action: "SUBSCRIPTION_EXTEND",
          details: `Pass validity for ${name} extended by 30 days via registry override.`,
          timestamp: serverTimestamp()
        });

        toast({ title: "Validity Extended", description: "Added 30 days to preparation cycle." })
     } catch (e) {
        toast({ variant: "destructive", title: "Action Failed" })
     }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!db) return
    if (!confirm(`Permanently purge "${name}" from subscription registry?`)) return
    
    try {
       await deleteDoc(doc(db, "subscriptions", id))
       
       await addDoc(collection(db, "audit_logs"), {
          user: profile?.name || "Administrator",
          action: "SUBSCRIPTION_PURGE",
          details: `Subscription record for ${name} purged from master ledger.`,
          timestamp: serverTimestamp()
       });

       toast({ title: "Registry Sanitized" })
    } catch (e) {
       toast({ variant: "destructive", title: "Purge Failed" })
    }
  }

  return (
    <div className="space-y-10 md:space-y-16 text-[#0F172A] text-left animate-in fade-in duration-700 pb-32 pt-2">
      
      {/* 1. HEADER HUB */}
      <AdminPageHeader
        icon={ShieldCheck}
        label="Security Access Governance"
        title="Active Passes"
        subtitle={`Monitoring ${filteredSubs.length} verified preparation nodes across the state.`}
      />

      {/* 2. SEARCH & FILTER HUB */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-1">
         <div className="lg:col-span-8">
            <AdminSearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search aspirant, UTR or email..."
            />
         </div>
         <div className="lg:col-span-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
               <SelectTrigger className="w-full h-14 md:h-16 bg-white border-slate-50 shadow-inner rounded-2xl md:rounded-full px-6 font-bold text-sm outline-none">
                  <SelectValue placeholder="All Status" />
               </SelectTrigger>
               <SelectContent className="bg-[#0B1528] border-white/10 text-white">
                  <SelectItem value="all">All Registry Nodes</SelectItem>
                  <SelectItem value="ACTIVE">System Online</SelectItem>
                  <SelectItem value="EXPIRED">Pass Expired</SelectItem>
               </SelectContent>
            </Select>
         </div>
      </div>

      {/* 3. DATA LEDGER */}
      <Card className="border-none shadow-3xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardHeader className="p-6 md:p-10 pb-0 flex flex-row items-center justify-between">
           <CardTitle className="text-sm md:text-xl font-black text-[#0F172A] uppercase tracking-tight flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary" /> Subscription Ledger
           </CardTitle>
           <Badge variant="outline" className="text-[8px] font-black uppercase text-slate-400">Verified Flow</Badge>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto mt-6">
          <Table className="min-w-[1000px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="h-16 md:h-20 border-slate-100">
                <TableHead className="px-8 md:px-12 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Aspirant Hub</TableHead>
                <TableHead className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Pass Details</TableHead>
                <TableHead className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Status</TableHead>
                <TableHead className="text-right px-8 md:px-12 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <AdminTableSkeleton rows={5} columns={4} />
              ) : filteredSubs.length > 0 ? filteredSubs.map((sub: any) => (
                <TableRow key={sub.id} className="hover:bg-slate-50 border-slate-50 transition-all group">
                  <TableCell className="px-8 md:px-12 py-6 md:py-10">
                     <div className="flex items-center gap-4 md:gap-8">
                        <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase text-base md:text-xl shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                           {sub.userName?.[0] || 'A'}
                        </div>
                        <div className="min-w-0">
                           <p className="font-bold text-[#0F172A] text-sm md:text-xl leading-tight truncate">{sub.userName}</p>
                           <p className="text-[9px] md:text-[11px] text-slate-400 font-bold mt-1.5 truncate lowercase tracking-tight">{sub.userEmail}</p>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell>
                     <div className="space-y-2">
                        <Badge className="bg-primary/10 text-primary border-none text-[8px] md:text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg shadow-sm">
                           {sub.planName}
                        </Badge>
                        <p className="text-[9px] md:text-[11px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                           <Clock className="h-3.5 w-3.5" /> Exp: {new Date(sub.expiryDate).toLocaleDateString('en-GB')}
                        </p>
                     </div>
                  </TableCell>
                  <TableCell className="text-center">
                     <Badge className={cn(
                        "border-none text-[8px] md:text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm",
                        sub.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                     )}>
                        {sub.status === 'ACTIVE' ? 'System Online' : 'Expired'}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-right px-8 md:px-12">
                     <div className="flex justify-end gap-2 md:gap-4 opacity-20 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => handleExtend(sub.id, sub.expiryDate, sub.userName)} 
                          className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 active:scale-90 transition-all" 
                          title="Extend 30 Days"
                        >
                           <Zap className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDeactivate(sub.id, sub.userName)} 
                          className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-amber-600 hover:bg-amber-50 active:scale-90 transition-all" 
                          title="Deactivate"
                        >
                           <XCircle className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(sub.id, sub.userName)} 
                          className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all" 
                          title="Purge Node"
                        >
                           <Trash2 className="h-5 w-5" />
                        </button>
                     </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                   <TableCell colSpan={4} className="h-80 md:h-[400px] text-center">
                      <div className="flex flex-col items-center justify-center opacity-10 space-y-6">
                         <ShieldCheck className="h-20 w-20 md:h-32 md:w-32 text-slate-400" />
                         <p className="font-black text-xl md:text-3xl uppercase tracking-[0.4em]">Registry Empty</p>
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
