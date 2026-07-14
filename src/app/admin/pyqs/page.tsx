"use client";

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, FileText, Save, Search, Layers, Loader2, Landmark, X } from "lucide-react"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, doc, setDoc, deleteDoc, orderBy, serverTimestamp, addDoc } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import FileUpload from "@/components/admin/FileUpload"

/**
 * @fileOverview Institutional PYQ Archive CMS v25.0.
 * UPDATED: Replaced raw file handlers with Enterprise File Management Hub.
 */

export default function AdminPYQManagement() {
  const db = useFirestore()
  const { profile } = useUser()
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
      toast({ variant: "destructive", title: "Audit Blocked", description: "Config incomplete. Title, Exam and PDF are mandatory." })
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
      
      await addDoc(collection(db, "audit_logs"), {
        user: profile?.name || "Administrator",
        action: editingPYQ.id ? "PYQ_UPDATE" : "PYQ_CREATE",
        details: `Official paper "${editingPYQ.title}" registry node synced.`,
        timestamp: serverTimestamp()
      });

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
    return pyqs.filter((p: any) => 
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.boardId?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [pyqs, searchTerm])

  return (
    <div className="space-y-6 md:space-y-12 pb-24 text-[#0F172A] text-left animate-in fade-in duration-700 pt-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-1">
              <Landmark className="h-4 w-4 text-primary" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Official Audit Archives</span>
           </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tighter leading-none">PYQ Registry</h1>
          <p className="text-slate-500 text-[13px] md:text-lg font-medium leading-tight">Manage authentic previous year papers and official keys.</p>
        </div>
        <Button onClick={() => setEditingPYQ({ title: "", boardId: "", examId: "", year: new Date().getFullYear(), pdfUrl: "", isFree: true })} className="w-full md:w-auto h-12 md:h-16 px-10 bg-primary hover:bg-blue-700 text-white rounded-full font-black uppercase text-[10px] md:text-xs tracking-[0.2em] shadow-xl border-none active:scale-95 gap-3 shrink-0">
          <Plus className="h-5 w-5" /> Archive Paper
        </Button>
      </div>

      <div className="relative group px-1">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
         <Input className="h-16 md:h-20 pl-16 rounded-2xl md:rounded-[2rem] bg-white border-slate-100 shadow-xl text-base md:text-xl font-bold" placeholder="Search archives..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 text-left overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-16 md:h-24">
                <TableHead className="px-8 md:px-12 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Paper Identity</TableHead>
                <TableHead className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Vertical Hub</TableHead>
                <TableHead className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-center text-slate-400">Year</TableHead>
                <TableHead className="text-right px-8 md:px-12 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-50"><TableCell colSpan={4} className="px-8 py-8 md:py-12"><Skeleton className="h-10 w-full rounded-xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : filteredPYQs.length > 0 ? filteredPYQs.map((p: any) => (
                <TableRow key={p.id} className="hover:bg-slate-50 border-slate-50 transition-colors group">
                  <TableCell className="px-8 md:px-12 py-6 md:py-10">
                    <div className="flex items-center gap-4 md:gap-8">
                       <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner shrink-0 group-hover:scale-105 transition-transform"><FileText className="h-6 w-6 md:h-8 md:w-8" /></div>
                       <div className="min-w-0">
                          <p className="font-bold text-[#0F172A] text-sm md:text-xl leading-tight truncate max-w-[200px] md:max-w-md uppercase">{p.title}</p>
                          <code className="text-[9px] md:text-[11px] font-mono text-slate-300 mt-2 block tracking-tighter truncate opacity-60">ID: {p.id.slice(-12)}</code>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>
                     <div className="space-y-1.5">
                        <p className="font-bold text-slate-600 text-xs md:text-base leading-none uppercase">{exams?.find((e:any) => e.id === p.examId)?.name || p.examId}</p>
                        <Badge variant="outline" className="border-slate-100 text-slate-400 text-[8px] md:text-[9px] font-black uppercase px-2 rounded tracking-widest">{p.boardId || 'OFFICIAL'} HUB</Badge>
                     </div>
                  </TableCell>
                  <TableCell className="text-center">
                     <span className="font-black text-lg md:text-4xl text-slate-200 group-hover:text-primary transition-colors tabular-nums tracking-tighter">{p.year}</span>
                  </TableCell>
                  <TableCell className="text-right px-8 md:px-12">
                     <div className="flex justify-end gap-2 md:gap-4 opacity-20 group-hover:opacity-100 transition-all">
                        <button onClick={() => setEditingPYQ(p)} className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90 transition-all"><Edit className="h-5 w-5" /></button>
                        <button onClick={async () => { if(confirm("Purge paper node?")) await deleteDoc(doc(db!, "pyqs", p.id)) }} className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all"><Trash2 className="h-5 w-5" /></button>
                     </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                   <TableCell colSpan={4} className="h-80 md:h-[400px] text-center">
                      <div className="flex flex-col items-center justify-center opacity-10 space-y-6">
                         <Layers className="h-20 w-20 md:h-32 md:w-32 text-slate-400" />
                         <p className="font-black text-xl md:text-4xl uppercase tracking-[0.4em]">Vault Empty</p>
                      </div>
                   </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingPYQ} onOpenChange={o => !o && !isSaving && setEditingPYQ(null)}>
         <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[95vh] bg-white rounded-3xl md:rounded-[3rem] border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
            <div className="h-2 w-full bg-[#0F172A] shrink-0" />
            <DialogHeader className="p-6 md:p-14 pb-4 shrink-0">
               <div className="flex justify-between items-center">
                  <DialogTitle className="text-xl md:text-4xl font-black font-headline uppercase text-[#0F172A] tracking-tight">Archive Architect</DialogTitle>
                  <button onClick={() => setEditingPYQ(null)} className="p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border-none bg-transparent"><X className="h-6 w-6 text-slate-400" /></button>
               </div>
               <DialogDescription className="text-slate-400 font-bold uppercase text-[9px] md:text-[10px] tracking-widest mt-2">Ingest official recruitment papers.</DialogDescription>
            </DialogHeader>

            <div className="px-6 md:px-14 pb-8 space-y-6 md:space-y-10 overflow-y-auto custom-scrollbar flex-1">
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Archive Title</Label>
                  <Input value={editingPYQ?.title || ""} onChange={e => setEditingPYQ({...editingPYQ, title: e.target.value})} className="h-12 md:h-16 rounded-2xl border-none bg-slate-50 font-black text-sm md:text-lg px-6 shadow-inner" placeholder="e.g. PSSSB Patwari 2025 Solved" />
               </div>

               <div className="grid grid-cols-2 gap-4 md:gap-8">
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Assigned Board</Label>
                     <select value={editingPYQ?.boardId || ""} onChange={e => setEditingPYQ({...editingPYQ, boardId: e.target.value})} className="w-full h-12 md:h-16 bg-slate-50 border-none rounded-2xl px-6 outline-none font-bold text-sm shadow-inner appearance-none cursor-pointer">
                        <option value="">Select Board</option>
                        {boards?.map((b: any) => <option key={b.id} value={b.id}>{b.abbreviation} Hub</option>)}
                     </select>
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Assigned Exam</Label>
                     <select value={editingPYQ?.examId || ""} onChange={e => setEditingPYQ({...editingPYQ, examId: e.target.value})} className="w-full h-12 md:h-16 bg-slate-50 border-none rounded-2xl px-6 outline-none font-bold text-sm shadow-inner appearance-none cursor-pointer">
                        <option value="">Select Exam</option>
                        {exams?.filter((e:any) => !editingPYQ?.boardId || e.boardId === editingPYQ.boardId).map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
                     </select>
                  </div>
               </div>

               <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Paper Year</Label>
                  <Input type="number" value={editingPYQ?.year || 2025} onChange={e => setEditingPYQ({...editingPYQ, year: e.target.value})} className="h-12 md:h-16 rounded-2xl border-none bg-slate-50 font-black text-center text-lg shadow-inner" />
               </div>

               <div className="space-y-4 pt-6 border-t border-slate-50">
                  <FileUpload 
                     label="Verified Question Paper PDF" 
                     folder="pyqs" 
                     accept="application/pdf"
                     value={editingPYQ?.pdfUrl} 
                     onChange={(meta) => setEditingPYQ({...editingPYQ, pdfUrl: meta?.url, fileMeta: meta})} 
                  />
               </div>
            </div>

            <DialogFooter className="p-6 md:p-14 pt-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
               <Button variant="ghost" onClick={() => setEditingPYQ(null)} className="w-full sm:w-auto h-12 md:h-14 px-8 font-black uppercase text-[10px] md:text-[11px] text-slate-400 tracking-widest">Discard</Button>
               <Button onClick={handleSave} disabled={isSaving} className="flex-1 h-12 md:h-16 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] md:text-[11px] tracking-[0.2em] rounded-full shadow-2xl gap-3 active:scale-95 border-none">
                  {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Commit to Registry
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
