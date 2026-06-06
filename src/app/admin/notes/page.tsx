
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, Save, FileText, Search, Download, ExternalLink, Globe, Landmark, Layers } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, query, orderBy, serverTimestamp } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export default function AdminNotesManagement() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const notesQuery = useMemo(() => (db ? query(collection(db, "notes"), orderBy("updatedAt", "desc")) : null), [db])
  const { data: notes, loading } = useCollection<any>(notesQuery)
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))

  const [editingNote, setEditingNote] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const handleSave = async () => {
    if (!db || !editingNote) return
    const noteId = editingNote.id || `note-${Date.now()}`
    const noteRef = doc(db, "notes", noteId)
    
    const payload = {
      ...editingNote,
      id: noteId,
      updatedAt: serverTimestamp(),
      createdAt: editingNote.createdAt || serverTimestamp()
    }

    try {
      await setDoc(noteRef, payload, { merge: true })
      toast({ title: "Note Published", description: "Material successfully updated in repository." })
      setEditingNote(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Save Failed", description: e.message })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently purge this study material?")) return
    await deleteDoc(doc(db!, "notes", id))
    toast({ title: "Note Removed", description: "Asset purged from repository." })
  }

  const filteredNotes = useMemo(() => {
    if (!notes) return []
    return notes.filter(n => 
      n.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      n.subjectId?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [notes, searchTerm])

  return (
    <div className="space-y-10 pb-20 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <FileText className="h-6 w-6 text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Study Materials CMS</span>
           </div>
          <h1 className="text-5xl font-black font-headline text-primary uppercase tracking-tight">Notes Library</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Manage PDFs, E-Books, and official syllabus registries.</p>
        </div>
        <Button onClick={() => setEditingNote({ title: "", subjectId: "", examId: "", category: "NOTES", pdfUrl: "", isFree: true, description: "" })} className="bg-primary hover:bg-orange-600 gap-3 h-16 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl">
          <Plus className="h-5 w-5" /> Archive New Note
        </Button>
      </div>

      <Card className="border-none shadow-3xl bg-white rounded-[3rem] overflow-hidden">
        <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/30">
           <div className="relative w-full md:w-[45%]">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                className="pl-16 h-16 rounded-[1.5rem] bg-white border-none shadow-inner text-lg font-medium" 
                placeholder="Search materials..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-20">
                <TableHead className="px-10 text-[10px] font-black uppercase text-slate-500">Asset Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-500">Registry Context</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-500">Access</TableHead>
                <TableHead className="text-right px-10 text-[10px] font-black uppercase text-slate-500">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={4} className="px-10 py-8"><Skeleton className="h-14 w-full rounded-2xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : filteredNotes.map((note) => (
                <TableRow key={note.id} className="hover:bg-slate-50 group border-slate-50 transition-all">
                  <TableCell className="px-10 py-8">
                    <div className="flex items-center gap-6">
                       <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                          <FileText className="h-7 w-7" />
                       </div>
                       <div>
                          <p className="font-black text-[#0F172A] text-lg uppercase tracking-tight leading-none">{note.title}</p>
                          <code className="text-[9px] font-mono text-slate-400 mt-2 block uppercase tracking-widest">ID: {note.id.slice(-8)}</code>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>
                     <div className="flex flex-col gap-1.5">
                        <Badge variant="outline" className="border-slate-200 text-slate-500 text-[8px] font-black uppercase w-fit">{note.category}</Badge>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{note.subjectId}</p>
                     </div>
                  </TableCell>
                  <TableCell>
                     <Badge className={note.isFree ? "bg-emerald-50 text-emerald-600 border-none text-[8px] font-black" : "bg-amber-50 text-amber-600 border-none text-[8px] font-black"}>
                        {note.isFree ? 'FREE NODE' : 'PREMIUM'}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-right px-10">
                    <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100 transition-all">
                       <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl hover:bg-white shadow-sm" onClick={() => setEditingNote(note)}>
                        <Edit className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl hover:bg-rose-50 hover:text-rose-600 shadow-sm" onClick={() => handleDelete(note.id)}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
        <DialogContent className="sm:max-w-2xl rounded-[3rem] bg-white border-none shadow-4xl p-0 overflow-hidden text-left">
          <div className="h-2 w-full bg-[#0F172A]" />
          <DialogHeader className="p-10 pb-0">
            <DialogTitle className="text-3xl font-black font-headline uppercase text-[#0F172A]">Asset Configuration</DialogTitle>
          </DialogHeader>
          
          <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Asset Headline</Label>
              <Input value={editingNote?.title || ""} onChange={e => setEditingNote({...editingNote, title: e.target.value})} className="h-14 rounded-xl border-slate-100 font-black text-lg text-[#0F172A]" />
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Subject Hub</Label>
                <select value={editingNote?.subjectId} onChange={e => setEditingNote({...editingNote, subjectId: e.target.value})} className="w-full h-14 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none">
                  <option value="">Select Subject</option>
                  {subjects?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Thematic Category</Label>
                <select value={editingNote?.category} onChange={e => setEditingNote({...editingNote, category: e.target.value})} className="w-full h-14 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none">
                  <option value="NOTES">Study Notes</option>
                  <option value="SYLLABUS">Exam Syllabus</option>
                  <option value="E-BOOK">E-Book Node</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Institutional PDF URL</Label>
              <Input value={editingNote?.pdfUrl || ""} onChange={e => setEditingNote({...editingNote, pdfUrl: e.target.value})} className="h-14 rounded-xl border-slate-100 bg-slate-50 font-bold" placeholder="https://cloud.storage/note.pdf" />
            </div>

            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
               <div className="space-y-0.5">
                  <p className="font-black text-[11px] uppercase text-[#0F172A]">Public Access (FREE)</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase">Toggle off to require a Premium Pass</p>
               </div>
               <Switch checked={editingNote?.isFree} onCheckedChange={val => setEditingNote({...editingNote, isFree: val})} />
            </div>
          </div>

          <DialogFooter className="p-10 pt-0 flex gap-4">
            <Button variant="ghost" onClick={() => setEditingNote(null)} className="rounded-xl h-14 font-black uppercase text-[10px]">Cancel Draft</Button>
            <Button onClick={handleSave} className="bg-[#0F172A] hover:bg-black h-14 px-10 rounded-xl font-black uppercase text-[10px] tracking-widest flex-1 shadow-xl">
              Sync Asset to Registry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
