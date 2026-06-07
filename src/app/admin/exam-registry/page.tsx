
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  GitMerge, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  Layers,
  ChevronRight,
  Database,
  RefreshCw,
  X,
  Landmark,
  ShieldCheck,
  Trophy,
  GraduationCap
} from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, deleteDoc, writeBatch, updateDoc, setDoc, serverTimestamp, getDocs, where } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Exam Master Registry v2.2.
 * FIXED: setEditingExam state mapping corrected.
 */

export default function ExamRegistryPage() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [isMerging, setIsMerging] = useState(false)
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false)
  const [mergeSource, setMergeSource] = useState<string>("")
  const [mergeTarget, setMergeTarget] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)
  const [editingExam, setEditingExam] = useState<any>(null)

  const { data: exams, loading } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: questions } = useCollection<any>(useMemo(() => (db ? collection(db, "questions") : null), [db]))

  // Atomic content volume per exam registry
  const stats = useMemo(() => {
    if (!exams || !questions) return {}
    const map: Record<string, number> = {}
    questions.forEach((q: any) => {
      if (q.examId) map[q.examId] = (map[q.examId] || 0) + 1
    })
    return map
  }, [exams, questions])

  const filteredExams = useMemo(() => {
    if (!exams) return []
    return exams.filter(e => 
      e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.boardId?.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name))
  }, [exams, searchTerm])

  const handleSaveExam = async () => {
    if (!db || !editingExam.name || !editingExam.boardId) {
      toast({ variant: "destructive", title: "Audit Blocked", description: "Config incomplete." })
      return
    }
    setIsSaving(true)
    const id = editingExam.id || editingExam.name.toLowerCase().replace(/\s+/g, '-')
    const examRef = doc(db, "exams", id)
    
    const payload = {
      ...editingExam,
      id,
      updatedAt: serverTimestamp()
    }

    try {
      await setDoc(examRef, payload, { merge: true })
      toast({ title: "Hub Synced", description: `${payload.name} registered.` })
      setEditingExam(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: e.message })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeepMerge = async () => {
    if (!db || !mergeSource || !mergeTarget || mergeSource === mergeTarget) {
      toast({ variant: "destructive", title: "Selection Error" })
      return
    }

    const sourceExam = exams?.find(e => e.id === mergeSource)
    const targetExam = exams?.find(e => e.id === mergeTarget)
    
    if (!confirm(`CRITICAL: Merge "${sourceExam.name}" into "${targetExam.name}"? This will reassign all MCQs and Mocks.`)) return

    setIsMerging(true)
    try {
      const qSnap = await getDocs(query(collection(db, "questions"), where("examId", "==", mergeSource)))
      const batch = writeBatch(db)
      qSnap.docs.forEach(d => {
         batch.update(doc(db, "questions", d.id), { examId: mergeTarget, updatedAt: serverTimestamp() })
      })

      const mSnap = await getDocs(query(collection(db, "mocks"), where("examId", "==", mergeSource)))
      mSnap.docs.forEach(d => {
         batch.update(doc(db, "mocks", d.id), { examId: mergeTarget, updatedAt: serverTimestamp() })
      })

      batch.delete(doc(db, "exams", mergeSource))

      await batch.commit()
      toast({ title: "Normalization Complete", description: `Merged ${qSnap.size} MCQs into ${targetExam.name}.` })
      setMergeDialogOpen(false)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Merge Failed" })
    } finally {
      setIsMerging(false)
    }
  }

  return (
    <div className="space-y-12 pb-24 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Landmark className="h-6 w-6 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Exam Master Registry</span>
           </div>
          <h1 className="text-5xl font-black font-headline text-[#0F172A] uppercase tracking-tight">Master Hubs</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Coordinate and consolidate recruitment hubs for all Punjab verticals.</p>
        </div>
        <div className="flex gap-4">
           <Button onClick={() => setMergeDialogOpen(true)} variant="outline" className="h-16 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-3 border-slate-200 bg-white shadow-sm hover:bg-slate-50">
              <GitMerge className="h-5 w-5 text-emerald-500" /> Normalization Engine
           </Button>
           <Button onClick={() => setEditingExam({ name: "", boardId: "", description: "", category: "STATE" })} className="bg-primary hover:bg-orange-600 h-16 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-3 shadow-2xl transition-all active:scale-95">
              <Plus className="h-5 w-5" /> Register New Hub
           </Button>
        </div>
      </div>

      <div className="mx-4 relative group">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
         <Input 
           className="h-16 pl-16 rounded-[1.5rem] bg-white border-none shadow-2xl text-lg font-medium" 
           placeholder="Search exam hubs or boards..." 
           value={searchTerm}
           onChange={e => setSearchTerm(e.target.value)}
         />
      </div>

      <Card className="border-none shadow-3xl bg-white rounded-[3rem] overflow-hidden mx-4">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-20">
                <TableHead className="px-10 text-[10px] font-black uppercase tracking-widest text-slate-500">Hub Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Recruitment Context</TableHead>
                <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Registry Audit</TableHead>
                <TableHead className="text-right px-10 text-[10px] font-black uppercase tracking-widest text-slate-500">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={4} className="px-10 py-8"><Skeleton className="h-12 w-full rounded-2xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : filteredExams.map((e) => {
                const board = boards?.find((b: any) => 
                  b.id.toLowerCase() === e.boardId?.toLowerCase() || 
                  b.abbreviation?.toLowerCase() === e.boardId?.toLowerCase()
                );
                
                // PRIORITY: Exam-specific iconUrl first
                const logoUrl = e.iconUrl || board?.iconUrl;
                const isArmy = e.boardId?.toLowerCase() === 'army' || e.id?.toLowerCase().includes('army');

                return (
                  <TableRow key={e.id} className="hover:bg-slate-50 border-slate-50 transition-colors group">
                    <TableCell className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                            {logoUrl ? (
                              <img 
                                src={logoUrl} 
                                className={cn("w-full h-full object-contain p-2", isArmy ? "scale-125" : "")} 
                                alt="Logo" 
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="h-full w-full bg-amber-50 flex items-center justify-center text-amber-600 font-black text-xs">
                                {e.name?.[0]?.toUpperCase() || 'E'}
                              </div>
                            )}
                        </div>
                        <div>
                            <p className="font-black text-[#0F172A] text-xl uppercase tracking-tight leading-none">{e.name}</p>
                            <code className="text-[9px] font-mono text-slate-400 mt-2 block uppercase tracking-widest">REGISTRY ID: {e.id}</code>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                          <Badge variant="outline" className="bg-white border-slate-100 text-primary text-[8px] font-black uppercase px-2 py-0.5 w-fit">
                            {board?.abbreviation || e.boardId}
                          </Badge>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{e.category || 'General'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex flex-col items-center">
                          <span className={cn("text-2xl font-headline font-black", stats[e.id] > 0 ? "text-[#0F172A]" : "text-rose-400")}>
                            {stats[e.id] || 0}
                          </span>
                          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Atomic MCQs</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-10">
                      <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100 transition-all">
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl hover:bg-white shadow-sm" onClick={() => setEditingExam(e)}>
                            <Edit className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl hover:bg-rose-50 hover:text-rose-600 shadow-sm" onClick={async () => {
                            if (confirm("CRITICAL: Purge registry node? This cannot be undone.")) {
                              await deleteDoc(doc(db!, "exams", e.id))
                              toast({ title: "Registry Node Purged" })
                            }
                        }}>
                            <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Normalization Merge Dialog */}
      <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
         <DialogContent className="sm:max-w-xl rounded-[2.5rem] bg-white border-none shadow-4xl p-0 overflow-hidden text-left">
            <div className="h-2 w-full bg-emerald-500" />
            <DialogHeader className="p-10 pb-4">
               <DialogTitle className="text-2xl font-black font-headline uppercase flex items-center gap-3">
                  <GitMerge className="h-6 w-6 text-emerald-500" /> Normalization Engine
               </DialogTitle>
               <p className="text-slate-400 font-medium text-sm">Combine two duplicate exam registries into one unified hub.</p>
            </DialogHeader>
            <div className="p-10 space-y-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Duplicate Node (TO BE DELETED)</label>
                  <select 
                    value={mergeSource} 
                    onChange={e => setMergeSource(e.target.value)}
                    className="w-full h-14 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none"
                  >
                     <option value="">Select Source Registry</option>
                     {exams?.map((e: any) => <option key={e.id} value={e.id}>{e.name} ({stats[e.id] || 0} Qs)</option>)}
                  </select>
               </div>
               <div className="flex justify-center"><ChevronRight className="h-6 w-6 text-slate-200 rotate-90" /></div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Canonical Hub (TO BE RETAINED)</label>
                  <select 
                    value={mergeTarget} 
                    onChange={e => setMergeTarget(e.target.value)}
                    className="w-full h-14 bg-[#0F172A] text-white border-none rounded-xl px-4 font-bold text-sm outline-none"
                  >
                     <option value="" className="text-white/30">Select Target Hub</option>
                     {exams?.filter(e => e.id !== mergeSource).map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
               </div>
            </div>
            <DialogFooter className="p-10 pt-0">
               <Button variant="ghost" onClick={() => setMergeDialogOpen(false)} className="rounded-xl h-14 font-black uppercase text-[10px] px-8">Abort</Button>
               <Button 
                  onClick={handleDeepMerge} 
                  disabled={isMerging || !mergeSource || !mergeTarget} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-14 px-10 rounded-xl font-black uppercase text-[10px] tracking-widest flex-1 shadow-xl"
               >
                  {isMerging ? <Loader2 className="h-4 w-4 animate-spin" /> : "Authorize Deep Merge"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      {/* Registry Form Dialog */}
      <Dialog open={!!editingExam} onOpenChange={open => !open && setEditingExam(null)}>
         <DialogContent className="sm:max-w-xl rounded-[2.5rem] bg-white border-none shadow-4xl p-0 overflow-hidden text-left">
            <div className="h-2 w-full bg-[#0F172A]" />
            <DialogHeader className="p-10 pb-0 text-left">
               <DialogTitle className="text-2xl font-black font-headline uppercase">Hub Node Registry</DialogTitle>
            </DialogHeader>
            <div className="p-10 space-y-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Canonical Name</label>
                  <Input value={editingExam?.name || ""} onChange={e => setEditingExam({...editingExam, name: e.target.value})} className="h-14 rounded-xl border-slate-100 font-black text-lg text-[#0F172A]" />
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Recruiting Board</label>
                     <select 
                        value={editingExam?.boardId || ""} 
                        onChange={e => setEditingExam({...editingExam, boardId: e.target.value})} 
                        className="w-full h-14 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none"
                     >
                        <option value="">Select Board</option>
                        {boards?.map((b: any) => <option key={b.id} value={b.id}>{b.abbreviation}</option>)}
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Vertical Type</label>
                     <select 
                        value={editingExam?.category || "STATE"} 
                        onChange={e => setEditingExam({...editingExam, category: e.target.value})} 
                        className="w-full h-14 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none"
                     >
                        <option value="STATE">State Level</option>
                        <option value="TEACHING">Teaching Hub</option>
                        <option value="CENTRAL">Central Hub</option>
                        <option value="DEFENSE">Defense Hub</option>
                     </select>
                  </div>
               </div>
            </div>
            <DialogFooter className="p-10 pt-0 flex gap-4">
               <Button variant="ghost" onClick={() => setEditingExam(null)} className="rounded-xl h-14 font-black uppercase text-[10px]">Cancel Draft</Button>
               <Button onClick={handleSaveExam} disabled={isSaving} className="bg-[#0F172A] hover:bg-black h-14 px-10 rounded-xl font-black uppercase text-[10px] tracking-widest flex-1 shadow-xl">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Commit Hub to Registry"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
