"use client";

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, Save, Calendar, Search, Loader2, X, Bell, Info } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, setDoc, deleteDoc, serverTimestamp, orderBy } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { CalendarEvent } from "@/types"
import { cn } from "@/lib/utils"
import { AdminPageHeader, AdminSearchInput, AdminTableSkeleton, AdminDialogShell } from "@/components/admin"

/**
 * @fileOverview Recruitment Registry Hub CMS v12.0 (High-Fidelity Update).
 * FIXED: Balanced header spacing and refined dialog architecture.
 */

export default function CalendarManagement() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const calendarQuery = useMemo(() => (db ? query(collection(db, "exam_calendar"), orderBy("createdAt", "desc")) : null), [db])
  const { data: events, loading } = useCollection<CalendarEvent>(calendarQuery as any)

  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const handleSave = async () => {
    if (!db || !editingEvent) return
    if (!editingEvent.post || !editingEvent.date) {
       toast({ variant: "destructive", title: "Audit Blocked", description: "Post Name and Date are mandatory nodes." })
       return
    }

    setIsSaving(true)
    const id = editingEvent.id || `event-${Date.now()}`
    try {
      await setDoc(doc(db, "exam_calendar", id), {
        ...editingEvent,
        id,
        updatedAt: serverTimestamp(),
        createdAt: editingEvent.createdAt || serverTimestamp()
      }, { merge: true })
      toast({ title: "Registry Synced", description: "Calendar node successfully updated." })
      setEditingEvent(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!db || !confirm("Permanently purge this calendar node?")) return
    await deleteDoc(doc(db, "exam_calendar", id))
    toast({ title: "Removed from Registry" })
  }

  const filteredEvents = useMemo(() => {
    if (!events) return []
    return events.filter(e => 
      e.post?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.board?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [events, searchTerm])

  return (
    <div className="space-y-10 md:space-y-16 text-[#0F172A] text-left animate-in fade-in duration-700 pb-20 pt-2">
      
      {/* 1. HEADER HUB */}
      <AdminPageHeader
        icon={Calendar}
        label="Recruitment Registry Hub"
        title="Exam Calendar"
        subtitle="Manage upcoming recruitment dates and official notifications."
        actionLabel="Add Calendar Node"
        actionIcon={Plus}
        onAction={() => setEditingEvent({ board: "PSSSB", post: "", date: "", status: "Upcoming", type: "Exam", color: "bg-primary", published: true })}
      />

      {/* 2. SEARCH ENGINE */}
      <AdminSearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search calendar events..."
      />

      {/* 3. DATA LEDGER */}
      <Card className="border-none shadow-3xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-16 md:h-24">
                <TableHead className="px-8 md:px-12 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Recruitment & Board</TableHead>
                <TableHead className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Scheduled Date</TableHead>
                <TableHead className="text-right px-8 md:px-12 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Control</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <AdminTableSkeleton rows={4} columns={3} />
              ) : filteredEvents.length > 0 ? filteredEvents.map((e) => (
                <TableRow key={e.id} className="hover:bg-slate-50 group border-slate-50 transition-all">
                  <TableCell className="px-8 md:px-12 py-6 md:py-12 text-left">
                     <div className="flex items-center gap-4 md:gap-8">
                        <div className={cn("h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform", e.color || 'bg-primary')}>
                           <Calendar className="h-6 w-6 md:h-8 md:w-8 text-white" />
                        </div>
                        <div className="min-w-0">
                           <p className="font-black text-[#0F172A] text-sm md:text-xl leading-tight truncate max-w-[250px] md:max-w-md uppercase">{e.post}</p>
                           <Badge variant="outline" className="text-[8px] md:text-[9px] font-black uppercase border-slate-200 text-slate-400 mt-2 tracking-widest">{e.board} Hub</Badge>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell>
                     <div className="space-y-1">
                        <p className="font-black text-[#0F172A] text-xs md:text-lg tabular-nums">{e.date}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{e.status}</p>
                     </div>
                  </TableCell>
                  <TableCell className="text-right px-8 md:px-12">
                     <div className="flex justify-end gap-2 md:gap-4 opacity-20 group-hover:opacity-100 transition-all">
                        <button onClick={() => setEditingEvent(e)} className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90 transition-all"><Edit className="h-5 w-5" /></button>
                        <button onClick={() => handleDelete(e.id)} className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all"><Trash2 className="h-5 w-5" /></button>
                     </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                   <TableCell colSpan={3} className="h-80 md:h-[400px] text-center">
                      <div className="flex flex-col items-center justify-center opacity-10 space-y-6">
                         <Calendar className="h-20 w-20 md:h-32 md:w-32 text-slate-400" />
                         <p className="font-black text-sm md:text-2xl uppercase tracking-widest">No Events Found</p>
                      </div>
                   </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 4. DIALOG HUB */}
      <AdminDialogShell
        open={!!editingEvent}
        onOpenChange={(o) => !o && setEditingEvent(null)}
        title="Calendar Node Architect"
        description="Add or edit official recruitment dates in the registry."
        isSaving={isSaving}
        onSave={handleSave}
        onDiscard={() => setEditingEvent(null)}
        saveLabel="Commit Node"
      >
        <div className="grid grid-cols-2 gap-4 md:gap-8">
           <div className="space-y-1.5 text-left">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Official Board</Label>
              <Input value={editingEvent?.board || ""} onChange={e => setEditingEvent({...editingEvent, board: e.target.value.toUpperCase()})} className="h-12 md:h-16 rounded-xl md:rounded-2xl border-none bg-slate-50 font-black px-6 shadow-inner" placeholder="E.G. PSSSB" />
           </div>
           <div className="space-y-1.5 text-left">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Event Type</Label>
              <select value={editingEvent?.type || "Exam"} onChange={e => setEditingEvent({...editingEvent, type: e.target.value})} className="w-full h-12 md:h-16 bg-slate-50 border-none rounded-xl md:rounded-2xl px-6 outline-none font-bold text-sm shadow-inner appearance-none cursor-pointer">
                 <option value="Exam">Official Exam</option>
                 <option value="Registration">Open Registration</option>
                 <option value="Event">Special Event</option>
                 <option value="Forecast">Recruitment Forecast</option>
              </select>
           </div>
        </div>
        <div className="space-y-1.5 text-left">
           <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Post / Recruitment Title</Label>
           <Input value={editingEvent?.post || ""} onChange={e => setEditingEvent({...editingEvent, post: e.target.value})} className="h-12 md:h-16 rounded-xl md:rounded-2xl border-none bg-slate-50 font-black text-lg px-6 shadow-inner" placeholder="e.g. Revenue Patwari" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:gap-8">
           <div className="space-y-1.5 text-left">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Scheduled Date</Label>
              <Input value={editingEvent?.date || ""} onChange={e => setEditingEvent({...editingEvent, date: e.target.value})} className="h-12 md:h-16 rounded-xl md:rounded-2xl border-none bg-slate-50 font-bold text-center px-6 shadow-inner" placeholder="e.g. 15 Mar 2026" />
           </div>
           <div className="space-y-1.5 text-left">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Current Status</Label>
              <Input value={editingEvent?.status || ""} onChange={e => setEditingEvent({...editingEvent, status: e.target.value})} className="h-12 md:h-16 rounded-xl md:rounded-2xl border-none bg-slate-50 font-bold text-center px-6 shadow-inner" placeholder="e.g. Notification Out" />
           </div>
        </div>
        <div className="space-y-1.5 text-left">
           <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2">Theme Color Node <Badge variant="outline" className="text-[7px] font-black">CSS</Badge></Label>
           <Input value={editingEvent?.color || "bg-primary"} onChange={e => setEditingEvent({...editingEvent, color: e.target.value})} className="h-12 md:h-16 rounded-xl md:rounded-2xl border-none bg-slate-50 font-mono text-xs text-primary px-6 shadow-inner" />
        </div>
      </AdminDialogShell>
    </div>
  )
}
