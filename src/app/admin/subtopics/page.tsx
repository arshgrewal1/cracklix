"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, Network, Search, Loader2 } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, deleteDoc, orderBy } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Topic, Chapter, Subject, Subtopic } from "@/types"
import { AdminPageHeader, AdminTableSkeleton, AdminDialogShell } from "@/components/admin"
import { useFirestoreCrud } from "@/hooks/useFirestoreCrud"
import { Badge } from "@/components/ui/badge"

export default function SubtopicManagement() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [topicFilter, setTopicFilter] = useState("all")
  
  const { data: subtopics, loading: subtopicsLoading } = useCollection<Subtopic>(useMemo(() => (db ? query(collection(db, "subtopics"), orderBy("displayOrder", "asc")) : null), [db]))
  const { data: topics } = useCollection<Topic>(useMemo(() => (db ? query(collection(db, "topics"), orderBy("displayOrder", "asc")) : null), [db]))
  const { data: subjects } = useCollection<Subject>(useMemo(() => (db ? query(collection(db, "subjects"), orderBy("displayOrder", "asc")) : null), [db]))

  const filteredSubtopics = useMemo(() => {
    if (!subtopics) return []
    return subtopics.filter(s => {
       const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase())
       const matchesSubject = subjectFilter === "all" || s.subjectId === subjectFilter
       const matchesTopic = topicFilter === "all" || s.topicId === topicFilter
       return matchesSearch && matchesSubject && matchesTopic
    })
  }, [subtopics, searchTerm, subjectFilter, topicFilter])

  const [editingSubtopic, setEditingSubtopic] = useState<Partial<Subtopic> | null>(null)

  const { isSaving, saveDocument } = useFirestoreCrud({
    db,
    collectionName: "subtopics",
    toastMessages: { saveSuccess: "Subtopic Synced" },
  })

  const handleSave = async () => {
    if (!editingSubtopic || !editingSubtopic.name || !editingSubtopic.topicId) {
       toast({ variant: "destructive", title: "Validation Error", description: "Name and Topic are mandatory." })
       return
    }

    const id = editingSubtopic.id || `subtopic-${Date.now()}`
    await saveDocument(
      { ...editingSubtopic, id, displayOrder: parseInt(editingSubtopic.displayOrder as any) || 0 },
      { id, onSuccess: () => setEditingSubtopic(null) }
    )
  }

  return (
    <div className="space-y-6 md:space-y-12 text-left pb-32 animate-in fade-in duration-500">
      <AdminPageHeader
        icon={Network}
        label="Granular Mapping Registry"
        title="Subtopic Manager"
        subtitle="Manage the deepest level of the question hierarchy."
        actionLabel="New Subtopic"
        actionIcon={Plus}
        onAction={() => setEditingSubtopic({ name: "", topicId: topicFilter !== 'all' ? topicFilter : "", subjectId: subjectFilter !== 'all' ? subjectFilter : "", displayOrder: (subtopics?.length || 0) + 1 })}
      />

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[2.5rem] bg-white mx-1 border border-slate-50 p-4 md:p-6">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative group md:col-span-2">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
               <Input className="h-11 pl-11 rounded-xl bg-slate-50 border-none font-bold" placeholder="Search subtopics..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="h-11 px-4 rounded-xl bg-slate-50 border-none font-bold text-xs outline-none">
               <option value="all">All Subjects</option>
               {subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={topicFilter} onChange={e => setTopicFilter(e.target.value)} className="h-11 px-4 rounded-xl bg-slate-50 border-none font-bold text-xs outline-none">
               <option value="all">All Topics</option>
               {topics?.filter(t => subjectFilter === 'all' || t.subjectId === subjectFilter).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
         </div>
      </Card>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-14 md:h-20">
                <TableHead className="px-6 md:px-10 text-[9px] font-black text-slate-400 uppercase tracking-widest">Subtopic Identity</TableHead>
                <TableHead className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Parent Node</TableHead>
                <TableHead className="text-right px-6 md:px-10 text-[9px] font-black text-slate-400 uppercase tracking-widest">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subtopicsLoading ? (
                <AdminTableSkeleton rows={5} columns={3} />
              ) : filteredSubtopics.map((s) => {
                const topic = topics?.find(t => t.id === s.topicId)
                return (
                  <TableRow key={s.id} className="hover:bg-slate-50 border-slate-50 transition-colors group">
                    <TableCell className="px-6 md:px-10 py-5 md:py-8">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shadow-inner group-hover:bg-primary/5 group-hover:text-primary">
                             <Network className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                             <p className="font-bold text-[#0F172A] text-base leading-tight truncate">{s.name}</p>
                             <p className="text-[8px] font-black text-slate-400 mt-1 uppercase tracking-widest">ID: {s.id.slice(-6)}</p>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-400 text-[8px] font-black px-2 uppercase">{topic?.name || 'ORPHAN'}</Badge>
                    </TableCell>
                    <TableCell className="text-right px-6 md:px-10">
                       <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100">
                          <button onClick={() => setEditingSubtopic(s)} className="h-9 w-9 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90 transition-all"><Edit className="h-4 w-4" /></button>
                          <button onClick={async () => { if(confirm("Purge node?")) await deleteDoc(doc(db!, "subtopics", s.id)) }} className="h-9 w-9 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all"><Trash2 className="h-4 w-4" /></button>
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
        open={!!editingSubtopic}
        onOpenChange={() => setEditingSubtopic(null)}
        title="Subtopic Architect"
        description="Link granular subtopics to specific parent nodes."
        isSaving={isSaving}
        onSave={handleSave}
        onDiscard={() => setEditingSubtopic(null)}
        saveLabel="Commit Node"
      >
        <div className="space-y-4">
           <div className="space-y-1.5 text-left">
             <Label className="text-[9px] font-black text-slate-500 ml-1 uppercase">Parent Topic</Label>
             <select value={editingSubtopic?.topicId || ""} onChange={e => setEditingSubtopic({ ...editingSubtopic, topicId: e.target.value })} className="w-full h-12 rounded-xl border-none bg-slate-50 font-bold px-5 outline-none shadow-inner">
                <option value="" disabled>Select Topic</option>
                {topics?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
             </select>
           </div>
           <div className="space-y-1.5 text-left">
             <Label className="text-[9px] font-black text-slate-500 ml-1 uppercase">Subtopic Name</Label>
             <Input value={editingSubtopic?.name || ""} onChange={e => setEditingSubtopic({ ...editingSubtopic, name: e.target.value })} className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold px-5" placeholder="e.g. Vlookup vs Hlookup" />
           </div>
           <div className="space-y-1.5 text-left">
             <Label className="text-[9px] font-black text-slate-500 ml-1 uppercase">Display Order</Label>
             <Input type="number" value={editingSubtopic?.displayOrder || ""} onChange={e => setEditingSubtopic({ ...editingSubtopic, displayOrder: parseInt(e.target.value) })} className="h-12 rounded-xl border-slate-200 bg-slate-50 font-black text-center" />
           </div>
        </div>
      </AdminDialogShell>
    </div>
  )
}
