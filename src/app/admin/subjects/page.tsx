"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit, Search, GitMerge, Loader2, SearchCode, Save } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, deleteDoc, writeBatch, setDoc, serverTimestamp, getDocs, where, limit } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"

/**
 * @fileOverview Subject Registry Hub v15.6.
 * FIXED: Missing Save icon import.
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
    <div className="space-y-10 pb-32 text-left pt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <SearchCode className="h-6 w-6 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Canonical Mapping Registry</span>
           </div>
          <h1 className="text-4xl md:text-6xl font-black font-headline text-[#0F172A] uppercase tracking-tight">Subject List</h1>
          <p className="text-slate-500 font-medium text-lg">Normalize preparation nodes.</p>
        </div>
        <div className="flex gap-4">
           <Button onClick={() => setMergeDialogOpen(true)} variant="outline" className="h-16 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-3 border-slate-200 bg-white shadow-xl hover:bg-slate-50">
              <GitMerge className="h-5 w-5 text-emerald-500" /> Deep Merge
           </Button>
           <Button onClick={() => setEditingSubject({ name: "", aliases: [], description: "" })} className="bg-[#0F172A] hover:bg-black text-white h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-3xl gap-3 transition-all active:scale-95 border-none">
              <Plus className="h-5 w-5 text-primary" /> Register Node
           </Button>
        </div>
      </div>

      <div className="px-4">
        <div className="relative group max-w-2xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            className="h-16 pl-16 rounded-[1.5rem] bg-white border-none shadow-2xl text-lg font-medium" 
            placeholder="Search subjects..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-3xl bg-white rounded-[3rem] overflow-hidden mx-4">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-20">
                <TableHead className="px-10 text-[10px] font-black uppercase tracking-widest text-slate-500">Canonical Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Aliases</TableHead>
                <TableHead className="text-right px-10 text-[10px] font-black uppercase tracking-widest text-slate-500">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={3} className="px-10 py-8"><Skeleton className="h-12 w-full rounded-2xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : filteredSubjects.map((s: any) => (
                <TableRow key={s.id} className="hover:bg-slate-50 border-slate-50 transition-colors group">
                  <TableCell className="px-10 py-8">
                    <div className="flex items-center gap-6">
                       <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-inner">
                          <SearchCode className="h-6 w-6 text-slate-300" />
                       </div>
                       <div>
                          <p className="font-black text-[#0F172A] text-xl uppercase leading-none">{s.name}</p>
                          <code className="text-[9px] font-mono text-slate-400 mt-2 block uppercase tracking-widest">ID: {s.id}</code>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>
                     <div className="flex flex-wrap gap-2 max-w-lg">
                        {s.aliases?.map((a: string, i: number) => (
                           <Badge key={i} variant="outline" className="bg-white border-slate-100 text-slate-500 text-[8px] font-black uppercase px-2 py-0.5">
                              {a}
                           </Badge>
                        ))}
                     </div>
                  </TableCell>
                  <TableCell className="text-right px-10">
                    <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100 transition-all">
                       <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl" onClick={() => setEditingSubject(s)}><Edit className="h-5 w-5" /></Button>
                       <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl hover:text-rose-600" onClick={async () => { if(confirm("Purge?")) await deleteDoc(doc(db!, "subjects", s.id)) }}><Trash2 className="h-5 w-5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingSubject} onOpenChange={o => !o && setEditingSubject(null)}>
         <DialogContent className="sm:max-w-xl rounded-[3rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
            <div className="h-2 w-full bg-[#0F172A] shrink-0" />
            <DialogHeader className="p-10 pb-0">
               <DialogTitle className="text-2xl font-black font-headline uppercase">Subject Architect</DialogTitle>
               <DialogDescription className="text-slate-400 font-medium">Update the canonical name and aliases.</DialogDescription>
            </DialogHeader>
            <div className="p-10 space-y-6">
               <div className="space-y-2 text-left">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Canonical Name</Label>
                  <Input value={editingSubject?.name ?? ""} onChange={e => setEditingSubject({...editingSubject, name: e.target.value})} className="h-12 rounded-xl font-bold" />
               </div>
               <div className="space-y-2 text-left">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Aliases</Label>
                  <Textarea value={typeof editingSubject?.aliases === 'string' ? editingSubject.aliases : editingSubject?.aliases?.join(', ') || ""} onChange={e => setEditingSubject({...editingSubject, aliases: e.target.value})} className="h-32 rounded-xl bg-slate-50 border-none font-medium" />
               </div>
            </div>
            <DialogFooter className="p-10 pt-0">
               <Button onClick={handleSaveSubject} disabled={isSaving} className="w-full h-16 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl transition-all">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Commit Hub
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
         <DialogContent className="sm:max-w-xl rounded-[2.5rem] bg-[#0F172A] text-white border-white/10 p-10 shadow-5xl">
            <DialogHeader className="text-center space-y-4">
               <div className="h-20 w-20 bg-emerald-500/20 rounded-[2rem] flex items-center justify-center mx-auto text-emerald-500"><GitMerge className="h-10 w-10" /></div>
               <DialogTitle className="text-3xl font-headline font-black uppercase">Deep Merge Hub</DialogTitle>
               <DialogDescription className="text-slate-400 text-sm">Consolidate preparation nodes into one canonical entry.</DialogDescription>
            </DialogHeader>
            <div className="py-8 space-y-6">
               <div className="space-y-2 text-left">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Source Subject</Label>
                  <select value={mergeSource} onChange={e => setMergeSource(e.target.value)} className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 outline-none font-bold">
                     <option value="" disabled className="bg-[#0F172A]">Select Source</option>
                     {subjects?.map((s:any) => <option key={s.id} value={s.id} className="bg-[#0F172A]">{s.name}</option>)}
                  </select>
               </div>
               <div className="space-y-2 text-left">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Target Hub</Label>
                  <select value={mergeTarget} onChange={e => setMergeTarget(e.target.value)} className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 outline-none font-bold">
                     <option value="" disabled className="bg-[#0F172A]">Select Target</option>
                     {(subjects || []).filter((s:any) => s.id !== mergeSource).map((s:any) => <option key={s.id} value={s.id} className="bg-[#0F172A]">{s.name}</option>)}
                  </select>
               </div>
            </div>
            <DialogFooter>
               <Button onClick={handleDeepMerge} disabled={isMerging || !mergeSource || !mergeTarget} className="w-full bg-emerald-600 hover:bg-emerald-700 h-14 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-2xl">
                  Authorize Merge
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
