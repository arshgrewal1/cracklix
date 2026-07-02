"use client";

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, Save, Calendar, Search, Loader2, X, Bell } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, setDoc, deleteDoc, serverTimestamp, query as firestoreQuery, orderBy } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { CalendarEvent } from "@/types"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Recruitment Registry Hub CMS v11.0 (PWA Hardened).
 * FIXED: Removed syntax error at start. Standardized to Title Case.
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
       toast({ variant: "destructive", title: "Audit Blocked", description: "Post Name and Date are mandatory." })
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
      toast({ title: "Registry Synced" })
      setEditingEvent(null)
    } catch (e: any) {
      console.error('[CALENDAR_SAVE_ERROR]:', e);
      toast({ variant: "destructive", title: "Sync Failed", description: e?.message || "Could not save event." })
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
    <div className="space-y-6 md:space-y-10 text-[#0F172A] text-left animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-black text-slate-400">Recruitment Registry Hub</span>
           </div>
          <h1 className="text-2xl md:text-5xl font-black tracking-tight text-[#0F172A]">Exam Calendar</h1>
          <p className="text-slate-500 text-[11px] md:text-lg font-medium leading-tight">Manage upcoming recruitment dates and official notifications.</p>
        </div>
        <Button 
          onClick={() => setEditingEvent({ board: "PSSSB", post: "", date: "", status: "Upcoming", type: "Exam", color: "bg-primary", published: true })} 
          className="w-full md:w-auto bg-primary hover:bg-blue-700 h-11 md:h-14 px-8 rounded-full font-black text-[10px] tracking-widest shadow-xl border-none active:scale-95 gap-2"
        >
          <Plus className="h-4 w-4" /> Add Calendar Node
        </Button>
      </div>

      <div className="relative group px-1">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
         <Input 
           className="h-14 md:h-16 pl-14 rounded-2xl md:rounded-full bg-white border-slate-50 shadow-inner text-base md:text-lg font-bold" 
           placeholder="Search calendar..." 
           value={searchTerm} 
           onChange={e => setSearchTerm(e.target.value)} 
         />
      </div>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-14 md:h-20">
                <TableHead className="px-6 md:px-12 text-[9px] md:text-[10px] font-black text-slate-400">Recruitment & Board</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-black text-slate-400">Scheduled Date</TableHead>
                <TableHead className="text-right px-6 md:px-12 text-[9px] md:text-[10px] font-black text-slate-400">Control</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <TableRow key={i} className="border-slate-50"><TableCell colSpan={3} className="px-6 py-6 md:px-12 md:py-8"><Skeleton className="h-10 w-full rounded-xl bg-slate-50" /></TableCell></TableRow>)
              ) : filteredEvents.map((e) => (
                <TableRow key={e.id} className="hover:bg-slate-50 group border-slate-50 transition-all">
                  <TableCell className="px-6 md:px-12 py-5 md:py-8 text-left">
                     <div className="flex items-center gap-4 md:gap-6">
                        <div className={cn("h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner", e.color)}>
                           <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div>
                           <p className="font-bold text-[#0F172A] text-sm md:text-lg leading-tight truncate max-w-[200px] md:max-w-md">{e.post}</p>
                           <Badge variant="outline" className="text-[7px] md:text-[8px] font-black uppercase border-slate-200 text-slate-400 mt-1">{e.board} Hub</Badge>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell><p className="font-bold text-[#0F172A] text-xs md:text-base tabular-nums">{e.date}</p></TableCell>
                  <TableCell className="text-right px-6 md:px-12">
                     <div className="flex justify-end gap-2 md:gap-3 opacity-20 group-hover:opacity-100 transition-all">
                        <button onClick={() => setEditingEvent(e)} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90"><Edit className="h-5 w-5" /></button>
                        <button onClick={() => handleDelete(e.id)} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90"><Trash2 className="h-5 w-5" /></button>
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingEvent} onOpenChange={o => !o && setEditingEvent(null)}>
         <DialogContent className="sm:max-w-xl w-[95vw] max-h-[95vh] rounded-3xl md:rounded-[3rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
            <div className="h-2 w-full bg-primary shrink-0" />
            <DialogHeader className="p-6 md:p-10 pb-2 md:pb-4 shrink-0">
               <DialogTitle className="text-xl md:text-3xl font-black text-[#0F172A]">Calendar Node Architect</DialogTitle>
               <DialogDescription className="text-slate-400 font-bold text-[9px] md:text-sm mt-1">Add or edit official recruitment dates.</DialogDescription>
            </DialogHeader>
            <div className="px-6 md:px-10 pb-6 md:pb-10 space-y-6 md:space-y-8 overflow-y-auto custom-scrollbar flex-1">
               <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-1.5 text-left">
                     <Label className="text-[9px] font-black text-slate-500 ml-1">Board</Label>
                     <Input value={editingEvent?.board || ""} onChange={e => setEditingEvent({...editingEvent, board: e.target.value.toUpperCase()})} className="h-12 md:h-14 rounded-xl border-slate-200 bg-slate-50 font-black" placeholder="e.g. PSSSB" />
                  </div>
                  <div className="space-y-1.5 text-left">
                     <Label className="text-[9px] font-black text-slate-500 ml-1">Type</Label>
                     <select value={editingEvent?.type || "Exam"} onChange={e => setEditingEvent({...editingEvent, type: e.target.value})} className="w-full h-12 md:h-14 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none shadow-inner">
                        <option value="Exam">Exam</option>
                        <option value="Registration">Registration</option>
                        <option value="Event">Event</option>
                        <option value="Forecast">Forecast</option>
                     </select>
                  </div>
               </div>
               <div className="space-y-1.5 text-left">
                  <Label className="text-[9px] font-black text-slate-500 ml-1">Post Title</Label>
                  <Input value={editingEvent?.post || ""} onChange={e => setEditingEvent({...editingEvent, post: e.target.value})} className="h-12 md:h-14 rounded-xl border-slate-200 bg-slate-50 font-bold" placeholder="e.g. Revenue Patwari" />
               </div>
               <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-1.5 text-left">
                     <Label className="text-[9px] font-black text-slate-500 ml-1">Date String</Label>
                     <Input value={editingEvent?.date || ""} onChange={e => setEditingEvent({...editingEvent, date: e.target.value})} className="h-12 md:h-14 rounded-xl border-slate-200 bg-slate-50 font-bold text-center" placeholder="e.g. 15 Mar 2026" />
                  </div>
                  <div className="space-y-1.5 text-left">
                     <Label className="text-[9px] font-black text-slate-500 ml-1">Status Label</Label>
                     <Input value={editingEvent?.status || ""} onChange={e => setEditingEvent({...editingEvent, status: e.target.value})} className="h-12 md:h-14 rounded-xl border-slate-200 bg-slate-50 font-bold text-center" placeholder="e.g. Notification Out" />
                  </div>
               </div>
               <div className="space-y-1.5 text-left">
                  <Label className="text-[9px] font-black text-slate-500 ml-1">Theme Color (CSS Class)</Label>
                  <Input value={editingEvent?.color || "bg-primary"} onChange={e => setEditingEvent({...editingEvent, color: e.target.value})} className="h-12 md:h-14 rounded-xl border-slate-200 bg-slate-50 font-mono text-xs text-primary" />
               </div>
            </div>
            <DialogFooter className="p-6 md:p-10 pt-4 bg-slate-50 border-t border-slate-100 flex flex-row gap-4">
               <Button variant="ghost" onClick={() => setEditingEvent(null)} className="h-11 md:h-12 px-6 font-black uppercase text-[10px] text-slate-400">Discard</Button>
               <Button onClick={handleSave} disabled={isSaving} className="flex-1 bg-primary hover:bg-blue-700 text-white h-11 md:h-12 rounded-full font-black text-[10px] tracking-widest shadow-xl gap-2 active:scale-95 border-none">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Commit Node
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
