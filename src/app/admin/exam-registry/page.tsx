
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
  Landmark, 
  GraduationCap,
  ChevronRight,
  ShieldCheck
} from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, deleteDoc, writeBatch, setDoc, serverTimestamp, getDocs, where, limit } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Exam Master Registry v2.9.
 * FIXED: Strictly isolated CTET and PSTET branding logic.
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
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})

  // STABILIZED LISTENERS
  const examsQuery = useMemo(() => (db ? collection(db, "exams") : null), [db]);
  const boardsQuery = useMemo(() => (db ? collection(db, "boards") : null), [db]);

  const { data: rawExams, loading } = useCollection<any>(examsQuery)
  const { data: boards } = useCollection<any>(boardsQuery)

  const exams = useMemo(() => {
    if (!rawExams) return [];
    const unique = new Map();
    rawExams.forEach(e => {
       const key = e.name?.toLowerCase().trim();
       if (!unique.has(key)) unique.set(key, e);
    });
    return Array.from(unique.values());
  }, [rawExams]);

  const filteredExams = useMemo(() => {
    if (!exams) return []
    return exams.filter(e => 
      e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.boardId?.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name))
  }, [exams, searchTerm])

  const handleSaveExam = async () => {
    if (!db || !editingExam.name || !editingExam.boardId) return
    setIsSaving(true)
    const id = editingExam.id || editingExam.name.toLowerCase().replace(/\s+/g, '-')
    try {
      await setDoc(doc(db, "exams", id), { ...editingExam, id, updatedAt: serverTimestamp() }, { merge: true })
      toast({ title: "Hub Synced" })
      setEditingExam(null)
    } finally { setIsSaving(false) }
  }

  const handleDeepMerge = async () => {
    if (!db || !mergeSource || !mergeTarget) return
    setIsMerging(true)
    try {
      const qSnap = await getDocs(query(collection(db, "questions"), where("examId", "==", mergeSource), limit(200)))
      const batch = writeBatch(db)
      qSnap.docs.forEach(d => batch.update(doc(db, "questions", d.id), { examId: mergeTarget, updatedAt: serverTimestamp() }))
      batch.delete(doc(db, "exams", mergeSource))
      await batch.commit()
      toast({ title: "Merge Complete" })
      setMergeDialogOpen(false)
    } finally { setIsMerging(false) }
  }

  // OFFICIAL LOGO REGISTRY
  const ctetOfficialLogo = "https://cdnbbsr.s3waas.gov.in/s3443dec3062d0286986e21dc0631734c9/uploads/2023/03/2023032156.png";
  const pstetOfficialLogo = "https://pstet.pseb.ac.in/img/main-logo-2.png";
  const psebOfficialLogo = "https://static.pseb.ac.in/uploads/1648628722_PSEBlogo_2.png";

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
           <Button onClick={() => setMergeDialogOpen(true)} variant="outline" className="h-16 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-3 border-slate-200 bg-white">
              <GitMerge className="h-5 w-5 text-emerald-500" /> Normalization Engine
           </Button>
           <Button onClick={() => setEditingExam({ name: "", boardId: "", category: "STATE" })} className="bg-primary hover:bg-orange-600 h-16 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-3 shadow-2xl transition-all active:scale-95">
              Plus Register New Hub
           </Button>
        </div>
      </div>

      <div className="mx-4 relative group">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
         <Input className="h-16 pl-16 rounded-[1.5rem] bg-white border-none shadow-2xl text-lg font-medium" placeholder="Search exam hubs or boards..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
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
                const board = boards?.find((b: any) => b.id.toLowerCase() === e.boardId?.toLowerCase() || b.abbreviation?.toLowerCase() === e.boardId?.toLowerCase());
                const abbrev = board?.abbreviation?.toUpperCase() || e.boardId?.toUpperCase();
                
                let forcedLogo = e.iconUrl || board?.iconUrl;
                // STRICT BRANDING AUDIT
                if (abbrev === 'CTET' || abbrev === 'CBSE' || e.name.toUpperCase().includes('CTET')) {
                  forcedLogo = ctetOfficialLogo;
                } else if (abbrev === 'PSTET' || e.name.toUpperCase().includes('PSTET')) {
                  forcedLogo = pstetOfficialLogo;
                } else if (abbrev === 'PSEB' || abbrev === 'EDUCATION' || e.name.toUpperCase().includes('PSEB')) {
                  forcedLogo = psebOfficialLogo;
                }

                const isImgFailed = failedImages[e.id];

                return (
                  <TableRow key={e.id} className="hover:bg-slate-50 border-slate-50 transition-colors group">
                    <TableCell className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                            {forcedLogo && !isImgFailed ? (
                              <img 
                                src={forcedLogo} 
                                className={cn("h-full w-full object-contain p-2", (abbrev === 'CTET' || abbrev === 'CBSE' || abbrev === 'PSTET' || abbrev === 'PSEB') ? "scale-150" : "")} 
                                referrerPolicy="no-referrer" 
                                onError={() => setFailedImages(p => ({ ...p, [e.id]: true }))} 
                              />
                            ) : (
                              <div className="h-full w-full bg-amber-50 flex items-center justify-center text-amber-600 font-black text-xs">{e.name?.[0]?.toUpperCase()}</div>
                            )}
                        </div>
                        <div>
                            <p className="font-black text-[#0F172A] text-xl uppercase tracking-tight leading-none">{e.name}</p>
                            <code className="text-[9px] font-mono text-slate-400 mt-2 block uppercase tracking-widest">REGISTRY ID: {e.id}</code>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-white border-slate-100 text-primary text-[8px] font-black uppercase px-2 py-0.5">{board?.abbreviation || e.boardId}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] uppercase">ACTIVE HUB</Badge>
                    </TableCell>
                    <TableCell className="text-right px-10">
                      <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100 transition-all">
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl" onClick={() => setEditingExam(e)}><Edit className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon" className="hover:text-rose-600" onClick={async () => { if (confirm("Purge registry node?")) await deleteDoc(doc(db!, "exams", e.id)) }}><Trash2 className="h-5 w-5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
         <DialogContent className="sm:max-w-xl rounded-[2.5rem] bg-white border-none shadow-4xl p-0 overflow-hidden text-left">
            <div className="h-2 w-full bg-emerald-500" />
            <DialogHeader className="p-10 pb-4">
               <DialogTitle className="text-2xl font-black font-headline uppercase flex items-center gap-3">Normalization Engine</DialogTitle>
            </DialogHeader>
            <div className="p-10 space-y-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Duplicate Node</label>
                  <select value={mergeSource} onChange={e => setMergeSource(e.target.value)} className="w-full h-14 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none">
                     <option value="">Select Source Registry</option>
                     {rawExams?.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Canonical Hub</label>
                  <select value={mergeTarget} onChange={e => setMergeTarget(e.target.value)} className="w-full h-14 bg-[#0F172A] text-white border-none rounded-xl px-4 font-bold text-sm outline-none">
                     <option value="">Select Target Hub</option>
                     {rawExams?.filter(e => e.id !== mergeSource).map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
               </div>
            </div>
            <DialogFooter className="p-10 pt-0">
               <Button onClick={handleDeepMerge} disabled={isMerging || !mergeSource || !mergeTarget} className="bg-emerald-600 hover:bg-emerald-700 text-white h-14 px-10 rounded-xl font-black uppercase text-[10px] tracking-widest flex-1 shadow-xl">
                  {isMerging ? <Loader2 className="h-4 w-4 animate-spin" /> : "Authorize Deep Merge"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
