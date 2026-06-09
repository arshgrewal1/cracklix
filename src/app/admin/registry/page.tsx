
"use client"

import React, { useMemo, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Globe, 
  GraduationCap, 
  Layers, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  GitMerge, 
  Loader2, 
  CheckCircle2, 
  Landmark, 
  Image as ImageIcon, 
  Upload, 
  X, 
  ShieldCheck,
  ChevronRight,
  Database,
  SearchCode
} from "lucide-react"
import { useCollection, useFirestore, useStorage } from "@/firebase"
import { collection, query, doc, deleteDoc, writeBatch, setDoc, serverTimestamp, getDocs, where, limit } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Consolidated Master Registry Hub v2.1.
 * UPDATED: Deduped Boards view to maintain authority hub integrity.
 */

export default function MasterRegistryPage() {
  const db = useFirestore()
  const storage = useStorage()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState("boards")
  const [searchTerm, setSearchTerm] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isMerging, setIsMerging] = useState(false)
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false)
  const [mergeSource, setMergeSource] = useState<string>("")
  const [mergeTarget, setMergeTarget] = useState<string>("")

  // STABILIZED DATA LISTENERS
  const { data: boards, loading: bLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: exams, loading: eLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))
  const { data: subjects, loading: sLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))

  // Local Form States
  const [editingBoard, setEditingBoard] = useState<any>(null)
  const [editingExam, setEditingExam] = useState<any>(null)
  const [editingSubject, setEditingSubject] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Filtered Lists (Memoized & Deduped)
  const filteredBoards = useMemo(() => {
     if (!boards) return [];
     const hubMap = new Map();
     boards.forEach(b => {
        const abbrev = (b.abbreviation || "").toUpperCase();
        if (!searchTerm || b.name?.toLowerCase().includes(searchTerm.toLowerCase()) || b.abbreviation?.toLowerCase().includes(searchTerm.toLowerCase())) {
           const key = abbrev || b.id;
           if (!hubMap.has(key)) hubMap.set(key, b);
        }
     });
     return Array.from(hubMap.values()).sort((a,b) => a.abbreviation.localeCompare(b.abbreviation));
  }, [boards, searchTerm]);

  const filteredExams = useMemo(() => exams?.filter(e => e.name?.toLowerCase().includes(searchTerm.toLowerCase())).sort((a,b) => a.name.localeCompare(b.name)), [exams, searchTerm])
  const filteredSubjects = useMemo(() => subjects?.filter(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase())).sort((a,b) => a.name.localeCompare(b.name)), [subjects, searchTerm])

  // --- Actions: Boards ---
  const handleSaveBoard = async () => {
    if (!db || !editingBoard?.abbreviation) return
    setIsSaving(true)
    const id = editingBoard.id || `board-${Date.now()}`
    try {
      await setDoc(doc(db, "boards", id), { ...editingBoard, id, updatedAt: serverTimestamp() }, { merge: true })
      toast({ title: "Authority Node Synced" })
      setEditingBoard(null)
    } finally { setIsSaving(false) }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !storage) return
    setIsUploading(true)
    const uploadRef = ref(storage, `authority_logos/${Date.now()}_${file.name.replace(/\s+/g, '_')}`)
    try {
      const snapshot = await uploadBytes(uploadRef, file)
      const url = await getDownloadURL(snapshot.ref)
      setEditingBoard((prev: any) => ({ ...prev, iconUrl: url }))
      toast({ title: "Asset Synced" })
    } finally { setIsUploading(false) }
  }

  // --- Actions: Exams ---
  const handleSaveExam = async () => {
    if (!db || !editingExam?.name) return
    setIsSaving(true)
    const id = editingExam.id || editingExam.name.toLowerCase().replace(/\s+/g, '-')
    try {
      await setDoc(doc(db, "exams", id), { ...editingExam, id, updatedAt: serverTimestamp() }, { merge: true })
      toast({ title: "Vertical Node Synced" })
      setEditingExam(null)
    } finally { setIsSaving(false) }
  }

  // --- Actions: Subjects ---
  const handleSaveSubject = async () => {
    if (!db || !editingSubject?.name) return
    setIsSaving(true)
    const id = editingSubject.id || editingSubject.name.toLowerCase().replace(/\s+/g, '-')
    const aliases = typeof editingSubject.aliases === 'string' ? editingSubject.aliases.split(',').map((s: string) => s.trim()).filter(Boolean) : editingSubject.aliases || []
    try {
      await setDoc(doc(db, "subjects", id), { ...editingSubject, id, aliases, updatedAt: serverTimestamp() }, { merge: true })
      toast({ title: "Subject Node Synced" })
      setEditingSubject(null)
    } finally { setIsSaving(false) }
  }

  // --- Actions: Normalization (Merge) ---
  const handleDeepMerge = async () => {
    if (!db || !mergeSource || !mergeTarget || mergeSource === mergeTarget) return
    setIsMerging(true)
    try {
       const batch = writeBatch(db)
       const field = activeTab === 'boards' ? 'boardId' : activeTab === 'verticals' ? 'examId' : 'subjectId'
       const coll = activeTab === 'boards' ? 'boards' : activeTab === 'verticals' ? 'exams' : 'subjects'
       
       const qSnap = await getDocs(query(collection(db, "questions"), where(field, "==", mergeSource), limit(500)))
       qSnap.docs.forEach(d => batch.update(doc(db, "questions", d.id), { [field]: mergeTarget, updatedAt: serverTimestamp() }))

       batch.delete(doc(db, coll, mergeSource))
       await batch.commit()
       toast({ title: "Normalization Complete", description: `Updated ${qSnap.size} MCQs in target hub.` })
       setMergeDialogOpen(false)
    } catch (e: any) { toast({ variant: "destructive", title: "Merge Failed" }) }
    finally { setIsMerging(false) }
  }

  return (
    <div className="space-y-12 pb-24 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Registry Command Hub</span>
           </div>
          <h1 className="text-5xl font-black font-headline text-[#0F172A] uppercase tracking-tight">Master Registry</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Manage Authorities, Verticals, and Subjects in one unified node.</p>
        </div>
        <div className="flex gap-4">
           <Button onClick={() => setMergeDialogOpen(true)} variant="outline" className="h-16 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-3 border-slate-200 bg-white shadow-sm hover:bg-slate-50">
              <GitMerge className="h-5 w-5 text-emerald-500" /> Normalization Hub
           </Button>
           <Button onClick={() => {
              if(activeTab === 'boards') setEditingBoard({ abbreviation: "", name: "", description: "" })
              if(activeTab === 'verticals') setEditingExam({ name: "", boardId: "", category: "STATE" })
              if(activeTab === 'subjects') setEditingSubject({ name: "", aliases: [] })
           }} className="bg-[#0F172A] hover:bg-black text-white h-16 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-3 shadow-2xl transition-all active:scale-95">
              <Plus className="h-5 w-5 text-primary" /> Register New Hub
           </Button>
        </div>
      </div>

      <div className="mx-4 relative group">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
         <Input className="h-16 pl-16 rounded-[1.5rem] bg-white border-none shadow-2xl text-lg font-medium" placeholder="Search master hub..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 space-y-10">
         <TabsList className="bg-slate-50 border border-slate-100 p-1.5 h-16 rounded-2xl shadow-sm inline-flex gap-2">
            <TabsTrigger value="boards" className="rounded-xl px-10 font-black uppercase text-[10px] h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white"><Landmark className="h-4 w-4 mr-2" /> Authorities</TabsTrigger>
            <TabsTrigger value="verticals" className="rounded-xl px-10 font-black uppercase text-[10px] h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white"><GraduationCap className="h-4 w-4 mr-2" /> Verticals</TabsTrigger>
            <TabsTrigger value="subjects" className="rounded-xl px-10 font-black uppercase text-[10px] h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white"><SearchCode className="h-4 w-4 mr-2" /> Subjects</TabsTrigger>
         </TabsList>

         <Card className="border-none shadow-3xl bg-white rounded-[3rem] overflow-hidden">
            <Table>
               <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-slate-50 h-20">
                     <TableHead className="px-10 text-[10px] font-black uppercase tracking-widest">Hub Identity</TableHead>
                     <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                     <TableHead className="text-right px-10 text-[10px] font-black uppercase tracking-widest">Control</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {/* BOARDS TAB */}
                  <TabsContent value="boards" asChild>
                     <>
                     {bLoading ? <TableRow><TableCell colSpan={3} className="p-10"><Skeleton className="h-16 w-full rounded-2xl"/></TableCell></TableRow> : 
                      filteredBoards?.map(b => (
                        <TableRow key={b.id} className="hover:bg-slate-50 group border-slate-50 transition-all">
                           <TableCell className="px-10 py-8">
                              <div className="flex items-center gap-6">
                                 <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                                    {b.iconUrl ? <img src={b.iconUrl} className="h-full w-full object-contain p-2" /> : <Landmark className="h-6 w-6 text-slate-300" />}
                                 </div>
                                 <div>
                                    <p className="font-black text-[#0F172A] text-xl uppercase leading-none">{b.abbreviation}</p>
                                    <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">{b.name}</p>
                                 </div>
                              </div>
                           </TableCell>
                           <TableCell>
                              <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] uppercase">ACTIVE</Badge>
                           </TableCell>
                           <TableCell className="text-right px-10">
                              <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100">
                                 <Button variant="ghost" size="icon" onClick={() => setEditingBoard(b)}><Edit className="h-5 w-5" /></Button>
                                 <Button variant="ghost" size="icon" className="hover:text-rose-600" onClick={async () => { if(confirm("Purge Hub?")) await deleteDoc(doc(db!, "boards", b.id)) }}><Trash2 className="h-5 w-5" /></Button>
                              </div>
                           </TableCell>
                        </TableRow>
                      ))}
                     </>
                  </TabsContent>

                  {/* VERTICALS TAB */}
                  <TabsContent value="verticals" asChild>
                     <>
                     {eLoading ? <TableRow><TableCell colSpan={3} className="p-10"><Skeleton className="h-16 w-full rounded-2xl"/></TableCell></TableRow> : 
                      filteredExams?.map(e => (
                        <TableRow key={e.id} className="hover:bg-slate-50 group border-slate-50 transition-all">
                           <TableCell className="px-10 py-8">
                              <div className="flex items-center gap-6">
                                 <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 shadow-inner text-amber-600">
                                    <GraduationCap className="h-6 w-6" />
                                 </div>
                                 <div>
                                    <p className="font-black text-[#0F172A] text-xl uppercase leading-none">{e.name}</p>
                                    <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">{e.boardId} Hub</p>
                                 </div>
                              </div>
                           </TableCell>
                           <TableCell>
                              <Badge className="bg-amber-50 text-amber-600 border-none font-black text-[8px] uppercase">VERTICAL</Badge>
                           </TableCell>
                           <TableCell className="text-right px-10">
                              <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100">
                                 <Button variant="ghost" size="icon" onClick={() => setEditingExam(e)}><Edit className="h-5 w-5" /></Button>
                                 <Button variant="ghost" size="icon" className="hover:text-rose-600" onClick={async () => { if(confirm("Purge Vertical?")) await deleteDoc(doc(db!, "exams", e.id)) }}><Trash2 className="h-5 w-5" /></Button>
                              </div>
                           </TableCell>
                        </TableRow>
                      ))}
                     </>
                  </TabsContent>

                  {/* SUBJECTS TAB */}
                  <TabsContent value="subjects" asChild>
                     <>
                     {sLoading ? <TableRow><TableCell colSpan={3} className="p-10"><Skeleton className="h-16 w-full rounded-2xl"/></TableCell></TableRow> : 
                      filteredSubjects?.map(s => (
                        <TableRow key={s.id} className="hover:bg-slate-50 group border-slate-50 transition-all">
                           <TableCell className="px-10 py-8">
                              <div className="flex items-center gap-6">
                                 <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 shadow-inner text-emerald-600">
                                    <SearchCode className="h-6 w-6" />
                                 </div>
                                 <div>
                                    <p className="font-black text-[#0F172A] text-xl uppercase leading-none">{s.name}</p>
                                    <div className="flex gap-2 mt-2">
                                       {s.aliases?.slice(0,3).map((a: string) => <span key={a} className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{a}</span>)}
                                    </div>
                                 </div>
                              </div>
                           </TableCell>
                           <TableCell>
                              <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] uppercase">CANONICAL</Badge>
                           </TableCell>
                           <TableCell className="text-right px-10">
                              <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100">
                                 <Button variant="ghost" size="icon" onClick={() => setEditingSubject(s)}><Edit className="h-5 w-5" /></Button>
                                 <Button variant="ghost" size="icon" className="hover:text-rose-600" onClick={async () => { if(confirm("Purge Subject?")) await deleteDoc(doc(db!, "subjects", s.id)) }}><Trash2 className="h-5 w-5" /></Button>
                              </div>
                           </TableCell>
                        </TableRow>
                      ))}
                     </>
                  </TabsContent>
               </TableBody>
            </Table>
         </Card>
      </Tabs>

      {/* MERGE DIALOG */}
      <Dialog open={mergeDialogOpen} onOpenChange={mergeDialogOpen && !isMerging ? setMergeDialogOpen : undefined}>
         <DialogContent className="sm:max-w-xl rounded-[2.5rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left">
            <div className="h-2 w-full bg-emerald-500" />
            <DialogHeader className="p-10 pb-4">
               <DialogTitle className="text-2xl font-black font-headline uppercase flex items-center gap-3"><GitMerge className="h-6 w-6 text-emerald-500" /> Normalization Engine</DialogTitle>
               <p className="text-slate-400 text-sm font-medium">Consolidate duplicate {activeTab} into one canonical hub.</p>
            </DialogHeader>
            <div className="p-10 space-y-8">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Source Node (TO BE PURGED)</Label>
                  <select value={mergeSource} onChange={e => setMergeSource(e.target.value)} className="w-full h-14 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none">
                     <option value="">Select Source</option>
                     {activeTab === 'boards' && boards?.map((b:any) => <option key={b.id} value={b.id}>{b.abbreviation} Hub</option>)}
                     {activeTab === 'verticals' && exams?.map((e:any) => <option key={e.id} value={e.id}>{e.name}</option>)}
                     {activeTab === 'subjects' && subjects?.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Target Hub (CANONICAL)</Label>
                  <select value={mergeTarget} onChange={e => setMergeTarget(e.target.value)} className="w-full h-14 bg-[#0F172A] text-white border-none rounded-xl px-4 font-bold text-sm outline-none">
                     <option value="">Select Canonical Hub</option>
                     {activeTab === 'boards' && boards?.filter((b:any) => b.id !== mergeSource).map((b:any) => <option key={b.id} value={b.id}>{b.abbreviation} Hub</option>)}
                     {activeTab === 'verticals' && exams?.filter((e:any) => e.id !== mergeSource).map((e:any) => <option key={e.id} value={e.id}>{e.name}</option>)}
                     {activeTab === 'subjects' && subjects?.filter((s:any) => s.id !== mergeSource).map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
               </div>
            </div>
            <DialogFooter className="p-10 pt-0">
               <Button onClick={handleDeepMerge} disabled={isMerging || !mergeSource || !mergeTarget} className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl transition-all">
                  {isMerging ? <Loader2 className="h-5 w-5 animate-spin" /> : "Authorize Deep Merge"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      {/* BOARD EDIT DIALOG */}
      <Dialog open={!!editingBoard} onOpenChange={o => !o && setEditingBoard(null)}>
         <DialogContent className="sm:max-w-xl rounded-[2.5rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left">
            <div className="h-2 w-full bg-[#0F172A]" />
            <DialogHeader className="p-10 pb-0">
               <DialogTitle className="text-2xl font-black font-headline uppercase">Authority Registry</DialogTitle>
            </DialogHeader>
            <div className="p-10 space-y-8">
               <div className="flex flex-col items-center gap-6">
                  <div className="h-32 w-32 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group shadow-inner">
                     {isUploading ? <Loader2 className="h-6 w-6 text-primary animate-spin" /> : 
                      editingBoard?.iconUrl ? <img src={editingBoard.iconUrl} className="h-full w-full object-contain p-4" /> : <ImageIcon className="h-10 w-10 text-slate-300" />}
                  </div>
                  <Button variant="outline" className="h-11 px-8 rounded-xl font-black uppercase text-[9px] gap-2 border-slate-200" onClick={() => fileInputRef.current?.click()}>
                     <Upload className="h-4 w-4" /> {isUploading ? 'Syncing...' : 'Upload Logo'}
                  </Button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Short Code</Label>
                     <Input value={editingBoard?.abbreviation || ""} onChange={e => setEditingBoard({...editingBoard, abbreviation: e.target.value})} className="h-12 rounded-xl font-black uppercase" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Full Name</Label>
                     <Input value={editingBoard?.name || ""} onChange={e => setEditingBoard({...editingBoard, name: e.target.value})} className="h-12 rounded-xl font-bold" />
                  </div>
               </div>
            </div>
            <DialogFooter className="p-10 pt-0">
               <Button onClick={handleSaveBoard} disabled={isSaving || isUploading} className="w-full h-16 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Commit Authority Node"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
