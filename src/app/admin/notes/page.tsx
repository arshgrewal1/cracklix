"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, Save, FileText, Search, Download, Landmark, GraduationCap, X, Loader2 } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, setDoc, deleteDoc, orderBy, serverTimestamp } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Content Hub CMS v7.0.
 * ENHANCED: Metadata associations for Boards, Exams, and Subjects.
 */

export default function AdminNotesManagement() {
  const db = useFirestore()
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
       toast({ variant: "destructive", title: "Audit Blocked", description: "Title, Exam Vertical, and PDF URL are mandatory." })
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
      toast({ title: "Asset Deployed", description: "Metadata synchronized with cloud storage node." })
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
    <div className="space-y-10 pb-20 text-left pt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <FileText className="h-6 w-6 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Institutional Study Base</span>
           </div>
          <h1 className="text-4xl md:text-5xl font-black font-headline text-[#0F172A] uppercase tracking-tight leading-none">Content Hub</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Manage Study Notes, PDFs, and Official Syllabus Metadata.</p>
        </div>
        <Button onClick={() => setEditingNote({ title: "", boardId: "", examId: "", subjectId: "", category: "NOTES", pdfUrl: "", isFree: true, description: "" })} className="bg-primary hover:bg-orange-600 gap-3 h-16 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl transition-all active:scale-95 border-none">
          <Plus className="h-5 w-5" /> Register New Asset
        </Button>
      </div>

      <Card className="border-none shadow-3xl bg-white rounded-[3rem] overflow-hidden mx-4">
        <CardHeader className="p-8 md:p-10 border-b border-slate-50 bg-slate-50/30">
           <div className="relative w-full md:w-[45%]">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                className="pl-16 h-14 rounded-2xl bg-white border-none shadow-inner text-base font-medium text-[#0F172A]" 
                placeholder="Search repository..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-16">
                <TableHead className="px-10 text-[10px] font-black uppercase text-slate-500">Asset Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-500">Relational Vertical</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-500 text-center">Tier</TableHead>
                <TableHead className="text-right px-10 text-[10px] font-black uppercase text-slate-500">Control</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={4} className="px-10 py-6"><Skeleton className="h-12 w-full rounded-xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : filteredNotes.map((note) => (
                <TableRow key={note.id} className="hover:bg-slate-50 group border-slate-50 transition-all">
                  <TableCell className="px-10 py-6">
                    <div className="flex items-center gap-5">
                       <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-105 transition-transform"><FileText className="h-5 w-5" /></div>
                       <div>
                          <p className="font-black text-[#0F172A] text-lg uppercase tracking-tight leading-none">{note.title}</p>
                          <p className="text-[9px] font-bold text-slate-400 mt-1.5 uppercase">{note.category}</p>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>
                     <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="border-slate-100 text-slate-500 text-[8px] font-black uppercase px-2 w-fit">{note.boardId || 'PSSSB'}</Badge>
                        <p className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[180px]">{exams?.find((e:any) => e.id === note.examId)?.name || note.examId}</p>
                     </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={cn("border-none text-[8px] font-black uppercase px-3 py-1 rounded-lg", note.isFree ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
                        {note.isFree ? 'FREE' : 'PREMIUM'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-10">
                    <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100 transition-all">
                      <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl" onClick={() => setEditingNote(note)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl hover:bg-rose-50 hover:text-rose-600" onClick={() => handleDelete(note.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingNote} onOpenChange={(open) => !open && !isSaving && setEditingNote(null)}>
        <DialogContent className="sm:max-w-2xl rounded-[3rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
          <div className="h-2 w-full bg-[#0F172A] shrink-0" />
          <DialogHeader className="p-8 pb-0">
             <DialogTitle className="text-2xl font-black font-headline uppercase text-[#0F172A]">Asset Architect</DialogTitle>
             <DialogDescription className="text-slate-400 font-medium">Link preparation materials to specific exam verticals.</DialogDescription>
          </DialogHeader>
          
          <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
             <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Asset Title</Label>
                <Input value={editingNote?.title || ""} onChange={e => setEditingNote({...editingNote, title: e.target.value})} className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold" placeholder="e.g. Punjab GK Master Notes" />
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Assigned Board</Label>
                   <select value={editingNote?.boardId || ""} onChange={e => setEditingNote({...editingNote, boardId: e.target.value})} className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none shadow-inner">
                      <option value="">Select Board</option>
                      {boards?.map((b: any) => <option key={b.id} value={b.id}>{b.abbreviation}</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Assigned Exam (Hub)</Label>
                   <select value={editingNote?.examId || ""} onChange={e => setEditingNote({...editingNote, examId: e.target.value})} className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none shadow-inner">
                      <option value="">Select Vertical</option>
                      {exams?.filter((e:any) => !editingNote?.boardId || e.boardId === editingNote.boardId).map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
                   </select>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Subject Hub</Label>
                   <select value={editingNote?.subjectId || ""} onChange={e => setEditingNote({...editingNote, subjectId: e.target.value})} className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none shadow-inner">
                      <option value="">Select Subject</option>
                      {subjects?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Asset Category</Label>
                   <select value={editingNote?.category || "NOTES"} onChange={e => setEditingNote({...editingNote, category: e.target.value})} className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none shadow-inner">
                      <option value="NOTES">Study Notes</option>
                      <option value="SYLLABUS">Exam Syllabus</option>
                      <option value="E-BOOK">E-Book Node</option>
                   </select>
                </div>
             </div>

             <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">PDF / External URL</Label>
                <Input value={editingNote?.pdfUrl || ""} onChange={e => setEditingNote({...editingNote, pdfUrl: e.target.value.trim()})} className="h-12 rounded-xl border-slate-200 bg-slate-50 font-mono text-xs text-primary" placeholder="https://..." />
             </div>

             <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                <div className="space-y-1">
                   <p className="font-black text-[11px] uppercase text-[#0F172A]">Public Node (FREE)</p>
                   <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Disable to require a Premium Pass</p>
                </div>
                <Switch checked={editingNote?.isFree} onCheckedChange={v => setEditingNote({...editingNote, isFree: v})} />
             </div>
          </div>

          <DialogFooter className="p-8 pt-4 bg-slate-50 flex gap-4 border-t border-slate-100">
             <Button variant="ghost" onClick={() => setEditingNote(null)} className="h-14 px-8 font-black uppercase text-[10px] text-slate-400">Discard</Button>
             <Button onClick={handleSave} disabled={isSaving} className="flex-1 bg-[#0F172A] hover:bg-black text-white h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl gap-3 border-none">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Commit to Registry
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
