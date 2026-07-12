"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, Search, GitMerge, Loader2, SearchCode, Save, X } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, deleteDoc, writeBatch, setDoc, serverTimestamp, getDocs, where, limit } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { AdminPageHeader, AdminSearchInput, AdminTableSkeleton, AdminDialogShell } from "@/components/admin"
import { useFirestoreCrud } from "@/hooks/useFirestoreCrud"

/**
 * @fileOverview Subject Registry Hub v18.2.
 * FIXED: Added missing Dialog and Badge imports to resolve runtime crashes.
 */

export default function SubjectRegistryPage() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [boardFilter, setBoardFilter] = useState("all")
  const [isMerging, setIsMerging] = useState(false)
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false)
  const [mergeSource, setMergeSource] = useState<string>("")
  const [mergeTarget, setMergeTarget] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)
  const [editingSubject, setEditingSubject] = useState<any>(null)

  const subjectsQuery = useMemo(() => (db ? collection(db, "subjects") : null), [db]);
  const { data: subjects, loading } = useCollection<any>(subjectsQuery)
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))

  const filteredSubjects = useMemo(() => {
    if (!subjects) return []
    return (subjects || []).filter((s: any) => {
      const matchesSearch = (s.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBoard = boardFilter === 'all' || s.boardId === boardFilter;
      return matchesSearch && matchesBoard;
    }).sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""))
  }, [subjects, searchTerm, boardFilter])

  const handleSaveSubject = async () => {
    if (!db || !editingSubject.name || !editingSubject.boardId) {
      toast({ variant: "destructive", title: "Validation Error", description: "Name and Board Hub are mandatory." })
      return
    }
    setIsSaving(true)
    const id = editingSubject.id || editingSubject.name.toLowerCase().replace(/\s+/g, '-')
    const subjectRef = doc(db, "subjects", id)
    
    const payload = {
      ...editingSubject,
      id,
      updatedAt: serverTimestamp(),
      aliases: typeof editingSubject.aliases === 'string' 
        ? editingSubject.aliases.split(',').map((s: string) => s.trim()).filter(Boolean)
        : editingSubject.aliases || []
    }

    try {
      await setDoc(subjectRef, payload, { merge: true })
      toast({ title: "Registry Updated" })
      setEditingSubject(null)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeepMerge = async () => {
    if (!db || !mergeSource || !mergeTarget || mergeSource === mergeTarget) return
    setIsMerging(true)
    try {
      const qSnap = await getDocs(query(collection(db, "questions"), where("subjectId", "==", mergeSource), limit(500)))
      const batch = writeBatch(db)
      qSnap.docs.forEach(d => batch.update(doc(db, "questions", d.id), { subjectId: mergeTarget, updatedAt: serverTimestamp() }))
      batch.delete(doc(db, "subjects", mergeSource))
      await batch.commit()
      toast({ title: "Nodes Consolidated" })
      setMergeDialogOpen(false)
    } finally { setIsMerging(false) }
  }

  return (
    <div className="space-y-6 md:space-y-12 pb-32 text-left animate-in fade-in duration-500">
      <AdminPageHeader
        icon={SearchCode}
        label="Canonical Mapping Registry"
        title="Subject List"
        subtitle="Normalize preparation nodes."
        actionLabel="Register Node"
        actionIcon={Plus}
        onAction={() => setEditingSubject({ name: "", boardId: boardFilter !== 'all' ? boardFilter : "", aliases: [], description: "" })}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-1">
         <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
            <Input 
              className="h-14 md:h-16 pl-14 rounded-2xl bg-white border-slate-50 shadow-inner font-bold" 
              placeholder="Search subjects..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex gap-2">
            <select value={boardFilter} onChange={e => setBoardFilter(e.target.value)} className="flex-1 h-14 md:h-16 px-6 rounded-2xl bg-white border-slate-50 shadow-inner font-bold outline-none text-sm appearance-none cursor-pointer">
               <option value="all">Filter by Board Hub</option>
               {boards?.map(b => <option key={b.id} value={b.id}>{b.abbreviation} Hub</option>)}
            </select>
            <Button onClick={() => setMergeDialogOpen(true)} variant="outline" className="h-14 md:h-16 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-3 border-slate-200 bg-white shadow-sm hover:bg-slate-50 shrink-0">
               <GitMerge className="h-5 w-5 text-emerald-500" /> Normalize
            </Button>
         </div>
      </div>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-14 md:h-20">
                <TableHead className="px-6 md:px-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Canonical Identity</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Authority Board</TableHead>
                <TableHead className="text-right px-6 md:px-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <AdminTableSkeleton rows={5} columns={3} />
              ) : filteredSubjects.map((s: any) => (
                <TableRow key={s.id} className="hover:bg-slate-50 border-slate-50 transition-colors group">
                  <TableCell className="px-6 md:px-12 py-5 md:py-8">
                    <div className="flex items-center gap-4 md:gap-6">
                       <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-105">
                          <SearchCode className="h-5 w-5 md:h-6 md:w-6 text-slate-300" />
                       </div>
                       <div className="min-w-0">
                          <p className="font-bold text-[#0F172A] text-sm md:text-lg leading-tight truncate">{s.name}</p>
                          <code className="text-[8px] font-mono text-slate-300 uppercase mt-1 block truncate">ID: {s.id}</code>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>
                     <Badge variant="outline" className="bg-primary/5 border-none text-primary text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-sm">
                        {boards?.find(b => b.id === s.boardId)?.abbreviation || 'Unassigned'} Hub
                     </Badge>
                  </TableCell>
                  <TableCell className="text-right px-6 md:px-12">
                    <div className="flex justify-end gap-2 md:gap-3 opacity-20 group-hover:opacity-100 transition-all">
                       <button onClick={() => setEditingSubject(s)} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90 transition-all"><Edit className="h-4 w-4" /></button>
                       <button onClick={async () => { if(confirm("Permanently purge this subject node?")) await deleteDoc(doc(db!, "subjects", s.id)) }} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all"><Trash2 className="h-4 w-4 md:h-5 md:w-5" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AdminDialogShell
        open={!!editingSubject}
        onOpenChange={o => !o && !isSaving && setEditingSubject(null)}
        title="Subject Architect"
        description="Modify canonical registry mappings."
        isSaving={isSaving}
        onSave={handleSaveSubject}
        onDiscard={() => setEditingSubject(null)}
        saveLabel="Commit Hub"
      >
         <div className="space-y-6 md:space-y-8 overflow-y-auto custom-scrollbar flex-1">
            <div className="space-y-2 text-left">
               <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Parent Board Hub</Label>
               <select value={editingSubject?.boardId || ""} onChange={e => setEditingSubject({...editingSubject, boardId: e.target.value})} className="w-full h-12 md:h-14 bg-slate-50 border-none rounded-xl px-5 font-bold text-sm outline-none shadow-inner">
                  <option value="" disabled>Select Board</option>
                  {boards?.map(b => <option key={b.id} value={b.id}>{b.abbreviation} Hub</option>)}
               </select>
            </div>
            <div className="space-y-2 text-left">
               <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Canonical Name</Label>
               <Input value={editingSubject?.name ?? ""} onChange={e => setEditingSubject({...editingSubject, name: e.target.value})} className="h-12 md:h-14 rounded-xl border-slate-200 bg-slate-50 font-bold px-5" placeholder="e.g. Punjab History" />
            </div>
            <div className="space-y-2 text-left">
               <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Relational Aliases</Label>
               <Textarea 
                 value={typeof editingSubject?.aliases === 'string' ? editingSubject.aliases : editingSubject?.aliases?.join(', ') || ""} 
                 onChange={e => setEditingSubject({...editingSubject, aliases: e.target.value})} 
                 className="min-h-[120px] rounded-xl border-slate-100 bg-slate-50 p-5 font-medium leading-relaxed shadow-inner resize-none" 
                 placeholder="Separate by commas (e.g. Modern Punjab, Sikh Empire)..."
               />
            </div>
         </div>
      </AdminDialogShell>

      <Dialog open={mergeDialogOpen} onOpenChange={(o) => mergeDialogOpen && !isMerging ? setMergeDialogOpen(o) : undefined}>
         <DialogContent className="sm:max-w-xl rounded-[2.5rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left">
            <div className="h-2 w-full bg-emerald-500" />
            <DialogHeader className="p-10 pb-4">
               <DialogTitle className="text-2xl font-black font-headline uppercase flex items-center gap-3"><GitMerge className="h-6 w-6 text-emerald-500" /> Normalization Engine</DialogTitle>
               <DialogDescription className="text-slate-400 text-sm font-medium">Consolidate duplicate subject nodes into one canonical hub.</DialogDescription>
            </DialogHeader>
            <div className="p-10 space-y-8">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Source Node (TO BE PURGED)</Label>
                  <select value={mergeSource} onChange={e => setMergeSource(e.target.value)} className="w-full h-14 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none">
                     <option value="">Select Source</option>
                     {subjects?.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Target Hub (CANONICAL)</Label>
                  <select value={mergeTarget} onChange={e => setMergeTarget(e.target.value)} className="w-full h-14 bg-[#0F172A] text-white border-none rounded-xl px-4 font-bold text-sm outline-none">
                     <option value="">Select Canonical Hub</option>
                     {subjects?.filter((s:any) => s.id !== mergeSource).map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
               </div>
            </div>
            <DialogFooter className="p-10 pt-0">
               <Button onClick={handleDeepMerge} disabled={isMerging || !mergeSource || !mergeTarget} className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl transition-all">
                  {isMerging ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-4 w-4" />} Authorize Deep Merge
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
