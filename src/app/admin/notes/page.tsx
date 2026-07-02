"use client";

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, FileText } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, doc, deleteDoc } from "firebase/firestore"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { AdminPageHeader, AdminSearchInput, AdminTableSkeleton, AdminDialogShell } from "@/components/admin"
import { useFirestoreCrud } from "@/hooks/useFirestoreCrud"
import { useFilteredCollection } from "@/hooks/useFilteredCollection"

export default function AdminNotesManagement() {
  const db = useFirestore()

  const { data: filteredNotes, loading, searchTerm, setSearchTerm } = useFilteredCollection<any>({
    db,
    collectionName: "notes",
    orderByField: "updatedAt",
    orderDirection: "desc",
    searchFields: ["title", "examId"],
  })

  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))

  const [editingNote, setEditingNote] = useState<any>(null)

  const { isSaving, saveDocument } = useFirestoreCrud({
    db,
    collectionName: "notes",
    toastMessages: { saveSuccess: "Asset Deployed" },
  })

  const handleSave = async () => {
    if (!editingNote || !editingNote.title || !editingNote.pdfUrl || !editingNote.examId) return
    await saveDocument(
      { ...editingNote, status: "PUBLISHED", createdAt: editingNote.createdAt },
      { onSuccess: () => setEditingNote(null) }
    )
  }

  return (
    <div className="space-y-6 md:space-y-10 pb-24 text-[#0F172A] text-left animate-in fade-in duration-500">
      <AdminPageHeader
        icon={FileText}
        label="Institutional Study Base"
        title="Content Hub"
        subtitle="Manage study notes, PDFs, and syllabus metadata."
        actionLabel="Register Asset"
        actionIcon={Plus}
        onAction={() => setEditingNote({ title: "", boardId: "", examId: "", subjectId: "", category: "NOTES", pdfUrl: "", isFree: true, description: "" })}
      />

      <AdminSearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search repository..."
      />

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 text-left overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-14 md:h-20">
                <TableHead className="px-6 md:px-12 text-[9px] md:text-[10px] font-black text-slate-400">Asset Identity</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-black text-slate-400">Relational Vertical</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-black text-slate-400 text-center">Tier</TableHead>
                <TableHead className="text-right px-6 md:px-12 text-[9px] md:text-[10px] font-black text-slate-400">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <AdminTableSkeleton rows={5} columns={4} />
              ) : filteredNotes.map((note) => (
                <TableRow key={note.id} className="border-slate-50 hover:bg-slate-50 transition-colors group">
                  <TableCell className="px-6 md:px-12 py-5 md:py-10">
                    <div className="flex items-center gap-4 md:gap-6">
                       <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner shrink-0 transition-transform group-hover:scale-105"><FileText className="h-5 w-5" /></div>
                       <div className="min-w-0">
                          <p className="font-bold text-[#0F172A] text-sm md:text-lg leading-tight truncate">{note.title}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{note.category}</p>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>
                     <div className="space-y-1">
                        <Badge variant="outline" className="border-slate-100 text-slate-500 text-[7px] md:text-[8px] font-black uppercase px-2 rounded-md">{note.boardId || 'PSSSB'} HUB</Badge>
                        <p className="text-xs md:text-sm font-medium text-slate-400 line-clamp-1 truncate max-w-[200px]">{exams?.find((e:any) => e.id === note.examId)?.name || note.examId}</p>
                     </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={cn("border-none text-[8px] md:text-[9px] font-black uppercase px-3 py-1 rounded-lg shadow-sm", note.isFree ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
                        {note.isFree ? 'FREE' : 'ELITE'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-6 md:px-12">
                     <div className="flex justify-end gap-2 md:gap-3 opacity-20 group-hover:opacity-100 transition-all">
                        <button onClick={() => setEditingNote(note)} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90 transition-all"><Edit className="h-5 w-5" /></button>
                        <button onClick={async () => { if(confirm("Purge asset node?")) await deleteDoc(doc(db!, "notes", note.id)) }} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all"><Trash2 className="h-5 w-5" /></button>
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AdminDialogShell
        open={!!editingNote}
        onOpenChange={() => setEditingNote(null)}
        title="Asset Architect"
        description="Configure study material metadata."
        isSaving={isSaving}
        onSave={handleSave}
        onDiscard={() => setEditingNote(null)}
        saveLabel="Commit Asset"
        maxWidth="sm:max-w-2xl"
      >
        <div className="space-y-2 text-left">
          <Label className="text-[9px] font-black text-slate-500 ml-1">Asset Title</Label>
          <Input value={editingNote?.title || ""} onChange={e => setEditingNote({...editingNote, title: e.target.value})} className="h-12 md:h-14 rounded-xl border-slate-200 bg-slate-50 font-bold" placeholder="e.g. Punjab GK Master Notes" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2 text-left">
            <Label className="text-[9px] font-black text-slate-500 ml-1">Assigned Board</Label>
            <select value={editingNote?.boardId || ""} onChange={e => setEditingNote({...editingNote, boardId: e.target.value})} className="w-full h-12 md:h-14 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none shadow-inner">
              <option value="">Select Board</option>
              {boards?.map((b: any) => <option key={b.id} value={b.id}>{b.abbreviation}</option>)}
            </select>
          </div>
          <div className="space-y-2 text-left">
            <Label className="text-[9px] font-black text-slate-500 ml-1">Assigned Exam</Label>
            <select value={editingNote?.examId || ""} onChange={e => setEditingNote({...editingNote, examId: e.target.value})} className="w-full h-12 md:h-14 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none shadow-inner">
              <option value="">Select Exam</option>
              {exams?.filter((e:any) => !editingNote?.boardId || e.boardId === editingNote.boardId).map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-2 text-left">
          <Label className="text-[9px] font-black text-slate-500 ml-1">PDF Node URL</Label>
          <Input value={editingNote?.pdfUrl || ""} onChange={e => setEditingNote({...editingNote, pdfUrl: e.target.value})} className="h-12 md:h-14 rounded-xl border-slate-200 bg-slate-50 font-mono text-xs text-primary" placeholder="https://..." />
        </div>
        <div className="flex items-center justify-between p-5 md:p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
          <div className="space-y-0.5">
            <p className="text-[10px] font-black text-[#0F172A]">Public Node (Free)</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Disable to require Pass</p>
          </div>
          <Switch checked={editingNote?.isFree} onCheckedChange={v => setEditingNote({...editingNote, isFree: v})} />
        </div>
      </AdminDialogShell>
    </div>
  )
}
