"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, NotebookTabs, FolderKanban, Search, Loader2 } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, setDoc, deleteDoc, serverTimestamp, orderBy, getCountFromServer, where } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Chapter, Subject } from "@/types"
import { AdminPageHeader, AdminTableSkeleton, AdminDialogShell } from "@/components/admin"
import { useFirestoreCrud } from "@/hooks/useFirestoreCrud"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

export default function ChapterManagement() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  
  const { data: rawChapters, loading: chaptersLoading } = useCollection<Chapter>(useMemo(() => (db ? query(collection(db, "chapters"), orderBy("displayOrder", "asc")) : null), [db]))
  const { data: subjects } = useCollection<Subject>(useMemo(() => (db ? query(collection(db, "subjects"), orderBy("displayOrder", "asc")) : null), [db]))

  const chapters = useMemo(() => {
    if (!rawChapters) return []
    return rawChapters.filter(c => {
       const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase())
       const matchesSubject = subjectFilter === "all" || c.subjectId === subjectFilter
       return matchesSearch && matchesSubject
    })
  }, [rawChapters, searchTerm, subjectFilter])

  const [editingChapter, setEditingChapter] = useState<Partial<Chapter> | null>(null)

  const { isSaving, saveDocument } = useFirestoreCrud({
    db,
    collectionName: "chapters",
    toastMessages: { saveSuccess: "Chapter Synced" },
  })

  const handleSave = async () => {
    if (!editingChapter || !editingChapter.name || !editingChapter.subjectId) {
       toast({ variant: "destructive", title: "Validation Error", description: "Name and Subject are mandatory." })
       return
    }

    const id = editingChapter.id || `chapter-${Date.now()}`
    await saveDocument(
      { ...editingChapter, id, displayOrder: parseInt(editingChapter.displayOrder as any) || 0 },
      { id, onSuccess: () => setEditingChapter(null) }
    )
  }

  return (
    <div className="space-y-6 md:space-y-12 text-left pb-32 animate-in fade-in duration-500">
      <AdminPageHeader
        icon={NotebookTabs}
        label="Content Hierarchy Registry"
        title="Chapter Manager"
        subtitle="Organize subjects into logical learning segments."
        actionLabel="New Chapter"
        actionIcon={Plus}
        onAction={() => setEditingChapter({ name: "", subjectId: subjectFilter !== 'all' ? subjectFilter : "", isActive: true, displayOrder: (chapters?.length || 0) + 1 })}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-1">
         <div className="relative group flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input className="h-12 pl-12 rounded-xl bg-white border-slate-100 shadow-sm" placeholder="Search chapters..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
         </div>
         <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="h-12 px-4 rounded-xl bg-white border-slate-100 shadow-sm font-bold text-sm outline-none">
            <option value="all">All Subjects</option>
            {subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
         </select>
      </div>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-14 md:h-20">
                <TableHead className="px-6 md:px-10 text-[9px] font-black text-slate-400 uppercase tracking-widest">Chapter Identity</TableHead>
                <TableHead className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Subject Hub</TableHead>
                <TableHead className="text-[9px] font-black text-center text-slate-400 uppercase tracking-widest">Status</TableHead>
                <TableHead className="text-right px-6 md:px-10 text-[9px] font-black text-slate-400 uppercase tracking-widest">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chaptersLoading ? (
                <AdminTableSkeleton rows={5} columns={4} />
              ) : chapters.map((c) => {
                const subject = subjects?.find(s => s.id === c.subjectId)
                return (
                  <TableRow key={c.id} className="hover:bg-slate-50 border-slate-50 transition-colors group">
                    <TableCell className="px-6 md:px-10 py-5 md:py-8">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shadow-inner group-hover:bg-primary/5 group-hover:text-primary">
                             <NotebookTabs className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                             <p className="font-bold text-[#0F172A] text-base leading-tight truncate">{c.name}</p>
                             <p className="text-[8px] font-black text-slate-400 mt-1 uppercase tracking-widest">Order: {c.displayOrder}</p>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-500 text-[8px] font-black px-2 py-0.5 rounded-md uppercase">
                          {subject?.name || 'ORPHAN'}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                       <Badge className={cn("border-none text-[8px] font-black px-2 py-0.5 rounded-md uppercase", c.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400")}>
                          {c.isActive ? 'Active' : 'Hidden'}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right px-6 md:px-10">
                       <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100">
                          <button onClick={() => setEditingChapter(c)} className="h-9 w-9 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90 transition-all"><Edit className="h-4 w-4" /></button>
                          <button onClick={async () => { if(confirm("Purge chapter?")) await deleteDoc(doc(db!, "chapters", c.id)) }} className="h-9 w-9 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all"><Trash2 className="h-4 w-4" /></button>
                       </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AdminDialogShell
        open={!!editingChapter}
        onOpenChange={() => setEditingChapter(null)}
        title="Chapter Architect"
        description="Configure institutional chapter node metadata."
        isSaving={isSaving}
        onSave={handleSave}
        onDiscard={() => setEditingChapter(null)}
        saveLabel="Commit Chapter"
      >
        <div className="space-y-2 text-left">
          <Label className="text-[9px] font-black text-slate-500 ml-1 uppercase">Parent Subject Hub</Label>
          <select value={editingChapter?.subjectId || ""} onChange={e => setEditingChapter({ ...editingChapter, subjectId: e.target.value })} className="w-full h-12 rounded-xl border-none bg-slate-50 font-bold px-5 outline-none shadow-inner">
             <option value="" disabled>Select Subject</option>
             {subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="space-y-2 text-left">
          <Label className="text-[9px] font-black text-slate-500 ml-1 uppercase">Chapter Name</Label>
          <Input value={editingChapter?.name || ""} onChange={e => setEditingChapter({ ...editingChapter, name: e.target.value })} className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold px-5" placeholder="e.g. Ancient Punjab History" />
        </div>
        <div className="grid grid-cols-2 gap-6">
           <div className="space-y-2 text-left">
              <Label className="text-[9px] font-black text-slate-500 ml-1 uppercase">Display Sequence</Label>
              <Input type="number" value={editingChapter?.displayOrder || ""} onChange={e => setEditingChapter({ ...editingChapter, displayOrder: parseInt(e.target.value) })} className="h-12 rounded-xl border-slate-200 bg-slate-50 font-black text-center" />
           </div>
           <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 shadow-inner mt-4">
              <span className="text-[9px] font-black uppercase text-slate-500">Registry Visibility</span>
              <Switch checked={editingChapter?.isActive || false} onCheckedChange={v => setEditingChapter({...editingChapter, isActive: v})} />
           </div>
        </div>
      </AdminDialogShell>
    </div>
  )
}
