"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HelpCircle, Mail, MessageSquare, Clock, User, CheckCircle2, Trash2, ArrowUpRight, Search } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

/**
 * @fileOverview Institutional Support Center.
 * Standardised to high-contrast Navy/White theme for readability.
 * Fixed: Removed orderBy to prevent index errors, handling sorting client-side.
 */

export default function SupportHub() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const supportQuery = useMemo(() => (db ? query(collection(db, "support_tickets")) : null), [db])
  const { data: allTickets, loading } = useCollection<any>(supportQuery)

  const tickets = useMemo(() => {
    if (!allTickets) return []
    return [...allTickets].sort((a, b) => {
      const timeA = a.timestamp?.seconds || 0
      const timeB = b.timestamp?.seconds || 0
      return timeB - timeA
    })
  }, [allTickets])

  const handleResolve = async (id: string) => {
    await updateDoc(doc(db!, "support_tickets", id), { status: 'RESOLVED' })
    toast({ title: "Inquiry Closed", description: "Support node marked as resolved." })
  }

  return (
    <div className="space-y-12 pb-20 text-[#0F172A]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <HelpCircle className="h-6 w-6 text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Aspirant Support Gateway</span>
           </div>
          <h1 className="text-5xl font-black font-headline text-[#0F172A] uppercase tracking-tight">Support Hub</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Manage institutional inquiries and technical support requests.</p>
        </div>
        <div className="flex gap-4">
           <Card className="border-slate-100 bg-white rounded-2xl px-8 py-4 flex items-center gap-4 shadow-xl">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                 <MessageSquare className="h-5 w-5" />
              </div>
              <div className="space-y-0.5 text-left">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Active Tickets</p>
                 <p className="text-2xl font-headline font-black text-[#0F172A]">{tickets?.filter((t:any) => t.status !== 'RESOLVED').length || 0}</p>
              </div>
           </Card>
        </div>
      </div>

      <div className="relative group">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
         <Input className="pl-16 h-16 rounded-[1.5rem] bg-white border-slate-100 shadow-2xl text-lg font-medium text-[#0F172A]" placeholder="Search support repository..." />
      </div>

      <Card className="border-slate-100 shadow-3xl bg-white rounded-[3rem] overflow-hidden">
        <CardContent className="p-0 text-left">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-20">
                <TableHead className="px-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Aspirant Node</TableHead>
                <TableHead className="text-[10px) font-black uppercase tracking-[0.3em] text-slate-500">Inquiry Context</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Status</TableHead>
                <TableHead className="text-right px-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={4} className="px-12 py-10"><Skeleton className="h-16 w-full rounded-2xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : tickets && tickets.length > 0 ? (
                tickets.map((ticket: any) => (
                  <TableRow key={ticket.id} className="hover:bg-slate-50 group border-slate-50 transition-all">
                    <TableCell className="px-12 py-10">
                       <div className="flex items-center gap-6">
                          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase text-xs">
                             {ticket.name?.[0] || 'A'}
                          </div>
                          <div className="space-y-1">
                             <p className="font-bold text-[#0F172A]">{ticket.name}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{ticket.email}</p>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                       <div className="space-y-2">
                          <p className="font-bold text-slate-600 line-clamp-1">{ticket.subject || 'Institutional Inquiry'}</p>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{ticket.message}</p>
                       </div>
                    </TableCell>
                    <TableCell>
                       <Badge className={`border-none text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                         ticket.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                       }`}>
                         {ticket.status || 'PENDING'}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right px-12">
                       <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-emerald-600 hover:bg-emerald-50" onClick={() => handleResolve(ticket.id)}>
                             <CheckCircle2 className="h-6 w-6" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-rose-500 hover:bg-rose-50">
                             <Trash2 className="h-6 w-6" />
                          </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                   <TableCell colSpan={4} className="h-80 text-center">
                      <div className="flex flex-col items-center justify-center opacity-10 space-y-6 text-center">
                         <MessageSquare className="h-24 w-24 text-slate-400" />
                         <p className="font-black font-headline text-2xl uppercase tracking-[0.2em] text-slate-500">Support Queue Empty</p>
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