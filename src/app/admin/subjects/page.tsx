
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit, Search, GitMerge, Loader2, SearchCode, Save, X } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, deleteDoc, writeBatch, setDoc, serverTimestamp, getDocs, where, limit } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Subject Registry Hub v17.0 (PWA Optimized).
 * UPDATED: Removed uppercase, implemented Title Case and Primary Blue Pill standard.
 */

export default function SubjectRegistryPage() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [isMerging, setIsMerging] = useState(false)
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false)
  const [mergeSource, setMergeSource] = useState<string>("")
  const [mergeTarget, setMergeTarget] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)
  const [editingSubject, setEditingSubject] = useState<any>(null)

  const subjectsQuery = useMemo(() => (db ? query(collection(db, "subjects"), limit(200)) : null), [db]);
  const { data: subjects, loading } = useCollection<any>(subjectsQuery)

  const filteredSubjects = useMemo(() => {
    if (!subjects) return []
    return (subjects || []).filter((s: any) => 
      (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.aliases?.some((a: string) => a.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""))
  }, [subjects, searchTerm])

  const handleSaveSubject = async () => {
    if (!db || !editingSubject.name) return
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-1">
              <SearchCode className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Canonical Mapping Registry</span>
           </div>
          <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-none">Subject List</h1>
          <p className="text-slate-500 text-[11px] md:text-lg font-medium leading-tight">Normalize preparation nodes.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
           <Button onClick={() => setMergeDialogOpen(true)} variant="outline" className="flex-1 sm:flex-none h-11 md:h-14 px-6 rounded-full font-black uppercase text-[10px] tracking-widest gap-2 border-slate-200 bg-white shadow-sm">
              <GitMerge className="h-4 w-4 text-emerald-500" /> Deep Merge
           </Button>
           <Button onClick={() => setEditingSubject({ name: "", aliases: [], description: "" })} className="flex-1 sm:flex-none h-11 md:h-14 px-8 bg-primary hover:bg-blue-700 text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl border-none active:scale-95 gap-2">
              <Plus className="h-4 w-4" /> Register Node
           </Button>
        </div>
      </div>

      <div className="relative group px-1">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
         <Input 
           className="h-14 md:h-16 pl-14 rounded-2xl md:rounded-full bg-white border-slate-50 shadow-inner text-base md:text-lg font-bold" 
           placeholder="Search subjects or aliases..." 
           value={searchTerm}
           onChange={e => setSearchTerm(e.target.value)}
         />
      </div>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-14 md:h-20">
                <TableHead className="px-6 md:px-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Canonical Identity</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Aliases</TableHead>
                <TableHead className="text-right px-6 md:px-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-50"><TableCell colSpan={3} className="px-6 py-6 md:px-12 md:py-8"><Skeleton className="h-10 w-full rounded-xl bg-slate-50" /></TableCell></TableRow>
                ))
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
                     <div className="flex flex-wrap gap-1.5 md:gap-2 max-w-lg">
                        {s.aliases?.map((a: string, i: number) => (
                           <Badge key={i} variant="outline" className="bg-white border-slate-100 text-slate-400 text-[7px] md:text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-sm">
                              {a}
                           </Badge>
                        ))}
                     </div>
                  </TableCell>
                  <TableCell className="text-right px-6 md:px-12">
                    <div className="flex justify-end gap-2 md:gap-3 opacity-20 group-hover:opacity-100 transition-all">
                       <button onClick={() => setEditingSubject(s)} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90 transition-all"><Edit className="h-4 w-4 md:h-5 md:w-5" /></button>
                       <button onClick={async () => { if(confirm("Permanently purge this subject node?")) await deleteDoc(doc(db!, "subjects", s.id)) }} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all"><Trash2 className="h-4 w-4 md:h-5 md:w-5" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingSubject} onOpenChange={o => !o && !isSaving && setEditingSubject(null)}>
         <DialogContent className="sm:max-w-xl w-[95vw] max-h-[95vh] rounded-3xl md:rounded-[3rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
            <div className="h-2 w-full bg-[#0F172A] shrink-0" />
            <DialogHeader className="p-6 md:p-10 pb-2 md:pb-4 shrink-0">
               <div className="flex justify-between items-center">
                  <DialogTitle className="text-xl md:text-3xl font-black text-[#0F172A]">Subject Architect</DialogTitle>
                  <button onClick={() => setEditingSubject(null)} className="p-2 rounded-xl hover:bg-slate-50 transition-colors"><X className="h-5 w-5 text-slate-400" /></button>
               </div>
               <DialogDescription className="text-slate-400 font-bold text-[9px] md:text-sm mt-1">Modify canonical registry mappings.</DialogDescription>
            </DialogHeader>
            <div className="px-6 md:px-10 pb-6 md:pb-10 space-y-6 md:space-y-8 overflow-y-auto custom-scrollbar flex-1">
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
            <DialogFooter className="p-6 md:p-10 pt-4 bg-slate-50 border-t border-slate-100 flex flex-row gap-4 shrink-0">
               <Button variant="ghost" onClick={() => setEditingSubject(null)} className="h-11 md:h-12 px-6 font-black uppercase text-[10px] text-slate-400">Discard</Button>
               <Button onClick={handleSaveSubject} disabled={isSaving} className="flex-1 h-11 md:h-14 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-full shadow-xl border-none active:scale-95 gap-2">
                  {isSaving ? <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" /> : <Save className="h-3 w-3 md:h-4 md:w-4" />} Commit Hub
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      <Dialog open={mergeDialogOpen} onOpenChange={o => !o && !isMerging && setMergeDialogOpen(false)}>
         <DialogContent className="sm:max-w-xl w-[95vw] rounded-[2.5rem] md:rounded-[3rem] bg-[#0F172A] text-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
            <div className="h-2 w-full bg-emerald-500 shrink-0" />
            <DialogHeader className="p-8 md:p-12 text-center space-y-4 shrink-0">
               <div className="h-16 w-16 md:h-20 md:w-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-500 shadow-2xl">
                  <GitMerge className="h-10 w-10" />
               </div>
               <DialogTitle className="text-2xl md:text-4xl font-black uppercase tracking-tight">Normalization Hub</DialogTitle>
               <DialogDescription className="text-slate-400 font-medium text-sm md:text-lg">Consolidate preparation nodes into one canonical entry.</DialogDescription>
            </DialogHeader>
            
            <div className="px-8 md:px-12 pb-8 md:pb-12 space-y-6 md:space-y-8 flex-1">
               <div className="space-y-2 text-left">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Source Subject (TO BE PURGED)</Label>
                  <select value={mergeSource} onChange={e => setMergeSource(e.target.value)} className="w-full h-12 md:h-14 bg-white/5 border border-white/10 rounded-xl px-4 outline-none font-bold text-sm">
                     <option value="" disabled className="bg-[#0F172A]">Select Source</option>
                     {subjects?.map((s:any) => <option key={s.id} value={s.id} className="bg-[#0F172A]">{s.name}</option>)}
                  </select>
               </div>
               <div className="space-y-2 text-left">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Target Hub (CANONICAL)</Label>
                  <select value={mergeTarget} onChange={e => setMergeTarget(e.target.value)} className="w-full h-12 md:h-14 bg-white/5 border border-white/10 rounded-xl px-4 outline-none font-bold text-sm">
                     <option value="" disabled className="bg-[#0F172A]">Select Target</option>
                     {(subjects || []).filter((s:any) => s.id !== mergeSource).map((s:any) => <option key={s.id} value={s.id} className="bg-[#0F172A]">{s.name}</option>)}
                  </select>
               </div>
            </div>

            <DialogFooter className="p-8 md:p-12 pt-0 shrink-0">
               <Button onClick={handleDeepMerge} disabled={isMerging || !mergeSource || !mergeTarget} className="w-full bg-emerald-600 hover:bg-emerald-700 h-14 md:h-16 rounded-2xl font-black uppercase text-[10px] md:text-[11px] tracking-widest shadow-2xl transition-all border-none gap-3 active:scale-95">
                  {isMerging ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Authorize Merge
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
