
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
  ShieldCheck,
  Layers,
  Save,
  X
} from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, deleteDoc, writeBatch, setDoc, serverTimestamp, getDocs, where, limit, orderBy } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Exam Master Registry v5.2.
 * UPDATED: Permanently set official logos for all institutional verticals.
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
  const catsQuery = useMemo(() => (db ? query(collection(db, "categories"), orderBy("displayOrder", "asc")) : null), [db]);

  const { data: rawExams, loading } = useCollection<any>(examsQuery)
  const { data: boards } = useCollection<any>(boardsQuery)
  const { data: categories } = useCollection<any>(catsQuery)

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
    if (!db || !editingExam.name || !editingExam.boardId || !editingExam.categoryId) {
       toast({ variant: "destructive", title: "Audit Blocked", description: "Name, Hub, and Category are required." })
       return
    }
    setIsSaving(true)
    const id = editingExam.id || editingExam.name.toLowerCase().replace(/\s+/g, '-')
    try {
      await setDoc(doc(db, "exams", id), { ...editingExam, id, updatedAt: serverTimestamp() }, { merge: true })
      toast({ title: "Hub Synced" })
      setEditingExam(null)
    } finally { setIsSaving(false) }
  }

  // PERMANENT LOGO REGISTRY
  const govtOfficialEmblem = "https://static.pseb.ac.in/psebwebsite/front_assets/sites/default/files/inline-images/emblem.png";
  const teachingOfficialLogo = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT77AiJp2d3yn7Lwjk7LG6nDeLpQC_ZnFs6FZg4yAieypyMsmctxNGWRdk&s=10";
  const technicalOfficialLogo = "https://affiliation.pbteched.net/assets/images/banner-5.png";

  return (
    <div className="space-y-12 pb-24 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Landmark className="h-6 w-6 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Exam Master Registry</span>
           </div>
          <h1 className="text-5xl font-black font-headline text-[#0F172A] uppercase tracking-tight">Recruitment Verticals</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Manage specific exam verticals mapped to Boards and Categories.</p>
        </div>
        <div className="flex gap-4">
           <Button onClick={() => setEditingExam({ name: "", boardId: "", categoryId: "", category: "STATE" })} className="bg-primary hover:bg-orange-600 h-16 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-3 shadow-2xl transition-all active:scale-95">
              Plus Register New Vertical
           </Button>
        </div>
      </div>

      <div className="mx-4 relative group">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
         <Input className="h-16 pl-16 rounded-[1.5rem] bg-white border-none shadow-2xl text-lg font-medium" placeholder="Search exam verticals..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <Card className="border-none shadow-3xl bg-white rounded-[3rem] overflow-hidden mx-4">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-20">
                <TableHead className="px-10 text-[10px] font-black uppercase tracking-widest text-slate-500">Vertical Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Board Hub</TableHead>
                <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Registry Category</TableHead>
                <TableHead className="text-right px-10 text-[10px] font-black uppercase tracking-widest text-slate-500">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={4} className="px-10 py-8"><Skeleton className="h-12 w-full rounded-2xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : filteredExams.map((e) => {
                const board = boards?.find((b: any) => b.id === e.boardId || b.abbreviation === e.boardId);
                const cat = categories?.find((c: any) => c.id === e.categoryId);
                const abbrev = board?.abbreviation?.toUpperCase() || e.boardId?.toUpperCase();
                const examName = e.name?.toUpperCase() || "";
                
                const isGovt = e.categoryId === 'punjab-govt' || ['PSSSB', 'PPSC', 'POLICE'].includes(abbrev) || examName.includes('PATWARI') || examName.includes('EXCISE') || examName.includes('CONSTABLE');
                const isTeaching = e.categoryId === 'punjab-teaching' || ['CTET', 'PSTET', 'EDUCATION'].includes(abbrev) || examName.includes('CADRE') || examName.includes('TEACHER') || examName.includes('PROFESSOR') || examName.includes('PRINCIPAL');
                const isTechnical = e.categoryId === 'punjab-technical' || ['PSPCL', 'PSTCL', 'PSBTE'].includes(abbrev) || examName.includes('TECHNICAL') || examName.includes('ENGINEER');

                let forcedLogo = e.iconUrl || board?.iconUrl;
                if (isGovt) forcedLogo = govtOfficialEmblem;
                else if (isTeaching) forcedLogo = teachingOfficialLogo;
                else if (isTechnical) forcedLogo = technicalOfficialLogo;

                return (
                  <TableRow key={e.id} className="hover:bg-slate-50 border-slate-50 transition-colors group">
                    <TableCell className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                            {forcedLogo && !failedImages[e.id] ? (
                              <img src={forcedLogo} className={cn("h-full w-full object-contain p-2", (isGovt || isTeaching || isTechnical) ? "scale-140" : "")} referrerPolicy="no-referrer" onError={() => setFailedImages(p => ({ ...p, [e.id]: true }))} />
                            ) : (
                              <div className="h-full w-full bg-amber-50 flex items-center justify-center text-amber-600 font-black text-xs">{e.name?.[0]?.toUpperCase()}</div>
                            )}
                        </div>
                        <div>
                            <p className="font-black text-[#0F172A] text-xl uppercase tracking-tight leading-none">{e.name}</p>
                            <code className="text-[9px] font-mono text-slate-400 mt-2 block uppercase tracking-widest">ID: {e.id}</code>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-white border-slate-100 text-primary text-[8px] font-black uppercase px-2 py-0.5">{board?.abbreviation || e.boardId || 'NONE'}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] uppercase">{cat?.title || "UNCATEGORIZED"}</Badge>
                    </TableCell>
                    <TableCell className="text-right px-10">
                      <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100 transition-all">
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl" onClick={() => setEditingExam(e)}><Edit className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon" className="hover:text-rose-600" onClick={async () => { if (confirm("Purge?")) await deleteDoc(doc(db!, "exams", e.id)) }}><Trash2 className="h-5 w-5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingExam} onOpenChange={o => !o && setEditingExam(null)}>
         <DialogContent className="sm:max-w-xl rounded-[3rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
            <div className="h-2 w-full bg-primary shrink-0" />
            <DialogHeader className="p-10 pb-0">
               <DialogTitle className="text-2xl font-black font-headline uppercase">Vertical Architect</DialogTitle>
            </DialogHeader>
            <div className="p-10 space-y-6">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Assigned Board Hub</Label>
                  <select value={editingExam?.boardId || ""} onChange={e => setEditingExam({...editingExam, boardId: e.target.value})} className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none">
                     <option value="">Select Hub</option>
                     {boards?.map((b:any) => <option key={b.id} value={b.id}>{b.abbreviation} Hub</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Relational Category</Label>
                  <select value={editingExam?.categoryId || ""} onChange={e => setEditingExam({...editingExam, categoryId: e.target.value})} className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none">
                     <option value="">Select Category</option>
                     {categories?.map((c:any) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Vertical Name</Label>
                  <Input value={editingExam?.name} onChange={e => setEditingExam({...editingExam, name: e.target.value})} className="h-12 rounded-xl font-bold" placeholder="e.g. Constable District Cadre" />
               </div>
            </div>
            <DialogFooter className="p-10 pt-0">
               <Button onClick={handleSaveExam} disabled={isSaving} className="w-full h-16 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl transition-all">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Commit Vertical Node
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
