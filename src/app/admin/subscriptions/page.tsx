"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  ShieldCheck, 
  Trash2, 
  Edit, 
  ChevronRight, 
  Clock, 
  User, 
  Loader2, 
  Zap,
  Filter,
  CheckCircle2,
  Calendar,
  MousePointer2,
  XCircle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, orderBy, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Professional Subscription Governance Hub v1.0.
 */

export default function SubscriptionManagement() {
  const db = useFirestore()
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

  const handleDeactivate = async (id: string) => {
     if (!db) return
     if (!confirm("Deactivate this subscription node?")) return
     await updateDoc(doc(db, "subscriptions", id), { status: "EXPIRED", updatedAt: serverTimestamp() })
     toast({ title: "Node Deactivated" })
  }

  const handleExtend = async (id: string, currentExpiry: string) => {
     if (!db) return
     const expiry = new Date(currentExpiry)
     expiry.setDate(expiry.getDate() + 30) // Extend by 30 days
     await updateDoc(doc(db, "subscriptions", id), { expiryDate: expiry.toISOString(), status: "ACTIVE", updatedAt: serverTimestamp() })
     toast({ title: "Validity Extended", description: "Added 30 days to preparation cycle." })
  }

  const handleDelete = async (id: string) => {
    if (!db) return
    if (!confirm("Permanently purge this record?")) return
    await deleteDoc(doc(db, "subscriptions", id))
    toast({ title: "Registry Sanitized" })
  }

  return (
    <div className="space-y-6 md:space-y-12 text-[#0F172A] text-left animate-in fade-in duration-500">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Subscription Governance Hub</span>
           </div>
          <h1 className="text-2xl md:text-5xl font-black tracking-tight">Active Passes</h1>
          <p className="text-slate-500 text-[11px] md:text-lg font-medium">Monitoring {filteredSubs.length} verified preparation nodes across the state.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-1">
         <div className="md:col-span-8 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
            <Input 
              className="h-14 md:h-16 pl-14 rounded-2xl md:rounded-full bg-white border-slate-50 shadow-inner text-base md:text-lg font-bold" 
              placeholder="Search aspirant or transaction..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="md:col-span-4">
            <select 
               value={statusFilter} 
               onChange={e => setStatusFilter(e.target.value)}
               className="w-full h-14 md:h-16 bg-white border-slate-50 shadow-inner rounded-2xl md:rounded-full px-6 font-bold text-sm outline-none appearance-none cursor-pointer"
            >
               <option value="all">All Status</option>
               <option value="ACTIVE">System Online</option>
               <option value="EXPIRED">Pass Expired</option>
            </select>
         </div>
      </div>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="h-14 border-slate-100">
                <TableHead className="px-6 md:px-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Aspirant Hub</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Pass Details</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</TableHead>
                <TableHead className="text-right px-6 md:px-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={4} className="p-10"><Skeleton className="h-14 w-full rounded-2xl" /></TableCell></TableRow>)
              ) : filteredSubs.length > 0 ? filteredSubs.map((sub: any) => (
                <TableRow key={sub.id} className="hover:bg-slate-50 border-slate-50 transition-all group">
                  <TableCell className="px-6 md:px-12 py-5 md:py-8">
                     <div className="flex items-center gap-4 md:gap-6">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-slate-50 flex items-center justify-center text-[#0F172A] font-black shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                           {sub.userName?.[0] || 'A'}
                        </div>
                        <div className="min-w-0">
                           <p className="font-bold text-[#0F172A] text-sm md:text-lg leading-tight truncate">{sub.userName}</p>
                           <p className="text-[9px] text-slate-400 font-bold mt-1 lowercase truncate">{sub.userEmail}</p>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell>
                     <div className="space-y-1">
                        <Badge className="bg-primary/10 text-primary border-none text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm">
                           {sub.planName}
                        </Badge>
                        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                           <Clock className="h-3 w-3" /> Exp: {new Date(sub.expiryDate).toLocaleDateString()}
                        </p>
                     </div>
                  </TableCell>
                  <TableCell className="text-center">
                     <Badge className={cn(
                        "border-none text-[8px] md:text-[9px] font-black uppercase px-3 py-1 rounded shadow-sm",
                        sub.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                     )}>
                        {sub.status}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-right px-6 md:px-12">
                     <div className="flex justify-end gap-2 md:gap-3 opacity-20 group-hover:opacity-100 transition-all">
                        <button onClick={() => handleExtend(sub.id, sub.expiryDate)} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 active:scale-95 transition-all" title="Extend 30 Days">
                           <Zap className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeactivate(sub.id)} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-amber-600 hover:bg-amber-50 active:scale-95 transition-all" title="Deactivate">
                           <XCircle className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(sub.id)} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-95 transition-all" title="Delete">
                           <Trash2 className="h-4 w-4" />
                        </button>
                     </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                   <TableCell colSpan={4} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center opacity-10 space-y-4">
                         <ShieldCheck className="h-16 w-16" />
                         <p className="font-black text-2xl uppercase tracking-widest">No Subscriptions Found</p>
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
