"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, Save, FileText, Search, Loader2, X } from "lucide-react"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, doc, setDoc, deleteDoc, orderBy, serverTimestamp, addDoc } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import FileUpload from "@/components/admin/FileUpload"

/**
 * @fileOverview Institutional Content Hub CMS v9.0.
 * UPDATED: Integrated Enterprise File Upload Manager with optimized metadata storage.
 */

export default function AdminNotesManagement() {
  const db = useFirestore()
  const { profile } = useUser()
  const { toast } = useToast()
  
  const notesQuery = useMemo(() => (db ? query(collection(db, "notes"), orderBy("updatedAt", "desc")) : null), [db])
  const { data: notes, loading } = useCollection<any>(notesQuery)
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))

  const [editingNote, setEditingNote] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!db || !editingNote || isSaving) return
    if (!editingNote.title || !editingNote.examId || !editingNote.pdfUrl) {
       toast({ variant: "destructive", title: "Audit Blocked", description: "Title, Exam Vertical, and PDF node are mandatory." })
       return
    }

    setIsSaving(true)
    const noteId = editingNote.id || `note-${Date.now()}`
    const noteRef = doc(db, "notes", noteId)
    
    const payload = {
      ...editingNote,
      id: noteId,
      updatedAt: serverTimestamp(),
      createdAt: editingNote.createdAt || serverTimestamp(),
      status: 'PUBLISHED'
    }

    try {
      await setDoc(noteRef, payload, { merge: true })
      
      await addDoc(collection(db, "audit_logs"), {
        user: profile?.name || "Administrator",
        action: editingNote.id ? "NOTE_UPDATE" : "NOTE_CREATE",
        details: `Study note "${editingNote.title}" registry node synchronized.`,
        timestamp: serverTimestamp()
      });

      toast({ title: "Asset Deployed" })
      setEditingNote(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently purge this preparation asset?")) return
    await deleteDoc(doc(db!, "notes", id))
    toast({ title: "Registry Purged" })
  }

  const filteredNotes = useMemo(() => {
    if (!notes) return []
    return notes.filter(n => 
      n.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      n.examId?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [notes, searchTerm])

  return (
    <div className="space-y-10 md:space-y-16 pb-20 text-left pt-2 md:pt-4">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-400">Preparation Hub Content</span>
           </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tighter leading-none">Content Hub</h1>
          <p className="text-slate-500 text-[11px] md:text-lg font-medium leading-tight">Manage official PDFs, syllabus guides, and verified study material.</p>
        </div>
        <Button onClick={() => setEditingNote({ title: "", boardId: "", examId: "", subjectId: "", category: "NOTES", pdfUrl: "", isFree: true, description: "" })} className="w-full md:w-auto bg-primary hover:bg-blue-700 h-12 md:h-16 px-10 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl border-none transition-all active:scale-95 gap-3">
          <Plus className="h-5 w-5" /> Register New Asset
        </Button>
      </div>

      <div className="relative group px-1 max-w-3xl">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
         <Input 
           className="h-14 md:h-18 pl-14 rounded-2xl md:rounded-full bg-white border-slate-100 shadow-xl text-base md:text-lg font-bold" 
           placeholder="Search study repository..." 
           value={searchTerm}
           onChange={e => setSearchTerm(e.target.value)}
         />
      </div>

      <Card className="border-none shadow-3xl bg-white rounded-2xl md:rounded-[3rem] overflow-hidden mx-1 border border-slate-50">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-16 md:h-24">
                <TableHead className="px-8 md:px-12 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Asset Identity</TableHead>
                <TableHead className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Vertical Node</TableHead>
                <TableHead className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-center text-slate-400">Tier</TableHead>
                <TableHead className="text-right px-8 md:px-12 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Control</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-50"><TableCell colSpan={4} className="px-8 py-8 md:py-12"><Skeleton className="h-10 w-full rounded-xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : filteredNotes.map((note) => (
                <TableRow key={note.id} className="hover:bg-slate-50 group border-slate-50 transition-all">
                  <TableCell className="px-8 md:px-12 py-6 md:py-10">
                    <div className="flex items-center gap-5 md:gap-8">
                       <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-105 transition-transform shrink-0"><FileText className="h-5 w-5 md:h-7 md:w-7" /></div>
                       <div className="min-w-0">
                          <p className="font-black text-[#0F172A] text-sm md:text-xl uppercase tracking-tight leading-none truncate max-w-[200px] md:max-w-md">{note.title}</p>
                          <p className="text-[9px] md:text-[11px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{note.category}</p>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>
                     <div className="space-y-1.5">
                        <Badge variant="outline" className="border-slate-200 text-slate-500 text-[8px] md:text-[9px] font-black uppercase px-2 w-fit tracking-widest">{note.boardId || 'PSSSB'} HUB</Badge>
                        <p className="text-[10px] md:text-[13px] font-bold text-slate-400 uppercase truncate max-w-[180px]">{exams?.find((e:any) => e.id === note.examId)?.name || note.examId}</p>
                     </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={cn("border-none text-[8px] md:text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg shadow-sm", note.isFree ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
                        {note.isFree ? 'FREE' : 'ELITE'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-8 md:px-12">
                    <div className="flex justify-end gap-2 md:gap-3 opacity-20 group-hover:opacity-100 transition-all">
                      <button onClick={() => setEditingNote(note)} className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90 transition-all"><Edit className="h-5 w-5" /></button>
                      <button onClick={() => handleDelete(note.id)} className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all"><Trash2 className="h-5 w-5" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingNote} onOpenChange={(open) => !open && !isSaving && setEditingNote(null)}>
        <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[95vh] rounded-3xl md:rounded-[3rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
          <div className="h-2 w-full bg-[#0F172A] shrink-0" />
          <DialogHeader className="p-6 md:p-14 pb-4 shrink-0">
             <div className="flex justify-between items-center">
                <DialogTitle className="text-xl md:text-4xl font-black font-headline uppercase text-[#0F172A] tracking-tight">Asset Architect</DialogTitle>
                <button onClick={() => setEditingNote(null)} className="p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border-none bg-transparent"><X className="h-6 w-6 text-slate-400" /></button>
             </div>
             <DialogDescription className="text-slate-400 font-bold uppercase text-[9px] md:text-[10px] tracking-widest mt-2">Modify study material registry nodes.</DialogDescription>
          </DialogHeader>
          
          <div className="px-6 md:px-14 pb-8 space-y-6 md:space-y-10 overflow-y-auto custom-scrollbar flex-1">
             <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Asset Title</Label>
                <Input value={editingNote?.title || ""} onChange={e => setEditingNote({...editingNote, title: e.target.value})} className="h-12 md:h-16 rounded-2xl border-none bg-slate-50 font-black text-sm md:text-lg px-6 shadow-inner" placeholder="e.g. Punjab History Master Notes" />
             </div>

             <div className="grid grid-cols-2 gap-4 md:gap-8">
                <div className="space-y-1.5">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Board Hub</Label>
                   <select value={editingNote?.boardId || ""} onChange={e => setEditingNote({...editingNote, boardId: e.target.value})} className="w-full h-12 md:h-16 bg-slate-50 border-none rounded-2xl px-6 outline-none font-bold text-sm shadow-inner appearance-none cursor-pointer">
                      <option value="">Select Board</option>
                      {boards?.map((b: any) => <option key={b.id} value={b.id}>{b.abbreviation} Hub</option>)}
                   </select>
                </div>
                <div className="space-y-1.5">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Assigned Exam</Label>
                   <select value={editingNote?.examId || ""} onChange={e => setEditingNote({...editingNote, examId: e.target.value})} className="w-full h-12 md:h-16 bg-slate-50 border-none rounded-2xl px-6 outline-none font-bold text-sm shadow-inner appearance-none cursor-pointer">
                      <option value="">Select Vertical</option>
                      {exams?.filter((e:any) => !editingNote?.boardId || e.boardId === editingNote.boardId).map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
                   </select>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4 md:gap-8">
                <div className="space-y-1.5">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Subject Hub</Label>
                   <select value={editingNote?.subjectId || ""} onChange={e => setEditingNote({...editingNote, subjectId: e.target.value})} className="w-full h-12 md:h-16 bg-slate-50 border-none rounded-2xl px-6 outline-none font-bold text-sm shadow-inner appearance-none cursor-pointer">
                      <option value="">Select Subject</option>
                      {subjects?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                   </select>
                </div>
                <div className="space-y-1.5">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Category</Label>
                   <select value={editingNote?.category || "NOTES"} onChange={e => setEditingNote({...editingNote, category: e.target.value})} className="w-full h-12 md:h-16 bg-slate-50 border-none rounded-2xl px-6 outline-none font-bold text-sm shadow-inner appearance-none cursor-pointer">
                      <option value="NOTES">Study Notes</option>
                      <option value="SYLLABUS">Exam Syllabus</option>
                      <option value="E-BOOK">E-Book Node</option>
                   </select>
                </div>
             </div>

             <div className="space-y-4 pt-6 border-t border-slate-50">
                <FileUpload 
                   label="Upload Preparation PDF" 
                   folder="notes" 
                   accept="application/pdf"
                   value={editingNote?.pdfUrl} 
                   onChange={(meta) => setEditingNote({...editingNote, pdfUrl: meta?.url, fileMeta: meta})} 
                />
             </div>

             <div className="flex items-center justify-between p-5 md:p-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                <div className="space-y-1">
                   <p className="font-black text-[11px] uppercase text-[#0F172A]">Public node (Free)</p>
                   <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Disable to require a Premium Pass</p>
                </div>
                <Switch checked={editingNote?.isFree} onCheckedChange={v => setEditingNote({...editingNote, isFree: v})} />
             </div>
          </div>

          <DialogFooter className="p-6 md:p-14 pt-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
             <Button variant="ghost" onClick={() => setEditingNote(null)} className="w-full sm:w-auto h-12 md:h-14 px-8 font-black uppercase text-[10px] md:text-[11px] text-slate-400 tracking-widest">Discard</Button>
             <Button onClick={handleSave} disabled={isSaving} className="flex-1 h-12 md:h-16 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] md:text-[11px] tracking-[0.2em] rounded-full shadow-2xl gap-3 active:scale-95 border-none">
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Commit to Hub
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
