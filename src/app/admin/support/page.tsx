"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  MessageCircle, 
  ShieldCheck, 
  Clock, 
  User, 
  ChevronRight, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  X,
  Send,
  Search
} from "lucide-react"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, orderBy, doc, updateDoc, serverTimestamp, deleteDoc } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Support Ticket Management Console v5.1.
 * FIXED: Refined header spacing and typography to prevent layout tightness.
 */

export default function AdminSupportManagement() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [reply, setReply] = useState("")
  const [isSyncing, setIsSyncing] = useState(false)

  const ticketsQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "support_tickets"), orderBy("createdAt", "desc"))
  }, [db])

  const { data: tickets, loading } = useCollection<any>(ticketsQuery)

  const filteredTickets = useMemo(() => {
    if (!tickets) return []
    return tickets.filter((t: any) => 
      t.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [tickets, searchTerm])

  const handleReply = async () => {
    if (!db || !selectedTicket || !reply.trim()) return
    setIsSyncing(true)
    try {
      await updateDoc(doc(db, "support_tickets", selectedTicket.id), {
        adminReply: reply,
        status: "IN_PROGRESS",
        updatedAt: serverTimestamp()
      })
      toast({ title: "Reply Transmitted", description: "Student has been notified." })
      setReply("")
      setSelectedTicket(null)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleResolve = async (id: string) => {
     if (!db) return
     await updateDoc(doc(db, "support_tickets", id), { status: "RESOLVED", updatedAt: serverTimestamp() })
     toast({ title: "Ticket Resolved", description: "Node marked as complete." })
  }

  const handleDelete = async (id: string) => {
    if (!db) return
    if (!confirm("Permanently purge this ticket from the registry?")) return
    await deleteDoc(doc(db, "support_tickets", id))
    toast({ title: "Ticket Purged" })
  }

  return (
    <div className="space-y-10 md:space-y-16 pb-24 text-left animate-in fade-in duration-500 text-[#0F172A] pt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-2">
           <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Support Governance</span>
           </div>
          <h1 className="text-3xl md:text-6xl font-black tracking-tight text-[#0F172A] leading-none">Support Desk</h1>
          <p className="text-slate-500 text-[13px] md:text-lg font-medium leading-tight">Monitoring {tickets?.length || 0} student issues across the platform.</p>
        </div>
      </div>

      <div className="mx-1 relative group w-full max-w-2xl">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
         <Input 
           className="h-14 md:h-18 pl-14 rounded-2xl md:rounded-[2rem] bg-white border-slate-100 shadow-xl text-base md:text-lg font-bold" 
           placeholder="Search student or subject..." 
           value={searchTerm} 
           onChange={e => setSearchTerm(e.target.value)} 
         />
      </div>

      <Card className="border-none shadow-3xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-slate-100 h-16 md:h-24">
                  <TableHead className="px-8 md:px-12 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Hub</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Issue Details</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</TableHead>
                  <TableHead className="text-right px-8 md:px-12 text-[10px] font-black uppercase tracking-widest text-slate-400">Audit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-slate-50"><TableCell colSpan={4} className="px-8 py-8"><Skeleton className="h-12 w-full rounded-xl bg-slate-50" /></TableCell></TableRow>
                  ))
                ) : filteredTickets.length > 0 ? filteredTickets.map((ticket: any) => (
                  <TableRow key={ticket.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <TableCell className="px-8 md:px-12 py-6 md:py-12">
                       <div className="flex items-center gap-4 md:gap-8">
                          <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase text-[10px] md:text-xs shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                             {ticket.userName?.[0] || 'A'}
                          </div>
                          <div className="min-w-0">
                             <p className="font-bold text-[#0F172A] text-sm md:text-xl leading-tight truncate">{ticket.userName}</p>
                             <p className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 truncate">{ticket.userEmail}</p>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="space-y-2">
                          <Badge variant="outline" className="border-slate-100 text-slate-500 text-[8px] md:text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg shadow-sm w-fit">{ticket.type}</Badge>
                          <p className="font-bold text-slate-600 text-xs md:text-base line-clamp-1 max-w-[250px] leading-snug">{ticket.subject}</p>
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <Badge className={cn(
                          "border-none text-[8px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm",
                          ticket.status === 'OPEN' ? "bg-blue-50 text-blue-600" :
                          ticket.status === 'IN_PROGRESS' ? "bg-amber-50 text-amber-600" :
                          "bg-emerald-50 text-emerald-600"
                       )}>
                          {ticket.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right px-8 md:px-12">
                       <div className="flex justify-end gap-2 md:gap-4 opacity-20 group-hover:opacity-100 transition-all">
                          <button className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-90" onClick={() => { setSelectedTicket(ticket); setReply(ticket.adminReply || ""); }}>
                             <MessageCircle className="h-5 w-5" />
                          </button>
                          <button className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-all active:scale-90" onClick={() => handleResolve(ticket.id)}>
                             <CheckCircle2 className="h-5 w-5" />
                          </button>
                          <button className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-all active:scale-90" onClick={() => handleDelete(ticket.id)}>
                             <Trash2 className="h-5 w-5" />
                          </button>
                       </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                     <TableCell colSpan={4} className="h-80 text-center">
                        <div className="flex flex-col items-center justify-center opacity-10 space-y-6">
                           <MessageCircle className="h-20 w-20 md:h-24 md:w-24 text-slate-400" />
                           <p className="font-black text-sm md:text-2xl uppercase tracking-widest">No Active Tickets</p>
                        </div>
                     </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedTicket} onOpenChange={o => !o && setSelectedTicket(null)}>
         <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] bg-white rounded-3xl md:rounded-[3rem] border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
            <div className="h-2 w-full bg-[#0F172A] shrink-0" />
            <DialogHeader className="p-6 md:p-14 pb-4 shrink-0">
               <div className="flex justify-between items-center">
                  <DialogTitle className="text-xl md:text-3xl font-black font-headline uppercase flex items-center gap-4">
                     <MessageCircle className="h-6 w-6 md:h-8 md:w-8 text-primary" /> Audit Ticket
                  </DialogTitle>
                  <button onClick={() => setSelectedTicket(null)} className="p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"><X className="h-6 w-6 text-slate-400" /></button>
               </div>
               <DialogDescription className="text-slate-400 font-bold uppercase text-[9px] md:text-[10px] tracking-widest mt-2">Reviewing issue from {selectedTicket?.userName}</DialogDescription>
            </DialogHeader>

            <div className="px-6 md:px-14 pb-8 space-y-6 md:space-y-10 overflow-y-auto custom-scrollbar flex-1">
               <div className="p-6 md:p-10 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                  <div className="flex items-center gap-3">
                     <AlertCircle className="h-4 w-4 text-slate-400" />
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Student Statement</p>
                  </div>
                  <p className="text-base md:text-xl font-medium text-slate-700 leading-relaxed italic">&quot;{selectedTicket?.message}&quot;</p>
               </div>

               <div className="space-y-3 text-left">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Admin Response (Visible to Student)</Label>
                  <Textarea value={reply} onChange={e => setReply(e.target.value)} className="min-h-[150px] rounded-[1.5rem] md:rounded-[2rem] bg-white border-slate-200 p-6 font-medium leading-relaxed shadow-inner focus-visible:ring-primary" placeholder="Type your resolution message..." />
               </div>
            </div>

            <DialogFooter className="p-6 md:p-14 pt-4 bg-slate-50 border-t border-slate-100 flex flex-row gap-4 items-center justify-between">
               <Button variant="ghost" onClick={() => setSelectedTicket(null)} className="h-12 md:h-14 px-6 md:px-10 font-black uppercase text-[10px] md:text-[11px] text-slate-400">Discard</Button>
               <Button onClick={handleReply} disabled={isSyncing} className="flex-1 bg-[#0F172A] hover:bg-black text-white h-12 md:h-14 lg:h-16 rounded-full font-black uppercase text-[10px] md:text-[11px] tracking-widest shadow-xl gap-3 active:scale-95 border-none">
                  {isSyncing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />} Transmit Response
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
