
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, Library, Search, Loader2, Filter, CheckCircle2 } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, deleteDoc, serverTimestamp, orderBy, where } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Topic, Chapter, Subject } from "@/types"
import { AdminPageHeader, AdminTableSkeleton, AdminDialogShell } from "@/components/admin"
import { useFirestoreCrud } from "@/hooks/useFirestoreCrud"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/**
 * @fileOverview Institutional Topic Registry v19.0.
 * FIXED: Rebalanced header spacing and replaced native filters with high-fidelity Select nodes.
 * VISIBILITY: Forced dark background on dropdowns to resolve "invisible text" issues.
 */
export default function TopicManagement() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [chapterFilter, setChapterFilter] = useState("all")
  
  const { data: rawTopics, loading: topicsLoading } = useCollection<Topic>(useMemo(() => (db ? query(collection(db, "topics"), orderBy("displayOrder", "asc")) : null), [db]))
  const { data: subjects } = useCollection<Subject>(useMemo(() => (db ? query(collection(db, "subjects"), orderBy("name", "asc")) : null), [db]))
  const { data: chapters } = useCollection<Chapter>(useMemo(() => (db ? query(collection(db, "chapters"), orderBy("name", "asc")) : null), [db]))

  const topics = useMemo(() => {
    if (!rawTopics) return []
    return rawTopics.filter(t => {
       const matchesSearch = t.name?.toLowerCase().includes(searchTerm.toLowerCase())
       const matchesSubject = subjectFilter === "all" || t.subjectId === subjectFilter
       const matchesChapter = chapterFilter === "all" || t.chapterId === chapterFilter
       return matchesSearch && matchesSubject && matchesChapter
    })
  }, [rawTopics, searchTerm, subjectFilter, chapterFilter])

  const filteredChapters = useMemo(() => {
     if (!chapters) return []
     return chapters.filter(c => subjectFilter === 'all' || c.subjectId === subjectFilter)
  }, [chapters, subjectFilter])

  const [editingTopic, setEditingTopic] = useState<Partial<Topic> | null>(null)

  const { isSaving, saveDocument } = useFirestoreCrud({
    db,
    collectionName: "topics",
    toastMessages: { saveSuccess: "Topic Synced" },
  })

  const handleSave = async () => {
    if (!editingTopic || !editingTopic.name || !editingTopic.subjectId || !editingTopic.chapterId) {
       toast({ variant: "destructive", title: "Validation Error", description: "Name, Subject, and Chapter are mandatory." })
       return
    }

    const id = editingTopic.id || `topic-${Date.now()}`
    await saveDocument(
      { ...editingTopic, id, displayOrder: parseInt(editingTopic.displayOrder as any) || 0 },
      { id, onSuccess: () => setEditingTopic(null) }
    )
  }

  return (
    <div className="space-y-10 md:space-y-16 text-left pb-32 animate-in fade-in duration-700 pt-2">
      
      {/* 1. HEADER HUB - REBALANCED */}
      <AdminPageHeader
        icon={Library}
        label="Granular Hierarchy Registry"
        title="Topic Manager"
        subtitle="Manage detailed study topics within specific chapters."
        actionLabel="New Topic"
        actionIcon={Plus}
        onAction={() => setEditingTopic({ name: "", subjectId: subjectFilter !== 'all' ? subjectFilter : "", chapterId: chapterFilter !== 'all' ? chapterFilter : "", isActive: true, displayOrder: (topics?.length || 0) + 1 })}
      />

      {/* 2. FILTER HUB - HIGH FIDELITY SELECTS */}
      <Card className="border-none shadow-xl rounded-2xl md:rounded-[2.5rem] bg-white mx-1 border border-slate-50 p-6 md:p-10">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="relative group md:col-span-2">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
               <Input 
                 className="h-12 pl-12 rounded-xl bg-slate-50 border-none font-bold text-sm shadow-inner" 
                 placeholder="Search topics..." 
                 value={searchTerm} 
                 onChange={e => setSearchTerm(e.target.value)} 
               />
            </div>
            <div className="space-y-1.5">
               <Select value={subjectFilter} onValueChange={(v) => { setSubjectFilter(v); setChapterFilter('all'); }}>
                  <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl px-5 font-bold text-xs shadow-inner">
                     <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0B1528] border-white/10 text-white">
                     <SelectItem value="all">All Subjects Hub</SelectItem>
                     {subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
               </Select>
            </div>
            <div className="space-y-1.5">
               <Select value={chapterFilter} onValueChange={setChapterFilter}>
                  <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl px-5 font-bold text-xs shadow-inner">
                     <SelectValue placeholder="All Chapters" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0B1528] border-white/10 text-white">
                     <SelectItem value="all">All Chapters Hub</SelectItem>
                     {filteredChapters.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
               </Select>
            </div>
         </div>
      </Card>

      {/* 3. DATA LEDGER */}
      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-16 md:h-20">
                <TableHead className="px-8 md:px-12 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Topic Identity</TableHead>
                <TableHead className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Parent Chapter</TableHead>
                <TableHead className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-center text-slate-400">Status</TableHead>
                <TableHead className="text-right px-8 md:px-12 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topicsLoading ? (
                <AdminTableSkeleton rows={5} columns={4} />
              ) : topics.length > 0 ? topics.map((t) => {
                const chapter = chapters?.find(c => c.id === t.chapterId)
                return (
                  <TableRow key={t.id} className="hover:bg-slate-50 border-slate-50 transition-colors group">
                    <TableCell className="px-8 md:px-12 py-6 md:py-10">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shadow-inner group-hover:bg-primary/5 group-hover:text-primary transition-all">
                             <Library className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                             <p className="font-bold text-[#0F172A] text-sm md:text-lg leading-tight truncate">{t.name}</p>
                             <p className="text-[9px] font-black text-slate-300 mt-1.5 uppercase tracking-widest">ID: {t.id.slice(-6)}</p>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="space-y-1">
                          <p className="text-[11px] md:text-[13px] font-bold text-[#0F172A] line-clamp-1">{chapter?.name || 'ORPHAN'}</p>
                          <Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-400 text-[8px] font-black px-2 uppercase tracking-widest">Node Registry</Badge>
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <Badge className={cn("border-none text-[8px] md:text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest shadow-sm", t.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400")}>
                          {t.isActive ? 'Active' : 'Disabled'}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right px-8 md:px-12">
                       <div className="flex justify-end gap-2 md:gap-4 opacity-20 group-hover:opacity-100 transition-all">
                          <button onClick={() => setEditingTopic(t)} className="h-9 w-9 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90 transition-all"><Edit className="h-4 w-4" /></button>
                          <button onClick={async () => { if(confirm("Permanently purge this topic node?")) await deleteDoc(doc(db!, "topics", t.id)) }} className="h-9 w-9 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all"><Trash2 className="h-4 w-4" /></button>
                       </div>
                    </TableCell>
                  </TableRow>
                )
              }) : (
                 <TableRow>
                    <TableCell colSpan={4} className="h-60 text-center opacity-30 italic font-black uppercase text-sm">No topics registered</TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 4. MODAL HUB */}
      <AdminDialogShell
        open={!!editingTopic}
        onOpenChange={() => setEditingTopic(null)}
        title="Topic Architect"
        description="Configure granular study topic details for the CBT engine."
        isSaving={isSaving}
        onSave={handleSave}
        onDiscard={() => setEditingTopic(null)}
        saveLabel="Commit Topic"
      >
        <div className="space-y-6">
           <div className="space-y-1.5 text-left">
             <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Parent Subject Hub</Label>
             <Select value={editingTopic?.subjectId || ""} onValueChange={(v) => setEditingTopic({ ...editingTopic, subjectId: v, chapterId: '' })}>
                <SelectTrigger className="h-12 md:h-14 rounded-xl bg-slate-50 border-none font-bold px-5 shadow-inner">
                   <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent className="bg-[#0B1528] border-white/10 text-white">
                   {subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
             </Select>
           </div>
           <div className="space-y-1.5 text-left">
             <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Parent Chapter Node</Label>
             <Select value={editingTopic?.chapterId || ""} onValueChange={(v) => setEditingTopic({ ...editingTopic, chapterId: v })}>
                <SelectTrigger className="h-12 md:h-14 rounded-xl bg-slate-50 border-none font-bold px-5 shadow-inner" disabled={!editingTopic?.subjectId}>
                   <SelectValue placeholder="Select Chapter" />
                </SelectTrigger>
                <SelectContent className="bg-[#0B1528] border-white/10 text-white">
                   {chapters?.filter(c => c.subjectId === editingTopic?.subjectId).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
             </Select>
           </div>
           <div className="space-y-1.5 text-left">
             <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Topic Headline</Label>
             <Input value={editingTopic?.name || ""} onChange={e => setEditingTopic({ ...editingTopic, name: e.target.value })} className="h-12 md:h-14 rounded-xl border-slate-100 bg-slate-50 font-bold px-5 shadow-sm" placeholder="e.g. Battle of Sabraon" />
           </div>
           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5 text-left">
                 <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Display Order</Label>
                 <Input type="number" value={editingTopic?.displayOrder || ""} onChange={e => setEditingTopic({ ...editingTopic, displayOrder: parseInt(e.target.value) })} className="h-12 md:h-14 rounded-xl border-slate-100 bg-slate-50 font-black text-center shadow-sm" />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 shadow-inner mt-4">
                 <span className="text-[9px] font-black uppercase text-slate-500">Active Node</span>
                 <Switch checked={editingTopic?.isActive || false} onCheckedChange={v => setEditingTopic({...editingTopic, isActive: v})} />
              </div>
           </div>
        </div>
      </AdminDialogShell>
    </div>
  )
}
