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
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, orderBy, doc, updateDoc, serverTimestamp, deleteDoc } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Support Ticket Management Console v2.2 (Build Fixed).
 * FIXED: Synchronized missing component imports for stable build.
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
      toast({ title: "Reply Transmitted", description: "Aspirant has been notified." })
      setReply("")
      setSelectedTicket(null)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleResolve = async (id: string) => {
     if (!db) return
     await updateDoc(doc(db, "support_tickets", id), { status: "RESOLVED", updatedAt: serverTimestamp() })
     toast({ title: "Ticket Resolved" })
  }

  const handleDelete = async (id: string) => {
    if (!db || !confirm("Permanently purge this ticket?")) return
    await deleteDoc(doc(db, "support_tickets", id))
    toast({ title: "Ticket Purged" })
  }

  return (
    <div className="space-y-12 pb-24 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Support Governance Console</span>
           </div>
          <h1 className="text-5xl font-black font-headline text-[#0F172A] uppercase tracking-tight">Support Tickets</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Monitoring {tickets?.length || 0} student issue nodes across the registry.</p>
        </div>
      </div>

      <div className="mx-4 relative group max-w-2xl">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
         <Input className="h-16 pl-16 rounded-[1.5rem] bg-white border-none shadow-2xl text-lg font-medium text-[#0F172A]" placeholder="Search student or subject..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <Card className="border-none shadow-3xl bg-white rounded-[3rem] overflow-hidden mx-4">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-20">
                <TableHead className="px-12 text-[10px] font-black uppercase text-slate-500">Aspirant Hub</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-500">Issue Context</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-500">Status</TableHead>
                <TableHead className="text-right px-12 text-[10px] font-black uppercase text-slate-500">Audit Control</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={4} className="p-10"><Skeleton className="h-16 w-full rounded-2xl" /></TableCell></TableRow>
                ))
              ) : filteredTickets.map((ticket: any) => (
                <TableRow key={ticket.id} className="hover:bg-slate-50 border-slate-50 transition-all group">
                  <TableCell className="px-12 py-10">
                     <div className="flex items-center gap-6">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase text-xs">
                           {ticket.userName?.[0] || 'A'}
                        </div>
                        <div>
                           <p className="font-black text-[#0F172A] text-lg uppercase leading-none">{ticket.userName}</p>
                           <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">{ticket.userEmail}</p>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell>
                     <div className="space-y-1.5">
                        <Badge variant="outline" className="border-slate-100 text-slate-500 text-[8px] font-black uppercase px-2">{ticket.type}</Badge>
                        <p className="font-bold text-slate-600 line-clamp-1 max-w-xs">{ticket.subject}</p>
                     </div>
                  </TableCell>
                  <TableCell>
                     <Badge className={cn(
                        "border-none text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-lg",
                        ticket.status === 'OPEN' ? "bg-blue-50 text-blue-600" :
                        ticket.status === 'IN_PROGRESS' ? "bg-amber-50 text-amber-600" :
                        "bg-emerald-50 text-emerald-600"
                     )}>
                        {ticket.status}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-right px-12">
                     <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-all">
                        <button className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary transition-all" onClick={() => { setSelectedTicket(ticket); setReply(ticket.adminReply || ""); }}>
                           <MessageCircle className="h-5 w-5" />
                        </button>
                        <button className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-all" onClick={() => handleResolve(ticket.id)}>
                           <CheckCircle2 className="h-5 w-5" />
                        </button>
                        <button className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-all" onClick={() => handleDelete(ticket.id)}>
                           <Trash2 className="h-5 w-5" />
                        </button>
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedTicket} onOpenChange={o => !o && setSelectedTicket(null)}>
         <DialogContent className="sm:max-w-2xl rounded-[3rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
            <div className="h-2 w-full bg-[#0F172A] shrink-0" />
            <DialogHeader className="p-10 pb-4">
               <DialogTitle className="text-2xl font-black font-headline uppercase flex items-center gap-4">
                  Audit Ticket Node
               </DialogTitle>
               <DialogDescription className="text-slate-400 font-medium text-sm">Issue reported by {selectedTicket?.userName}.</DialogDescription>
            </DialogHeader>

            <div className="p-10 pt-4 space-y-8 overflow-y-auto">
               <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                  <div className="flex items-center gap-3">
                     <AlertCircle className="h-4 w-4 text-slate-400" />
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Aspirant Statement</p>
                  </div>
                  <p className="text-lg font-medium text-slate-700 leading-relaxed italic">"{selectedTicket?.message}"</p>
               </div>

               <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Admin Resolution Node (Reply)</Label>
                  <Textarea value={reply} onChange={e => setReply(e.target.value)} className="min-h-[150px] rounded-2xl bg-white border-slate-200 p-5 font-medium leading-relaxed" placeholder="Type resolution message..." />
               </div>
            </div>

            <DialogFooter className="p-10 pt-4 bg-slate-50 flex gap-4 border-t border-slate-100">
               <Button variant="ghost" onClick={() => setSelectedTicket(null)} className="rounded-xl h-14 font-black uppercase text-[10px] text-slate-400">Discard</Button>
               <Button onClick={handleReply} disabled={isSyncing} className="flex-1 bg-[#0F172A] hover:bg-black text-white h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl gap-3">
                  {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Transmit Resolution
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
