"use client";

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, FileText, Download, Save, Search, Layers, Loader2, Landmark } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, setDoc, deleteDoc, orderBy, serverTimestamp } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional PYQ Archive CMS v19.0 (PWA Hardened).
 * FIXED: Renamed editingNote typo to editingPYQ to resolve build error.
 */

export default function AdminPYQManagement() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const pyqQuery = useMemo(() => (db ? query(collection(db, "pyqs"), orderBy("year", "desc")) : null), [db])
  const { data: pyqs, loading } = useCollection<any>(pyqQuery)
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))

  const [editingPYQ, setEditingPYQ] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!db || !editingPYQ || isSaving) return

    if (!editingPYQ.title || !editingPYQ.pdfUrl || !editingPYQ.examId) {
      toast({ variant: "destructive", title: "Audit Blocked", description: "Config incomplete." })
      return
    }

    setIsSaving(true)
    const pyqId = editingPYQ.id || `pyq-${Date.now()}`
    const pyqRef = doc(db, "pyqs", pyqId)
    
    const payload = {
      ...editingPYQ,
      id: pyqId,
      updatedAt: serverTimestamp(),
      createdAt: editingPYQ.createdAt || serverTimestamp(),
      year: parseInt(editingPYQ.year) || new Date().getFullYear(),
      status: 'VERIFIED'
    }

    try {
      await setDoc(pyqRef, payload, { merge: true })
      toast({ title: "Archive Updated" })
      setEditingPYQ(null)
    } catch (err: any) {
      toast({ variant: "destructive", title: "Sync Failed" })
    } finally {
      setIsSaving(false)
    }
  }

  const filteredPYQs = useMemo(() => {
    if (!pyqs) return []
    return pyqs.filter(p => 
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.examId?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [pyqs, searchTerm])

  return (
    <div className="space-y-6 md:space-y-10 pb-24 text-[#0F172A] text-left animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-1">
              <Landmark className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-black tracking-[0.1em] text-slate-400">Official Audit Archives</span>
           </div>
          <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-none">PYQ Registry</h1>
          <p className="text-slate-500 text-[11px] md:text-lg font-medium">Manage authentic previous year papers and official keys.</p>
        </div>
        <Button onClick={() => setEditingPYQ({ title: "", boardId: "", examId: "", year: new Date().getFullYear(), pdfUrl: "", isFree: true })} className="w-full md:w-auto h-11 md:h-14 px-8 bg-primary hover:bg-blue-700 text-white rounded-full font-black text-[10px] tracking-widest shadow-xl border-none active:scale-95 gap-2">
          <Plus className="h-4 w-4" /> Archive Paper
        </Button>
      </div>

      <div className="relative group px-1">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
         <Input className="h-14 md:h-16 pl-14 rounded-2xl md:rounded-full bg-white border-slate-50 shadow-inner text-base md:text-lg font-bold" placeholder="Search archives..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 text-left overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-14 md:h-20">
                <TableHead className="px-6 md:px-12 text-[9px] md:text-[10px] font-black text-slate-400">Paper Identity</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-black text-slate-400">Vertical Hub</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-black text-slate-400 text-center">Year</TableHead>
                <TableHead className="text-right px-6 md:px-12 text-[9px] md:text-[10px] font-black text-slate-400">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-50"><TableCell colSpan={4} className="px-6 py-6 md:px-12 md:py-10"><Skeleton className="h-10 w-full rounded-xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : filteredPYQs.map((p: any) => (
                <TableRow key={p.id} className="hover:bg-slate-50 border-slate-50 transition-colors group">
                  <TableCell className="px-6 md:px-12 py-5 md:py-10">
                    <div className="flex items-center gap-4 md:gap-6">
                       <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner shrink-0"><FileText className="h-5 w-5" /></div>
                       <div className="min-w-0">
                          <p className="font-bold text-[#0F172A] text-sm md:text-lg leading-tight truncate">{p.title}</p>
                          <code className="text-[8px] font-mono text-slate-300 uppercase mt-1 block">ID: {p.id.slice(-8)}</code>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>
                     <div className="space-y-1">
                        <p className="font-bold text-slate-600 text-xs md:text-sm line-clamp-1">{exams?.find((e:any) => e.id === p.examId)?.name || p.examId}</p>
                        <Badge variant="outline" className="border-slate-100 text-slate-400 text-[7px] font-black uppercase px-2 rounded">{p.boardId || 'OFFICIAL'} HUB</Badge>
                     </div>
                  </TableCell>
                  <TableCell className="text-center">
                     <span className="font-black text-base md:text-2xl text-slate-300 group-hover:text-primary transition-colors tabular-nums">{p.year}</span>
                  </TableCell>
                  <TableCell className="text-right px-6 md:px-12">
                     <div className="flex justify-end gap-2 md:gap-3 opacity-20 group-hover:opacity-100 transition-all">
                        <button onClick={() => setEditingPYQ(p)} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90 transition-all"><Edit className="h-5 w-5" /></button>
                        <button onClick={async () => { if(confirm("Purge paper node?")) await deleteDoc(doc(db!, "pyqs", p.id)) }} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all"><Trash2 className="h-5 w-5" /></button>
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingPYQ} onOpenChange={o => !o && !isSaving && setEditingPYQ(null)}>
         <DialogContent className="sm:max-w-xl w-[95vw] max-h-[90vh] bg-white rounded-3xl md:rounded-[3rem] border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
            <div className="h-2 w-full bg-primary shrink-0" />
            <DialogHeader className="p-6 md:p-10 pb-2 md:pb-4 shrink-0">
               <DialogTitle className="text-xl md:text-3xl font-black text-[#0F172A]">Archive Architect</DialogTitle>
               <DialogDescription className="text-slate-400 font-bold text-[9px] md:text-sm mt-1">Register official recruitment papers.</DialogDescription>
            </DialogHeader>
            <div className="px-6 md:px-10 pb-6 md:pb-10 space-y-6 md:space-y-8 overflow-y-auto custom-scrollbar flex-1">
               <div className="space-y-2 text-left">
                  <Label className="text-[9px] font-black text-slate-500 ml-1">Archive Title</Label>
                  <Input value={editingPYQ?.title || ""} onChange={e => setEditingPYQ({...editingPYQ, title: e.target.value})} className="h-12 md:h-14 rounded-xl border-slate-200 bg-slate-50 font-bold" placeholder="e.g. PSSSB Patwari 2025 Solved" />
               </div>
               <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2 text-left">
                     <Label className="text-[9px] font-black text-slate-500 ml-1">Assigned Board</Label>
                     <select value={editingPYQ?.boardId || ""} onChange={e => setEditingPYQ({...editingPYQ, boardId: e.target.value})} className="w-full h-12 md:h-14 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none shadow-inner">
                        <option value="">Select Board</option>
                        {boards?.map((b: any) => <option key={b.id} value={b.id}>{b.abbreviation}</option>)}
                     </select>
                  </div>
                  <div className="space-y-2 text-left">
                     <Label className="text-[9px] font-black text-slate-500 ml-1">Assigned Exam</Label>
                     <select value={editingPYQ?.examId || ""} onChange={e => setEditingPYQ({...editingPYQ, examId: e.target.value})} className="w-full h-12 md:h-14 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none shadow-inner">
                        <option value="">Select Exam</option>
                        {exams?.filter((e:any) => !editingPYQ?.boardId || e.boardId === editingPYQ.boardId).map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
                     </select>
                  </div>
               </div>
               <div className="space-y-2 text-left">
                  <Label className="text-[9px] font-black text-slate-500 ml-1">Paper Year</Label>
                  <Input type="number" value={editingPYQ?.year || 2025} onChange={e => setEditingPYQ({...editingPYQ, year: e.target.value})} className="h-12 md:h-14 rounded-xl border-slate-200 bg-slate-50 text-center font-black" />
               </div>
               <div className="space-y-2 text-left">
                  <Label className="text-[9px] font-black text-slate-500 ml-1">PDF Registry URL</Label>
                  <Input value={editingPYQ?.pdfUrl || ""} onChange={e => setEditingPYQ({...editingPYQ, pdfUrl: e.target.value})} className="h-12 md:h-14 rounded-xl border-slate-200 bg-slate-50 font-mono text-xs text-primary" placeholder="https://..." />
               </div>
            </div>
            <DialogFooter className="p-6 md:p-10 pt-4 bg-slate-50 border-t border-slate-100 flex flex-row gap-4">
               <Button variant="ghost" onClick={() => setEditingPYQ(null)} className="h-11 md:h-12 px-6 font-black uppercase text-[10px] text-slate-400">Discard</Button>
               <Button onClick={handleSave} disabled={isSaving} className="flex-1 bg-primary hover:bg-blue-700 text-white h-11 md:h-12 rounded-full font-black text-[10px] tracking-widest shadow-xl gap-2 active:scale-95 border-none">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Commit Node
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}